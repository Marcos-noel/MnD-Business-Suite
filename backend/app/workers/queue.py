from __future__ import annotations

import importlib
from collections.abc import Callable
from dataclasses import dataclass
from typing import Any, Protocol

from redis import Redis
from rq import Queue

from app.core.config import settings


class Enqueueable(Protocol):
    def enqueue(self, func: str | Callable[..., Any], *args: Any, **kwargs: Any) -> Any: ...


@dataclass(frozen=True)
class InlineJob:
    id: str


class InlineQueue:
    def __init__(self, name: str):
        self.name = name

    def enqueue(self, func: str | Callable[..., Any], *args: Any, **kwargs: Any) -> InlineJob:
        if isinstance(func, str):
            mod_name, fn_name = func.rsplit(".", 1)
            fn = getattr(importlib.import_module(mod_name), fn_name)
        else:
            fn = func
        fn(*args, **kwargs)
        return InlineJob(id="inline")


def _redis_queue(name: str) -> Queue:
    redis_conn = Redis.from_url(settings.redis_url)
    redis_conn.ping()
    return Queue(name=name, connection=redis_conn, default_timeout=300)


def get_queue(name: str = "default") -> Enqueueable:
    try:
        return _redis_queue(name)
    except Exception:
        return InlineQueue(name=name)
