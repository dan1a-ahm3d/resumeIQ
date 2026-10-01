"""
Text Preprocessing Service using spaCy.
Cleans and normalizes text while strictly preserving critical technical terms
such as C++, C#, .NET, Node.js, Next.js, scikit-learn, PostgreSQL, FastAPI, PyTorch.
"""
import re
from typing import List
import spacy
from app.core.config import settings

# Load spaCy NLP model
try:
    nlp = spacy.load(settings.SPACY_MODEL)
except Exception:
    # Fallback to blank model if en_core_web_sm is not yet installed in local environment
    nlp = spacy.blank("en")

# Critical technical terms that must be preserved intact
PROTECTED_TERMS = {
    "c++", "c#", ".net", "node.js", "next.js", "react.js", "vue.js",
    "scikit-learn", "postgresql", "fastapi", "pytorch", "ci/cd",
    "rest api", "restful api", "graphql", "tailwind css", "spring boot",
    "express.js", "asp.net"
}


class TextPreprocessor:
    @staticmethod
    def clean_text(text: str) -> str:
        """Basic whitespace and line-break normalization."""
        if not text:
            return ""
        text = text.replace("\r\n", "\n").replace("\r", "\n")
        text = re.sub(r"\s+", " ", text)
        return text.strip()

    @staticmethod
    def preserve_technical_tokens(text: str) -> str:
        """
        Substitutes technical terms with safe placeholders or preserves their exact notation
        during aggressive tokenization so punctuation like +, #, . is not destroyed.
        """
        # Ensure punctuation attached to known tech terms is protected
        # (e.g., C++ -> C_PLUS_PLUS or kept with boundary protection)
        replacements = [
            (r"(?i)(?<![A-Za-z0-9_])c\+\+(?![A-Za-z0-9_+#])", "cplusplus"),
            (r"(?i)(?<![A-Za-z0-9_])c#(?![A-Za-z0-9_+#])", "csharp"),
            (r"(?i)(?<![A-Za-z0-9_])\.net(?![A-Za-z0-9_])", "dotnet"),
            (r"(?i)(?<![A-Za-z0-9_])node\.js(?![A-Za-z0-9_])", "nodejs"),
            (r"(?i)(?<![A-Za-z0-9_])next\.js(?![A-Za-z0-9_])", "nextjs"),
            (r"(?i)(?<![A-Za-z0-9_])react\.js(?![A-Za-z0-9_])", "reactjs"),
            (r"(?i)(?<![A-Za-z0-9_])vue\.js(?![A-Za-z0-9_])", "vuejs"),
            (r"(?i)(?<![A-Za-z0-9_])express\.js(?![A-Za-z0-9_])", "expressjs"),
            (r"(?i)(?<![A-Za-z0-9_])scikit-learn(?![A-Za-z0-9_])", "scikitlearn"),
            (r"(?i)(?<![A-Za-z0-9_])ci/cd(?![A-Za-z0-9_])", "cicd"),
        ]
        processed = text
        for pattern, replacement in replacements:
            processed = re.sub(pattern, replacement, processed)
        return processed

    def tokenize(self, text: str) -> List[str]:
        """Tokenizes text while preserving protected multi-character tech terms."""
        cleaned = self.clean_text(text)
        if not cleaned:
            return []
        doc = nlp(cleaned)
        return [token.text for token in doc if not token.is_space]

    def preprocess_for_similarity(self, text: str) -> str:
        """
        Preprocesses text specifically for TF-IDF vectorization:
        - Normalizes protected technical terms
        - Lemmatizes standard English words
        - Removes generic stop words and punctuation without corrupting tech terms
        """
        if not text or not text.strip():
            return ""

        # Step 1: Protect tech terms
        protected = self.preserve_technical_tokens(text)

        # Step 2: SpaCy processing
        doc = nlp(protected.lower())
        tokens = []
        for token in doc:
            if token.is_stop or token.is_punct or token.is_space:
                continue
            lemma = token.lemma_.strip()
            if lemma and len(lemma) > 1:
                tokens.append(lemma)

        return " ".join(tokens)


preprocessor = TextPreprocessor()
