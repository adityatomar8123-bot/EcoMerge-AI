from pydantic import BaseModel


class Settings(BaseModel):
    app_name: str = "EcoSphere ESG Management Platform"
    database_url: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/ecosphere"
    jwt_secret: str = "this-is-a-longer-dev-jwt-secret-for-erp-local-testing-12345"
    jwt_algorithm: str = "HS256"
    jwt_expiry_minutes: int = 60
    allowed_origins: list[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
    ]


settings = Settings()
