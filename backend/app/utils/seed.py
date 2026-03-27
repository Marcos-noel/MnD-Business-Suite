from __future__ import annotations

import asyncio
from datetime import date, timedelta

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import SessionLocal, init_models
from app.models.crm.opportunity import Opportunity
from app.models.export_mgmt.export_order import ExportOrder
from app.models.export_mgmt.shipment import Shipment
from app.models.finance.transaction import Transaction
from app.models.hr.attendance import Attendance
from app.models.hr.employee import Employee
from app.models.hr.payroll import PayrollStructure
from app.models.inventory.product import Product
from app.models.inventory.stock_movement import StockMovement
from app.models.inventory.supplier import Supplier
from app.services.auth.auth_service import AuthService
from app.repositories.tenancy.organization import OrganizationRepository
from app.services.crm.crm_service import CrmService
from app.services.export_mgmt.export_service import ExportService
from app.services.finance.finance_service import FinanceService
from app.services.hr.hr_service import HrService
from app.services.inventory.inventory_service import InventoryService


async def _seed(session: AsyncSession) -> None:
    await init_models()

    try:
        await OrganizationRepository(session).get_by_slug("MnD")
        print("Seed skipped: organization 'MnD' already exists.")
        return
    except Exception:
        pass

    auth = AuthService(session)
    org = await auth.register_org_with_admin(
        org_name="MnD Business Suite",
        org_slug="MnD",
        admin_email="admin@mnd.com",
        admin_full_name="System Administrator",
        admin_password="AdminPass123!",
    )

    # HR
    hr = HrService(session)
    ps = await hr.create_payroll_structure(
        org_id=org.id,
        data={
            "name": "Standard",
            "base_salary": 800.0,
            "housing_allowance": 150.0,
            "transport_allowance": 50.0,
            "tax_rate": 0.15,
        },
    )
    emp1 = await hr.create_employee(
        org_id=org.id,
        data={
            "employee_no": "EMP-001",
            "full_name": "Amina Mwangi",
            "email": "amina@mnd.local",
            "role_title": "Operations Lead",
            "payroll_structure_id": ps.id,
            "hire_date": date.today() - timedelta(days=200),
        },
    )
    emp2 = await hr.create_employee(
        org_id=org.id,
        data={
            "employee_no": "EMP-002",
            "full_name": "Brian Otieno",
            "email": "brian@mnd.local",
            "role_title": "Sales Rep",
            "payroll_structure_id": ps.id,
            "hire_date": date.today() - timedelta(days=120),
        },
    )
    await hr.create_attendance(org_id=org.id, employee_id=emp1.id, day=date.today(), status="present")
    await hr.create_attendance(org_id=org.id, employee_id=emp2.id, day=date.today(), status="present")

    # Inventory
    inv = InventoryService(session)
    await inv.create_supplier(org_id=org.id, data={"name": "Nairobi Supplies Ltd", "email": "sales@supplier.local", "phone": "+254700000000"})
    p1 = await inv.create_product(
        org_id=org.id,
        data={
            "sku": "SKU-COFFEE-1KG",
            "name": "Coffee Beans 1kg",
            "description": "Single-origin roasted beans, export-grade packaging.",
            "unit": "bag",
            "reorder_level": 20,
            "unit_cost": 12.5,
            "sell_price": 18.0,
            "currency": "KES",
            "is_published": True,
        },
    )
    p2 = await inv.create_product(
        org_id=org.id,
        data={
            "sku": "SKU-TEA-500G",
            "name": "Tea Leaves 500g",
            "description": "Premium black tea leaves for retail & wholesale.",
            "unit": "pack",
            "reorder_level": 30,
            "unit_cost": 4.2,
            "sell_price": 7.5,
            "currency": "KES",
            "is_published": True,
        },
    )
    await inv.record_stock_movement(org_id=org.id, product_id=p1.id, quantity_delta=50, reason="purchase")
    await inv.record_stock_movement(org_id=org.id, product_id=p2.id, quantity_delta=10, reason="purchase")

    # CRM
    crm = CrmService(session)
    c1 = await crm.create_customer(org_id=org.id, data={"name": "Kampala Retailers", "email": "buyer@kampala.local", "phone": "+256700000000", "notes": "Bulk buyer"})
    c2 = await crm.create_customer(org_id=org.id, data={"name": "Mombasa Traders", "email": "trade@mombasa.local", "phone": "+254710000000", "notes": ""})
    await crm.create_opportunity(org_id=org.id, data={"customer_id": c1.id, "title": "Q2 Coffee Supply", "stage": "proposal", "value": 4500})
    await crm.create_opportunity(org_id=org.id, data={"customer_id": c2.id, "title": "Tea Distribution Deal", "stage": "qualified", "value": 1800})
    await crm.log_interaction(org_id=org.id, data={"customer_id": c1.id, "channel": "call", "summary": "Discussed delivery schedule and payment terms."})

    # Finance
    fin = FinanceService(session)
    for i in range(10):
        await fin.create_transaction(
            org_id=org.id,
            data={"day": date.today() - timedelta(days=i * 3), "kind": "revenue", "category": "sales", "amount": 500 + i * 25, "description": "Sales revenue"},
        )
    for i in range(6):
        await fin.create_transaction(
            org_id=org.id,
            data={"day": date.today() - timedelta(days=i * 5), "kind": "expense", "category": "ops", "amount": 220 + i * 15, "description": "Operating expense"},
        )

    # Exports
    exports = ExportService(session)
    order = await exports.create_order(
        org_id=org.id,
        data={
            "customer_id": c1.id,
            "order_no": "EXP-1001",
            "destination_country": "Uganda",
            "order_date": date.today() - timedelta(days=7),
            "status": "confirmed",
        },
    )
    await exports.create_shipment(
        org_id=org.id,
        data={
            "export_order_id": order.id,
            "carrier": "DHL",
            "tracking_no": "DHL-TRACK-123",
            "ship_date": date.today() - timedelta(days=3),
            "eta_date": date.today() + timedelta(days=4),
            "status": "in_transit",
        },
    )

    # Ensure some low stock pressure: consume coffee
    await inv.record_stock_movement(org_id=org.id, product_id=p1.id, quantity_delta=-40, reason="sale")

    # Commerce (internal order + payment simulation)
    from app.services.commerce.commerce_service import CommerceService

    com = CommerceService(session)
    order, _ = await com.create_order(
        org_id=org.id,
        data={"customer_id": c1.id, "customer_name": c1.name, "customer_email": c1.email, "items": [{"product_id": p1.id, "quantity": 2}]},
    )
    await com.pay_order(org_id=org.id, order_id=order.id, provider="mpesa", reference="")


async def main() -> None:
    async with SessionLocal() as session:
        await _seed(session)


if __name__ == "__main__":
    asyncio.run(main())
