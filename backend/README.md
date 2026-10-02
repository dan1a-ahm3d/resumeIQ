# ResumeIQ — FastAPI + NLP Intelligence Backend

## 1. Architecture Overview
ResumeIQ is a recruiter decision-support platform designed to parse resume PDFs, extract technical competencies deterministically, calculate TF-IDF cosine similarity against Job Descriptions (JDs), evaluate required-skill coverage, and produce evidence-backed matching scores with citations.

The backend is built around a decoupled classical NLP pipeline:
```
PDF Upload
    │
    ▼
[PyMuPDF (fitz)] ───► Page-by-Page Text Extraction (Preserves Page Numbers)
    │
    ▼
[Text Preprocessor] ─► Preserves Technical Terminology (C++, C#, .NET, Node.js, etc.)
    │
    ├────────────────────────────────────────┬───────────────────────────────────────┐
    ▼                                        ▼                                       ▼
[Skill Extractor]                   [TF-IDF Vectorizer]                     [JD Parser]
Controlled Taxonomy (100+ skills)    Cosine Similarity Calculation          Section & Requirements
Exact Boundary Matching             (0.0 to 100.0%)                         Detection
Strict Anti-Inference Policy
    │                                        │                                       │
    └───────────────────┬────────────────────┘                                       │
                        ▼                                                            │
              [Explanation Service] ◄────────────────────────────────────────────────┘
              Matches Requirements & Generates Verbatim Citations
              Factual Non-Judgmental Absence Statements
                        │
                        ▼
                 [Scoring Engine]
                 70% Text Similarity + 30% Required Skill Coverage
                 (Configurable via centralized Settings)
                        │
                        ▼
             [FastAPI Endpoints / Ranker]
             JSON Responses & Multi-Candidate Ranking (Overall Score DESC)
```

---

## 2. Technology Stack
- **Language**: Python 3.11+
- **API Framework**: FastAPI & Uvicorn
- **Data Modeling & Validation**: Pydantic v2 & Pydantic-Settings
- **PDF Extraction**: PyMuPDF (`fitz`)
- **NLP & Tokenization**: spaCy (`en_core_web_sm`)
- **Vectorization & Similarity**: scikit-learn (`TfidfVectorizer`, `cosine_similarity`)
- **Data Handling**: Pandas & NumPy
- **Testing**: pytest & HTTPX (`TestClient`)

*Note: In accordance with production explainability principles, no black-box LLMs, LangChain, or neural hallucination layers are used.*

---

## 3. Directory Structure
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                     # FastAPI application entrypoint & middleware
│   ├── api/
│   │   ├── __init__.py
│   │   ├── health.py               # GET /api/v1/health
│   │   └── analysis.py             # POST /resume, POST /match, POST /rank
│   ├── core/
│   │   ├── __init__.py
│   │   └── config.py               # Central weights, CORS, & platform settings
│   ├── models/
│   │   ├── __init__.py
│   │   ├── resume.py               # ParsedResume & ResumePage models
│   │   ├── job.py                  # JobDescription models
│   │   └── analysis.py             # Scoring, SkillEvidence, & Ranking models
│   └── services/
│       ├── __init__.py
│       ├── pdf_parser.py           # PyMuPDF page-by-page extraction
│       ├── preprocessor.py         # Technical token preservation & cleaning
│       ├── jd_parser.py            # Deterministic section-based JD parsing
│       ├── skill_extractor.py      # Controlled taxonomy (100+ skills) & anti-inference
│       ├── similarity.py           # TF-IDF vectorizer & cosine similarity
│       ├── scoring.py              # 70/30 explainable scoring engine
│       └── explanation.py          # Verbatim citations & factual absence framing
├── data/
│   ├── jobs/                       # Synthetic job descriptions
│   └── resumes/                    # Synthetic test candidate PDFs
├── tests/
│   ├── __init__.py
│   ├── test_pdf_parser.py          # Extraction, pagination, & whitespace tests
│   ├── test_preprocessor.py        # Term preservation (C++, .NET, etc.)
│   ├── test_jd_parser.py           # Section parsing tests
│   ├── test_skill_extractor.py     # Taxonomy, aliases, & anti-inference tests
│   ├── test_similarity.py          # TF-IDF similarity & boundary tests
│   ├── test_scoring.py             # Weights validation & component breakdown
│   ├── test_explanation.py         # Verbatim citations & missing evidence tests
│   └── test_api_endpoints.py       # FastAPI HTTP endpoint & ranking tests
├── requirements.txt
└── README.md
```

---

## 4. Installation & Setup

### 1. Create Virtual Environment
```bash
cd backend
python -m venv .venv

# On Windows:
.venv\Scripts\activate

# On Linux/macOS:
source .venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Download spaCy English Model
```bash
python -m spacy download en_core_web_sm
```

---

## 5. Running the Backend

### Start Development Server
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at:
- **Base URL**: `http://localhost:8000`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`
- **Alternative ReDoc**: `http://localhost:8000/redoc`

---

## 6. Running Tests
To run the automated test suite with full coverage:
```bash
pytest -v
```

