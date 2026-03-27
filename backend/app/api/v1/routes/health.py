from __future__ import annotations

from fastapi import APIRouter
from sqlalchemy import text

from app.core.cache import redis_cache
from app.core.deps import DbSession


router = APIRouter()


@router.get("/health")
async def health(session: DbSession) -> dict:
    await session.execute(text("SELECT 1"))
    redis_ok = False
    try:
        if redis_cache is not None:
            await redis_cache.ping()
            redis_ok = True
    except Exception:
        redis_ok = False
    return {"ok": True, "db": True, "redis": redis_ok}

