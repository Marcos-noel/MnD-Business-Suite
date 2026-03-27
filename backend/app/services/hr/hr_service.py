from __future__ import annotations

from datetime import date, datetime, timezone

from app.core.errors import AppError
from app.models.hr.attendance import Attendance
from app.models.hr.employee_user_link import EmployeeUserLink
from app.models.hr.leave_request import LeaveRequest
from app.models.hr.employee import Employee
from app.models.hr.payroll import PayrollStructure
from app.models.hr.time_entry import TimeEntry
from app.repositories.hr.attendance import AttendanceRepository
from app.repositories.hr.employee_user_link import EmployeeUserLinkRepository
from app.repositories.hr.leave_request import LeaveRequestRepository
from app.repositories.hr.employee import EmployeeRepository
from app.repositories.hr.payroll import PayrollRepository
from app.repositories.hr.time_entry import TimeEntryRepository
from app.services.base import BaseService


class HrService(BaseService):
    async def get_employee_for_user(self, *, org_id: str, user_id: str) -> Employee:
        link = await EmployeeUserLinkRepository(self.session).get_by_user_id(org_id=org_id, user_id=user_id)
        if link is None:
            raise AppError("No employee profile linked to this user", status_code=404, code="employee_not_linked")
        return await EmployeeRepository(self.session).get(org_id=org_id, id=link.employee_id)

    async def link_user_to_employee(self, *, org_id: str, employee_id: str, user_id: str) -> EmployeeUserLink:
        _ = await EmployeeRepository(self.session).get(org_id=org_id, id=employee_id)
        link_repo = EmployeeUserLinkRepository(self.session)
        link = EmployeeUserLink(org_id=org_id, employee_id=employee_id, user_id=user_id)
        try:
            created = await link_repo.create(link)
        except Exception:
            raise AppError("User or employee is already linked", status_code=409, code="link_exists")
        await self.publish("hr.employee_user_linked", {"org_id": org_id, "employee_id": employee_id, "user_id": user_id})
        return created

    async def create_employee(self, *, org_id: str, data: dict) -> Employee:
        repo = EmployeeRepository(self.session)
        existing = await repo.get_by_employee_no(org_id=org_id, employee_no=data["employee_no"])
        if existing is not None:
            raise AppError("Employee number already exists", status_code=409, code="conflict")
        emp = Employee(org_id=org_id, **data)
        created = await repo.create(emp)
        await self.publish("hr.employee_created", {"org_id": org_id, "employee_id": created.id})
        return created

    async def list_employees(self, *, org_id: str, limit: int = 50, offset: int = 0) -> list[Employee]:
        return await EmployeeRepository(self.session).list(org_id=org_id, limit=limit, offset=offset)

    async def update_employee(self, *, org_id: str, employee_id: str, data: dict) -> Employee:
        repo = EmployeeRepository(self.session)
        emp = await repo.get(org_id=org_id, id=employee_id)
        updated = await repo.update(emp, data)
        await self.publish("hr.employee_updated", {"org_id": org_id, "employee_id": updated.id})
        return updated

    async def create_attendance(self, *, org_id: str, employee_id: str, day: date, status: str) -> Attendance:
        repo = AttendanceRepository(self.session)
        att = Attendance(org_id=org_id, employee_id=employee_id, day=day, status=status)
        created = await repo.create(att)
        await self.publish("hr.attendance_recorded", {"org_id": org_id, "attendance_id": created.id})
        return created

    async def list_attendance(self, *, org_id: str, limit: int = 50, offset: int = 0) -> list[Attendance]:
        return await AttendanceRepository(self.session).list(org_id=org_id, limit=limit, offset=offset)

    async def list_time_entries(self, *, org_id: str, employee_id: str, limit: int = 30) -> list[TimeEntry]:
        return await TimeEntryRepository(self.session).list_for_employee(org_id=org_id, employee_id=employee_id, limit=limit)

    async def clock_in(self, *, org_id: str, employee_id: str, day: date | None, source: str, note: str) -> TimeEntry:
        now = datetime.now(timezone.utc)
        day_ = day or now.date()
        repo = TimeEntryRepository(self.session)
        existing = await repo.get_by_day(org_id=org_id, employee_id=employee_id, day=day_)
        if existing is not None:
            raise AppError("Already clocked in for this day", status_code=409, code="already_clocked_in")

        entry = TimeEntry(org_id=org_id, employee_id=employee_id, day=day_, clock_in_at=now, clock_out_at=None, source=source, note=note)
        created = await repo.create(entry)

        att_repo = AttendanceRepository(self.session)
        if await att_repo.get_by_day(org_id=org_id, employee_id=employee_id, day=day_) is None:
            try:
                await att_repo.create(Attendance(org_id=org_id, employee_id=employee_id, day=day_, status="present"))
            except Exception:
                pass

        await self.publish("hr.clock_in", {"org_id": org_id, "employee_id": employee_id, "day": str(day_)})
        return created

    async def clock_out(self, *, org_id: str, employee_id: str, day: date | None, note: str) -> TimeEntry:
        now = datetime.now(timezone.utc)
        day_ = day or now.date()
        repo = TimeEntryRepository(self.session)
        existing = await repo.get_by_day(org_id=org_id, employee_id=employee_id, day=day_)
        if existing is None:
            raise AppError("No clock-in found for this day", status_code=404, code="no_clock_in")
        if existing.clock_out_at is not None:
            raise AppError("Already clocked out for this day", status_code=409, code="already_clocked_out")
        updated = await repo.update(existing, {"clock_out_at": now, "note": note or existing.note})
        await self.publish("hr.clock_out", {"org_id": org_id, "employee_id": employee_id, "day": str(day_)})
        return updated

    async def toggle_clock_by_qr(self, *, org_id: str, employee_id: str) -> TimeEntry:
        today = datetime.now(timezone.utc).date()
        repo = TimeEntryRepository(self.session)
        existing = await repo.get_by_day(org_id=org_id, employee_id=employee_id, day=today)
        if existing is None:
            return await self.clock_in(org_id=org_id, employee_id=employee_id, day=today, source="qr", note="")
        if existing.clock_out_at is None:
            return await self.clock_out(org_id=org_id, employee_id=employee_id, day=today, note="")
        raise AppError("Already clocked in/out for today", status_code=409, code="already_clocked_today")

    async def request_leave(self, *, org_id: str, employee_id: str, data: dict) -> LeaveRequest:
        if data["end_day"] < data["start_day"]:
            raise AppError("end_day must be on/after start_day", status_code=400, code="invalid_dates")
        repo = LeaveRequestRepository(self.session)
        lr = LeaveRequest(org_id=org_id, employee_id=employee_id, **data)
        created = await repo.create(lr)
        await self.publish("hr.leave_requested", {"org_id": org_id, "leave_request_id": created.id, "employee_id": employee_id})
        return created

    async def list_leave_requests_for_employee(
        self, *, org_id: str, employee_id: str, limit: int = 50, offset: int = 0
    ) -> list[LeaveRequest]:
        return await LeaveRequestRepository(self.session).list_for_employee(org_id=org_id, employee_id=employee_id, limit=limit, offset=offset)

    async def list_leave_requests(self, *, org_id: str, limit: int = 50, offset: int = 0) -> list[LeaveRequest]:
        return await LeaveRequestRepository(self.session).list_all(org_id=org_id, limit=limit, offset=offset)

    async def decide_leave(
        self,
        *,
        org_id: str,
        leave_request_id: str,
        decided_by_user_id: str,
        status: str,
        decision_note: str,
    ) -> LeaveRequest:
        if status not in ("approved", "rejected"):
            raise AppError("Invalid status", status_code=400, code="invalid_status")
        repo = LeaveRequestRepository(self.session)
        lr = await repo.get(org_id=org_id, id=leave_request_id)
        if lr.status != "pending":
            raise AppError("Leave request already decided", status_code=409, code="already_decided")
        updated = await repo.update(
            lr,
            {
                "status": status,
                "reviewed_by_user_id": decided_by_user_id,
                "reviewed_at": datetime.now(timezone.utc),
                "decision_note": decision_note,
            },
        )
        await self.publish("hr.leave_decided", {"org_id": org_id, "leave_request_id": updated.id, "status": status})
        return updated

    async def create_payroll_structure(self, *, org_id: str, data: dict) -> PayrollStructure:
        repo = PayrollRepository(self.session)
        ps = PayrollStructure(org_id=org_id, **data)
        created = await repo.create(ps)
        await self.publish("hr.payroll_structure_created", {"org_id": org_id, "payroll_structure_id": created.id})
        return created

    async def list_payroll_structures(self, *, org_id: str, limit: int = 50, offset: int = 0) -> list[PayrollStructure]:
        return await PayrollRepository(self.session).list(org_id=org_id, limit=limit, offset=offset)

    async def calculate_payroll(self, *, org_id: str, employee_id: str) -> dict:
        emp = await EmployeeRepository(self.session).get(org_id=org_id, id=employee_id)
        if not emp.payroll_structure_id:
            raise AppError("Employee has no payroll structure assigned", status_code=400, code="missing_payroll")
        ps = await PayrollRepository(self.session).get(org_id=org_id, id=emp.payroll_structure_id)
        gross = float(ps.base_salary) + float(ps.housing_allowance) + float(ps.transport_allowance)
        tax = gross * float(ps.tax_rate)
        net = gross - tax
        return {
            "employee_id": emp.id,
            "structure_id": ps.id,
            "gross": round(gross, 2),
            "tax": round(tax, 2),
            "net": round(net, 2),
        }
