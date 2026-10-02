# ResumeIQ — REST API Reference

The ResumeIQ backend exposes RESTful endpoints under the base prefix `/api/v1`.  
Interactive documentation is available at [http://127.0.0.1:8001/docs](http://127.0.0.1:8001/docs) (Swagger UI) and [http://127.0.0.1:8001/redoc](http://127.0.0.1:8001/redoc).

---

## 1. System Endpoints

### `GET /`
Returns root service metadata and documentation links.
- **Status:** `200 OK`
- **Response:**
  ```json
  {
    "service": "ResumeIQ API",
    "version": "1.0.0",
    "docs_url": "/docs",
    "api_v1": "/api/v1"
  }
  ```

### `GET /api/v1/health`
Health check endpoint reporting API operational status.
- **Status:** `200 OK`
- **Response:**
  ```json
  {
    "status": "ok",
    "service": "ResumeIQ API",
    "version": "1.0.0"
  }
  ```

---

## 2. Analysis Endpoints

### `POST /api/v1/analyze/resume`
Parses a single resume PDF and extracts detected technical skills.
- **Content-Type:** `multipart/form-data`
- **Parameters:**
  - `file: UploadFile` (Required) — Resume PDF document (max 10MB).
- **Validation:**
  - File must end with `.pdf`.
  - Content must start with `%PDF-` byte header.
  - File size must not exceed 10MB (`MAX_FILE_SIZE_BYTES`).
- **Status Codes:**
  - `200 OK`: Successful parse.
  - `400 Bad Request`: Not a PDF, missing `%PDF-` header, or empty file.
  - `413 Payload Too Large`: File exceeds 10MB.
  - `422 Unprocessable Entity`: Corrupt PDF stream unreadable by PyMuPDF.

---

### `POST /api/v1/analyze/match`
Evaluates a single resume PDF against a Job Description.
- **Content-Type:** `multipart/form-data`
- **Parameters:**
  - `file: UploadFile` (Required) — Resume PDF document.
  - `job_description: str` (Required Form field) — Raw job description text.
- **Status Codes:**
  - `200 OK`: Successful match and evaluation.
  - `400 Bad Request`: Empty job description, missing `%PDF-` header, or empty file.
  - `413 Payload Too Large`: File exceeds 10MB.
- **Key Response Fields:**
  - `overall_score`: Weighted match score (0.0 to 100.0).
  - `text_similarity_percentage`: TF-IDF cosine similarity percentage.
  - `skill_coverage_percentage`: Required skill coverage percentage.
  - `matched_skills`: List of required skills documented in resume.
  - `missing_skills`: List of required skills not found in resume.
  - `evidence`: List of `RequirementEvidence` objects with sentence context citations.
  - `warnings`: Diagnostic notices (e.g., low character count warnings).

---

### `POST /api/v1/analyze/rank`
Ranks a batch of resume PDFs against a single Job Description.
- **Content-Type:** `multipart/form-data`
- **Parameters:**
  - `files: List[UploadFile]` (Required) — 1 to 50 resume PDF files.
  - `job_description: str` (Required Form field) — Raw job description text.
- **Security & Boundary Limits:**
  - Batch size capped at 50 files (`MAX_RANK_BATCH_SIZE`). Requests with >50 files return `400 Bad Request`.
  - Individual candidate failure isolation: If one file is corrupt or non-PDF, it is isolated into `failed_candidates` without aborting the batch.
  - If all candidate files in the batch fail, endpoint returns `400 Bad Request`.
- **Status Codes:**
  - `200 OK`: Successful ranking.
  - `400 Bad Request`: Batch > 50 files, empty JD, or all files failed.
  - `413 Payload Too Large`: Any single file exceeds 10MB.
- **Key Response Fields:**
  - `job_title`: Evaluated position title.
  - `total_candidates`: Count of successfully evaluated candidates.
  - `rankings`: List of `CandidateRanking` objects sorted descending by `overall_score`.
  - `warnings`: Aggregated non-fatal batch warnings.
  - `failed_candidates`: List of objects containing `filename` and `error` description for any failed files.
