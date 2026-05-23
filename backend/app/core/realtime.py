from __future__ import annotations

import asyncio
import json
from dataclasses import dataclass, field
from datetime import datetime, timezone

from app.core.events import Event


@dataclass
class StreamEvent:
    name: str
    payload: dict
    ts: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

    def to_sse(self) -> str:
        body = json.dumps({"name": self.name, "payload": self.payload, "ts": self.ts}, default=str)
        return f"event: {self.name}\ndata: {body}\n\n"


class RealtimeBroker:
    def __init__(self) -> None:
        self._subscribers: set[asyncio.Queue[StreamEvent]] = set()
        self._lock = asyncio.Lock()

    async def subscribe(self) -> asyncio.Queue[StreamEvent]:
        q: asyncio.Queue[StreamEvent] = asyncio.Queue(maxsize=200)
        async with self._lock:
            self._subscribers.add(q)
        return q

    async def unsubscribe(self, q: asyncio.Queue[StreamEvent]) -> None:
        async with self._lock:
            self._subscribers.discard(q)

    async def publish(self, name: str, payload: dict) -> None:
        event = StreamEvent(name=name, payload=payload)
        async with self._lock:
            subscribers = list(self._subscribers)
        for q in subscribers:
            try:
                q.put_nowait(event)
            except asyncio.QueueFull:
                continue

    async def publish_from_event(self, event: Event) -> None:
        await self.publish(event.name, event.payload)


realtime_broker = RealtimeBroker()
