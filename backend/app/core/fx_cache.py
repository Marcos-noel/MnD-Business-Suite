from __future__ import annotations

import asyncio
from datetime import datetime, timezone

from app.core.config import settings
from app.services.fx_service import FxService, FxSnapshot


_fx_snapshot: FxSnapshot | None = None
_fx_lock = asyncio.Lock()


async def refresh_fx_rates() -> FxSnapshot | None:
    global _fx_snapshot
    async with _fx_lock:
        try:
            snapshot = await FxService().fetch_rates(base="USD")
            _fx_snapshot = snapshot
            return snapshot
        except Exception:
            return _fx_snapshot


def get_fx_snapshot() -> FxSnapshot | None:
    return _fx_snapshot


async def start_fx_refresh_loop() -> None:
    await refresh_fx_rates()
    interval = max(settings.fx_refresh_minutes, 10)
    while True:
        await asyncio.sleep(interval * 60)
        await refresh_fx_rates()


def ensure_fx_snapshot() -> FxSnapshot:
    if _fx_snapshot is None:
        return FxSnapshot(base="USD", rates={}, updated_at=datetime.now(timezone.utc), source="cache")
    return _fx_snapshot
