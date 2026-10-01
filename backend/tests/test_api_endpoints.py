"""
Integration tests for FastAPI endpoints:
- GET /api/v1/health
- POST /api/v1/analyze/resume
- POST /api/v1/analyze/match
- POST /api/v1/analyze/rank
"""
import io
import os
import pytest
from fastapi.testclient import TestClient
import pymupdf as fitz
from app.main import app

client = TestClient(app)

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")


def make_dummy_pdf(text: str) -> io.BytesIO:
    doc = fitz.open()
    p = doc.new_page()
    p.insert_text((50, 72), text)
    buf = io.BytesIO(doc.write())
    doc.close()
    buf.seek(0)
    return buf


def test_health_check_endpoint():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "ResumeIQ" in data["service"]


def test_parse_resume_endpoint():
    pdf_buf = make_dummy_pdf("Candidate Delta\nSoftware Developer with Python and FastAPI experience.")
    response = client.post(
        "/api/v1/analyze/resume",
        files={"file": ("resume.pdf", pdf_buf, "application/pdf")}
    )
    assert response.status_code == 200
    data = response.json()
    assert "parsed_resume" in data
    assert "Python" in [s["skill"] for s in data["detected_skills"]]
    assert "FastAPI" in [s["skill"] for s in data["detected_skills"]]


def test_match_candidate_endpoint():
    resume_text = """
    Candidate Beta
    Skills: Python, FastAPI, PostgreSQL, Docker.
    Built web applications using Python and FastAPI connected to PostgreSQL databases.
    """
    jd_text = """
    Job Title: Backend Developer
    Required Skills:
    • Python
    • FastAPI
    • PostgreSQL
    • Docker
    """
    pdf_buf = make_dummy_pdf(resume_text)
    response = client.post(
        "/api/v1/analyze/match",
        files={"file": ("candidate_beta.pdf", pdf_buf, "application/pdf")},
        data={"job_description": jd_text}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["overall_score"] >= 50.0
    assert "components" in data
    assert data["skill_coverage_percentage"] == 100.0
    assert "Python" in data["matched_skills"]
    assert "FastAPI" in data["matched_skills"]
    assert len(data["missing_skills"]) == 0


def test_required_skill_coverage_only_uses_required_skills():
    """
    REGRESSION TEST FOR ISSUE 1:
    Candidate Alpha evaluated against ML Engineer JD:
    - Required: Python, PyTorch, scikit-learn, NLP, Pandas (Candidate has all 5)
    - Preferred: FastAPI, Docker, MLOps, spaCy
    Verified:
    - skill_coverage_percentage == 100.0
    - missing_skills == []
    - Preferred skills DO NOT reduce required skill coverage!
    """
    alpha_path = os.path.join(DATA_DIR, "resumes", "candidate_alpha.pdf")
    ml_job_path = os.path.join(DATA_DIR, "jobs", "ml_engineer.txt")

    with open(alpha_path, "rb") as f_alpha, open(ml_job_path, "r", encoding="utf-8") as f_jd:
        response = client.post(
            "/api/v1/analyze/match",
            files={"file": ("candidate_alpha.pdf", f_alpha, "application/pdf")},
            data={"job_description": f_jd.read()}
        )

    assert response.status_code == 200
    data = response.json()
    assert data["skill_coverage_percentage"] == 100.0
    assert data["missing_skills"] == []
    assert set(data["matched_skills"]) == {"Python", "PyTorch", "scikit-learn", "NLP", "Pandas"}
    assert abs(data["text_similarity_percentage"] - 15.37) < 0.5
    assert abs(data["overall_score"] - 40.76) < 0.5


def test_multi_candidate_ranking_and_deterministic_ties():
    # Candidate 1: High match
    c1_pdf = make_dummy_pdf("Skills: Python, FastAPI, PostgreSQL, Docker. Senior developer building APIs.")
    # Candidate 2: Partial match
    c2_pdf = make_dummy_pdf("Skills: Python, Flask. Basic database usage.")
    
    jd = "Required Skills: Python, FastAPI, PostgreSQL, Docker."
    
    response = client.post(
        "/api/v1/analyze/rank",
        files=[
            ("files", ("cand_1.pdf", c1_pdf, "application/pdf")),
            ("files", ("cand_2.pdf", c2_pdf, "application/pdf"))
        ],
        data={"job_description": jd}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["total_candidates"] == 2
    rankings = data["rankings"]
    assert rankings[0]["rank"] == 1
    assert rankings[1]["rank"] == 2
    assert rankings[0]["overall_score"] >= rankings[1]["overall_score"]
    assert rankings[0]["filename"] == "cand_1.pdf"
