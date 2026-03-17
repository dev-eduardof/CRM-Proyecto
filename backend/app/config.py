import os
from typing import List

_DEFAULT_DATABASE_URL = "mysql+pymysql://crm_user:crm_password@db:3306/crm_talleres"
_DEFAULT_SECRET_KEY = "tu-secret-key-super-segura-cambiala-en-produccion"

try:
    from pydantic_settings import BaseSettings

    class Settings(BaseSettings):
        DATABASE_URL: str = _DEFAULT_DATABASE_URL
        SECRET_KEY: str = _DEFAULT_SECRET_KEY
        ALGORITHM: str = "HS256"
        ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
        BACKEND_CORS_ORIGINS: List[str] = [
            "http://localhost:3000",
            "http://localhost:5173",
            "http://frontend:3000"
        ]
        PROJECT_NAME: str = "CRM Talleres"
        VERSION: str = "1.0.0"
        UPLOAD_DIR: str = "uploads"
        MAX_UPLOAD_SIZE: int = 5 * 1024 * 1024  # 5MB

        model_config = {"env_file": ".env", "extra": "allow"}

    settings = Settings()
except ModuleNotFoundError:
    # Fallback si pydantic-settings no está instalado (ej. imagen Docker antigua)
    class Settings:
        DATABASE_URL: str = os.getenv("DATABASE_URL", _DEFAULT_DATABASE_URL)
        SECRET_KEY: str = os.getenv("SECRET_KEY", _DEFAULT_SECRET_KEY)
        ALGORITHM: str = "HS256"
        ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
        BACKEND_CORS_ORIGINS: List[str] = [
            "http://localhost:3000",
            "http://localhost:5173",
            "http://frontend:3000"
        ]
        PROJECT_NAME: str = "CRM Talleres"
        VERSION: str = "1.0.0"
        UPLOAD_DIR: str = "uploads"
        MAX_UPLOAD_SIZE: int = 5 * 1024 * 1024  # 5MB

    settings = Settings()
