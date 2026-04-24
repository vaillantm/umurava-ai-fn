Umurava AI Recruiter API
 1.0.0 
OAS 3.0
AI-powered talent screening backend for Umurava Hackathon 2026

Contact Umurava AI Team
Servers

http://localhost:4000 - Local Development Server

Authorize
Auth
Authentication & User Management



POST
/api/auth/register
Register a new recruiter

Parameters
Try it out
No parameters

Request body

application/json
Example Value
Schema
{
  "fullName": "Alice Uwimana",
  "email": "alice@umurava.com",
  "password": "StrongPass123!",
  "companyName": "Umurava"
}
Responses
Code	Description	Links
201	
User registered successfully

No links
409	
User already exists

No links

POST
/api/auth/login
Login user and receive JWT token

Parameters
Cancel
Reset
No parameters

Request body

application/json
Edit Value
Schema
{
  "email": "test@gmail.com",
  "password": "Password@123"
}
Execute
Clear
Responses
Curl

curl -X 'POST' \
  'http://localhost:4000/api/auth/login' \
  -H 'accept: */*' \
  -H 'Content-Type: application/json' \
  -d '{
  "email": "test@gmail.com",
  "password": "Password@123"
}'
Request URL
http://localhost:4000/api/auth/login
Server response
Code	Details
200	
Response body
Download
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZWE4YTlkNjU0ZWI1YjA0ZjMyNGVmYiIsInJvbGUiOiJyZWNydWl0ZXIiLCJpYXQiOjE3NzY5ODU1NzQsImV4cCI6MTc3NzU5MDM3NH0.xyjsgP7zkkIbKxPvyJREJ3TzVEJRdXISAJE40nnn5sA",
  "user": {
    "id": "69ea8a9d654eb5b04f324efb",
    "fullName": "John",
    "email": "test@gmail.com",
    "role": "recruiter",
    "companyName": "Test",
    "avatarUrl": "https://res.cloudinary.com/djyhrc0di/image/upload/v1776978797/umurava-avatars/ntz4hhadwzvpfbnrtous.jpg",
    "status": "active",
    "settings": {
      "primaryModel": "gemini-2.5-pro",
      "batchOutput": true,
      "explainableStructuring": true,
      "biasDetection": true,
      "promptContext": ""
    },
    "createdAt": "2026-04-23T21:09:49.873Z",
    "updatedAt": "2026-04-23T21:13:17.295Z"
  }
}
Response headers
 access-control-allow-credentials: true 
 access-control-allow-origin: http://localhost:4000 
 connection: keep-alive 
 content-length: 708 
 content-security-policy: default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests 
 content-type: application/json; charset=utf-8 
 cross-origin-opener-policy: same-origin 
 cross-origin-resource-policy: same-origin 
 date: Thu,23 Apr 2026 23:06:12 GMT 
 etag: W/"2c4-j4DClyECyocvAwHbL3OjPnrFS80" 
 keep-alive: timeout=5 
 origin-agent-cluster: ?1 
 referrer-policy: no-referrer 
 strict-transport-security: max-age=31536000; includeSubDomains 
 vary: Origin 
 x-content-type-options: nosniff 
 x-dns-prefetch-control: off 
 x-download-options: noopen 
 x-frame-options: SAMEORIGIN 
 x-permitted-cross-domain-policies: none 
 x-ratelimit-limit: 100 
 x-ratelimit-remaining: 94 
 x-ratelimit-reset: 1776986441 
 x-xss-protection: 0 
Responses
Code	Description	Links
200	
Login successful

No links
401	
Invalid credentials

No links

GET
/api/auth/me
Get current logged-in user profile


Parameters
Try it out
No parameters

Responses
Code	Description	Links
200	
Current user profile

No links
401	
Not authorized

No links

POST
/api/auth/logout
Logout user (client-side token removal)


Parameters
Try it out
No parameters

Responses
Code	Description	Links
200	
Logout successful

No links

PATCH
/api/auth/profile
Update user profile (avatar upload is optional)


Parameters
Try it out
No parameters

Request body

multipart/form-data
fullName
string
companyName
string
avatar
string($binary)
Profile picture (optional - saved on Cloudinary if provided)

Responses
Code	Description	Links
200	
Profile updated successfully

