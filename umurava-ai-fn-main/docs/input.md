Talent Profile Schema Specification
1. Overview
This document defines the standard Talent Profile Schema to be used in the Umurava AI Hackathon.
The schema is designed to:
● Ensure consistency across all candidate profiles
● Enable accurate AI-based screening and ranking
● Support structured evaluation and explainability
● Integrate seamlessly with the screening system
2. Design Principles
The schema is built with the following principles:
● Structured over unstructured → Improves AI scoring accuracy
● Explicit fields → Avoid ambiguity during evaluation
● Extensible design → Allows future enhancements
● AI-ready format → Supports ranking, scoring, and reasoning
3. Talent Profile Schema
3.1 Basic Information
Field Name Type Required Description
First Name string Yes Talent's first name
Last Name string Yes Talent's last name
Email string Yes Unique email address
Headline string Yes Short professional summary (e.g., “Backend Engineer –
Node.js & AI Systems”)
Bio string No Detailed professional biography
Location string Yes Current location (City, Country)
3.2 Skills & Languages
Field Name Type Required Description
skills object[] Yes List of skills with proficiency
languages object[] No Spoken languages
skills object Example
{
"name": "Node.js",
"level": "Beginner | Intermediate | Advanced | Expert",
"yearsOfExperience": 3
}
languages object Example
{
"name": "English",
"proficiency": "Basic | Conversational | Fluent | Native"
}
3.3 Work Experience
Field Name Type Required Description
experience object[] Yes Professional experience history
experience object example
{
"company": "Company Name",
"role": "Backend Engineer",
"Start Date": "YYYY-MM",
"End Date": "YYYY-MM | Present",
"description": "Key responsibilities and achievements",
"technologies": ["Node.js", "PostgreSQL"],
"Is Current": true
}
3.4 Education
Field Name Type Required Description
education object[] Yes Academic background
education object example
{
"institution": "University Name",
"degree": "Bachelor's",
"Field of Study": "Computer Science",
"Start Year": 2020,
"End Year": 2024
}
3.5 Certifications
Field Name Type Required Description
certifications object[] No Professional certifications
certification object example
{
"name": "AWS Certified Developer",
"issuer": "Amazon",
"Issue Date": "YYYY-MM"
}
3.6 Projects
Field Name Type Required Description
projects object[] Yes Portfolio projects
project object example
{
"name": "AI Recruitment System",
"description": "AI-powered candidate screening platform",
"technologies": ["Next.js", "Node.js", "Gemini API"],
"role": "Backend Engineer",
"link": "https://...",
"Start Date": "YYYY-MM",
"End Date": "YYYY-MM"
}
3.7 Availability
Field Name Type Required Description
availability object Yes Talent availability
availability object example
{
"status": "Available | Open to Opportunities | Not Available",
"type": "Full-time | Part-time | Contract",
"Start Date": "YYYY-MM-DD" (optional)
}
3.8 Social Links
Field Name Type Required Description
socialLinks object No External profiles
socialLinks object example
{
"linkedin": "https://linkedin.com/...",
"github": "https://github.com/...",
"portfolio": "https://..."
….
}
4. Extensibility
Teams may extend the schema with additional fields such as:
● AI-generated scores
● Portfolio ratings
● Personality insights
However, core fields must not be modified or removed.
5. Final Notes
● This schema will be used for AI-based ranking and shortlisting
● Consistency across profiles is critical for fair evaluation
● Poorly structured data will lead to lower scoring accuracy