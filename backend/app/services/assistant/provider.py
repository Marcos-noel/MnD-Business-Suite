from __future__ import annotations

from abc import ABC, abstractmethod


class AssistantProvider(ABC):
    @abstractmethod
    async def chat(self, *, org_id: str, user_id: str, message: str) -> str: ...

    @abstractmethod
    async def recommendations(self, *, org_id: str) -> list[dict]: ...

    @abstractmethod
    async def forecast(self, *, org_id: str) -> dict: ...

    @abstractmethod
    async def analytics(self, *, org_id: str) -> dict: ...

    @abstractmethod
    async def predictive_analytics(self, *, org_id: str) -> dict: ...
