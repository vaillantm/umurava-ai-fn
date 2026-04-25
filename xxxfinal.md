# CV To Screening Flow

## Actual Backend Flow

1. `POST /api/uploads/pdf` receives a resume PDF plus `jobId`.
2. The file is uploaded to Cloudinary as raw storage.
3. `pdf-parse` extracts text from the PDF.
4. Gemini converts the resume text into a structured candidate object.
5. The candidate is upserted in `Candidate` using email as the dedupe key.
6. An `Application` record is upserted for the pair `{ jobId, candidateId }`.
7. Screening is run separately with `POST /api/screenings/run`, or immediately with `POST /api/screenings/bulk-run`.
8. Screening reads the job, applications, and candidate records, scores them with Gemini, and falls back to deterministic scoring if needed.
9. The system creates a `Screening` record, updates matching `Application` records, and updates `Job.shortlistedCandidates`.

## Route Map

- `POST /api/jobs`
- `GET /api/jobs`
- `GET /api/jobs/:jobId`
- `POST /api/uploads/json`
- `POST /api/uploads/csv`
- `POST /api/uploads/pdf`
- `POST /api/uploads/bulk-pdf`
- `POST /api/screenings/run`
- `POST /api/screenings/bulk-run`
- `GET /api/screenings/jobs/:jobId/latest`
- `GET /api/screenings/:screeningId`
- `GET /api/screenings/:screeningId/export`
- `GET /api/dashboard/snapshot`

## Sample JSON

### Create Job

```json
{
  "title": "Senior Backend Engineer",
  "company": "Umurava",
  "department": "Engineering",
  "location": "Kigali, Rwanda",
  "salary": 2500000,
  "jobType": "full-time",
  "employmentType": "On-site",
  "experienceLevel": "Mid-Senior",
  "shortlistSize": 10,
  "description": "Build and maintain backend services.",
  "requiredSkills": ["Node.js", "TypeScript", "MongoDB"],
  "idealCandidateProfile": "Strong API and systems experience.",
  "aiWeights": {
    "skills": 40,
    "experience": 30,
    "education": 15,
    "projects": 10,
    "certifications": 5
  },
  "status": "active"
}
```

### PDF Upload Response

```json
{
  "message": "Resume PDF uploaded to Cloudinary and parsed successfully for Senior Backend Engineer",
  "jobId": "66f1a1b2c3d4e5f6a7b8c9d0",
  "jobTitle": "Senior Backend Engineer",
  "candidateId": "66f1a1b2c3d4e5f6a7b8c9e1",
  "applicationId": "66f1a1b2c3d4e5f6a7b8c9fa",
  "resumeUrl": "https://res.cloudinary.com/.../resume.pdf",
  "cloudinaryPublicId": "umurava-resumes/resume-1713868800000"
}
```

### Screening Run Request

```json
{
  "jobId": "66f1a1b2c3d4e5f6a7b8c9d0",
  "candidateIds": [
    "66f1a1b2c3d4e5f6a7b8c9e1",
    "66f1a1b2c3d4e5f6a7b8c9e2"
  ],
  "shortlistSize": 10
}
```

### Screening Response

```json
{
  "jobId": "66f1a1b2c3d4e5f6a7b8c9d0",
  "jobTitle": "Senior Backend Engineer",
  "totalCandidates": 14,
  "shortlistedCount": 10,
  "averageScore": 83.4,
  "usedFallback": false,
  "screeningId": "66f1a1b2c3d4e5f6a7b8c9f9",
  "summary": "AI screening completed.",
  "results": [
    {
      "candidateId": "66f1a1b2c3d4e5f6a7b8c9e1",
      "rank": 1,
      "score": 92,
      "scoreBreakdown": {
        "skills": 38,
        "experience": 28,
        "education": 12,
        "projects": 9,
        "certifications": 5
      },
      "strengths": ["Strong Node.js", "Good API design"],
      "gaps": ["Limited cloud experience"],
      "reasoning": "High skill match and strong delivery history.",
      "decision": "shortlisted"
    }
  ],
  "incompleteCandidates": []
}
```

### Candidate Shape

```json
{
  "source": "pdf",
  "sourceFileName": "john-doe-resume.pdf",
  "resumeUrl": "https://res.cloudinary.com/.../resume.pdf",
  "resumeText": "John Doe is a backend engineer...",
  "personalInfo": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@email.com",
    "headline": "Full-Stack Engineer",
    "bio": "Backend-focused engineer with 5 years experience.",
    "location": "Kigali, Rwanda"
  },
  "skills": [
    {
      "name": "Node.js",
      "level": "Expert",
      "yearsOfExperience": 5
    }
  ],
  "languages": [],
  "experience": [],
  "education": [],
  "certifications": [],
  "projects": [],
  "availability": {
    "status": "available",
    "type": "full-time",
    "startDate": "2026-05-01"
  },
  "socialLinks": {
    "linkedin": "https://linkedin.com/in/johndoe",
    "github": "https://github.com/johndoe",
    "portfolio": "https://johndoe.dev"
  }
}
```

## Dashboard Integration

- Call `GET /api/dashboard/snapshot` on page load with the JWT token.
- Use `jobs` for the job list or job cards.
- Use `candidates` for the candidate pool.
- Use `latestScreening` for the most recent shortlist summary.
- For a selected job, call `GET /api/screenings/jobs/:jobId/latest`.
- Add a "Run Screening" action that calls `POST /api/screenings/run`.
- Add a "Bulk Upload and Screen" action that calls `POST /api/screenings/bulk-run`.
- After upload or screening, refresh `dashboard/snapshot` and the selected screening.

## Recommended Dashboard Panels

- Job summary
- Candidate pipeline
- Latest screening summary
- Shortlisted candidates
- Incomplete candidates
- Upload and screening actions

