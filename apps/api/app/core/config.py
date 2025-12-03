from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings"""

    # Project info
    PROJECT_NAME: str = "Solar Detector API"
    VERSION: str = "0.1.0"
    API_V1_PREFIX: str = "/api/v1"

    # Database
    POSTGRES_USER: str = "user"
    POSTGRES_PASSWORD: str = "pass"
    POSTGRES_DB: str = "solar_detector"
    POSTGRES_HOST: str = "db"
    POSTGRES_PORT: int = 5432

    # CORS
    ALLOWED_ORIGINS: list[str] = ["http://localhost:5173", "http://frontend:5173"]

    @property
    def DATABASE_URL(self) -> str:
        """Construct database URL"""
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="allow",
    )

    CDS_CLIENT_ID: str = "cdse-public"
    CDS_USERNAME: str  # set via env var
    CDS_PASSWORD: str  # set via env var

    CDS_TOKEN_URL: str = (
        "https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token"
    )
    CDS_CATALOG_URL: str = (
        "https://catalogue.dataspace.copernicus.eu/resto/api/collections/Sentinel2/search.json"
    )
    CDS_PROCESS_URL: str = "https://sh.dataspace.copernicus.eu/api/v1/process"

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="allow",
    )


settings = Settings()
