"""
Unit & Regression Tests for ResumeIQ Evaluation Framework.
Verifies:
- Precision, Recall, and F1 calculations
- Safe zero-division handling
- DCG and NDCG calculation with scikit-learn parity
- Ground truth annotations schema and file references
- Deterministic evaluation output
"""
import os
import json
import pytest
import numpy as np
from sklearn.metrics import ndcg_score

from evaluation.scripts.metrics import (
    calculate_skill_metrics,
    calculate_aggregate_metrics,
    compute_dcg,
    compute_idcg,
    compute_ndcg
)
from evaluation.scripts.run_evaluation import (
    evaluate_skill_extraction,
    evaluate_ranking_scenarios
)
from app.services.skill_extractor import CONTROLLED_SKILL_TAXONOMY


def test_precision_recall_f1_basic():
    predicted = ["Python", "Docker", "FastAPI"]
    ground_truth = ["Python", "FastAPI", "PostgreSQL"]

    res = calculate_skill_metrics(predicted, ground_truth)
    assert res["tp"] == 2  # Python, FastAPI
    assert res["fp"] == 1  # Docker
    assert res["fn"] == 1  # PostgreSQL
    assert res["precision"] == round(2 / 3, 4)
    assert res["recall"] == round(2 / 3, 4)
    assert res["f1"] == round(2 / 3, 4)
    assert res["true_positives"] == ["FastAPI", "Python"]
    assert res["false_positives"] == ["Docker"]
    assert res["false_negatives"] == ["PostgreSQL"]


def test_zero_division_handling():
    # 1. Both empty: perfect match on empty document
    res_both_empty = calculate_skill_metrics([], [])
    assert res_both_empty["precision"] == 1.0
    assert res_both_empty["recall"] == 1.0
    assert res_both_empty["f1"] == 1.0
    assert res_both_empty["tp"] == 0

    # 2. Predicted empty, ground truth non-empty
    res_pred_empty = calculate_skill_metrics([], ["Python", "PyTorch"])
    assert res_pred_empty["precision"] == 0.0
    assert res_pred_empty["recall"] == 0.0
    assert res_pred_empty["f1"] == 0.0
    assert res_pred_empty["fn"] == 2

    # 3. Predicted non-empty, ground truth empty
    res_gt_empty = calculate_skill_metrics(["Python"], [])
    assert res_gt_empty["precision"] == 0.0
    assert res_gt_empty["recall"] == 0.0
    assert res_gt_empty["f1"] == 0.0
    assert res_gt_empty["fp"] == 1


def test_aggregate_metrics():
    resume1 = calculate_skill_metrics(["Python", "SQL"], ["Python", "SQL"])  # 2 TP, 0 FP, 0 FN (P=1, R=1, F1=1)
    resume2 = calculate_skill_metrics(["Python", "Java"], ["Python", "C++"])  # 1 TP, 1 FP, 1 FN (P=0.5, R=0.5, F1=0.5)

    agg = calculate_aggregate_metrics([resume1, resume2])

    # Micro: 3 TP, 1 FP, 1 FN => P = 3/4 = 0.75, R = 3/4 = 0.75, F1 = 0.75
    assert agg["micro"]["tp"] == 3
    assert agg["micro"]["fp"] == 1
    assert agg["micro"]["fn"] == 1
    assert agg["micro"]["precision"] == 0.75
    assert agg["micro"]["recall"] == 0.75
    assert agg["micro"]["f1"] == 0.75

    # Macro: average of (1.0 and 0.5) = 0.75
    assert agg["macro"]["precision"] == 0.75
    assert agg["macro"]["recall"] == 0.75
    assert agg["macro"]["f1"] == 0.75


