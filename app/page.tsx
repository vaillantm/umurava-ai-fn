import Link from 'next/link';

const features = [
  {
    image: '/images/target.png',
    title: 'Intelligent Matching',
    desc: 'AI maps job requirements against structured talent profiles with weighted scoring across skills, experience, education, and more.'
  },
  {
    image: '/images/chat.png',
    title: 'Multi-Candidate Parsing',
    desc: 'Upload CVs as PDFs, CSVs, or Excel files from external job boards. The AI extracts and normalizes profiles automatically.'
  },
  {
    image: '/images/bar.png',
    title: 'Ranked Shortlists',
    desc: 'Generate Top 10 or Top 20 candidate shortlists instantly. Every rank is backed by transparent, structured AI reasoning.'
  },
  {
    image: '/images/document.png',
    title: 'Bias-Aware Scoring',
    desc: 'Customizable scoring weights let you prioritize what matters. Skills, experience, and certifications - you define the rubric.'
  },
  {
    image: '/images/scan.png',
    title: 'Explainable AI',
    desc: 'Every shortlisted candidate comes with detailed strengths, gaps, and relevance notes - so your team understands every recommendation.'
  },
  {
    image: '/images/human.png',
    title: 'Human-Led Decisions',
    desc: 'AI augments, never replaces. As a recruiter, you retain full control of final accept/reject decisions with AI acting as a smart co-pilot.'
  }
];

export default function HomePage() {
  return (
    <div className="page">
      <nav className="home-nav">
        <Link className="nav-logo" href="/">
          <div className="nav-logo-mark">
            <span className="material-symbols-outlined">psychology</span>
          </div>
          <div className="nav-logo-text">Umurava AI</div>
        </Link>
        <div className="nav-links">
          <Link className="nav-link home-nav-link active" href="/">
            Overview
          </Link>
          <a className="nav-link home-nav-link" href="#features-section">
            Features
          </a>
        </div>
        <div className="nav-actions">
          <Link className="btn btn-primary home-nav-cta" href="/login">
            Recruiter Login <span className="material-symbols-outlined" style={{ fontSize: 18 }}>login</span>
          </Link>
        </div>
      </nav>

      <div className="home-wrapper">
        <section className="home-hero">
          <div className="home-hero-content">
            <h1>
              Built for
              <br />
              Recruiters.
            </h1>
            <div className="home-hero-subtitle">Powered by Gemini.</div>
            <p className="home-hero-sub">
              Upload CSVs or resumes to analyze hundreds of candidates in seconds. Get ranked shortlists with transparent, explainable AI
              reasoning - keeping you in full control of every hiring decision.
            </p>
          </div>
          <div className="home-hero-image-container">
            <img src="/images/hero.png" alt="Recruiter Workspace" className="home-hero-image" />
          </div>
        </section>
      </div>

      <div className="stats-container">
        <div className="hero-stat">
          <div className="hero-stat-copy">
            <span className="hero-stat-num">10x FASTER</span>
            <span className="hero-stat-label">SCREENING</span>
          </div>
        </div>
        <div className="hero-stat">
          <div className="hero-stat-copy">
            <span className="hero-stat-num">ACCURACY RATE</span>
            <span className="hero-stat-label">VERIFIED</span>
          </div>
        </div>
        <div className="hero-stat">
          <div className="hero-stat-copy">
            <span className="hero-stat-num">EXPLAINABLE AI</span>
            <span className="hero-stat-label">FULL TRANSPARENCY</span>
          </div>
        </div>
      </div>

      <section className="features" id="features-section">
        <h2 className="section-title">Everything recruiters need, powered by Gemini AI</h2>

        <div className="features-grid">
          {features.map((feature) => (
            <div className="feature-card" key={feature.title}>
              <div className="card-img-placeholder">
                <img src={feature.image} alt={feature.title} />
              </div>
              <div className="feature-title">{feature.title}</div>
              <p className="feature-desc">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
