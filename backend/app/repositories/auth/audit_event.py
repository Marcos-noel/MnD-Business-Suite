from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.auth.audit_event import AuditEvent
from app.repositories.tenant_base import TenantRepository


class AuditEventRepository(TenantRepository[AuditEvent]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, AuditEvent)
