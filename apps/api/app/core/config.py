from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # The API runs from apps/api, so the shared root .env is two levels up.
    model_config = SettingsConfigDict(env_file=("../../.env", ".env"), extra="ignore")

    database_url: str = "postgresql+psycopg://app:app@localhost:5432/app"
    # Comma-separated string: env vars cannot hold a list without JSON.
    cors_origins: str = "http://localhost:5173,http://localhost:5174,http://localhost:3000"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()
