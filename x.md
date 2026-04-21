# Frontend Implementation Guide

This document maps the frontend to the backend API in this repository. It is meant to be the source of truth for route usage, request payloads, response shapes, and the minimal client-side structure needed to integrate cleanly.

## 1. API Base

Use a single backend base URL, for example:

```ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000';
```

All requests should be sent relative to:

- `/api/auth`
- `/api/jobs`
- `/api/candidates`
- `/api/screenings`
- `/api/uploads`

## 2. Authentication Flow

### Register

- `POST /api/auth/register`
- Body:

```ts
{
  fullName: string;
  email: string;
  password: string;
  companyName?: string;
}
```

- Response:

```ts
{
  message: string;
  token: string;
  user: AuthUser;
}
```

### Login

- `POST /api/auth/login`
- Body:

```ts
{
  email: string;
  password: string;
}
```

- Response:

```ts
{
  message: string;
  token: string;
  user: AuthUser;
}
```

### Current User

- `GET /api/auth/me`
- Header:

```http
Authorization: Bearer <token>
```

- Response:

```ts
AuthUser
```

### Logout

- `POST /api/auth/logout`
- Header:

```http
Authorization: Bearer <token>
```

- Response is informational only. Remove the token client-side.

### Profile Update

- `PATCH /api/auth/profile`
- `multipart/form-data`
- Optional fields:
  - `fullName`
  - `companyName`
  - `avatar` file

If `avatar` is included, upload it as a file input named `avatar`.

## 3. Shared Client Types

Use these frontend types to stay aligned with the backend:

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
  createdAt?: string;
  updatedAt?: string;
}

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
  createdAt?: string;
  updatedAt?: string;
}

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

## 4. Route Map

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `PATCH /api/auth/profile`

### Jobs

- `POST /api/jobs`
- `GET /api/jobs`
- `GET /api/jobs/:jobId`
- `PATCH /api/jobs/:jobId`
- `DELETE /api/jobs/:jobId`

### Candidates

- `POST /api/candidates`
- `GET /api/candidates`
- `GET /api/candidates/:candidateId`
- `PATCH /api/candidates/:candidateId`
- `DELETE /api/candidates/:candidateId`
- `POST /api/candidates/bulk`

### Screenings

- `POST /api/screenings/run`
- `GET /api/screenings/jobs/:jobId/latest`
- `GET /api/screenings/:screeningId`
- `GET /api/screenings/:screeningId/export`

### Uploads

- `POST /api/uploads/json`
- `POST /api/uploads/csv`
- `POST /api/uploads/pdf`
- `POST /api/uploads/avatar`

## 5. Request Rules

### Authorization

Any protected request must include:

```http
Authorization: Bearer <token>
```

Store the token after login/register, then attach it in a centralized API client.

### JSON Requests

For JSON endpoints, send:

```http
Content-Type: application/json
```

### Multipart Requests

Use `FormData` for:

- candidate create/update with avatar upload
- profile update with avatar upload
- file imports/uploads

Do not manually set the `Content-Type` header for `FormData`; let the browser handle the boundary.

## 6. Auth Client Pattern

Recommended client shape:

```ts
async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw data ?? new Error(`Request failed: ${response.status}`);
  }

  return data as T;
}
```

## 7. Login State

Recommended frontend state:

- `token`
- `user`
- `isAuthenticated`
- `loading`

Suggested behavior:

- On app start, read token from storage.
- If token exists, call `GET /api/auth/me`.
- If the token is invalid, clear storage and treat the session as logged out.

## 8. Page Structure

Suggested pages:

- `/login`
- `/register`
- `/dashboard`
- `/jobs`
- `/jobs/new`
- `/jobs/:jobId`
- `/candidates`
- `/candidates/new`
- `/candidates/:candidateId`
- `/screenings/:screeningId`
- `/profile`

## 9. Forms

### Register Form

Fields:

- `fullName`
- `email`
- `password`
- `companyName`

### Login Form

Fields:

- `email`
- `password`

### Job Form

Fields:

