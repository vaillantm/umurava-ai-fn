# Frontend Integration Spec

This document is the frontend contract for the Umurava AI recruiter portal.
It maps the current Next.js App Router pages, the hardcoded mock data structure, and the backend routes needed so the frontend can work end to end without guessing payload shapes.
It also incorporates the hackathon guidance from the `docs` folder so the backend handoff matches the product and scoring expectations.

Use this as the source of truth when wiring the backend.

## 1. Current Frontend Pages

These routes already exist in the app:

- `/`
- `/login`
- `/dashboard`
- `/jobs`
- `/candidates`
- `/external`
- `/shortlist`
- `/profile`
- `/settings`

Missing routes that the product still expects:

- `/register`
- `/jobs/new`
- `/jobs/:jobId`
- `/candidates/new`
- `/candidates/:candidateId`
- `/screenings/:screeningId`

If you want a complete product, the backend should support these states even if some are rendered inside modals today.

### Dashboard UI Sections

The dashboard page is not just a summary card. It renders these sections and needs matching backend data:

- top greeting and new job CTA
- KPI stat cards
- weekly screening activity chart
- pipeline status donut chart
- active jobs bar chart
- active jobs table
- recent AI screenings list

The backend snapshot should be able to power all of those without the frontend inventing data.

## 1.1 Product Scope

The intended product is recruiter-facing only.

The backend and frontend should support:

- recruiter login wall
- job creation and editing
- bulk applicant ingestion from structured profiles and uploads
- AI screening against a job rubric
- top 10 or top 20 shortlist generation
- explainable reasoning for each candidate
- incomplete resume handling and manual review flags

Do not treat this as an applicant portal.
Avoid building:

- candidate self-registration as a required flow
- applicant-facing job browsing
- custom model training
- unnecessary real-time features that are not part of screening

## 1.2 Dashboard Screen Contract

The dashboard page is the main operational overview screen. The backend must support every data point it renders.

### Dashboard Header

Rendered copy:

- `Good morning, Jane`
- `Here's what's happening with your hiring pipeline today.`

Primary action:

- `New Job Posting` -> `/jobs`

Top-right account chip:

- recruiter avatar
- recruiter full name
- recruiter role

### Dashboard Stats

These cards are derived from the snapshot and must be computable from backend data:

- `Active Jobs`
- `Total Applicants`
- `AI Screened`
- `Shortlisted`

Field mapping:

- `Active Jobs` = count of jobs where `status !== 'closed'`
- `Total Applicants` = `candidates.length`
- `AI Screened` = `latestScreening.results.length`
- `Shortlisted` = `latestScreening.shortlistedCount`

### Weekly Screening Activity

Chart title:

- `Weekly Screening Activity`

The chart is derived from `latestScreening.results` only.

Required series:

- `screened`
- `shortlisted`

Derivation rule:

- split `latestScreening.results` into 7 weekday buckets by index
- for each bucket, count total screened candidates
- count shortlisted candidates where `decision === 'shortlisted'`

### Pipeline Status

Chart title:

- `Pipeline Status`

Required pie slices:

- `Shortlisted`
- `Screened`
- `Pending`

Field mapping:

- `Shortlisted` = `latestScreening.shortlistedCount`
- `Screened` = `latestScreening.results.length - latestScreening.shortlistedCount`
- `Pending` = `latestScreening.incompleteCandidates.length`

### Active Jobs Chart

Chart title:

- `Active Jobs`

Bar chart field mapping:

- label = `job.department || job.title`
- value = `job.shortlistSize || 0`

The backend should ensure jobs include:

- `title`
- `department`
- `location`
- `shortlistSize`
- `status`

### Active Jobs Table

Columns:

- `Role`
- `Dept`
- `Applicants`
- `Status`
- action link

Row mapping:

- `Role` = `job.title`
- `Dept` = `job.department || 'General'`
- `Applicants` = `summary.totalApplicants`
- `Status` = `job.status`
- action = `/jobs`

### Recent AI Screenings

List title:

- `Recent AI Screenings`

Each row needs:

- candidate initials/avatar
- candidate full name
- candidate headline
- screening score

Field mapping:

- candidate name from `candidates.find(item => item.id === screeningResult.candidateId)`
- role/headline from `candidate.personalInfo.headline`
- score from `screeningResult.score`

Empty state:

- `Run a screening to populate results here.`

### Dashboard Snapshot Contract

Recommended backend response:

```ts
{
  jobs: JobRecord[];
  candidates: CandidateRecord[];
  latestScreening: ScreeningRecord | null;
}
```

