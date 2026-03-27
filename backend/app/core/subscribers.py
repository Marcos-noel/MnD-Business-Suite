from __future__ import annotations

from app.core.events import Event, event_bus
from app.workers.queue import get_queue


async def _enqueue_notification(event: Event) -> None:
    q = get_queue()
    q.enqueue("app.workers.tasks.send_notification", event.name, event.payload)


def init_subscribers() -> None:
    event_bus.subscribe("commerce.order_created", _enqueue_notification)
    event_bus.subscribe("commerce.order_paid", _enqueue_notification)
    event_bus.subscribe("exports.order_created", _enqueue_notification)
    event_bus.subscribe("exports.shipment_created", _enqueue_notification)
    event_bus.subscribe("finance.payment_collected", _enqueue_notification)

