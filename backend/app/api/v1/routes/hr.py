from __future__ import annotations

from fastapi import APIRouter

from app.api.v1.routes._auth_deps import CurrentAuth
from app.api.v1.routes._permissions import require_permission
from app.core.errors import AppError
from app.core.deps import DbSession
from app.core.security import create_qr_token, decode_token
from app.schemas.hr.attendance import AttendanceCreate, AttendanceRead
from app.schemas.hr.employee_link import EmployeeLinkUserRequest
from app.schemas.hr.employee import EmployeeCreate, EmployeeRead, EmployeeUpdate
from app.schemas.hr.leave import LeaveDecision, LeaveRequestCreate, LeaveRequestRead
from app.schemas.hr.qr import QrScanRequest, QrTokenRead
from app.schemas.hr.payroll import PayrollStructureCreate, PayrollStructureRead
from app.schemas.hr.time_entry import ClockInRequest, ClockOutRequest, TimeEntryRead
from app.services.hr.hr_service import HrService
from app.utils.qr import make_qr_svg


router = APIRouter()


@router.get("/employees", response_model=list[EmployeeRead], dependencies=[require_permission("hr.manage")])
async def list_employees(session: DbSession, auth: CurrentAuth, limit: int = 50, offset: int = 0) -> list[EmployeeRead]:
    items = await HrService(session).list_employees(org_id=auth.org_id, limit=limit, offset=offset)
    return [EmployeeRead.model_validate(i) for i in items]


@router.post("/employees", response_model=EmployeeRead, status_code=201, dependencies=[require_permission("hr.manage")])
async def create_employee(payload: EmployeeCreate, session: DbSession, auth: CurrentAuth) -> EmployeeRead:
    emp = await HrService(session).create_employee(org_id=auth.org_id, data=payload.model_dump())
    return EmployeeRead.model_validate(emp)


@router.patch("/employees/{employee_id}", response_model=EmployeeRead, dependencies=[require_permission("hr.manage")])
async def update_employee(employee_id: str, payload: EmployeeUpdate, session: DbSession, auth: CurrentAuth) -> EmployeeRead:
    emp = await HrService(session).update_employee(org_id=auth.org_id, employee_id=employee_id, data=payload.model_dump())
    return EmployeeRead.model_validate(emp)


@router.get("/attendance", response_model=list[AttendanceRead], dependencies=[require_permission("hr.manage")])
async def list_attendance(session: DbSession, auth: CurrentAuth, limit: int = 50, offset: int = 0) -> list[AttendanceRead]:
    items = await HrService(session).list_attendance(org_id=auth.org_id, limit=limit, offset=offset)
    return [AttendanceRead.model_validate(i) for i in items]


@router.post("/attendance", response_model=AttendanceRead, status_code=201, dependencies=[require_permission("hr.manage")])
async def create_attendance(payload: AttendanceCreate, session: DbSession, auth: CurrentAuth) -> AttendanceRead:
    att = await HrService(session).create_attendance(
        org_id=auth.org_id, employee_id=payload.employee_id, day=payload.day, status=payload.status
    )
    return AttendanceRead.model_validate(att)


@router.post("/employees/{employee_id}/link-user", status_code=201, dependencies=[require_permission("hr.manage")])
async def link_user(employee_id: str, payload: EmployeeLinkUserRequest, session: DbSession, auth: CurrentAuth) -> dict:
    link = await HrService(session).link_user_to_employee(org_id=auth.org_id, employee_id=employee_id, user_id=payload.user_id)
    return {"id": link.id}


@router.get("/me", response_model=EmployeeRead, dependencies=[require_permission("hr.self")])
async def my_employee(session: DbSession, auth: CurrentAuth) -> EmployeeRead:
    emp = await HrService(session).get_employee_for_user(org_id=auth.org_id, user_id=auth.user_id)
    return EmployeeRead.model_validate(emp)


@router.get("/me/time-entries", response_model=list[TimeEntryRead], dependencies=[require_permission("hr.self")])
async def my_time_entries(session: DbSession, auth: CurrentAuth, limit: int = 30) -> list[TimeEntryRead]:
    emp = await HrService(session).get_employee_for_user(org_id=auth.org_id, user_id=auth.user_id)
    items = await HrService(session).list_time_entries(org_id=auth.org_id, employee_id=emp.id, limit=limit)
    return [TimeEntryRead.model_validate(i) for i in items]


@router.post("/me/clock-in", response_model=TimeEntryRead, status_code=201, dependencies=[require_permission("hr.self")])
async def clock_in(payload: ClockInRequest, session: DbSession, auth: CurrentAuth) -> TimeEntryRead:
    emp = await HrService(session).get_employee_for_user(org_id=auth.org_id, user_id=auth.user_id)
    item = await HrService(session).clock_in(org_id=auth.org_id, employee_id=emp.id, day=payload.day, source=payload.source, note=payload.note)
    return TimeEntryRead.model_validate(item)


