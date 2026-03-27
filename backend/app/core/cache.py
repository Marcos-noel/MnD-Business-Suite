from __future__ import annotations

from redis.asyncio import Redis
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from fastapi_cache.backends.inmemory import InMemoryBackend

from app.core.config import settings


redis_cache: Redis | None = None


async def init_cache() -> None:
    global redis_cache
    try:
        redis_cache = Redis.from_url(
            settings.redis_url, encoding="utf-8", decode_responses=True, socket_connect_timeout=1
        )
        await redis_cache.ping()
        FastAPICache.init(RedisBackend(redis_cache), prefix="mnd-cache")
    except Exception:
        redis_cache = None
        FastAPICache.init(InMemoryBackend(), prefix="mnd-cache")
