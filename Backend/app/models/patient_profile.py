"""Patient profile database model."""
from __future__ import annotations

import uuid
from datetime import date

from sqlalchemy import Boolean, Date, ForeignKey, String, JSON, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class PatientProfile(Base, TimestampMixin):
    """Extended profile data for users with the 'patient' role."""

    __tablename__ = "patient_profiles"

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
    date_of_birth: Mapped[date | None] = mapped_column(Date, nullable=True)
    gender: Mapped[str | None] = mapped_column(String(20), nullable=True)
    blood_group: Mapped[str | None] = mapped_column(String(5), nullable=True)
    height: Mapped[str | None] = mapped_column(String(10), nullable=True)
    weight: Mapped[str | None] = mapped_column(String(10), nullable=True)
    allergies: Mapped[dict | list | None] = mapped_column(JSON, nullable=True)
    medical_history: Mapped[dict | list | None] = mapped_column(JSON, nullable=True)
    emergency_contact: Mapped[str | None] = mapped_column(String(20), nullable=True)

    # ── Relationships ──────────────────────────────────────────────────
    user: Mapped[User] = relationship("User", back_populates="patient_profile")

    def __repr__(self) -> str:
        return f"<PatientProfile(id={self.id}, user_id={self.user_id})>"
