from __future__ import annotations

from pydantic import Field

from app.schemas.common import APIModel, Timestamped


class PayrollStructureCreate(APIModel):
    name: str = Field(min_length=2, max_length=120)
    base_salary: float = Field(ge=0)
    housing_allowance: float = Field(default=0, ge=0)
    transport_allowance: float = Field(default=0, ge=0)
    tax_rate: float = Field(default=0.15, ge=0, le=1)


class PayrollStructureRead(Timestamped):
    org_id: str
    name: str
    base_salary: float
    housing_allowance: float
    transport_allowance: float
    tax_rate: float

