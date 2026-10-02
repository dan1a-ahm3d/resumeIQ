"""
Analysis & Candidate Matching Endpoints.
Implements:
1. POST /api/v1/analyze/resume -> Single resume parsing & skill extraction
2. POST /api/v1/analyze/match  -> Resume-to-Job matching & explainable scoring
3. POST /api/v1/analyze/rank   -> Multiple candidate resume ranking against one JD
"""
import uuid
from typing import List, Optional, Dict
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from pydantic import BaseModel

from app.core.config import settings
from app.models.resume import ParsedResume
from app.models.analysis import (
    CandidateAnalysis,
    CandidateRanking,
    MultiCandidateRankingResponse,
    SkillEvidence
)
from app.services.pdf_parser import pdf_parser
from app.services.jd_parser import jd_parser
from app.services.skill_extractor import skill_extractor
from app.services.similarity import similarity_service
from app.services.scoring import scoring_service
from app.services.explanation import explanation_service

router = APIRouter(prefix="/analyze", tags=["Analysis"])


class ResumeParseResponse(BaseModel):
    parsed_resume: ParsedResume
    detected_skills: List[SkillEvidence]
    warnings: List[str]


PDF_MAGIC_BYTES = b"%PDF-"


async def validate_and_read_pdf_upload(file: UploadFile) -> bytes:
    """
    Strictly validates and reads an uploaded PDF file:
    1. Checks filename extension (.pdf)
    2. Reads data safely and enforces MAX_FILE_SIZE_BYTES limit (raises HTTP 413)
    3. Checks for empty content (raises HTTP 400)
    4. Validates PDF magic byte header '%PDF-' (raises HTTP 400)
    """
    fname = file.filename or "unknown.pdf"
    if not fname.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File '{fname}' is not supported. Only PDF files (.pdf) are accepted."
        )

    content = await file.read()

    if len(content) > settings.MAX_FILE_SIZE_BYTES:
        max_mb = settings.MAX_FILE_SIZE_BYTES // (1024 * 1024)
        raise HTTPException(
            status_code=413,
            detail=f"File '{fname}' exceeds the maximum allowed size of {max_mb}MB."
        )

    if len(content) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Uploaded file '{fname}' is empty (0 bytes)."
        )

    if not content.startswith(PDF_MAGIC_BYTES):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File '{fname}' does not have a valid PDF header signature (%PDF-)."
        )

    return content


def _process_candidate_evaluation(
    file_bytes: bytes,
    filename: str,
    raw_jd: str,
    candidate_id: Optional[str] = None
) -> CandidateAnalysis:
    """Core pipeline orchestrating extraction, matching, and explainability for one resume."""
    if len(file_bytes) > settings.MAX_FILE_SIZE_BYTES:
        max_mb = settings.MAX_FILE_SIZE_BYTES // (1024 * 1024)
        raise HTTPException(
            status_code=413,
            detail=f"Uploaded file '{filename}' exceeds maximum allowed size of {max_mb}MB."
        )

    if not file_bytes or len(file_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Uploaded file '{filename}' is empty."
        )

    if not file_bytes.startswith(PDF_MAGIC_BYTES):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File '{filename}' does not have a valid PDF header signature (%PDF-)."
        )

    cid = candidate_id or f"CAN-{uuid.uuid4().hex[:6].upper()}"

    # 1. PDF Parsing
    try:
        parsed_resume = pdf_parser.parse_pdf(file_bytes, filename)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )

    # 2. Parse Job Description
    parsed_jd = jd_parser.parse_job_description(raw_jd)

    # Determine required skills:
    # Explicit required skills identified by the JD parser take strict precedence.
    # Preferred skills are NEVER mixed into required skills.
    effective_required_skills = parsed_jd.required_skills
    if not effective_required_skills:
        jd_skills_ev = skill_extractor.extract_skills_from_text(raw_jd)
        pref_set = {p.lower() for p in parsed_jd.preferred_skills}
        effective_required_skills = [
            ev.skill for ev in jd_skills_ev if ev.skill.lower() not in pref_set
        ]

    # 3. Extract skills from Resume (with C/C++ dual-layer boundary protection)
    detected_skills = skill_extractor.extract_skills_from_resume(parsed_resume)

    # 4. TF-IDF Cosine Similarity
    sim_result = similarity_service.calculate_similarity(
        resume_text=parsed_resume.full_text,
        jd_text=raw_jd
    )
    text_sim_pct = sim_result["percentage"]

    # 5. Required-Skill Coverage & Evidence (evaluates ONLY required skills)
    coverage_obj, evidence_records = explanation_service.compute_coverage_and_evidence(
        required_skills=effective_required_skills,
        detected_skills=detected_skills
    )

    # 6. Scoring Engine (70% Text Similarity + 30% Required Skill Coverage)
    score_components = scoring_service.compute_score(
        text_similarity_percentage=text_sim_pct,
        skill_coverage_percentage=coverage_obj.coverage
    )
    overall_score = scoring_service.get_overall_score(score_components)

    all_warnings = list(parsed_resume.warnings)
    if not parsed_jd.required_skills:
        all_warnings.append(
            "No explicit required skills section was identified in the Job Description. "
            "Skill coverage evaluated against general technical skills excluding preferred skills."
        )

    return CandidateAnalysis(
        candidate_id=cid,
        filename=filename,
        overall_score=overall_score,
        components=score_components,
        text_similarity_percentage=text_sim_pct,
        skill_coverage_percentage=coverage_obj.coverage,
        matched_skills=coverage_obj.matched_skills,
        missing_skills=coverage_obj.missing_skills,
        detected_skills=detected_skills,
        evidence=evidence_records,
        warnings=all_warnings
    )


