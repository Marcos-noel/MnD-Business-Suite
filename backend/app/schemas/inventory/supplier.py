from __future__ import annotations

from pydantic import Field

from app.schemas.common import APIModel, Timestamped


class SupplierCreate(APIModel):
    name: str = Field(min_length=2, max_length=200)
    email: str = Field(default="", max_length=255)
    phone: str = Field(default="", max_length=60)


class SupplierRead(Timestamped):
    org_id: str
    name: str
    email: str
    phone: str

