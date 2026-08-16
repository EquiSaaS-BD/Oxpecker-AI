from __future__ import annotations

"""
Shustota AI - Authentication Service
Handles registration, login, logout, token refresh, and session management.
"""

import uuid
import logging
from datetime import datetime, timezone, timedelta

from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.core.exceptions import (
    AuthenticationError,
    ConflictError,
    ValidationError,
    NotFoundError,
)
from app.models.user import User
from app.models.patient_profile import PatientProfile
from app.models.doctor_profile import DoctorProfile
from app.models.hospital_profile import HospitalProfile
from app.models.session import Session
from app.models.audit_log import AuditLog

logger = logging.getLogger(__name__)


# ── Password Policy ──────────────────────────────────────────────
def validate_password(password: str) -> list[str]:
    """Validate password against security policy. Returns list of errors."""
    errors = []
    if len(password) < 8:
        errors.append("Password must be at least 8 characters")
    if not any(c.isupper() for c in password):
        errors.append("Password must contain at least one uppercase letter")
    if not any(c.islower() for c in password):
        errors.append("Password must contain at least one lowercase letter")
    if not any(c.isdigit() for c in password):
        errors.append("Password must contain at least one number")
    if not any(c in "!@#$%^&*(),.?\":{}|<>-_=+[]\\;'/`~" for c in password):
        errors.append("Password must contain at least one special character")
    return errors


# ── User Agent Parsing (lightweight) ─────────────────────────────
def parse_user_agent(ua: str | None) -> dict:
    """Extract device, browser, OS from user-agent string."""
    if not ua:
        return {"device": "Unknown", "browser": "Unknown", "os": "Unknown"}

    # Simple detection
    browser = "Unknown"
    if "Chrome" in ua and "Edg" not in ua:
        browser = "Chrome"
    elif "Firefox" in ua:
        browser = "Firefox"
    elif "Safari" in ua and "Chrome" not in ua:
        browser = "Safari"
    elif "Edg" in ua:
        browser = "Edge"

    os_name = "Unknown"
    if "Windows" in ua:
        os_name = "Windows"
    elif "Mac OS" in ua or "Macintosh" in ua:
        os_name = "macOS"
    elif "Linux" in ua:
        os_name = "Linux"
    elif "Android" in ua:
        os_name = "Android"
    elif "iPhone" in ua or "iPad" in ua:
        os_name = "iOS"

    device = "Desktop"
    if "Mobile" in ua or "Android" in ua or "iPhone" in ua:
        device = "Mobile"
    elif "Tablet" in ua or "iPad" in ua:
        device = "Tablet"

    return {"device": device, "browser": browser, "os": os_name}


# ── Create Session ───────────────────────────────────────────────
async def _create_session(
    db: AsyncSession,
    user_id: uuid.UUID,
    refresh_token: str,
    ip_address: str | None,
    user_agent: str | None,
) -> Session:
    """Create a new session record."""
    ua_info = parse_user_agent(user_agent)
    session = Session(
        id=uuid.uuid4(),
        user_id=user_id,
        refresh_token=refresh_token,
        ip_address=ip_address,
        user_agent=user_agent,
        device=ua_info["device"],
        browser=ua_info["browser"],
        os=ua_info["os"],
        is_active=True,
        expires_at=datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        last_used_at=datetime.now(timezone.utc),
    )
    db.add(session)
    return session


# ── Audit Log ────────────────────────────────────────────────────
async def _create_audit_log(
    db: AsyncSession,
    user_id: uuid.UUID | None,
    action: str,
    details: dict | None = None,
    ip_address: str | None = None,
    user_agent: str | None = None,
):
    """Record an audit log entry."""
    log = AuditLog(
        id=uuid.uuid4(),
        user_id=user_id,
        action=action,
        details=details,
        ip_address=ip_address,
        user_agent=user_agent,
    )
    db.add(log)


