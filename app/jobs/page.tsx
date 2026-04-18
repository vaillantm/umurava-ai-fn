'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { AppShell } from '@/components/app-shell';
import { showToast } from '@/lib/toast';
import { umuravaStore } from '@/lib/umurava-store';

type WeightKey = 'skills' | 'experience' | 'education' | 'projects' | 'certifications';

export default function JobsPage() {
  const [open, setOpen] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [weights, setWeights] = useState<Record<WeightKey, number>>({
    skills: 40,
    experience: 30,
    education: 15,
    projects: 10,
    certifications: 5
  });

  const jobSummary = useMemo(
    () => [
      { title: 'Senior Backend Engineer', dept: 'Engineering', location: 'Kigali, Rwanda', candidates: '48 candidates', status: 'Active', icon: 'code', badge: 'badge-active', action: 'Screen →', href: '/candidates' },
      { title: 'AI/ML Engineer', dept: 'Data & AI', location: 'Remote', candidates: '62 candidates', status: 'Pending', icon: 'smart_toy', badge: 'badge-pending', action: 'Screen →', href: '/candidates' },
      { title: 'Product Designer', dept: 'Design', location: 'Nairobi, Kenya', candidates: '35 candidates', status: 'Active', icon: 'palette', badge: 'badge-active', action: 'Results →', href: '/shortlist' },
      { title: 'DevOps Engineer', dept: 'Infrastructure', location: 'Remote', candidates: '44 candidates', status: 'Closed', icon: 'dns', badge: 'badge-closed', action: 'Results →', href: '/shortlist' }
    ],
    []
  );

  const addSkill = () => {
    const value = skillInput.trim();
    if (!value) return;
    setSkills((current) => [...current, value]);
    setSkillInput('');
  };

  return (
    <AppShell
      activeSidebar="jobs"
      navLinks={<div className="nav-link active">Jobs</div>}
      actions={
        <>
          <Link className="btn btn-ghost btn-sm" href="/dashboard" style={{ cursor: 'pointer' }}>
            Dashboard
          </Link>
          <Link className="btn btn-ghost btn-sm" href="/">
            Logout
          </Link>
        </>
      }
    >
      <div className="page-header">
        <div className="page-title">
          Job Postings <span>4 active roles</span>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setOpen(true)}>
          <span className="material-symbols-outlined">add</span> Add Job
        </button>
      </div>

      <div className="jobs-list">
        {jobSummary.map((job) => (
          <div className="job-card" key={job.title}>
            <div className="job-card-icon">
              <span className="material-symbols-outlined">{job.icon}</span>
            </div>
            <div className="job-card-info">
              <div className="job-card-title">{job.title}</div>
              <div className="job-card-meta">
                <span>
                  <span className="material-symbols-outlined" style={{ fontSize: 13 }}>
                    business
                  </span>{' '}
                  {job.dept}
                </span>
                <span>
                  <span className="material-symbols-outlined" style={{ fontSize: 13 }}>
                    location_on
                  </span>{' '}
                  {job.location}
                </span>
                <span>
                  <span className="material-symbols-outlined" style={{ fontSize: 13 }}>
                    group
                  </span>{' '}
                  {job.candidates}
                </span>
              </div>
            </div>
            <div className="job-card-actions">
              <span className={`badge ${job.badge}`}>● {job.status}</span>
              <Link className="btn btn-ghost btn-sm" href={job.href}>
                {job.action}
              </Link>
            </div>
          </div>
        ))}
      </div>

      {open ? (
        <>
          <div className="job-panel-overlay open" onClick={() => setOpen(false)} />
          <div className="job-panel open">
            <div className="job-panel-header">
              <div className="job-panel-title">New Job Posting</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="job-panel-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Job Title *</label>
                  <input id="job-title" type="text" placeholder="e.g. Senior Backend Engineer" />
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <input id="job-department" type="text" placeholder="e.g. Engineering" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Location</label>
                  <input id="job-location" type="text" placeholder="City, Country or Remote" />
                </div>
                <div className="form-group">
                  <label>Employment Type</label>
                  <select id="job-employment-type" defaultValue="Full-time">
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Contract</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Experience Level</label>
                  <select id="job-experience-level" defaultValue="Mid-level (3-5 yrs)">
                    <option>Junior (0-2 yrs)</option>
                    <option>Mid-level (3-5 yrs)</option>
                    <option>Senior (5+ yrs)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Shortlist Size</label>
                  <select id="job-shortlist-size" defaultValue="20">
                    <option value="10">Top 10</option>
                    <option value="20">Top 20</option>
                  </select>
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label>Job Description *</label>
                <textarea id="job-description" rows={4} placeholder="Describe the role, responsibilities and requirements…" />
              </div>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label>Required Skills</label>
                <div className="skills-input-wrap">
                  <input value={skillInput} onChange={(event) => setSkillInput(event.target.value)} type="text" placeholder="Add a skill…" onKeyDown={(event) => event.key === 'Enter' && (event.preventDefault(), addSkill())} />
                  <button className="btn btn-primary btn-sm" onClick={addSkill} type="button">
                    Add
                  </button>
                </div>
                <div className="tags-area">
                  {skills.map((skill) => (
                    <span className="tag" key={skill}>
                      {skill}
                      <span className="tag-remove" onClick={() => setSkills((current) => current.filter((item) => item !== skill))}>
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                          close
                        </span>
                      </span>
                    </span>
                  ))}
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label>AI Weights (%) - Total 100%</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, background: 'var(--surface2)', padding: 16, borderRadius: 10, border: '1px solid var(--border)' }}>
                  {(Object.keys(weights) as WeightKey[]).map((key) => (
                    <div className="weight-group" key={key}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                        <span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                        <strong>{weights[key]}%</strong>
                      </div>
                      <input
                        type="range"
                        className="weight-slider"
                        value={weights[key]}
                        onChange={(event) => setWeights((current) => ({ ...current, [key]: Number(event.target.value) }))}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Ideal Candidate (AI context)</label>
                <textarea id="job-ideal-profile" rows={3} placeholder="e.g. 5+ years Node.js, distributed systems experience…" />
              </div>
            </div>
            <div className="job-panel-footer">
              <button
                className="btn btn-primary"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => {
                  const title = (document.getElementById('job-title') as HTMLInputElement | null)?.value.trim() || '';
                  if (!title) {
                    showToast('Please add a job title', 'info');
                    return;
                  }
                  umuravaStore.saveJob({
                    title,
                    department: (document.getElementById('job-department') as HTMLInputElement | null)?.value.trim() || '',
                    location: (document.getElementById('job-location') as HTMLInputElement | null)?.value.trim() || '',
                    employmentType: (document.getElementById('job-employment-type') as HTMLSelectElement | null)?.value || 'Full-time',
                    experienceLevel: (document.getElementById('job-experience-level') as HTMLSelectElement | null)?.value || 'Mid-level (3-5 yrs)',
                    shortlistSize: Number((document.getElementById('job-shortlist-size') as HTMLSelectElement | null)?.value || 20),
                    description: (document.getElementById('job-description') as HTMLTextAreaElement | null)?.value.trim() || '',
                    idealCandidateProfile: (document.getElementById('job-ideal-profile') as HTMLTextAreaElement | null)?.value.trim() || '',
                    requiredSkills: skills,
                    aiWeights: { ...weights }
                  });
                  showToast(`"${title}" saved as the active screening job`, 'success');
                  setOpen(false);
                }}
                type="button"
              >
                Save & Publish →
              </button>
              <button className="btn btn-ghost" onClick={() => setOpen(false)} type="button">
                Cancel
              </button>
            </div>
          </div>
        </>
      ) : null}
    </AppShell>
  );
}
