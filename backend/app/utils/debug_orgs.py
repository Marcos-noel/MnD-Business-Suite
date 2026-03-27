"""
Debug - list all organizations in the database.
"""
import asyncio
from sqlalchemy import select
from app.core.db import SessionLocal
from app.models.tenancy.organization import Organization


async def debug():
    async with SessionLocal() as session:
        result = await session.execute(select(Organization))
        orgs = result.scalars().all()
        print(f"Found {len(orgs)} organizations:")
        for o in orgs:
            print(f"  - {o.name} (slug: {o.slug}, id: {o.id})")


if __name__ == "__main__":
    asyncio.run(debug())