# ══════════════════════════════════════════════════════════════════
#   REGISTER
# ══════════════════════════════════════════════════════════════════
async def register_user(
    db: AsyncSession,
    account_type: str,
    full_name: str,
    email: str,
    phone: str,
    password: str,
    confirm_password: str,
    date_of_birth: str | None = None,
    gender: str | None = None,
    license_number: str | None = None,
    specialty: str | None = None,
    address: str | None = None,
    ip_address: str | None = None,
    user_agent: str | None = None,
) -> dict:
    """
    Register a new user.
    1. Validate inputs
    2. Check duplicate email/phone
    3. Hash password
    4. Create user + role-specific profile
    5. Generate tokens + session
    6. Audit log
    """
    # ── Validate ──
    if account_type not in ("patient", "doctor", "hospital"):
        raise ValidationError("Invalid account type", errors=["account_type must be patient, doctor, or hospital"])

    if password != confirm_password:
        raise ValidationError("Passwords do not match")

    password_errors = validate_password(password)
    if password_errors:
        raise ValidationError("Password does not meet requirements", errors=password_errors)

    if not full_name or len(full_name.strip()) < 2:
        raise ValidationError("Full name must be at least 2 characters")

    if not phone or len(phone.strip()) < 10:
        raise ValidationError("Phone number must be at least 10 digits")

    # ── Check Duplicates ──
    existing = await db.execute(
        select(User).where(or_(User.email == email.lower().strip(), User.phone == phone.strip()))
    )
    if existing.scalar_one_or_none():
        raise ConflictError("An account with this email or phone already exists")

    # ── Create User ──
    user_id = uuid.uuid4()
    hashed = get_password_hash(password)

    user = User(
        id=user_id,
        email=email.lower().strip(),
        phone=phone.strip(),
        full_name=full_name.strip(),
        hashed_password=hashed,
        role=account_type,
        is_active=True,
        is_verified=False,
        last_login_at=datetime.now(timezone.utc),
    )
    db.add(user)

    # ── Parse DOB ──
    parsed_dob = None
    if date_of_birth:
        try:
            parsed_dob = datetime.strptime(date_of_birth, "%Y-%m-%d").date()
        except ValueError:
            pass

    # ── Create Role-Specific Profile ──
    if account_type == "patient":
        profile = PatientProfile(
            id=uuid.uuid4(), 
            user_id=user_id,
            date_of_birth=parsed_dob,
            gender=gender
        )
        db.add(profile)
    elif account_type == "doctor":
        profile = DoctorProfile(
            id=uuid.uuid4(), 
            user_id=user_id,
            license_number=license_number,
            specialty=specialty
        )
        db.add(profile)
    elif account_type == "hospital":
        profile = HospitalProfile(
            id=uuid.uuid4(), 
            user_id=user_id,
            hospital_name=full_name.strip(),
            license_number=license_number,
            address=address
        )
        db.add(profile)

    # ── Generate Tokens ──
    access_token = create_access_token(subject=str(user_id), data={"role": account_type})
    refresh_token = create_refresh_token(subject=str(user_id))

    # ── Create Session ──
    await _create_session(db, user_id, refresh_token, ip_address, user_agent)

    # ── Audit Log ──
    await _create_audit_log(
        db, user_id, "USER_REGISTERED",
        details={"role": account_type, "email": email},
        ip_address=ip_address, user_agent=user_agent,
    )
    await _create_audit_log(
        db, user_id, "USER_LOGIN",
        details={"method": "auto_after_register"},
        ip_address=ip_address, user_agent=user_agent,
    )

    await db.commit()
    await db.refresh(user)

    logger.info(f"User registered: {email} as {account_type}")

    return {
        "user": {
            "id": str(user.id),
            "email": user.email,
            "phone": user.phone,
            "full_name": user.full_name,
            "role": user.role,
            "is_active": user.is_active,
            "is_verified": user.is_verified,
            "avatar_url": user.avatar_url,
            "last_login_at": user.last_login_at.isoformat() if user.last_login_at else None,
            "created_at": user.created_at.isoformat() if user.created_at else None,
        },
        "access_token": access_token,
        "refresh_token": refresh_token,
    }


# ══════════════════════════════════════════════════════════════════
#   LOGIN
# ══════════════════════════════════════════════════════════════════
async def login_user(
    db: AsyncSession,
    identifier: str,
    password: str,
    ip_address: str | None = None,
    user_agent: str | None = None,
) -> dict:
    """
    Authenticate a user by email or phone + password.
    """
    identifier = identifier.strip().lower()

    # ── Find User ──
    result = await db.execute(
        select(User).where(
            or_(User.email == identifier, User.phone == identifier)
        )
    )
    user = result.scalar_one_or_none()

    if not user:
        raise AuthenticationError("Invalid email/phone or password")

    if not verify_password(password, user.hashed_password):
        await _create_audit_log(
            db, user.id, "LOGIN_FAILED",
            details={"reason": "invalid_password"},
            ip_address=ip_address, user_agent=user_agent,
        )
        await db.commit()
        raise AuthenticationError("Invalid email/phone or password")

    if not user.is_active:
        raise AuthenticationError("Your account has been deactivated. Please contact support.")

    # ── Generate Tokens ──
    access_token = create_access_token(subject=str(user.id), data={"role": user.role})
    refresh_token = create_refresh_token(subject=str(user.id))

    # ── Update User ──
    user.last_login_at = datetime.now(timezone.utc)

    # ── Create Session ──
    await _create_session(db, user.id, refresh_token, ip_address, user_agent)

    # ── Audit Log ──
    await _create_audit_log(
        db, user.id, "USER_LOGIN",
        details={"method": "credentials"},
        ip_address=ip_address, user_agent=user_agent,
    )

    await db.commit()
    await db.refresh(user)

    logger.info(f"User logged in: {user.email}")

    return {
        "user": {
            "id": str(user.id),
            "email": user.email,
            "phone": user.phone,
            "full_name": user.full_name,
            "role": user.role,
            "is_active": user.is_active,
            "is_verified": user.is_verified,
            "avatar_url": user.avatar_url,
            "last_login_at": user.last_login_at.isoformat() if user.last_login_at else None,
            "created_at": user.created_at.isoformat() if user.created_at else None,
        },
        "access_token": access_token,
        "refresh_token": refresh_token,
    }


