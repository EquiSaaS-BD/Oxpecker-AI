"""Session database model for refresh token management."""
from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class Session(Base, TimestampMixin):
    """User session database model for tracking refresh tokens."""

    __tablename__ = "sessions"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    refresh_token: Mapped[str] = mapped_column(
        String(500),
        unique=True,
        nullable=False,
    )
    ip_address: Mapped[str | None] = mapped_column(String(45), nullable=True)
    user_agent: Mapped[str | None] = mapped_column(Text, nullable=True)
    device: Mapped[str | None] = mapped_column(String(100), nullable=True)
    browser: Mapped[str | None] = mapped_column(String(100), nullable=True)
    os: Mapped[str | None] = mapped_column(String(100), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )
    last_used_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # ── Relationships ──────────────────────────────────────────────────
    user: Mapped[User] = relationship("User", back_populates="sessions")

    def __repr__(self) -> str:
        return f"<Session(id={self.id}, user_id={self.user_id}, active={self.is_active})>"
