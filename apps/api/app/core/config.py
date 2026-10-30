import os

from pydantic_settings import BaseSettings, SettingsConfigDict

# APP_ENV picks the env file: .env.development (default), .env.production, ...
# Real environment variables always win over files. .env.local is for personal overrides.
APP_ENV = os.getenv("APP_ENV", "development")


class Settings(BaseSettings):
    # Paths are relative to apps/api (where uvicorn, alembic and pytest run). Later files win.
    model_config = SettingsConfigDict(env_file=(f".env.{APP_ENV}", ".env.local"), extra="ignore")

    # No defaults on purpose: a missing value must stop the API at startup,
    # not silently fall back to localhost.
    database_url: str
    # Comma-separated string: env vars cannot hold a list without JSON.
    cors_origins: str

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()
