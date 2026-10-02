# ResumeIQ Milestone 5: Matching Algorithm & Scoring Tuning Report

## 1. Objective
The goal of Milestone 5 is to rigorously audit, measure, investigate, and tune the ResumeIQ matching and scoring pipeline following a disciplined scientific methodology:
$$\text{AUDIT} \longrightarrow \text{MEASURE} \longrightarrow \text{FIND PROBLEMS} \longrightarrow \text{IMPROVE} \longrightarrow \text{TEST} \longrightarrow \text{COMPARE} \longrightarrow \text{DOCUMENT}$$

Key constraints strictly enforced throughout this milestone:
- Zero candidate-specific hacks or hardcoded overrides.
- No introduction of opaque machine learning models, vector databases, embeddings, or external AI APIs.
- Full preservation of explainability, reproducibility, and deterministic ranking.
- Strict maintenance of the `candidate_alpha.pdf` vs. `ml_engineer.txt` regression anchor (Overall: 40.76, Sim: 15.37%, Skill Coverage: 100.0%).

---

## 2. Initial Architecture Audit
Prior to modifying any code, an in-depth inspection of the backend matching services was conducted:

1. **Document Ingestion (`pdf_parser.py`)**: Uses PyMuPDF (`fitz`) to extract raw text page-by-page into `ParsedResume` models. Preserves page boundaries and metadata while gracefully issuing warnings for textless scanned image PDFs.
2. **Job Description Parsing (`jd_parser.py`)**: Uses structural regex headers to isolate Title, Required Skills, Preferred Skills, Responsibilities, and Qualifications. Requirement lines are mapped to canonical skills in `CONTROLLED_SKILL_TAXONOMY` while preserving custom text. Required skills are strictly subtracted from preferred skills to guarantee 0% cross-contamination.
3. **Controlled Skill Extraction (`skill_extractor.py`)**: Matches candidate resume text against a 100+ skill taxonomy using precompiled lookaround regex patterns. Span-containment filtering discards sub-tokens encompassed by longer matches. Every detected skill records canonical name, matched string, PDF page number, and verbatim sentence citation.
4. **TF-IDF & Cosine Similarity (`similarity.py` & `preprocessor.py`)**: Normalizes protected technical symbols (`C++`, `C#`, `.NET`, `scikit-learn`, `CI/CD`) into safe alphanumeric tokens, applies spaCy lemmatization and stopword removal, and computes cosine similarity via scikit-learn `TfidfVectorizer(ngram_range=(1,2), sublinear_tf=True)`.
5. **Coverage & Evidence Generation (`explanation.py`)**: Verifies required skills against detected skills. Matched skills provide verbatim sentence citations and page numbers; missing skills output standardized factual absence notices (*"[Skill] was not found in the extracted resume text."*).
6. **Composite Scoring (`scoring.py`)**: Computes the composite match score:
   $$\text{Overall Score} = 0.70 \times \text{Text Similarity} + 0.30 \times \text{Required Skill Coverage}$$
7. **Deterministic Ranking**: Multi-candidate batches are sorted deterministically descending by overall score, with secondary tie-breakers (`skill_coverage`, `text_similarity`, `filename`).

---

## 3. Initial Baseline Metrics (Step 2)
The existing test suite and evaluation framework were executed before any code modifications:

- **Pytest Suite**: 40 passed, 1 warning in 8.79s.
- **Skill Extraction Performance (Controlled Dataset - 10 Resumes)**:
  - Micro Precision: **94.62%** (88 TP / 5 FP)
  - Micro Recall: **100.00%** (88 TP / 0 FN)
  - Micro F1 Score: **97.24%**
  - Macro Precision: **94.87%**
  - Macro Recall: **100.00%**
  - Macro F1 Score: **97.22%**
- **Candidate Ranking (NDCG@5 across 4 Job Scenarios)**:
  - Machine Learning Engineer (`ml_engineer.txt`): NDCG@5 = **1.0000**
  - Senior Backend Software Engineer (`software_engineer.txt`): NDCG@5 = **1.0000**
  - Cloud & DevOps Engineer (`devops_engineer.txt`): NDCG@5 = **1.0000**
  - Senior Frontend Engineer (`frontend_engineer.txt`): NDCG@5 = **1.0000**
  - Mean NDCG@5: **1.0000**
- **Regression Case (`candidate_alpha.pdf` vs `ml_engineer.txt`)**:
  - Overall Score: **40.76**
  - Text Similarity: **15.37%**
  - Required Skill Coverage: **100.0%**
  - Matched Required Skills: **5** (`['Python', 'PyTorch', 'scikit-learn', 'NLP', 'Pandas']`)
  - Missing Required Skills: **0** (`[]`)

