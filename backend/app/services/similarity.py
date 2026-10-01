"""
TF-IDF Vectorization & Cosine Similarity Service.
Uses scikit-learn TfidfVectorizer and cosine_similarity to compare
preprocessed resume text against job description text.
Returns raw similarity (0.0 to 1.0) and percentage (0.0 to 100.0).
"""
from typing import Dict, Any
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from app.services.preprocessor import preprocessor


class SimilarityService:
    def calculate_similarity(self, resume_text: str, jd_text: str) -> Dict[str, Any]:
        """
        Computes TF-IDF cosine similarity between resume and job description.
        Gracefully handles zero-length texts or zero overlapping vocabulary.
        """
        clean_resume = preprocessor.preprocess_for_similarity(resume_text)
        clean_jd = preprocessor.preprocess_for_similarity(jd_text)

        # Edge case: If either text is completely empty after preprocessing
        if not clean_resume or not clean_jd:
            return {
                "raw_similarity": 0.0,
                "percentage": 0.0
            }

        try:
            vectorizer = TfidfVectorizer(
                ngram_range=(1, 2),
                min_df=1,
                max_df=1.0,
                sublinear_tf=True
            )
            tfidf_matrix = vectorizer.fit_transform([clean_jd, clean_resume])
            # tfidf_matrix[0] is JD, tfidf_matrix[1] is Resume
            sim_matrix = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])
            raw_sim = float(sim_matrix[0][0])
            
            # Bound check
            raw_sim = max(0.0, min(1.0, raw_sim))
            percentage = round(raw_sim * 100.0, 2)
            
            return {
                "raw_similarity": round(raw_sim, 4),
                "percentage": percentage
            }
        except Exception:
            return {
                "raw_similarity": 0.0,
                "percentage": 0.0
            }


similarity_service = SimilarityService()
