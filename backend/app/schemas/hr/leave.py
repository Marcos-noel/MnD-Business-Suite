from __future__ import annotations

from datetime import date, datetime

from pydantic import Field

from app.schemas.common import APIModel, Timestamped


class LeaveRequestCreate(APIModel):
    start_day: date
    end_day: date
    leave_type: str = Field(default="annual", max_length=40)
    reason: str = Field(default="", max_length=500)


class LeaveDecision(APIModel):
    status: str = Field(pattern=r"^(approved|rejected)$")
    decision_note: str = Field(default="", max_length=500)


class LeaveRequestRead(Timestamped):
    org_id: str
    employee_id: str
    start_day: date
    end_day: date
    leave_type: str
    reason: str
    status: str
    reviewed_by_user_id: str | None
    reviewed_at: datetime | None
    decision_note: str

