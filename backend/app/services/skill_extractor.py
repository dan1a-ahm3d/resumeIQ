"""
Controlled Technical Skill Taxonomy & Evidence Extractor.
Features 100+ technical skills with aliases.
STRICT ANTI-INFERENCE & TOKEN-BOUNDARY POLICY:
1. Only report skills that directly appear in the text or through explicit aliases.
2. NEVER infer unmentioned technologies (e.g., 'React' does not infer 'JavaScript' or 'Node.js').
3. 'C++' or 'C#' must NOT produce 'C' unless standalone 'C' is independently present.
4. Extracts verifiable verbatim context for every detected skill.
"""
import re
from typing import List, Dict, Optional, Tuple, Set
from app.models.analysis import SkillEvidence
from app.models.resume import ParsedResume

# Canonical taxonomy mapping canonical name to regex-ready aliases
CONTROLLED_SKILL_TAXONOMY: Dict[str, List[str]] = {
    # Programming Languages
    "Python": ["python", "python3", "py"],
    "Java": ["java"],
    "C": ["c"],
    "C++": ["c++", "cplusplus", "cpp"],
    "C#": ["c#", "csharp", "c-sharp"],
    "JavaScript": ["javascript", "js", "ecmascript"],
    "TypeScript": ["typescript", "ts"],
    "Go": ["golang", "go lang", "go"],
    "Rust": ["rust", "rustlang"],
    "Ruby": ["ruby"],
    "PHP": ["php"],
    "SQL": ["sql"],
    "Bash": ["bash", "shell scripting", "shell script"],
    "R": ["r language", "r-project"],
    "Scala": ["scala"],
    "Kotlin": ["kotlin"],
    "Swift": ["swift"],
    "Dart": ["dart"],

    # Web & Frontend Frameworks
    "React": ["react", "reactjs", "react.js"],
    "Next.js": ["nextjs", "next.js", "next js"],
    "Vue.js": ["vue", "vuejs", "vue.js"],
    "Angular": ["angular", "angularjs", "angular.js"],
    "HTML": ["html", "html5"],
    "CSS": ["css", "css3"],
    "Tailwind CSS": ["tailwind css", "tailwind", "tailwindcss"],
    "Bootstrap": ["bootstrap", "twitter bootstrap"],
    "Sass": ["sass", "scss"],
    "Redux": ["redux", "redux toolkit"],

    # Backend & Web Frameworks
    "Node.js": ["nodejs", "node.js", "node js"],
    "FastAPI": ["fastapi", "fast api", "fast-api"],
    "Flask": ["flask"],
    "Django": ["django", "django rest framework", "drf"],
    "Express.js": ["express", "expressjs", "express.js"],
    "Spring Boot": ["spring boot", "springboot", "spring framework"],
    "ASP.NET": ["asp.net", "aspnet", "asp.net core"],
    ".NET": [".net", "dotnet", ".net core"],
    "Ruby on Rails": ["ruby on rails", "rails"],
    "GraphQL": ["graphql", "apollo graphql"],
    "REST API": ["rest api", "restful api", "rest apis", "restful apis", "restful"],
    "gRPC": ["grpc"],
    "WebSockets": ["websockets", "websocket"],
    "Microservices": ["microservices", "microservice architecture"],

    # Databases & Storage
    "PostgreSQL": ["postgresql", "postgres", "psql"],
    "MySQL": ["mysql"],
    "MongoDB": ["mongodb", "mongo"],
    "Redis": ["redis"],
    "SQLite": ["sqlite", "sqlite3"],
    "Elasticsearch": ["elasticsearch", "elastic search"],
    "Cassandra": ["cassandra", "apache cassandra"],
    "DynamoDB": ["dynamodb", "aws dynamodb"],
    "Oracle": ["oracle db", "oracle database"],
    "MS SQL Server": ["sql server", "mssql", "microsoft sql server"],
    "Neo4j": ["neo4j"],

    # DevOps, Cloud & Infrastructure
    "Docker": ["docker", "docker containers", "docker compose"],
    "Kubernetes": ["kubernetes", "k8s"],
    "AWS": ["aws", "amazon web services", "amazon aws"],
    "Azure": ["azure", "microsoft azure"],
    "GCP": ["gcp", "google cloud platform", "google cloud"],
    "Git": ["git"],
    "GitHub": ["github"],
    "GitLab": ["gitlab"],
    "Linux": ["linux", "unix", "ubuntu", "centos", "debian"],
    "CI/CD": ["ci/cd", "cicd", "continuous integration", "continuous deployment"],
    "Jenkins": ["jenkins"],
    "Terraform": ["terraform"],
    "Ansible": ["ansible"],
    "Nginx": ["nginx"],
    "Apache": ["apache web server", "apache httpd"],

    # Machine Learning, Data Science & AI
    "Machine Learning": ["machine learning", "ml"],
    "Deep Learning": ["deep learning", "dl"],
    "NLP": ["nlp", "natural language processing"],
    "Computer Vision": ["computer vision", "cv"],
    "PyTorch": ["pytorch", "torch"],
    "TensorFlow": ["tensorflow", "tf"],
    "scikit-learn": ["scikit-learn", "scikitlearn", "sklearn", "scikit learn"],
    "Pandas": ["pandas"],
    "NumPy": ["numpy"],
    "Keras": ["keras"],
    "spaCy": ["spacy"],
    "NLTK": ["nltk"],
    "OpenCV": ["opencv"],
    "Hugging Face": ["hugging face", "huggingface"],
    "MLOps": ["mlops"],
    "Data Engineering": ["data engineering"],
    "ETL": ["etl", "extract transform load"],
    "Apache Spark": ["apache spark", "spark", "pyspark"],
    "Apache Kafka": ["apache kafka", "kafka"],
    "Power BI": ["power bi", "powerbi"],
    "Tableau": ["tableau"],

    # Testing & Software Engineering
    "PyTest": ["pytest"],
    "JUnit": ["junit"],
    "Jest": ["jest"],
    "Mocha": ["mocha"],
    "Selenium": ["selenium"],
    "Cypress": ["cypress"],
    "Agile": ["agile", "scrum", "kanban"],
    "Jira": ["jira"],
}


