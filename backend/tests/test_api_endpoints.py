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


# ==============================================================================
# MILESTONE 6 PRODUCTION HARDENING TESTS (TESTS A - J)
# ==============================================================================

def test_upload_file_exactly_at_limit():
    """Test A: File exactly at 10MB limit with valid PDF signature is accepted without 413."""
    from app.core.config import settings
    header = b"%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF\n"
    padding = b" " * (settings.MAX_FILE_SIZE_BYTES - len(header))
    exact_bytes = header + padding
    assert len(exact_bytes) == settings.MAX_FILE_SIZE_BYTES
    
    buf = io.BytesIO(exact_bytes)
    response = client.post(
        "/api/v1/analyze/resume",
        files={"file": ("exact_limit.pdf", buf, "application/pdf")}
    )
    # Must NOT be 413 Payload Too Large
    assert response.status_code != 413


def test_upload_file_over_limit_returns_413():
    """Test B: File exceeding 10MB limit must be rejected with HTTP 413 Payload Too Large."""
    from app.core.config import settings
    oversized = b"%PDF-1.4\n" + b"A" * (settings.MAX_FILE_SIZE_BYTES + 1024)
    buf = io.BytesIO(oversized)
    response = client.post(
        "/api/v1/analyze/resume",
        files={"file": ("oversized.pdf", buf, "application/pdf")}
    )
    assert response.status_code == 413
    assert "exceeds" in response.json()["detail"].lower()


def test_non_pdf_renamed_to_pdf_rejected():
    """Test C: Non-PDF file renamed with .pdf extension must be rejected with HTTP 400."""
    fake_pdf = io.BytesIO(b"This is just plain text content renamed as a pdf document.")
    response = client.post(
        "/api/v1/analyze/resume",
        files={"file": ("fake_resume.pdf", fake_pdf, "application/pdf")}
    )
    assert response.status_code == 400
    assert "header signature" in response.json()["detail"].lower()


def test_valid_pdf_signature_accepted():
    """Test D: Valid PDF with %PDF- header is accepted and parsed."""
    pdf_buf = make_dummy_pdf("Candidate Alpha\nSkills: Python, PyTorch.")
    response = client.post(
        "/api/v1/analyze/resume",
        files={"file": ("valid.pdf", pdf_buf, "application/pdf")}
    )
    assert response.status_code == 200
    assert "Python" in [s["skill"] for s in response.json()["detected_skills"]]


def test_empty_upload_rejected():
    """Test E: Empty file (0 bytes) must be rejected with HTTP 400."""
    empty_buf = io.BytesIO(b"")
    response = client.post(
        "/api/v1/analyze/resume",
        files={"file": ("empty.pdf", empty_buf, "application/pdf")}
    )
    assert response.status_code == 400
    assert "empty" in response.json()["detail"].lower()


def test_rank_batch_exactly_50_files():
    """Test F: /rank accepts exactly 50 files (the configured maximum batch limit)."""
    dummy_data = make_dummy_pdf("Skills: Python, SQL. Experienced developer.").getvalue()
    files = [("files", (f"cand_{i}.pdf", io.BytesIO(dummy_data), "application/pdf")) for i in range(50)]
    
    response = client.post(
        "/api/v1/analyze/rank",
        files=files,
        data={"job_description": "Required Skills: Python, SQL."}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["total_candidates"] == 50
    assert len(data["rankings"]) == 50


def test_rank_batch_51_files_rejected():
    """Test G: /rank rejects a batch exceeding 50 files with HTTP 400."""
    dummy_data = make_dummy_pdf("Skills: Python, SQL.").getvalue()
    files = [("files", (f"cand_{i}.pdf", io.BytesIO(dummy_data), "application/pdf")) for i in range(51)]
    
    response = client.post(
        "/api/v1/analyze/rank",
        files=files,
        data={"job_description": "Required Skills: Python, SQL."}
    )
    assert response.status_code == 400
    assert "exceeds maximum allowed limit of 50" in response.json()["detail"]


def test_rank_batch_failure_isolation():
    """Test H: One corrupt file in a batch does not fail the entire request; valid resumes are scored."""
    valid_pdf_1 = make_dummy_pdf("Candidate One\nSkills: Python, FastAPI, Docker, PostgreSQL. Building APIs.")
    valid_pdf_2 = make_dummy_pdf("Candidate Two\nSkills: Python, Docker. Container pipelines.")
    corrupt_file = io.BytesIO(b"Not a real pdf content without header")
    
    response = client.post(
        "/api/v1/analyze/rank",
        files=[
            ("files", ("valid_1.pdf", valid_pdf_1, "application/pdf")),
            ("files", ("corrupt.pdf", corrupt_file, "application/pdf")),
            ("files", ("valid_2.pdf", valid_pdf_2, "application/pdf"))
        ],
        data={"job_description": "Required Skills: Python, FastAPI, Docker, PostgreSQL."}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["total_candidates"] == 2
    assert len(data["rankings"]) == 2
    assert data["rankings"][0]["filename"] == "valid_1.pdf"
    assert data["rankings"][1]["filename"] == "valid_2.pdf"
    assert len(data["failed_candidates"]) == 1
    assert data["failed_candidates"][0]["filename"] == "corrupt.pdf"
    assert len(data["warnings"]) >= 1


def test_rank_all_candidates_invalid_returns_400():
    """Test I: If all candidate files in /rank are invalid, return HTTP 400 with details."""
    corrupt_1 = io.BytesIO(b"Not a pdf 1")
    corrupt_2 = io.BytesIO(b"Not a pdf 2")
    
    response = client.post(
        "/api/v1/analyze/rank",
        files=[
            ("files", ("bad1.pdf", corrupt_1, "application/pdf")),
            ("files", ("bad2.pdf", corrupt_2, "application/pdf"))
        ],
        data={"job_description": "Required Skills: Python, Docker."}
    )
    assert response.status_code == 400
    assert "failed" in response.json()["detail"].lower()


def test_existing_valid_ranking_regression_anchor():
    """Test J: Frozen regression case: candidate_alpha vs ml_engineer yields exact expected scores."""
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
    assert data["overall_score"] == 40.76
    assert data["text_similarity_percentage"] == 15.37
    assert data["skill_coverage_percentage"] == 100.0
    assert len(data["matched_skills"]) == 5
    assert len(data["missing_skills"]) == 0
