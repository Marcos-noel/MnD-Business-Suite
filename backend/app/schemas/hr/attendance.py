from __future__ import annotations

from datetime import date

from pydantic import Field

from app.schemas.common import APIModel, Timestamped


class AttendanceCreate(APIModel):
    employee_id: str
    day: date
    status: str = Field(default="present", pattern=r"^(present|absent|leave)$")


class AttendanceRead(Timestamped):
    org_id: str
    employee_id: str
    day: date
    status: str

