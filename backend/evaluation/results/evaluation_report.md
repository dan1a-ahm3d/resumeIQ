# ResumeIQ — Milestone 4 Evaluation Report
**Execution Timestamp:** 2026-10-01 17:55:49 UTC

## Executive Summary

This report provides an objective, empirical evaluation of the existing ResumeIQ NLP extraction and candidate ranking pipeline. All metrics are calculated directly from reproducible execution of the production Python pipeline against a synthetic, controlled benchmark dataset.

| Metric | Micro-Average | Macro-Average | Target/Scale |
| :--- | :--- | :--- | :--- |
| **Skill Extraction Precision** | **94.62%** | 94.87% | 0.0 - 100.0% |
| **Skill Extraction Recall** | **100.00%** | 100.00% | 0.0 - 100.0% |
| **Skill Extraction F1 Score** | **97.24%** | 97.22% | 0.0 - 100.0% |
| **Ranking Quality (NDCG@5)** | **1.0000** | — | 0.0 - 1.0000 |

---

## 1. Evaluation Dataset Summary

- **Total Resumes Evaluated:** 10
- **Total Job Requisitions Evaluated:** 4
- **Ranking Scenarios Tested:** 4
- **Data Ethics & Privacy:** 100% synthetic and anonymized documents. Zero sensitive personal attributes (gender, age, race, ethnicity, religion, disability, photo, address) were included or evaluated.

### Dataset Composition

| Resume File | Role Focus | Extracted Chars | Ground Truth Skills | Status |
| :--- | :--- | :--- | :--- | :--- |
| `candidate_alpha.pdf` | Candidate Alpha | 1001 | 15 | Active |
| `candidate_beta.pdf` | Candidate Beta | 789 | 14 | Active |
| `candidate_gamma.pdf` | Candidate Gamma | 650 | 11 | Active |
| `candidate_delta.pdf` | Candidate Delta | 759 | 7 | Active |
| `candidate_epsilon.pdf` | Candidate Epsilon | 866 | 9 | Active |
| `candidate_zeta.pdf` | Candidate Zeta | 806 | 9 | Active |
| `candidate_eta.pdf` | Candidate Eta | 785 | 10 | Active |
| `candidate_theta.pdf` | Candidate Theta | 610 | 5 | Active |
| `candidate_iota.pdf` | Candidate Iota | 839 | 8 | Active |
| `scanned_image_resume.pdf` | Scanned Image Resume | 0 | 0 | Empty (OCR edge) |


---

## 2. Skill Extraction Performance

Evaluates the controlled taxonomy extractor with strict boundary protection.

| Resume | True Positives (TP) | False Positives (FP) | False Negatives (FN) | Precision | Recall | F1 Score |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `candidate_alpha.pdf` | 15 | 0 | 0 | 100.0% | 100.0% | 100.0% |
| `candidate_beta.pdf` | 14 | 0 | 0 | 100.0% | 100.0% | 100.0% |
| `candidate_gamma.pdf` | 11 | 0 | 0 | 100.0% | 100.0% | 100.0% |
| `candidate_delta.pdf` | 7 | 2 | 0 | 77.8% | 100.0% | 87.5% |
| `candidate_epsilon.pdf` | 9 | 1 | 0 | 90.0% | 100.0% | 94.7% |
| `candidate_zeta.pdf` | 9 | 1 | 0 | 90.0% | 100.0% | 94.7% |
| `candidate_eta.pdf` | 10 | 1 | 0 | 90.9% | 100.0% | 95.2% |
| `candidate_theta.pdf` | 5 | 0 | 0 | 100.0% | 100.0% | 100.0% |
| `candidate_iota.pdf` | 8 | 0 | 0 | 100.0% | 100.0% | 100.0% |
| `scanned_image_resume.pdf` | 0 | 0 | 0 | 100.0% | 100.0% | 100.0% |
| **Micro Total / Average** | **88** | **5** | **0** | **94.6%** | **100.0%** | **97.2%** |
| **Macro Average** | — | — | — | **94.9%** | **100.0%** | **97.2%** |


---

## 3. Multi-Candidate Ranking Evaluation (NDCG@5)

Evaluates production ranking output against annotated relevance grades (`0` = Not Relevant, `1` = Partially Relevant, `2` = Strongly Relevant).

### Scenario: Machine Learning Engineer (`ml_engineer.txt`)
- **DCG@5:** 4.1925 | **IDCG@5:** 4.1925 | **NDCG@5:** **1.0000**

| Rank | Candidate File | True Rel | Overall Score | TF-IDF Sim | Skill Coverage | Matched Skills |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| #1 | `candidate_alpha.pdf` | **2** | 40.76 | 15.37% | 100.0% | Python, PyTorch, scikit-learn, NLP, Pandas |
| #2 | `candidate_iota.pdf` | **2** | 39.35 | 13.36% | 100.0% | Python, PyTorch, scikit-learn, NLP, Pandas |
| #3 | `candidate_delta.pdf` | **1** | 22.27 | 6.10% | 60.0% | Python, scikit-learn, Pandas |
| #4 | `candidate_beta.pdf` | **1** | 9.51 | 5.01% | 20.0% | Python |
| #5 | `candidate_theta.pdf` | **0** | 2.49 | 3.56% | 0.0% | None |
| #6 | `candidate_gamma.pdf` | **0** | 2.39 | 3.41% | 0.0% | None |


### Scenario: Senior Backend Software Engineer (`software_engineer.txt`)
- **DCG@5:** 3.5616 | **IDCG@5:** 3.5616 | **NDCG@5:** **1.0000**

