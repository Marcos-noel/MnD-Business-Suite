from __future__ import annotations

from pydantic import BaseModel, Field


class RegisterOrgRequest(BaseModel):
    org_name: str = Field(min_length=2, max_length=200)
    org_slug: str = Field(min_length=1, max_length=80, pattern=r"^[a-z0-9-]+$")
    admin_email: str = Field(pattern=r"^.+@.+\..+$", max_length=255)
    admin_full_name: str = Field(min_length=2, max_length=200)
    admin_password: str = Field(min_length=10, max_length=200)


class LoginRequest(BaseModel):
    org_slug: str = Field(min_length=1, max_length=80)
    email: str = Field(pattern=r"^.+@.+\..+$", max_length=255)
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str
