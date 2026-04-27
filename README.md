# Umurava AI — Frontend Documentation

## Links

| Resource | URL |
|---|---|
| Live App | https://umurava-ai-fn.vercel.app/ |
| Demo Video | https://drive.google.com/file/d/1iEcFxG8GnZLdmTlvKv0Mp3EcI8A9SWuj/view?usp=sharing |
| Frontend Repo | https://github.com/vaillantm/umurava-ai-fn |
| Backend Repo | https://github.com/vaillantm/umurava-ai-bn |

---

## Overview

Umurava AI is a recruiter workspace that uses Google Gemini to parse resumes, score candidates, and generate ranked shortlists. The frontend is built with Next.js 15 (App Router), TypeScript, and a custom CSS design system. It communicates with a Node.js/Express backend over REST.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Custom CSS (no Tailwind) |
| Icons | Google Material Symbols |
| State | React useState / localStorage via `umurava-store` |
| API Layer | `lib/api.ts` — fetch wrapper with token auth |
| Auth | JWT stored in localStorage |
| Deployment | Vercel |

---

## Project Structure

```
app/
  (auth)/login/       Login, Register, Forgot Password
  dashboard/          Main recruiter dashboard
  jobs/               Job postings management
  candidates/         Candidate pool + AI screening trigger
  shortlist/          Ranked shortlist results + AI reasoning
  profile/            Individual candidate profile view
  external/           Bulk JSON upload
  settings/           AI model and pipeline settings
components/
  app-shell.tsx       Sidebar layout wrapper used by all pages
  dashboard-charts.tsx Chart components for dashboard
  toast-host.tsx      Global toast notification renderer
lib/
  api.ts              All API calls (auth, jobs, candidates, screening, uploads)
  auth.ts             Login/register/logout helpers
  toast.ts            Toast notification system
  umurava-store.ts    Local state store with seed data (used as fallback)
```

---

## Pages

### Login — `/login`

Handles three screens in a single card component:
- Sign In — email + password, redirects to `/dashboard` on success
- Create Account — full name, company, email, password with strength meter
- Forgot Password — sends reset link via `/api/auth/forgot-password`

Auth token and user object are saved to `localStorage` on successful login or register.

---

### Dashboard — `/dashboard`

The main workspace view. Loads data from `/api/dashboard/snapshot` and falls back to individual API calls if the snapshot endpoint fails.

Features:
- Job selector dropdown — switches the active job and reloads the latest screening
- Stats grid — Active Jobs, Total Applicants, AI Screened, Shortlisted, Incomplete CVs
- Job Summary panel — lists all jobs with status badges and skill tags
- Candidate Pipeline panel — shows shortlisted / review / rejected / incomplete counts and average score
- Shortlisted Candidates panel — top ranked results with score, rank, and strengths
- Incomplete Candidates panel — candidates skipped by AI with reasons
- Run Screening action — triggers `/api/screenings/run` against the full candidate pool
- Bulk Upload and Screen action — picks PDF files and calls `/api/screenings/bulk-run`

---

### Jobs — `/jobs`

Full CRUD for job postings.

Features:
- Job list with status badges (Active, Draft, Closed)
- Slide-in panel for creating or editing a job
- Fields: title, company, department, location, salary, job type, employment type, experience level, shortlist size, description, required skills, ideal candidate profile, AI weights, status
- AI Weights sliders — skills (40%), experience (30%), education (15%), projects (10%), certifications (5%) — these are sent to the backend and used by Gemini for scoring
- Quick links per job: Upload Candidates, Run Screening, View Shortlist

---

### Candidates — `/candidates`

Displays the full candidate pool loaded from `/api/candidates`.

Features:
- Card grid with avatar initials, name, headline, skills, location, years of experience
- Search by name, headline, or skill
- Select individual or all candidates
- Job selector for choosing which job to screen against
- Run AI Screening button — opens a modal with a 5-step animated progress flow:
  1. Parse and normalize resumes
  2. Extract structured profile data
  3. Run AI scoring
  4. Rank and create shortlist
  5. Generate explanations
- On completion, redirects to `/shortlist?jobId=...`

---

### Shortlist — `/shortlist`

Displays ranked screening results for a selected job.

Features:
- Job selector — loads the latest screening for the chosen job
- Metrics bar — Total Screened, Shortlisted, Avg AI Score, Incomplete CVs
- Incomplete candidates banner with candidate IDs
- Ranked table — rank badge (gold/silver/bronze for top 3), candidate name, score bar, profile link
- Shortlist size selector (Top 10 / 20 / 30) — re-runs screening on change
- AI Reasoning panel — click any row to expand score breakdown, summary, strengths, and gaps
- Export JSON button — downloads the full shortlist as a `.json` file