This single snapshot must be enough to derive all dashboard widgets without additional local mock assumptions.

## 2. Backend Routes Required

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `PATCH /api/auth/profile`
- `GET /api/auth/settings`
- `PATCH /api/auth/settings`
- `POST /api/auth/forgot-password`

### Jobs

- `GET /api/jobs`
- `POST /api/jobs`
- `GET /api/jobs/:jobId`
- `PATCH /api/jobs/:jobId`
- `DELETE /api/jobs/:jobId`

### Candidates

- `GET /api/candidates`
- `POST /api/candidates`
- `GET /api/candidates/:candidateId`
- `PATCH /api/candidates/:candidateId`
- `DELETE /api/candidates/:candidateId`
- `POST /api/candidates/bulk`

### Screenings

- `POST /api/screenings/run`
- `GET /api/screenings/jobs/:jobId/latest`
- `GET /api/screenings/:screeningId`
- `GET /api/screenings/:screeningId/export`

### Dashboard Snapshot

The dashboard page uses a combined snapshot call.

Recommended backend route:

- `GET /api/dashboard/snapshot`

If you keep the current thin-client fallback pattern, this endpoint should return:

```ts
{
  jobs: JobRecord[];
  candidates: CandidateRecord[];
  latestScreening: ScreeningRecord | null;
}
```

Useful optional dashboard-only routes from the docs:

- `GET /api/dashboard/jobs`
- `GET /api/dashboard/recent-screenings`

### Uploads

- `POST /api/uploads/json`
- `POST /api/uploads/csv`
- `POST /api/uploads/pdf`
- `POST /api/uploads/avatar`

## 2.1 Hackathon Constraints

- Gemini API is mandatory for the AI layer.
- Prompt engineering should be intentional and documented.
- AI output must be structured and recruiter-friendly.
- Batch screening should be supported.
- Scanned or image-based resumes should be handled with OCR if possible.
- Incomplete resumes should be separated for manual review, not silently ranked.
- The backend should not depend on frontend state for correctness.

## 3. Frontend Data Models

These are the shapes the frontend currently uses in `lib/backend.ts`.
The backend should accept and return these shapes without renaming fields.

## 3.0 Backend Model Schemas

These are the canonical model shapes the backend should store and return.
They are written in a backend-friendly way, but they match the frontend contract above.

### 3.0.1 AuthUser

```ts
type UserRole = 'recruiter' | 'admin';

type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  companyName?: string;
  avatarUrl?: string;
  status?: 'active' | 'inactive' | 'suspended';
  settings?: {
    primaryModel?: string;
    batchOutput?: boolean;
    explainableStructuring?: boolean;
    biasDetection?: boolean;
    promptContext?: string;
  };
  createdAt: string;
  updatedAt: string;
};
```

### 3.0.2 CandidateProfile

```ts
type CandidateSkill = {
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' | string;
  yearsOfExperience: number;
};

type CandidateLanguage = {
  name: string;
  proficiency: string;
};

type CandidateExperience = {
  company: string;
  role: string;
  startDate: string;
  endDate?: string;
  description?: string;
  technologies?: string[];
  isCurrent?: boolean;
  yearsOfExperience?: number;
};

type CandidateEducation = {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear: number;
  endYear?: number;
};

type CandidateCertification = {
  name: string;
  issuer: string;
  issueDate: string;
};

type CandidateProject = {
  name: string;
  description: string;
  technologies: string[];
  role: string;
  link?: string;
  startDate: string;
  endDate?: string;
};

type CandidateProfile = {
  id: string;
  source: 'manual' | 'json' | 'csv' | 'pdf' | 'bulk';
  sourceFileName?: string;
  avatar?: {
    url: string;
    publicId?: string;
  };
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    headline: string;
    bio?: string;
    location: string;
  };
  skills: CandidateSkill[];
  languages: CandidateLanguage[];
  experience: CandidateExperience[];
  education: CandidateEducation[];
  certifications: CandidateCertification[];
  projects: CandidateProject[];
  availability: {
    status: string;
    type: string;
    startDate?: string;
  };
  socialLinks: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  incompleteReason?: string;
  reasoning?: string;
  score?: number;
  scoreBreakdown?: {
    skills?: number;
    experience?: number;
    education?: number;
    projects?: number;
    certifications?: number;
  };
  strengths?: string[];
  gaps?: string[];
  workflowStatus?: 'pending' | 'interview' | 'rejected' | string;
  decision?: 'shortlisted' | 'review' | 'rejected' | string;
  rank?: number;
  shortlistLabel?: string;
  createdAt: string;
  updatedAt: string;
};
```

