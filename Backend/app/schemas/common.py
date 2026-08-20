"""Common / shared Pydantic schemas used across the application."""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Generic, TypeVar
from uuid import uuid4

from pydantic import BaseModel, Field

T = TypeVar("T")


class APIResponse(BaseModel, Generic[T]):
    """Standard API response envelope used for every endpoint.

    Wraps data with metadata so clients get a consistent shape.
    """

    success: bool
    message: str
    data: T | None = None
    errors: list[str] = Field(default_factory=list)
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    request_id: str = Field(default_factory=lambda: uuid4().hex)


class PaginationParams(BaseModel):
    """Query parameters for paginated list endpoints."""

    page: int = Field(default=1, ge=1, description="Page number (1-indexed)")
    per_page: int = Field(default=20, ge=1, le=100, description="Items per page")


class PaginatedResponse(BaseModel, Generic[T]):
    """Response wrapper for paginated data."""

    items: list[T]
    total: int
    page: int
    per_page: int
    total_pages: int
