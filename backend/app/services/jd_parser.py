"""
Deterministic Job Description Parser.
Extracts title, required skills, preferred skills, responsibilities, and qualifications
based on structural section headers. Does not invent or hallucinate information.
Strictly separates required skills from preferred skills.
"""
import re
from typing import List, Dict, Set
from app.models.job import JobDescription
from app.services.skill_extractor import skill_extractor


class JobDescriptionParser:
    # Common section header patterns
    TITLE_PATTERNS = [
        r"(?i)(?:job\s*title|role|position)\s*:\s*([^\n]+)",
        r"(?i)^([A-Z][A-Za-z0-9\s/\-]+(?:Engineer|Developer|Architect|Scientist|Lead|Manager|Analyst|Consultant))"
    ]
    
    SECTION_PATTERNS = {
        "required_skills": [
            r"(?i)(?:required\s*(?:technical\s*)?(?:skills|competencies|qualifications|experience|knowledge)?|must\s*have|key\s*requirements|core\s*requirements|minimum\s*(?:requirements|qualifications)|basic\s*qualifications|technical\s*requirements|skills\s*required|requirements\b|required\b)",
        ],
        "preferred_skills": [
            r"(?i)(?:preferred\s*(?:skills|qualifications|competencies)|nice\s*to\s*have|bonus\s*(?:skills|points)?|desired\s*(?:skills|qualifications)?|good\s*to\s*have|optional\s*skills)",
        ],
        "responsibilities": [
            r"(?i)(?:responsibilities|key\s*responsibilities|what\s*you(?:'ll|\s*will)\s*do|role\s*overview|duties|essential\s*functions)",
        ],
        "qualifications": [
            r"(?i)(?:qualifications|education|background|experience\s*required)",
        ]
    }

    def _extract_items(self, text: str) -> List[str]:
        """Extracts bulleted or comma-separated items from a section block."""
        items = []
        lines = text.strip().split("\n")
        for line in lines:
            # Strip bullets, numbers, dashes, asterisks, and whitespace
            cleaned = re.sub(r"^[\s•\u2022\-\*\d+\.\)]+", "", line).strip()
            if cleaned:
                if "," in cleaned and len(cleaned.split(",")) > 2:
                    sub_items = [s.strip() for s in cleaned.split(",") if s.strip()]
                    items.extend(sub_items)
                else:
                    items.append(cleaned)
        return [item for item in items if len(item) > 1]

    def _canonicalize_skill_items(self, items: List[str]) -> List[str]:
        """
        Maps extracted requirement lines to canonical skill names from the taxonomy.
        If a line contains one or more canonical skills, those skills are added.
        If an item is a custom non-taxonomy requirement, the cleaned string is preserved.
        """
        canonical_skills: List[str] = []
        seen: Set[str] = set()

        for item in items:
            detected = skill_extractor.extract_skills_from_text(item)
            if detected:
                for ev in detected:
                    if ev.skill.lower() not in seen:
                        seen.add(ev.skill.lower())
                        canonical_skills.append(ev.skill)
            else:
                clean_item = item.strip()
                if clean_item and clean_item.lower() not in seen:
                    seen.add(clean_item.lower())
                    canonical_skills.append(clean_item)

        return canonical_skills

    def parse_job_description(self, raw_text: str) -> JobDescription:
        """Parses a raw job description string into a structured JobDescription model."""
        if not raw_text or not raw_text.strip():
            return JobDescription(raw_text="")

        normalized_text = raw_text.replace("\r\n", "\n").replace("\r", "\n")

        title = ""
        # 1. Extract Title
        for pattern in self.TITLE_PATTERNS:
            match = re.search(pattern, normalized_text, re.MULTILINE)
            if match:
                title = match.group(1).strip()
                break

        if not title:
            # Fallback to first non-empty line if short
            first_line = normalized_text.strip().split("\n")[0].strip()
            if len(first_line) < 80 and not first_line.endswith("."):
                title = first_line

        # 2. Segment by sections
        header_regex = (
            r"(?i)^[#*\s-]*("
            r"required\s*(?:technical\s*)?(?:skills|competencies|qualifications|experience|knowledge)?|must\s*have|key\s*requirements|core\s*requirements|"
            r"preferred\s*(?:skills|qualifications|competencies)|nice\s*to\s*have|bonus\s*(?:skills|points)?|desired\s*(?:skills|qualifications)?|good\s*to\s*have|optional\s*skills|"
            r"responsibilities|key\s*responsibilities|what\s*you(?:'ll|\s*will)\s*do|role\s*overview|duties|essential\s*functions|"
            r"qualifications|education|background|experience\s*required|"
            r"requirements\b|required\b|technical\s*requirements"
            r")(?:\s*\(.*?\))?[\s*:#-]*([^\n]*)$"
        )

        lines = normalized_text.split("\n")
        current_section = None
        section_buffers: Dict[str, List[str]] = {
            "required_skills": [],
            "preferred_skills": [],
            "responsibilities": [],
            "qualifications": []
        }

        for line in lines:
            line_str = line.strip()
            if not line_str:
                continue

            header_match = re.match(header_regex, line_str)
            if header_match:
                header_name = header_match.group(1).lower()
                inline_content = header_match.group(2).strip() if header_match.group(2) else ""

                matched_sec = None
                # Check preferred first to prevent 'preferred skills' matching 'skills'
                for pattern in self.SECTION_PATTERNS["preferred_skills"]:
                    if re.search(pattern, header_name):
                        matched_sec = "preferred_skills"
                        break

                if not matched_sec:
                    for pattern in self.SECTION_PATTERNS["required_skills"]:
                        if re.search(pattern, header_name):
                            matched_sec = "required_skills"
                            break

                if not matched_sec:
                    for sec in ["responsibilities", "qualifications"]:
                        if any(re.search(p, header_name) for p in self.SECTION_PATTERNS[sec]):
                            matched_sec = sec
                            break

                current_section = matched_sec
                if inline_content and current_section and current_section in section_buffers:
                    section_buffers[current_section].append(inline_content)
                continue

            if current_section and current_section in section_buffers:
                section_buffers[current_section].append(line)

        # 3. Extract items per section
        raw_required = self._extract_items("\n".join(section_buffers["required_skills"]))
        raw_preferred = self._extract_items("\n".join(section_buffers["preferred_skills"]))
        responsibilities = self._extract_items("\n".join(section_buffers["responsibilities"]))
        qualifications = self._extract_items("\n".join(section_buffers["qualifications"]))

        # 4. Canonicalize skills and ensure strict separation
        required_skills = self._canonicalize_skill_items(raw_required)
        preferred_skills = self._canonicalize_skill_items(raw_preferred)

        # Strictly exclude required skills from preferred skills so there is zero overlap
        req_set = {s.lower() for s in required_skills}
        preferred_skills = [p for p in preferred_skills if p.lower() not in req_set]

        return JobDescription(
            title=title or "Unspecified Role",
            required_skills=required_skills,
            preferred_skills=preferred_skills,
            responsibilities=responsibilities,
            qualifications=qualifications,
            raw_text=raw_text
        )


jd_parser = JobDescriptionParser()
