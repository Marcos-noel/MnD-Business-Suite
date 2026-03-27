from __future__ import annotations

from app.core.errors import ForbiddenError
from app.repositories.tenancy.org_module import OrgModuleRepository
from app.services.base import BaseService


DEFAULT_MODULES: list[str] = [
    "erp",
    "hr",
    "inventory",
    "crm",
    "commerce",
    "finance",
    "exports",
    "analytics",
    "assistant",
    "admin",
]


def permission_to_module(permission: str) -> str | None:
    if permission in ("users.manage", "rbac.manage"):
        return "admin"
    if permission.startswith("export."):
        return "exports"
    head = permission.split(".", 1)[0]
    if head in {"erp", "hr", "inventory", "crm", "commerce", "finance", "analytics", "assistant"}:
        return head
    return None


class ModuleService(BaseService):
    async def ensure_defaults(self, *, org_id: str) -> None:
        repo = OrgModuleRepository(self.session)
        existing = {m.module_code for m in await repo.list(org_id=org_id)}
        for code in DEFAULT_MODULES:
            if code in existing:
                continue
            await repo.upsert(org_id=org_id, module_code=code, data={"is_enabled": True, "plan": "standard", "subscribed_until": None})

    async def list_modules(self, *, org_id: str) -> list[dict]:
        await self.ensure_defaults(org_id=org_id)
        rows = await OrgModuleRepository(self.session).list(org_id=org_id)
        return [
            {
                "module_code": r.module_code,
                "is_enabled": r.is_enabled,
                "plan": r.plan,
                "subscribed_until": r.subscribed_until.isoformat() if r.subscribed_until else None,
            }
            for r in rows
        ]

    async def set_enabled(self, *, org_id: str, module_code: str, is_enabled: bool) -> dict:
        await self.ensure_defaults(org_id=org_id)
        row = await OrgModuleRepository(self.session).upsert(org_id=org_id, module_code=module_code, data={"is_enabled": bool(is_enabled)})
        await self.publish("tenancy.module_updated", {"org_id": org_id, "module_code": module_code, "is_enabled": row.is_enabled})
        return {
            "module_code": row.module_code,
            "is_enabled": row.is_enabled,
            "plan": row.plan,
            "subscribed_until": row.subscribed_until.isoformat() if row.subscribed_until else None,
        }

    async def require_module_enabled(self, *, org_id: str, module_code: str) -> None:
        await self.ensure_defaults(org_id=org_id)
        row = await OrgModuleRepository(self.session).get(org_id=org_id, module_code=module_code)
        if row is None:
            raise ForbiddenError("Module not enabled")
        if not row.is_enabled:
            raise ForbiddenError("Module not enabled")

