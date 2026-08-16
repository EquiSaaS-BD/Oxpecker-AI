"""Hospital profile database model."""
from __future__ import annotations

import uuid
from datetime import date

from sqlalchemy import Date, ForeignKey, Integer, String, Text, JSON, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class HospitalProfile(Base, TimestampMixin):
    """Extended profile data for users with the 'hospital' role."""

    __tablename__ = "hospital_profiles"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    hospital_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    license_number: Mapped[str | None] = mapped_column(String(100), nullable=True)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    city: Mapped[str | None] = mapped_column(String(100), nullable=True)
    departments: Mapped[dict | list | None] = mapped_column(JSON, nullable=True)
    bed_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    established_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    website: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # ── Relationships ──────────────────────────────────────────────────
    user: Mapped[User] = relationship("User", back_populates="hospital_profile")

    def __repr__(self) -> str:
        return f"<HospitalProfile(id={self.id}, user_id={self.user_id}, name={self.hospital_name})>"
