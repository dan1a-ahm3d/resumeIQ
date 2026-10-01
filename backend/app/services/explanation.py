"""
Explainable Matching & Evidence Generation Service.
Produces explicit evidence records:
- Matched skills: Citation, verbatim text, page number
- Missing skills: Factual non-judgmental absence statement:
  "[Skill] was not found in the extracted resume text."
"""
from typing import List, Dict, Set
from app.models.analysis import (
    SkillEvidence,
    SkillCoverage,
    RequirementEvidence
)


class ExplanationService:
    @staticmethod
    def compute_coverage_and_evidence(
        required_skills: List[str],
        detected_skills: List[SkillEvidence]
    ) -> (SkillCoverage, List[RequirementEvidence]):
        """
        Compares job requirements against detected resume skills.
        Generates verbatim citations for matches and factual absence messages for misses.
        """
        detected_map: Dict[str, SkillEvidence] = {
            ev.skill.lower(): ev for ev in detected_skills
        }
        
        matched_skills: List[str] = []
        missing_skills: List[str] = []
        evidence_records: List[RequirementEvidence] = []

        # If no requirements are specified, coverage defaults to 100.0%
        if not required_skills:
            return (
                SkillCoverage(
                    required_skills=[],
                    matched_skills=[],
                    missing_skills=[],
                    coverage=100.0
                ),
                []
            )

        # Deduplicate required skills while preserving order
        seen: Set[str] = set()
        clean_required = []
        for req in required_skills:
            req_clean = req.strip()
            if req_clean and req_clean.lower() not in seen:
                seen.add(req_clean.lower())
                clean_required.append(req_clean)

        for req in clean_required:
            req_lower = req.lower()
            if req_lower in detected_map:
                ev = detected_map[req_lower]
                matched_skills.append(ev.skill)
                evidence_records.append(RequirementEvidence(
                    requirement=req,
                    status="matched",
                    citation=ev.context,
                    page_number=ev.page_number,
                    message=f"Matched requirement '{req}' via detected skill '{ev.skill}'."
                ))
            else:
                missing_skills.append(req)
                evidence_records.append(RequirementEvidence(
                    requirement=req,
                    status="not_found",
                    citation=None,
                    page_number=None,
                    message=f"{req} was not found in the extracted resume text."
                ))

        total_req = len(clean_required)
        coverage_pct = round((len(matched_skills) / total_req) * 100.0, 2) if total_req > 0 else 100.0

        coverage = SkillCoverage(
            required_skills=clean_required,
            matched_skills=matched_skills,
            missing_skills=missing_skills,
            coverage=coverage_pct
        )

        return coverage, evidence_records


explanation_service = ExplanationService()