@router.post("/resume", response_model=ResumeParseResponse)
async def parse_resume_endpoint(file: UploadFile = File(...)):
    """Accepts a PDF resume, extracts structured text and detected skills."""
    content = await validate_and_read_pdf_upload(file)
    try:
        parsed_resume = pdf_parser.parse_pdf(content, file.filename)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )

    skills = skill_extractor.extract_skills_from_resume(parsed_resume)
    return ResumeParseResponse(
        parsed_resume=parsed_resume,
        detected_skills=skills,
        warnings=parsed_resume.warnings
    )


@router.post("/match", response_model=CandidateAnalysis)
async def match_candidate_endpoint(
    file: UploadFile = File(...),
    job_description: str = Form(...)
):
    """
    Evaluates a single resume PDF against a Job Description.
    Calculates TF-IDF similarity, required skill coverage, explainable score, and evidence citations.
    """
    if not job_description or not job_description.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job description text cannot be empty."
        )

    content = await validate_and_read_pdf_upload(file)
    analysis = _process_candidate_evaluation(
        file_bytes=content,
        filename=file.filename,
        raw_jd=job_description
    )
    return analysis


@router.post("/rank", response_model=MultiCandidateRankingResponse)
async def rank_candidates_endpoint(
    files: List[UploadFile] = File(...),
    job_description: str = Form(...)
):
    """
    Ranks multiple resume PDFs against one Job Description.
    Orders candidates strictly by overall_score DESCENDING with deterministic tie-breaking.
    Features batch-size capping (MAX_RANK_BATCH_SIZE) and candidate failure isolation.
    """
    if not files or len(files) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one resume PDF must be provided."
        )

    if len(files) > settings.MAX_RANK_BATCH_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Batch upload exceeds maximum allowed limit of {settings.MAX_RANK_BATCH_SIZE} files. Provided: {len(files)}."
        )

    if not job_description or not job_description.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job description text cannot be empty."
        )

    parsed_jd = jd_parser.parse_job_description(job_description)
    job_title = parsed_jd.title or "Evaluated Position"

    evaluated_candidates: List[CandidateAnalysis] = []
    failed_candidates: List[Dict[str, str]] = []
    batch_warnings: List[str] = []

    for file in files:
        fname = file.filename or "unnamed_resume.pdf"
        try:
            content = await validate_and_read_pdf_upload(file)
            analysis = _process_candidate_evaluation(
                file_bytes=content,
                filename=fname,
                raw_jd=job_description
            )
            evaluated_candidates.append(analysis)
            if analysis.warnings:
                for w in analysis.warnings:
                    batch_warnings.append(f"[{fname}] {w}")
        except HTTPException as he:
            failed_candidates.append({
                "filename": fname,
                "error": str(he.detail)
            })
            batch_warnings.append(f"Skipped '{fname}': {he.detail}")
        except Exception as ex:
            failed_candidates.append({
                "filename": fname,
                "error": str(ex)
            })
            batch_warnings.append(f"Skipped '{fname}': {str(ex)}")

    if not evaluated_candidates:
        if failed_candidates:
            summary = "; ".join([f"{f['filename']}: {f['error']}" for f in failed_candidates])
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"All uploaded candidate files failed processing: {summary}"
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="None of the uploaded files were valid PDF documents."
        )

    # Sort descending by overall_score, then text_sim, then skill_cov, then filename for deterministic tie handling
    sorted_candidates = sorted(
        evaluated_candidates,
        key=lambda c: (
            -c.overall_score,
            -c.text_similarity_percentage,
            -c.skill_coverage_percentage,
            c.filename
        )
    )

    rankings: List[CandidateRanking] = []
    for rank_idx, cand in enumerate(sorted_candidates, start=1):
        rankings.append(CandidateRanking(
            rank=rank_idx,
            candidate_id=cand.candidate_id,
            filename=cand.filename,
            overall_score=cand.overall_score,
            text_similarity_percentage=cand.text_similarity_percentage,
            skill_coverage_percentage=cand.skill_coverage_percentage,
            matched_count=len(cand.matched_skills),
            missing_count=len(cand.missing_skills),
            analysis=cand
        ))

    return MultiCandidateRankingResponse(
        job_title=job_title,
        total_candidates=len(rankings),
        rankings=rankings,
        warnings=batch_warnings,
        failed_candidates=failed_candidates
    )