- `title`
- `company`
- `department`
- `location`
- `salary`
- `jobType`
- `employmentType`
- `experienceLevel`
- `shortlistSize`
- `description`
- `requiredSkills`
- `idealCandidateProfile`
- `aiWeights.skills`
- `aiWeights.experience`
- `aiWeights.education`
- `aiWeights.projects`
- `aiWeights.certifications`
- `status`

### Candidate Form

Supports both flat fields and nested `personalInfo` on the backend, but the frontend should prefer nested structure internally and serialize only at submit time.

Required fields:

- `firstName`
- `lastName`
- `email`
- `headline`
- `location`
- `avatar`

Optional fields:

- `bio`
- `skills`
- `languages`
- `experience`
- `education`
- `certifications`
- `projects`
- `availability`
- `socialLinks`

## 10. Candidate Create Payload

Preferred frontend payload shape before serialization:

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

For `multipart/form-data`, serialize nested objects as JSON strings:

```ts
const formData = new FormData();
formData.append('firstName', values.personalInfo.firstName);
formData.append('lastName', values.personalInfo.lastName);
formData.append('email', values.personalInfo.email);
formData.append('headline', values.personalInfo.headline);
formData.append('location', values.personalInfo.location);
formData.append('personalInfo', JSON.stringify(values.personalInfo));
formData.append('skills', JSON.stringify(values.skills ?? []));
formData.append('experience', JSON.stringify(values.experience ?? []));
formData.append('education', JSON.stringify(values.education ?? []));
formData.append('certifications', JSON.stringify(values.certifications ?? []));
formData.append('projects', JSON.stringify(values.projects ?? []));
formData.append('availability', JSON.stringify(values.availability ?? {}));
formData.append('socialLinks', JSON.stringify(values.socialLinks ?? {}));
formData.append('avatar', file);
```

## 11. Candidate Update Payload

PATCH is partial:

- send only changed fields
- avatar is optional
- nested fields are merged server-side

## 12. Screening Flow

### Run screening

- `POST /api/screenings/run`
- Body:

```ts
{
  jobId: string;
  candidateIds: string[];
  shortlistSize?: number;
}
```

- Response:

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

### Latest screening

- `GET /api/screenings/jobs/:jobId/latest`

### Screening detail

- `GET /api/screenings/:screeningId`

### Export

- `GET /api/screenings/:screeningId/export`
- Returns JSON suitable for download.

## 13. Upload Flow

### PDF Resume Upload

- `POST /api/uploads/pdf`
- `multipart/form-data`
- file input name: `file`

### Avatar Upload

- `POST /api/uploads/avatar`
- `multipart/form-data`
- file input name: `file`

### JSON and CSV Imports

- `POST /api/uploads/json`
- `POST /api/uploads/csv`
- file input name: `file`

## 14. Error Handling

Standardize frontend error handling around:

```ts
{
  message: string;
  errors?: unknown;
}
```

Display:

- validation messages returned by the backend
- auth errors like `401` and `403`
- generic fallback messages for network/server failures

Recommended behavior:

- `401`: clear token and redirect to login
- `403`: show account/permission error
- `404`: show not found state
- `400`: surface validation details

## 15. Recommended Folder Structure

Suggested frontend structure:

```txt
src/
  api/
    client.ts
    auth.ts
    jobs.ts
    candidates.ts
    screenings.ts
    uploads.ts
  components/
  hooks/
  pages/
  types/
  utils/
```

## 16. Minimum Integration Checklist

- Implement token storage and auth header injection.
- Build auth pages first: register, login, session restore.
- Add job CRUD pages next.
- Add candidate CRUD and avatar upload.
- Add screening run/detail/export flows.
- Add upload endpoints for resume and bulk import.
- Keep frontend types synchronized with `src/types/index.ts`.

## 17. Notes

- The backend accepts both `/api/screenings` and `/api/screening`, but the frontend should use `/api/screenings`.
- Candidate create/update supports nested `personalInfo` and flat multipart fields.
- Job create requires `title`, `company`, and `description`.
- Upload endpoints expect `FormData`, not JSON.