No links
400	
Avatar file is required

No links
Candidates
Manage candidates (recruiter only)



POST
/api/candidates
Create a new candidate (Manual Entry)


Create a candidate manually. Avatar is optional. Personal info can be sent as flat fields or nested under "personalInfo".

Parameters
Try it out
No parameters

Request body

multipart/form-data
avatar
string($binary)
Candidate profile photo (optional - will be saved on Cloudinary if provided)

firstName
string
lastName
string
email
string
headline
string
bio
string
location
string
skills
array<object>
Responses
Code	Description	Links
201	
Candidate created successfully

Media type

application/json
Controls Accept header.
Examples

sample
Example Value
Schema
{
  "message": "Candidate created successfully",
  "candidate": {
    "source": "manual",
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
    ]
  }
}
No links
400	
Avatar file is required or validation error

No links

GET
/api/candidates
Get all candidates


Parameters
Try it out
No parameters

Responses
Code	Description	Links
200	
List of all candidates

Media type

application/json
Controls Accept header.
Examples

sample
Example Value
Schema
[
  {
    "source": "pdf",
    "sourceFileName": "john-doe-resume.pdf",
    "personalInfo": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@email.com",
      "headline": "Full-Stack Engineer",
      "location": "Kigali, Rwanda"
    }
  }
]
No links

GET
/api/candidates/{candidateId}
Get a single candidate by ID


Parameters
Try it out
Name	Description
candidateId *
string
(path)
candidateId
Responses
Code	Description	Links
200	
Candidate details

Media type

application/json
Controls Accept header.
Examples

sample
Example Value
Schema
{
  "source": "pdf",
  "sourceFileName": "john-doe-resume.pdf",
  "personalInfo": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@email.com",
    "headline": "Full-Stack Engineer",
    "location": "Kigali, Rwanda"
  }
}
No links
404	
Candidate not found

No links

PATCH
/api/candidates/{candidateId}
Update an existing candidate


Parameters
Try it out
Name	Description
candidateId *
string
(path)
candidateId
Request body

multipart/form-data
avatar
string($binary)
New avatar image (optional)

firstName
string
lastName
string
email
string
headline
string
bio
string
location
string
Responses
Code	Description	Links
200	
Candidate updated successfully

Media type

application/json
Controls Accept header.
Examples

sample
Example Value
Schema
{
  "message": "Candidate updated successfully",
  "candidate": {
    "source": "manual",
    "personalInfo": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@email.com",
      "headline": "Full-Stack Engineer",
      "location": "Kigali, Rwanda"
    }
  }
}
No links
404	
Candidate not found

No links

DELETE
/api/candidates/{candidateId}
Delete a candidate


Parameters
Try it out
Name	Description
candidateId *
string
(path)
candidateId
Responses
Code	Description	Links
200	
Candidate deleted successfully

Media type

application/json
Controls Accept header.
Examples

sample
Example Value
Schema
{
  "message": "Candidate deleted"
}
No links

POST
/api/candidates/bulk
Bulk create candidates from JSON array


Parameters
Try it out
No parameters

Request body

application/json
Examples: 
sample
Example Value
Schema
[
  {
    "source": "manual",
    "personalInfo": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@email.com",
      "headline": "Full-Stack Engineer",
      "location": "Kigali, Rwanda"
    }
  },
  {
    "source": "json",
    "personalInfo": {
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane.smith@email.com",
      "headline": "Backend Engineer",
      "location": "Kigali, Rwanda"
    }
  }
]
Responses
Code	Description	Links
201	
Bulk candidates created

Media type

application/json
Controls Accept header.
Examples

sample
Example Value
Schema
{
  "message": "2 candidates created",
  "count": 2
}
No links
Dashboard
Dashboard snapshot and summary endpoints



GET
/api/dashboard/snapshot
Get dashboard snapshot


Parameters
Cancel
No parameters

Execute
Clear
Responses
Curl

curl -X 'GET' \
  'http://localhost:4000/api/dashboard/snapshot' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZWE4YTlkNjU0ZWI1YjA0ZjMyNGVmYiIsInJvbGUiOiJyZWNydWl0ZXIiLCJpYXQiOjE3NzY5ODU1NzQsImV4cCI6MTc3NzU5MDM3NH0.xyjsgP7zkkIbKxPvyJREJ3TzVEJRdXISAJE40nnn5sA'
