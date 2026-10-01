# ResumeIQ — Evaluation Framework & Objective Performance Benchmark

This directory provides an automated, reproducible evaluation framework for the **ResumeIQ** NLP and ranking engine. It measures the extraction precision and candidate ranking quality of the production pipeline against a controlled benchmark dataset.

---

## 1. Directory Structure

```
backend/evaluation/
├── README.md                      # Methodology, metric formulas, and reproducibility guide
├── resumes/                       # Synthetic, anonymized PDF resumes (10 profiles)
│   ├── candidate_alpha.pdf        # Senior ML / NLP Engineer
│   ├── candidate_beta.pdf         # Senior Backend Software Engineer
│   ├── candidate_delta.pdf        # Data Analyst & Junior ML Developer
│   ├── candidate_epsilon.pdf      # Cloud & DevOps Infrastructure Architect
│   ├── candidate_eta.pdf          # Full Stack JavaScript/TypeScript Developer
│   ├── candidate_gamma.pdf        # Senior Frontend Engineer
│   ├── candidate_iota.pdf         # Senior NLP Research Specialist
│   ├── candidate_theta.pdf        # Embedded Systems & Native C++ Developer
│   ├── candidate_zeta.pdf         # Data Platform & ETL Engineer
│   └── scanned_image_resume.pdf   # Scanned bitmap image (zero-text edge case)
├── jobs/                          # Benchmark Job Descriptions (4 roles)
│   ├── ml_engineer.txt            # Machine Learning Engineer (5 required, 4 preferred)
│   ├── software_engineer.txt      # Senior Backend Software Engineer (4 required, 4 preferred)
│   ├── devops_engineer.txt        # Cloud & DevOps Engineer (5 required, 3 preferred)
│   └── frontend_engineer.txt      # Senior Frontend Engineer (5 required, 4 preferred)
├── annotations/                   # Human ground-truth annotations
│   ├── skill_annotations.json     # Per-resume canonical ground-truth skills
│   └── ranking_annotations.json   # Per-scenario candidate relevance grades (0, 1, 2)
├── results/                       # Generated evaluation artifacts
│   ├── evaluation_results.json    # Machine-readable evaluation results (JSON)
│   └── evaluation_report.md       # Human-readable evaluation report (Markdown)
└── scripts/                       # Executable evaluation logic
    ├── __init__.py
    ├── metrics.py                 # Pure-Python implementations of Precision, Recall, F1, DCG, NDCG
    ├── dataset_generator.py       # Deterministic generator for synthetic resumes & JDs
    └── run_evaluation.py          # Master evaluation runner & report generator
```

---

## 2. Evaluation Principles & Ethics

1. **Job-Relevant Evaluation Only:** Zero sensitive personal demographic attributes (gender, age, race, ethnicity, religion, caste, disability, photograph, home address) are present in the dataset or used in scoring.
2. **Deterministic & Reproducible:** All metrics are computed by executing the real production pipeline (`pdf_parser`, `skill_extractor`, `similarity_service`, `scoring_service`, `explanation_service`) without mock fallbacks or stochastic sampling.
3. **Measurement Without Tampering:** The production scoring algorithm and NLP pipeline were NOT tuned or altered to artificially inflate benchmark scores.

---

## 3. Evaluation Metrics & Mathematical Formulas

### 3.1 Skill Extraction Metrics

Skill extraction evaluates the set of predicted canonical skills $P$ against ground-truth skills $G$:

$$\text{True Positives (TP)} = |P \cap G|$$
$$\text{False Positives (FP)} = |P \setminus G|$$
$$\text{False Negatives (FN)} = |G \setminus P|$$

#### Precision
$$\text{Precision} = \frac{\text{TP}}{\text{TP} + \text{FP}}$$

#### Recall
$$\text{Recall} = \frac{\text{TP}}{\text{TP} + \text{FN}}$$

#### F1 Score
$$\text{F1} = \frac{2 \cdot \text{Precision} \cdot \text{Recall}}{\text{Precision} + \text{Recall}}$$

#### Zero-Division Handling
- When $|P| = 0$ and $|G| = 0$: $\text{Precision} = 1.0, \text{Recall} = 1.0, \text{F1} = 1.0$ (correct empty rejection, e.g. for unparseable scanned documents).
- When $|P| = 0$ and $|G| > 0$: $\text{Precision} = 0.0, \text{Recall} = 0.0, \text{F1} = 0.0$.
- When $|P| > 0$ and $|G| = 0$: $\text{Precision} = 0.0, \text{Recall} = 0.0, \text{F1} = 0.0$.

#### Aggregations
- **Micro-Average:** Computes global Precision, Recall, and F1 by aggregating $\sum \text{TP}$, $\sum \text{FP}$, and $\sum \text{FN}$ across all resumes.
- **Macro-Average:** Computes unweighted arithmetic mean of per-resume Precision, Recall, and F1 scores.

---

### 3.2 Candidate Ranking Metrics (NDCG@K)

Multi-candidate ranking is evaluated using **Normalized Discounted Cumulative Gain at rank cutoff $K$** ($K = 5$), comparing production candidate order against expert-annotated relevance grades:
- **`2` (Strongly Relevant):** Candidate possesses full domain competence and satisfies primary required skills.
- **`1` (Partially Relevant):** Candidate possesses adjacent skills or a partial subset of required competencies.
- **`0` (Not Relevant):** Candidate belongs to an unrelated discipline or lacks core requirements.

#### Discounted Cumulative Gain (DCG@K)
$$\text{DCG}@K = \sum_{i=1}^{\min(K, N)} \frac{\text{rel}_i}{\log_2(i + 1)}$$

*(Where $i$ is 1-indexed rank position, matching scikit-learn standard linear gain).*

#### Ideal Discounted Cumulative Gain (IDCG@K)
$$\text{IDCG}@K = \text{DCG}@K \text{ of ground-truth relevances sorted in descending order}$$

#### Normalized Discounted Cumulative Gain (NDCG@K)
$$\text{NDCG}@K = \begin{cases} 1.0 & \text{if } \text{IDCG}@K = 0 \\ \frac{\text{DCG}@K}{\text{IDCG}@K} & \text{otherwise} \end{cases}$$

---

## 4. How to Run the Evaluation

From the repository root or the `backend` directory, run:

```bash
# Option A: From workspace root
python backend/evaluation/scripts/run_evaluation.py

# Option B: From backend directory
cd backend
python -m evaluation.scripts.run_evaluation
```

### Running Automated Evaluation Tests
Automated regression tests verify metric parity against `scikit-learn`, zero-division edge cases, and ground-truth schema validity:

```bash
python -m pytest tests/test_evaluation.py -v
```

---

## 5. Output Locations

- **Machine-Readable JSON:** [`backend/evaluation/results/evaluation_results.json`](file:///backend/evaluation/results/evaluation_results.json)
- **Human-Readable Report:** [`backend/evaluation/results/evaluation_report.md`](file:///backend/evaluation/results/evaluation_report.md)
