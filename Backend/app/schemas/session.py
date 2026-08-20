"""Session Pydantic schemas."""
from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class SessionResponse(BaseModel):
    """Read-only representation of an active session."""

    id: UUID
    ip_address: str | None = None
    device: str | None = None
    browser: str | None = None
    os: str | None = None
    is_active: bool
    last_used_at: datetime | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
