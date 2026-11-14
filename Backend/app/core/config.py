from __future__ import annotations
import json
from typing import List, Any
from pydantic import field_validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Oxpecker AI Healthcare API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # JWT Auth
    ENVIRONMENT: str = "development"
    SECRET_KEY: str = ""
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    @field_validator("SECRET_KEY", mode="before")
    @classmethod
    def validate_secret_key(cls, v: Any) -> str:
        val = str(v or "").strip()
        if val:
            return val
        import os
        env_mode = os.getenv("ENVIRONMENT", "development").lower()
        if env_mode not in ("development", "dev", "test"):
            raise ValueError("SECRET_KEY environment variable is required outside development.")
        return "oxpecker-dev-local-jwt-key-do-not-use-in-prod"
    
    CORS_ORIGINS: Any = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://oxpecker-web.azurewebsites.net",
        "https://oxpecker.equisaas-bd.com",
        "https://oxpecker-api.azurewebsites.net"
    ]
    REDIS_URL: str = "redis://localhost:6379/0"

    DATABASE_URL: str = "sqlite:///./oxpecker.db"

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Any) -> List[str]:
        if isinstance(v, list):
            return [str(x) for x in v]
        if isinstance(v, str):
            v = v.strip()
            if v.startswith("[") and v.endswith("]"):
                try:
                    return json.loads(v)
                except Exception:
                    clean = v[1:-1].replace('"', '').replace("'", '')
                    return [x.strip() for x in clean.split(",") if x.strip()]
            return [x.strip() for x in v.split(",") if x.strip()]
        return ["*"]

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        return self.DATABASE_URL

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
