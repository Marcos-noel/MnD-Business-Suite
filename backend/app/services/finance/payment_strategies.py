from __future__ import annotations

from abc import ABC, abstractmethod


class PaymentStrategy(ABC):
    code: str

    @abstractmethod
    async def collect(self, *, amount: float, reference: str, description: str) -> dict: ...


class CashPaymentStrategy(PaymentStrategy):
    code = "cash"

    async def collect(self, *, amount: float, reference: str, description: str) -> dict:
        return {"provider": self.code, "reference": reference or "CASH", "description": description}


class MobileMoneyPaymentStrategy(PaymentStrategy):
    code = "mobile_money"

    async def collect(self, *, amount: float, reference: str, description: str) -> dict:
        if not reference:
            reference = "MM-" + str(int(amount * 100))
        return {"provider": self.code, "reference": reference, "description": description}


class MpesaPaymentStrategy(PaymentStrategy):
    code = "mpesa"

    async def collect(self, *, amount: float, reference: str, description: str) -> dict:
        if not reference:
            reference = "MPESA-" + str(int(amount * 100))
        return {"provider": self.code, "reference": reference, "description": description}


class StripePaymentStrategy(PaymentStrategy):
    code = "stripe"

    async def collect(self, *, amount: float, reference: str, description: str) -> dict:
        # Stripe-ready abstraction: "reference" can be a PaymentIntent id in production.
        if not reference:
            reference = "pi_" + str(int(amount * 100))
        return {"provider": self.code, "reference": reference, "description": description}


class BankPaymentStrategy(PaymentStrategy):
    code = "bank"

    async def collect(self, *, amount: float, reference: str, description: str) -> dict:
        return {"provider": self.code, "reference": reference or "BANK", "description": description}


def get_payment_strategy(provider: str) -> PaymentStrategy:
    strategies = [
        CashPaymentStrategy(),
        MobileMoneyPaymentStrategy(),  # legacy
        MpesaPaymentStrategy(),
        StripePaymentStrategy(),
        BankPaymentStrategy(),
    ]
    for s in strategies:
        if s.code == provider:
            return s
    raise ValueError("Unsupported payment provider")
