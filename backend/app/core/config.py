from functools import lru_cache

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    project_name: str = "Buyer Onboarding Microservice"
    api_title: str = "Buyer Onboarding API"
    database_url: str = "postgresql+psycopg://buyers_user:buyers_password@localhost:5432/buyers_db"
    cors_origins: list[str] = Field(default_factory=lambda: ["http://localhost:5173", "http://127.0.0.1:5173"])

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: object) -> list[str]:
        if value is None:
            return []

        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]

        return value


@lru_cache

def get_settings() -> Settings:
    return Settings()


settings = get_settings()
