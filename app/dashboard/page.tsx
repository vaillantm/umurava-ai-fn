'use client';

import Link from 'next/link';
import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { AppShell } from '@/components/app-shell';
import {
  getCachedUser,
  getDashboardSnapshot,
  getLatestScreening,
  listCandidates,
  listJobs,
  logout,
  runBulkScreening,
  runScreening,
  type CandidateRecord,
  type DashboardSnapshot,
  type ScreeningRecord
} from '@/lib/api';
import { showToast } from '@/lib/toast';

const EMPTY_SNAPSHOT: DashboardSnapshot = { jobs: [], candidates: [], latestScreening: null };

const statIcons: Record<string, string> = {
  activeJobs: 'work',
  totalApplicants: 'group',
  aiScreened: 'psychology',
  shortlisted: 'emoji_events',
  incomplete: 'error'
};

const statColors: Record<string, string> = {
  activeJobs: 'var(--primary)',
  totalApplicants: '#7c3aed',
  aiScreened: 'var(--green)',
  shortlisted: '#f59e0b',
  incomplete: 'var(--red)'
};

const statBg: Record<string, string> = {
  activeJobs: 'rgba(37,99,235,0.08)',
  totalApplicants: 'rgba(124,58,237,0.08)',
  aiScreened: 'rgba(22,163,74,0.08)',
  shortlisted: 'rgba(245,158,11,0.08)',
  incomplete: 'rgba(220,38,38,0.08)'
};

function candidateName(candidate?: CandidateRecord | null) {
  if (!candidate) return 'Unknown candidate';
  return `${candidate.personalInfo.firstName} ${candidate.personalInfo.lastName}`.trim() || candidate.personalInfo.email || 'Unknown candidate';
}

function candidateInitials(candidate?: CandidateRecord | null) {
  if (!candidate) return 'UK';
  const initials = [candidate.personalInfo.firstName?.[0], candidate.personalInfo.lastName?.[0]].filter(Boolean).join('');
  return (initials || candidate.personalInfo.email?.[0] || 'U').toUpperCase();
}

