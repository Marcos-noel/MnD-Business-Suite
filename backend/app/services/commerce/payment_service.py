"""
Payment provider integration service.

Supports Stripe and PayPal payment providers.
In production, replace placeholder implementations with actual SDK calls.
"""

from typing import Optional
from datetime import datetime
import secrets


class PaymentResult:
    def __init__(
        self,
        success: bool,
        provider: str,
        reference: str,
        transaction_id: str,
        amount: float,
        currency: str,
        status: str,
        error_message: Optional[str] = None,
    ):
        self.success = success
        self.provider = provider
        self.reference = reference
        self.transaction_id = transaction_id
        self.amount = amount
        self.currency = currency
        self.status = status
        self.error_message = error_message

    def to_dict(self) -> dict:
        return {
            "success": self.success,
            "provider": self.provider,
            "reference": self.reference,
            "transaction_id": self.transaction_id,
            "amount": self.amount,
            "currency": self.currency,
            "status": self.status,
            "error_message": self.error_message,
        }


async def create_stripe_payment_intent(
    amount: float,
    currency: str,
    order_no: str,
    customer_email: str,
    metadata: Optional[dict] = None,
) -> dict:
    """
    Create a Stripe payment intent.
    
    In production:
        import stripe
        stripe.api_key = os.environ.get('STRIPE_SECRET_KEY')
        
        intent = stripe.PaymentIntent.create(
            amount=int(amount * 100),  # Stripe uses cents
            currency=currency.lower(),
            metadata={
                "order_no": order_no,
                **(metadata or {})
            },
            receipt_email=customer_email,
        )
        return {
            "client_secret": intent.client_secret,
            "payment_intent_id": intent.id,
        }
    """
    # Placeholder response
    return {
        "client_secret": f"pi_placeholder_{secrets.token_hex(16)}_secret_{secrets.token_hex(8)}",
        "payment_intent_id": f"pi_{secrets.token_hex(16)}",
    }


async def confirm_stripe_payment(payment_intent_id: str) -> PaymentResult:
    """
    Confirm a Stripe payment was successful.
    
    In production:
        import stripe
        stripe.api_key = os.environ.get('STRIPE_SECRET_KEY')
        
        intent = stripe.PaymentIntent.retrieve(payment_intent_id)
        return PaymentResult(
            success=intent.status == "succeeded",
            provider="stripe",
            reference=intent.id,
            transaction_id=intent.latest_charge,
            amount=intent.amount / 100,
            currency=intent.currency.upper(),
            status=intent.status,
        )
    """
    # Placeholder - assume successful if ID provided
    return PaymentResult(
        success=True,
        provider="stripe",
        reference=payment_intent_id,
        transaction_id=f"ch_{secrets.token_hex(16)}",
        amount=0,  # Would be fetched from Stripe
        currency="KES",
        status="succeeded",
    )


async def create_paypal_order(
    amount: float,
    currency: str,
    order_no: str,
    description: str,
) -> dict:
    """
    Create a PayPal order.
    
    In production:
        import paypalrestsdk
        paypalrestsdk.configure({
            "mode": "live" if production else "sandbox",
            "client_id": os.environ.get('PAYPAL_CLIENT_ID'),
            "client_secret": os.environ.get('PAYPAL_CLIENT_SECRET')
        })
        
        order = paypalrestsdk.Order({
            "intent": "CAPTURE",
            "purchase_units": [{
                "reference_id": order_no,
                "description": description,
                "amount": {
                    "currency_code": currency,
                    "value": str(amount)
                }
            }]
        })
        order.create()
        return {
            "order_id": order.id,
            "approval_url": order.links[0].href,  # Link to redirect user
        }
    """
    return {
        "order_id": f"PAYID-{secrets.token_hex(16)}",
        "approval_url": f"https://www.sandbox.paypal.com/checkoutnow?token=placeholder_{secrets.token_hex(8)}",
    }


async def capture_paypal_order(paypal_order_id: str) -> PaymentResult:
    """
    Capture a PayPal order payment.
    
    In production:
        import paypalrestsdk
        order = paypalrestsdk.Order.find(paypal_order_id)
        capture = order.capture()
        
        return PaymentResult(
            success=capture.success(),
            provider="paypal",
            reference=capture.id,
            transaction_id=capture.purchase_units[0].payments.captures[0].id,
            amount=float(capture.purchase_units[0].amount.value),
            currency=capture.purchase_units[0].amount.currency_code,
            status=capture.status,
        )
    """
    return PaymentResult(
        success=True,
        provider="paypal",
        reference=paypal_order_id,
        transaction_id=f"PAY-{secrets.token_hex(16)}",
        amount=0,
        currency="KES",
        status="COMPLETED",
    )


async def process_payment(
    provider: str,
    amount: float,
    currency: str,
    order_no: str,
    customer_email: str,
    payment_data: Optional[dict] = None,
) -> PaymentResult:
    """
    Process a payment through the specified provider.
    
    Args:
        provider: "stripe" or "paypal"
        amount: Payment amount
        currency: Currency code (KES, USD, etc.)
        order_no: Order reference number
        customer_email: Customer email for receipts
        payment_data: Provider-specific payment data
    
    Returns:
        PaymentResult with payment status
    """
    provider = provider.lower()
    
    if provider == "stripe":
        if payment_data and payment_data.get("payment_intent_id"):
            return await confirm_stripe_payment(payment_data["payment_intent_id"])
        else:
            # Create new payment intent
            intent_data = await create_stripe_payment_intent(
                amount=amount,
                currency=currency,
                order_no=order_no,
                customer_email=customer_email,
            )
            # In production, return client_secret to frontend for payment form
            return PaymentResult(
                success=True,
                provider="stripe",
                reference=intent_data["payment_intent_id"],
                transaction_id="",
                amount=amount,
                currency=currency,
                status="requires_payment_method",
            )
    
    elif provider == "paypal":
        if payment_data and payment_data.get("paypal_order_id"):
            return await capture_paypal_order(payment_data["paypal_order_id"])
        else:
            # Create new PayPal order
            order_data = await create_paypal_order(
                amount=amount,
                currency=currency,
                order_no=order_no,
                description=f"Order {order_no}",
            )
            return PaymentResult(
                success=True,
                provider="paypal",
                reference=order_data["order_id"],
                transaction_id="",
                amount=amount,
                currency=currency,
                status="CREATED",
            )
    
    elif provider == "mpesa":
        # M-Pesa STK Push (Kenya)
        # In production, integrate with M-Pesa Daraja API
        return PaymentResult(
            success=True,
            provider="mpesa",
            reference=payment_data.get("phone", ""),
            transaction_id=f"MPE-{secrets.token_hex(12)}",
            amount=amount,
            currency=currency,
            status="PENDING",  # Requires USSD push confirmation
        )
    
    else:
        return PaymentResult(
            success=False,
            provider=provider,
            reference="",
            transaction_id="",
            amount=amount,
            currency=currency,
            status="FAILED",
            error_message=f"Unknown payment provider: {provider}",
        )


def get_payment_provider_config() -> dict:
    """
    Get payment provider configuration for frontend.
    
    Returns:
        dict with public keys and supported providers
    """
    return {
        "stripe": {
            "public_key": "pk_placeholder",  # os.environ.get('STRIPE_PUBLIC_KEY')
            "supported_methods": ["card"],
        },
        "paypal": {
            "client_id": "placeholder",  # os.environ.get('PAYPAL_CLIENT_ID')
            "supported_methods": ["paypal"],
        },
        "mpesa": {
            "enabled": True,
            "shortcode": "123456",  # Business shortcode
        },
    }
