'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { AppShell } from '@/components/app-shell';
import { showToast } from '@/lib/toast';
import { umuravaStore, type ScreeningResult } from '@/lib/umurava-store';

export default function ProfilePage() {
  const [candidate, setCandidate] = useState<ScreeningResult | null>(null);

  useEffect(() => {
    const storedId = window.localStorage.getItem('umurava.selectedProfileId');
    const pool = umuravaStore.getLatestScreeningResults().length ? umuravaStore.getLatestScreeningResults() : umuravaStore.getCandidates();
    const found = pool.find((item) => String(item.id) === String(storedId)) || pool[0];
    setCandidate((found as ScreeningResult) || null);
  }, []);

  const initials = useMemo(() => {
    if (!candidate) return '';
    return `${candidate.personalInfo.firstName?.[0] || ''}${candidate.personalInfo.lastName?.[0] || ''}`.toUpperCase();
  }, [candidate]);

  if (!candidate) {
    return (
      <AppShell activeSidebar="shortlist" navLinks={<><Link className="nav-link" href="/shortlist">AI Shortlists</Link><div className="nav-link active">Candidate Profile</div></>}>
        <div>Loading profile...</div>
      </AppShell>
    );
  }

  const score = candidate.score || 0;
  const breakdown = candidate.scoreBreakdown || { skills: 0, experience: 0, education: 0, projects: 0, certifications: 0 };

  return (
    <AppShell
      activeSidebar="shortlist"
      navLinks={
        <>
          <Link className="nav-link" href="/shortlist">
            AI Shortlists
          </Link>
          <div className="nav-link active">Candidate Profile</div>
        </>
      }
      actions={
        <button
          className="btn btn-success"
          onClick={() => {
            umuravaStore.markInterview(candidate.id);
            showToast('Candidate approved and sent to interview.', 'success');
          }}
          type="button"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
            check
          </span>{' '}
          Confirm & Move to Interview
        </button>
      }
    >
      <div className="profile-layout" id="profile-content">
        <div className="profile-sidebar-card">
          <div className="profile-avatar">{initials}</div>
          <div className="profile-name">
            {candidate.personalInfo.firstName} {candidate.personalInfo.lastName}
          </div>
          <div className="profile-headline">{candidate.personalInfo.headline}</div>
          <div className="profile-meta-item">
            <span className="material-symbols-outlined">location_on</span> {candidate.personalInfo.location}
          </div>
          <div className="profile-meta-item">
            <span className="material-symbols-outlined">mail</span> {candidate.personalInfo.email}
          </div>
          <div className="profile-meta-item">
            <span className="material-symbols-outlined" style={{ color: 'var(--green)' }}>
              check_circle
            </span>{' '}
            {candidate.availability?.status || 'Available'} ({candidate.availability?.type || 'Full-time'})
          </div>
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            <div className="profile-section-title">AI Screening Score</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--primary)', fontFamily: 'DM Mono, monospace' }}>
              {score}
              <span style={{ fontSize: 16, color: 'var(--text-muted)' }}>/100</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
              {Object.entries(breakdown).map(([key, value]) => (
                <div style={{ display: 'flex', justifyContent: 'space-between' }} key={key}>
                  <span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div>
          <div className="profile-section">
            <div className="profile-section-title">Professional Bio</div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>{candidate.personalInfo.bio || 'No bio provided.'}</div>
          </div>
          <div className="profile-section">
            <div className="profile-section-title">Skills & Languages</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
              {candidate.skills.map((skill) => (
                <span className="skill-pill" style={{ padding: '6px 12px' }} key={skill.name}>
                  {skill.name} ({skill.level}, {skill.yearsOfExperience}y)
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {candidate.languages.map((language) => (
                <span className="badge badge-ghost" key={language.name}>
                  {language.name}: {language.proficiency}
                </span>
              ))}
            </div>
          </div>
          <div className="profile-section">
            <div className="profile-section-title">Work Experience</div>
            {candidate.experience.map((experience) => (
              <div className="exp-item" style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--border2)' }} key={`${experience.company}-${experience.role}`}>
                <div className="exp-role" style={{ fontWeight: 700 }}>
                  {experience.role} @ <span style={{ color: 'var(--primary)' }}>{experience.company}</span>
                </div>
                <div className="exp-date" style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace' }}>
                  {experience.startDate} — {experience.endDate}
                </div>
                <div className="exp-desc" style={{ fontSize: 13, margin: '8px 0' }}>
                  {experience.description}
                </div>
                {experience.technologies ? <div className="exp-tech" style={{ fontSize: 11, color: 'var(--text-muted)' }}>Tech: {experience.technologies.join(', ')}</div> : null}
              </div>
            ))}
          </div>
          <div className="profile-section">
            <div className="profile-section-title">Education & Certifications</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div>
                {candidate.education.map((education) => (
                  <div style={{ marginBottom: 10 }} key={`${education.institution}-${education.degree}`}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>
                      {education.degree} in {education.fieldOfStudy}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {education.institution} ({education.startYear}-{education.endYear})
                    </div>
                  </div>
                ))}
              </div>
              <div>
                {candidate.certifications.map((certification) => (
                  <div style={{ marginBottom: 10 }} key={certification.name}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{certification.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {certification.issuer} ({certification.issueDate})
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="profile-section">
            <div className="profile-section-title">Projects</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {candidate.projects.map((project) => (
                <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 12 }} key={project.name}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{project.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0' }}>{project.role}</div>
                  <div style={{ fontSize: 12, marginBottom: 6 }}>{project.description}</div>
                  {project.link ? (
                    <a href={project.link} target="_blank" style={{ fontSize: 11, color: 'var(--primary)', textDecoration: 'none' }} rel="noreferrer">
                      View Link →
                    </a>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
          <div className="profile-section">
            <div className="profile-section-title">AI Reasoning & Links</div>
            <div style={{ background: 'var(--primary-glow)', border: '1px solid rgba(37,99,235,0.1)', borderRadius: 10, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text-muted)' }}>{candidate.reasoning || 'No reasoning available yet.'}</div>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {candidate.socialLinks?.linkedin ? (
                <a href={candidate.socialLinks.linkedin} target="_blank" className="btn btn-ghost btn-sm" rel="noreferrer">
                  LinkedIn
                </a>
              ) : null}
              {candidate.socialLinks?.github ? (
                <a href={candidate.socialLinks.github} target="_blank" className="btn btn-ghost btn-sm" rel="noreferrer">
                  GitHub
                </a>
              ) : null}
              {candidate.socialLinks?.portfolio ? (
                <a href={candidate.socialLinks.portfolio} target="_blank" className="btn btn-ghost btn-sm" rel="noreferrer">
                  Portfolio
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