### 3.0.3 Job

```ts
type Job = {
  id: string;
  title: string;
  company: string;
  department?: string;
  location?: string;
  salary?: number;
  jobType?: 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance';
  employmentType?: string;
  experienceLevel?: string;
  shortlistSize: number;
  description: string;
  requiredSkills: string[];
  idealCandidateProfile?: string;
  aiWeights: {
    skills: number;
    experience: number;
    education: number;
    projects: number;
    certifications: number;
  };
  status: 'draft' | 'active' | 'closed';
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
};
```

### 3.0.4 ScreeningResult

```ts
type ScreeningResult = {
  candidateId: string;
  rank: number;
  score: number;
  scoreBreakdown: {
    skills?: number;
    experience?: number;
    education?: number;
    projects?: number;
    certifications?: number;
  };
  strengths: string[];
  gaps: string[];
  reasoning: string;
  decision: 'shortlisted' | 'review' | 'rejected';
  workflowStatus?: 'pending' | 'interview' | 'rejected' | string;
  shortlistLabel?: string;
};
```

### 3.0.5 ScreeningRecord

```ts
type ScreeningRecord = {
  id: string;
  jobId: string;
  results: ScreeningResult[];
  incompleteCandidates: Array<{ candidateId: string; reason: string }>;
  summary: string;
  totalCandidates: number;
  shortlistedCount: number;
  averageScore: number;
  generatedBy?: string;
  createdAt: string;
  updatedAt: string;
  incompleteCount?: number;
};
```

### 3.0.6 DashboardSnapshot

```ts
type DashboardSnapshot = {
  jobs: Job[];
  candidates: CandidateProfile[];
  latestScreening: ScreeningRecord | null;
};
```

### 3.0.7 Settings

```ts
type Settings = {
  primaryModel: string;
  batchOutput: boolean;
  explainableStructuring: boolean;
  biasDetection: boolean;
  promptContext?: string;
};
```

### 3.0.8 API Error

```ts
type ApiError = {
  message: string;
  errors?: unknown;
};
```

### 3.0.9 Upload Response

```ts
type UploadAvatarResponse = {
  url: string;
  publicId?: string;
};
```

### 3.0.10 Auth Response

```ts
type AuthResponse = {
  message: string;
  token: string;
  user: AuthUser;
};
```

### 3.0.11 Team

```ts
type TeamMemberRole = 'front-end' | 'back-end' | 'ai' | 'product' | 'design' | 'devops' | string;

type TeamMember = {
  id: string;
  fullName: string;
  email?: string;
  role: TeamMemberRole;
  skills?: string[];
  bio?: string;
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
};

type Team = {
  id: string;
  name: string;
  members: TeamMember[];
  companyName?: string;
  description?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
};
```

Recommended team-related backend routes if you want to persist team metadata:

- `GET /api/teams`
- `POST /api/teams`
- `GET /api/teams/:teamId`
- `PATCH /api/teams/:teamId`
- `DELETE /api/teams/:teamId`

If you do not want a separate team module, the same data can live under `AuthUser` as an organization/team profile, but the schema above is cleaner for a handoff.

### AuthUser

```ts
export type UserRole = 'recruiter' | 'admin';

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  companyName?: string;
  avatarUrl?: string;
  status?: 'active' | 'inactive' | 'suspended';
  settings?: {
    primaryModel?: string;
    batchOutput?: boolean;
    explainableStructuring?: boolean;
    biasDetection?: boolean;
    promptContext?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}
```

### CandidateRecord

```ts
export interface CandidateRecord {
  id?: string;
  source: 'manual' | 'json' | 'csv' | 'pdf' | 'bulk';
  sourceFileName?: string;
  avatar?: { url: string; publicId?: string };
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    headline: string;
    bio?: string;
    location: string;
  };
  skills?: Array<{ name: string; level: string; yearsOfExperience: number }>;
  languages?: Array<{ name: string; proficiency: string }>;
  experience?: Array<{
    company: string;
    role: string;
    startDate: string;
    endDate?: string;
    description?: string;
    technologies?: string[];
    isCurrent?: boolean;
    yearsOfExperience?: number;
  }>;
  education?: Array<{
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startYear: number;
    endYear?: number;
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
    issueDate: string;
  }>;
  projects?: Array<{
    name: string;
    description: string;
    technologies: string[];
    role: string;
    link?: string;
    startDate: string;
    endDate?: string;
  }>;
  availability?: {
    status: string;
    type: string;
    startDate?: string;
  };
  socialLinks?: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  incompleteReason?: string;
  createdAt?: string;
  updatedAt?: string;
}
```

