from __future__ import annotations

from datetime import date

from pydantic import Field

from app.schemas.common import APIModel, Timestamped


class ExportOrderCreate(APIModel):
    customer_id: str
    order_no: str = Field(min_length=1, max_length=60)
    destination_country: str = Field(min_length=2, max_length=80)
    order_date: date
    status: str = Field(default="draft", pattern=r"^(draft|confirmed|shipped|delivered)$")


class ExportOrderUpdate(APIModel):
    destination_country: str | None = Field(default=None, min_length=2, max_length=80)
    status: str | None = Field(default=None, pattern=r"^(draft|confirmed|shipped|delivered)$")


class ExportOrderRead(Timestamped):
    org_id: str
    customer_id: str
    order_no: str
    destination_country: str
    order_date: date
    status: str


class ShipmentCreate(APIModel):
    export_order_id: str
    carrier: str = Field(default="", max_length=120)
    tracking_no: str = Field(min_length=2, max_length=120)
    ship_date: date
    eta_date: date
    status: str = Field(default="in_transit", pattern=r"^(in_transit|delivered|delayed)$")


class ShipmentRead(Timestamped):
    org_id: str
    export_order_id: str
    carrier: str
    tracking_no: str
    ship_date: date
    eta_date: date
    status: str


class DocumentRequest(APIModel):
    export_order_id: str
    kind: str = Field(default="commercial_invoice", max_length=60)


class ExportDocumentRead(Timestamped):
    org_id: str
    export_order_id: str
    kind: str
    status: str
    content_type: str | None = None
    encoding: str | None = None
    file_name: str | None = None
    generated_at: str | None


class ExportDocumentContent(APIModel):
    id: str
    status: str
    content_type: str = "text/plain"
    encoding: str = "utf-8"
    file_name: str = ""
    content: str
