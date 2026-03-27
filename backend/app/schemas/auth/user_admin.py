from __future__ import annotations

from pydantic import Field

from app.schemas.common import APIModel, Timestamped


class UserCreateRequest(APIModel):
    email: str = Field(pattern=r"^.+@.+\..+$", max_length=255)
    full_name: str = Field(min_length=2, max_length=200)
    password: str = Field(min_length=8, max_length=200)
    role_name: str = Field(default="staff", max_length=50)
    is_active: bool = True


class UserRead(Timestamped):
    org_id: str
    email: str
    full_name: str
    is_active: bool
