Here is a structured `meetplan.md` file synthesized from the meeting transcript. You can use this to brief your team, assign tasks, and ensure all requirements are met for the hackathon.

***

# 📝 Hackathon Project Plan: AI-Powered Screening ATS

## 1. Project Overview
**Goal:** Build an AI-powered, self-service Applicant Tracking System (ATS) that allows Talent Acquisition (TA) managers to screen multiple resumes at once based on programmable rubrics. 
**Target User:** HR professionals and TA managers. The UX must be intuitive enough for non-tech-savvy users while remaining highly functional.

## 2. Core Features (The MVP)
* **Job Creation & Applicant Upload:** Users should be able to create a job and upload/input candidate data (do not build an applicant-facing job portal; assume candidates have already applied).
* **Resume Parsing:** Must be able to parse standard resumes. **Crucial:** Must include OCR capabilities to handle scanned PDFs/images.
* **AI Shortlisting & Reasoning:** * Screen candidates against a provided TA rubric/evaluation criteria.
    * Provide a shortlist of top candidates.
    * **Transparency:** The AI *must* provide deep reasoning for its choices (e.g., comparing candidates, highlighting strengths/weaknesses) and general analytics on the applicant batch.
* **Handling Unstructured/Incomplete Data:** If a resume is incomplete or poorly formatted, the AI should set it aside, skip it in the shortlist, and notify the TA (e.g., "Top 10 shortlisted, but 20 resumes were incomplete and need manual review").
* **Login Wall:** The application must be secured behind a login screen. (Full registration/sign-up flow is not required for the demo, just functional login credentials).

## 3. Technical Requirements & Architecture
* **Mandatory AI Model:** You **must** use the Google Gemini API.
* **Hosting:** Must be deployed and hosted. The setup must be **product-agnostic** (platform-independent). You can host on Vercel, use Docker containers, etc., as long as the hosting environment can be easily reproduced elsewhere without breaking.
* **Team Roles:** Minimum of two distinct roles required:
    1.  Front-end/Product Engineer (Handles UX and product design).
    2.  AI/Backend Engineer.
* **Error Handling:** Implement strict checks for AI responses. Ensure the system handles edge cases gracefully (e.g., Gemini returning markdown instead of raw JSON, or API downtime).

## 4. AI Strategy & Optimization
* **Batch Processing:** To avoid maxing out Gemini's context window and hitting token limits, process candidates in smaller batches (e.g., chunks of 80–100 resumes).
* **Token Optimization:** Look into using TOON (Token Oriented Object Notation) or similar techniques to pass data to the LLM using fewer tokens.
* **Ethical AI:** The system must programmatically demonstrate **fairness, bias reduction, and transparency** (explainability of why someone was chosen or rejected).
* **Mock Data:** For the demo, use the provided "Talent Profile Schema" to generate around 20–30 mock applicants to run through the shortlisting process.

## 5. Scope & Priorities
* **Focus on the Core MVP:** Do not over-engineer or focus on nice-to-have features (like real-time notifications) until the core parsing, screening, and reasoning pipeline is flawless.
* **Do Not Build:** Applicant registration portals, complex recruiter onboarding, or custom Machine Learning models from scratch. Use Gemini and existing OCR tools.
* **Repository:** Your GitHub repository can be public or private (winners will be required to hand it over).

## 6. Demo Day Details
* **Location:** Physically in Kigali, Rwanda. 
* **Timeline:** Approximately two weeks from April 18th (targeting around May 1st / a public holiday or weekend to accommodate students).
* **Presentation Focus:** Demonstrate creating a job, parsing a batch of ~20-30 candidates, and showing the AI's shortlist with its reasoning and analytics.