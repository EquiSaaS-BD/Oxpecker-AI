"""Doctor profile database model."""
from __future__ import annotations

import uuid

from sqlalchemy import Boolean, Float, ForeignKey, Integer, String, Text, JSON, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class DoctorProfile(Base, TimestampMixin):
    """Extended profile data for users with the 'doctor' role."""

    __tablename__ = "doctor_profiles"

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
    specialty: Mapped[str | None] = mapped_column(String(255), nullable=True)
    specialty_en: Mapped[str | None] = mapped_column(String(255), nullable=True)
    qualification: Mapped[str | None] = mapped_column(String(500), nullable=True)
    experience_years: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    hospital_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    hospital_name_en: Mapped[str | None] = mapped_column(String(255), nullable=True)
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    location_en: Mapped[str | None] = mapped_column(String(255), nullable=True)
    consultation_fee: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    schedule: Mapped[dict | list | None] = mapped_column(JSON, nullable=True)
    education: Mapped[dict | list | None] = mapped_column(JSON, nullable=True)
    memberships: Mapped[dict | list | None] = mapped_column(JSON, nullable=True)
    rating: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    review_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    satisfaction: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_available: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    license_number: Mapped[str | None] = mapped_column(String(100), nullable=True)

    # ── Relationships ──────────────────────────────────────────────────
    user: Mapped[User] = relationship("User", back_populates="doctor_profile")

    def __repr__(self) -> str:
        return f"<DoctorProfile(id={self.id}, user_id={self.user_id}, specialty={self.specialty})>"
