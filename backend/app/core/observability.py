from __future__ import annotations

import logging
import time
import uuid

from fastapi import FastAPI, Request
from starlette.responses import Response

from app.core.config import settings


logger = logging.getLogger("mnd")


def init_logging() -> None:
    logging.basicConfig(
        level=getattr(logging, settings.log_level.upper(), logging.INFO),
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
    )


def install_request_logging(app: FastAPI) -> None:
    @app.middleware("http")
    async def _request_context(request: Request, call_next) -> Response:
        request_id = request.headers.get("x-request-id") or str(uuid.uuid4())
        request.state.request_id = request_id
        started = time.perf_counter()
        response: Response = await call_next(request)
        elapsed_ms = (time.perf_counter() - started) * 1000
        logger.info(
            "request",
            extra={
                "request_id": request_id,
                "method": request.method,
                "path": request.url.path,
                "status_code": response.status_code,
                "elapsed_ms": round(elapsed_ms, 2),
            },
        )
        response.headers["X-Request-ID"] = request_id
        return response