| Rank | Candidate File | True Rel | Overall Score | TF-IDF Sim | Skill Coverage | Matched Skills |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| #1 | `candidate_beta.pdf` | **2** | 39.76 | 13.95% | 100.0% | Python, FastAPI, PostgreSQL, Docker |
| #2 | `candidate_zeta.pdf` | **1** | 30.00 | 10.72% | 75.0% | Python, PostgreSQL, Docker |
| #3 | `candidate_epsilon.pdf` | **1** | 20.96 | 8.52% | 50.0% | Python, Docker |
| #4 | `candidate_alpha.pdf` | **1** | 19.44 | 6.35% | 50.0% | Python, Docker |
| #5 | `candidate_gamma.pdf` | **0** | 4.92 | 7.03% | 0.0% | None |
| #6 | `candidate_theta.pdf` | **0** | 4.19 | 5.98% | 0.0% | None |


### Scenario: Cloud & DevOps Engineer (`devops_engineer.txt`)
- **DCG@5:** 3.1309 | **IDCG@5:** 3.1309 | **NDCG@5:** **1.0000**

| Rank | Candidate File | True Rel | Overall Score | TF-IDF Sim | Skill Coverage | Matched Skills |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| #1 | `candidate_epsilon.pdf` | **2** | 44.38 | 20.55% | 100.0% | Docker, Kubernetes, AWS, CI/CD, Linux |
| #2 | `candidate_beta.pdf` | **1** | 24.45 | 9.22% | 60.0% | Docker, Kubernetes, AWS |
| #3 | `candidate_alpha.pdf` | **1** | 23.20 | 7.43% | 60.0% | Docker, CI/CD, Linux |
| #4 | `candidate_theta.pdf` | **0** | 10.94 | 7.06% | 20.0% | Linux |
| #5 | `candidate_gamma.pdf` | **0** | 1.94 | 2.77% | 0.0% | None |
| #6 | `candidate_delta.pdf` | **0** | 1.81 | 2.58% | 0.0% | None |


### Scenario: Senior Frontend Engineer (`frontend_engineer.txt`)
- **DCG@5:** 3.2619 | **IDCG@5:** 3.2619 | **NDCG@5:** **1.0000**

| Rank | Candidate File | True Rel | Overall Score | TF-IDF Sim | Skill Coverage | Matched Skills |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| #1 | `candidate_gamma.pdf` | **2** | 46.17 | 23.10% | 100.0% | React, TypeScript, JavaScript, HTML, CSS |
| #2 | `candidate_eta.pdf` | **2** | 38.86 | 12.65% | 100.0% | React, TypeScript, JavaScript, HTML, CSS |
| #3 | `candidate_beta.pdf` | **0** | 2.96 | 4.23% | 0.0% | None |
| #4 | `candidate_theta.pdf` | **0** | 2.24 | 3.20% | 0.0% | None |
| #5 | `candidate_alpha.pdf` | **0** | 2.13 | 3.05% | 0.0% | None |
| #6 | `candidate_delta.pdf` | **0** | 0.91 | 1.30% | 0.0% | None |


**Mean NDCG@5 across all 4 scenarios:** **1.0000**

---

## 4. Error Analysis

| Category | Item | Observed Discrepancy | Technical Root Cause / Context | Severity |
| :--- | :--- | :--- | :--- | :--- |
| Extraction: False Positive Skill | `candidate_delta.pdf` | Skills detected that were not explicitly in ground truth: ['ETL', 'Machine Learning'] | Model detected terms matching controlled aliases (e.g. general technical keywords) present in context. | Low |
| Extraction: False Positive Skill | `candidate_epsilon.pdf` | Skills detected that were not explicitly in ground truth: ['Microservices'] | Model detected terms matching controlled aliases (e.g. general technical keywords) present in context. | Low |
| Extraction: False Positive Skill | `candidate_zeta.pdf` | Skills detected that were not explicitly in ground truth: ['ETL'] | Model detected terms matching controlled aliases (e.g. general technical keywords) present in context. | Low |
| Extraction: False Positive Skill | `candidate_eta.pdf` | Skills detected that were not explicitly in ground truth: ['Microservices'] | Model detected terms matching controlled aliases (e.g. general technical keywords) present in context. | Low |
| Extraction: Scanned Image Handling | `scanned_image_resume.pdf` | Zero text stream extracted; OCR unavailable in current version. | Correctly handled with fallback warning: 'No extractable text was found. OCR is not supported in the current version.'. F1=1.00 for empty rejection. | Informational |


---

## 5. Limitations & Threats to Validity

1. **Dataset Scale:** 10 resumes and 4 job requisitions provide a focused benchmark. While sufficient for statistical sanity and regression, expanded evaluation across hundreds of resumes is advised for commercial deployment.
2. **Domain Representation:** Evaluation focuses on technical software engineering, machine learning, and DevOps disciplines. Non-technical corporate roles are not yet evaluated.
3. **Optical Character Recognition:** Scanned image PDFs without a digital text layer return 0 characters. OCR integration is deliberately scheduled for a future milestone.
4. **Scoring Weight Distribution:** The fixed 70/30 weighting (70% text similarity, 30% required skill coverage) can occasionally elevate candidates with verbose unstructured text despite partial skill gaps.

---

## 6. Baseline Conclusion

The existing ResumeIQ pipeline demonstrates a robust baseline: **97.2% Micro F1** on skill extraction and **1.0000 NDCG@5** on candidate ranking. Token-boundary protections successfully prevent false-positive extraction (e.g. C/C++ isolation), and deterministic ranking orders candidates faithfully according to composite match relevance.
