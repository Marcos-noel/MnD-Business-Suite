from __future__ import annotations

from app.schemas.common import APIModel


class EmployeeLinkUserRequest(APIModel):
    user_id: str

