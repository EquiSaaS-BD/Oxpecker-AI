from __future__ import annotations

"""
Shustota AI - Auth Dependencies
FastAPI dependency injection for authentication and RBAC.
"""

import uuid
import logging
from functools import wraps

from fastapi import Depends, Request, Cookie
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.config import settings
from app.core.database import get_db
from app.core.security import decode_token
from app.core.exceptions import AuthenticationError, AuthorizationError
from app.models.user import User

logger = logging.getLogger(__name__)

# Bearer token scheme (optional - allows both cookie and header auth)
security = HTTPBearer(auto_error=False)


async def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    Extract and validate JWT from:
    1. Authorization: Bearer <token> header (priority)
    2. access_token cookie (fallback)

    Returns the authenticated User object.
    """
    token = None

    # Try header first
    if credentials:
        token = credentials.credentials

    # Fallback to cookie
    if not token:
        token = request.cookies.get("access_token")

    if not token:
        raise AuthenticationError("Not authenticated. Please log in.")

    try:
        payload = decode_token(token)
        user_id = payload.get("sub")
        if not user_id:
            raise AuthenticationError("Invalid authentication token")
    except AuthenticationError:
        raise
    except Exception:
        raise AuthenticationError("Invalid or expired authentication token")

    # Fetch user from DB
    result = await db.execute(select(User).where(User.id == uuid.UUID(user_id)))
    user = result.scalar_one_or_none()

    if not user:
        raise AuthenticationError("User not found")

    if not user.is_active:
        raise AuthenticationError("Your account has been deactivated")

    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """Ensure the user is active."""
    if not current_user.is_active:
        raise AuthenticationError("Your account has been deactivated")
    return current_user


class RoleChecker:
    """
    RBAC dependency. Use as:
        Depends(RoleChecker(["patient"]))
        Depends(RoleChecker(["doctor", "hospital"]))
    """

    def __init__(self, allowed_roles: list[str]):
        self.allowed_roles = allowed_roles

    async def __call__(self, current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in self.allowed_roles:
            raise AuthorizationError(
                f"Access denied. Required role(s): {', '.join(self.allowed_roles)}"
            )
        return current_user


# Convenience dependencies
require_patient = RoleChecker(["patient"])
require_doctor = RoleChecker(["doctor"])
require_hospital = RoleChecker(["hospital"])
require_doctor_or_hospital = RoleChecker(["doctor", "hospital"])
require_any_role = RoleChecker(["patient", "doctor", "hospital"])
