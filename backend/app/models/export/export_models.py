from __future__ import annotations

from sqlalchemy import ForeignKey, String, Text, Float, Integer, Boolean, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime

from app.models.base import TenantScopedBase


class Invoice(TenantScopedBase):
    """Export-specialized invoice model"""
    __tablename__ = "export_invoices"

    org_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), index=True)
    order_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("commerce_orders.id", ondelete="SET NULL"), nullable=True)
    
    invoice_no: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    invoice_type: Mapped[str] = mapped_column(String(50), default="commercial")  # commercial, proforma, tax
    
    customer_id: Mapped[str] = mapped_column(String(36), ForeignKey("crm_customers.id", ondelete="RESTRICT"))
    customer_name: Mapped[str] = mapped_column(String(255))
    customer_email: Mapped[str] = mapped_column(String(255))
    
    destination_country: Mapped[str] = mapped_column(String(100), default="")
    
    subtotal: Mapped[float] = mapped_column(Float, default=0)
    tax_amount: Mapped[float] = mapped_column(Float, default=0)
    total: Mapped[float] = mapped_column(Float, default=0)
    
    currency: Mapped[str] = mapped_column(String(3), default="KES")
    exchange_rate: Mapped[float] = mapped_column(Float, default=1.0)  # Exchange rate if converted
    
    payment_terms: Mapped[str] = mapped_column(String(100), default="NET30")  # FOB, CIF, NET30, etc.
    due_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    
    status: Mapped[str] = mapped_column(String(50), default="draft")  # draft, issued, paid, overdue
    notes: Mapped[str] = mapped_column(Text, default="")
    
    issued_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    paid_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)


class ProfOrmaInvoice(TenantScopedBase):
    """Proforma invoice for export quotes"""
    __tablename__ = "export_proforma_invoices"

    org_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), index=True)
    proforma_no: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    
    customer_id: Mapped[str] = mapped_column(String(36), ForeignKey("crm_customers.id", ondelete="RESTRICT"))
    customer_name: Mapped[str] = mapped_column(String(255))
    
    destination_country: Mapped[str] = mapped_column(String(100))
    
    subtotal: Mapped[float] = mapped_column(Float, default=0)
    shipping_cost: Mapped[float] = mapped_column(Float, default=0)
    insurance_cost: Mapped[float] = mapped_column(Float, default=0)
    tax_amount: Mapped[float] = mapped_column(Float, default=0)
    total: Mapped[float] = mapped_column(Float, default=0)
    
    currency: Mapped[str] = mapped_column(String(3), default="KES")
    
    validity_days: Mapped[int] = mapped_column(Integer, default=30)
    status: Mapped[str] = mapped_column(String(50), default="active")  # active, accepted, declined, expired
    
    converted_to_order_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    valid_until: Mapped[datetime] = mapped_column(DateTime)


class ExportDocumentation(TenantScopedBase):
    """Export-specific documents (BoL, CoO, etc.)"""
    __tablename__ = "export_documentation"

    org_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), index=True)
    shipment_id: Mapped[str] = mapped_column(String(36), ForeignKey("export_shipments.id", ondelete="CASCADE"), index=True)
    
    document_type: Mapped[str] = mapped_column(String(100))  # bill_of_lading, coo, packing_list, etc.
    document_number: Mapped[str | None] = mapped_column(String(100), nullable=True)
    
    generated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    valid_until: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    
    file_url: Mapped[str] = mapped_column(String(500), default="")
    filesize_kb: Mapped[int] = mapped_column(Integer, default=0)
    
    status: Mapped[str] = mapped_column(String(50), default="generated")  # generated, verified, approved, rejected


class Shipment(TenantScopedBase):
    """Export shipment tracking"""
    __tablename__ = "export_shipments"

    org_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), index=True)
    shipment_no: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    
    source_warehouse_id: Mapped[str] = mapped_column(String(36), nullable=True)
    destination_country: Mapped[str] = mapped_column(String(100))
    destination_address: Mapped[str] = mapped_column(Text, default="")
    
    customer_id: Mapped[str] = mapped_column(String(36), ForeignKey("crm_customers.id", ondelete="RESTRICT"))
    
    shipping_partner_id: Mapped[str | None] = mapped_column(String(36), nullable=True)  # DHL, FedEx, etc.
    tracking_number: Mapped[str] = mapped_column(String(100), default="", index=True)
    
    weight_kg: Mapped[float] = mapped_column(Float, default=0)
    dimensions_cm: Mapped[str] = mapped_column(String(100), default="")  # LxWxH
    
    container_type: Mapped[str] = mapped_column(String(50), default="")  # 20ft, 40ft container, etc.
    container_number: Mapped[str] = mapped_column(String(50), default="")
    
    status: Mapped[str] = mapped_column(String(50), default="pending")  # pending, packed, in_transit, cleared, delivered
    
    shipped_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    expected_delivery: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    actual_delivery: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    
    shipping_cost: Mapped[float] = mapped_column(Float, default=0)
    insurance_cost: Mapped[float] = mapped_column(Float, default=0)
    currency: Mapped[str] = mapped_column(String(3), default="KES")
    
    insurance_policy_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    notes: Mapped[str] = mapped_column(Text, default="")