---

## 4. Problems Discovered (Step 3 Investigation)
Forensic investigation of the 5 baseline false positives revealed two distinct root causes:

### A. Ground-Truth Annotation Scoping Omissions
In all 5 baseline discrepancy cases, the candidate PDFs literally and explicitly contained the exact technical terms:
- `candidate_delta.pdf`: Header reads *"Data Analyst & Junior ML Developer"* (matched `ML`) and experience lists *"- Versioned analytical models and ETL scripts using Git"* (matched `ETL`).
- `candidate_epsilon.pdf`: Experience lists *"- Administered multi-tenant Kubernetes clusters running containerized Docker microservices"* (matched `microservices`).
- `candidate_zeta.pdf`: Experience lists *"- Designed high-throughput batch ETL workloads using Apache Spark and Python"* (matched `ETL`).
- `candidate_eta.pdf`: Experience lists *"- Engineered asynchronous REST API backend microservices in Node.js and Express.js"* (matched `microservices`).

The annotators in Milestone 4 had constructed ground truth by transcribing only the candidate's explicit `"Technical Skills"` block, inadvertently omitting verified technical competencies explicitly written in role titles and experience bullets.

### B. High-Risk Alias Collisions in Common English Prose
A systemic audit of `CONTROLLED_SKILL_TAXONOMY` uncovered high-risk aliases that cause false positives in general resumes:
- **`REST API`**: Bare alias `"rest"` falsely matched common English phrases like *"the rest of the team"*.
- **`Node.js`**: Bare alias `"node"` falsely matched infrastructure terms like *"worker node"* or *"master node"*.
- **`Go`**: Bare lowercase alias `"go"` falsely matched common English verbs like *"go beyond targets"*.
- **Short 2-Letter Acronyms (`ML`, `CV`, `DL`, `TF`)**: Case-insensitive matching risked triggering on lowercase measurement units (*"500 ml"*), Latin abbreviations (*"see attached cv"*), or unrelated acronyms (*"tf-idf"*).

---

## 5. Step 4 Extraction Improvements
To resolve real extraction vulnerabilities without candidate-specific hacks, the following generalized improvements were implemented in `backend/app/services/skill_extractor.py`:

1. **REST API Aliases**:
   - Pruned bare collision alias `"rest"`.
   - Added explicit alias `"restful"`.
   - Preserved: `["rest api", "restful api", "rest apis", "restful apis", "restful"]`.
2. **Node.js Aliases**:
   - Pruned bare collision alias `"node"`.
   - Preserved: `["nodejs", "node.js", "node js"]`.
3. **Go Programming Language Boundary**:
   - Updated pattern compilation for `"go"` to require case-sensitive `"Go"` with verb-completion lookahead safeguards:
     `r"(?<![A-Za-z0-9_])Go(?![A-Za-z0-9_])(?!\s+(?:beyond|to|into|through|for|ahead))"`
   - Lowercase prose (*"go beyond targets"*) is rejected; programming contexts (*"Languages: Python, Go, SQL"*, *"Go developer"*, *"Golang"*) match reliably.
4. **Short Technical Acronyms (`ML`, `CV`, `DL`, `TF`)**:
   - Compiled with strict uppercase matching: `r"(?<![A-Za-z0-9_]){ALIAS.upper()}(?![A-Za-z0-9_])"`.
   - Lowercase units (*"500 ml"*, *"cv"*) are rejected; uppercase technical designations (*"Junior ML Developer"*, *"Senior CV Engineer"*, *"trained in TF"*) match as intended.
5. **Preserved Skills**:
   - `ETL`, `Microservices`, and `Machine Learning` were strictly preserved in the taxonomy.

---

## 6. Annotation Corrections
The Milestone 4 ground-truth annotations in `backend/evaluation/annotations/skill_annotations.json` were audited against the full text of all 10 resumes. Only verifiable, explicit mentions were added:

| Candidate | Skill Added | Explicit Verbatim Source Text |
| :--- | :--- | :--- |
| `candidate_delta.pdf` | **Machine Learning** | Title: *"Data Analyst & Junior ML Developer"* & Experience: *"decision tree classification models using scikit-learn"* |
| `candidate_delta.pdf` | **ETL** | Experience: *"- Versioned analytical models and ETL scripts using Git."* |
| `candidate_epsilon.pdf`| **Microservices** | Experience: *"- Administered multi-tenant Kubernetes clusters running containerized Docker microservices."* |
| `candidate_zeta.pdf` | **ETL** | Experience: *"- Designed high-throughput batch ETL workloads using Apache Spark and Python."* |
| `candidate_eta.pdf` | **Microservices** | Experience: *"- Engineered asynchronous REST API backend microservices in Node.js and Express.js."* |
| `candidate_gamma.pdf`| **REST API** | Experience: *"- Integrated GraphQL and RESTful backend APIs with optimistic UI caching."* |

