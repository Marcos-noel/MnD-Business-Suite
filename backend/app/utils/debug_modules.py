"""
Debug - check which modules are enabled for org.
"""
import asyncio
from sqlalchemy import select
from app.core.db import SessionLocal
from app.models.tenancy.org_module import OrgModule


async def debug():
    async with SessionLocal() as session:
        result = await session.execute(select(OrgModule))
        modules = result.scalars().all()
        print(f"Found {len(modules)} module records:")
        for m in modules:
            print(f"  - org={m.org_id}, module={m.module_code}, enabled={m.is_enabled}")


if __name__ == "__main__":
    asyncio.run(debug())