from __future__ import annotations

"""
Shustota AI - Auth API Endpoints
POST /auth/register
POST /auth/login
POST /auth/logout
POST /auth/refresh
GET  /auth/me
"""

import logging
from fastapi import APIRouter, Depends, Request, Response
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, EmailStr, field_validator

from app.core.database import get_db
from app.core.config import settings
from app.core.response import success_response, error_response
from app.auth.service import (
    register_user,
    login_user,
    logout_user,
    refresh_access_token,
    get_user_sessions,
    revoke_session,
    change_password,
)
from app.auth.dependencies import get_current_user
from app.models.user import User

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["Authentication"])


# ── Request Schemas ──────────────────────────────────────────────
class RegisterRequest(BaseModel):
    account_type: str  # patient | doctor | hospital
    full_name: str
    email: EmailStr
    phone: str
    password: str
    confirm_password: str
    
    # Patient fields
    date_of_birth: str | None = None
    gender: str | None = None
    
    # Doctor fields
    license_number: str | None = None
    specialty: str | None = None
    
    # Hospital fields
    address: str | None = None


class LoginRequest(BaseModel):
    identifier: str  # email or phone
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str | None = None


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str
    confirm_password: str


# ── Helper: Set Auth Cookies ─────────────────────────────────────
def _set_auth_cookies(response: Response, access_token: str, refresh_token: str):
    """Set secure HTTP-only cookies for tokens."""
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,  # Set to True in production (HTTPS)
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,  # Set to True in production (HTTPS)
        samesite="lax",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
        path="/",
    )


def _clear_auth_cookies(response: Response):
    """Clear auth cookies."""
    response.delete_cookie(key="access_token", path="/")
    response.delete_cookie(key="refresh_token", path="/")


# ══════════════════════════════════════════════════════════════════
#   POST /auth/register
# ══════════════════════════════════════════════════════════════════
@router.post("/register")
async def register(
    body: RegisterRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """
    Register a new user account.
    Automatically logs in the user after registration.
    """
    ip = request.client.host if request.client else None
    ua = request.headers.get("user-agent")

    result = await register_user(
        db=db,
        account_type=body.account_type,
        full_name=body.full_name,
        email=body.email,
        phone=body.phone,
        password=body.password,
        confirm_password=body.confirm_password,
        date_of_birth=body.date_of_birth,
        gender=body.gender,
        license_number=body.license_number,
        specialty=body.specialty,
        address=body.address,
        ip_address=ip,
        user_agent=ua,
    )

    resp = success_response(
        message="Account created successfully",
        data={
            "user": result["user"],
            "access_token": result["access_token"],
            "token_type": "bearer",
        },
        status_code=201,
    )

    # Set cookies
    _set_auth_cookies(resp, result["access_token"], result["refresh_token"])

    return resp


# ══════════════════════════════════════════════════════════════════
#   POST /auth/login
# ══════════════════════════════════════════════════════════════════
@router.post("/login")
async def login(
    body: LoginRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """
    Login with email/phone and password.
    """
    ip = request.client.host if request.client else None
    ua = request.headers.get("user-agent")

    result = await login_user(
        db=db,
        identifier=body.identifier,
        password=body.password,
        ip_address=ip,
        user_agent=ua,
    )

    resp = success_response(
        message="Logged in successfully",
        data={
            "user": result["user"],
            "access_token": result["access_token"],
            "token_type": "bearer",
        },
    )

    _set_auth_cookies(resp, result["access_token"], result["refresh_token"])

    return resp


# ══════════════════════════════════════════════════════════════════
#   POST /auth/logout
# ══════════════════════════════════════════════════════════════════
@router.post("/logout")
async def logout(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Logout - revoke session, clear cookies.
    """
    refresh_token = request.cookies.get("refresh_token")
    ip = request.client.host if request.client else None
    ua = request.headers.get("user-agent")

    await logout_user(
        db=db,
        user_id=current_user.id,
        refresh_token=refresh_token,
        ip_address=ip,
        user_agent=ua,
    )

    resp = success_response(message="Logged out successfully")
    _clear_auth_cookies(resp)

    return resp


# ══════════════════════════════════════════════════════════════════
#   POST /auth/refresh
# ══════════════════════════════════════════════════════════════════
@router.post("/refresh")
async def refresh(
    request: Request,
    body: RefreshRequest | None = None,
    db: AsyncSession = Depends(get_db),
):
    """
    Rotate refresh token and issue new access token.
    Accepts refresh_token from body or cookie.
    """
    token = None
    if body and body.refresh_token:
        token = body.refresh_token
    if not token:
        token = request.cookies.get("refresh_token")

    if not token:
        return error_response("No refresh token provided", status_code=401)

    ip = request.client.host if request.client else None
    ua = request.headers.get("user-agent")

    result = await refresh_access_token(
        db=db,
        refresh_token=token,
        ip_address=ip,
        user_agent=ua,
    )

    resp = success_response(
        message="Token refreshed",
        data={
            "access_token": result["access_token"],
            "token_type": "bearer",
        },
    )

    _set_auth_cookies(resp, result["access_token"], result["refresh_token"])

    return resp


# ══════════════════════════════════════════════════════════════════
#   GET /auth/me
# ══════════════════════════════════════════════════════════════════
@router.get("/me")
async def me(current_user: User = Depends(get_current_user)):
    """Get the currently authenticated user."""
    return success_response(
        message="User fetched",
        data={
            "user": {
                "id": str(current_user.id),
                "email": current_user.email,
                "phone": current_user.phone,
                "full_name": current_user.full_name,
                "role": current_user.role,
                "is_active": current_user.is_active,
                "is_verified": current_user.is_verified,
                "avatar_url": current_user.avatar_url,
                "last_login_at": current_user.last_login_at.isoformat() if current_user.last_login_at else None,
                "created_at": current_user.created_at.isoformat() if current_user.created_at else None,
            }
        },
    )


# ══════════════════════════════════════════════════════════════════
#   GET /auth/sessions
# ══════════════════════════════════════════════════════════════════
@router.get("/sessions")
async def sessions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get all active sessions for the current user."""
    user_sessions = await get_user_sessions(db, current_user.id)
    return success_response(
        message="Sessions fetched",
        data={
            "sessions": [
                {
                    "id": str(s.id),
                    "ip_address": s.ip_address,
                    "device": s.device,
                    "browser": s.browser,
                    "os": s.os,
                    "last_used_at": s.last_used_at.isoformat() if s.last_used_at else None,
                    "created_at": s.created_at.isoformat() if s.created_at else None,
                }
                for s in user_sessions
            ]
        },
    )


# ══════════════════════════════════════════════════════════════════
#   DELETE /auth/sessions/{session_id}
# ══════════════════════════════════════════════════════════════════
@router.delete("/sessions/{session_id}")
async def revoke_user_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Revoke a specific session."""
    import uuid as _uuid
    success = await revoke_session(db, current_user.id, _uuid.UUID(session_id))
    if not success:
        return error_response("Session not found", status_code=404)
    return success_response(message="Session revoked")


# ══════════════════════════════════════════════════════════════════
#   PUT /auth/password
# ══════════════════════════════════════════════════════════════════
@router.put("/password")
async def update_password(
    body: ChangePasswordRequest,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Change the current user's password."""
    ip = request.client.host if request.client else None
    ua = request.headers.get("user-agent")

    await change_password(
        db=db,
        user_id=current_user.id,
        current_password=body.current_password,
        new_password=body.new_password,
        confirm_password=body.confirm_password,
        ip_address=ip,
        user_agent=ua,
    )
    return success_response(message="Password changed successfully")
