'use client';

import Link from 'next/link';
import { useState, type CSSProperties } from 'react';

const features = [
  {
    image: '/images/target.png',
    title: 'Intelligent Matching',
    desc: 'AI maps job requirements against structured talent profiles with weighted scoring across skills, experience, education, and more.',
    tag: 'Precision'
  },
  {
    image: '/images/chat.png',
    title: 'Multi-Candidate Parsing',
    desc: 'Upload CVs as PDFs, CSVs, or Excel files from external job boards. The AI extracts and normalizes profiles automatically.',
    tag: 'Automation'
  },
  {
    image: '/images/bar.png',
    title: 'Ranked Shortlists',
    desc: 'Generate Top 10 or Top 20 candidate shortlists instantly. Every rank is backed by transparent, structured AI reasoning.',
    tag: 'Speed'
  },
  {
    image: '/images/document.png',
    title: 'Bias-Aware Scoring',
    desc: 'Customizable scoring weights let you prioritize what matters. Skills, experience, and certifications - you define the rubric.',
    tag: 'Control'
  },
  {
    image: '/images/scan.png',
    title: 'Explainable AI',
    desc: 'Every shortlisted candidate comes with detailed strengths, gaps, and relevance notes so your team understands every recommendation.',
    tag: 'Trust'
  },
  {
    image: '/images/human.png',
    title: 'Human-Led Decisions',
    desc: 'AI augments, never replaces. Recruiters retain full control of final decisions while AI works as a smart co-pilot.',
    tag: 'Confidence'
  }
];

const orbitCompanies = [
  { name: 'Amazon', short: 'a', className: 'amazon', radius: '356px', angle: '6deg', duration: '30s' },
  { name: 'Google', short: 'G', className: 'google', radius: '278px', angle: '66deg', duration: '24s' },
  { name: 'Microsoft', short: 'MS', className: 'microsoft', radius: '356px', angle: '126deg', duration: '28s' },
  { name: 'LinkedIn', short: 'in', className: 'linkedin', radius: '278px', angle: '186deg', duration: '22s' },
  { name: 'Slack', short: 'S', className: 'slack', radius: '356px', angle: '246deg', duration: '32s' },
  { name: 'Dropbox', short: 'D', className: 'dropbox', radius: '278px', angle: '306deg', duration: '26s' }
];

const slidingFeatures = [...features, ...features];

