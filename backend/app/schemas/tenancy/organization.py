from __future__ import annotations

from app.schemas.common import Timestamped


class OrganizationRead(Timestamped):
    name: str
    slug: str

