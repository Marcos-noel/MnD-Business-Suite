from __future__ import annotations

import hashlib
from typing import Any, Callable, Dict, Optional, Tuple

from starlette.requests import Request
from starlette.responses import Response


def default_key_builder(
    func: Callable[..., Any],
    namespace: str = "",
    request: Optional[Request] = None,
    response: Optional[Response] = None,
    args: Tuple[Any, ...] = (),
    kwargs: Dict[str, Any] = None,
) -> str:
    if kwargs is None:
        kwargs = {}
    cache_key = hashlib.md5(  # noqa: S324
        f"{func.__module__}:{func.__name__}:{args}:{kwargs}".encode()
    ).hexdigest()
    return f"{namespace}:{cache_key}"


def org_cache_key_builder(
    func: Any,
    namespace: str,
    request: Any,
    response: Any,
    args: tuple[Any, ...],
    kwargs: dict[str, Any],
) -> str:
    base_key = default_key_builder(func, namespace, request=request, response=response, args=args, kwargs=kwargs)
    auth = kwargs.get("auth")
    org_id = getattr(auth, "org_id", None) if auth else None
    if not org_id:
        return base_key
    return f"{base_key}:org:{org_id}"
