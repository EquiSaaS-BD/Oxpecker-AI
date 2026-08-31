"""Authentication Pydantic schemas."""
from __future__ import annotations

import re
from typing import Literal

from pydantic import BaseModel, EmailStr, Field, model_validator

from app.schemas.user import UserResponse


class RegisterRequest(BaseModel):
    """Payload for new user registration."""

    account_type: Literal["patient", "doctor", "hospital"]
    full_name: str = Field(..., min_length=2, max_length=255)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=20)
    password: str = Field(..., min_length=8)
    confirm_password: str = Field(..., min_length=8)

    @model_validator(mode="after")
    def validate_passwords(self) -> RegisterRequest:
        """Ensure passwords match and meet complexity requirements."""
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match")

        pwd = self.password
        if not re.search(r"[A-Z]", pwd):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", pwd):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"\d", pwd):
            raise ValueError("Password must contain at least one digit")
        if not re.search(r"[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>\/?]", pwd):
            raise ValueError("Password must contain at least one special character")

        return self


class LoginRequest(BaseModel):
    """Payload for user login (accepts email or phone as identifier)."""

    identifier: str = Field(
        ...,
        min_length=1,
        description="User email address or phone number",
    )
    password: str = Field(..., min_length=1)


class AuthResponse(BaseModel):
    """Successful authentication response containing user data and tokens."""

    user: UserResponse
    access_token: str
    token_type: str = "bearer"


class TokenResponse(BaseModel):
    """Lightweight token-only response (used for refresh flows)."""

    access_token: str
    token_type: str = "bearer"


class ForgotPasswordRequest(BaseModel):
    """Payload to initiate a password-reset email."""

    email: EmailStr


class ResetPasswordRequest(BaseModel):
    """Payload to complete a password reset using a token."""

    token: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=8)
    confirm_password: str = Field(..., min_length=8)

    @model_validator(mode="after")
    def validate_passwords(self) -> ResetPasswordRequest:
        """Ensure new password and confirm password match."""
        if self.new_password != self.confirm_password:
            raise ValueError("Passwords do not match")
        return self
