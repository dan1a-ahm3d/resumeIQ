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


# ==============================================================================
# MILESTONE 5 REGRESSION TESTS: COLLISION PREVENTION & BOUNDARY ENFORCEMENT
# ==============================================================================

def test_rest_prose_does_not_trigger_rest_api():
    """English prose containing 'rest' must NOT extract REST API."""
    text = "Collaborated closely with the rest of the team and took rest breaks."
    detected = {ev.skill for ev in skill_extractor.extract_skills_from_text(text)}
    assert "REST API" not in detected


def test_node_infrastructure_does_not_trigger_nodejs():
    """Infrastructure terms like 'worker node' must NOT extract Node.js."""
    text = "Administered a cluster of 5 Linux worker nodes with a single primary node."
    detected = {ev.skill for ev in skill_extractor.extract_skills_from_text(text)}
    assert "Node.js" not in detected
    assert "Linux" in detected


def test_go_prose_does_not_trigger_go():
    """Ordinary lowercase English 'go' or prose must NOT trigger Go programming language."""
    text = "Led cross-functional teams to go beyond targets and will go to conferences."
    detected = {ev.skill for ev in skill_extractor.extract_skills_from_text(text)}
    assert "Go" not in detected


def test_explicit_rest_api_triggers_rest_api():
    """Explicit technical REST API or RESTful mentions MUST trigger REST API."""
    text1 = "Architected asynchronous REST API services handling 15k req/sec."
    detected1 = {ev.skill for ev in skill_extractor.extract_skills_from_text(text1)}
    assert "REST API" in detected1

    text2 = "Developed scalable restful microservices for client platforms."
    detected2 = {ev.skill for ev in skill_extractor.extract_skills_from_text(text2)}
    assert "REST API" in detected2


def test_explicit_nodejs_triggers_nodejs():
    """Explicit Node.js, nodejs, or node.js MUST trigger Node.js."""
    text1 = "Engineered backend microservices in Node.js and Express.js."
    detected1 = {ev.skill for ev in skill_extractor.extract_skills_from_text(text1)}
    assert "Node.js" in detected1

    text2 = "Full stack developer using nodejs and react."
    detected2 = {ev.skill for ev in skill_extractor.extract_skills_from_text(text2)}
    assert "Node.js" in detected2


def test_explicit_go_triggers_go():
    """Explicit Go programming language mentions MUST trigger Go."""
    text1 = "Languages: Python, Go, SQL"
    detected1 = {ev.skill for ev in skill_extractor.extract_skills_from_text(text1)}
    assert "Go" in detected1

    text2 = "Developed high-concurrency microservices in Golang."
    detected2 = {ev.skill for ev in skill_extractor.extract_skills_from_text(text2)}
    assert "Go" in detected2

    text3 = "Senior Go developer with 4 years experience."
    detected3 = {ev.skill for ev in skill_extractor.extract_skills_from_text(text3)}
    assert "Go" in detected3


def test_uppercase_ml_triggers_machine_learning():
    """Uppercase acronym 'ML' in technical title/summary MUST trigger Machine Learning."""
    text = "Candidate Delta | Data Analyst & Junior ML Developer"
    detected = {ev.skill for ev in skill_extractor.extract_skills_from_text(text)}
    assert "Machine Learning" in detected


def test_lowercase_ml_measurement_does_not_trigger_machine_learning():
    """Lowercase measurement or prose 'ml' must NOT trigger Machine Learning."""
    text = "Handled 500 ml chemical reagent samples in laboratory automation."
    detected = {ev.skill for ev in skill_extractor.extract_skills_from_text(text)}
    assert "Machine Learning" not in detected


def test_ambiguous_two_letter_acronyms_case_sensitivity():
    """Two-letter acronyms (CV, DL, TF) require uppercase to avoid prose collision."""
    # CV
    assert "Computer Vision" not in {ev.skill for ev in skill_extractor.extract_skills_from_text("Please see attached cv for details.")}
    assert "Computer Vision" in {ev.skill for ev in skill_extractor.extract_skills_from_text("Senior CV Research Engineer working on object detection.")}

    # TF
    assert "TensorFlow" not in {ev.skill for ev in skill_extractor.extract_skills_from_text("Calculated tf-idf matrix scores.")}
    assert "TensorFlow" in {ev.skill for ev in skill_extractor.extract_skills_from_text("Trained deep neural networks in TF and PyTorch.")}

    # DL
    assert "Deep Learning" not in {ev.skill for ev in skill_extractor.extract_skills_from_text("Saved file to dl folder.")}
    assert "Deep Learning" in {ev.skill for ev in skill_extractor.extract_skills_from_text("Designed DL architectures for speech synthesis.")}