### JobRecord

```ts
export interface JobRecord {
  id?: string;
  title: string;
  company: string;
  department?: string;
  location?: string;
  salary?: number;
  jobType?: 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance';
  employmentType?: string;
  experienceLevel?: string;
  shortlistSize?: number;
  description: string;
  requiredSkills?: string[];
  idealCandidateProfile?: string;
  aiWeights?: {
    skills: number;
    experience: number;
    education: number;
    projects: number;
    certifications: number;
  };
  status?: 'draft' | 'active' | 'closed';
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}
```

### ScreeningResult and ScreeningRecord

```ts
export interface ScreeningResult {
  candidateId: string;
  rank: number;
  score: number;
  scoreBreakdown: {
    skills?: number;
    experience?: number;
    education?: number;
    projects?: number;
    certifications?: number;
  };
  strengths: string[];
  gaps: string[];
  reasoning: string;
  decision: 'shortlisted' | 'review' | 'rejected';
}

export interface ScreeningRecord {
  id?: string;
  jobId: string;
  results: ScreeningResult[];
  incompleteCandidates: Array<{ candidateId: string; reason: string }>;
  summary: string;
  totalCandidates: number;
  shortlistedCount: number;
  averageScore: number;
  generatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}
```

### Dashboard Snapshot Shape

The dashboard page consumes these aggregate values:

```ts
{
  jobs: JobRecord[];
  candidates: CandidateRecord[];
  latestScreening: ScreeningRecord | null;
}
```

From that snapshot it derives:

- active job count
- total applicant count
- screened count
- shortlisted count
- incomplete count
- weekly screened/shortlisted series
- active jobs table rows
- recent screening rows

## 4. Request Rules

### Authorization

Protected routes should accept:

```http
Authorization: Bearer <token>
```

The frontend stores:

- auth token in local storage
- auth user in local storage

### JSON requests

Send:

```http
Content-Type: application/json
```

### Multipart requests

Use `FormData` for:

- profile update with avatar
- candidate create/update with avatar
- JSON/CSV/PDF upload
- avatar upload

Do not manually set `Content-Type` on `FormData`.

## 5. Exact Payloads

### Register

`POST /api/auth/register`

```ts
{
  fullName: string;
  email: string;
  password: string;
  companyName?: string;
}
```

### Login

`POST /api/auth/login`

```ts
{
  email: string;
  password: string;
}
```

### Profile update

`PATCH /api/auth/profile`

`multipart/form-data`

Fields:

- `fullName`
- `companyName`
- `avatar`

### Job create/update

`POST /api/jobs`

```ts
JobRecord
```

`PATCH /api/jobs/:jobId`

```ts
Partial<JobRecord>
```

Required fields for create:

- `title`
- `company`
- `description`

Docs guidance also expects the job/rubric layer to carry screening intent:

- `requiredSkills`
- `idealCandidateProfile`
- `aiWeights`
- `shortlistSize`
- `status`

Recommended fields:

- `department`
- `location`
- `salary`
- `jobType`
- `employmentType`
- `experienceLevel`
- `shortlistSize`
- `requiredSkills`
- `idealCandidateProfile`
- `aiWeights`
- `status`

### Candidate create/update

The frontend prefers nested `personalInfo`, then serializes to `FormData`.

Preferred shape:

```ts
{
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    headline: string;
    bio?: string;
    location: string;
  };
  skills?: Skill[];
  languages?: Language[];
  experience?: Experience[];
  education?: Education[];
  certifications?: Certification[];
  projects?: Project[];
  availability?: Availability;
  socialLinks?: SocialLinks;
}
```

For multipart submission, the frontend may send:

```ts
const formData = new FormData();
formData.append('personalInfo', JSON.stringify(values.personalInfo));
formData.append('skills', JSON.stringify(values.skills ?? []));
formData.append('languages', JSON.stringify(values.languages ?? []));
formData.append('experience', JSON.stringify(values.experience ?? []));
formData.append('education', JSON.stringify(values.education ?? []));
formData.append('certifications', JSON.stringify(values.certifications ?? []));
formData.append('projects', JSON.stringify(values.projects ?? []));
formData.append('availability', JSON.stringify(values.availability ?? {}));
formData.append('socialLinks', JSON.stringify(values.socialLinks ?? {}));
formData.append('avatar', file);
```

For compatibility, the backend should also accept flat fields:

- `firstName`
- `lastName`
- `email`
- `headline`
- `bio`
- `location`
- `availability_status`
- `availability_type`
- `availability_startDate`
- `linkedin`
- `github`
- `portfolio`

