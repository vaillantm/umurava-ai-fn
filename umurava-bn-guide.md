# Umurava BN Guide

Backend handoff guide for the Umurava AI recruiter portal.

This document is based on:
- `xtechguide.md`
- `xguide.md`
- `googlemeet.md`
- the current frontend implementation in `index.html`, `dashboard.html`, `jobs.html`, `external.html`, `candidates.html`, `shortlist.html`, `profile.html`, `settings.html`, `shared.js`, and `shared.css`

## 1. Product Goal

Build a recruiter-facing AI screening system that:
- creates and manages jobs
- ingests candidate profiles from JSON, CSV, PDF, and manual entry
- scores candidates against a job rubric
- produces ranked shortlists
- explains every ranking in recruiter-friendly language
- keeps humans in control of final hiring decisions

Gemini API is mandatory for the AI layer.

## 2. Frontend Workflow

The current frontend flow is:
1. Recruiter logs in from `login.html`
2. Recruiter manages jobs in `jobs.html`
3. Recruiter uploads candidates in `external.html`
4. Candidate pool is visible in `candidates.html`
5. AI screening results are visible in `shortlist.html`
6. Full candidate details are visible in `profile.html`
7. AI tuning is exposed in `settings.html`

## 3. Frontend Data Sources

### 3.1 Job data fields

The job form currently exposes:
- `jobTitle`
- `department`
- `location`
- `employmentType`
- `experienceLevel`
- `shortlistSize`
- `jobDescription`
- required skills list
- AI weights
- ideal candidate profile text

### 3.2 Candidate profile schema

The frontend candidate model is already aligned with the hackathon schema.

#### `personalInfo`
- `firstName`
- `lastName`
- `email`
- `headline`
- `bio`
- `location`

#### `skills[]`
- `name`
- `level`
- `yearsOfExperience`

#### `languages[]`
- `name`
- `proficiency`

#### `experience[]`
- `company`
- `role`
- `startDate`
- `endDate`
- `description`
- `technologies[]`
- `isCurrent`

#### `education[]`
- `institution`
- `degree`
- `fieldOfStudy`
- `startYear`
- `endYear`

#### `certifications[]`
- `name`
- `issuer`
- `issueDate`

#### `projects[]`
- `name`
- `description`
- `technologies[]`
- `role`
- `link`
- `startDate`
- `endDate`

#### `availability`
- `status`
- `type`
- `startDate`

#### `socialLinks`
- `linkedin`
- `github`
- `portfolio`

### 3.3 UI upload modes

`external.html` supports:
- JSON upload
- CSV upload
- PDF upload
- manual entry

Backend should support the same ingestion types even if the frontend simulates some of them in the MVP.

## 4. Recommended Backend Architecture

- `src/app.ts` or `src/server.ts`
- `src/config/`
- `src/modules/auth/`
- `src/modules/jobs/`
- `src/modules/candidates/`
- `src/modules/screening/`
- `src/modules/uploads/`
- `src/modules/gemini/`
- `src/modules/reports/`
- `src/middleware/`
- `src/utils/`
- `src/types/`

## 5. Suggested Database Models

Use MongoDB with Mongoose or a similar ODM.

### 5.1 User

Used for recruiters/admins.

```json
{
  "_id": "user_123",
  "fullName": "Jane Doe",
  "email": "jane.doe@company.com",
  "role": "recruiter",
  "companyName": "Umurava",
  "avatarUrl": "https://...",
  "passwordHash": "...",
  "status": "active",
  "createdAt": "2026-04-18T10:00:00.000Z",
  "updatedAt": "2026-04-18T10:00:00.000Z"
}
```

### 5.2 Job

```json
{
  "_id": "job_123",
  "title": "Senior Backend Engineer",
  "department": "Engineering",
  "location": "Kigali, Rwanda / Remote",
  "employmentType": "Full-time",
  "experienceLevel": "Mid-level (3-5 yrs)",
  "shortlistSize": 20,
  "description": "We are looking for...",
  "requiredSkills": ["Node.js", "TypeScript", "MongoDB"],
  "idealCandidateProfile": "Ideal candidate has 5+ years...",
  "aiWeights": {
    "skills": 40,
    "experience": 30,
    "education": 15,
    "projects": 10,
    "certifications": 5
  },
  "status": "draft",
  "createdBy": "user_123",
  "createdAt": "2026-04-18T10:00:00.000Z",
  "updatedAt": "2026-04-18T10:00:00.000Z"
}
```

