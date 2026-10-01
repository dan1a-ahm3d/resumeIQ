"""
Unit tests for Explainable Scoring Engine and weight validation.
"""
import pytest
from app.services.scoring import scoring_service
from app.core.config import settings


def test_central_weights_sum_to_one():
    total = settings.TEXT_SIMILARITY_WEIGHT + settings.REQUIRED_SKILL_WEIGHT
    assert abs(total - 1.0) < 1e-5


def test_scoring_formula_calculation():
    # 70% text sim + 30% skill coverage
    # If text sim = 80, skill coverage = 90
    # Weighted text = 80 * 0.70 = 56.0
    # Weighted skill = 90 * 0.30 = 27.0
    # Total = 83.0
    components = scoring_service.compute_score(
        text_similarity_percentage=80.0,
        skill_coverage_percentage=90.0
    )
    assert components.text_similarity.score == 80.0
    assert components.text_similarity.weighted_score == 56.0
    assert components.required_skill_coverage.score == 90.0
    assert components.required_skill_coverage.weighted_score == 27.0
    
    overall = scoring_service.get_overall_score(components)
    assert overall == 83.0


def test_boundary_scores():
    # Min boundary
    comp_min = scoring_service.compute_score(0.0, 0.0)
    assert scoring_service.get_overall_score(comp_min) == 0.0

    # Max boundary
    comp_max = scoring_service.compute_score(100.0, 100.0)
    assert scoring_service.get_overall_score(comp_max) == 100.0
