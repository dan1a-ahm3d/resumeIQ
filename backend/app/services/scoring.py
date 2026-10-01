"""
Explainable Scoring Engine.
Computes overall match score based on centralized weights:
Overall Score = 0.70 * Text Similarity + 0.30 * Required Skill Coverage
Returns full component breakdown for complete recruiter explainability.
"""
from app.core.config import settings
from app.models.analysis import ScoreComponents, ScoreComponentDetail


class ScoringService:
    def __init__(self):
        self.text_weight = settings.TEXT_SIMILARITY_WEIGHT
        self.skill_weight = settings.REQUIRED_SKILL_WEIGHT

    def compute_score(
        self,
        text_similarity_percentage: float,
        skill_coverage_percentage: float
    ) -> ScoreComponents:
        """
        Computes weighted scores and composite score breakdown.
        Guarantees explainable 0-100 scale.
        """
        text_score = max(0.0, min(100.0, float(text_similarity_percentage)))
        skill_score = max(0.0, min(100.0, float(skill_coverage_percentage)))

        weighted_text = round(text_score * self.text_weight, 2)
        weighted_skill = round(skill_score * self.skill_weight, 2)
        overall = round(weighted_text + weighted_skill, 2)

        return ScoreComponents(
            text_similarity=ScoreComponentDetail(
                score=round(text_score, 2),
                weight=self.text_weight,
                weighted_score=weighted_text
            ),
            required_skill_coverage=ScoreComponentDetail(
                score=round(skill_score, 2),
                weight=self.skill_weight,
                weighted_score=weighted_skill
            )
        )

    def get_overall_score(self, components: ScoreComponents) -> float:
        """Calculates composite overall score from component breakdown."""
        return round(
            components.text_similarity.weighted_score +
            components.required_skill_coverage.weighted_score,
            2
        )


scoring_service = ScoringService()