export default function HomePage() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={`page home-page ${darkMode ? 'home-page-dark' : ''}`}>
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
        <div className="nav-actions home-nav-tools">
          <button
            className="theme-toggle"
            type="button"
            onClick={() => setDarkMode((value) => !value)}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <span className="material-symbols-outlined">{darkMode ? 'light_mode' : 'dark_mode'}</span>
            {darkMode ? 'Light' : 'Dark'}
          </button>
          <Link className="btn btn-primary home-nav-cta" href="/login">
            Recruiter Login <span className="material-symbols-outlined" style={{ fontSize: 18 }}>login</span>
          </Link>
        </div>
      </nav>

      <div className="home-wrapper">
        <div className="hero-grid-pattern" />
        <section className="home-hero">
          <div className="home-hero-content">
            <div className="hero-badge">We have AI tools for modern recruiter teams</div>
            <h1>
              Your <span className="hero-h1-accent">Dream Team</span> Is
              <br />
              Waiting For You
            </h1>
            <p className="home-hero-sub">
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
              <Link className="btn btn-primary hero-search-cta" href="/login">
                Recruiter Login
              </Link>
            </div>

            <div className="hero-searches">
              Popular searches: Designers, Senior Engineers, Architecture, Data & AI, Product, DevOps.
            </div>
          </div>

          <div className="home-hero-visual" aria-hidden="true">
            <div className="hero-orbit hero-orbit-outer" />
            <div className="hero-orbit hero-orbit-middle" />
            <div className="hero-orbit hero-orbit-inner" />

            {orbitCompanies.map((company, index) => (
              <div
                key={company.name}
                className={`hero-company-orbit hero-company-${index + 1}`}
                style={
                  {
                    '--orbit-radius': company.radius,
                    '--orbit-angle': company.angle,
                    '--orbit-duration': company.duration
                  } as CSSProperties
                }
              >
                <div className={`hero-company-chip ${company.className}`}>
                  <span className="hero-company-mark">{company.short}</span>
                </div>
              </div>
            ))}

            <div className="hero-person-wrap">
              <img src="/images/hero-recruiter.png" alt="Professional recruiter portal illustration" className="hero-person-image" />
            </div>
          </div>
        </section>
      </div>

      <div className="stats-container">
        <div className="hero-stat">
          <div className="hero-stat-copy">
            <span className="hero-stat-num">10x Faster</span>
            <span className="hero-stat-label">Candidate Screening</span>
          </div>
        </div>
        <div className="hero-stat">
          <div className="hero-stat-copy">
            <span className="hero-stat-num">Top 20 Ready</span>
            <span className="hero-stat-label">Shortlists in Minutes</span>
          </div>
        </div>
        <div className="hero-stat">
          <div className="hero-stat-copy">
            <span className="hero-stat-num">Explainable AI</span>
            <span className="hero-stat-label">Transparent Decisions</span>
          </div>
        </div>
      </div>

      <section className="about-section" id="about-section">
        <div className="about-media" aria-hidden="true">
          <div className="about-media-dots" />
          <div className="about-media-card">
            <img src="/images/hero-recruiter.png" alt="" className="about-visual-image" />
          </div>
          <div className="about-play-badge">
            <span className="material-symbols-outlined">play_arrow</span>
          </div>
        </div>

        <div className="about-copy">
          <div className="about-chip">About Our Company</div>
          <h2 className="section-title about-title">
            Choose <span>The Best</span> AI recruitment platform
          </h2>
          <div className="about-highlight">
            Umurava AI helps recruiter teams screen faster, shortlist smarter, and keep every hiring decision transparent from first upload to final selection.
          </div>

          <div className="about-benefits">
            <div className="about-benefit-card">
              <span className="material-symbols-outlined">workspace_premium</span>
              <div>
                <strong>Reliable Shortlists</strong>
                <p>Ranked candidates with explainable reasoning.</p>
              </div>
            </div>
            <div className="about-benefit-card">
              <span className="material-symbols-outlined">support_agent</span>
              <div>
                <strong>Recruiter Support</strong>
                <p>Workflows built for real hiring teams.</p>
              </div>
            </div>
          </div>

          <div className="about-actions">
            <Link className="btn btn-primary about-cta" href="/login">
              Contact Us
            </Link>
            <div className="about-contact">
              <span className="material-symbols-outlined">call</span>
              <div>
                <span>Call for help</span>
                <strong>+250 791 234 567</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="features" id="features-section">
        <div className="section-label">Platform Capabilities</div>
        <h2 className="section-title">Everything recruiters need, powered by AI</h2>

        <div className="features-marquee">
          <div className="features-track">
            {slidingFeatures.map((feature, index) => (
              <article className="feature-card" key={`${feature.title}-${index}`}>
              <div className="feature-card-sheen" />
              <div className="feature-card-top">
                <span className="feature-pill">{feature.tag}</span>
              </div>
              <div className="card-img-placeholder">
                <img src={feature.image} alt={feature.title} />
              </div>
              <div className="feature-title">{feature.title}</div>
              <p className="feature-desc">{feature.desc}</p>
            </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="home-footer">
        <div className="home-footer-inner">
          <div className="home-footer-brand">
            <div className="nav-logo">
              <div className="nav-logo-mark">
                <span className="material-symbols-outlined">psychology</span>
              </div>
              <div className="nav-logo-text">Umurava AI</div>
            </div>
            <p className="home-footer-copy">
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
            <Link href="/login">Recruiter Login</Link>
            <Link href="/dashboard">Dashboard</Link>
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
            <Link className="btn btn-primary" href="/login">
              Get Started
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