### 5.3 Candidate

```json
{
  "_id": "cand_123",
  "source": "manual",
  "sourceFileName": "alice.json",
  "personalInfo": {
    "firstName": "Alice",
    "lastName": "Uwimana",
    "email": "alice.uwimana@andela.com",
    "headline": "Senior Backend Engineer · Node.js & AI Systems",
    "bio": "Experienced backend leader...",
    "location": "Kigali, Rwanda"
  },
  "skills": [
    { "name": "Node.js", "level": "Expert", "yearsOfExperience": 6 }
  ],
  "languages": [
    { "name": "English", "proficiency": "Fluent" }
  ],
  "experience": [
    {
      "company": "Andela",
      "role": "Senior Backend Engineer",
      "startDate": "2022-01",
      "endDate": "Present",
      "description": "Led microservices migration...",
      "technologies": ["Node.js", "MongoDB"],
      "isCurrent": true
    }
  ],
  "education": [
    {
      "institution": "University of Rwanda",
      "degree": "Bachelor's",
      "fieldOfStudy": "Computer Science",
      "startYear": 2016,
      "endYear": 2020
    }
  ],
  "certifications": [
    { "name": "AWS Certified Developer", "issuer": "Amazon", "issueDate": "2023-03" }
  ],
  "projects": [
    {
      "name": "Talent Marketplace API",
      "description": "Scalable backend for 50k+ users",
      "technologies": ["Node.js", "MongoDB"],
      "role": "Tech Lead",
      "link": "https://github.com/example",
      "startDate": "2022-01",
      "endDate": "Present"
    }
  ],
  "availability": {
    "status": "Available",
    "type": "Full-time",
    "startDate": "2024-05-01"
  },
  "socialLinks": {
    "linkedin": "https://linkedin.com/in/aliceuwimana",
    "github": "https://github.com/aliceuwimana",
    "portfolio": "https://alice.dev"
  },
  "createdAt": "2026-04-18T10:00:00.000Z",
  "updatedAt": "2026-04-18T10:00:00.000Z"
}
```

### 5.4 Screening Result

```json
{
  "_id": "screen_123",
  "jobId": "job_123",
  "candidateId": "cand_123",
  "rank": 1,
  "score": 92,
  "scoreBreakdown": {
    "skills": 38,
    "experience": 31,
    "education": 12,
    "projects": 7,
    "certifications": 4
  },
  "reasoning": "Strong match because...",
  "strengths": ["Node.js expertise", "Lead experience"],
  "gaps": ["Limited domain exposure"],
  "decision": "shortlisted",
  "shortlistLabel": "Top 20",
  "generatedBy": "gemini-2.5-pro",
  "createdAt": "2026-04-18T10:00:00.000Z"
}
```

## 6. Core Backend Routes

### 6.1 Auth

`POST /api/auth/login`

Request:
```json
{
  "email": "jane.doe@company.com",
  "password": "password123"
}
```

Response:
```json
{
  "token": "jwt_token",
  "user": {
    "id": "user_123",
    "fullName": "Jane Doe",
    "email": "jane.doe@company.com",
    "role": "recruiter"
  }
}
```

### 6.2 Jobs

`GET /api/jobs`

`POST /api/jobs`

`GET /api/jobs/:jobId`

`PATCH /api/jobs/:jobId`

`DELETE /api/jobs/:jobId`

