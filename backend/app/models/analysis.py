"""
Pydantic Models for Scoring, Evidence, and Multi-Candidate Ranking.
"""
from typing import List, Optional, Dict, Literal
from pydantic import BaseModel, Field
from app.models.resume import ParsedResume


class SkillEvidence(BaseModel):
    skill: str = Field(..., description="Canonical skill name")
    matched_text: str = Field(..., description="Exact token matched in text or alias")
    page_number: Optional[int] = Field(default=1, description="Page number where the skill was found")
    context: str = Field(..., description="Verbatim sentence or snippet containing the skill")


class SkillCoverage(BaseModel):
    required_skills: List[str] = Field(default_factory=list, description="Total required skills defined in JD")
    matched_skills: List[str] = Field(default_factory=list, description="Required skills found in resume")
    missing_skills: List[str] = Field(default_factory=list, description="Required skills absent from resume")
    coverage: float = Field(..., description="Coverage percentage (0.0 to 100.0)")


class RequirementEvidence(BaseModel):
    requirement: str = Field(..., description="Name of the required skill or criterion")
    status: Literal["matched", "not_found"] = Field(..., description="Match status")
    citation: Optional[str] = Field(default=None, description="Direct verbatim excerpt from resume")
    page_number: Optional[int] = Field(default=None, description="Page number of citation")
    message: Optional[str] = Field(default=None, description="Factual absence or match description")


class ScoreComponentDetail(BaseModel):
    score: float = Field(..., description="Component raw score (0-100)")
    weight: float = Field(..., description="Component weight ratio (e.g. 0.70 or 0.30)")
    weighted_score: float = Field(..., description="Weighted contribution to overall score")


class ScoreComponents(BaseModel):
    text_similarity: ScoreComponentDetail
    required_skill_coverage: ScoreComponentDetail


class CandidateAnalysis(BaseModel):
    candidate_id: str = Field(..., description="Unique identifier for candidate evaluation")
    filename: str = Field(..., description="Resume filename")
    overall_score: float = Field(..., description="Explainable composite score (0-100)")
    components: ScoreComponents = Field(..., description="Breakdown of individual score factors")
    text_similarity_percentage: float = Field(..., description="TF-IDF Cosine similarity percentage (0-100)")
    skill_coverage_percentage: float = Field(..., description="Required skills coverage percentage (0-100)")
    matched_skills: List[str] = Field(default_factory=list, description="Canonical names of matched required skills")
    missing_skills: List[str] = Field(default_factory=list, description="Required skills not detected in text")
    detected_skills: List[SkillEvidence] = Field(default_factory=list, description="All detected skills with citations")
    evidence: List[RequirementEvidence] = Field(default_factory=list, description="Per-requirement evidence log")
    warnings: List[str] = Field(default_factory=list, description="Parsing or analysis warnings")


class CandidateRanking(BaseModel):
    rank: int = Field(..., description="Candidate ranking position (1-indexed)")
    candidate_id: str = Field(..., description="Candidate unique identifier")
    filename: str = Field(..., description="Resume file name")
    overall_score: float = Field(..., description="Final overall match score")
    text_similarity_percentage: float = Field(..., description="TF-IDF similarity percentage")
    skill_coverage_percentage: float = Field(..., description="Skill coverage percentage")
    matched_count: int = Field(..., description="Number of matched required skills")
    missing_count: int = Field(..., description="Number of missing required skills")
    analysis: Optional[CandidateAnalysis] = Field(default=None, description="Full candidate analysis details")


class MultiCandidateRankingResponse(BaseModel):
    job_title: str = Field(default="Candidate Evaluation", description="Evaluated role title")
    total_candidates: int = Field(..., description="Total candidate resumes successfully processed")
    rankings: List[CandidateRanking] = Field(default_factory=list, description="Ranked candidate list")
    warnings: List[str] = Field(default_factory=list, description="Non-fatal warnings or candidate parsing errors")
    failed_candidates: List[Dict[str, str]] = Field(default_factory=list, description="List of failed candidates with filename and error")