@router.post("/me/clock-out", response_model=TimeEntryRead, status_code=200, dependencies=[require_permission("hr.self")])
async def clock_out(payload: ClockOutRequest, session: DbSession, auth: CurrentAuth) -> TimeEntryRead:
    emp = await HrService(session).get_employee_for_user(org_id=auth.org_id, user_id=auth.user_id)
    item = await HrService(session).clock_out(org_id=auth.org_id, employee_id=emp.id, day=payload.day, note=payload.note)
    return TimeEntryRead.model_validate(item)


@router.post("/me/clock/qr", response_model=TimeEntryRead, status_code=200, dependencies=[require_permission("hr.self")])
async def clock_by_qr(payload: QrScanRequest, session: DbSession, auth: CurrentAuth) -> TimeEntryRead:
    try:
        claims = decode_token(payload.token)
    except Exception:
        raise AppError("Invalid QR token", status_code=400, code="invalid_qr")
    if claims.get("type") != "qr" or claims.get("action") != "hr_clock_toggle":
        raise AppError("Invalid QR token", status_code=400, code="invalid_qr")
    if claims.get("org_id") != auth.org_id:
        raise AppError("QR token is not for this organization", status_code=403, code="qr_wrong_org")
    emp = await HrService(session).get_employee_for_user(org_id=auth.org_id, user_id=auth.user_id)
    item = await HrService(session).toggle_clock_by_qr(org_id=auth.org_id, employee_id=emp.id)
    return TimeEntryRead.model_validate(item)


@router.get("/qr/clock", response_model=QrTokenRead, dependencies=[require_permission("hr.manage")])
async def clock_qr(session: DbSession, auth: CurrentAuth, expires_seconds: int = 90) -> QrTokenRead:
    token = create_qr_token(org_id=auth.org_id, action="hr_clock_toggle", expires_seconds=expires_seconds)
    url_value = f"mnd://hr/clock?token={token}"
    svg = make_qr_svg(data=url_value, size=280)
    return QrTokenRead(token=token, svg=svg, action="hr_clock_toggle", expires_seconds=expires_seconds)


@router.get("/me/leave", response_model=list[LeaveRequestRead], dependencies=[require_permission("hr.self")])
async def my_leave(session: DbSession, auth: CurrentAuth, limit: int = 50, offset: int = 0) -> list[LeaveRequestRead]:
    emp = await HrService(session).get_employee_for_user(org_id=auth.org_id, user_id=auth.user_id)
    items = await HrService(session).list_leave_requests_for_employee(org_id=auth.org_id, employee_id=emp.id, limit=limit, offset=offset)
    return [LeaveRequestRead.model_validate(i) for i in items]


@router.post("/me/leave", response_model=LeaveRequestRead, status_code=201, dependencies=[require_permission("hr.self")])
async def request_leave(payload: LeaveRequestCreate, session: DbSession, auth: CurrentAuth) -> LeaveRequestRead:
    emp = await HrService(session).get_employee_for_user(org_id=auth.org_id, user_id=auth.user_id)
    item = await HrService(session).request_leave(org_id=auth.org_id, employee_id=emp.id, data=payload.model_dump())
    return LeaveRequestRead.model_validate(item)


@router.get("/leave", response_model=list[LeaveRequestRead], dependencies=[require_permission("hr.manage")])
async def list_leave(session: DbSession, auth: CurrentAuth, limit: int = 50, offset: int = 0) -> list[LeaveRequestRead]:
    items = await HrService(session).list_leave_requests(org_id=auth.org_id, limit=limit, offset=offset)
    return [LeaveRequestRead.model_validate(i) for i in items]


@router.post("/leave/{leave_request_id}/decide", response_model=LeaveRequestRead, dependencies=[require_permission("hr.manage")])
async def decide_leave(leave_request_id: str, payload: LeaveDecision, session: DbSession, auth: CurrentAuth) -> LeaveRequestRead:
    item = await HrService(session).decide_leave(
        org_id=auth.org_id,
        leave_request_id=leave_request_id,
        decided_by_user_id=auth.user_id,
        status=payload.status,
        decision_note=payload.decision_note,
    )
    return LeaveRequestRead.model_validate(item)


@router.get("/payroll/structures", response_model=list[PayrollStructureRead], dependencies=[require_permission("hr.manage")])
async def list_payroll_structures(
    session: DbSession, auth: CurrentAuth, limit: int = 50, offset: int = 0
) -> list[PayrollStructureRead]:
    items = await HrService(session).list_payroll_structures(org_id=auth.org_id, limit=limit, offset=offset)
    return [PayrollStructureRead.model_validate(i) for i in items]


@router.post("/payroll/structures", response_model=PayrollStructureRead, status_code=201, dependencies=[require_permission("hr.manage")])
async def create_payroll_structure(payload: PayrollStructureCreate, session: DbSession, auth: CurrentAuth) -> PayrollStructureRead:
    ps = await HrService(session).create_payroll_structure(org_id=auth.org_id, data=payload.model_dump())
    return PayrollStructureRead.model_validate(ps)


@router.get("/payroll/calculate/{employee_id}", dependencies=[require_permission("hr.manage")])
async def calculate_payroll(employee_id: str, session: DbSession, auth: CurrentAuth) -> dict:
    return await HrService(session).calculate_payroll(org_id=auth.org_id, employee_id=employee_id)
