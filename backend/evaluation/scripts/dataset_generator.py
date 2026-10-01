"""
Dataset Generator for ResumeIQ Evaluation Framework.
Generates deterministic synthetic resumes (PDF) and job descriptions (TXT)
with controlled technical skill profiles and zero sensitive personal attributes.
"""
import os
import fitz  # PyMuPDF

RESUME_PROFILES = [
    {
        "id": "candidate_delta",
        "filename": "candidate_delta.pdf",
        "title": "Candidate Delta | Data Analyst & Junior ML Developer",
        "text": """Candidate Delta
Data Analyst & Junior ML Developer | delta@example.internal
Summary:
Analytical professional with experience in quantitative exploratory data analysis, feature engineering, and statistical modeling.
Technical Skills:
Languages: Python, SQL
Libraries & Tools: Pandas, NumPy, scikit-learn, Tableau, Git
Experience:
Data Analyst - MetricWave Analytics (2022 - Present)
- Conducted exploratory data analysis on 500k+ customer transactions using Python and Pandas.
- Built regression and decision tree classification models using scikit-learn and NumPy.
- Queried enterprise data warehouses with SQL to assemble reporting marts in Tableau.
- Versioned analytical models and ETL scripts using Git.
Education:
B.S. in Statistics - Technical Institute
"""
    },
    {
        "id": "candidate_epsilon",
        "filename": "candidate_epsilon.pdf",
        "title": "Candidate Epsilon | Senior DevOps & Infrastructure Engineer",
        "text": """Candidate Epsilon
Senior DevOps & Infrastructure Engineer | epsilon@example.internal
Summary:
Systems automation and cloud infrastructure architect specializing in container orchestration, infrastructure as code, and CI/CD pipelines.
Technical Skills:
Cloud & Virtualization: AWS, Linux
Containers & Orchestration: Docker, Kubernetes
Automation & Tools: CI/CD, Terraform, Bash, Git, Python
Experience:
DevOps Architect - CloudCore Systems (2020 - Present)
- Automated immutable AWS cloud provisioning utilizing Terraform and Bash.
- Engineered continuous integration and delivery pipelines with Git and automated CI/CD stages.
- Administered multi-tenant Kubernetes clusters running containerized Docker microservices.
- Hardened production Linux servers and developed maintenance utilities in Python.
Education:
B.S. in Computer Engineering - Polytechnic University
"""
    },
    {
        "id": "candidate_zeta",
        "filename": "candidate_zeta.pdf",
        "title": "Candidate Zeta | Data Platform Engineer",
        "text": """Candidate Zeta
Data Platform Engineer | zeta@example.internal
Summary:
Backend data platform specialist with 5 years of experience building resilient distributed ingestion pipelines and transactional databases.
Technical Skills:
Languages: Python, SQL
Data Technologies: PostgreSQL, Redis, Apache Spark, Pandas
Infrastructure: Docker, Linux, Git
Experience:
Data Engineer - StreamData Technologies (2021 - Present)
- Designed high-throughput batch ETL workloads using Apache Spark and Python.
- Optimized relational query plans and indexing strategies in PostgreSQL.
- Deployed Redis caching clusters to support sub-10ms data retrieval for downstream services.
- Packaged data extraction workers as Docker containers on Linux nodes.
Education:
B.S. in Computer Information Systems - Metropolitan University
"""
    },
    {
        "id": "candidate_eta",
        "filename": "candidate_eta.pdf",
        "title": "Candidate Eta | Full Stack JavaScript Engineer",
        "text": """Candidate Eta
Full Stack JavaScript Engineer | eta@example.internal
Summary:
Full stack web developer with 4 years of experience building scalable single-page web applications and REST APIs.
Technical Skills:
Languages: JavaScript, TypeScript, HTML, CSS
Frameworks & Runtimes: React, Node.js, Express.js, MongoDB
Architecture: REST API, Git
Experience:
Full Stack Developer - HyperWeb Solutions (2021 - Present)
- Developed responsive single-page web applications using React, HTML, and CSS.
- Engineered asynchronous REST API backend microservices in Node.js and Express.js.
- Modelled document stores and aggregation pipelines in MongoDB using TypeScript.
- Collaborated using Git version control and reviewed pull requests.
Education:
B.S. in Software Development - Regional College
"""
    },
    {
        "id": "candidate_theta",
        "filename": "candidate_theta.pdf",
        "title": "Candidate Theta | Systems & Embedded Software Engineer",
        "text": """Candidate Theta
Systems & Embedded Software Engineer | theta@example.internal
Summary:
Low-level systems engineer focused on high-performance native modules, kernel extensions, and memory safety.
Technical Skills:
Languages: C++, Rust
Platforms: Linux
Tools: Git, Bash
Experience:
Systems Programmer - CoreKernel Labs (2021 - Present)
- Implemented low-latency networking utilities in C++ and Rust on Linux.
- Automated build testing and static analysis using Bash scripts.
- Managed codebase branching and release tags with Git.
Education:
B.S. in Electrical and Computer Engineering - Institute of Technology
"""
    },
    {
        "id": "candidate_iota",
        "filename": "candidate_iota.pdf",
        "title": "Candidate Iota | Senior NLP Research Specialist",
        "text": """Candidate Iota
Senior NLP Research Specialist | iota@example.internal
Summary:
Natural language processing researcher with deep expertise in neural sequence modeling, tokenization algorithms, and transformer architectures.
Technical Skills:
Languages: Python
Deep Learning & NLP: PyTorch, NLP, spaCy, scikit-learn, Deep Learning, Pandas, NumPy
Experience:
Lead NLP Researcher - CognitionAI Labs (2020 - Present)
- Researched novel transformer language models and attention architectures in PyTorch.
- Built domain-specific tokenizers and named entity recognition pipelines with spaCy and NLP algorithms.
- Evaluated model perplexity and classification benchmarks using scikit-learn and Pandas.
- Applied Deep Learning to unstructured legal document comprehension with NumPy.
Education:
M.S. in Artificial Intelligence - Research University
"""
    }
]

