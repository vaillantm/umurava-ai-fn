'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { AppShell } from '@/components/app-shell';
import { createJob, deleteJob, listJobs, updateJob, type JobRecord } from '@/lib/api';
import { showToast } from '@/lib/toast';

type WeightKey = 'skills' | 'experience' | 'education' | 'projects' | 'certifications';

const DEFAULT_WEIGHTS: Record<WeightKey, number> = {
  skills: 40,
  experience: 30,
  education: 15,
  projects: 10,
  certifications: 5
};

const DEFAULT_FORM = {
  title: '',
  company: '',
  department: '',
  location: '',
  salary: '',
  jobType: 'full-time' as NonNullable<JobRecord['jobType']>,
  employmentType: 'Full-time',
  experienceLevel: 'Mid-level (3-5 yrs)',
  shortlistSize: '20',
  description: '',
  requiredSkills: '',
  idealCandidateProfile: '',
  status: 'draft' as NonNullable<JobRecord['status']>
};

export default function JobsPage() {
  const [open, setOpen] = useState(false);
  const [jobs, setJobs] = useState<JobRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [weights, setWeights] = useState<Record<WeightKey, number>>(DEFAULT_WEIGHTS);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    listJobs().then((items) => {
      if (!alive) return;
      setJobs(items);
    }).finally(() => {
      if (alive) setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, []);

  const jobSummary = useMemo(
    () =>
      jobs.map((job) => ({
        id: job.id || '',
        title: job.title,
        dept: job.department || 'General',
        location: job.location || 'Remote',
        candidates: `${job.shortlistSize || 0} shortlist size`,
        status: (job.status || 'draft').charAt(0).toUpperCase() + (job.status || 'draft').slice(1),
        icon: 'work',
        badge: `badge-${job.status === 'closed' ? 'closed' : job.status === 'active' ? 'active' : 'pending'}`
      })),
    [jobs]
  );

  const addSkill = () => {
    const value = skillInput.trim();
    if (!value) return;
    setSkills((current) => [...current, value]);
    setSkillInput('');
  };

  const totalWeight = Object.values(weights).reduce((sum, value) => sum + value, 0);

  function openCreate() {
    setEditingId(null);
    setForm(DEFAULT_FORM);
    setSkills([]);
    setWeights(DEFAULT_WEIGHTS);
    setOpen(true);
  }

  function openEdit(job: JobRecord) {
    setEditingId(job.id || null);
    setForm({
      title: job.title || '',
      company: job.company || '',
      department: job.department || '',
      location: job.location || '',
      salary: job.salary ? String(job.salary) : '',
      jobType: job.jobType || 'full-time',
      employmentType: job.employmentType || 'Full-time',
      experienceLevel: job.experienceLevel || 'Mid-level (3-5 yrs)',
      shortlistSize: String(job.shortlistSize || 20),
      description: job.description || '',
      requiredSkills: (job.requiredSkills || []).join(', '),
      idealCandidateProfile: job.idealCandidateProfile || '',
      status: job.status || 'draft'
    });
    setSkills(job.requiredSkills || []);
    setWeights(job.aiWeights || DEFAULT_WEIGHTS);
    setOpen(true);
  }

  async function handleDelete(jobId: string) {
    if (!window.confirm('Delete this job?')) return;
    await deleteJob(jobId);
    setJobs((current) => current.filter((job) => job.id !== jobId));
    showToast('Job deleted.', 'success');
  }

  async function handleSave() {
    const title = form.title.trim();
    const company = form.company.trim();
    const description = form.description.trim();
    if (!title || !company || !description) {
      showToast('Title, company, and description are required.', 'info');
      return;
    }

    setBusy(true);
    try {
      const payload = {
        title,
        company,
        department: form.department.trim() || undefined,
        location: form.location.trim() || undefined,
        salary: form.salary ? Number(form.salary) : undefined,
        jobType: form.jobType,
        employmentType: form.employmentType,
        experienceLevel: form.experienceLevel,
        shortlistSize: Number(form.shortlistSize) || 20,
        description,
        requiredSkills: [...skills, ...form.requiredSkills.split(',').map((item) => item.trim()).filter(Boolean)],
        idealCandidateProfile: form.idealCandidateProfile.trim(),
        aiWeights: { ...weights },
        status: form.status
      };

      if (editingId) {
        const updated = await updateJob(editingId, payload);
        setJobs((current) => current.map((job) => (job.id === updated.id ? updated : job)));
        showToast(`"${title}" updated successfully.`, 'success');
      } else {
        const created = await createJob(payload as JobRecord);
        setJobs((current) => [created, ...current.filter((job) => job.id !== created.id)]);
        showToast(`"${title}" saved successfully.`, 'success');
      }

      setOpen(false);
      setEditingId(null);
      setForm(DEFAULT_FORM);
      setSkills([]);
      setWeights(DEFAULT_WEIGHTS);
      setSkillInput('');
    } catch {
      showToast('Could not save the job right now.', 'info');
    } finally {
      setBusy(false);
    }
  }

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
          Job Postings <span>{loading ? 'Loading...' : jobs.length ? `${jobs.length} roles` : 'No jobs yet'}</span>
        </div>
        <button className="btn btn-primary btn-sm" onClick={openCreate} type="button">
          <span className="material-symbols-outlined">add</span> Add Job
        </button>
      </div>

      <div className="jobs-list">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div className="job-card job-card-skeleton" key={i}>
              <div className="skeleton skeleton-icon" />
              <div className="job-card-info">
                <div className="skeleton skeleton-title" />
                <div className="skeleton skeleton-meta" />
              </div>
              <div className="job-card-actions">
                <div className="skeleton skeleton-badge" />
                <div className="skeleton skeleton-btn" />
                <div className="skeleton skeleton-btn" />
              </div>
            </div>
          ))
        ) : jobSummary.length === 0 ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
            No jobs yet. Click <strong>Add Job</strong> to create your first posting.
          </div>
        ) : jobSummary.map((job) => (
          <div className="job-card" key={job.id}>
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
              <span className={`badge ${job.badge}`}>{job.status}</span>
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => openEdit(jobs.find((item) => item.id === job.id) as JobRecord)}>
                Edit
              </button>
              {job.id ? (
                <button className="btn btn-ghost btn-sm" type="button" onClick={() => void handleDelete(job.id)}>
                  Delete
                </button>
              ) : null}
              <Link className="btn btn-ghost btn-sm" href="/candidates">
                Candidates
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
              <div className="job-panel-title">{editingId ? 'Edit Job Posting' : 'New Job Posting'}</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setOpen(false)} type="button">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="job-panel-body">
              <div className="job-form-grid">
                <div className="form-group">
                  <label>Job Title *</label>
                  <input type="text" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Company *</label>
                  <input type="text" value={form.company} onChange={(event) => setForm((current) => ({ ...current, company: event.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <input type="text" value={form.department} onChange={(event) => setForm((current) => ({ ...current, department: event.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input type="text" value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Salary</label>
                  <input type="number" min="0" value={form.salary} onChange={(event) => setForm((current) => ({ ...current, salary: event.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Job Type</label>
                  <select value={form.jobType} onChange={(event) => setForm((current) => ({ ...current, jobType: event.target.value as NonNullable<JobRecord['jobType']> }))}>
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                    <option value="freelance">Freelance</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Employment Type</label>
                  <select value={form.employmentType} onChange={(event) => setForm((current) => ({ ...current, employmentType: event.target.value }))}>
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Contract</option>
                    <option>Internship</option>
                    <option>Freelance</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Experience Level</label>
                  <select value={form.experienceLevel} onChange={(event) => setForm((current) => ({ ...current, experienceLevel: event.target.value }))}>
                    <option>Junior (0-2 yrs)</option>
                    <option>Mid-level (3-5 yrs)</option>
                    <option>Senior (5+ yrs)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Shortlist Size</label>
                  <select value={form.shortlistSize} onChange={(event) => setForm((current) => ({ ...current, shortlistSize: event.target.value }))}>
                    <option value="10">Top 10</option>
                    <option value="20">Top 20</option>
                    <option value="30">Top 30</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 16 }}>
                <label>Job Description *</label>
                <textarea rows={5} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
              </div>

              <div className="form-group" style={{ marginBottom: 16 }}>
                <label>Required Skills</label>
                <div className="skills-input-wrap">
                  <input value={skillInput} onChange={(event) => setSkillInput(event.target.value)} type="text" onKeyDown={(event) => event.key === 'Enter' && (event.preventDefault(), addSkill())} />
                  <button className="btn btn-primary btn-sm" onClick={addSkill} type="button">
                    Add
                  </button>
                </div>
                <input
                  value={form.requiredSkills}
                  onChange={(event) => setForm((current) => ({ ...current, requiredSkills: event.target.value }))}
                  type="text"
                  placeholder="Optional comma-separated skills"
                  style={{ marginTop: 10 }}
                />
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
                <label>AI Weights (%) - Total {totalWeight}%</label>
                <div className="weights-grid">
                  {(Object.keys(weights) as WeightKey[]).map((key) => (
                    <div className="weight-group" key={key}>
                      <div className="weight-header">
                        <span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                        <strong>{weights[key]}%</strong>
                      </div>
                      <input type="range" className="weight-slider" value={weights[key]} onChange={(event) => setWeights((current) => ({ ...current, [key]: Number(event.target.value) }))} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Ideal Candidate Profile</label>
                <textarea rows={4} value={form.idealCandidateProfile} onChange={(event) => setForm((current) => ({ ...current, idealCandidateProfile: event.target.value }))} />
              </div>

              <div className="form-group" style={{ marginTop: 16 }}>
                <label>Status</label>
                <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as NonNullable<JobRecord['status']> }))}>
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>
            <div className="job-panel-footer">
              <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handleSave} type="button" disabled={busy}>
                {busy ? 'Saving...' : editingId ? 'Save Changes' : 'Save & Publish'}
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