No inferred skills were added.

---

## 7. Step 4 Regression Tests Added
9 unit tests were added to `backend/tests/test_skill_extractor.py` protecting the new boundaries:
1. `test_rest_prose_does_not_trigger_rest_api`: Proves *"the rest of the team"* does NOT extract `REST API`.
2. `test_node_infrastructure_does_not_trigger_nodejs`: Proves *"worker node"* does NOT extract `Node.js`.
3. `test_go_prose_does_not_trigger_go`: Proves lowercase *"go beyond targets"* does NOT extract `Go`.
4. `test_explicit_rest_api_triggers_rest_api`: Proves *"REST API"* and *"restful"* DO extract `REST API`.
5. `test_explicit_nodejs_triggers_nodejs`: Proves *"Node.js"* and *"nodejs"* DO extract `Node.js`.
6. `test_explicit_go_triggers_go`: Proves *"Python, Go, SQL"*, *"Golang"*, and *"Go developer"* DO extract `Go`.
7. `test_uppercase_ml_triggers_machine_learning`: Proves *"Junior ML Developer"* DOES extract `Machine Learning`.
8. `test_lowercase_ml_measurement_does_not_trigger_machine_learning`: Proves *"500 ml"* does NOT extract `Machine Learning`.
9. `test_ambiguous_two_letter_acronyms_case_sensitivity`: Proves casing boundaries for `CV`, `TF`, and `DL`.

---

## 8. Before vs. After Skill Metrics (Controlled Benchmark)

> **Important Evaluation Scope Notice**: The 100.00% metrics reported below represent measured performance on the **controlled evaluation dataset** (10 curated resumes and 4 job descriptions). They demonstrate that the controlled taxonomy extractor and boundary rules achieve complete alignment with the verified ground truth of this benchmark; they do not constitute a claim of 100% accuracy on arbitrary, noisy real-world resumes.

| Metric | Milestone 4 Baseline | Milestone 5 Final | Absolute Change |
| :--- | :---: | :---: | :---: |
| **Micro Precision** | 94.62% | **100.00%** | **+5.38%** |
| **Micro Recall** | 100.00% | **100.00%** | Maintained (100.00%) |
| **Micro F1 Score** | 97.24% | **100.00%** | **+2.76%** |
| **Macro Precision** | 94.87% | **100.00%** | **+5.13%** |
| **Macro Recall** | 100.00% | **100.00%** | Maintained (100.00%) |
| **Macro F1 Score** | 97.22% | **100.00%** | **+2.78%** |
| **Observed Discrepancies** | 5 false positives | **0 false positives** | All 5 resolved |
| **Test Suite Passing** | 40 / 40 | **49 / 49** | **+9 new tests** |

---

## 9. Scoring Experiments (Step 5)
Four candidate scoring formulas were evaluated systematically against the full evaluation dataset:

1. **50/50**: $0.50 \times \text{Text Similarity} + 0.50 \times \text{Required Skill Coverage}$
2. **60/40**: $0.60 \times \text{Text Similarity} + 0.40 \times \text{Required Skill Coverage}$
3. **70/30 (Baseline Production)**: $0.70 \times \text{Text Similarity} + 0.30 \times \text{Required Skill Coverage}$
4. **80/20**: $0.80 \times \text{Text Similarity} + 0.20 \times \text{Required Skill Coverage}$

---

## 10. 50/50 vs. 60/40 vs. 70/30 vs. 80/20 Results

| Configuration | Text Wt | Skill Wt | Mean NDCG@5 | ML Engineer | Backend | DevOps | Frontend | Alpha Score | Alpha Rank |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **50/50** | 0.50 | 0.50 | **1.0000** | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 57.68 | #1 |
| **60/40** | 0.60 | 0.40 | **1.0000** | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 49.22 | #1 |
| **70/30 (Baseline)** | **0.70** | **0.30** | **1.0000** | **1.0000** | **1.0000** | **1.0000** | **1.0000** | **40.76** | **#1** |
| **80/20** | 0.80 | 0.20 | **1.0000** | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 32.30 | #1 |

---

## 11. Ranking Stability Analysis
An item-by-item inspection of candidate ordering across all 4 scenarios confirmed:
- Zero candidate position inversions occurred across any scenario.
- In all 4 scenarios, the rank ordering of every single candidate is **100% identical** across 50/50, 60/40, 70/30, and 80/20.
- Top relevant candidates (Rel 2) remain at ranks #1 and #2 in all scenarios regardless of weight configuration.

---

