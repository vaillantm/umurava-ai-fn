# Backend Flow Contract

This document describes the backend-facing flow for the Umurava recruiter system.
It is intentionally backend-first and does not prescribe frontend implementation changes.

## 1. Auth

Required routes:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `PATCH /api/auth/profile`

Expected behavior:

- return a token on login and register
- return the current recruiter profile from `GET /api/auth/me`
- keep logout as token invalidation or client-side session clear
- allow optional avatar update on profile patch

## 2. Jobs

Required routes:

- `GET /api/jobs`
- `POST /api/jobs`
- `GET /api/jobs/:jobId`
- `PATCH /api/jobs/:jobId`
- `DELETE /api/jobs/:jobId`

Job schema:

```ts
{
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
  shortlistedCandidates?: string[];
  status: 'draft' | 'active' | 'closed';
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}
```

## 3. Candidates

Required routes:

- `GET /api/candidates`
- `POST /api/candidates`
- `GET /api/candidates/:candidateId`
- `PATCH /api/candidates/:candidateId`
- `DELETE /api/candidates/:candidateId`
- `POST /api/candidates/bulk`

Candidate schema:

```ts
{
  id: string;
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
  skills: Array<{ name: string; level: string; yearsOfExperience: number }>;
  languages: Array<{ name: string; proficiency: string }>;
  experience: Array<{
    company: string;
    role: string;
    startDate: string;
    endDate?: string;
    description?: string;
    technologies?: string[];
    isCurrent?: boolean;
    yearsOfExperience?: number;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startYear: number;
    endYear?: number;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    issueDate: string;
  }>;
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
    role: string;
    link?: string;
    startDate: string;
    endDate?: string;
  }>;
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
  createdAt: string;
  updatedAt: string;
}
```

## 4. Uploads

Required routes:

- `POST /api/uploads/json`
- `POST /api/uploads/csv`
- `POST /api/uploads/pdf`
- `POST /api/uploads/avatar`

Rules:

- use `multipart/form-data`
- file field name is `file`
- JSON, CSV, and PDF routes should create or return candidate records
- avatar upload should return `{ url, publicId? }`
- PDF ingestion should support parsed resume data

## 5. Screenings

Required routes:

- `POST /api/screenings/run`
- `GET /api/screenings/jobs/:jobId/latest`
- `GET /api/screenings/:screeningId`
- `GET /api/screenings/:screeningId/export`

Screening request:

```ts
{
  jobId: string;
  candidateIds: string[];
  shortlistSize?: number;
}
```

Screening response:

```ts
{
  jobId: string;
  totalCandidates: number;
  shortlistedCount: number;
  averageScore: number;
  usedFallback: boolean;
  summary: string;
  results: Array<{
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
  }>;
  incompleteCandidates: Array<{ candidateId: string; reason: string }>;
}
```

## 6. Dashboard

Required route:

- `GET /api/dashboard/snapshot`

Response:

```ts
{
  jobs: Job[];
  candidates: Candidate[];
  latestScreening: Screening | null;
}
```

The dashboard should be fully derivable from this snapshot:

- active jobs count
- total applicants count
- AI screened count
- shortlisted count
- incomplete count
- weekly screening chart data
- pipeline status chart data
- active jobs table data
- recent AI screenings list

## 7. Team

Optional route family if team metadata is stored separately:

- `GET /api/teams`
- `POST /api/teams`
- `GET /api/teams/:teamId`
- `PATCH /api/teams/:teamId`
- `DELETE /api/teams/:teamId`

Team schema:

```ts
{
  id: string;
  name: string;
  companyName?: string;
  description?: string;
  members: Array<{
    id: string;
    fullName: string;
    email?: string;
    role: string;
    skills?: string[];
    bio?: string;
    avatarUrl?: string;
  }>;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}
```

## 8. Implementation Notes

- Keep backend responses consistent and JSON-only.
- Return `id`, `createdAt`, and `updatedAt` on saved records.
- Preserve `shortlistSize`, `requiredSkills`, and `aiWeights` on jobs.
- Preserve nested `personalInfo` on candidates.
- Keep incomplete resumes separate from ranked shortlist results.
- Use Gemini for screening and reasoning generation.
- Avoid frontend-specific wording in this file.

