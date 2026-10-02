# ResumeIQ Milestone 5: Scoring Formula Evaluation & Weight Tuning Experiment

## 1. Objective
The goal of this experiment is to evaluate whether the baseline scoring formula:
$$\text{Overall Score} = 0.70 \times \text{Text Similarity} + 0.30 \times \text{Required Skill Coverage}$$
should remain in production or be adjusted. We benchmark multiple weight configurations against the objective evaluation dataset using NDCG@5, ranking stability, component contribution, and regression criteria.

---

## 2. Existing 70/30 Rationale
The 70/30 formula was established during Milestone 2 to balance two complementary recruitment signals:
1. **Text Similarity (70%)**: TF-IDF cosine similarity capturing broad semantic relevance, responsibilities, architectural experience, domain vocabulary, and unstructured background depth.
2. **Required Skill Coverage (30%)**: Deterministic coverage of mandatory technical competencies parsed directly from explicit job requirements.

This configuration prevents candidates with superficial keyword stuffing from dominating ranks unless their overall experience aligns with the role description.

---

## 3. Experimental Configurations
Four configurations were evaluated systematically using the identical NLP feature extraction pipeline (PyMuPDF, spaCy, controlled taxonomy extractor, scikit-learn TF-IDF n-grams (1,2)):

- **Config 1 (50/50)**: $0.50 \times \text{Text Similarity} + 0.50 \times \text{Required Skill Coverage}$
- **Config 2 (60/40)**: $0.60 \times \text{Text Similarity} + 0.40 \times \text{Required Skill Coverage}$
- **Config 3 (70/30 - Baseline)**: $0.70 \times \text{Text Similarity} + 0.30 \times \text{Required Skill Coverage}$
- **Config 4 (80/20)**: $0.80 \times \text{Text Similarity} + 0.20 \times \text{Required Skill Coverage}$

---

## 4. Results Table

| Configuration | Text Weight | Skill Weight | Mean NDCG@5 | ML Engineer NDCG | Backend Engineer NDCG | DevOps Engineer NDCG | Frontend Engineer NDCG | Candidate Alpha Score | Alpha Rank |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **50/50** | 0.50 | 0.50 | **1.0000** | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 57.68 | #1 |
| **60/40** | 0.60 | 0.40 | **1.0000** | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 49.22 | #1 |
| **70/30 (Baseline)** | 0.70 | 0.30 | **1.0000** | 1.0000 | 1.0000 | 1.0000 | 1.0000 | **40.76** | **#1** |
| **80/20** | 0.80 | 0.20 | **1.0000** | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 32.30 | #1 |

---

## 5. NDCG@5 Comparison
- **Mean NDCG@5**: Identical across all four configurations at **1.0000**.
- **Per-Scenario Breakdown**:
  - Machine Learning Engineer (`ml_engineer.txt`): NDCG@5 = **1.0000** across all 4 configs.
  - Senior Backend Software Engineer (`software_engineer.txt`): NDCG@5 = **1.0000** across all 4 configs.
  - Cloud & DevOps Engineer (`devops_engineer.txt`): NDCG@5 = **1.0000** across all 4 configs.
  - Senior Frontend Engineer (`frontend_engineer.txt`): NDCG@5 = **1.0000** across all 4 configs.

All four configurations achieve mathematically optimal ranking alignment with ground-truth relevance grades (DCG@5 = IDCG@5).

---

## 6. Regression Comparison (`candidate_alpha.pdf` vs `ml_engineer.txt`)

| Metric | 50/50 | 60/40 | 70/30 (Baseline) | 80/20 | Baseline Target |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Overall Score** | 57.68 | 49.22 | **40.76** | 32.30 | **40.76** |
| **Text Sim Component** | 7.68 (15.37 × 0.50) | 9.22 (15.37 × 0.60) | **10.76** (15.37 × 0.70) | 12.30 (15.37 × 0.80) | 10.76 |
| **Skill Cov Component** | 50.00 (100 × 0.50) | 40.00 (100 × 0.40) | **30.00** (100 × 0.30) | 20.00 (100 × 0.20) | 30.00 |
| **Rank** | #1 | #1 | **#1** | #1 | #1 |
| **Regression Match** | Altered | Altered | **Exact Match** | Altered | Exact Match |

Under 50/50 or 60/40, Candidate Alpha's overall score increases (57.68 and 49.22) because skill coverage carries greater weight. Under 80/20, the overall score decreases to 32.30. In all cases, Candidate Alpha remains decisively #1.

---

## 7. Ranking Changes Across All Candidates
An item-by-item inspection of candidate ordering was conducted across all 4 scenarios:

1. **Machine Learning Engineer**:
   - `candidate_alpha.pdf` (Rel 2) ➔ #1 across all 4 configs
   - `candidate_iota.pdf` (Rel 2) ➔ #2 across all 4 configs
   - `candidate_delta.pdf` (Rel 1) ➔ #3 across all 4 configs
   - `candidate_beta.pdf` (Rel 1) ➔ #4 across all 4 configs
   - `candidate_theta.pdf` (Rel 0) ➔ #5 across all 4 configs
   - `candidate_gamma.pdf` (Rel 0) ➔ #6 across all 4 configs
2. **Senior Backend Software Engineer**:
   - `candidate_beta.pdf` (Rel 2) ➔ #1 across all 4 configs
   - `candidate_zeta.pdf` (Rel 1) ➔ #2 across all 4 configs
   - `candidate_epsilon.pdf` (Rel 1) ➔ #3 across all 4 configs
   - `candidate_alpha.pdf` (Rel 1) ➔ #4 across all 4 configs
   - `candidate_gamma.pdf` (Rel 0) ➔ #5 across all 4 configs
   - `candidate_theta.pdf` (Rel 0) ➔ #6 across all 4 configs
3. **Cloud & DevOps Engineer**:
   - `candidate_epsilon.pdf` (Rel 2) ➔ #1 across all 4 configs
   - `candidate_beta.pdf` (Rel 1) ➔ #2 across all 4 configs
   - `candidate_alpha.pdf` (Rel 1) ➔ #3 across all 4 configs
   - `candidate_theta.pdf` (Rel 0) ➔ #4 across all 4 configs
   - `candidate_gamma.pdf` (Rel 0) ➔ #5 across all 4 configs
   - `candidate_delta.pdf` (Rel 0) ➔ #6 across all 4 configs
4. **Senior Frontend Engineer**:
   - `candidate_gamma.pdf` (Rel 2) ➔ #1 across all 4 configs
   - `candidate_eta.pdf` (Rel 2) ➔ #2 across all 4 configs
   - `candidate_beta.pdf` (Rel 0) ➔ #3 across all 4 configs
   - `candidate_theta.pdf` (Rel 0) ➔ #4 across all 4 configs
   - `candidate_alpha.pdf` (Rel 0) ➔ #5 across all 4 configs
   - `candidate_delta.pdf` (Rel 0) ➔ #6 across all 4 configs

**Result**: Zero candidate position inversions occurred across any scenario. The rank ordering is **100% identical** across 50/50, 60/40, 70/30, and 80/20.

---

## 8. Interpretation & Statistical Analysis
- **Empirical Neutrality**: Because every tested configuration produces an identical ranking order and Mean NDCG@5 of 1.0000, there is zero empirical evidence demonstrating that 50/50, 60/40, or 80/20 provides superior ranking quality over 70/30.
- **Score Inflation vs. Ranking Quality**: While 50/50 produces higher absolute numerical scores for top candidates (e.g. 57.68 vs 40.76 for Alpha), changing weights solely to increase scores without improving ranking precision is scientifically invalid and violates good engineering practice.
- **Explainability**: The 70/30 ratio maintains a strong penalty against keyword stuffing by requiring 70% unstructured text and contextual experience alignment, while dedicating 30% to mandatory skill coverage.

---

## 9. Dataset Limitations & Threats to Validity
- **Discriminative Power**: The current evaluation benchmark consists of 10 resumes and 4 job requisitions. The candidate relevance profiles are sufficiently distinct (e.g. Frontend vs. ML vs. DevOps) that ranking order is robust against moderate weighting shifts.
- **Conclusion on Dataset**: The current synthetic benchmark does not contain borderline or adversarial cases (e.g. a candidate with 100% skill coverage but completely irrelevant domain experience vs. a candidate with 60% skill coverage but 10 years of exact domain narrative) needed to statistically separate 60/40 from 70/30.

---

## 10. Final Decision
Per the Milestone 5 evaluation criteria:
> *If all configurations produce NDCG@5 = 1.0000, do NOT claim that one configuration is objectively better. Instead explain that the current dataset does not provide enough evidence to distinguish the configurations. In that case, RETAIN 70/30 as the current engineering baseline because it is already established, explainable, and regression-tested.*

Therefore:
- **RETAIN 70/30** as the production scoring formula:
  $$\text{Overall Score} = 0.70 \times \text{Text Similarity} + 0.30 \times \text{Required Skill Coverage}$$
- No change will be made to production weights in `backend/app/core/config.py` or `backend/app/services/scoring.py`.
- The established regression baseline for `candidate_alpha.pdf` vs `ml_engineer.txt` is preserved exactly at **40.76**.
