import Link from 'next/link';

const features = [
  {
    tag: 'Precision',
    title: 'Intelligent Matching',
    desc: 'AI maps job requirements against structured talent profiles with weighted scoring across skills, experience, education, and more.',
  },
  {
    tag: 'Automation',
    title: 'Multi-Candidate Parsing',
    desc: 'Upload CVs as PDFs, CSVs, or Excel files from external job boards. The AI extracts and normalizes profiles automatically.',
  },
  {
    tag: 'Speed',
    title: 'Ranked Shortlists',
    desc: 'Generate Top 10 or Top 20 candidate shortlists instantly. Every rank is backed by transparent, structured AI reasoning.',
  },
  {
    tag: 'Control',
    title: 'Bias-Aware Scoring',
    desc: 'Customizable scoring weights let you prioritize what matters. Skills, experience, and certifications - you define the rubric.',
  },
  {
    tag: 'Trust',
    title: 'Explainable AI',
    desc: 'Every shortlisted candidate comes with detailed strengths, gaps, and relevance notes so your team understands every recommendation.',
  },
  {
    tag: 'Confidence',
    title: 'Human-Led Decisions',
    desc: 'AI augments, never replaces. Recruiters retain full control of final decisions while AI works as a smart co-pilot.',
  },
];

export default function HomePage() {
  return (
    <div className="home-page">
      <nav className="navbar">
        <Link href="/" className="logo">
          <div className="logo-badge">
            <span className="material-symbols-outlined">psychology</span>
          </div>
          <span>Umurava AI</span>
        </Link>

        <div className="nav-links">
          <a href="#overview" className="nav-link active">
            Overview
          </a>
          <a href="#about-section" className="nav-link">
            About Us
          </a>
          <a href="#features-section" className="nav-link">
            Features
          </a>
        </div>

        <div className="nav-actions">
          <Link href="/login" className="btn btn-primary">
            Recruiter Login
          </Link>
        </div>
      </nav>

      <div id="overview">
        <section className="hero">
          <div className="home-hero-content">
            <h1>
              Your <span className="hero-h1-accent">Dream Team</span> Is
              <br />
              Waiting For You
            </h1>
            <p className="hero-sub">
              Type less, screen faster, and move from candidate overload to a confident shortlist with recruiter-first AI workflows.
            </p>

            <div className="hero-search-card">
              <div className="hero-search-field">
                <span className="material-symbols-outlined">manage_search</span>
                <span>CV ranking, applicant scoring, shortlist generation</span>
              </div>
              <div className="hero-search-field">
                <span className="material-symbols-outlined">location_on</span>
                <span>Recruiter dashboards, pipelines, jobs, interviews</span>
              </div>
            </div>
          </div>

        </section>
      </div>

      <section className="about-section" id="about-section">
        <div className="about-copy">
          <div className="about-chip">About Our Company</div>
          <h2 className="section-title">
            Choose <span>The Best</span> AI recruitment platform
          </h2>
          <div className="about-highlight">
            Umurava AI helps recruiter teams screen faster, shortlist smarter, and keep every hiring decision transparent from first upload to final selection.
          </div>
          <div className="about-benefits">
            <div className="about-benefit-card">
              <span className="material-symbols-outlined benefit-icon">workspace_premium</span>
              <div>
                <strong>Reliable Shortlists</strong>
                <p>Ranked candidates with explainable reasoning.</p>
              </div>
            </div>
            <div className="about-benefit-card">
              <span className="material-symbols-outlined benefit-icon">support_agent</span>
              <div>
                <strong>Recruiter Support</strong>
                <p>Workflows built for real hiring teams.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="features" id="features-section">
        <span className="section-label">Platform Capabilities</span>
        <h2 className="section-title section-title-center">Everything recruiters need, powered by AI</h2>

        <div className="features-grid">
          {features.map((feature) => (
            <div key={feature.title} className="feature-card">
              <span className="feature-pill">{feature.tag}</span>
              <div className="feature-title">{feature.title}</div>
              <p className="feature-desc">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="home-footer">
        <div className="home-footer-inner">
          <div className="home-footer-brand">
            <Link href="/" className="logo footer-logo">
              <div className="logo-badge">
                <span className="material-symbols-outlined">psychology</span>
              </div>
              <span>Umurava AI</span>
            </Link>
            <p>
              Recruiter-first AI screening built to turn candidate overload into structured, explainable hiring decisions.
            </p>
            <div className="home-footer-badges">
              <span>AI screening</span>
              <span>Shortlists</span>
              <span>Recruiter workflows</span>
            </div>
          </div>

          <div className="home-footer-links">
            <div className="home-footer-heading">Navigate</div>
            <a href="#about-section">About Us</a>
            <a href="#features-section">Features</a>
            <a href="/login">Recruiter Login</a>
            <a href="/dashboard">Dashboard</a>
          </div>

          <div className="home-footer-meta">
            <div className="home-footer-heading">Why Umurava</div>
            <span>Transparent AI recommendations</span>
            <span>Faster screening for every role</span>
            <span>Built for modern hiring teams</span>
          </div>

          <div className="home-footer-cta">
            <div className="home-footer-heading">Start Hiring Smarter</div>
            <p>Move from candidate overload to recruiter-ready shortlists in minutes.</p>
            <Link href="/login" className="btn btn-primary">
              Get Started
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
