"""
ResumeIQ Core Configuration
Central settings for scoring weights, CORS, upload limits, and model paths.
"""
from typing import List
from pydantic_settings import BaseSettings
from pydantic import model_validator


class Settings(BaseSettings):
    PROJECT_NAME: str = "ResumeIQ API"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"
    
    # Matching Weights (must sum to 1.0)
    TEXT_SIMILARITY_WEIGHT: float = 0.70
    REQUIRED_SKILL_WEIGHT: float = 0.30
    
    # CORS Configuration
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000"
    ]
    
    # Upload limits
    MAX_FILE_SIZE_BYTES: int = 10 * 1024 * 1024  # 10 MB
    ALLOWED_EXTENSIONS: List[str] = [".pdf"]
    
    # NLP Model
    SPACY_MODEL: str = "en_core_web_sm"

    @model_validator(mode="after")
    def validate_weights(self) -> "Settings":
        total = self.TEXT_SIMILARITY_WEIGHT + self.REQUIRED_SKILL_WEIGHT
        if abs(total - 1.0) > 1e-5:
            raise ValueError(f"Scoring weights must sum to 1.0. Current sum: {total}")
        return self


settings = Settings()
