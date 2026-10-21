from __future__ import annotations

"""
Oxpecker AI - Main Application Entry Point
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.logging import setup_logging, get_logger
from app.core.exceptions import register_exception_handlers
from app.core.redis import init_redis
from app.core.database import engine

# Import routers
from app.api.v1 import auth, health, profile, healthpass, clinical_ai

setup_logging()
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle events."""
    logger.info(f"Starting {settings.PROJECT_NAME} v{settings.VERSION}")
    
    # Initialize Redis (with graceful fallback if not present)
    await init_redis()
    
    # Auto-create database tables if not existing
    try:
        from app.models.base import Base
        Base.metadata.create_all(bind=engine)
        logger.info("Database schemas initialized.")
    except Exception as e:
        logger.warning(f"Database schema auto-init warning: {e}")

    yield
    
    # Cleanup
    logger.info("Shutting down application...")
    try:
        await engine.dispose()
    except Exception:
        pass


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan,
    default_response_class=JSONResponse,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception Handlers
register_exception_handlers(app)

# Root probes for Azure App Service & Health Monitors
@app.get("/")
async def root():
    return {
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "docs": "/docs",
        "api_v1": settings.API_V1_STR,
    }

@app.get("/health")
async def root_health():
    return {
        "status": "healthy",
        "service": "oxpecker-api",
        "version": settings.VERSION,
    }

# API v1 Routers
app.include_router(health.router, prefix=settings.API_V1_STR)
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(profile.router, prefix=settings.API_V1_STR)
app.include_router(healthpass.router, prefix=settings.API_V1_STR)
app.include_router(clinical_ai.router, prefix=settings.API_V1_STR)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
