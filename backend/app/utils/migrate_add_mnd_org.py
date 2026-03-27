"""
Migration script to add "mnd" organization and admin user.
Run with: python -m app.utils.migrate_add_mnd_org
"""
import asyncio

from app.core.db import SessionLocal
from app.models.auth.permission import Permission
from app.models.auth.role import Role
from app.models.auth.user import User
from app.models.tenancy.organization import Organization
from app.models.tenancy.org_module import OrgModule
from app.repositories.auth.permission import PermissionRepository
from app.repositories.auth.rbac import RbacRepository
from app.repositories.auth.role import RoleRepository
from app.repositories.auth.user import UserRepository
from app.repositories.tenancy.organization import OrganizationRepository
from app.services.tenancy.module_service import ModuleService


# Password hash for "Admin@123" (same as demo account)
MND_PASSWORD_HASH = "$2b$12$fgDfUppcJZJyAkui567A0Olwux7VHC/BzGAw0W820n7ebO/1Qrhka"


async def migrate_add_mnd_org():
    """Add the mnd organization and admin user."""
    async with SessionLocal() as session:
        # Check if org already exists
        try:
            existing = await OrganizationRepository(session).get_by_slug("mnd")
            print("Organization 'mnd' already exists, skipping.")
            return
        except Exception:
            pass

        # Create organization
        org = Organization(name="MnD Business Suite", slug="mnd")
        session.add(org)
        await session.commit()
        await session.refresh(org)
        print(f"Created organization: {org.id} ({org.slug})")

        # Create admin user
        user = User(
            org_id=org.id,
            email="admin@mnd.com",
            full_name="System Administrator",
            password_hash=MND_PASSWORD_HASH,
            is_active=True,
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)
        print(f"Created user: {user.id} ({user.email})")

        # Create roles
        admin_role = Role(
            org_id=org.id,
            name="admin",
            description="Organization admin"
        )
        session.add(admin_role)
        await session.commit()
        await session.refresh(admin_role)

        staff_role = Role(
            org_id=org.id,
            name="staff",
            description="Default staff role"
        )
        session.add(staff_role)
        await session.commit()
        await session.refresh(staff_role)
        print(f"Created roles: admin, staff")

        # Get all permissions and assign to admin role
        perm_repo = PermissionRepository(session)
        rbac_repo = RbacRepository(session)

        perms = await perm_repo.list_all()
        for perm in perms:
            try:
                await rbac_repo.grant_permission_to_role(
                    role_id=admin_role.id,
                    permission_id=perm.id
                )
            except Exception:
                pass

        # Grant limited permissions to staff role
        staff_perm_codes = ["erp.read", "hr.self", "inventory.read"]
        perms_by_code = {p.code: p for p in perms}
        for code in staff_perm_codes:
            perm = perms_by_code.get(code)
            if perm:
                try:
                    await rbac_repo.grant_permission_to_role(
                        role_id=staff_role.id,
                        permission_id=perm.id
                    )
                except Exception:
                    pass

        print(f"Assigned permissions to roles")

        # Assign admin role to user
        await rbac_repo.assign_role_to_user(
            user_id=user.id,
            role_id=admin_role.id
        )
        print(f"Assigned admin role to user")

        # Create default modules
        module_service = ModuleService(session)
        await module_service.ensure_defaults(org_id=org.id)
        print(f"Created default modules")

        print("\n✓ Migration completed successfully!")
        print("  Organization: mnd")
        print("  Admin Email: admin@mnd.com")
        print("  Password: Admin@123")


if __name__ == "__main__":
    asyncio.run(migrate_add_mnd_org())
