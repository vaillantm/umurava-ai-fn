# Umurava AI — UI Inventory & Pinterest Design Reference

## Files

| File | Purpose |
|------|---------|
| `index.html` | Landing / marketing page |
| `login.html` | Recruiter login screen |
| `dashboard.html` | Main dashboard with stats + job table |
| `jobs.html` | Create job posting form |
| `candidates.html` | Candidate data pool grid |
| `shortlist.html` | AI screening results + ranked list |
| `external.html` | Multi-step structured profile input form |
| `profile.html` | Full candidate profile detail view |
| `settings.html` | Gemini AI configuration panel |
| `shared.css` | Global styles |
| `shared.js` | All JS logic, data, navigation, rendering |

---

## Sidebar Items (all dashboard pages share this)

| Icon | Label | Page |
|------|-------|------|
| `dashboard` | Dashboard | dashboard.html |
| `work` | Jobs (badge: 4) | jobs.html |
| `group` | Candidates Data | candidates.html |
| `emoji_events` | AI Shortlists | shortlist.html |
| `upload_file` | Bulk CV Upload | external.html |
| `settings` / `smart_toy` | AI Settings | settings.html |

> `jobs.html` also has sidebar section labels: **Overview**, **Screening**, **Account**

---

## Modals & Overlays

### 1. Gemini AI Screening Modal (`#screening-modal`)
- Triggered by: `openScreeningModal()` — button on `candidates.html` nav
- Content: progress bar + 5 animated processing steps
  1. Parse & normalize resumes
  2. Extract structured profile data
  3. Run Gemini AI scoring
  4. Rank & create shortlist (Top 10)
  5. Generate explanations
- Close button: "View Shortlist Results" → navigates to `shortlist.html`
- Also present as static HTML in `settings.html`

### 2. AI Reasoning Panel (`#reasoning-container`)
- Triggered by: clicking a candidate row in `shortlist.html`
- Inline panel (not overlay), slides in below the table
- Content: score breakdown, summary, strengths list, gaps list
- Actions: Interview ✓ | Reject ✗ | Full Profile →

### 3. Toast Notification (`#toast`)
- Global, appears bottom of screen
- Types: `success`, `info`, `danger`
- Used across all pages for feedback

---

## Key UI Sections to Redesign

### index.html (Landing)
- `nav` — logo + links + CTA button
- `.hero` — badge, H1, subtitle, CTA buttons, 4 stats
- `.features-grid` — 6 feature cards (icon + title + desc)

### login.html
- `.login-card` — logo mark, title, subtitle, email + password form

### dashboard.html
- `.stats-row` — 4 stat cards (Active Jobs, Applicants, AI Screened, Shortlisted)
- `.table-card` — Active Job Postings table (role, dept, applicants, status, action)
- `.table-card` — Recent AI Screenings table (candidate, role, score, status)

### jobs.html
- `.form-section` — Job Details (title, dept, location, type, level, shortlist size, description)
- `.form-section` — Required Skills (tag input)
- `.form-section` — AI Scoring Weights (5 range sliders: Skills 40%, Experience 30%, Education 15%, Projects 10%, Certs 5%)
- `.form-section` — Ideal Candidate Profile (textarea)

### candidates.html
- `.candidates-grid` — card grid (avatar initials, name, headline, skill pills, location, years exp)
- Search input + Select All button
- Selection count badge

### shortlist.html
- `.shortlist-header` — role name, candidate count, date, shortlist number
- `.result-row` — rank badge, name, headline, skill pills, score bar, Full Profile button
- Reasoning panel (inline, on click)

### external.html (Profile Input)
- 5-tab multi-step form:
  1. Basic Info (name, email, location, headline, bio)
  2. Skills & Languages (dynamic add rows)
  3. Experience & Education (dynamic add rows)
  4. Certifications & Projects + Availability & Links
  5. Complete (success state)

### profile.html
- `.profile-sidebar-card` — avatar, name, headline, location, years, availability, AI score
- Sections: Basic Info, Skills (level bars), Work Experience, Key Projects, Education, Certifications, Availability & Contact, AI Screening Reasoning

### settings.html
- Primary AI Model selector
- AI Pipeline Toggles (3 toggles: Batch Output, Explainable Structuring, Bias Detection)
- Prompt Engineering textarea (with `{{job}}` / `{{candidates}}` variables)

---

## Pinterest Design Search Terms

### Overall Style
- "dark SaaS dashboard UI 2024"
- "recruiter ATS dashboard design"
- "AI platform dark mode UI"
- "glassmorphism dashboard sidebar"

### Sidebar
- "vertical sidebar navigation dark UI"
- "collapsible sidebar dashboard design"
- "sidebar with section labels and badges"
- "icon sidebar navigation Figma"

### Cards & Stats
- "KPI stat cards dark dashboard"
- "metric cards glassmorphism UI"
- "dashboard stats row design"

### Tables
- "dark mode data table UI design"
- "candidate list table recruiter UI"
- "ranked results table with score bar"

### Modals
- "AI processing modal progress steps UI"
- "dark modal overlay loading steps"
- "multi-step progress modal design"

### Forms
- "multi-step form tabs dark UI"
- "job posting form design SaaS"
- "dynamic add row form UI"
- "range slider scoring weights UI"

### Candidate Cards
- "candidate card grid recruiter UI"
- "talent profile card dark mode"
- "skill pill tags card design"

### Score / AI Reasoning
- "AI score breakdown panel UI"
- "explainable AI reasoning card design"
- "score bar visualization dark UI"
- "strengths gaps panel recruiter tool"

### Landing Page
- "SaaS landing page dark hero section"
- "AI product landing page 2024"
- "feature grid cards dark landing"

### Login
- "dark login card SaaS UI"
- "recruiter portal login screen design"