### Bulk candidates

`POST /api/candidates/bulk`

```ts
CandidateRecord[]
```

### Screening run

`POST /api/screenings/run`

```ts
{
  jobId: string;
  candidateIds: string[];
  shortlistSize?: number;
}
```

Expected response:

```ts
{
  jobId: string;
  totalCandidates: number;
  shortlistedCount: number;
  averageScore: number;
  usedFallback: boolean;
  summary: string;
  results: ScreeningResult[];
  incompleteCandidates: Array<{ candidateId: string; reason: string }>;
}
```

Docs guidance says screening should:

- rank candidates in a single batch when possible
- produce a shortlist of top 10 or top 20
- include strengths, gaps, and reasoning
- identify incomplete or malformed resumes
- keep humans in control of final hiring decisions

Optional but useful response fields:

- `generatedBy`
- `incompleteCount`
- `averageScore`
- `summaryAnalytics`
- `workflowStatus`

### Latest screening

`GET /api/screenings/jobs/:jobId/latest`

Returns:

```ts
ScreeningRecord | null
```

### Screening detail

`GET /api/screenings/:screeningId`

Returns:

```ts
ScreeningRecord
```

### Screening export

`GET /api/screenings/:screeningId/export`

Returns:

```ts
ScreeningRecord
```

### Upload routes

All upload routes use `FormData` with file field name `file`.

- `POST /api/uploads/json`
- `POST /api/uploads/csv`
- `POST /api/uploads/pdf`
- `POST /api/uploads/avatar`

Upload expectations from the docs:

- JSON and CSV are structured intake
- PDF is for external resumes
- OCR support is expected for scanned PDFs/images where possible
- large uploads should be processed in chunks if the batch is large

## 6. Current Hardcoded / Seed Data Structure

The frontend currently falls back to local mock data from `lib/umurava-store.ts`.
The backend should either reproduce this structure or return compatible data.

### Default job

There is one seeded job:

- `id`: `job-senior-backend-001`
- `title`: `Senior Backend Engineer`
- `department`: `Engineering`
- `location`: `Kigali, Rwanda / Remote`
- `employmentType`: `Full-time`
- `experienceLevel`: `Mid-level (3-5 yrs)`
- `shortlistSize`: `20`
- `description`: backend API/scalable systems role
- `requiredSkills`: `Node.js`, `TypeScript`, `MongoDB`, `REST APIs`, `Docker`, `PostgreSQL`
- `aiWeights`: skills 40, experience 30, education 15, projects 10, certifications 5
- `status`: `active`

### Seed candidates

The local fallback generates 24 candidate profiles from 4 base profiles.

Each candidate has:

- `id`: `cand_001` to `cand_024`
- `personalInfo`
- `skills`
- `languages`
- `experience`
- `education`
- `certifications`
- `projects`
- `availability`
- `socialLinks`
- `source`
- `createdAt`
- `updatedAt`
- `incompleteReason`

Four candidates are intentionally incomplete and should be treated as manual review cases.
Those are the items at index:

- `4`
- `9`
- `14`
- `19`

Their `incompleteReason` is:

- `Incomplete resume structure needs manual review`

The docs require dummy data to strictly follow the talent profile schema. The backend seed data should keep the nested candidate structure intact rather than flattening it prematurely.

## 6.1 Talent Profile Schema To Preserve

Stable candidate sections the backend should preserve:

- `id`
- `personalInfo`
- `skills`
- `languages`
- `experience`
- `education`
- `certifications`
- `projects`
- `availability`
- `socialLinks`
- `source`
- `incompleteReason`
- `reasoning`
- `score`
- `scoreBreakdown`
- `strengths`
- `gaps`
- `workflowStatus`
- `decision`
- `rank`
- `shortlistLabel`
- `createdAt`
- `updatedAt`

### Default settings

Seeded settings:

```ts
{
  primaryModel: 'gemini-2.5-pro',
  batchOutput: true,
  explainableStructuring: true,
  biasDetection: true
}
```

The docs also reinforce these AI expectations:

- batch output
- explainable structuring
- bias detection
- recruiter-visible reasoning
- configurable prompt context

## 6.2 Dashboard Data Expectations

The dashboard screen needs the backend to preserve the following data assumptions:

- `jobs` must contain `status`, `department`, `location`, and `shortlistSize`
- `candidates` must contain `personalInfo.firstName`, `personalInfo.lastName`, `personalInfo.headline`, and `personalInfo.location`
- `latestScreening.results` must contain `candidateId`, `score`, and `decision`
- `latestScreening.incompleteCandidates` must exist even when empty
- `latestScreening.shortlistedCount` and `averageScore` must be computed by the backend