export default function DashboardPage() {
  const user = getCachedUser();
  const bulkInputRef = useRef<HTMLInputElement>(null);
  const [snapshot, setSnapshot] = useState<DashboardSnapshot>(EMPTY_SNAPSHOT);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [selectedScreening, setSelectedScreening] = useState<ScreeningRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [running, setRunning] = useState(false);
  const [bulkRunning, setBulkRunning] = useState(false);
  const [bulkFiles, setBulkFiles] = useState<File[]>([]);

  const selectedJob = useMemo(() => {
    if (!selectedJobId) return snapshot.jobs[0] || null;
    return snapshot.jobs.find((job) => String(job.id) === String(selectedJobId)) || null;
  }, [selectedJobId, snapshot.jobs]);

  const currentScreening = useMemo(() => {
    if (selectedScreening && (!selectedJobId || String(selectedScreening.jobId) === String(selectedJobId))) {
      return selectedScreening;
    }

    if (snapshot.latestScreening && (!selectedJobId || String(snapshot.latestScreening.jobId) === String(selectedJobId))) {
      return snapshot.latestScreening;
    }

    return null;
  }, [selectedJobId, selectedScreening, snapshot.latestScreening]);

  const candidateLookup = useMemo(
    () =>
      snapshot.candidates.reduce<Record<string, CandidateRecord>>((map, candidate) => {
        if (candidate.id) map[String(candidate.id)] = candidate;
        return map;
      }, {}),
    [snapshot.candidates]
  );

  const screeningResults = currentScreening?.results || [];
  const incompleteCandidates = currentScreening?.incompleteCandidates || [];
  const shortlistedRows = useMemo(
    () => screeningResults.filter((result) => result.decision === 'shortlisted').slice(0, selectedJob?.shortlistSize || 10),
    [screeningResults, selectedJob?.shortlistSize]
  );

  const summary = useMemo(() => {
    const activeJobs = snapshot.jobs.filter((job) => job.status !== 'closed').length;
    const totalApplicants = snapshot.candidates.length;
    const aiScreened = currentScreening?.results.length || 0;
    const shortlisted = currentScreening?.shortlistedCount || shortlistedRows.length;
    const incomplete = incompleteCandidates.length;
    const averageScore = currentScreening?.averageScore || 0;
    return { activeJobs, totalApplicants, aiScreened, shortlisted, incomplete, averageScore };
  }, [currentScreening, incompleteCandidates.length, shortlistedRows.length, snapshot.candidates.length, snapshot.jobs]);

  const pipeline = useMemo(() => {
    const review = screeningResults.filter((result) => result.decision === 'review').length;
    const rejected = screeningResults.filter((result) => result.decision === 'rejected').length;
    return [
      { key: 'shortlisted', label: 'Shortlisted', value: summary.shortlisted, hint: 'Top ranked results' },
      { key: 'review', label: 'Review', value: review, hint: 'Needs recruiter review' },
      { key: 'rejected', label: 'Rejected', value: rejected, hint: 'Below threshold' },
      { key: 'incomplete', label: 'Incomplete', value: summary.incomplete, hint: 'Skipped profiles' }
    ];
  }, [screeningResults, summary.incomplete, summary.shortlisted]);

  async function refreshDashboard(preferredJobId?: string) {
    setRefreshing(true);
    try {
      let nextSnapshot: DashboardSnapshot;

      try {
        nextSnapshot = await getDashboardSnapshot();
      } catch {
        const [jobs, candidates, latestScreening] = await Promise.all([listJobs(), listCandidates(), getLatestScreening()]);
        nextSnapshot = { jobs, candidates, latestScreening };
      }

      setSnapshot(nextSnapshot);

      const nextJobId = preferredJobId || selectedJobId || nextSnapshot.latestScreening?.jobId || nextSnapshot.jobs[0]?.id || '';
      setSelectedJobId(nextJobId);

      const latestForJob = nextJobId ? await getLatestScreening(nextJobId) : null;
      setSelectedScreening(latestForJob || (nextSnapshot.latestScreening && String(nextSnapshot.latestScreening.jobId) === String(nextJobId) ? nextSnapshot.latestScreening : null));
    } catch {
      showToast('Could not load the dashboard snapshot.', 'info');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void refreshDashboard();
    // Load once on mount. The refresh helper also hydrates the selected job screening.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleJobChange(jobId: string) {
    setSelectedJobId(jobId);
    setRefreshing(true);
    try {
      const latest = await getLatestScreening(jobId);
      setSelectedScreening(latest);
    } catch {
      setSelectedScreening(null);
    } finally {
      setRefreshing(false);
    }
  }

  async function handleRunScreening() {
    const jobId = selectedJobId || selectedJob?.id || currentScreening?.jobId || '';
    if (!jobId) {
      showToast('Pick a job before running screening.', 'info');
      return;
    }

    const candidateIds = snapshot.candidates.map((candidate) => String(candidate.id || '')).filter(Boolean);
    if (!candidateIds.length) {
      showToast('No candidates are available in the pool yet.', 'info');
      return;
    }

    setRunning(true);
    try {
      const result = await runScreening({
        jobId,
        candidateIds,
        shortlistSize: selectedJob?.shortlistSize
      });
      await refreshDashboard(jobId);
      showToast(`Screening completed: ${result.shortlistedCount} shortlisted from ${result.totalCandidates} candidates.`, 'success');
    } catch {
      showToast('Could not run screening right now.', 'info');
    } finally {
      setRunning(false);
    }
  }

  async function handleBulkUploadAndScreen(files?: File[]) {
    const jobId = selectedJobId || selectedJob?.id || currentScreening?.jobId || '';
    const nextFiles = files || bulkFiles;

    if (!jobId) {
      showToast('Pick a job before uploading resumes.', 'info');
      return;
    }

    if (!nextFiles.length) {
      showToast('Select one or more PDF resumes first.', 'info');
      return;
    }

    setBulkRunning(true);
    try {
      const result = await runBulkScreening({
        jobId,
        files: nextFiles,
        shortlistSize: selectedJob?.shortlistSize
      });
      await refreshDashboard(jobId);
      setBulkFiles([]);
      if (bulkInputRef.current) bulkInputRef.current.value = '';
      showToast(`Uploaded and screened ${result.totalCandidates || nextFiles.length} candidate(s).`, 'success');
    } catch {
      showToast('Bulk upload and screening failed.', 'info');
    } finally {
      setBulkRunning(false);
    }
  }

  const selectedJobLabel = selectedJob?.title || (selectedJobId ? `Job ${selectedJobId.slice(0, 6)}` : 'Select a job');
  const screeningLabel = currentScreening ? `Updated ${currentScreening.updatedAt || currentScreening.createdAt || 'recently'}` : 'No screening for this job yet';

  return (
    <AppShell
      activeSidebar="dashboard"
      navLinks={<div className="nav-link active">Dashboard</div>}
      actions={
        <button className="btn btn-ghost btn-sm" type="button" onClick={async () => { await logout(); window.location.assign('/'); }}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>logout</span>
          Logout
        </button>
      }
    >
      <div className="dash-page-header">
        <div>
          <div className="dash-greeting">Good morning, {user?.fullName?.split(' ')[0] || 'Recruiter'}</div>
          <div className="dash-subtitle">Snapshot-driven view of jobs, candidates, and the latest screening flow.</div>
        </div>

        <div className="dash-toolbar">
          <div className="dash-toolbar-group">
            <label className="dash-toolbar-label" htmlFor="dashboard-job-select">Active job</label>
            <select
              id="dashboard-job-select"
              className="dash-job-select"
              value={selectedJobId || selectedJob?.id || ''}
              onChange={(event) => void handleJobChange(event.target.value)}
              disabled={loading || !snapshot.jobs.length}
            >
              {snapshot.jobs.length ? (
                snapshot.jobs.map((job) => (
                  <option key={String(job.id)} value={String(job.id)}>
                    {job.title} {job.company ? `- ${job.company}` : ''}
                  </option>
                ))
              ) : (
                <option value="">No jobs available</option>
              )}
            </select>
          </div>

          <button className="btn btn-ghost btn-sm" type="button" onClick={() => void refreshDashboard(selectedJobId || selectedJob?.id || undefined)} disabled={refreshing || loading}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>refresh</span>
            {refreshing ? 'Refreshing' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="dash-stats-grid">
        {[
          { key: 'activeJobs', label: 'Active Jobs', value: summary.activeJobs, delta: 'From snapshot' },
          { key: 'totalApplicants', label: 'Total Applicants', value: summary.totalApplicants, delta: 'Candidate pool' },
          { key: 'aiScreened', label: 'AI Screened', value: summary.aiScreened, delta: selectedJobLabel },
          { key: 'shortlisted', label: 'Shortlisted', value: summary.shortlisted, delta: 'Top ranked shortlist' },
          { key: 'incomplete', label: 'Incomplete CVs', value: summary.incomplete, delta: 'Manual review needed' }
        ].map((stat) => (
          <div className="dash-stat-card" key={stat.key}>
            <div className="dash-stat-icon" style={{ background: statBg[stat.key], color: statColors[stat.key] }}>
              <span className="material-symbols-outlined">{statIcons[stat.key]}</span>
            </div>
            <div className="dash-stat-body">
              <div className="dash-stat-value" style={{ color: statColors[stat.key] }}>{stat.value}</div>
              <div className="dash-stat-label">{stat.label}</div>
              <div className="dash-stat-delta">{stat.delta}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="dash-grid-two">
        <div className="dash-card">
          <div className="dash-card-header">
            <div className="dash-card-title">
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--primary)' }}>work</span>
              Job Summary
            </div>
            <Link className="btn btn-ghost btn-sm" href="/jobs">Manage jobs</Link>
          </div>
          <div className="dash-card-body">
            {snapshot.jobs.length ? (
              <div className="dash-job-list">
                {snapshot.jobs.map((job) => {
                  const shortlistedCount = Array.isArray(job.shortlistedCandidates) ? job.shortlistedCandidates.length : 0;
                  const isActive = String(job.id) === String(selectedJobId || selectedJob?.id || '');
                  return (
                    <button
                      key={String(job.id)}
                      type="button"
                      className={`dash-job-row ${isActive ? 'active' : ''}`}
                      onClick={() => void handleJobChange(String(job.id))}
                    >
                      <div className="dash-job-main">
                        <div className="dash-job-topline">
                          <strong>{job.title}</strong>
                          <span className={`badge badge-${job.status === 'active' ? 'active' : job.status === 'closed' ? 'closed' : 'pending'}`}>
                            {(job.status || 'draft').charAt(0).toUpperCase() + (job.status || 'draft').slice(1)}
                          </span>
                        </div>
                        <div className="dash-job-meta">
                          <span>{job.company || 'Umurava'}</span>
                          <span>{job.department || 'General'}</span>
                          <span>{job.location || 'Remote'}</span>
                        </div>
                        <div className="dash-job-submeta">
                          <span>{job.shortlistSize || 0} target shortlist</span>
                          <span>{shortlistedCount} shortlisted now</span>
                        </div>
                        {job.requiredSkills?.length ? (
                          <div className="dash-job-tags">
                            {job.requiredSkills.slice(0, 5).map((skill) => (
                              <span className="dash-job-tag" key={`${job.id}-${skill}`}>{skill}</span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="dash-empty-state">No jobs yet. Create a job to populate the dashboard.</div>
            )}
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-header">
            <div className="dash-card-title">
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--green)' }}>psychology</span>
              Candidate Pipeline
            </div>
            <span className="dash-card-micro">{screeningLabel}</span>
          </div>
          <div className="dash-card-body">
            <div className="dash-summary-grid">
              {pipeline.map((item) => (
                <div className="dash-summary-chip" key={item.key}>
                  <div className="dash-summary-value">{item.value}</div>
                  <div className="dash-summary-label">{item.label}</div>
                  <div className="dash-summary-hint">{item.hint}</div>
                </div>
              ))}
            </div>

            <div className="dash-pipeline-note">
              <strong>{summary.averageScore ? `${summary.averageScore.toFixed(1)} average score` : 'No score yet'}</strong>
              <span>{currentScreening?.generatedBy ? `Generated by ${currentScreening.generatedBy}` : 'Run screening for the selected job to populate this panel.'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="dash-grid-two">
        <div className="dash-card">
          <div className="dash-card-header">
            <div className="dash-card-title">
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--primary)' }}>emoji_events</span>
              Shortlisted Candidates
            </div>
            <Link className="btn btn-ghost btn-sm" href="/shortlist">Open shortlist</Link>
          </div>
          <div className="dash-card-body">
            {shortlistedRows.length ? (
              <div className="dash-result-list">
                {shortlistedRows.map((result) => {
                  const candidate = candidateLookup[String(result.candidateId)];
                  return (
                    <div className="dash-result-row" key={result.candidateId}>
                      <div className="dash-result-avatar">{candidateInitials(candidate)}</div>
                      <div className="dash-result-main">
                        <div className="dash-result-topline">
                          <strong>{candidateName(candidate)}</strong>
                          <span className="dash-result-score">{result.score}/100</span>
                        </div>
                        <div className="dash-result-meta">
                          <span>{candidate?.personalInfo.headline || 'Candidate'}</span>
                          <span>Rank #{result.rank || '-'}</span>
                          <span className="dash-result-status">{result.decision}</span>
                        </div>
                        <div className="dash-result-strengths">
                          {(result.strengths || []).slice(0, 3).map((strength) => (
                            <span key={strength}>{strength}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="dash-empty-state">
                {currentScreening ? 'No shortlisted candidates yet for this screening.' : 'Run a screening to populate shortlisted candidates.'}
              </div>
            )}
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-header">
            <div className="dash-card-title">
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--red)' }}>error</span>
              Incomplete Candidates
            </div>
            <span className="dash-card-micro">{incompleteCandidates.length} flagged</span>
          </div>
          <div className="dash-card-body">
            {incompleteCandidates.length ? (
              <div className="dash-incomplete-list">
                {incompleteCandidates.map((item) => {
                  const candidate = candidateLookup[String(item.candidateId)];
                  return (
                    <div className="dash-incomplete-row" key={item.candidateId}>
                      <div className="dash-result-avatar dash-result-avatar-warn">{candidateInitials(candidate)}</div>
                      <div className="dash-incomplete-main">
                        <strong>{candidateName(candidate)}</strong>
                        <span>{item.reason}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="dash-empty-state">
                {currentScreening ? 'No incomplete candidates were returned for this screening.' : 'Incomplete candidates will appear here after screening.'}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="dash-grid-two">
        <div className="dash-card">
          <div className="dash-card-header">
            <div className="dash-card-title">
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--primary)' }}>upload_file</span>
              Upload and Screening Actions
            </div>
            <Link className="btn btn-ghost btn-sm" href="/external">Bulk CV Upload</Link>
          </div>
          <div className="dash-card-body dash-action-stack">
            <div className="dash-action-row">
              <div>
                <div className="dash-action-title">Run Screening</div>
                <div className="dash-action-copy">Score the current candidate pool against the selected job.</div>
              </div>
              <button className="btn btn-primary btn-sm" type="button" onClick={() => void handleRunScreening()} disabled={running || loading || !snapshot.jobs.length}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>smart_toy</span>
                {running ? 'Running' : 'Run Screening'}
              </button>
            </div>

            <div className="dash-action-row dash-action-row-compact">
              <div>
                <div className="dash-action-title">Bulk Upload and Screen</div>
                <div className="dash-action-copy">Upload multiple PDF resumes and immediately run screening for the selected job.</div>
              </div>
              <div className="dash-action-buttons">
                <input
                  ref={bulkInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  multiple
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    const files = Array.from(event.target.files || []).filter((file) => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'));
                    setBulkFiles(files);
                  }}
                  style={{ display: 'none' }}
                />
                <button className="btn btn-ghost btn-sm" type="button" onClick={() => bulkInputRef.current?.click()} disabled={bulkRunning || loading}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>folder_open</span>
                  Pick PDFs
                </button>
                <button className="btn btn-primary btn-sm" type="button" onClick={() => void handleBulkUploadAndScreen()} disabled={bulkRunning || loading || !bulkFiles.length}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>cloud_upload</span>
                  {bulkRunning ? 'Processing' : 'Upload and Screen'}
                </button>
              </div>
            </div>

            <div className="dash-upload-files">
              {bulkFiles.length ? (
                bulkFiles.map((file) => (
                  <div className="dash-upload-file" key={`${file.name}-${file.size}`}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>picture_as_pdf</span>
                    <span>{file.name}</span>
                  </div>
                ))
              ) : (
                <div className="dash-empty-state">No PDF files selected yet.</div>
              )}
            </div>
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-header">
            <div className="dash-card-title">
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--primary)' }}>list_alt</span>
              Latest Screening Summary
            </div>
            <span className="dash-card-micro">{selectedJobLabel}</span>
          </div>
          <div className="dash-card-body">
            {currentScreening ? (
              <div className="dash-screening-summary">
                <div className="dash-screening-summary-top">
                  <div>
                    <div className="dash-screening-summary-label">Summary</div>
                    <div className="dash-screening-summary-text">{currentScreening.summary || 'Screening completed successfully.'}</div>
                  </div>
                  <div className="dash-screening-scorebox">
                    <strong>{currentScreening.averageScore.toFixed(1)}</strong>
                    <span>Avg score</span>
                  </div>
                </div>
                <div className="dash-screening-summary-grid">
                  <div>
                    <span>Total candidates</span>
                    <strong>{currentScreening.totalCandidates}</strong>
                  </div>
                  <div>
                    <span>Shortlisted</span>
                    <strong>{currentScreening.shortlistedCount}</strong>
                  </div>
                  <div>
                    <span>Incomplete</span>
                    <strong>{currentScreening.incompleteCandidates.length}</strong>
                  </div>
                </div>
                <div className="dash-screening-summary-meta">
                  <span>Job ID: {currentScreening.jobId}</span>
                  <span>Engine: {currentScreening.generatedBy || 'API'}</span>
                  <span>{screeningLabel}</span>
                </div>
              </div>
            ) : (
              <div className="dash-empty-state">
                {selectedJobId ? 'No screening has been generated for this job yet.' : 'Select a job to view its latest screening.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
