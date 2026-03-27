"""
Add more permissions to the existing staff role.
Run this to fix missing permissions on existing organization.
"""
import asyncio
from app.core.db import SessionLocal
from app.repositories.tenancy.organization import OrganizationRepository
from app.repositories.auth.role import RoleRepository
from app.repositories.auth.permission import PermissionRepository
from app.repositories.auth.rbac import RbacRepository


PERMISSIONS_TO_ADD = [
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
]


async def add_permissions():
    async with SessionLocal() as session:
        org_repo = OrganizationRepository(session)
        role_repo = RoleRepository(session)
        perm_repo = PermissionRepository(session)
        rbac_repo = RbacRepository(session)

        # Get organization first
        org = await org_repo.get_by_slug("mnd")
        if not org:
            print("Organization 'MnD' not found")
            return

        print(f"Found org: {org.id}")

        # Get staff role
        staff_role = await role_repo.get_by_name(org_id=org.id, name="staff")
        if not staff_role:
            print("Staff role not found")
            return

        print(f"Found staff role: {staff_role.id}")

        for perm_code in PERMISSIONS_TO_ADD:
            # Get or create permission
            perm = await perm_repo.get_by_code(perm_code)
            if not perm:
                from app.models.auth.permission import Permission
                perm = await perm_repo.create(Permission(code=perm_code, description=perm_code))
                print(f"Created permission: {perm_code}")

            # Grant permission to role
            try:
                await rbac_repo.grant_permission_to_role(role_id=staff_role.id, permission_id=perm.id)
                print(f"Granted: {perm_code}")
            except Exception as e:
                print(f"Already has {perm_code}: {e}")

        print("Done!")


if __name__ == "__main__":
    asyncio.run(add_permissions())