from __future__ import annotations

from pydantic import BaseModel, Field

from app.schemas.common import APIModel, Timestamped


class RoleCreate(APIModel):
    name: str = Field(min_length=2, max_length=80)
    description: str = Field(default="", max_length=255)


class RoleRead(Timestamped):
    org_id: str
    name: str
    description: str


class PermissionRead(Timestamped):
    code: str
    description: str


class GrantPermissionRequest(BaseModel):
    role_id: str
    permission_code: str


class AssignRoleRequest(BaseModel):
    user_id: str
    role_id: str