Sample create payload:
```json
{
  "title": "Senior Backend Engineer",
  "department": "Engineering",
  "location": "Kigali, Rwanda / Remote",
  "employmentType": "Full-time",
  "experienceLevel": "Mid-level (3-5 yrs)",
  "shortlistSize": 20,
  "description": "We are looking for a Senior Backend Engineer...",
  "requiredSkills": ["Node.js", "TypeScript", "MongoDB", "REST APIs", "Docker", "PostgreSQL"],
  "idealCandidateProfile": "Ideal candidate has 5+ years of Node.js experience...",
  "aiWeights": {
    "skills": 40,
    "experience": 30,
    "education": 15,
    "projects": 10,
    "certifications": 5
  }
}
```

### 6.3 Candidates

`GET /api/candidates`

`POST /api/candidates`

`GET /api/candidates/:candidateId`

`PATCH /api/candidates/:candidateId`

`DELETE /api/candidates/:candidateId`

`POST /api/candidates/bulk-json`

`POST /api/candidates/bulk-csv`

`POST /api/candidates/bulk-pdf`

`POST /api/candidates/manual`

Sample candidate create payload:
```json
{
  "source": "manual",
  "personalInfo": {
    "firstName": "Alice",
    "lastName": "Uwimana",
    "email": "alice.uwimana@andela.com",
    "headline": "Senior Backend Engineer · Node.js & AI Systems",
    "bio": "Experienced backend leader...",
    "location": "Kigali, Rwanda"
  },
  "skills": [
    { "name": "Node.js", "level": "Expert", "yearsOfExperience": 6 }
  ],
  "languages": [
    { "name": "English", "proficiency": "Fluent" }
  ],
  "experience": [
    {
      "company": "Andela",
      "role": "Senior Backend Engineer",
      "startDate": "2022-01",
      "endDate": "Present",
      "description": "Led microservices migration...",
      "technologies": ["Node.js", "MongoDB"],
      "isCurrent": true
    }
  ],
  "education": [
    {
      "institution": "University of Rwanda",
      "degree": "Bachelor's",
      "fieldOfStudy": "Computer Science",
      "startYear": 2016,
      "endYear": 2020
    }
  ],
  "certifications": [],
  "projects": [],
  "availability": {
    "status": "Available",
    "type": "Full-time",
    "startDate": "2024-05-01"
  },
  "socialLinks": {
    "linkedin": "https://linkedin.com/in/aliceuwimana",
    "github": "https://github.com/aliceuwimana"
  }
}
```

### 6.4 Screening

`POST /api/screening/run`

This is the main route.

Request:
```json
{
  "jobId": "job_123",
  "candidateIds": ["cand_123", "cand_456"],
  "shortlistSize": 20,
  "mode": "internal",
  "includeReasoning": true
}
```

Response:
```json
{
  "jobId": "job_123",
  "totalCandidates": 48,
  "shortlistedCount": 20,
  "incompleteCount": 6,
  "averageScore": 81,
  "results": [
    {
      "candidateId": "cand_123",
      "rank": 1,
      "score": 92,
      "scoreBreakdown": {
        "skills": 38,
        "experience": 31,
        "education": 12,
        "projects": 7,
        "certifications": 4
      },
      "strengths": ["Node.js expertise", "Andela experience"],
      "gaps": ["Limited domain exposure"],
      "reasoning": "Strong match because...",
      "decision": "shortlisted"
    }
  ]
}
```

`GET /api/screening/jobs/:jobId/latest`

`GET /api/screening/:screeningId`

`GET /api/screening/:screeningId/export`

### 6.5 Upload parsing

`POST /api/uploads/json`

`POST /api/uploads/csv`

`POST /api/uploads/pdf`

For PDF, return OCR status and extracted structured data.

### 6.6 Dashboard and analytics

`GET /api/dashboard/summary`

`GET /api/dashboard/jobs`

`GET /api/dashboard/recent-screenings`

`GET /api/dashboard/candidate-stats`

## 7. AI Contract for Gemini

Gemini should not be asked to return free-form prose only. It must return structured JSON.

### 7.1 Required AI output

```json
{
  "summary": "Short recruiter-friendly summary",
  "results": [
    {
      "candidateId": "cand_123",
      "rank": 1,
      "score": 92,
      "scoreBreakdown": {
        "skills": 38,
        "experience": 31,
        "education": 12,
        "projects": 7,
        "certifications": 4,
        "availability": 0
      },
      "strengths": ["..."],
      "gaps": ["..."],
      "reasoning": "..."
    }
  ],
  "incompleteCandidates": [
    {
      "candidateId": "cand_999",
      "reason": "Missing work experience and location"
    }
  ]
}
```

