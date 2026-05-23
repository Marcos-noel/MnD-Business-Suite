from __future__ import annotations

from datetime import datetime, timezone


class QuoteEmailProvider:
    async def send_quote_email(self, *, to_email: str, subject: str, body: str) -> dict:
        # Placeholder provider adapter. Replace with SES/SendGrid/Mailgun.
        ts = int(datetime.now(timezone.utc).timestamp())
        return {"provider": "mock", "message_id": f"quote_{ts}", "status": "sent", "body_size": len(body)}