# ══════════════════════════════════════════════════════════════════
#   LOGOUT
# ══════════════════════════════════════════════════════════════════
async def logout_user(
    db: AsyncSession,
    user_id: uuid.UUID,
    refresh_token: str | None = None,
    ip_address: str | None = None,
    user_agent: str | None = None,
):
    """Revoke session and log the action."""
    if refresh_token:
        result = await db.execute(
            select(Session).where(
                Session.refresh_token == refresh_token,
                Session.user_id == user_id,
                Session.is_active == True,
            )
        )
        session = result.scalar_one_or_none()
        if session:
            session.is_active = False

    await _create_audit_log(
        db, user_id, "USER_LOGOUT",
        ip_address=ip_address, user_agent=user_agent,
    )
    await db.commit()
    logger.info(f"User logged out: {user_id}")


# ══════════════════════════════════════════════════════════════════
#   REFRESH TOKEN
# ══════════════════════════════════════════════════════════════════
async def refresh_access_token(
    db: AsyncSession,
    refresh_token: str,
    ip_address: str | None = None,
    user_agent: str | None = None,
) -> dict:
    """
    Rotate refresh token and issue new access token.
    """
    # ── Decode Token ──
    try:
        payload = decode_token(refresh_token)
        user_id = payload.get("sub")
        if not user_id:
            raise AuthenticationError("Invalid refresh token")
    except Exception:
        raise AuthenticationError("Invalid or expired refresh token")

    # ── Validate Session ──
    result = await db.execute(
        select(Session).where(
            Session.refresh_token == refresh_token,
            Session.is_active == True,
        )
    )
    session = result.scalar_one_or_none()

    if not session:
        raise AuthenticationError("Session not found or expired. Please log in again.")

    if session.expires_at < datetime.now(timezone.utc):
        session.is_active = False
        await db.commit()
        raise AuthenticationError("Refresh token has expired. Please log in again.")

    # ── Get User ──
    result = await db.execute(select(User).where(User.id == uuid.UUID(user_id)))
    user = result.scalar_one_or_none()

    if not user or not user.is_active:
        raise AuthenticationError("User not found or inactive")

    # ── Rotate Tokens ──
    new_access_token = create_access_token(subject=str(user.id), data={"role": user.role})
    new_refresh_token = create_refresh_token(subject=str(user.id))

    # Invalidate old session, create new one
    session.is_active = False

    await _create_session(db, user.id, new_refresh_token, ip_address, user_agent)

    session_obj = await db.execute(
        select(Session).where(Session.refresh_token == new_refresh_token)
    )

    await db.commit()

    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
    }


# ══════════════════════════════════════════════════════════════════
#   GET CURRENT USER
# ══════════════════════════════════════════════════════════════════
async def get_user_by_id(db: AsyncSession, user_id: uuid.UUID) -> User | None:
    """Fetch user by ID."""
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


# ══════════════════════════════════════════════════════════════════
#   GET USER SESSIONS
# ══════════════════════════════════════════════════════════════════
async def get_user_sessions(db: AsyncSession, user_id: uuid.UUID) -> list[Session]:
    """Get all active sessions for a user."""
    result = await db.execute(
        select(Session).where(
            Session.user_id == user_id,
            Session.is_active == True,
        ).order_by(Session.last_used_at.desc())
    )
    return list(result.scalars().all())


# ══════════════════════════════════════════════════════════════════
#   REVOKE SESSION
# ══════════════════════════════════════════════════════════════════
async def revoke_session(
    db: AsyncSession,
    user_id: uuid.UUID,
    session_id: uuid.UUID,
) -> bool:
    """Revoke a specific session."""
    result = await db.execute(
        select(Session).where(
            Session.id == session_id,
            Session.user_id == user_id,
            Session.is_active == True,
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        return False
    session.is_active = False
    await db.commit()
    return True


# ══════════════════════════════════════════════════════════════════
#   CHANGE PASSWORD
# ══════════════════════════════════════════════════════════════════
async def change_password(
    db: AsyncSession,
    user_id: uuid.UUID,
    current_password: str,
    new_password: str,
    confirm_password: str,
    ip_address: str | None = None,
    user_agent: str | None = None,
):
    """Change user password. Validates current password first."""
    if new_password != confirm_password:
        raise ValidationError("New passwords do not match")

    password_errors = validate_password(new_password)
    if password_errors:
        raise ValidationError("New password does not meet requirements", errors=password_errors)

    user = await get_user_by_id(db, user_id)
    if not user:
        raise NotFoundError("User not found")

    if not verify_password(current_password, user.hashed_password):
        raise AuthenticationError("Current password is incorrect")

    user.hashed_password = get_password_hash(new_password)

    await _create_audit_log(
        db, user_id, "PASSWORD_CHANGED",
        ip_address=ip_address, user_agent=user_agent,
    )

    await db.commit()
    logger.info(f"Password changed for user: {user.email}")
