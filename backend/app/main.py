from __future__ import annotations

import asyncio

from fastapi import FastAPI
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router_v1
from app.api.v1.routes import health
from app.core.cache import init_cache
from app.core.config import settings
from app.core.db import init_models
from app.core.errors import install_exception_handlers
from app.core.observability import init_logging, install_request_logging
from app.core.rate_limit import init_rate_limiting
from app.core.security_headers import SecurityHeadersMiddleware
from app.core.subscribers import init_subscribers
from app.core.fx_cache import start_fx_refresh_loop


def create_app() -> FastAPI:
    init_logging()
    app = FastAPI(
        title=settings.app_name,
        debug=settings.debug,
        openapi_url=f"{settings.api_v1_prefix}/openapi.json",
        docs_url=f"{settings.api_v1_prefix}/docs",
        redoc_url=f"{settings.api_v1_prefix}/redoc",
    )

    allowed_origins = [o.strip() for o in settings.allowed_origins.split(",") if o.strip()]
    allow_credentials = True
    if any(o == "*" for o in allowed_origins):
        # Never allow cookies/credentials with wildcard CORS.
        allow_credentials = False
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins or ["http://localhost:3000"],
        allow_credentials=allow_credentials,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.add_middleware(SecurityHeadersMiddleware)
    app.add_middleware(GZipMiddleware, minimum_size=800)

    init_rate_limiting(app)
    install_request_logging(app)
    install_exception_handlers(app)
    app.include_router(api_router_v1, prefix=settings.api_v1_prefix)
    # Convenience endpoints for probes / developers (keep v1 canonical).
    app.include_router(health.router, tags=["health"])
    init_subscribers()

    @app.on_event("startup")
    async def _startup() -> None:
        await init_models()
        await init_cache()
        app.state.fx_task = asyncio.create_task(start_fx_refresh_loop())

    @app.get("/")
    async def _root() -> dict:
        return {
            "name": settings.app_name,
            "api_base": settings.api_v1_prefix,
            "docs": f"{settings.api_v1_prefix}/docs",
            "health": "/health",
        }

    return app


app = create_app()
