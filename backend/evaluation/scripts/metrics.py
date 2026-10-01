"""
Evaluation Metrics for ResumeIQ.
Provides mathematically rigorous, reproducible implementations of:
- Skill Extraction: Precision, Recall, F1 Score (Per-resume, Micro-average, Macro-average)
- Candidate Ranking: Discounted Cumulative Gain (DCG@K), Ideal DCG (IDCG@K), Normalized DCG (NDCG@K)
"""
import math
from typing import Set, List, Dict, Any, Union, Optional


def calculate_skill_metrics(
    predicted: Union[Set[str], List[str]],
    ground_truth: Union[Set[str], List[str]]
) -> Dict[str, Any]:
    """
    Computes True Positives, False Positives, False Negatives,
    Precision, Recall, and F1 score for skill extraction against ground truth.

    Handles zero-division edge cases deterministically:
    - If both predicted and ground truth are empty: perfect precision (1.0), recall (1.0), F1 (1.0).
    - If predicted is empty and ground truth is non-empty: precision (0.0), recall (0.0), F1 (0.0).
    - If predicted is non-empty and ground truth is empty: precision (0.0), recall (0.0), F1 (0.0).
    """
    pred_set = {s.strip() for s in predicted if s and s.strip()}
    gt_set = {s.strip() for s in ground_truth if s and s.strip()}

    tp_set = pred_set & gt_set
    fp_set = pred_set - gt_set
    fn_set = gt_set - pred_set

    tp = len(tp_set)
    fp = len(fp_set)
    fn = len(fn_set)

    if len(pred_set) == 0 and len(gt_set) == 0:
        precision = 1.0
        recall = 1.0
        f1 = 1.0
    elif len(pred_set) == 0:
        precision = 0.0
        recall = 0.0
        f1 = 0.0
    elif len(gt_set) == 0:
        precision = 0.0
        recall = 0.0
        f1 = 0.0
    else:
        precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
        f1 = (2 * precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0

    return {
        "tp": tp,
        "fp": fp,
        "fn": fn,
        "precision": round(precision, 4),
        "recall": round(recall, 4),
        "f1": round(f1, 4),
        "true_positives": sorted(list(tp_set)),
        "false_positives": sorted(list(fp_set)),
        "false_negatives": sorted(list(fn_set)),
    }


def calculate_aggregate_metrics(per_resume_metrics: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Computes micro-averaged and macro-averaged metrics across all evaluated resumes.
    """
    if not per_resume_metrics:
        return {
            "micro": {"precision": 0.0, "recall": 0.0, "f1": 0.0, "tp": 0, "fp": 0, "fn": 0},
            "macro": {"precision": 0.0, "recall": 0.0, "f1": 0.0}
        }

    total_tp = sum(m["tp"] for m in per_resume_metrics)
    total_fp = sum(m["fp"] for m in per_resume_metrics)
    total_fn = sum(m["fn"] for m in per_resume_metrics)

    # Micro-average
    if (total_tp + total_fp) == 0 and (total_tp + total_fn) == 0:
        micro_p = 1.0
        micro_r = 1.0
        micro_f1 = 1.0
    else:
        micro_p = total_tp / (total_tp + total_fp) if (total_tp + total_fp) > 0 else 0.0
        micro_r = total_tp / (total_tp + total_fn) if (total_tp + total_fn) > 0 else 0.0
        micro_f1 = (2 * micro_p * micro_r) / (micro_p + micro_r) if (micro_p + micro_r) > 0 else 0.0

    # Macro-average
    n = len(per_resume_metrics)
    macro_p = sum(m["precision"] for m in per_resume_metrics) / n
    macro_r = sum(m["recall"] for m in per_resume_metrics) / n
    macro_f1 = sum(m["f1"] for m in per_resume_metrics) / n

    return {
        "micro": {
            "tp": total_tp,
            "fp": total_fp,
            "fn": total_fn,
            "precision": round(micro_p, 4),
            "recall": round(micro_r, 4),
            "f1": round(micro_f1, 4),
        },
        "macro": {
            "precision": round(macro_p, 4),
            "recall": round(macro_r, 4),
            "f1": round(macro_f1, 4),
        }
    }


def compute_dcg(
    relevances: List[Union[int, float]],
    k: int = 5,
    use_exponential_gain: bool = False
) -> float:
    """
    Computes Discounted Cumulative Gain at cutoff k:
    DCG@k = sum_{i=1}^{min(k, len(relevances))} gain_i / log_2(i + 1)

    By default, uses linear gain (gain = rel_i) matching scikit-learn standard.
    If use_exponential_gain is True, uses exponential gain (gain = 2^{rel_i} - 1).
    """
    cutoff = min(k, len(relevances))
    dcg = 0.0
    for i in range(cutoff):
        rel = float(relevances[i])
        gain = (2.0 ** rel) - 1.0 if use_exponential_gain else rel
        discount = math.log2(i + 2)  # 0-indexed i + 2 equals 1-indexed (rank + 1)
        dcg += gain / discount
    return dcg


def compute_idcg(
    relevances: List[Union[int, float]],
    k: int = 5,
    use_exponential_gain: bool = False
) -> float:
    """
    Computes Ideal DCG at cutoff k by sorting relevances descending.
    """
    sorted_relevances = sorted(relevances, reverse=True)
    return compute_dcg(sorted_relevances, k=k, use_exponential_gain=use_exponential_gain)


def compute_ndcg(
    actual_relevances_in_ranked_order: List[Union[int, float]],
    all_relevances_pool: Optional[List[Union[int, float]]] = None,
    k: int = 5,
    use_exponential_gain: bool = False
) -> float:
    """
    Computes Normalized Discounted Cumulative Gain at cutoff k:
    NDCG@k = DCG@k / IDCG@k

    If IDCG is 0.0 (all pool items have relevance 0), returns 1.0.
    """
    dcg = compute_dcg(actual_relevances_in_ranked_order, k=k, use_exponential_gain=use_exponential_gain)
    pool = all_relevances_pool if all_relevances_pool is not None else actual_relevances_in_ranked_order
    idcg = compute_idcg(pool, k=k, use_exponential_gain=use_exponential_gain)

    if idcg <= 0.0:
        return 1.0
    return round(dcg / idcg, 4)