### 7.2 Prompting rules

- provide job metadata, required skills, and ideal candidate profile
- provide candidate batches in chunks if the pool is large
- instruct Gemini to return valid JSON only
- reject markdown and retry if the response is malformed
- ask Gemini to explain strengths, gaps, and relevance
- require neutral, recruiter-friendly language
- do not let the model decide hiring outcomes, only screening recommendations

### 7.3 Scoring recommendation

Use a hybrid approach:
- deterministic preprocessing in code
- Gemini for structured reasoning and comparison
- application code for final ranking and validation

Recommended weighting:
- skills: 40%
- experience: 30%
- education: 15%
- projects: 10%
- certifications: 5%

Availability can be a gate or a small modifier.

## 8. Screening Logic

### Internal Umurava profiles

Use:
- required skills overlap
- years of experience
- title alignment
- education relevance
- certifications
- availability status

### External resumes

Use:
- OCR or text extraction
- resume parsing to normalize into the candidate schema
- completeness scoring
- manual review flag for bad scans or missing fields

### Incomplete profile policy

If a candidate is missing critical fields:
- keep them out of the top shortlist
- flag them as incomplete
- store the reason
- expose them in analytics so recruiters can review manually

## 9. Validation Rules

Reject or flag payloads that:
- miss `personalInfo.firstName`, `personalInfo.lastName`, `personalInfo.email`, `personalInfo.headline`, or `personalInfo.location`
- have malformed date fields
- have empty candidate arrays
- have duplicate emails in a single upload
- contain invalid skill levels or language proficiency values
- contain non-structured JSON from Gemini

## 10. Error Handling Requirements

Backend should handle:
- Gemini downtime
- malformed Gemini JSON
- empty uploads
- invalid CSV columns
- unreadable PDFs
- duplicate candidate emails
- shortlist size greater than candidate count
- partial batch failure

Recommended fallback behavior:
- validate and retry Gemini once or twice
- if Gemini fails, return deterministic baseline scores
- store failure reasons in screening records

## 11. Package.json Suggestion

Recommended backend stack:
- `express`
- `mongoose`
- `cors`
- `dotenv`
- `zod`
- `jsonwebtoken`
- `bcryptjs`
- `multer`
- `csv-parse`
- `pdf-parse`
- `tesseract.js`
- `axios`
- `pino`
- `helmet`
- `express-rate-limit`
- `google-genai` or the current official Gemini SDK
- `nodemon` for development
- `typescript`
- `ts-node` or `tsx`
- `@types/*` packages for TypeScript types

### Example `package.json`

```json
{
  "name": "umurava-backend",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc -p tsconfig.json",
    "start": "node dist/server.js",
    "lint": "eslint ."
  },
  "dependencies": {
    "axios": "^1.8.0",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "csv-parse": "^5.6.0",
    "dotenv": "^16.4.7",
    "express": "^4.21.2",
    "google-genai": "^1.0.0",
    "helmet": "^8.0.0",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.12.1",
    "multer": "^2.0.1",
    "pino": "^9.6.0",
    "pdf-parse": "^1.1.1",
    "tesseract.js": "^5.1.1",
    "zod": "^3.24.2"
  },
  "devDependencies": {
    "@types/cors": "^2.8.19",
    "@types/express": "^5.0.1",
    "@types/jsonwebtoken": "^9.0.8",
    "@types/multer": "^2.0.0",
    "@types/node": "^22.13.10",
    "eslint": "^9.22.0",
    "tsx": "^4.19.3",
    "typescript": "^5.8.2"
  }
}
```

## 12. Suggested Environment Variables

```bash
PORT=4000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-2.5-pro
UPLOAD_DIR=./uploads
CLIENT_URL=http://localhost:3000
```

## 13. Sample Seed Data

### 13.1 Job seed

