from __future__ import annotations


class SocialProviderAdapter:
    async def dispatch_message(self, *, platform: str, recipient: str, message: str) -> dict:
        # Placeholder adapter for WhatsApp/social integrations.
        # Future providers: Meta Graph, Twilio WhatsApp, LinkedIn, X.
        return {
            "platform": platform,
            "recipient": recipient,
            "message_preview": message[:120],
            "status": "accepted",
            "external_message_id": f"{platform}_mock_{abs(hash((platform, recipient, message))) % 10_000_000}",
        }
