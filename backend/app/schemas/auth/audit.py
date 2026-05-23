from __future__ import annotations

from app.schemas.common import Timestamped


class AuditEventRead(Timestamped):
    org_id: str
    actor_user_id: str
    module: str
    entity_type: str
    entity_id: str
    action: str
    summary: str
    before_json: str
    after_json: str