If the backend returns an empty screening object, the UI should still render a valid empty state.

## 7. Frontend Behavior the Backend Should Support

### Jobs page

The jobs page expects:

- list jobs
- create job
- update job
- delete job
- support modal form editing
- accept `requiredSkills` as array
- accept `aiWeights` object
- preserve `shortlistSize`

### Candidates page

The candidates page expects:

- list candidates
- filter/search candidates locally
- run screening for the active job
- return ranked screening results
- keep incomplete candidates out of the ranked shortlist

### External upload page

The upload page expects:

- JSON import
- CSV import
- PDF import
- manual candidate creation
- avatar upload support for future expansion

### Shortlist page

The shortlist page expects:

- latest screening for the active job
- ranked result list
- candidate reasoning panel
- export to JSON
- ability to rerun screening with different shortlist size
- top 10 / top 20 support
- incomplete candidate summary

### Profile page

The profile page expects:

- candidate fetch by ID
- latest screening score for that candidate
- candidate update
- avatar upload

### Settings page

The settings page expects:

- fetch AI settings
- update AI settings
- preserve `promptContext`

## 8. Response Conventions

Recommended backend responses:

- successful create/update should return the full created/updated record
- delete routes can return `{ message: string }`
- list routes should return arrays
- not found should return a `404` with `{ message: string }`
- validation errors should return `400` with `{ message: string, errors?: unknown }`
- screening endpoints should return structured JSON, not markdown

## 8.1 Recommended Screening Result Shape

The docs emphasize explainability. A practical screening result payload should include:

```ts
{
  candidateId: string;
  rank: number;
  score: number;
  scoreBreakdown: {
    skills?: number;
    experience?: number;
    education?: number;
    projects?: number;
    certifications?: number;
  };
  strengths: string[];
  gaps: string[];
  reasoning: string;
  decision: 'shortlisted' | 'review' | 'rejected';
  workflowStatus?: 'pending' | 'interview' | 'rejected';
  shortlistLabel?: string;
}
```

Useful additional fields:

- `summary`
- `generatedBy`
- `incompleteCandidates`
- `incompleteCount`
- `averageScore`
- `shortlistedCount`

## 8.2 Sample JSON Prompt

Use this as the backend-facing screening payload example. It mirrors the recruiter workflow and gives the AI service a clear structure to generate ranked results.

### Request

```json
{
  "job": {
    "id": "job-senior-backend-001",
    "title": "Senior Backend Engineer",
    "company": "Umurava AI",
    "department": "Engineering",
    "location": "Kigali, Rwanda / Remote",
    "employmentType": "Full-time",
    "experienceLevel": "Mid-level (3-5 yrs)",
    "shortlistSize": 20,
    "description": "We are looking for a Senior Backend Engineer to design and maintain scalable APIs.",
    "requiredSkills": ["Node.js", "TypeScript", "MongoDB", "REST APIs", "Docker", "PostgreSQL"],
    "idealCandidateProfile": "Ideal candidate has 5+ years of Node.js experience, strong distributed systems knowledge, and comfort working in an agile startup environment.",
    "aiWeights": {
      "skills": 40,
      "experience": 30,
      "education": 15,
      "projects": 10,
      "certifications": 5
    },
    "status": "active"
  },
  "candidates": [
    {
      "id": "cand_001",
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
        { "name": "TypeScript", "level": "Advanced", "yearsOfExperience": 5 },
        { "name": "MongoDB", "level": "Advanced", "yearsOfExperience": 4 }
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
          "description": "Led microservices migration for talent marketplace.",
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
    },
    {
      "id": "cand_005",
      "personalInfo": {
        "firstName": "Incomplete",
        "lastName": "Candidate",
        "email": "candidate5@umurava.ai",
        "headline": "Backend Developer",
        "bio": "",
        "location": "Dakar, Senegal"
      },
      "skills": [],
      "languages": [],
      "experience": [],
      "education": [],
      "certifications": [],
      "projects": [],
      "availability": {
        "status": "Available",
        "type": "Full-time"
      },
      "socialLinks": {},
      "incompleteReason": "Incomplete resume structure needs manual review"
    }
  ],
  "options": {
    "shortlistSize": 20,
    "returnReasoning": true,
    "returnIncompleteCandidates": true,
    "batchMode": true,
    "biasDetection": true
  }
}
```

### Response

