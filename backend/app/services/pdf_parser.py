"""
PDF Parsing Service using PyMuPDF (fitz).
Extracts text page-by-page, normalizes whitespace, detects empty/scanned PDFs,
and provides actionable warnings without OCR.
"""
import re
from typing import List
import pymupdf as fitz  # PyMuPDF
from app.models.resume import ParsedResume, ResumePage


class PDFParserService:
    @staticmethod
    def normalize_whitespace(text: str) -> str:
        """Normalizes excessive newlines, tabs, and spaces while preserving paragraph breaks."""
        text = text.replace("\r\n", "\n").replace("\r", "\n")
        # Replace 3 or more consecutive newlines with 2
        text = re.sub(r"\n{3,}", "\n\n", text)
        # Collapse multiple horizontal spaces
        text = re.sub(r"[ \t]{2,}", " ", text)
        return text.strip()

    def parse_pdf(self, file_bytes: bytes, filename: str = "resume.pdf") -> ParsedResume:
        """
        Parses PDF bytes into structured ParsedResume object.
        Preserves page numbers (1-indexed) and detects non-extractable text.
        """
        if not file_bytes or len(file_bytes) == 0:
            return ParsedResume(
                filename=filename,
                pages=[],
                full_text="",
                warnings=["The uploaded file is empty."]
            )

        warnings: List[str] = []
        pages: List[ResumePage] = []
        full_text_chunks: List[str] = []

        try:
            doc = fitz.open(stream=file_bytes, filetype="pdf")
        except Exception as e:
            raise ValueError(f"Unable to parse PDF document '{filename}': {str(e)}")

        page_count = len(doc)
        if page_count == 0:
            warnings.append("The PDF document contains 0 pages.")
            return ParsedResume(
                filename=filename,
                pages=[],
                full_text="",
                warnings=warnings
            )

        total_extracted_chars = 0

        for page_idx in range(page_count):
            page_num = page_idx + 1
            page = doc[page_idx]
            raw_text = page.get_text("text") or ""
            cleaned_page_text = self.normalize_whitespace(raw_text)
            
            total_extracted_chars += len(cleaned_page_text)
            pages.append(ResumePage(page_number=page_num, text=cleaned_page_text))
            if cleaned_page_text:
                full_text_chunks.append(cleaned_page_text)

        doc.close()

        full_text = "\n\n".join(full_text_chunks).strip()

        # Check if text extraction yielded no meaningful characters (e.g. scanned image PDF)
        if total_extracted_chars < 15:
            warnings.append("No extractable text was found. OCR is not supported in the current version.")

        return ParsedResume(
            filename=filename,
            pages=pages,
            full_text=full_text,
            warnings=warnings
        )


pdf_parser = PDFParserService()
