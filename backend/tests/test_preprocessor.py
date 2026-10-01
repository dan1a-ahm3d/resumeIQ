"""
Unit tests for Text Preprocessor.
Verifies preservation of critical technical terms (C++, C#, .NET, Node.js, scikit-learn).
"""
import pytest
from app.services.preprocessor import preprocessor


def test_preserve_technical_terms():
    sample = "Proficient in C++, C#, .NET Core, Node.js, Next.js, and scikit-learn."
    cleaned = preprocessor.clean_text(sample)
    assert "C++" in cleaned
    assert "C#" in cleaned
    assert ".NET" in cleaned
    assert "Node.js" in cleaned
    assert "scikit-learn" in cleaned


def test_tokenize_preserves_tech_terms():
    sample = "We use FastAPI, PostgreSQL, and PyTorch for model training."
    tokens = preprocessor.tokenize(sample)
    assert "FastAPI" in tokens or "fastapi" in [t.lower() for t in tokens]
    assert "PostgreSQL" in tokens or "postgresql" in [t.lower() for t in tokens]
    assert "PyTorch" in tokens or "pytorch" in [t.lower() for t in tokens]


def test_preprocess_for_similarity_handles_empty():
    assert preprocessor.preprocess_for_similarity("") == ""
    assert preprocessor.preprocess_for_similarity("   ") == ""


def test_preprocess_for_similarity_removes_stop_words():
    sample = "This is a detailed analysis of the candidate's Python background."
    processed = preprocessor.preprocess_for_similarity(sample)
    assert "this" not in processed.split()
    assert "python" in processed
