"""
Unit tests for Evidence Generation and Factual Absence Framing.
"""
import pytest
from app.services.explanation import explanation_service
from app.models.analysis import SkillEvidence


def test_matched_and_missing_evidence():
    required = ["Python", "FastAPI", "PostgreSQL", "Docker"]
    detected = [
        SkillEvidence(
            skill="Python",
            matched_text="Python",
            page_number=1,
            context="5 years of experience developing in Python."
        ),
        SkillEvidence(
            skill="FastAPI",
            matched_text="FastAPI",
            page_number=1,
            context="Built high-performance APIs using FastAPI."
        )
    ]
    
    coverage, evidence = explanation_service.compute_coverage_and_evidence(required, detected)
    
    # 2 out of 4 = 50%
    assert coverage.coverage == 50.0
    assert coverage.matched_skills == ["Python", "FastAPI"]
    assert coverage.missing_skills == ["PostgreSQL", "Docker"]
    
    # Check evidence records
    py_ev = next(e for e in evidence if e.requirement == "Python")
    assert py_ev.status == "matched"
    assert "5 years of experience" in py_ev.citation
    
    # Check missing evidence wording
    pg_ev = next(e for e in evidence if e.requirement == "PostgreSQL")
    assert pg_ev.status == "not_found"
    assert pg_ev.citation is None
    assert "PostgreSQL was not found in the extracted resume text" in pg_ev.message


def test_zero_required_skills_handling():
    coverage, evidence = explanation_service.compute_coverage_and_evidence([], [])
    assert coverage.coverage == 100.0
    assert len(evidence) == 0
