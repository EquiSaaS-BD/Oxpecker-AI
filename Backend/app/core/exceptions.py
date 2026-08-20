from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from app.core.logging import get_logger

logger = get_logger(__name__)

class AppException(Exception):
    status_code: int = 400
    def __init__(self, message: str = "An error occurred.", status_code: int | None = None, errors: list[Any] | None = None) -> None:
        super().__init__(message)
        if status_code is not None:
            self.status_code = status_code
        self.message = message
        self.errors = errors or []

class AuthenticationError(AppException): status_code = 401
class AuthorizationError(AppException): status_code = 403
class NotFoundError(AppException): status_code = 404
class ConflictError(AppException): status_code = 409
class ValidationError(AppException): status_code = 422

def _envelope(success: bool, message: str, status_code: int, errors: list[Any] | None = None) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={
            "success": success,
            "message": message,
            "data": None,
            "errors": errors or [],
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "request_id": str(uuid.uuid4()),
        },
    )

def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppException)
    async def _app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
        logger.warning(f"AppException | {exc.status_code} | {exc.message} | {request.url}")
        return _envelope(success=False, message=exc.message, status_code=exc.status_code, errors=exc.errors)

    @app.exception_handler(RequestValidationError)
    async def _validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
        errors = [{"field": "->".join(str(l) for l in err.get("loc", [])), "message": err.get("msg", "")} for err in exc.errors()]
        return _envelope(success=False, message="Request validation failed.", status_code=422, errors=errors)

    @app.exception_handler(Exception)
    async def _generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        logger.exception(f"Unhandled exception at {request.url}")
        return _envelope(success=False, message="An unexpected error occurred.", status_code=500)
