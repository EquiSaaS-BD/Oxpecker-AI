from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any
from fastapi.responses import JSONResponse

def success_response(message: str, data: Any = None, status_code: int = 200) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={
            "success": True,
            "message": message,
            "data": data,
            "errors": [],
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "request_id": str(uuid.uuid4()),
        }
    )

def error_response(message: str, errors: list[Any] | None = None, status_code: int = 400) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={
            "success": False,
            "message": message,
            "data": None,
            "errors": errors or [],
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "request_id": str(uuid.uuid4()),
        }
    )
