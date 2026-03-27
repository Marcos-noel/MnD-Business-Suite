from __future__ import annotations

import asyncio
from typing import AsyncIterator

from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings


class Base(DeclarativeBase):
    pass


engine: AsyncEngine = create_async_engine(settings.database_url, pool_pre_ping=True)
SessionLocal = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

_models_initialized = False
_models_lock = asyncio.Lock()


async def get_db() -> AsyncIterator[AsyncSession]:
    await ensure_models_initialized()
    async with SessionLocal() as session:
        yield session


async def init_models() -> None:
    from app.models import (  # noqa: F401
        ai_assistant,
        auth,
        commerce,
        crm,
        erp,
        export_mgmt,
        finance,
        hr,
        inventory,
        tenancy,
    )

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def ensure_models_initialized() -> None:
    global _models_initialized
    if _models_initialized:
        return
    async with _models_lock:
        if _models_initialized:
            return
        await init_models()
        _models_initialized = True
