from __future__ import annotations

from app.models.ai_assistant.chat_message import ChatMessage
from app.repositories.ai_assistant.chat import ChatRepository
from app.services.assistant.mock_provider import MockAssistantProvider
from app.services.assistant.provider import AssistantProvider
from app.services.base import BaseService


class AssistantService(BaseService):
    def __init__(self, session, provider: AssistantProvider | None = None):
        super().__init__(session)
        self.provider = provider or MockAssistantProvider(session)

    async def chat(self, *, org_id: str, user_id: str, message: str) -> str:
        repo = ChatRepository(self.session)
        await repo.add(ChatMessage(org_id=org_id, user_id=user_id, role="user", content=message))
        reply = await self.provider.chat(org_id=org_id, user_id=user_id, message=message)
        await repo.add(ChatMessage(org_id=org_id, user_id=user_id, role="assistant", content=reply))
        return reply

    async def recommendations(self, *, org_id: str) -> list[dict]:
        return await self.provider.recommendations(org_id=org_id)

    async def forecast(self, *, org_id: str) -> dict:
        return await self.provider.forecast(org_id=org_id)

    async def analytics(self, *, org_id: str) -> dict:
        return await self.provider.analytics(org_id=org_id)

    async def predictive_analytics(self, *, org_id: str) -> dict:
        return await self.provider.predictive_analytics(org_id=org_id)
