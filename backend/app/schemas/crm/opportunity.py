from __future__ import annotations

from pydantic import Field

from app.schemas.common import APIModel, Timestamped


class OpportunityCreate(APIModel):
    customer_id: str
    title: str = Field(min_length=2, max_length=200)
    stage: str = Field(default="lead", pattern=r"^(lead|qualified|proposal|won|lost)$")
    value: float = Field(default=0, ge=0)


class OpportunityUpdate(APIModel):
    title: str | None = Field(default=None, min_length=2, max_length=200)
    stage: str | None = Field(default=None, pattern=r"^(lead|qualified|proposal|won|lost)$")
    value: float | None = Field(default=None, ge=0)


class OpportunityRead(Timestamped):
    org_id: str
    customer_id: str
    title: str
    stage: str
    value: float

