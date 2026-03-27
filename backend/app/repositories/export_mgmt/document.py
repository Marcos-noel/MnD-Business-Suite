from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.export_mgmt.export_document import ExportDocument
from app.repositories.tenant_base import TenantRepository


class ExportDocumentRepository(TenantRepository[ExportDocument]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, ExportDocument)

    async def list_by_order(self, *, org_id: str, export_order_id: str) -> list[ExportDocument]:
        res = await self.session.execute(
            select(ExportDocument)
            .where(ExportDocument.org_id == org_id)
            .where(ExportDocument.export_order_id == export_order_id)
            .order_by(ExportDocument.created_at.desc())
        )
        return list(res.scalars().all())

