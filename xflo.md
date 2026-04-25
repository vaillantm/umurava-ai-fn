Your frontend is mostly good, but to match backend smoothly, change these:

### Main frontend changes needed

1. **Bulk upload page `/external` must require/select a `jobId` first**
   Backend uploads need `jobId`. So before JSON/CSV/PDF upload, add a job dropdown from `GET /api/jobs`, then call uploads like:

```ts
POST /api/uploads/pdf?jobId=${jobId}
POST /api/uploads/bulk-pdf?jobId=${jobId}
POST /api/uploads/json?jobId=${jobId}
POST /api/uploads/csv?jobId=${jobId}
```

Backend flow creates candidate + application from uploads, not only candidate pool. 

2. **Candidates page should not run screening without a job**
   Your `/candidates` modal should ask: “Screen candidates for which job?” Then call:

```ts
POST /api/screenings/run
```

Body:

```ts
{
  jobId,
  candidateIds,
  shortlistSize
}
```

This matches backend screening request. 

3. **Shortlist page should be job-based**
   Right now `/shortlist` sounds like global latest results. Better flow:

```txt
/jobs → select job → View Shortlist
/shortlist?jobId=...
```

Then frontend calls:

```ts
GET /api/screenings/jobs/${jobId}/latest
```

Backend supports latest screening per job. 

4. **Dashboard should use one backend snapshot**
   On `/dashboard`, call:

```ts
GET /api/dashboard/snapshot
```

Use returned:

```ts
jobs
candidates
latestScreening
```

Do not calculate everything from local mock data. Backend guide says dashboard should load from snapshot. 

5. **Profile page should use real candidate ID, not only localStorage**
   Current guide says profile stores candidate ID in localStorage. Better:

```txt
/profile?candidateId=...
```

Then fallback to localStorage only if missing. Your profile route currently depends on shortlist click storing candidateId. 

6. **Add job action buttons**
   On `/jobs`, each job should have:

```txt
Upload Candidates
Run Screening
View Shortlist
```

This matches backend flow: create job → upload candidates for that job → run screening → review results. 

### Smooth final frontend flow

```txt
Login
→ Dashboard snapshot
→ Jobs
→ Create job
→ Upload candidates for selected job
→ Run screening for selected job
→ View shortlist for that job
→ Open candidate profile
```

Biggest fix: **make `jobId` central everywhere**. Uploads, screenings, shortlist, and dashboard should all be tied to a selected job.
