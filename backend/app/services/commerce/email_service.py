"""
Order confirmation email service.

This is a placeholder for sending order confirmation emails.
In production, integrate with SendGrid, Mailgun, AWS SES, or similar.
"""

from typing import Optional
from datetime import datetime


async def send_order_confirmation(
    to_email: str,
    customer_name: str,
    order_no: str,
    order_total: float,
    currency: str,
    items: list[dict],
    shipping_address: Optional[dict] = None,
) -> dict:
    """
    Send order confirmation email.
    
    In production, this would:
    1. Connect to an email provider (SendGrid, Mailgun, etc.)
    2. Send an HTML email with order details
    3. Return the message ID from the provider
    
    Args:
        to_email: Customer email address
        customer_name: Customer's name
        order_no: Order number
        order_total: Order total amount
        currency: Currency code (KES, USD, etc.)
        items: List of order items
        shipping_address: Shipping address details
    
    Returns:
        dict with status and message_id
    """
    # Placeholder - in production, replace with actual email sending
    print(f"[EMAIL] Order confirmation email to {to_email}")
    print(f"[EMAIL] Order: {order_no}")
    print(f"[EMAIL] Total: {currency} {order_total}")
    
    # HTML template (for production use)
    email_html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: #4F46E5; color: white; padding: 20px; text-align: center; }}
            .content {{ padding: 20px; background: #f9f9f9; }}
            .order-items {{ width: 100%; border-collapse: collapse; margin: 20px 0; }}
            .order-items th, .order-items td {{ padding: 10px; border-bottom: 1px solid #ddd; text-align: left; }}
            .order-items th {{ background: #f5f5f5; }}
            .total {{ font-size: 18px; font-weight: bold; }}
            .footer {{ padding: 20px; text-align: center; color: #666; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Order Confirmed!</h1>
            </div>
            <div class="content">
                <p>Hi {customer_name},</p>
                <p>Thank you for your order! We've received your order and will process it shortly.</p>
                
                <h3>Order Details</h3>
                <p><strong>Order Number:</strong> {order_no}</p>
                
                <table class="order-items">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Qty</th>
                            <th>Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {''.join(f"<tr><td>{item.get('product_name', 'Product')}</td><td>{item.get('quantity', 1)}</td><td>{currency} {item.get('line_total', 0):.2f}</td></tr>" for item in items)}
                    </tbody>
                </table>
                
                <p class="total">Total: {currency} {order_total:.2f}</p>
                
                {f'''
                <h3>Shipping Address</h3>
                <p>
                    {shipping_address.get('name', '')}<br>
                    {shipping_address.get('address_line1', '')}<br>
                    {f"{shipping_address.get('address_line2', '')}<br>" if shipping_address.get('address_line2') else ''}
                    {shipping_address.get('city', '')}, {shipping_address.get('state', '')} {shipping_address.get('postal_code', '')}<br>
                    {shipping_address.get('country', '')}
                </p>
                ''' if shipping_address else ''}
                
                <p>We'll notify you when your order ships.</p>
            </div>
            <div class="footer">
                <p>© 2024 MnD Business Suite. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    # In production, send via email provider
    # Example with SendGrid:
    # from sendgrid import SendGridAPIClient
    # from sendgrid.helpers.mail import Mail
    # 
    # sg = SendGridAPIClient(os.environ.get('SENDGRID_API_KEY'))
    # message = Mail(
    #     from_email='orders@example.com',
    #     to_emails=to_email,
    #     subject=f'Order Confirmation - {order_no}',
    #     html_content=email_html
    # )
    # response = sg.send(message)
    # return {"status": "sent", "message_id": response.headers.get('X-Message-Id')}
    
    return {
        "status": "sent",
        "message_id": f"placeholder_{datetime.utcnow().timestamp()}",
        "email": to_email,
    }


async def send_order_status_update(
    to_email: str,
    customer_name: str,
    order_no: str,
    status: str,
    status_message: str,
) -> dict:
    """
    Send order status update email (shipping, delivery, cancellation).
    
    Args:
        to_email: Customer email address
        customer_name: Customer's name  
        order_no: Order number
        status: New order status (shipped, delivered, cancelled)
        status_message: Human-readable status message
    """
    status_colors = {
        "shipped": "#3B82F6",  # Blue
        "delivered": "#10B981",  # Green
        "cancelled": "#EF4444",  # Red
        "processing": "#F59E0B",  # Amber
    }
    
    status_subject = {
        "shipped": "Your order has been shipped!",
        "delivered": "Your order has been delivered",
        "cancelled": "Your order has been cancelled",
        "processing": "Your order is being processed",
    }
    
    email_html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: {status_colors.get(status, '#4F46E5')}; color: white; padding: 20px; text-align: center; }}
            .content {{ padding: 20px; background: #f9f9f9; }}
            .footer {{ padding: 20px; text-align: center; color: #666; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>{status_subject.get(status, 'Order Update')}</h1>
            </div>
            <div class="content">
                <p>Hi {customer_name},</p>
                <p>{status_message}</p>
                <p><strong>Order Number:</strong> {order_no}</p>
            </div>
            <div class="footer">
                <p>© 2024 MnD Business Suite. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    print(f"[EMAIL] Order status update to {to_email}: {status}")
    
    return {
        "status": "sent",
        "message_id": f"status_{datetime.utcnow().timestamp()}",
        "email": to_email,
    }