JOB_PROFILES = [
    {
        "filename": "devops_engineer.txt",
        "content": """Job Title: Cloud & DevOps Engineer

Role Overview:
ResumeIQ Platform Operations is seeking a Cloud & DevOps Engineer to scale our automated infrastructure and deployment pipelines.

Required Skills:
• Docker
• Kubernetes
• AWS
• CI/CD
• Linux

Preferred Skills:
• Python
• Bash
• Terraform

Responsibilities:
• Maintain production Kubernetes clusters and Dockerized microservice workloads.
• Build automated continuous integration and deployment (CI/CD) pipelines.
• Provision and govern cloud resources on AWS.
• Monitor system reliability and write automation scripts.

Qualifications:
• 3+ years of experience in DevOps or Cloud Infrastructure engineering.
• Deep proficiency with Linux operating systems and container lifecycle management.
"""
    },
    {
        "filename": "frontend_engineer.txt",
        "content": """Job Title: Senior Frontend Engineer

Role Overview:
ResumeIQ Design Systems is seeking a Senior Frontend Engineer to create accessible, elegant recruitment intelligence interfaces.

Required Skills:
• React
• TypeScript
• JavaScript
• HTML
• CSS

Preferred Skills:
• Next.js
• Tailwind CSS
• Redux
• Jest

Responsibilities:
• Develop reusable UI components and client-side web application views in React.
• Maintain type safety and codebase scalability using TypeScript.
• Translate design specifications into semantic HTML and modern responsive CSS.
• Integrate backend REST APIs and write automated tests.

Qualifications:
• 4+ years of professional web application frontend development experience.
• Strong mastery of modern ECMAScript, component patterns, and state management.
"""
    }
]


def generate_evaluation_dataset(target_dir="backend/evaluation"):
    resumes_dir = os.path.join(target_dir, "resumes")
    jobs_dir = os.path.join(target_dir, "jobs")
    os.makedirs(resumes_dir, exist_ok=True)
    os.makedirs(jobs_dir, exist_ok=True)

    # 1. Generate PDF Resumes
    for prof in RESUME_PROFILES:
        pdf_path = os.path.join(resumes_dir, prof["filename"])
        doc = fitz.open()
        page = doc.new_page(width=612, height=792)  # Standard Letter
        
        # Write text formatted neatly
        rect = fitz.Rect(54, 54, 558, 738)
        page.insert_textbox(rect, prof["text"].strip(), fontsize=10, fontname="helv", lineheight=1.3)
        doc.save(pdf_path)
        doc.close()
        print(f"Generated evaluation resume: {pdf_path}")

    # 2. Generate Job Descriptions
    for job in JOB_PROFILES:
        job_path = os.path.join(jobs_dir, job["filename"])
        with open(job_path, "w", encoding="utf-8") as f:
            f.write(job["content"].strip() + "\n")
        print(f"Generated evaluation job description: {job_path}")

    print("All evaluation files generated successfully!")


if __name__ == "__main__":
    generate_evaluation_dataset()