---

## 7. API Endpoints

### `GET /api/v1/health`
Health check endpoint returning platform availability.
- **Response**: `{"status": "ok", "service": "ResumeIQ API"}`

### `POST /api/v1/analyze/resume`
Accepts a single PDF file (multipart form) and extracts structured text, page count, detected skills, and warnings.

### `POST /api/v1/analyze/match`
Evaluates a single resume PDF against a Job Description string.
- **Form Data**:
  - `file`: Resume PDF
  - `job_description`: Raw job description text
- **Output**: Full `CandidateAnalysis` object including component-level scores, TF-IDF cosine similarity, required skill coverage, detected skills, and citations.

### `POST /api/v1/analyze/rank`
Ranks multiple candidate resumes against one Job Description.
- **Form Data**:
  - `files`: Multiple Resume PDFs
  - `job_description`: Raw job description text
- **Output**: Ranked candidate list ordered by `overall_score` descending with deterministic tie-breaking.

---

## 8. Scoring Methodology
Weights are defined centrally in `app/core/config.py`:
- `TEXT_SIMILARITY_WEIGHT`: **0.70** (70%)
- `REQUIRED_SKILL_WEIGHT`: **0.30** (30%)

Formula:
$$	ext{Overall Score} = (0.70 	imes 	ext{Text Similarity}) + (0.30 	imes 	ext{Skill Coverage})$$

Both input factors operate on a strictly bounded 0.0 to 100.0 scale. Total weights are validated via Pydantic model validators to ensure they strictly sum to 1.0.

---

## 9. Explainability & Factual Absence Framing
ResumeIQ is designed to prevent unfair negative assumptions about candidates.
- **Matched Skills**: The system extracts the verbatim sentence from the resume as direct citation evidence along with the exact PDF page number.
- **Unmatched Skills**: Rather than declaring "Candidate lacks skill X", the system strictly outputs:
  > *"X was not found in the extracted resume text."*

### Strict Anti-Inference Policy
The skill extractor enforces an anti-inference guarantee:
- If a resume mentions **"React"**, the system will **NOT** infer "JavaScript", "HTML", "CSS", or "Node.js".
- Only skills that independently and explicitly appear in the document (or via verified aliases like `ReactJS` $
ightarrow$ `React`) are recorded.

---

## 10. Known Limitations & Why OCR is Not Included
1. **OCR Omission**: Optical Character Recognition (OCR for scanned bitmap PDFs) is intentionally excluded in Milestone 2 to maintain a lightweight, deterministic, and self-contained footprint without heavy native dependencies (e.g. Tesseract). Image-only PDFs will return an explicit warning:
   > *"No extractable text was found. OCR is not supported in the current version."*
2. **Deterministic Sections**: Job description parsing utilizes structural pattern matching. Non-standard job descriptions without clear section headings default to extracting general technical skills across the entire text.

---

## 11. Ethical & Decision-Support Notice
> [!IMPORTANT]
> **ResumeIQ is an assistive decision-support tool for recruiters.** It does **not** make hiring, shortlisting, or rejection decisions. All rankings and scores are mathematical heuristics designed to highlight relevant evidence; human recruiters maintain final decision authority.
---

## 12. Production Hardening & Input Safeguards
Implemented in Milestone 6 to ensure robust, resilient, and safe production operation:

### 1. File Upload Size Enforcement (10MB Limit)
- All upload endpoints (`/api/v1/analyze/resume`, `/api/v1/analyze/match`, `/api/v1/analyze/rank`) enforce the centralized `settings.MAX_FILE_SIZE_BYTES = 10MB` limit.
- Uploads exceeding 10MB are rejected immediately with `HTTP 413 Payload Too Large`.

### 2. PDF Magic Byte Signature Validation
- File content is validated for the standard PDF magic header signature (`%PDF-`).
- Renamed non-PDF files (e.g., text, binaries, or HTML disguised with a `.pdf` extension) are rejected upfront with `HTTP 400 Bad Request`.

### 3. Batch Size Capping (50 Candidates)
- The `/api/v1/analyze/rank` endpoint enforces `settings.MAX_RANK_BATCH_SIZE = 50`.
- Requests containing more than 50 files are rejected with `HTTP 400 Bad Request` to prevent resource exhaustion and request timeouts.

### 4. Batch Failure Isolation
- In batch ranking (`/api/v1/analyze/rank`), individual candidate parsing errors (e.g., a corrupt PDF among valid resumes) are isolated.
- Valid resumes continue to be parsed, scored, and ranked.
- Failed candidates are recorded in structured response fields: `failed_candidates: [{"filename": "...", "error": "..."}]` and `warnings: ["..."]`.
- If all uploaded candidates in the batch are invalid, the endpoint returns an overall `HTTP 400 Bad Request` detailing the causes.

### 5. Ephemeral In-Memory Processing
- Uploaded PDF streams are processed purely in-memory via PyMuPDF buffers and garbage-collected upon request completion.
- No resume bytes or extracted candidate texts are written to disk or stored in persistent databases.
