from __future__ import annotations

from datetime import date

from pydantic import Field

from app.schemas.common import APIModel, Timestamped


class EmployeeCreate(APIModel):
    employee_no: str = Field(min_length=1, max_length=40)
    full_name: str = Field(min_length=2, max_length=200)
    email: str | None = Field(default=None, pattern=r"^.+@.+\..+$", max_length=255)
    role_title: str = Field(default="", max_length=120)
    payroll_structure_id: str | None = None
    hire_date: date


class EmployeeUpdate(APIModel):
    full_name: str | None = Field(default=None, min_length=2, max_length=200)
    email: str | None = Field(default=None, pattern=r"^.+@.+\..+$", max_length=255)
    role_title: str | None = Field(default=None, max_length=120)
    payroll_structure_id: str | None = None
    is_active: bool | None = None


class EmployeeRead(Timestamped):
    org_id: str
    employee_no: str
    full_name: str
    email: str
    role_title: str
    payroll_structure_id: str | None
    hire_date: date
    is_active: bool