class SkillExtractorService:
    def __init__(self):
        # Precompile exact boundary patterns for each skill and alias
        self.skill_patterns: List[Tuple[str, re.Pattern, str]] = []

        # Short ambiguous technical acronyms requiring case-sensitive uppercase matching
        CASE_SENSITIVE_ACRONYMS = {"ml", "cv", "dl", "tf"}

        for canonical, aliases in CONTROLLED_SKILL_TAXONOMY.items():
            for alias in aliases:
                escaped = re.escape(alias)
                # Specialized boundary & context handling:
                # 1. C: Must NOT be followed by + (C++) or # (C#) or word chars, and not preceded by word chars or hyphen/dot
                if alias == "c":
                    pattern_str = rf"(?i)(?<![A-Za-z0-9_.\-])c(?![A-Za-z0-9_+#])"
                # 2. C++, C#, .NET: require lookaround boundary respecting symbols
                elif alias in ["c++", "c#", ".net"]:
                    pattern_str = rf"(?i)(?<![A-Za-z0-9_]){escaped}(?![A-Za-z0-9_+#])"
                # 3. Go: case-sensitive 'Go' preventing collisions with English verb 'go'
                elif alias == "go":
                    pattern_str = rf"(?<![A-Za-z0-9_])Go(?![A-Za-z0-9_])(?!\s+(?:beyond|to\b|into\b|through\b|for\b|ahead\b))"
                # 4. Short ambiguous acronyms (ML, CV, DL, TF): require exact uppercase
                elif alias in CASE_SENSITIVE_ACRONYMS:
                    pattern_str = rf"(?<![A-Za-z0-9_]){re.escape(alias.upper())}(?![A-Za-z0-9_])"
                # 5. Standard skills: case-insensitive with word boundaries
                else:
                    pattern_str = rf"(?i)(?<![A-Za-z0-9_]){escaped}(?![A-Za-z0-9_])"
                
                try:
                    compiled = re.compile(pattern_str)
                    self.skill_patterns.append((canonical, compiled, alias))
                except re.error:
                    continue
    def extract_skills_from_text(self, text: str, page_number: int = 1) -> List[SkillEvidence]:
        """
        Extracts skills from text with exact verbatim sentence context.
        Applies dual-layer containment check to prevent shorter sub-tokens
        (like 'C' from 'C++' or 'C#') from matching within longer compound terms.
        """
        if not text:
            return []

        # Split text into sentences/lines for context extraction
        lines_and_sentences = re.split(r"(?<=[.!?])\s+|[\r\n]+", text)
        found_skills: Dict[str, SkillEvidence] = {}

        for segment in lines_and_sentences:
            clean_segment = segment.strip()
            if not clean_segment:
                continue

            # Collect all candidate matches with their character spans in this segment
            segment_matches: List[Tuple[int, int, str, str]] = []
            for canonical, pattern, alias in self.skill_patterns:
                for match in pattern.finditer(clean_segment):
                    segment_matches.append((
                        match.start(),
                        match.end(),
                        canonical,
                        match.group(0)
                    ))

            # Sort matches by span length descending (longer tokens prioritized)
            segment_matches.sort(key=lambda m: (-(m[1] - m[0]), m[0]))

            # Filter out sub-tokens whose spans are strictly contained within a longer accepted span
            accepted_spans: List[Tuple[int, int, str, str]] = []
            for start, end, canonical, token in segment_matches:
                is_subtoken = False
                for a_start, a_end, a_canonical, _ in accepted_spans:
                    # If this match is completely within a longer match span, reject it
                    if a_start <= start and end <= a_end and (start != a_start or end != a_end):
                        is_subtoken = True
                        break
                if not is_subtoken:
                    accepted_spans.append((start, end, canonical, token))

            # Store unique detected skills with context
            for _, _, canonical, matched_str in accepted_spans:
                if canonical not in found_skills:
                    found_skills[canonical] = SkillEvidence(
                        skill=canonical,
                        matched_text=matched_str,
                        page_number=page_number,
                        context=clean_segment
                    )

        return list(found_skills.values())

    def extract_skills_from_resume(self, parsed_resume: ParsedResume) -> List[SkillEvidence]:
        """
        Extracts skills from all pages of a parsed resume, preserving page numbers.
        Deduplicates by canonical skill name while retaining best context.
        """
        all_evidences: Dict[str, SkillEvidence] = {}

        for page in parsed_resume.pages:
            page_evidences = self.extract_skills_from_text(page.text, page.page_number)
            for ev in page_evidences:
                if ev.skill not in all_evidences:
                    all_evidences[ev.skill] = ev

        if not all_evidences and parsed_resume.full_text:
            text_evidences = self.extract_skills_from_text(parsed_resume.full_text, 1)
            for ev in text_evidences:
                all_evidences[ev.skill] = ev

        return list(all_evidences.values())

    def extract_canonical_skills_set(self, text: str) -> Set[str]:
        """Returns just the set of canonical skill names detected in a text."""
        evidences = self.extract_skills_from_text(text, 1)
        return {ev.skill for ev in evidences}


skill_extractor = SkillExtractorService()