def test_dcg_idcg_ndcg_scikit_learn_parity():
    # Ideal ranking: [2, 2, 1, 1, 0, 0]
    ideal = [2, 2, 1, 1, 0, 0]
    my_ndcg = compute_ndcg(ideal, ideal, k=5)
    sk_ndcg = ndcg_score(np.array([[2, 2, 1, 1, 0, 0]]), np.array([[6, 5, 4, 3, 2, 1]]), k=5)
    assert my_ndcg == 1.0
    assert abs(my_ndcg - round(sk_ndcg, 4)) < 1e-4

    # Sub-optimal ranking
    actual = [1, 2, 0, 2, 1, 0]
    my_ndcg_sub = compute_ndcg(actual, ideal, k=5)
    sk_ndcg_sub = ndcg_score(np.array([[1, 2, 0, 2, 1, 0]]), np.array([[6, 5, 4, 3, 2, 1]]), k=5)
    assert abs(my_ndcg_sub - round(sk_ndcg_sub, 4)) < 1e-4

    # Reversed ranking
    reversed_order = [0, 0, 1, 1, 2, 2]
    my_ndcg_rev = compute_ndcg(reversed_order, ideal, k=5)
    sk_ndcg_rev = ndcg_score(np.array([[0, 0, 1, 1, 2, 2]]), np.array([[6, 5, 4, 3, 2, 1]]), k=5)
    assert abs(my_ndcg_rev - round(sk_ndcg_rev, 4)) < 1e-4

    # Edge cases
    assert compute_ndcg([0, 0, 0], [0, 0, 0], k=5) == 1.0
    assert compute_ndcg([], [], k=5) == 1.0


def test_ground_truth_annotations_schema_and_files():
    eval_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "evaluation")
    resumes_dir = os.path.join(eval_dir, "resumes")
    jobs_dir = os.path.join(eval_dir, "jobs")
    annotations_dir = os.path.join(eval_dir, "annotations")

    # 1. Skill Annotations
    skill_file = os.path.join(annotations_dir, "skill_annotations.json")
    assert os.path.exists(skill_file), "skill_annotations.json missing"
    with open(skill_file, "r", encoding="utf-8") as f:
        skill_data = json.load(f)

    assert "resumes" in skill_data
    canonical_skills = set(CONTROLLED_SKILL_TAXONOMY.keys())

    for filename, info in skill_data["resumes"].items():
        assert os.path.exists(os.path.join(resumes_dir, filename)), f"Missing resume file: {filename}"
        assert "ground_truth_skills" in info
        # All ground truth skills must be valid canonical taxonomy entries
        for skill in info["ground_truth_skills"]:
            assert skill in canonical_skills, f"Skill '{skill}' not in canonical taxonomy"

    # 2. Ranking Annotations
    ranking_file = os.path.join(annotations_dir, "ranking_annotations.json")
    assert os.path.exists(ranking_file), "ranking_annotations.json missing"
    with open(ranking_file, "r", encoding="utf-8") as f:
        ranking_data = json.load(f)

    assert "scenarios" in ranking_data
    for sc in ranking_data["scenarios"]:
        assert os.path.exists(os.path.join(jobs_dir, sc["job_filename"])), f"Missing job file: {sc['job_filename']}"
        assert len(sc["candidates"]) >= 5, f"Scenario '{sc['scenario_id']}' should have at least 5 candidates"
        for cand in sc["candidates"]:
            assert os.path.exists(os.path.join(resumes_dir, cand["filename"])), f"Missing candidate: {cand['filename']}"
            assert cand["ground_truth_relevance"] in (0, 1, 2)


def test_deterministic_evaluation_runner():
    eval_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "evaluation")
    resumes_dir = os.path.join(eval_dir, "resumes")
    jobs_dir = os.path.join(eval_dir, "jobs")
    annotations_dir = os.path.join(eval_dir, "annotations")

    with open(os.path.join(annotations_dir, "skill_annotations.json"), "r", encoding="utf-8") as f:
        skill_annotations = json.load(f)

    with open(os.path.join(annotations_dir, "ranking_annotations.json"), "r", encoding="utf-8") as f:
        ranking_annotations = json.load(f)

    # Run twice and assert deterministic identical metrics
    run1 = evaluate_skill_extraction(skill_annotations, resumes_dir)
    run2 = evaluate_skill_extraction(skill_annotations, resumes_dir)
    assert run1["aggregate"] == run2["aggregate"]

    rank_run1 = evaluate_ranking_scenarios(ranking_annotations, jobs_dir, resumes_dir)
    rank_run2 = evaluate_ranking_scenarios(ranking_annotations, jobs_dir, resumes_dir)
    assert rank_run1["average_ndcg_at_5"] == rank_run2["average_ndcg_at_5"]
