from __future__ import annotations

import pytest
from httpx import AsyncClient


@pytest.fixture
async def client() -> AsyncClient:
    from app.main import create_app

    app = create_app()
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac


async def _register_and_login(client: AsyncClient, slug: str, email: str) -> str:
    r = await client.post(
        "/api/v1/auth/register",
        json={
            "org_name": f"{slug} Org",
            "org_slug": slug,
            "admin_email": email,
            "admin_full_name": "Admin",
            "admin_password": "AdminPass123!",
        },
    )
    assert r.status_code in (201, 409)
    r = await client.post("/api/v1/auth/login", json={"org_slug": slug, "email": email, "password": "AdminPass123!"})
    assert r.status_code == 200
    return r.json()["access_token"]


async def test_dashboard_requires_auth(client: AsyncClient) -> None:
    r = await client.get("/api/v1/erp/dashboard")
    assert r.status_code == 401


async def test_tenant_isolation_inventory(client: AsyncClient) -> None:
    token_a = await _register_and_login(client, "a", "admin+a@mnd.local")
    token_b = await _register_and_login(client, "b", "admin+b@mnd.local")

    r = await client.post(
        "/api/v1/inventory/products",
        headers={"Authorization": f"Bearer {token_a}"},
        json={"sku": "SKU-1", "name": "Product A", "unit": "pcs", "reorder_level": 5, "unit_cost": 1.2},
    )
    assert r.status_code in (201, 409)

    r = await client.get("/api/v1/inventory/products", headers={"Authorization": f"Bearer {token_b}"})
    assert r.status_code == 200
    skus = {p["sku"] for p in r.json()}
    assert "SKU-1" not in skus

