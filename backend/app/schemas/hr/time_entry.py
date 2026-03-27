from __future__ import annotations

from datetime import date, datetime

from pydantic import Field

from app.schemas.common import APIModel, Timestamped


class ClockInRequest(APIModel):
    day: date | None = None
    source: str = Field(default="web", max_length=40)
    note: str = Field(default="", max_length=255)


class ClockOutRequest(APIModel):
    day: date | None = None
    note: str = Field(default="", max_length=255)


class TimeEntryRead(Timestamped):
    org_id: str
    employee_id: str
    day: date
    clock_in_at: datetime
    clock_out_at: datetime | None
    source: str
    note: str

