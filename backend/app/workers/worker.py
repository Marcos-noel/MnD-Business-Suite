from __future__ import annotations

from redis import Redis
from rq import Connection, Worker

from app.core.config import settings
from app.workers.queue import get_queue


def main() -> None:
    # Worker is optional in local/dev (InlineQueue runs tasks immediately when Redis is down).
    try:
        Redis.from_url(settings.redis_url).ping()
    except Exception:
        print("Redis is not reachable; worker not started (InlineQueue will run tasks inline).")
        return

    q = get_queue()
    with Connection(q.connection):
        Worker([q]).work(with_scheduler=True)


if __name__ == "__main__":
    main()
