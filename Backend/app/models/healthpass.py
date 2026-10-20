"""Emergency HealthPass and Biometric database models."""
from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, JSON, String, Text, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class HealthPassCard(Base, TimestampMixin):
    """
    Centralized Smart Emergency HealthPass Card Registry.
    Stores vital triage data, emergency contacts, and authentication hashes.
    """

    __tablename__ = "health_pass_cards"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    patient_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        index=True,
        nullable=False,
    )
    card_number: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        index=True,
        nullable=False,
        comment="Public card number e.g. HP-2026-94821",
    )
    is_activated: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    
    # Critical Triage Data
    blood_group: Mapped[str | None] = mapped_column(String(10), nullable=True, index=True)
    date_of_birth: Mapped[str | None] = mapped_column(String(30), nullable=True)
    gender: Mapped[str | None] = mapped_column(String(20), nullable=True)
    allergies: Mapped[dict | list | None] = mapped_column(JSON, nullable=True)
    chronic_conditions: Mapped[dict | list | None] = mapped_column(JSON, nullable=True)
    critical_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    organ_donor: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    
    # Dual Emergency Contact Channels
    personal_phone: Mapped[str | None] = mapped_column(String(30), nullable=True, index=True)
    parent_phone: Mapped[str | None] = mapped_column(String(30), nullable=True, index=True)
    has_personal_whatsapp: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    has_parent_whatsapp: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    
    # Cryptographic / Hardware Identifiers
    qr_signature: Mapped[str | None] = mapped_column(String(512), nullable=True)
    nfc_uid: Mapped[str | None] = mapped_column(String(100), nullable=True, unique=True, index=True)
    emergency_passcode_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # Relationships
    user = relationship("User", back_populates="health_pass_card")
    biometric = relationship(
        "PatientBiometric",
        primaryjoin="HealthPassCard.patient_id == foreign(PatientBiometric.patient_id)",
        uselist=False,
        viewonly=True,
    )
    access_logs = relationship(
        "EmergencyAccessLog",
        primaryjoin="HealthPassCard.card_number == foreign(EmergencyAccessLog.card_number)",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<HealthPassCard(card_number={self.card_number}, patient_id={self.patient_id})>"


class PatientBiometric(Base):
    """
    Biometric Facial Vectors for Instant ER Identification.
    Stores normalized 128D/512D facial embedding vectors.
    """

    __tablename__ = "patient_biometrics"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    patient_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        index=True,
        nullable=False,
    )
    face_vector: Mapped[list[float]] = mapped_column(
        JSON,
        nullable=False,
        comment="Normalized 128D/512D facial embedding vector",
    )
    photo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    quality_score: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    registered_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        onupdate=func.now(),
        nullable=True,
    )

    # Relationships
    user = relationship("User", back_populates="biometric")

    def __repr__(self) -> str:
        return f"<PatientBiometric(patient_id={self.patient_id}, quality={self.quality_score})>"


class EmergencyAccessLog(Base):
    """
    Immutable ER 'Break-Glass' and Search Audit Trail.
    Logs every doctor and hospital emergency lookup for legal accountability.
    """

    __tablename__ = "emergency_access_logs"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    card_number: Mapped[str] = mapped_column(
        String(50),
        index=True,
        nullable=False,
    )
    accessed_by_user_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    accessor_name: Mapped[str] = mapped_column(String(255), nullable=False)
    accessor_role: Mapped[str] = mapped_column(String(50), nullable=False)  # doctor / hospital
    accessor_license: Mapped[str | None] = mapped_column(String(100), nullable=True)
    hospital_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    access_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        comment="SEARCH | FACE_MATCH | QR_SCAN | BREAK_GLASS",
    )
    reason: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        comment="Clinical or emergency justification",
    )
    patient_notified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    ip_address: Mapped[str | None] = mapped_column(String(50), nullable=True)
    accessed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    def __repr__(self) -> str:
        return f"<EmergencyAccessLog(card={self.card_number}, type={self.access_type}, by={self.accessor_name})>"
