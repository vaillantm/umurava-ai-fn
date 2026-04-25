'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { AppShell } from '@/components/app-shell';
import {
  exportScreening,
  getLatestScreening,
  listCandidates,
  listJobs,
  runScreening,
  type CandidateRecord,
  type JobRecord,
  type ScreeningRecord
} from '@/lib/backend';
import { showToast } from '@/lib/toast';

export default function ShortlistPage() {
  const [screening, setScreening] = useState<ScreeningRecord | null>(null);
  const [jobs, setJobs] = useState<JobRecord[]>([]);
  const [candidates, setCandidates] = useState<CandidateRecord[]>([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [shortlistSize, setShortlistSize] = useState(20);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    Promise.all([getLatestScreening(), listJobs(), listCandidates()]).then(([latest, jobItems, candidateItems]) => {
      if (!alive) return;
      setScreening(latest);
      setJobs(jobItems);
      setCandidates(candidateItems);
      setLoading(false);

      // Pre-select the job from the latest screening, or the first active job
      const jobId = latest?.jobId || jobItems.find((j) => j.status === 'active')?.id || jobItems[0]?.id || '';
      setSelectedJobId(jobId);
      setShortlistSize(latest?.shortlistedCount || 20);
      setSelectedId(latest?.results?.[0]?.candidateId ?? null);
    });
    return () => { alive = false; };
  }, []);

  const candidateMap = useMemo(() =>
    candidates.reduce<Record<string, CandidateRecord>>((map, c) => {
      map[String(c.id)] = c;
      return map;
    }, {}),
    [candidates]
  );

  const visible = useMemo(
    () => (screening?.results || []).slice(0, shortlistSize),
    [screening, shortlistSize]
  );

  const summary = {
    totalCandidates: screening?.totalCandidates ?? 0,
    shortlistedCount: screening?.shortlistedCount ?? 0,
    averageScore: screening?.averageScore ?? 0,
    incompleteCandidates: screening?.incompleteCandidates ?? []
  };

  async function runNewScreening(jobId: string, size: number) {
    if (!jobId) {
      showToast('Select a job before running a screening.', 'info');
      return;
    }
    setRunning(true);
    try {
      const result = await runScreening({
        jobId,
        candidateIds: candidates.map((c) => String(c.id || '')),
        shortlistSize: size
      });
      // Fetch the persisted screening from the API
      const latest = await getLatestScreening(jobId);
      setScreening(
        latest ?? {
          id: `screen-${Date.now()}`,
          jobId: result.jobId,
          results: result.results,
          incompleteCandidates: result.incompleteCandidates,
          summary: result.summary,
          totalCandidates: result.totalCandidates,
          shortlistedCount: result.shortlistedCount,
          averageScore: result.averageScore,
          createdAt: new Date().toISOString()
        }
      );
      setShortlistSize(size);
      setSelectedId(result.results?.[0]?.candidateId ?? null);
      showToast(`Screening complete. ${result.shortlistedCount} candidates shortlisted.`, 'success');
    } catch {
      showToast('Screening failed. Please try again.', 'info');
    } finally {
      setRunning(false);
    }
  }

  async function handleExport() {
    if (!screening?.id) {
      showToast('Run a screening first to export results.', 'info');
      return;
    }
    try {
      const data = await exportScreening(screening.id);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `umurava-shortlist-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Shortlist exported as JSON.', 'success');
    } catch {
      showToast('Could not export the shortlist.', 'info');
    }
  }

  const selectedJob = jobs.find((j) => j.id === selectedJobId);

  return (
    <AppShell
      activeSidebar="shortlist"
      navLinks={<div className="nav-link active">AI Shortlists</div>}
      actions={
        <button className="btn btn-primary btn-sm" onClick={handleExport} type="button">
          <span className="material-symbols-outlined">download</span> Export JSON
        </button>
      }
    >
      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
          Loading screening data...
        </div>
      ) : (
        <>
          <div className="shortlist-metrics">
            <div className="shortlist-metric">
              <div className="shortlist-metric-label">Total Screened</div>
              <div className="shortlist-metric-value">{summary.totalCandidates}</div>
            </div>
            <div className="shortlist-metric">
              <div className="shortlist-metric-label">Shortlisted</div>
              <div className="shortlist-metric-value shortlist-accent">{summary.shortlistedCount}</div>
            </div>
            <div className="shortlist-metric">
              <div className="shortlist-metric-label">Avg AI Score</div>
              <div className="shortlist-metric-value shortlist-green">{summary.averageScore}</div>
            </div>
            <div className="shortlist-metric">
              <div className="shortlist-metric-label">Incomplete CVs</div>
              <div className="shortlist-metric-value shortlist-warn">{summary.incompleteCandidates.length}</div>
            </div>
          </div>

          {summary.incompleteCandidates.length > 0 && (
            <div className="shortlist-banner">
              <span className="material-symbols-outlined">info</span>
              <div>
                <strong>{summary.incompleteCandidates.length} resumes were incomplete or poorly formatted</strong>
                <p>
                  These candidates were skipped and require manual review:{' '}
                  <span style={{ fontFamily: 'DM Mono, monospace' }}>
                    {summary.incompleteCandidates.map((item) => `#${item.candidateId}`).join(', ')}
                  </span>
                </p>
              </div>
            </div>
          )}

          <div className="shortlist-toolbar">
            <div className="shortlist-status">
              <div className="shortlist-dot" />
              <span>
                {screening
                  ? `Last screened: ${new Date(screening.createdAt || '').toLocaleDateString()} · ${selectedJob?.title || screening.jobId}`
                  : 'No screening run yet'}
              </span>
            </div>
            <div className="shortlist-controls">
              {jobs.length > 0 && (
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  disabled={running}
                >
                  {jobs.map((job) => (
                    <option key={job.id} value={job.id || ''}>
                      {job.title} ({job.status})
                    </option>
                  ))}
                </select>
              )}
              <select
                value={shortlistSize}
                onChange={(e) => setShortlistSize(Number(e.target.value))}
                disabled={running}
              >
                <option value={10}>Top 10</option>
                <option value={20}>Top 20</option>
                <option value={30}>Top 30</option>
              </select>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => runNewScreening(selectedJobId, shortlistSize)}
                disabled={running || candidates.length === 0}
                type="button"
              >
                {running ? 'Running...' : 'Run Screening'}
              </button>
            </div>
          </div>

          <div className="shortlist-header">
            <div>
              <div className="section-label" style={{ marginBottom: 8 }}>AI Screening Results</div>
              <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Shortlisted Candidates</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                {screening
                  ? `Job: ${selectedJob?.title || screening.jobId} · Screened via ${screening.generatedBy || 'Gemini AI'}`
                  : 'No screening data available. Select a job and run a screening.'}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--primary)', fontFamily: 'DM Mono, monospace' }}>
                {visible.length}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>SHORTLISTED</div>
            </div>
          </div>

          {visible.length === 0 ? (
            <div className="table-card">
              <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                {candidates.length === 0
                  ? 'No candidates in the pool. Upload candidates first.'
                  : jobs.length === 0
                    ? 'No jobs found. Create a job posting first.'
                    : 'No screening results yet. Select a job and click "Run Screening".'}
              </div>
            </div>
          ) : (
            <div className="table-card">
              <div className="table-header">
                <div className="table-title">Ranked Candidates</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Click a row to view AI reasoning</div>
              </div>
              {visible.map((result, index) => {
                const record = candidateMap[String(result.candidateId)];
                const name = record
                  ? `${record.personalInfo.firstName} ${record.personalInfo.lastName}`.trim()
                  : `Candidate #${result.candidateId}`;
                const role = record?.personalInfo.headline || 'Candidate';
                const decisionColor = result.decision === 'shortlisted' ? 'var(--green)' : result.decision === 'review' ? 'var(--primary)' : 'var(--text-muted)';

                return (
                  <div
                    key={result.candidateId}
                    className="result-row"
                    onClick={() => setSelectedId(String(result.candidateId) === String(selectedId) ? null : String(result.candidateId))}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className={`rank-badge rank-${index < 3 ? index + 1 : 'other'}`}>{index + 1}</div>
                    <div className="result-info">
                      <div className="result-name">{name}</div>
                      <div className="result-role">{role}</div>
                    </div>
                    <span className="badge" style={{ background: 'transparent', border: `1px solid ${decisionColor}`, color: decisionColor, fontSize: 11 }}>
                      {result.decision}
                    </span>
                    <div className="score-bar-wrap">
                      <div className="score-num">{result.score}</div>
                      <div className="score-bar">
                        <div
                          className="score-fill"
                          style={{
                            width: `${result.score}%`,
                            background: result.score >= 85 ? 'var(--green)' : result.score >= 70 ? 'var(--primary)' : 'var(--red)'
                          }}
                        />
                      </div>
                    </div>
                    <Link
                      className="btn btn-ghost btn-sm"
                      href="/profile"
                      onClick={() => window.localStorage.setItem('umurava.selectedProfileId', String(result.candidateId))}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>visibility</span>
                      Profile
                    </Link>
                  </div>
                );
              })}
            </div>
          )}

          {selectedId && screening && (() => {
            const result = screening.results.find((r) => String(r.candidateId) === String(selectedId));
            if (!result) return null;
            const record = candidateMap[String(result.candidateId)];
            const name = record
              ? `${record.personalInfo.firstName} ${record.personalInfo.lastName}`.trim()
              : `Candidate #${result.candidateId}`;
            return (
              <div className="reasoning-panel open" style={{ marginTop: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>AI Reasoning — {name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Rank #{result.rank}</div>
                  </div>
                  <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 28, fontWeight: 800, color: 'var(--primary)' }}>
                    {result.score}<span style={{ fontSize: 14, opacity: 0.5 }}>/100</span>
                  </div>
                </div>

                {Object.keys(result.scoreBreakdown || {}).length > 0 && (
                  <div className="score-breakdown">
                    {Object.entries(result.scoreBreakdown).map(([key, value]) => (
                      <div className="score-dim" key={key}>
                        <div className="score-dim-val">{value}</div>
                        <div className="score-dim-label">{key.charAt(0).toUpperCase() + key.slice(1)}</div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="reasoning-section" style={{ marginTop: 20 }}>
                  <div className="reasoning-section-title">Summary</div>
                  <div className="reasoning-text">{result.reasoning}</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <div className="reasoning-section">
                    <div className="reasoning-section-title">Strengths</div>
                    <ul className="strengths-list">
                      {(result.strengths || []).map((s) => (
                        <li key={s}>
                          <span className="material-symbols-outlined icon-bullet">check_circle</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="reasoning-section">
                    <div className="reasoning-section-title">Gaps</div>
                    <ul className="gaps-list">
                      {(result.gaps || []).map((g) => (
                        <li key={g}>
                          <span className="material-symbols-outlined icon-bullet">error</span> {g}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })()}
        </>
      )}
    </AppShell>
  );
}
