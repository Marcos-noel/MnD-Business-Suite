from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.events import Event, event_bus


class BaseService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def publish(self, name: str, payload: dict) -> None:
        await event_bus.publish(Event(name=name, payload=payload))

