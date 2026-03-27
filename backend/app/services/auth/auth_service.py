from __future__ import annotations

import hashlib
import secrets
from datetime import datetime, timedelta, timezone

from app.core.config import settings
from app.core.errors import ForbiddenError, UnauthorizedError
from app.core.security import create_access_token, create_refresh_token, decode_token, hash_password, verify_password
from app.models.auth.permission import Permission
from app.models.auth.refresh_token import RefreshToken
from app.models.auth.role import Role
from app.models.auth.user import User
from app.models.tenancy.organization import Organization
from app.repositories.auth.permission import PermissionRepository
from app.repositories.auth.rbac import RbacRepository
from app.repositories.auth.refresh_token import RefreshTokenRepository
from app.repositories.auth.role import RoleRepository
from app.repositories.auth.user import UserRepository
from app.repositories.tenancy.organization import OrganizationRepository
from sqlalchemy.exc import IntegrityError

from app.core.errors import ConflictError
from app.services.base import BaseService
from app.services.tenancy.module_service import ModuleService


class AuthService(BaseService):
    async def register_org_with_admin(
        self, *, org_name: str, org_slug: str, admin_email: str, admin_full_name: str, admin_password: str
    ) -> Organization:
        try:
            org_repo = OrganizationRepository(self.session)
            org = await org_repo.create(Organization(name=org_name, slug=org_slug))

            admin = await UserRepository(self.session).create(
                User(
                    org_id=org.id,
                    email=admin_email.lower(),
                    full_name=admin_full_name,
                    password_hash=hash_password(admin_password),
                    is_active=True,
                )
            )

            await self._ensure_global_permissions()
            role_repo = RoleRepository(self.session)
            rbac_repo = RbacRepository(self.session)

            admin_role = await role_repo.get_by_name(org_id=org.id, name="admin")
            if admin_role is None:
                admin_role = await role_repo.create(Role(org_id=org.id, name="admin", description="Organization admin"))
            await rbac_repo.assign_role_to_user(user_id=admin.id, role_id=admin_role.id)
            await self._grant_all_permissions_to_role(role_id=admin_role.id)

            staff_role = await role_repo.get_by_name(org_id=org.id, name="staff")
            if staff_role is None:
                staff_role = await role_repo.create(Role(org_id=org.id, name="staff", description="Default staff role"))
            await self._grant_permissions_to_role(
                role_id=staff_role.id,
                permission_codes=[
                    "erp.read", "erp.write",
                    "hr.self", "hr.manage",
                    "inventory.read", "inventory.write",
                    "crm.read", "crm.write",
                    "commerce.read", "commerce.write",
                    "finance.read", "finance.write",
                    "exports.read", "exports.write",
                    "analytics.read",
                    "assistant.use",
                    "rbac.manage",
                ],
            )

            await self.publish("auth.org_registered", {"org_id": org.id, "admin_user_id": admin.id})
            await ModuleService(self.session).ensure_defaults(org_id=org.id)
            return org
        except IntegrityError as e:
            await self.session.rollback()
            # Check if it's org slug or email duplicate
            error_msg = str(e).lower()
            if "orgs.slug" in error_msg or "organization" in error_msg:
                raise ConflictError("Organization slug already exists. Please choose a different one.")
            elif "users.email" in error_msg or "users.org_id" in error_msg or "email" in error_msg:
                raise ConflictError("Email already registered in this organization. Please use a different email.")
            else:
                raise ConflictError("Organization or email already exists. Please try again with different details.")

    async def login(self, *, org_slug: str, email: str, password: str) -> tuple[User, str, str]:
        await self._ensure_global_permissions()
        org = await OrganizationRepository(self.session).get_by_slug(org_slug)
        await ModuleService(self.session).ensure_defaults(org_id=org.id)
        user = await UserRepository(self.session).get_by_email(org_id=org.id, email=email)
        if not user.is_active:
            raise ForbiddenError("User is inactive")
        if not verify_password(password, user.password_hash):
            raise UnauthorizedError("Invalid credentials")

        roles = await RbacRepository(self.session).get_user_role_names(user_id=user.id, org_id=org.id)
        access = create_access_token(subject=user.id, org_id=org.id, roles=roles)

        family = secrets.token_urlsafe(16)
        refresh, token_hash = create_refresh_token(subject=user.id, org_id=org.id, token_family=family)
        expires_at = datetime.now(timezone.utc) + timedelta(days=settings.jwt_refresh_token_expires_days)
        await RefreshTokenRepository(self.session).create(
            RefreshToken(user_id=user.id, org_id=org.id, family=family, token_hash=token_hash, expires_at=expires_at)
        )
        await self.publish("auth.login", {"org_id": org.id, "user_id": user.id})
        return user, access, refresh

    async def refresh(self, *, refresh_token: str) -> tuple[str, str]:
        try:
            claims = decode_token(refresh_token)
        except Exception:
            raise UnauthorizedError("Invalid or expired token")
        if claims.get("type") != "refresh":
            raise UnauthorizedError("Invalid token type")

        user_id = claims["sub"]
        org_id = claims["org_id"]
        family = claims["family"]
        jti = claims["jti"]
        raw = claims["rt"]
        token_hash = hashlib.sha256(f"{jti}.{raw}".encode("utf-8")).hexdigest()

        repo = RefreshTokenRepository(self.session)
        rt = await repo.get_valid(user_id=user_id, org_id=org_id, family=family, token_hash=token_hash)
        if rt is None or rt.expires_at < datetime.now(timezone.utc):
            await repo.revoke_family(user_id=user_id, family=family)
            raise UnauthorizedError("Refresh token expired or revoked")

        await repo.revoke_family(user_id=user_id, family=family)
        roles = await RbacRepository(self.session).get_user_role_names(user_id=user_id, org_id=org_id)
        access = create_access_token(subject=user_id, org_id=org_id, roles=roles)

        new_family = secrets.token_urlsafe(16)
        new_refresh, new_hash = create_refresh_token(subject=user_id, org_id=org_id, token_family=new_family)
        expires_at = datetime.now(timezone.utc) + timedelta(days=settings.jwt_refresh_token_expires_days)
        await repo.create(
            RefreshToken(user_id=user_id, org_id=org_id, family=new_family, token_hash=new_hash, expires_at=expires_at)
        )
        return access, new_refresh

    async def _ensure_global_permissions(self) -> None:
        perm_repo = PermissionRepository(self.session)
        required = [
            ("erp.read", "View ERP dashboards"),
            ("hr.manage", "Manage HR records"),
            ("hr.self", "HR self-service (clock-in, leave)"),
            ("inventory.manage", "Manage inventory"),
            ("inventory.read", "View inventory"),
            ("crm.manage", "Manage CRM"),
            ("commerce.manage", "Manage e-commerce orders"),
            ("analytics.read", "View analytics dashboards"),
            ("finance.manage", "Manage finance"),
            ("export.manage", "Manage exports"),
            ("assistant.use", "Use AI assistant"),
            ("rbac.manage", "Manage roles/permissions"),
            ("users.manage", "Manage users"),
        ]
        existing = {p.code for p in await perm_repo.list_all()}
        for code, desc in required:
            if code not in existing:
                await perm_repo.create(Permission(code=code, description=desc))

    async def _grant_all_permissions_to_role(self, *, role_id: str) -> None:
        perm_repo = PermissionRepository(self.session)
        rbac_repo = RbacRepository(self.session)
        for perm in await perm_repo.list_all():
            try:
                await rbac_repo.grant_permission_to_role(role_id=role_id, permission_id=perm.id)
            except Exception:
                continue

    async def _grant_permissions_to_role(self, *, role_id: str, permission_codes: list[str]) -> None:
        perm_repo = PermissionRepository(self.session)
        perms = {p.code: p.id for p in await perm_repo.list_all()}
        rbac_repo = RbacRepository(self.session)
        for code in permission_codes:
            perm_id = perms.get(code)
            if not perm_id:
                continue
            try:
                await rbac_repo.grant_permission_to_role(role_id=role_id, permission_id=perm_id)
            except Exception:
                continue