```json
{
  "title": "Senior Backend Engineer",
  "department": "Engineering",
  "location": "Kigali, Rwanda / Remote",
  "employmentType": "Full-time",
  "experienceLevel": "Mid-level (3-5 yrs)",
  "shortlistSize": 20,
  "description": "We are looking for a Senior Backend Engineer to design and maintain scalable APIs.",
  "requiredSkills": ["Node.js", "TypeScript", "MongoDB", "REST APIs", "Docker", "PostgreSQL"],
  "idealCandidateProfile": "Ideal candidate has 5+ years of Node.js experience, strong knowledge of distributed systems, has led engineering teams, and is comfortable working in an agile startup environment.",
  "aiWeights": {
    "skills": 40,
    "experience": 30,
    "education": 15,
    "projects": 10,
    "certifications": 5
  }
}
```

### 13.2 Candidate seed

```json
{
  "source": "manual",
  "personalInfo": {
    "firstName": "Alice",
    "lastName": "Uwimana",
    "email": "alice.uwimana@andela.com",
    "headline": "Senior Backend Engineer · Node.js & AI Systems",
    "bio": "Experienced backend leader with expertise in scalable microservices and AI integrations.",
    "location": "Kigali, Rwanda"
  },
  "skills": [
    { "name": "Node.js", "level": "Expert", "yearsOfExperience": 6 },
    { "name": "TypeScript", "level": "Advanced", "yearsOfExperience": 5 }
  ],
  "languages": [
    { "name": "English", "proficiency": "Fluent" },
    { "name": "Kinyarwanda", "proficiency": "Native" }
  ],
  "experience": [
    {
      "company": "Andela",
      "role": "Senior Backend Engineer",
      "startDate": "2022-01",
      "endDate": "Present",
      "description": "Led microservices migration for talent marketplace. Reduced latency by 40%.",
      "technologies": ["Node.js", "Express", "MongoDB"],
      "isCurrent": true
    }
  ],
  "education": [
    {
      "institution": "University of Rwanda",
      "degree": "Bachelor's",
      "fieldOfStudy": "Computer Science",
      "startYear": 2016,
      "endYear": 2020
    }
  ],
  "certifications": [
    { "name": "AWS Certified Developer", "issuer": "Amazon", "issueDate": "2023-03" }
  ],
  "projects": [
    {
      "name": "Talent Marketplace API",
      "description": "Scalable backend for 50k+ users",
      "technologies": ["Node.js", "MongoDB"],
      "role": "Tech Lead",
      "link": "https://github.com/alice/talent-api",
      "startDate": "2022-01",
      "endDate": "Present"
    }
  ],
  "availability": {
    "status": "Available",
    "type": "Full-time",
    "startDate": "2024-05-01"
  },
  "socialLinks": {
    "linkedin": "https://linkedin.com/in/aliceuwimana",
    "github": "https://github.com/aliceuwimana",
    "portfolio": "https://alice.dev"
  }
}
```

## 14. Implementation Notes for Backend Developer

- Keep AI prompts and scoring config versioned
- Log screening inputs and outputs for auditability
- Store shortlist runs as immutable records
- Normalize resume data before scoring
- Use batching for large uploads
- Return both machine-readable JSON and human-readable reasoning
- Do not depend on frontend state for correctness
- Treat the frontend as a thin client

### 14.1 Scope guardrails

Per the source docs and meeting notes, the backend should prioritize:
- recruiter-facing screening only
- no candidate registration portal
- no custom ML model training from scratch
- existing OCR and Gemini-based parsing instead of bespoke parsers where possible
- simple, reproducible deployment

### 14.2 Batch and token strategy

To match the meeting guidance:
- process large uploads in chunks of roughly 80 to 100 resumes
- keep a smaller demo batch of around 20 to 30 candidates available for presentation
- use compact structured payloads for Gemini, not raw unbounded resume text
- consider token-efficient serialization if the payload grows large

### 14.3 OCR and resume handling

The backend should:
- support standard resume text extraction
- handle scanned PDFs and images through OCR
- flag unreadable or incomplete resumes for manual review
- preserve a reason when a candidate is excluded from the shortlist

