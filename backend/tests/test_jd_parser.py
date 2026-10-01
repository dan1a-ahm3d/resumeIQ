"""
Unit tests for Job Description Parser.
Tests section extraction, required vs preferred separation, and unformatted text handling.
"""
import pytest
from app.services.jd_parser import jd_parser


SAMPLE_JD = """
Job Title: Senior Backend Engineer

Role Overview:
We are looking for an experienced backend engineer to lead our core API services.

Required Skills:
• Python
• FastAPI
• PostgreSQL
• Docker

Preferred Skills:
• Kubernetes
• Redis
• AWS

Responsibilities:
• Architect scalable microservices
• Optimize database queries
• Lead code reviews
"""


def test_parse_structured_job_description():
    jd = jd_parser.parse_job_description(SAMPLE_JD)
    assert "Senior Backend Engineer" in jd.title
    assert "Python" in jd.required_skills
    assert "FastAPI" in jd.required_skills
    assert "PostgreSQL" in jd.required_skills
    assert "Docker" in jd.required_skills
    assert "Kubernetes" in jd.preferred_skills
    assert "Redis" in jd.preferred_skills
    assert "AWS" in jd.preferred_skills
    assert len(jd.responsibilities) >= 2


def test_required_vs_preferred_skill_separation():
    """
    CRITICAL REQUIREMENT:
    Preferred skills must be strictly isolated and must NEVER appear in required_skills.
    """
    sample = """
    Job Title: Machine Learning Engineer
    Required Skills:
    - Python
    - PyTorch
    - scikit-learn
    - NLP
    - Pandas

    Preferred Skills:
    - FastAPI
    - Docker
    - MLOps
    - spaCy
    """
    jd = jd_parser.parse_job_description(sample)
    assert set(jd.required_skills) == {"Python", "PyTorch", "scikit-learn", "NLP", "Pandas"}
    assert set(jd.preferred_skills) == {"FastAPI", "Docker", "MLOps", "spaCy"}
    
    # Assert zero intersection between required and preferred
    intersection = set(jd.required_skills).intersection(set(jd.preferred_skills))
    assert len(intersection) == 0


def test_parse_inline_skills_header():
    sample = "Required Skills: Python, PyTorch, scikit-learn\nPreferred Skills: Docker, AWS"
    jd = jd_parser.parse_job_description(sample)
    assert "Python" in jd.required_skills
    assert "PyTorch" in jd.required_skills
    assert "scikit-learn" in jd.required_skills
    assert "Docker" in jd.preferred_skills
    assert "AWS" in jd.preferred_skills


def test_parse_unstructured_jd_does_not_hallucinate():
    raw = "Looking for a developer to help build our internal web portal."
    jd = jd_parser.parse_job_description(raw)
    assert jd.required_skills == []
    assert jd.preferred_skills == []
    assert len(jd.raw_text) > 0


def test_parse_empty_jd():
    jd = jd_parser.parse_job_description("")
    assert jd.title == ""
    assert jd.required_skills == []
    assert jd.preferred_skills == []
