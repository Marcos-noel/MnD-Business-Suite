from __future__ import annotations

from datetime import date

from sqlalchemy import Date, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import TenantScopedBase


class Shipment(TenantScopedBase):
    __tablename__ = "exp_shipments"

    org_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), index=True)
    export_order_id: Mapped[str] = mapped_column(String(36), ForeignKey("exp_orders.id", ondelete="CASCADE"), index=True)
    carrier: Mapped[str] = mapped_column(String(120), default="")
    tracking_no: Mapped[str] = mapped_column(String(120), index=True)
    ship_date: Mapped[date] = mapped_column(Date)
    eta_date: Mapped[date] = mapped_column(Date)
    status: Mapped[str] = mapped_column(String(40), default="in_transit")  # in_transit/delivered/delayed

