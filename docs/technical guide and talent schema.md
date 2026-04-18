````md
# Umurava AI Hackathon

## 1. Overview
This technical guide defines the problem statement, system requirements, technical expectations, and delivery  
standards for the Umurava AI Hackathon with the theme:

> “An innovation challenge to build AI Products for Human Resources Industry.”

It is intended to guide participating teams in building a production-ready prototype aligned with  
Umurava’s AI roadmap. The challenge focuses on designing and deploying an AI-powered talent profile screening  
tool that augments recruiters’ decision-making while keeping humans in control of final hiring decisions.

---

## 2. Problem Statement

Recruiters today face two major challenges:
- High application volumes that significantly increase time-to-hire  
- Difficulty objectively comparing candidates across diverse profiles and formats  

**Core Question:**  
How can AI be used to accurately, transparently, and efficiently screen and shortlist job applicants across both structured talent profiles and unstructured resumes while preserving human-led hiring decisions?

### System Must:
- Understand job requirements and ideal candidate profiles  
- Analyze multiple applicants at once  
- Produce a ranked shortlist (Top 10 or Top 20)  
- Clearly explain why candidates were shortlisted  

---

## 3. Product Scope & Usage Scenarios

### Scenario 1: Umurava Platform
**Input:**
- Job details (role, requirements, skills, experience)  
- Structured talent profiles  

**AI Responsibilities:**
- Analyze applicants  
- Score and rank candidates  
- Generate Top 10/20 shortlist  

**Constraints:**
- Must follow provided schema  
- Must be explainable  
- Include strengths, gaps, relevance  

---

### Scenario 2: External Job Boards
**Input:**
- Manual job details  
- CSV / Excel uploads  
- Resume links / PDFs  

**AI Responsibilities:**
- Parse resumes  
- Match candidates  
- Rank and shortlist  

**Design Freedom:**
- Resume parsing  
- Spreadsheet ingestion  
- Matching logic  

---

## 4. Functional Requirements

The system must support:
- Job creation and editing  
- Applicant ingestion  
- AI screening trigger  
- Ranked shortlist view  
- AI-generated reasoning per candidate  

---

## 5. System Architecture (Expected)

- **Frontend (Next.js)** → Dashboard, forms, uploads  
- **Backend (Node.js + TypeScript)** → APIs, processing logic  
- **AI Layer (Gemini API)** → Matching, scoring, reasoning  
- **Database (MongoDB)** → Jobs, applicants, results  

---

## 6. AI & LLM Requirements

### Mandatory
- Gemini API required  
- Prompt engineering must be documented  
- Output must be structured  

### Recommended
- Multi-candidate evaluation  
- Weighted scoring  
- Natural-language explanations  

---

## 7. Technology Stack

- Language: TypeScript  
- Frontend: Next.js  
- State: Redux Toolkit  
- Styling: Tailwind CSS  
- Backend: Node.js  
- Database: MongoDB  
- AI: Gemini API  

---

## 8. Team Composition

Minimum roles:
1. Frontend Engineer  
2. Backend Engineer  
3. AI Engineer  

---

## 9. Deployment Requirements

- Must be live online  
- Suggested: Vercel, Railway, Render, Fly.io  
- Environment variables secured  
- Basic error handling  

---

## 10. Codebase Requirements

README must include:
- Overview  
- Setup instructions  
- Environment variables  
- AI decision flow  
- Assumptions  

---

## 11. Deliverables

- Deployed app  
- AI screening logic  
- 2 slides max  
- Recruiter UI  
- Documentation  

---

## 12. Submission Notes

- 2 check-ins  
- WhatsApp group  
- Email: competence@umurava.africa  

---

## 13. Evaluation

- Practical relevance  
- AI clarity  
- Engineering quality  
- Product thinking  

---

## 14. Prizes

- 1st: 600,000 RWF + Implementation  
- 2nd: 250,000 RWF  
- 3rd: 150,000 RWF  

---

## 15. Timeline

- Start: April 11, 2026 (11:59 PM CAT)  
- End: April 24, 2026 (12:00 AM CAT)  

---

Got it — here is that **exact section fully structured in proper Markdown** with nothing missing, clean tables, spacing preserved, and code blocks where needed:

````md
# Talent Profile Schema Specification

## 1. Overview
This document defines the standard Talent Profile Schema to be used in the Umurava AI Hackathon.

