from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any

import httpx

from app.core.config import settings


@dataclass
class FxSnapshot:
    base: str
    rates: dict[str, float]
    updated_at: datetime
    source: str


class FxService:
    async def fetch_rates(self, base: str = "USD") -> FxSnapshot:
        if not settings.fx_api_key:
            raise RuntimeError("Missing FX_API_KEY")

        url = f"{settings.fx_api_base.rstrip('/')}/latest.json"
        params: dict[str, Any] = {"app_id": settings.fx_api_key, "base": base}

        async with httpx.AsyncClient(timeout=10) as client:
            res = await client.get(url, params=params)
            res.raise_for_status()
            payload = res.json()

        rates = payload.get("rates", {})
        updated_at = datetime.now(timezone.utc)
        return FxSnapshot(base=payload.get("base", base), rates=rates, updated_at=updated_at, source=url)