---

### Profile — `/profile`

Detailed view of a single candidate. The candidate ID is read from `localStorage` key `umurava.selectedProfileId` (set when clicking "Profile" from the shortlist).

Sections:
- Avatar with initials, name, headline, location, email
- AI Screening Score from the latest screening result
- Professional Bio
- Skills and Languages with level and years of experience
- Work Experience with company, role, dates, description
- Education and Certifications
- Projects grid

Supports inline editing — click "Update Profile" to edit personal info and upload a new avatar. Saves via `PATCH /api/candidates/:id`.

---

### Bulk Upload — `/external`

Upload candidates via JSON file or paste.

Features:
- Job selector — required before uploading
- Drag and drop zone for `.json` files
- Paste textarea for raw JSON (single object or array)
- Calls `POST /api/uploads/json` with the file as multipart form data
- Shows count of uploaded candidates and a "Continue" button to go to screening

---

### Settings — `/settings`

AI pipeline configuration saved to the user account via `PATCH /api/auth/settings`.

Options:
- Primary AI Model — gemini-2.5-pro, gemini-1.5-pro, gemini-1.5-flash, gemini-2.0-flash
- Multi-candidate Batch Output toggle
- Explainable Structuring toggle
- Bias Detection Filter toggle
- Prompt Engineering Context — custom system instructions with `{{job}}` and `{{candidates}}` variables

---

## API Layer — `lib/api.ts`

All requests go through a central `apiRequest` function that:
- Reads the JWT from `localStorage`
- Sets `Authorization: Bearer <token>` header
- Throws on non-2xx responses with the error body

Key exported functions:

| Function | Method | Endpoint |
|---|---|---|
| `login` | POST | `/api/auth/login` |
| `register` | POST | `/api/auth/register` |
| `logout` | POST | `/api/auth/logout` |
| `me` | GET | `/api/auth/me` |
| `updateProfile` | PATCH | `/api/auth/profile` |
| `getSettings` | GET | `/api/auth/settings` |
| `updateSettings` | PATCH | `/api/auth/settings` |
| `listJobs` | GET | `/api/jobs` |
| `createJob` | POST | `/api/jobs` |
| `updateJob` | PATCH | `/api/jobs/:id` |
| `deleteJob` | DELETE | `/api/jobs/:id` |
| `listCandidates` | GET | `/api/candidates` |
| `getCandidate` | GET | `/api/candidates/:id` |
| `createCandidate` | POST | `/api/candidates` |
| `updateCandidate` | PATCH | `/api/candidates/:id` |
| `deleteCandidate` | DELETE | `/api/candidates/:id` |
| `bulkCreateCandidates` | POST | `/api/candidates/bulk` |
| `uploadJson` | POST | `/api/uploads/json` |
| `uploadCsv` | POST | `/api/uploads/csv` |
| `uploadPdf` | POST | `/api/uploads/pdf` |
| `uploadAvatar` | POST | `/api/uploads/avatar` |
| `runScreening` | POST | `/api/screenings/run` |
| `runBulkScreening` | POST | `/api/screenings/bulk-run` |
| `getLatestScreening` | GET | `/api/screenings/jobs/:jobId/latest` |
| `getScreening` | GET | `/api/screenings/:id` |
| `exportScreening` | GET | `/api/screenings/:id/export` |
| `getDashboardSnapshot` | GET | `/api/dashboard/snapshot` |

---

## Local Store — `lib/umurava-store.ts`

Used as a fallback when the backend is unavailable. Persists to `localStorage` under key `umurava.store.v1`.

Seeds 24 candidates from 4 base profiles (Alice Uwimana, Eric Nkurunziza, Grace Mutoni, David Hakizimana) rotated across 10 names and 5 African city locations.

Includes a local `runScreening` function that scores candidates deterministically using the job's `aiWeights` — this is what powers the UI when the backend Gemini API is rate-limited or unavailable.

---

## Auth Flow

1. User registers or logs in
2. Backend returns `{ token, user }`
3. Token saved to `localStorage` as `umurava.auth.token`
4. User object saved as `umurava.auth.user`
5. All API calls read the token and attach it as `Authorization: Bearer`
6. On logout, both keys are removed and the user is redirected to `/`

---

## Environment Variables

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

On Vercel this is set to the deployed backend URL.

---

## Deployment

The frontend is deployed on Vercel connected to the `main` branch of `https://github.com/vaillantm/umurava-ai-fn`. Every push to `main` triggers an automatic redeploy.