```json
{
  "jobId": "job-senior-backend-001",
  "totalCandidates": 24,
  "shortlistedCount": 20,
  "averageScore": 84,
  "usedFallback": false,
  "summary": "Screened 24 candidates and shortlisted 20.",
  "generatedBy": "gemini-2.5-pro",
  "results": [
    {
      "candidateId": "cand_001",
      "rank": 1,
      "score": 96,
      "scoreBreakdown": {
        "skills": 40,
        "experience": 28,
        "education": 15,
        "projects": 10,
        "certifications": 5
      },
      "strengths": ["Node.js proficiency", "Relevant industry experience"],
      "gaps": ["Some required skills missing"],
      "reasoning": "Strong match because of Node.js, TypeScript, and MongoDB expertise and 6.0 years of experience.",
      "decision": "shortlisted",
      "workflowStatus": "pending",
      "shortlistLabel": "Top 20"
    }
  ],
  "incompleteCandidates": [
    {
      "candidateId": "cand_005",
      "reason": "Incomplete resume structure needs manual review"
    }
  ],
  "incompleteCount": 4
}
```

### Prompting Notes

- The backend should send the job and candidates as structured JSON, not raw markdown.
- The AI response should be validated as JSON before saving or returning it.
- If the model returns markdown or invalid text, the backend should retry or fall back to a deterministic parser.
- Keep field names stable so the frontend can render results without extra mapping.

## 9. Folder / API Contract Summary

If you are implementing the backend, these are the minimum modules the frontend depends on:

- auth
- jobs
- candidates
- screenings
- uploads
- settings
- OCR/parsing service if resume images or scanned PDFs are supported
- AI orchestration layer using Gemini
- dashboard snapshot aggregator

If any of these are missing, the current UI will fall back to local simulated data, which is fine for demo mode but not for a real backend integration.

## 10. Practical Backend Checklist

- Support all routes listed above.
- Preserve the exact field names in the data models.
- Return `id`, `createdAt`, and `updatedAt` on save.
- Keep `shortlistSize`, `requiredSkills`, and `aiWeights` attached to jobs.
- Keep `personalInfo` nested for candidates.
- Return screening results with `candidateId`, `rank`, `score`, `scoreBreakdown`, `strengths`, `gaps`, `reasoning`, and `decision`.
- Accept `FormData` for uploads and avatar changes.
- Return arrays for list endpoints.
- Return `null` for latest screening when none exists.
- Use Gemini for screening and reasoning generation.
- Support batch screening and chunked uploads for large candidate sets.
- Mark incomplete or invalid profiles for manual review instead of ranking them.
- Keep outputs recruiter-friendly and structured.
- Support dashboard summary data for charts and tables.

## 10.1 Backend Integration Notes From The Docs

Product-level expectations to preserve:

- screen applicants across structured profiles and unstructured resumes
- support Top 10 or Top 20 shortlists
- provide transparent and explainable AI output
- keep humans in control of final hiring decisions
- support spreadsheet, JSON, and PDF intake
- support OCR where scanned PDFs are used
- use TypeScript, Node.js, Next.js, and MongoDB-friendly schema design
- keep the backend easy to reproduce and hand over

## 11. Notes

- The frontend currently uses local fallback logic if the backend is unavailable.
- The docs and the current codebase both use `/api/screenings` as the preferred screening route family.
- The app also contains mock seed data in local storage, so the backend should not depend on frontend state for correctness.
- The frontend should be treated as a thin client.
- The hackathon docs require the schema to remain stable and recruiter-facing, so avoid flattening candidate profiles unless the backend serializer specifically needs it.

## 12. Final Backend Checklist

Use this as the implementation checklist for the backend handoff.

### Auth

- [ ] `POST /api/auth/register`
- [ ] `POST /api/auth/login`
- [ ] `GET /api/auth/me`
- [ ] `POST /api/auth/logout`
- [ ] `PATCH /api/auth/profile`
- [ ] `GET /api/auth/settings`
- [ ] `PATCH /api/auth/settings`
- [ ] `POST /api/auth/forgot-password`
- [ ] store and return `AuthUser`
- [ ] support token-based session restore

### Jobs

- [ ] `GET /api/jobs`
- [ ] `POST /api/jobs`
- [ ] `GET /api/jobs/:jobId`
- [ ] `PATCH /api/jobs/:jobId`
- [ ] `DELETE /api/jobs/:jobId`
- [ ] support `title`, `company`, `department`, `location`
- [ ] support `shortlistSize`
- [ ] support `requiredSkills`
- [ ] support `idealCandidateProfile`
- [ ] support `aiWeights`
- [ ] support `status`

### Candidates

