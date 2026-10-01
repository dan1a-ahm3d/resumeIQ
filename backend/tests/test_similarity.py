"""
Unit tests for TF-IDF Cosine Similarity.
"""
import pytest
from app.services.similarity import similarity_service


def test_identical_text_similarity():
    text = "Python engineer with machine learning and docker experience building distributed systems."
    result = similarity_service.calculate_similarity(text, text)
    assert result["percentage"] > 90.0
    assert result["raw_similarity"] > 0.90


def test_completely_disjoint_text():
    resume = "Culinary chef specializing in French pastry, sourdough baking, and restaurant kitchen inventory."
    jd = "Kubernetes cluster administration, Linux kernel debugging, and network packet routing."
    result = similarity_service.calculate_similarity(resume, jd)
    assert result["percentage"] < 15.0


def test_empty_input_handling():
    res1 = similarity_service.calculate_similarity("", "Python developer")
    assert res1["raw_similarity"] == 0.0
    assert res1["percentage"] == 0.0

    res2 = similarity_service.calculate_similarity("Python developer", "")
    assert res2["percentage"] == 0.0

    res3 = similarity_service.calculate_similarity("", "")
    assert res3["percentage"] == 0.0
