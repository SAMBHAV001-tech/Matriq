import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "Matriq - Smart Inventory Analytics"
    database_url: str
    port: int = 8000

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
