# Umurava AI — Frontend Screen Guide

## Sidebar (present on all dashboard pages)

Fixed left sidebar, 220px wide. Always visible on desktop, collapses to a horizontal scrollable row on mobile.

| Item | Icon | Route |
|---|---|---|
| Dashboard | dashboard | /dashboard |
| Jobs | work | /jobs |
| Candidates Data | group | /candidates |
| AI Shortlists | emoji_events | /shortlist |
| Bulk CV Upload | upload_file | /external |
| AI Settings | settings | /settings |

Active item is highlighted in blue. Nav bar at top shows: Umurava AI logo (left), page breadcrumb (center), user profile chip with initials + name + role (right).

---

## 1. Home Page — `/`

Public landing page. No sidebar.

**Sections:**
- Fixed top nav — logo, Overview / Features links, Recruiter Login button
- Hero — headline "Your Dream Team Is Waiting For You", subtext, search card with two fields (CV ranking / recruiter dashboards), Recruiter Login CTA, popular searches line
- Animated orbit visual — 6 company chips (Amazon, Google, Microsoft, LinkedIn, Slack, Dropbox) orbiting a recruiter illustration
- Stats bar — 10x Faster Screening / Top 20 Ready Shortlists / Explainable AI
- About section — image card left, copy right with "Choose The Best AI recruitment platform", two benefit cards (Reliable Shortlists, Recruiter Support), Contact Us CTA + phone number
- Features marquee — 6 scrolling feature cards: Intelligent Matching, Multi-Candidate Parsing, Ranked Shortlists, Bias-Aware Scoring, Explainable AI, Human-Led Decisions
- Footer — logo + description + badges, links columns, CTA card

---

## 2. Login Page — `/login`

Auth-only layout. No sidebar. Minimal bundle (no store, no dashboard imports).

**Screens (tab-switched, no page reload):**

### Login screen (default)
- Umurava AI logo mark
- "Welcome back" title + subtitle
- Work Email input
- Password input with show/hide toggle
- Forgot password? link
- Sign In to Workspace button
- "Don't have an account? Create one" footer link

### Signup screen
- Full Name + Company (2-column grid)
- Work Email
- Password with show/hide toggle + live strength bar (Weak / Fair / Good / Strong)
- Terms checkbox
- Create Account button
- "Already have an account? Sign in" footer link

### Forgot Password screen
- Back to sign in link
- Work Email input
- Send Reset Link button

### Forgot Success screen
- Email icon
- "Check your inbox" title
- Confirmation message with the email address
- Back to sign in link

---

## 3. Dashboard — `/dashboard`

**Top section:**
- Greeting — "Good morning, [first name]"
- Subtitle — "Here's what's happening with your hiring pipeline today."
- New Job Posting button (links to /jobs)

**Stats grid (4 cards):**
- Active Jobs — count of non-closed jobs
- Total Applicants — total candidates in pool
- AI Screened — results count from latest screening
- Shortlisted — shortlistedCount from latest screening

**Charts row:**
- Weekly Screening Activity — area chart (screened vs shortlisted by day Mon–Sun), lazy loaded
- Pipeline Status — donut pie chart (Shortlisted / Screened / Pending) + legend, lazy loaded

**Tables row:**
- Active Jobs card — bar chart of shortlist sizes by department + table with columns: Role, Company, Location, Shortlisted/Size, Status badge, Open button
- Recent AI Screenings card — list of top 5 screened candidates with initials avatar, name, role, score /100

Empty states shown when no jobs or no screening data yet.

---

## 4. Jobs — `/jobs`

**Header:**
- "Job Postings" title + role count (shows Loading... while fetching)
- Add Job button

**Job list:**
- Skeleton shimmer (3 cards) while loading
- Each job card: work icon, title, department + location + shortlist size meta, status badge (Active/Draft/Closed), Edit / Delete / Candidates buttons
- Empty state: "No jobs yet. Click Add Job to create your first posting."

**Add/Edit Job panel (right slide-in drawer):**
- Title, Company, Department, Location, Salary, Job Type, Employment Type, Experience Level, Shortlist Size (Top 10/20/30)
- Job Description textarea
- Required Skills — tag input with Add button + comma-separated fallback input + tag chips
- AI Weights sliders — Skills, Experience, Education, Projects, Certifications (% each, shows total)
- Ideal Candidate Profile textarea
- Status dropdown (Draft / Active / Closed)
- Save & Publish / Save Changes button + Cancel

---

## 5. Candidates Data — `/candidates`