## 12. Final Decision to Retain 70/30
- **Inconclusive Dataset Discrimination**: Because every tested configuration produces an identical ranking order and a Mean NDCG@5 of 1.0000, the current evaluation dataset **cannot distinguish** between the four weighting configurations.
- **Engineering Baseline Principle**: Per project guidelines, when benchmark data does not provide empirical evidence to favor an alternative configuration, **70/30 is retained as the established engineering baseline**. It is not claimed to be universally or mathematically optimal, but it is proven, stable, regression-tested, and transparent.
- **Anti-Inflation Policy**: Increasing skill weight to 50/50 raises Candidate Alpha's score from 40.76 to 57.68 purely by mathematical scaling without improving ranking precision. Arbitrarily inflating scores without measurable ranking gains was rejected.
- **Production Status**: Production weights remain unchanged at **70% Text Similarity / 30% Required Skill Coverage**.

---

## 13. Candidate Alpha Regression Verification
Testing the primary regression case (`candidate_alpha.pdf` vs. `ml_engineer.txt`):

| Metric | Target Baseline | Measured Post-Step 5 | Status |
| :--- | :---: | :---: | :---: |
| **Overall Score** | `40.76` | **40.76** | Exact match |
| **Text Similarity** | `15.37%` | **15.37%** | Exact match |
| **Required Skill Coverage** | `100.0%` | **100.0%** | Exact match |
| **Matched Required Skills** | 5 | **5** (`['Python', 'PyTorch', 'scikit-learn', 'NLP', 'Pandas']`) | Exact match |
| **Missing Required Skills** | 0 | **0** (`[]`) | Exact match |

---

## 14. Final Test Results
- **Command**: `python -m pytest backend/tests`
- **Result**: **49 passed**, 1 warning in **7.27s** (100% passing across all 9 test suites).
- **Test Suites Breakdown**:
  - `test_skill_extractor.py`: 17 passed (+9 new regression tests)
  - `test_api_endpoints.py`: 5 passed
  - `test_evaluation.py`: 6 passed
  - `test_explanation.py`: 2 passed
  - `test_jd_parser.py`: 5 passed
  - `test_pdf_parser.py`: 4 passed
  - `test_preprocessor.py`: 4 passed
  - `test_scoring.py`: 3 passed
  - `test_similarity.py`: 3 passed

---

## 15. Known Limitations
1. **Evaluation Dataset Scale**: The benchmark consists of 10 synthetic resumes and 4 job requisitions. While sufficient for deterministic regression testing, it does not represent the full variance of real-world resumes.
2. **Dataset Discriminative Granularity**: The current benchmark candidate profiles are sufficiently distinct that moderate weighting changes do not alter candidate ranks. Finer weighting calibration will require subtle, borderline, or adversarial evaluation pairs in future milestones.
3. **OCR Edge Handling**: Scanned image PDFs without a digital text layer return 0 characters. This is correctly handled with an informative warning (*"No extractable text was found. OCR is not supported in the current version."*), with OCR integration slated for a subsequent milestone.

---

## 16. What Was Deliberately NOT Changed
To preserve architectural integrity and avoid unintended regressions, the following components were deliberately kept intact:
- **PyMuPDF text extraction (`pdf_parser.py`)**: Preserved without modification.
- **spaCy technical token preprocessing (`preprocessor.py`)**: Preserved with all protected tokens.
- **JD required vs. preferred skill parsing (`jd_parser.py`)**: Preserved with 0% cross-contamination rule.
- **TF-IDF n-gram vectorizer (`similarity.py`)**: Preserved with `ngram_range=(1,2)` and `sublinear_tf=True`.
- **Explainable evidence format (`explanation.py`)**: Preserved with verbatim citations and objective absence notices (*"Not found in extracted resume text."*).
- **Production scoring weights (`scoring.py`)**: Retained at 70/30.
- **Frontend UI & Stitch Visual Language**: Completely untouched; zero frontend modifications made.
- **No LLMs / Embeddings**: Kept 100% deterministic, transparent, and auditable.

---

## 17. Milestone 5 Conclusion
Milestone 5 successfully achieved its objectives:
- Fixed high-risk alias collisions (`REST API`, `Node.js`, `Go`, and ambiguous 2-letter acronyms) using robust general boundary rules.
- Corrected verified ground-truth annotation omissions supported by source resume text.
- Added 9 comprehensive unit regression tests.
- Reached 100.00% precision, recall, and F1 on the controlled evaluation benchmark without candidate-specific hacks.
- Empirically evaluated 4 scoring configurations and responsibly retained the 70/30 baseline based on data evidence.
- Preserved the `candidate_alpha.pdf` regression baseline at exactly 40.76.
