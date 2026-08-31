"""Patient profile Pydantic schemas."""
from __future__ import annotations

from datetime import date
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class PatientProfileResponse(BaseModel):
    """Read-only representation of a patient profile."""

    id: UUID
    date_of_birth: date | None = None
    blood_group: str | None = None
    height: str | None = None
    weight: str | None = None
    allergies: list[Any] | None = None
    medical_history: list[Any] | None = None
    emergency_contact: str | None = None

    model_config = ConfigDict(from_attributes=True)


class PatientProfileUpdate(BaseModel):
    """Fields a patient can update on their medical profile."""

    date_of_birth: date | None = None
    blood_group: str | None = Field(default=None, max_length=5)
    height: str | None = Field(default=None, max_length=10)
    weight: str | None = Field(default=None, max_length=10)
    allergies: list[Any] | None = None
    medical_history: list[Any] | None = None
    emergency_contact: str | None = Field(default=None, max_length=20)
