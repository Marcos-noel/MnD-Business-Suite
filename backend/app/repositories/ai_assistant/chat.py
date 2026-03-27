from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.ai_assistant.chat_message import ChatMessage


class ChatRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def add(self, msg: ChatMessage) -> ChatMessage:
        self.session.add(msg)
        await self.session.commit()
        await self.session.refresh(msg)
        return msg

    async def recent(self, *, org_id: str, user_id: str, limit: int = 20) -> list[ChatMessage]:
        res = await self.session.execute(
            select(ChatMessage)
            .where(ChatMessage.org_id == org_id)
            .where(ChatMessage.user_id == user_id)
            .order_by(ChatMessage.created_at.desc())
            .limit(limit)
        )
        return list(res.scalars().all())

