"""
Pydantic Models for Job Description parsing.
"""
from typing import List, Optional
from pydantic import BaseModel, Field


class JobDescription(BaseModel):
    title: str = Field(default="", description="Job title or role name")
    required_skills: List[str] = Field(default_factory=list, description="Mandatory/required technical skills")
    preferred_skills: List[str] = Field(default_factory=list, description="Preferred or nice-to-have skills")
    responsibilities: List[str] = Field(default_factory=list, description="Core responsibilities extracted from JD")
    qualifications: List[str] = Field(default_factory=list, description="Educational or experience qualifications")
    raw_text: str = Field(default="", description="Original raw text of the Job Description")
