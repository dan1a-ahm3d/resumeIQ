# ResumeIQ: Recruiter Decision-Support Intelligence Platform
**Final Internship Technical Report**  
**Author:** Software Engineering Intern  
**Date:** October 2026  
**Repository:** `dan1a-ahm3d/resumeIQ`  
**Verified Commit:** `bd75757`

---

## 1. Introduction

In modern technical recruitment, talent acquisition teams face unprecedented volumes of applicant resumes for specialized engineering requisitions. Manual resume screening is labor-intensive, vulnerable to fatigue-induced inconsistencies, and prone to subjective evaluation variances. While recent industry trends have turned toward generative Large Language Models (LLMs) to automate hiring workflows, generative approaches introduce unacceptable operational risks: stochastic hallucinations, non-verifiable scoring criteria, lack of explainability, and opaque algorithmic bias.

ResumeIQ was engineered to resolve these challenges by providing an objective, explainable, and deterministic **recruiter decision-support system**. Rather than delegating employment determinations to an uncalibrated black-box, ResumeIQ provides transparent lexical alignment metrics, verified sentence-level evidence citations, and deterministic candidate rankings. Final hiring decisions, qualification assessments, and interview selections remain strictly within the purview of human recruiting professionals.

---

## 2. Abstract

ResumeIQ is a full-stack, decoupled recruitment intelligence platform built using Next.js 14, React 18, TypeScript, and a stateless Python FastAPI backend. The platform provides automated resume ingestion, job description parsing, technical skill detection, and dual-metric scoring. Candidate evaluation combines sublinear TF-IDF cosine similarity (70%) and explicit required-skill coverage (30%), paired with page-level textual citations and strict non-inferential absence framing (*"Not found in resume"*). 

The platform incorporates comprehensive production hardening, including 10MB upload limits, PDF magic-byte validation, 50-candidate batch capping, and candidate failure isolation. Evaluated against an automated synthetic benchmark (10 resumes across 4 job requisitions), ResumeIQ achieved 100% precision, 100% recall, 100% F1 score, and 1.0000 Mean NDCG@5 ranking quality, while strictly preserving frozen regression baselines (`candidate_alpha.pdf` vs `ml_engineer.txt` yielding 40.76 overall score).

---

## 3. Tools Used

### Frontend Architecture
- **Next.js 14.2.15 (App Router):** Server-side prerendering, dynamic routing, and modular code organization across 11 user-facing page routes.
- **React 18.3.1 & TypeScript 5.6.3:** Type-safe component architecture, state management, and API contract interfaces.
- **Tailwind CSS 3.4.14 & Stitch UI:** Curated color palettes, elevation tokens, responsive layouts, and accessible UI controls.
- **Lucide React:** Consistent iconography for recruitment statuses and navigation.

### Backend & API Framework
- **Python 3.11 & FastAPI 0.110.0:** High-performance, asynchronous REST API gateway serving OpenAPI/Swagger specifications.
- **Uvicorn 0.28.0:** ASGI production web server.
- **Pydantic v2.6.4 & Pydantic-Settings v2.2.1:** Strict request/response schema validation and startup configuration enforcement.

### NLP & Vectorization Engine
- **PyMuPDF (`fitz`) 1.23.26:** High-throughput, in-memory PDF extraction and page-level metadata tracking.
- **spaCy 3.7.4 (`en_core_web_sm`):** Linguistic preprocessing, lemmatization, stop-word removal, and technical token protection (`c++`, `node.js`, `ci/cd`).
- **scikit-learn 1.4.1:** Sublinear TF-IDF vectorization (`ngram_range=(1, 2)`) and cosine similarity matrix computation.

### Testing & Verification
- **Pytest 9.1.1 & AnyIO 4.15.1:** Automated test suite encompassing 59 unit, integration, and security regression tests.
- **HTTPX 0.27.0:** Asynchronous HTTP client for API integration testing.

---

## 4. Steps Involved

The development of ResumeIQ progressed through six structured engineering milestones:

### Step 1: Design System & Frontend Architecture (Milestone 1)
Extracted visual and ergonomic specifications from the Stitch recruitment design language. Built an interactive recruiter workspace across 11 primary application routes (`/overview`, `/new-analysis`, `/requirements-review`, `/analysis`, `/candidates/[id]`, `/reports`, etc.). Created modular components including drag-and-drop resume zones, candidate comparison grids, and side-by-side evidence inspection modals.

### Step 2: Backend Architecture & Core NLP Pipeline (Milestone 2)
Engineered the stateless FastAPI service. Implemented in-memory PDF extraction via PyMuPDF, omitting OCR to prevent heavy binary dependencies. Built custom regex and token protection in spaCy to prevent truncation of punctuated technical terms (e.g., preserving `C++`, `C#`, and `.NET`). Structured the JD parser to strictly isolate mandatory required skills from preferred skills.

### Step 3: End-to-End Integration & Explainability Engine (Milestone 3)
Connected Next.js client services to FastAPI endpoints (`/api/v1/analyze/match` and `/api/v1/analyze/rank`). Designed the explainability engine to extract sentence-level context and page numbers for verified skills. Implemented a strict non-inferential framing policy: skills not identified in text are explicitly marked *"Not found in resume"* rather than assuming candidate incompetence.

### Step 4: Objective Evaluation Harness (Milestone 4)
Developed an automated, reproducible benchmark framework (`backend/evaluation/`). Generated 10 synthetic resumes and 4 technical job requisitions free of demographic or personal identifiers. Established expert ground-truth annotations for skill extraction and candidate rankings. Formulated mathematical evaluation metrics including Micro/Macro Precision, Recall, F1 score, and NDCG@K.

### Step 5: Matching Tuning & Boundary Protection (Milestone 5)
Diagnosed and eliminated false-positive skill detections. Implemented dual-boundary regex patterns for C and C++ to prevent character collision with single English letters. Added case-sensitive deterministic rules for Go programming language. Removed ambiguous bare aliases (`node`, `rest`). Validated the central scoring formula ($0.70 \times \text{Similarity} + 0.30 \times \text{Coverage}$) through controlled weighting experiments (50/50, 60/40, 70/30, 80/20).

### Step 6: Production Hardening & Security Controls (Milestone 6)
Hardened API endpoints against Denial of Service and malicious payloads:
- Implemented a 10MB file size limit (`HTTP 413 Payload Too Large`).
- Added PDF magic-byte header validation (`b"%PDF-"`), rejecting fake or empty files (`HTTP 400`).
- Implemented a 50-file batch limit on `/rank` (`HTTP 400`).
- Engineered batch failure isolation, allowing valid resumes to be ranked while isolating corrupt files into structured warnings.
- Sanitized exception handlers to prevent internal stack trace leakage.

---

## 5. Conclusion

ResumeIQ demonstrates that deterministic, rule-assisted NLP heuristics provide a superior foundation for recruitment decision-support compared to opaque generative AI. By anchoring evaluations in verified textual citations, transparent TF-IDF lexical similarity, and controlled skill taxonomy matching, the platform eliminates hallucination risks while delivering complete auditability.

All core objectives were achieved: 59 automated backend tests passing, 13 frontend build routes successfully compiled, 100% precision/recall on the controlled benchmark dataset, and exact preservation of the frozen regression anchor (candidate_alpha yielding 40.76). Future development will explore optical character recognition (OCR) plugins for scanned archives and multi-language ontology mappings.