- [ ] `GET /api/candidates`
- [ ] `POST /api/candidates`
- [ ] `GET /api/candidates/:candidateId`
- [ ] `PATCH /api/candidates/:candidateId`
- [ ] `DELETE /api/candidates/:candidateId`
- [ ] `POST /api/candidates/bulk`
- [ ] support nested `personalInfo`
- [ ] support skills, languages, experience, education, certifications, projects
- [ ] support `availability`
- [ ] support `socialLinks`
- [ ] support `avatar`
- [ ] support `incompleteReason`

### Screenings

- [ ] `POST /api/screenings/run`
- [ ] `GET /api/screenings/jobs/:jobId/latest`
- [ ] `GET /api/screenings/:screeningId`
- [ ] `GET /api/screenings/:screeningId/export`
- [ ] return `results` with score, reasoning, strengths, gaps, decision
- [ ] return `incompleteCandidates`
- [ ] return `summary`
- [ ] return `averageScore`
- [ ] return `shortlistedCount`
- [ ] return `generatedBy`
- [ ] support top 10 / top 20 shortlist sizing
- [ ] keep incomplete resumes out of shortlist ranking

### Uploads

- [ ] `POST /api/uploads/json`
- [ ] `POST /api/uploads/csv`
- [ ] `POST /api/uploads/pdf`
- [ ] `POST /api/uploads/avatar`
- [ ] accept `FormData`
- [ ] use file field name `file`
- [ ] support parsed resume ingestion
- [ ] support OCR for scanned PDFs/images if possible

### Dashboard

- [ ] `GET /api/dashboard/snapshot`
- [ ] optionally `GET /api/dashboard/jobs`
- [ ] optionally `GET /api/dashboard/recent-screenings`
- [ ] return `jobs`
- [ ] return `candidates`
- [ ] return `latestScreening`
- [ ] allow dashboard stats to derive from the snapshot
- [ ] allow weekly screening chart derivation from `latestScreening.results`
- [ ] allow pipeline chart derivation from `latestScreening.shortlistedCount` and `incompleteCandidates.length`
- [ ] allow active jobs table derivation from jobs list
- [ ] allow recent screenings list derivation from candidates plus latest screening

### Settings

- [ ] persist AI settings
- [ ] support `primaryModel`
- [ ] support `batchOutput`
- [ ] support `explainableStructuring`
- [ ] support `biasDetection`
- [ ] support `promptContext`

### Team

- [ ] support team metadata if needed
- [ ] store team name
- [ ] store team members
- [ ] store member role
- [ ] store member skills
- [ ] store timestamps

### Quality Requirements

- [ ] keep field names stable
- [ ] return JSON only, not markdown
- [ ] return `createdAt` and `updatedAt` on records
- [ ] return `id` on saved records
- [ ] use Gemini for screening and explanation generation
- [ ] batch large candidate sets
- [ ] keep schema recruiter-friendly
- [ ] keep human review in the loop for incomplete resumes
- [ ] do not depend on frontend state for correctness

### Screens That Must Work End To End

- [ ] landing page `/`
- [ ] login page `/login`
- [ ] dashboard `/dashboard`
- [ ] jobs page `/jobs`
- [ ] candidates page `/candidates`
- [ ] bulk upload page `/external`
- [ ] shortlist page `/shortlist`
- [ ] profile page `/profile`
- [ ] settings page `/settings`
- [ ] job create/edit flow
- [ ] candidate detail flow
- [ ] screening run flow
- [ ] screening export flow
- [ ] dashboard analytics flow

### Dashboard Widgets To Support

- [ ] greeting header
- [ ] new job CTA
- [ ] profile chip
- [ ] active job count card
- [ ] total applicants card
- [ ] AI screened card
- [ ] shortlisted card
- [ ] weekly screening activity chart
- [ ] pipeline status donut chart
- [ ] active jobs bar chart
- [ ] active jobs table
- [ ] recent AI screenings list
- [ ] empty state for no screenings

### Final Model Schemas To Keep Stable

- [ ] `AuthUser`
- [ ] `CandidateProfile`
- [ ] `Job`
- [ ] `ScreeningResult`
- [ ] `ScreeningRecord`
- [ ] `DashboardSnapshot`
- [ ] `Settings`
- [ ] `Team`
- [ ] `ApiError`
- [ ] `AuthResponse`
- [ ] `UploadAvatarResponse`

### Notes for Backend Hand-off

- [ ] use the sample JSON prompt in this document as the screening contract
- [ ] preserve the nested candidate schema
- [ ] preserve job weights and shortlist size
- [ ] preserve incomplete candidate handling
- [ ] keep the dashboard snapshot minimal but sufficient
- [ ] treat the frontend as a thin client
