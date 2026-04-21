'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { AppShell } from '@/components/app-shell';
import { getCandidate, getLatestScreening, listCandidates, updateCandidateWithAvatar, type CandidateRecord } from '@/lib/backend';
import { showToast } from '@/lib/toast';

export default function ProfilePage() {
  const [candidate, setCandidate] = useState<CandidateRecord | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', headline: '', email: '', location: '', bio: '' });
  const [score, setScore] = useState(0);

  useEffect(() => {
    let alive = true;
    const storedId = window.localStorage.getItem('umurava.selectedProfileId') || '';
    const loader = storedId ? getCandidate(storedId) : listCandidates().then((items) => items[0] || null);
    Promise.all([loader, getLatestScreening()])
      .then(([found, latest]) => {
        const candidateId = String(found?.id || storedId || '');
        const latestScore = latest?.results.find((item) => String(item.candidateId) === candidateId)?.score || 0;
        if (!alive) return;
        setScore(latestScore);
        setCandidate(found || null);
        setForm({
          firstName: found?.personalInfo.firstName || '',
          lastName: found?.personalInfo.lastName || '',
          headline: found?.personalInfo.headline || '',
          email: found?.personalInfo.email || '',
          location: found?.personalInfo.location || '',
          bio: found?.personalInfo.bio || ''
        });
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const initials = useMemo(() => {
    if (!candidate) return '';
    return `${candidate.personalInfo.firstName?.[0] || ''}${candidate.personalInfo.lastName?.[0] || ''}`.toUpperCase();
  }, [candidate]);

  async function handleSave() {
    if (!candidate?.id) return;
    const updated = await updateCandidateWithAvatar(String(candidate.id), {
      ...candidate,
      personalInfo: {
        ...candidate.personalInfo,
        firstName: form.firstName,
        lastName: form.lastName,
        headline: form.headline,
        email: form.email,
        location: form.location,
        bio: form.bio
      }
    }, avatarFile || undefined);
    setCandidate(updated);
    setEditing(false);
    showToast('Profile updated successfully.', 'success');
  }

  if (loading) {
    return (
      <AppShell activeSidebar="shortlist" navLinks={<><Link className="nav-link" href="/shortlist">AI Shortlists</Link><div className="nav-link active">Candidate Profile</div></>} >
        <div>Loading profile...</div>
      </AppShell>
    );
  }

  if (!candidate) {
    return (
      <AppShell activeSidebar="shortlist" navLinks={<><Link className="nav-link" href="/shortlist">AI Shortlists</Link><div className="nav-link active">Candidate Profile</div></>}>
        <div>No candidate profile found.</div>
      </AppShell>
    );
  }

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
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            className={`btn ${editing ? 'btn-ghost' : 'btn-primary'} btn-sm`}
            onClick={() => (editing ? setEditing(false) : setEditing(true))}
            type="button"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
              {editing ? 'close' : 'edit'}
            </span>
            {editing ? 'Cancel' : 'Update Profile'}
          </button>
          {editing ? (
            <button className="btn btn-success btn-sm" onClick={handleSave} type="button">
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                check
              </span>
              Save Changes
            </button>
          ) : null}
        </div>
      }
    >
      <div className="profile-layout" id="profile-content">
        <div className="profile-sidebar-card">
          <div className="profile-avatar">{initials}</div>
          {editing ? (
            <input
              type="file"
              accept="image/*"
              style={{ width: '100%', marginTop: 12 }}
              onChange={(event) => setAvatarFile(event.target.files?.[0] || null)}
            />
          ) : null}
          {editing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', marginTop: 12 }}>
              <input className="profile-edit-input" value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} placeholder="First name" />
              <input className="profile-edit-input" value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} placeholder="Last name" />
              <input className="profile-edit-input" value={form.headline} onChange={(e) => setForm((f) => ({ ...f, headline: e.target.value }))} placeholder="Headline" />
              <input className="profile-edit-input" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="Email" />
              <input className="profile-edit-input" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} placeholder="Location" />
              <textarea className="profile-edit-input" value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} placeholder="Bio" rows={3} style={{ resize: 'vertical' }} />
            </div>
          ) : (
            <>
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
            </>
          )}
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            <div className="profile-section-title">AI Screening Score</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--primary)', fontFamily: 'DM Mono, monospace' }}>
              {score}
              <span style={{ fontSize: 16, color: 'var(--text-muted)' }}>/100</span>
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
              {(candidate.skills || []).map((skill) => (
                <span className="skill-pill" style={{ padding: '6px 12px' }} key={skill.name}>
                  {skill.name} ({skill.level}, {skill.yearsOfExperience}y)
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {(candidate.languages || []).map((language) => (
                <span className="badge badge-ghost" key={language.name}>
                  {language.name}: {language.proficiency}
                </span>
              ))}
            </div>
          </div>
          <div className="profile-section">
            <div className="profile-section-title">Work Experience</div>
            {(candidate.experience || []).map((experience) => (
              <div className="exp-item" style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--border2)' }} key={`${experience.company}-${experience.role}`}>
                <div className="exp-role" style={{ fontWeight: 700 }}>
                  {experience.role} @ <span style={{ color: 'var(--primary)' }}>{experience.company}</span>
                </div>
                <div className="exp-date" style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace' }}>
                  {experience.startDate} - {experience.endDate || 'Present'}
                </div>
                <div className="exp-desc" style={{ fontSize: 13, margin: '8px 0' }}>
                  {experience.description}
                </div>
              </div>
            ))}
          </div>
          <div className="profile-section">
            <div className="profile-section-title">Education & Certifications</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div>
                {(candidate.education || []).map((education) => (
                  <div style={{ marginBottom: 10 }} key={`${education.institution}-${education.degree}`}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>
                      {education.degree} in {education.fieldOfStudy}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {education.institution} ({education.startYear}-{education.endYear || 'Present'})
                    </div>
                  </div>
                ))}
              </div>
              <div>
                {(candidate.certifications || []).map((certification) => (
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
              {(candidate.projects || []).map((project) => (
                <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 12 }} key={project.name}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{project.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0' }}>{project.role}</div>
                  <div style={{ fontSize: 12, marginBottom: 6 }}>{project.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
