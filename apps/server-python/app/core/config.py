from pydantic_settings import BaseSettings
from typing import List
from pathlib import Path


class Settings(BaseSettings):
    # Environment
    ENVIRONMENT: str = "production"
    PORT: int = 8000

    # Supabase API
    SUPABASE_API_KEY: str = ""
    SUPABASE_PROJECT_ID: str = ""

    # Supabase service settings (server-side)
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""

    # Database - Production
    DATABASE_URL: str = ""  # Base de données principale (supabase - Production)
    XEN_DATABASE_URL: str = ""  # Deuxième base de données (xendb - Production)

    # JWT
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_MINUTES: int = 30 * 24 * 60  # 30 days
    JWT_RESET_TOKEN_MINUTES: int = 15  # 15 minutes for password reset

    # Crypto
    CRYPTO_MASTER_KEY: str

    # Stripe
    STRIPE_SECRET_KEY: str
    STRIPE_WEBHOOK_SECRET: str = ""
    STRIPE_PRICE_PRO: str = ""

    # CORS
    WEB_BASE_URL: str = "http://localhost:5173"
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:5174,https://vault-api-web.vercel.app"

    @property
    def allowed_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]

    class Config:
        # Chemin absolu vers le fichier .env du serveur
        env_file = Path(__file__).parent.parent.parent / ".env"
        case_sensitive = True
        extra = "ignore"


settings = Settings()