The schema is designed to:
- Ensure consistency across all candidate profiles  
- Enable accurate AI-based screening and ranking  
- Support structured evaluation and explainability  
- Integrate seamlessly with the screening system  

---

## 2. Design Principles

The schema is built with the following principles:
- Structured over unstructured → Improves AI scoring accuracy  
- Explicit fields → Avoid ambiguity during evaluation  
- Extensible design → Allows future enhancements  
- AI-ready format → Supports ranking, scoring, and reasoning  

---

## 3. Talent Profile Schema

### 3.1 Basic Information

| Field Name | Type   | Required | Description |
|------------|--------|----------|------------|
| First Name | string | Yes      | Talent's first name |
| Last Name  | string | Yes      | Talent's last name |
| Email      | string | Yes      | Unique email address |
| Headline   | string | Yes      | Short professional summary (e.g., “Backend Engineer – Node.js & AI Systems”) |
| Bio        | string | No       | Detailed professional biography |
| Location   | string | Yes      | Current location (City, Country) |

---

### 3.2 Skills & Languages

| Field Name | Type     | Required | Description |
|------------|----------|----------|------------|
| skills     | object[] | Yes      | List of skills with proficiency |
| languages  | object[] | No       | Spoken languages |

#### Skills Object Example
```json
{
  "name": "Node.js",
  "level": "Beginner | Intermediate | Advanced | Expert",
  "yearsOfExperience": 3
}
````

#### Languages Object Example

```json
{
  "name": "English",
  "proficiency": "Basic | Conversational | Fluent | Native"
}
```

---

### 3.3 Work Experience

| Field Name | Type     | Required | Description                     |
| ---------- | -------- | -------- | ------------------------------- |
| experience | object[] | Yes      | Professional experience history |

#### Experience Object Example

```json
{
  "company": "Company Name",
  "role": "Backend Engineer",
  "Start Date": "YYYY-MM",
  "End Date": "YYYY-MM | Present",
  "description": "Key responsibilities and achievements",
  "technologies": ["Node.js", "PostgreSQL"],
  "Is Current": true
}
```

---

### 3.4 Education

| Field Name | Type     | Required | Description         |
| ---------- | -------- | -------- | ------------------- |
| education  | object[] | Yes      | Academic background |

#### Education Object Example

```json
{
  "institution": "University Name",
  "degree": "Bachelor's",
  "Field of Study": "Computer Science",
  "Start Year": 2020,
  "End Year": 2024
}
```

---

### 3.5 Certifications

| Field Name     | Type     | Required | Description                 |
| -------------- | -------- | -------- | --------------------------- |
| certifications | object[] | No       | Professional certifications |

#### Certification Object Example

```json
{
  "name": "AWS Certified Developer",
  "issuer": "Amazon",
  "Issue Date": "YYYY-MM"
}
```

---

### 3.6 Projects

| Field Name | Type     | Required | Description        |
| ---------- | -------- | -------- | ------------------ |
| projects   | object[] | Yes      | Portfolio projects |

#### Project Object Example

```json
{
  "name": "AI Recruitment System",
  "description": "AI-powered candidate screening platform",
  "technologies": ["Next.js", "Node.js", "Gemini API"],
  "role": "Backend Engineer",
  "link": "https://...",
  "Start Date": "YYYY-MM",
  "End Date": "YYYY-MM"
}
```

---

### 3.7 Availability

| Field Name   | Type   | Required | Description         |
| ------------ | ------ | -------- | ------------------- |
| availability | object | Yes      | Talent availability |

#### Availability Object Example

```json
{
  "status": "Available | Open to Opportunities | Not Available",
  "type": "Full-time | Part-time | Contract",
  "Start Date": "YYYY-MM-DD"
}
```

---

### 3.8 Social Links

| Field Name  | Type   | Required | Description       |
| ----------- | ------ | -------- | ----------------- |
| socialLinks | object | No       | External profiles |

#### Social Links Object Example

```json
{
  "linkedin": "https://linkedin.com/...",
  "github": "https://github.com/...",
  "portfolio": "https://..."
}
```

---

## 4. Extensibility

Teams may extend the schema with additional fields such as:

* AI-generated scores
* Portfolio ratings
* Personality insights

However, core fields must not be modified or removed.

---

## 5. Final Notes

* This schema will be used for AI-based ranking and shortlisting
* Consistency across profiles is critical for fair evaluation
* Poorly structured data will lead to lower scoring accuracy

```


