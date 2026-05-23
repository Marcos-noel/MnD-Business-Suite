from __future__ import annotations

from pydantic import Field

from app.schemas.common import APIModel, Timestamped


class QuoteEmailSendRequest(APIModel):
    to_email: str = Field(pattern=r"^.+@.+\..+$", max_length=255)
    subject: str = Field(min_length=3, max_length=255)
    message: str = Field(min_length=3, max_length=5000)


class QuoteEmailLogRead(Timestamped):
    org_id: str
    quote_id: str
    to_email: str
    subject: str
    provider: str
    provider_message_id: str
    status: str
    sent_at: str
