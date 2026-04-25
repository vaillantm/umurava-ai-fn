1. Overview
This technical guide defines the problem statement, system requirements, technical expectations, and delivery standards for the Umurava AI Hackathon with the theme “An innovation challenge to build AI Products for Human Resources Industry. It is intended to guide participating teams in building a production-ready prototype aligned with Umurava’s AI roadmap.

The challenge focuses on designing and deploying an AI-powered talent profile screening tool that augments recruiters’ decision-making while keeping humans in control of final hiring decisions. Please find HERE the full Technical guide document of the Umurava AI Hackathon.

2. Problem Statement
Recruiters today face two major challenges:

High application volumes that significantly increase time-to-hire
Difficulty objectively comparing candidates across diverse profiles and formats
The problem to solve is:

How can AI be used to accurately, transparently, and efficiently screen and shortlist job applicants across both structured talent profiles and unstructured resumes while preserving human-led hiring decisions?

Teams must build a system that:

Understands job requirements and ideal candidate profiles
Analyzes multiple applicants at once
Produces a ranked shortlist (Top 10 or Top 20)
Clearly explains why candidates were shortlisted
3. Product Scope & Usage Scenarios
Scenario 1: Screening Applicants from the Umurava Platform
Input

Job details (role, requirements, skills, experience)
Structured talent profiles (provided schema)
AI Responsibilities

Analyze all applicants against the job criteria
Score and rank candidates
Generate a shortlist of the Top 10 or 20 candidates
Constraints

Teams will receive a Talent Profile Schema from Umurava
Dummy data must strictly follow this schema
AI output must be explainable. Each shortlisted candidate must include clear reasoning covering strengths, gaps, and relevance to the role.
Scenario 2: Screening Applicants from External Job Boards
Input

Manually entered job details
Uploaded spreadsheet (CSV / Excel)
Resume links or PDF uploads
AI Responsibilities

Parse resumes and applicant data
Match applicants to job requirements
Rank and shortlist the Top 10 or 20 candidates
Design Freedom

Teams are free to design:

Resume parsing approach
Spreadsheet ingestion logic
Matching and scoring methodology
4. Functional Requirements
The application must provide a recruiter-facing interface that supports:

Job creation and editing
Applicant ingestion (profiles or uploads)
Triggering AI-based screening
Viewing ranked shortlists
Viewing AI-generated reasoning per candidate
5. System Architecture (Expected)
A typical high-level architecture may include:

Frontend (Next.js)
Recruiter dashboard
Job input forms
Applicant upload interfaces
Shortlist visualization
Backend (Node.js + TypeScript)
API layer
Job & applicant processing
AI orchestration logic
AI Layer (Gemini API – Mandatory)
Job-to-candidate matching
Candidate scoring and ranking
Natural-language reasoning generation
Database (MongoDB)
Jobs
Applicants
Screening results
6. AI & LLM Requirements
Mandatory Requirements
Gemini API must be used as the underlying LLM
Prompt engineering must be intentional and documented
AI outputs must be clean, structured, and recruiter-friendly
Recommended AI Capabilities
Multi-candidate evaluation in a single prompt
Weighted scoring (skills, experience, education, relevance)
Natural-language explanation for each shortlisted candidate
Example AI Output (Simplified)
Candidate Rank
Match Score (0–100)
Strengths
Gaps / Risks
Final Recommendation
7. Technology Stack
Teams are strongly encouraged to use the following stack:

Language: TypeScript
Frontend: Next.js
State Management: Redux + Redux Toolkit
Styling: Tailwind CSS
Backend: Node.js
Database: MongoDB
AI / LLM: Gemini API
Alternative tools are allowed if justified, but Gemini remains mandatory.

8. Team Composition & Skill Expectations
Each team must have 2–5 members, with the following minimum roles:

1. Front-End Engineer (Junior-Intermediate-Senior)
Expected Skills

Advanced React / Next.js
Form handling & state management
UX for complex workflows
API integration
Responsibilities

Recruiter-facing UI
Data visualization of shortlists
Responsive and clean UX
2. Back-End Engineer (Junior-Intermediate-Senior)
Expected Skills

Node.js with TypeScript
REST API design
Database modeling (MongoDB)
Authentication & security basics
Responsibilities

Business logic implementation
Data ingestion pipelines
AI request orchestration
3. AI Software Engineer (Junior-Intermediate-Senior)
Expected Skills

LLM prompt engineering
Gemini API integration
Text analysis & ranking logic
AI explainability concepts
Responsibilities

Designing AI decision flow
Ensuring reliable and interpretable outputs
Documenting AI assumptions & limitations
Note: Every team is required to have someone experienced in AI or the same scope of work for this innovation challenge. 

Optional Roles
Product-minded Engineer
UI/UX Designer
DevOps-focused Engineer
9. Deployment Requirements
The application must be deployed and accessible online.

Recommended Hosting Providers
Vercel (Frontend)
Railway / Render / Fly.io (Backend)
MongoDB Atlas (Database)
Other affordable providers are allowed if stable and documented.

Deployment Expectations
Live URL shared at submission
Environment variables securely configured
Basic error handling in production
10. Codebase & Documentation Standards
Each team must submit a codebase that includes:

Clean, structured repository
README.md containing:
Project overview
Architecture diagram (optional but encouraged)
Setup instructions
Environment variables
AI decision flow explanation
Assumptions and limitations
Code readability and structure will be evaluated.

11. Expected Deliverables
Deployed web application (staging or production)
Functional AI-powered screening logic
Google Slides / PowerPoint (maximum 2 slides)
Clear recruiter-facing interface
Technical documentation
12. Review & Submission Notes
There will be 2 check-in and progress virtual sessions for the hackathons participants to seek for industry advice and expertise that can guide their development process.
A WhatsApp Group for all hackathon participants will be created to enhance Q&A and engagements. 
Teams may request clarification via:
Email: competence@umurava.africa
Phone: +250 784 664 612 | +250 781 255 340 | +250 780 487 389
Note: All teams must submit a project repository sufficient for technical evaluation. Only the winning team will be required to submit full source code and configuration for integration into Umurava’s production infrastructure.

13. Final Note
This hackathon is evaluated not only on technical execution, but also on:

Practical relevance
AI clarity and responsibility
Engineering quality
Product thinking
Teams are encouraged to build as if this product will go live at scale within Umurava’s ecosystem.

14. Prizes
Money Prize:

1st Place: 600,000 RWF + Product Implementation into Umurava’s Product Suite. 
2nd Place: 250,000 RWF.
3rd Place: 150,000 RWF.
Knowledge Prize:

Join Umurava Talent Pool and get prioritized to jobs and projects in the Tech & AI Jobs landscape 
Apprenticeship Opportunities for Junior Talents in AI Engineering and Data Scienc 
Manzi Vaillant <manzivaillant@gmail.com>
1:30 PM (2 minutes ago)
to manzibusiness02

Here are the judging criteria:
1. AI & Engineering Prowess
Focus: Technical depth, correctness, and AI implementation quality
2. UX & Product Design
Focus: Usability, clarity, recruiter experience
3. HR / Talent Acquisition experience
Focus: Hiring relevance, fairness, and real-world applicability
4. Business Relevance
Focus: Market viability, scalability, and product thinking