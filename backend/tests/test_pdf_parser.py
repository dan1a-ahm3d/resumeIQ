"""
Unit tests for PDF Parser Service.
"""
import pytest
import pymupdf as fitz
from app.services.pdf_parser import pdf_parser


def create_dummy_pdf(pages_text: list) -> bytes:
    doc = fitz.open()
    for text in pages_text:
        page = doc.new_page()
        page.insert_text((50, 72), text)
    pdf_bytes = doc.write()
    doc.close()
    return pdf_bytes


def test_parse_valid_pdf_multi_page():
    page1 = "Candidate Alpha\nSoftware Engineer\nSkills: Python, FastAPI"
    page2 = "Experience:\nDeveloped microservices at Tech Corp."
    pdf_bytes = create_dummy_pdf([page1, page2])
    
    parsed = pdf_parser.parse_pdf(pdf_bytes, "candidate_alpha.pdf")
    assert parsed.filename == "candidate_alpha.pdf"
    assert len(parsed.pages) == 2
    assert parsed.pages[0].page_number == 1
    assert "Python" in parsed.pages[0].text
    assert parsed.pages[1].page_number == 2
    assert "Tech Corp" in parsed.pages[1].text
    assert "FastAPI" in parsed.full_text
    assert len(parsed.warnings) == 0


def test_parse_empty_pdf_bytes():
    parsed = pdf_parser.parse_pdf(b"", "empty.pdf")
    assert len(parsed.pages) == 0
    assert "empty" in parsed.warnings[0].lower()


def test_parse_scanned_image_pdf_warning():
    # Empty page with no text simulates a scanned/image PDF without OCR
    doc = fitz.open()
    doc.new_page()  # Blank page
    pdf_bytes = doc.write()
    doc.close()
    
    parsed = pdf_parser.parse_pdf(pdf_bytes, "scanned.pdf")
    assert any("OCR is not supported" in w for w in parsed.warnings)


def test_normalize_whitespace():
    raw = "Hello   world!\n\n\n\nTest  spaces."
    cleaned = pdf_parser.normalize_whitespace(raw)
    assert "Hello world!" in cleaned
    assert "\n\n\n" not in cleaned