Request URL
http://localhost:4000/api/dashboard/snapshot
Server response
Code	Details
200	
Response body
Download
{
  "jobs": [
    {
      "_id": "69ea8c31654eb5b04f324f03",
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
      "requiredSkills": [
        "Node.js",
        "TypeScript",
        "MongoDB"
      ],
      "idealCandidateProfile": "Strong API and systems experience.",
      "aiWeights": {
        "skills": 40,
        "experience": 30,
        "education": 15,
        "projects": 10,
        "certifications": 5
      },
      "status": "active",
      "createdBy": "69ea8a9d654eb5b04f324efb",
      "createdAt": "2026-04-23T21:16:33.212Z",
      "updatedAt": "2026-04-23T21:16:33.212Z",
      "__v": 0
    }
  ],
  "candidates": [
    {
      "_id": "69ea8be3654eb5b04f324f00",
      "source": "manual",
      "avatar": {
        "url": "https://res.cloudinary.com/djyhrc0di/image/upload/v1776978913/umurava-candidates/obpzoqmyovkuo1mutdi5.png",
        "publicId": "umurava-candidates/obpzoqmyovkuo1mutdi5"
      },
      "personalInfo": {
        "firstName": "Kalisa",
        "lastName": "Aime",
        "email": "kalisa.aime@umurava.com",
        "headline": "Senior Backend Engineer",
        "bio": "Experienced developer with passion for AI",
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
      "strengths": [],
      "gaps": [],
      "createdAt": "2026-04-23T21:15:15.090Z",
      "updatedAt": "2026-04-23T21:15:15.090Z",
      "__v": 0
    }
  ],
  "latestScreening": {
    "_id": "69eaa11908b19849aa0fb3c6",
    "jobId": "69ea8c31654eb5b04f324f03",
    "results": [],
    "incompleteCandidates": [],
    "summary": "Candidate 69ea8be3654eb5b04f324f00: AI scored.",
    "totalCandidates": 1,
    "shortlistedCount": 0,
    "averageScore": 0,
    "generatedBy": "gemini-2.5-flash-lite",
    "createdAt": "2026-04-23T22:45:45.767Z",
    "updatedAt": "2026-04-23T22:45:45.767Z",
    "__v": 0
  }
}
Response headers
 access-control-allow-credentials: true 
 connection: keep-alive 
 content-length: 1748 
 content-security-policy: default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests 
 content-type: application/json; charset=utf-8 
 cross-origin-opener-policy: same-origin 
 cross-origin-resource-policy: same-origin 
 date: Thu,23 Apr 2026 23:06:35 GMT 
 etag: W/"6d4-VdJPDA5i5a2PPt3fyXE5/z3VwEY" 
 keep-alive: timeout=5 
 origin-agent-cluster: ?1 
 referrer-policy: no-referrer 
 strict-transport-security: max-age=31536000; includeSubDomains 
 vary: Origin 
 x-content-type-options: nosniff 
 x-dns-prefetch-control: off 
 x-download-options: noopen 
 x-frame-options: SAMEORIGIN 
 x-permitted-cross-domain-policies: none 
 x-ratelimit-limit: 100 
 x-ratelimit-remaining: 93 
 x-ratelimit-reset: 1776986441 
 x-xss-protection: 0 
Responses
Code	Description	Links
200	
Dashboard data snapshot

No links
Jobs
Job management endpoints



POST
/api/jobs
Create a new job


Parameters
Cancel
Reset
No parameters

Request body

application/json
Examples: 
[Modified value]
Edit Value
Schema
{
  "title": "Data Platform Engineer",
  "company": "MTN Rwanda",
  "department": "Data & Analytics",
  "location": "Kigali, Rwanda",
  "salary": 3200000,
  "jobType": "full-time",
  "employmentType": "Hybrid",
  "experienceLevel": "Senior",
  "shortlistSize": 15,
  "description": "Design and optimize large-scale data pipelines, ensure data reliability, and support analytics teams with clean, scalable datasets.",
  "requiredSkills": [
    "Python",
    "Apache Spark",
    "SQL",
    "Kafka",
    "AWS"
  ],
  "idealCandidateProfile": "Experienced in building data pipelines, strong understanding of distributed systems, and ability to work with large telecom datasets.",
  "aiWeights": {
    "skills": 35,
    "experience": 35,
    "education": 10,
    "projects": 15,
    "certifications": 5
  },
  "status": "active"
}
Execute
Clear
Responses
Curl

curl -X 'POST' \
  'http://localhost:4000/api/jobs' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZWE4YTlkNjU0ZWI1YjA0ZjMyNGVmYiIsInJvbGUiOiJyZWNydWl0ZXIiLCJpYXQiOjE3NzY5ODU1NzQsImV4cCI6MTc3NzU5MDM3NH0.xyjsgP7zkkIbKxPvyJREJ3TzVEJRdXISAJE40nnn5sA' \
  -H 'Content-Type: application/json' \
  -d '{
  "title": "Data Platform Engineer",
  "company": "MTN Rwanda",
  "department": "Data & Analytics",
  "location": "Kigali, Rwanda",
  "salary": 3200000,
  "jobType": "full-time",
  "employmentType": "Hybrid",
  "experienceLevel": "Senior",
  "shortlistSize": 15,
  "description": "Design and optimize large-scale data pipelines, ensure data reliability, and support analytics teams with clean, scalable datasets.",
  "requiredSkills": [
    "Python",
    "Apache Spark",
    "SQL",
    "Kafka",
    "AWS"
  ],
  "idealCandidateProfile": "Experienced in building data pipelines, strong understanding of distributed systems, and ability to work with large telecom datasets.",
  "aiWeights": {
    "skills": 35,
    "experience": 35,
    "education": 10,
    "projects": 15,
    "certifications": 5
  },
  "status": "active"
}'
Request URL
http://localhost:4000/api/jobs
Server response
Code	Details
201	
Response body
Download
{
  "title": "Data Platform Engineer",
  "company": "MTN Rwanda",
  "department": "Data & Analytics",
  "location": "Kigali, Rwanda",
  "salary": 3200000,
  "jobType": "full-time",
  "employmentType": "Hybrid",
  "experienceLevel": "Senior",
  "shortlistSize": 15,
  "description": "Design and optimize large-scale data pipelines, ensure data reliability, and support analytics teams with clean, scalable datasets.",
  "requiredSkills": [
    "Python",
    "Apache Spark",
    "SQL",
    "Kafka",
    "AWS"
  ],
  "idealCandidateProfile": "Experienced in building data pipelines, strong understanding of distributed systems, and ability to work with large telecom datasets.",
  "aiWeights": {
    "skills": 35,
    "experience": 35,
    "education": 10,
    "projects": 15,
    "certifications": 5
  },
  "status": "active",
  "createdBy": "69ea8a9d654eb5b04f324efb",
  "_id": "69eaa6673f8466145118a14b",
  "createdAt": "2026-04-23T23:08:23.350Z",
  "updatedAt": "2026-04-23T23:08:23.350Z",
  "__v": 0
}
Response headers
 access-control-allow-credentials: true 
 access-control-allow-origin: http://localhost:4000 
 connection: keep-alive 
 content-length: 865 
 content-security-policy: default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests 
 content-type: application/json; charset=utf-8 
 cross-origin-opener-policy: same-origin 
 cross-origin-resource-policy: same-origin 
 date: Thu,23 Apr 2026 23:08:23 GMT 
 etag: W/"361-he/9g6fyQp7E1LIqpyknbJNZT2M" 
 keep-alive: timeout=5 
 origin-agent-cluster: ?1 
 referrer-policy: no-referrer 
 strict-transport-security: max-age=31536000; includeSubDomains 
 vary: Origin 
 x-content-type-options: nosniff 
 x-dns-prefetch-control: off 
 x-download-options: noopen 
 x-frame-options: SAMEORIGIN 
 x-permitted-cross-domain-policies: none 
 x-ratelimit-limit: 100 
 x-ratelimit-remaining: 92 
 x-ratelimit-reset: 1776986441 
 x-xss-protection: 0 
Responses
Code	Description	Links
201	
Job created successfully

Media type

application/json
Controls Accept header.
Examples

sample
Example Value
Schema
{
  "message": "Job created successfully",
  "job": {
    "title": "Senior Backend Engineer",
    "company": "Umurava",
    "department": "Engineering",
    "location": "Kigali, Rwanda",
    "shortlistSize": 10,
    "description": "Build and maintain backend services.",
    "requiredSkills": [
      "Node.js",
      "TypeScript",
      "MongoDB"
    ],
    "aiWeights": {
      "skills": 40,
      "experience": 30,
      "education": 15,
      "projects": 10,
      "certifications": 5
    },
    "status": "active"
  }
}
No links
400	
Bad request

No links

GET
/api/jobs
Get all jobs created by the authenticated user



GET
/api/jobs/{jobId}
Get a specific job by ID



PATCH
/api/jobs/{jobId}
Update a job



DELETE
/api/jobs/{jobId}
Delete a job


Screenings
AI-powered candidate screening and shortlisting



POST
/api/screenings/run
Run AI screening on candidates for a specific job



POST
/api/screenings/bulk-run
Upload multiple PDFs and run AI screening immediately for a job



GET
/api/screenings/jobs/{jobId}/latest
Get the most recent screening for a job



GET
/api/screenings/{screeningId}
Get a specific screening by ID



GET
/api/screenings/{screeningId}/export
Export screening results as JSON


Uploads
File upload endpoints (JSON, CSV, PDF resumes, and Avatars)



POST
/api/uploads/json
Upload candidates from JSON file


Parameters
Cancel
Reset
No parameters

Request body

multipart/form-data
file
string($binary)
JSON file containing candidate data

No file chosen
Send empty value
Execute
Responses
Code	Description	Links
201	
Candidates uploaded successfully

Media type

application/json
Controls Accept header.
Examples

sample
Example Value
Schema
{
  "message": "JSON candidates uploaded successfully",
  "count": 25
}
No links
400	
No file uploaded or invalid JSON

No links

POST
/api/uploads/csv
Upload candidates from CSV file


Parameters
Try it out
No parameters

Request body

multipart/form-data
file
string($binary)
CSV file containing candidate data

Responses
Code	Description	Links
201	
CSV candidates uploaded successfully

Media type

application/json
Controls Accept header.
Examples

sample
Example Value
Schema
{
  "message": "CSV candidates uploaded successfully",
  "count": 25
}
No links
400	
No file uploaded

No links

POST
/api/uploads/pdf
Upload resume PDF and parse with Gemini


Parameters
Try it out
No parameters

Request body

multipart/form-data
file
string($binary)
PDF resume file

Responses
Code	Description	Links
201	
PDF uploaded and parsed successfully

Media type

application/json
Controls Accept header.
Examples

sample
Example Value
Schema
{
  "message": "Resume PDF uploaded to Cloudinary and parsed successfully",
  "candidateId": "66f1a1b2c3d4e5f6a7b8c9e1",
  "resumeUrl": "https://res.cloudinary.com/demo/raw/upload/v1/resume.pdf",
  "cloudinaryPublicId": "umurava-resumes/resume-1713868800000"
}
No links
400	
No PDF file uploaded

No links
500	
PDF processing failed

No links

POST
/api/uploads/bulk-pdf
Upload multiple resume PDFs and parse them


Parameters
Try it out
No parameters

Request body

multipart/form-data
files
array<string>
Multiple PDF resume files

Responses
Code	Description	Links
201	
PDFs uploaded and parsed successfully

No links

POST
/api/uploads/avatar
Upload candidate avatar (profile picture)


Parameters
Try it out
No parameters

Request body

multipart/form-data
file
string($binary)
Image file (JPG, PNG, etc.)

Responses
Code	Description	Links
200	
Avatar uploaded successfully

Media type

application/json
Controls Accept header.
Examples

sample
Example Value
Schema
{
  "message": "Avatar uploaded successfully",
  "avatar": {
    "url": "https://res.cloudinary.com/demo/image/upload/avatar.jpg",
    "publicId": "umurava-avatars/avatar123"
  }
}
No links
400	
No image file uploaded

No links
500	
Avatar upload failed

No links

Schemas
ApiMessage
AuthResponse
AuthProfileUpdateResponse
Settings
DashboardSnapshot
AuthUser
Job
Candidate
ScreeningResult
Screening
UploadJsonResponse
UploadCsvResponse
UploadPdfResponse
UploadAvatarResponse