class ShipmentItem(TenantScopedBase):
    """Line items in a shipment"""
    __tablename__ = "export_shipment_items"

    org_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), index=True)
    shipment_id: Mapped[str] = mapped_column(String(36), ForeignKey("export_shipments.id", ondelete="CASCADE"), index=True)
    
    product_id: Mapped[str] = mapped_column(String(36), ForeignKey("inv_products.id", ondelete="RESTRICT"))
    product_name: Mapped[str] = mapped_column(String(255))
    
    batch_no: Mapped[str] = mapped_column(String(100), default="")  # For traceability
    expiry_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    
    quantity: Mapped[int] = mapped_column(Integer, default=1)
    unit_price: Mapped[float] = mapped_column(Float, default=0)
    line_total: Mapped[float] = mapped_column(Float, default=0)
    
    hs_code: Mapped[str] = mapped_column(String(20), default="")  # Tariff code
    hs_description: Mapped[str] = mapped_column(String(255), default="")


class Supplier(TenantScopedBase):
    """Supplier/Vendor management"""
    __tablename__ = "export_suppliers"

    org_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), index=True)
    
    name: Mapped[str] = mapped_column(String(255), unique=True)
    contact_person: Mapped[str] = mapped_column(String(255), default="")
    email: Mapped[str] = mapped_column(String(255), default="")
    phone: Mapped[str] = mapped_column(String(50), default="")
    
    address: Mapped[str] = mapped_column(Text, default="")
    city: Mapped[str] = mapped_column(String(100), default="")
    country: Mapped[str] = mapped_column(String(100), default="")
    
    tax_id: Mapped[str] = mapped_column(String(100), default="")
    company_registration: Mapped[str] = mapped_column(String(100), default="")
    
    average_lead_time_days: Mapped[int] = mapped_column(Integer, default=0)
    rating: Mapped[float] = mapped_column(Float, default=5.0)  # 1-5 stars
    
    payment_terms: Mapped[str] = mapped_column(String(100), default="NET30")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    certifications: Mapped[str] = mapped_column(Text, default="")  # JSON list of certifications
    notes: Mapped[str] = mapped_column(Text, default="")


class PurchaseOrder(TenantScopedBase):
    """Purchase order to suppliers"""
    __tablename__ = "export_purchase_orders"

    org_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), index=True)
    po_no: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    
    supplier_id: Mapped[str] = mapped_column(String(36), ForeignKey("export_suppliers.id", ondelete="RESTRICT"))
    
    status: Mapped[str] = mapped_column(String(50), default="draft")  # draft, sent, confirmed, partial, completed, cancelled
    
    subtotal: Mapped[float] = mapped_column(Float, default=0)
    tax_amount: Mapped[float] = mapped_column(Float, default=0)
    total: Mapped[float] = mapped_column(Float, default=0)
    
    currency: Mapped[str] = mapped_column(String(3), default="KES")
    
    delivery_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    expected_delivery: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    
    notes: Mapped[str] = mapped_column(Text, default="")
    
    issued_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class QualityControl(TenantScopedBase):
    """Quality control inspection records"""
    __tablename__ = "export_quality_control"

    org_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), index=True)
    
    product_id: Mapped[str] = mapped_column(String(36), ForeignKey("inv_products.id", ondelete="RESTRICT"))
    batch_no: Mapped[str] = mapped_column(String(100), index=True)
    
    inspector_name: Mapped[str] = mapped_column(String(255), default="")
    inspection_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    status: Mapped[str] = mapped_column(String(50), default="passed")  # passed, failed, needs_rework
    
    defect_count: Mapped[int] = mapped_column(Integer, default=0)
    defect_description: Mapped[str] = mapped_column(Text, default="")
    
    photos_urls: Mapped[str] = mapped_column(Text, default="")  # JSON array
    
    quantity_inspected: Mapped[int] = mapped_column(Integer, default=0)
    quantity_approved: Mapped[int] = mapped_column(Integer, default=0)
    
    notes: Mapped[str] = mapped_column(Text, default="")
