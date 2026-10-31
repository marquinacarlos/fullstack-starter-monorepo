import os

from pydantic import field_validator  # scaffold:line db-layer
from pydantic_settings import BaseSettings, SettingsConfigDict

# APP_ENV picks the env file: .env.development (default), .env.production, ...
# Real environment variables always win over files. .env.local is for personal overrides.
APP_ENV = os.getenv("APP_ENV", "development")


class Settings(BaseSettings):
    # Paths are relative to apps/api (where uvicorn, pytest and migrations run). Later files win.
    model_config = SettingsConfigDict(env_file=(f".env.{APP_ENV}", ".env.local"), extra="ignore")

    # scaffold:begin db-layer
    # Every database is optional: an empty or missing URL turns that database off.
    sqlite_url: str | None = None  # scaffold:line sqlite
    postgres_url: str | None = None  # scaffold:line postgres
    # scaffold:end db-layer

    # No default on purpose: a missing value must stop the API at startup.
    # Comma-separated string: env vars cannot hold a list without JSON.
    cors_origins: str

    # scaffold:begin db-layer
    @field_validator(
        "sqlite_url",  # scaffold:line sqlite
        "postgres_url",  # scaffold:line postgres
        mode="before",
    )
    @classmethod
    def empty_means_disabled(cls, value: str | None) -> str | None:
        return value or None

    # scaffold:end db-layer

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()
