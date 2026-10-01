"""
Unit tests for Skill Extractor.
Tests taxonomy matching, aliases, C vs C++/C# boundaries, and STRICT ANTI-INFERENCE rules.
"""
import pytest
from app.services.skill_extractor import skill_extractor
from app.models.resume import ParsedResume, ResumePage


def test_extract_exact_skills_and_context():
    text = "Developed predictive model evaluation pipelines in Python using scikit-learn and SQL database queries."
    skills = skill_extractor.extract_skills_from_text(text, page_number=1)
    detected_names = {s.skill for s in skills}
    
    assert "Python" in detected_names
    assert "scikit-learn" in detected_names
    assert "SQL" in detected_names

    # Check that context is verbatim
    py_ev = next(s for s in skills if s.skill == "Python")
    assert "predictive model evaluation" in py_ev.context
    assert py_ev.page_number == 1


def test_skill_aliases():
    text = "Experience with ReactJS, Postgres database, and Sklearn for analytics."
    skills = skill_extractor.extract_skills_from_text(text)
    detected = {s.skill: s.matched_text for s in skills}
    
    assert "React" in detected
    assert "PostgreSQL" in detected
    assert "scikit-learn" in detected


def test_special_syntax_skills():
    text = "Built high-frequency trading engine in C++ and backend in C# on .NET Core."
    skills = skill_extractor.extract_skills_from_text(text)
    detected_names = {s.skill for s in skills}
    
    assert "C++" in detected_names
    assert "C#" in detected_names
    assert ".NET" in detected_names


def test_c_plus_plus_does_not_infer_c():
    """
    REGRESSION TEST:
    'Languages: Python, SQL, C++' must detect C++, but must NOT detect C.
    """
    text = "Languages: Python, SQL, C++"
    skills = skill_extractor.extract_skills_from_text(text)
    detected_names = {s.skill for s in skills}
    
    assert "C++" in detected_names
    assert "C" not in detected_names
    assert "Python" in detected_names
    assert "SQL" in detected_names


def test_c_sharp_does_not_infer_c():
    """
    REGRESSION TEST:
    'Languages: Python, C#, .NET' must detect C# and .NET, but must NOT detect C.
    """
    text = "Languages: Python, C#, .NET"
    skills = skill_extractor.extract_skills_from_text(text)
    detected_names = {s.skill for s in skills}
    
    assert "C#" in detected_names
    assert "C" not in detected_names
    assert ".NET" in detected_names


def test_standalone_c_matches():
    """
    Verifies that standalone C language is still accurately detected when explicitly present.
    """
    text = "Embedded systems developer with 5 years of C programming experience."
    skills = skill_extractor.extract_skills_from_text(text)
    detected_names = {s.skill for s in skills}
    
    assert "C" in detected_names


def test_strict_anti_inference_policy():
    """
    CRITICAL TEST REQUIREMENT:
    If resume contains 'React', system must NOT infer:
    Node.js, Python, Java, JavaScript, HTML, CSS.
    """
    text = "Frontend specialist with deep experience in React component architecture."
    skills = skill_extractor.extract_skills_from_text(text)
    detected_names = {s.skill for s in skills}
    
    assert "React" in detected_names
    assert "Node.js" not in detected_names
    assert "Python" not in detected_names
    assert "Java" not in detected_names
    assert "JavaScript" not in detected_names
    assert "HTML" not in detected_names
    assert "CSS" not in detected_names


def test_multi_page_resume_extraction():
    parsed = ParsedResume(
        filename="test.pdf",
        pages=[
            ResumePage(page_number=1, text="Skills: Python and Docker."),
            ResumePage(page_number=2, text="Cloud: AWS and Kubernetes.")
        ],
        full_text="Skills: Python and Docker.\n\nCloud: AWS and Kubernetes."
    )
    skills = skill_extractor.extract_skills_from_resume(parsed)
    page_map = {s.skill: s.page_number for s in skills}
    
    assert page_map["Python"] == 1
    assert page_map["Docker"] == 1
    assert page_map["AWS"] == 2
    assert page_map["Kubernetes"] == 2