### 14.4 AI response safety

The backend must defensively handle Gemini outputs that:
- return markdown instead of JSON
- omit required fields
- contain malformed arrays or strings
- exceed the expected candidate count
- mix reasoning text with schema data

Recommended policy:
- validate Gemini output against a schema
- retry once with a stricter prompt if needed
- fall back to deterministic code scoring if parsing fails

### 14.5 Fairness and transparency

The system should explicitly support:
- explainable scores
- strengths and gaps for every shortlisted candidate
- neutral wording
- fairness and bias reduction checks
- clear reason codes for incomplete profiles

## 15. Team and Delivery Requirements

### 15.1 Team roles

Minimum team coverage:
- frontend or product engineer
- backend or AI engineer

### 15.2 Deployment

The backend must be:
- deployed and publicly reachable
- product-agnostic and easy to reproduce
- configured with secure environment variables
- protected with basic error handling and login gating

### 15.3 Documentation expectations

The repository should include:
- overview
- setup instructions
- environment variables
- AI decision flow
- assumptions and limitations
- deployment notes
- screening criteria explanation

## 16. Judging Criteria

These criteria should be reflected in both the backend behavior and the documentation.

### 16.1 AI & Engineering Prowess

Focus:
- technical depth
- correctness
- AI integration quality
- robust scoring and validation

Backend implications:
- clean Gemini orchestration
- deterministic fallback logic
- schema validation
- batch-safe processing

### 16.2 UX & Product Design

Focus:
- usability
- clarity
- recruiter experience

Backend implications:
- simple, predictable endpoints
- human-readable reasoning
- response payloads that are easy for the UI to render

### 16.3 HR / Talent Acquisition Experience

Focus:
- hiring relevance
- fairness
- real-world applicability

Backend implications:
- screening criteria aligned to job requirements
- incomplete-candidate handling
- explainable shortlist decisions

### 16.4 Business Relevance

Focus:
- market viability
- scalability
- product thinking

Backend implications:
- support for batch uploads
- reproducible deployment
- clean model boundaries
- audit-friendly screening records

## 17. Submission and Demo Notes

- prepare the repository for technical evaluation
- keep the backend handoff sufficient even if the source code is not fully released
- the demo should show job creation, candidate ingestion, screening, and shortlist reasoning
- the focus should be a recruiter workflow with 20 to 30 candidates in the demo batch
- for the larger use case, support bulk screening in 80 to 100 candidate chunks
- include clear analytics for screened, shortlisted, and incomplete candidates

## 18. Timeline and Event Context

From the source docs:
- the hackathon timeline started on April 11, 2026 at 11:59 PM CAT
- the end date was April 24, 2026 at 12:00 AM CAT
- demo planning referenced a two-week window around May 1, 2026
- the demo location was Kigali, Rwanda

## 19. Prizes and Motivation

The source documents mention:
- 1st place: 600,000 RWF plus product implementation into Umurava’s product suite
- 2nd place: 250,000 RWF
- 3rd place: 150,000 RWF
- talent pool and apprenticeship opportunities for strong performers

## 20. Final Backend Checklist

Before implementation, confirm the backend supports:
- job CRUD
- candidate CRUD
- candidate ingestion from JSON, CSV, PDF, and manual entry
- OCR and resume parsing
- Gemini-based batch screening
- structured shortlist output
- reasoning and analytics
- incomplete profile review handling
- secure login
- deployment-ready configuration

## 21. Acceptance Criteria

The backend is ready when it can:
- authenticate a recruiter
- create and update jobs
- ingest candidates from JSON, CSV, PDF, and manual entry
- normalize the schema consistently
- run Gemini-based screening
- return ranked shortlists with reasoning
- preserve incomplete candidates for manual review
- export screening results cleanly

## 22. Open Questions

These should be decided before production:
- whether shortlist size is fixed per job or configurable per screening run
- whether incomplete candidates can ever be scored
- whether PDF OCR happens synchronously or through a queue
- which Gemini model variant is the default
- whether uploads are stored in S3-compatible storage or only processed in memory