**Header:**
- "Candidate Data Pool" title + count (shows Loading... while fetching)
- Search input (filters by name, headline, skills)
- Select All button

**Sub-header:**
- Selected count
- Badge showing pool count

**Candidates grid:**
- Skeleton shimmer (6 cards) while loading
- Each candidate card: initials avatar, name, headline, skill pills (up to 5), location + years experience meta
- Click to select/deselect (highlighted border)
- Empty state: "No candidates found."

**Run AI Screening modal (triggered by nav button):**
- Progress bar
- 5 animated steps: Parse resumes → Extract profiles → Run AI scoring → Rank shortlist → Generate explanations
- Each step shows: icon, label, status (waiting / processing / complete)
- View Shortlist Results button appears when complete → navigates to /shortlist

---

## 6. AI Shortlists — `/shortlist`

**Metrics row (4 cards):**
- Total Screened
- Shortlisted (blue)
- Avg AI Score (green)
- Incomplete CVs (amber)

**Incomplete banner:**
- Warning about skipped resumes with candidate IDs listed

**Toolbar:**
- Green dot + "Screening synced" status
- Top 10 / 20 / 30 dropdown (triggers re-screening on change)
- Refresh button

**Shortlist header:**
- "AI Screening Results" label
- "Shortlisted Candidates" title
- Screened via [model] subtitle
- Large shortlist count number (top right)

**Ranked candidates table:**
- Rank badge (gold #1, silver #2, bronze #3, grey rest)
- Candidate name
- Score bar (green ≥85, blue ≥70, red <70) + score number
- Profile button → navigates to /profile (stores candidateId in localStorage)

**AI Reasoning panel (appears on row click):**
- Score /100
- Score breakdown — Skills, Experience, Education, Projects, Certifications
- Summary text
- Strengths list (check_circle icons)
- Gaps list (error icons)

**Nav action:** Export JSON button — downloads screening as `.json` file

---

## 7. Bulk CV Upload — `/external`

**Header:**
- "Bulk CV Upload" title
- View Pool button → /candidates

**Mode tabs (4):**

### Upload JSON
- Drag-and-drop zone for `.json` files
- Browse File button
- After upload: file loaded confirmation + Add to Pool button

### Upload CSV
- Drag-and-drop zone for `.csv` files
- Browse File button
- After parse: row count + Add to Pool button

### Upload PDF Resumes
- Drag-and-drop zone for `.pdf` files (multiple)
- Browse PDFs button
- Queued files list with name + size
- Parse with AI & Add to Pool button

### Manual Entry
- Add Placeholder Candidate button — creates a blank profile and redirects to /candidates

---

## 8. Candidate Profile — `/profile`

Accessed from AI Shortlists via Profile button. Stores selected candidate ID in localStorage.

**Left sidebar card:**
- Initials avatar (large)
- Name, headline, location, email
- AI Screening Score — large number /100
- Edit mode: file upload for avatar + editable inputs for all fields

**Main content (right):**
- Professional Bio
- Skills & Languages — skill pills with level + years, language badges
- Work Experience — role @ company, date range, description
- Education & Certifications — 2-column grid
- Projects — 2-column grid with name, role, description

**Nav actions:**
- Update Profile button → toggles edit mode
- Save Changes button (visible in edit mode)

---

## 9. AI Settings — `/settings`

**Sections:**

### Primary AI Model
- Dropdown: gemini-2.5-pro / gemini-1.5-pro / gemini-1.5-flash / gemini-2.0-flash

### AI Pipeline Toggles
- Multi-candidate Batch Output (on/off)
- Explainable Structuring (on/off)
- Bias Detection Filter (on/off)

### Prompt Engineering Context
- Textarea for custom system instructions
- Supports `{{job}}` and `{{candidates}}` template variables
- Save Configuration button

Settings are loaded from `/api/auth/settings` on mount, saved on button click, with localStorage fallback if API is unavailable.

---

## Route Summary

| Route | Auth | Sidebar | Description |
|---|---|---|---|
| `/` | No | No | Public landing page |
| `/login` | No | No | Login / signup / forgot password |
| `/dashboard` | Yes | Yes | Overview, stats, charts |
| `/jobs` | Yes | Yes | Job postings CRUD |
| `/candidates` | Yes | Yes | Candidate pool + AI screening |
| `/shortlist` | Yes | Yes | Ranked shortlist + AI reasoning |
| `/external` | Yes | Yes | Bulk CV upload (JSON/CSV/PDF/manual) |
| `/profile` | Yes | Yes | Individual candidate profile view/edit |
| `/settings` | Yes | Yes | AI model + pipeline configuration |
