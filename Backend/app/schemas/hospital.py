"""Hospital profile Pydantic schemas."""
from __future__ import annotations

from datetime import date
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class HospitalProfileResponse(BaseModel):
    """Read-only representation of a hospital profile."""

    id: UUID
    hospital_name: str | None = None
    license_number: str | None = None
    address: str | None = None
    city: str | None = None
    departments: list[Any] | dict[str, Any] | None = None
    bed_count: int = 0
    established_date: date | None = None
    website: str | None = None

    model_config = ConfigDict(from_attributes=True)


class HospitalProfileUpdate(BaseModel):
    """Fields a hospital admin can update on the facility profile."""

    hospital_name: str | None = Field(default=None, max_length=255)
    license_number: str | None = Field(default=None, max_length=100)
    address: str | None = None
    city: str | None = Field(default=None, max_length=100)
    departments: list[Any] | dict[str, Any] | None = None
    bed_count: int | None = Field(default=None, ge=0)
    established_date: date | None = None
    website: str | None = Field(default=None, max_length=500)
