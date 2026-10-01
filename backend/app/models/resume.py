"""
Pydantic Models for Resume representation and extraction.
"""
from typing import List
from pydantic import BaseModel, Field


class ResumePage(BaseModel):
    page_number: int = Field(..., description="1-indexed page number of the resume PDF")
    text: str = Field(..., description="Normalized text extracted from this page")


class ParsedResume(BaseModel):
    filename: str = Field(..., description="Original name of the uploaded PDF file")
    pages: List[ResumePage] = Field(default_factory=list, description="Extracted pages")
    full_text: str = Field(..., description="Aggregated full text of the resume")
    warnings: List[str] = Field(default_factory=list, description="Warnings encountered during parsing")
