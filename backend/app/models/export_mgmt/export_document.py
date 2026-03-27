from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import TenantScopedBase


class ExportDocument(TenantScopedBase):
    __tablename__ = "exp_documents"

    org_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), index=True)
    export_order_id: Mapped[str] = mapped_column(String(36), ForeignKey("exp_orders.id", ondelete="CASCADE"), index=True)
    kind: Mapped[str] = mapped_column(String(60), default="commercial_invoice")
    status: Mapped[str] = mapped_column(String(30), default="queued")  # queued/ready/failed
    content_type: Mapped[str] = mapped_column(String(80), default="text/plain")
    encoding: Mapped[str] = mapped_column(String(40), default="utf-8")  # utf-8/base64
    file_name: Mapped[str] = mapped_column(String(200), default="")
    content: Mapped[str] = mapped_column(Text, default="")
    generated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    def mark_ready(self, content: str, *, content_type: str = "text/plain", encoding: str = "utf-8", file_name: str = "") -> None:
        self.content = content
        self.content_type = content_type
        self.encoding = encoding
        self.file_name = file_name
        self.status = "ready"
        self.generated_at = datetime.now(timezone.utc)
