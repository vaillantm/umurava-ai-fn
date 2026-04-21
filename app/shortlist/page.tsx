'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { AppShell } from '@/components/app-shell';
import { exportScreening, getLatestScreening, listCandidates, runScreening, type ScreeningRecord } from '@/lib/backend';
import { showToast } from '@/lib/toast';

export default function ShortlistPage() {
  const [screening, setScreening] = useState<ScreeningRecord | null>(null);
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [shortlistSize, setShortlistSize] = useState(20);
  const [candidateNames, setCandidateNames] = useState<Record<string, string>>({});

  useEffect(() => {
    let alive = true;
    Promise.all([getLatestScreening(), listCandidates()]).then(([latest, candidates]) => {
      if (!alive) return;
      setScreening(latest);
      setShortlistSize(latest?.shortlistedCount || 20);
      setSelectedId(latest?.results?.[0]?.candidateId || null);
      setCandidateNames(
        candidates.reduce<Record<string, string>>((map, candidate) => {
          map[String(candidate.id)] = `${candidate.personalInfo.firstName} ${candidate.personalInfo.lastName}`.trim();
          return map;
        }, {})
      );
    });
    return () => {
      alive = false;
    };
  }, []);

  const visible = useMemo(() => (screening?.results || []).slice(0, shortlistSize), [screening, shortlistSize]);
  const summary = screening || {
    totalCandidates: 0,
    shortlistedCount: 0,
    averageScore: 0,
    incompleteCandidates: []
  };

  async function refreshScreening(nextSize = shortlistSize) {
    const candidates = await listCandidates();
    const result = await runScreening({
      jobId: screening?.jobId || 'active-job',
      candidateIds: candidates.map((candidate) => String(candidate.id || '')),
      shortlistSize: nextSize
    });
    const latest = await getLatestScreening(screening?.jobId);
    setScreening(
      latest || {
        id: `screen-${Date.now()}`,
        jobId: result.jobId,
        results: result.results,
        incompleteCandidates: result.incompleteCandidates,
        summary: result.summary,
        totalCandidates: result.totalCandidates,
        shortlistedCount: result.shortlistedCount,
        averageScore: result.averageScore,
        generatedBy: 'API',
        createdAt: new Date().toISOString()
      }
    );
    setShortlistSize(nextSize);
    setSelectedId(latest?.results?.[0]?.candidateId || result.results?.[0]?.candidateId || null);
  }

  async function handleExport() {
    if (!screening?.id) {
      showToast('Run a screening first to export results.', 'info');
      return;
    }

    try {
      const exportData = await exportScreening(screening.id);
      const payload = JSON.stringify(exportData, null, 2);
      const blob = new Blob([payload], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `umurava-shortlist-${new Date().toISOString().split('T')[0]}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
      showToast('Shortlist exported as JSON.', 'success');
    } catch {
      showToast('Could not export the shortlist.', 'info');
    }
  }

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

      <div className="shortlist-banner">
        <span className="material-symbols-outlined">info</span>
        <div>
          <strong>{summary.incompleteCandidates.length} resumes were incomplete or poorly formatted</strong>
          <p>
            These candidates were skipped from the shortlist and require manual review:{' '}
            <span style={{ fontFamily: 'DM Mono, monospace' }}>{summary.incompleteCandidates.map((item) => `#${item.candidateId}`).join(', ') || 'None'}</span>
          </p>
        </div>
      </div>

      <div className="shortlist-toolbar">
        <div className="shortlist-status">
          <div className="shortlist-dot" />
          <span>Screening synced from backend or local fallback</span>
        </div>
        <div className="shortlist-controls">
          <select
            value={shortlistSize}
            onChange={async (event) => {
              const value = Number(event.target.value);
              await refreshScreening(value);
            }}
          >
            <option value="10">Top 10</option>
            <option value="20">Top 20</option>
            <option value="30">Top 30</option>
          </select>
          <button className="btn btn-ghost btn-sm" onClick={() => refreshScreening(shortlistSize)} type="button">
            Refresh
          </button>
        </div>
      </div>

      <div className="shortlist-header">
        <div>
          <div className="section-label" style={{ marginBottom: 8 }}>
            AI Screening Results
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Shortlisted Candidates</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{screening ? `Screened via ${screening.generatedBy || 'API'}` : 'No screening data available yet.'}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--primary)', fontFamily: 'DM Mono, monospace' }}>{shortlistSize}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>SHORTLISTED</div>
        </div>
      </div>

      <div className="table-card">
        <div className="table-header">
          <div className="table-title">Ranked Candidates</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Click a candidate row to view AI reasoning</div>
        </div>
        <div>
          {visible.map((candidate, index) => {
            const profile = candidateNames[String(candidate.candidateId)] || candidate.candidateId;
            return (
              <div key={candidate.candidateId} className="result-row" onClick={() => setSelectedId(candidate.candidateId)}>
                <div className={`rank-badge rank-${index < 3 ? index + 1 : 'other'}`}>{index + 1}</div>
                <div className="result-info">
                  <div className="result-name">{profile}</div>
                  <div className="result-role">Ranked candidate</div>
                </div>
                <div className="score-bar-wrap">
                  <div className="score-num">{candidate.score}</div>
                  <div className="score-bar">
                    <div className="score-fill" style={{ width: `${candidate.score}%`, background: candidate.score >= 85 ? 'var(--green)' : candidate.score >= 70 ? 'var(--primary)' : 'var(--red)' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, marginLeft: 8 }}>
                  <Link className="btn btn-ghost btn-sm" href="/profile" onClick={() => window.localStorage.setItem('umurava.selectedProfileId', String(candidate.candidateId))}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                      visibility
                    </span>{' '}
                    Profile
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedId && screening ? (
        <div id="reasoning-container">
          {(() => {
            const candidate = screening.results.find((item) => String(item.candidateId) === String(selectedId));
            if (!candidate) return null;
            return (
              <div className="reasoning-panel open">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>AI Reasoning</div>
                  <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 24, fontWeight: 800, color: 'var(--primary)' }}>{candidate.score}/100</div>
                </div>
                <div className="score-breakdown">
                  {Object.entries(candidate.scoreBreakdown || {}).map(([key, value]) => (
                    <div className="score-dim" key={key}>
                      <div className="score-dim-val">{value}</div>
                      <div className="score-dim-label">{key.charAt(0).toUpperCase() + key.slice(1)}</div>
                    </div>
                  ))}
                </div>
                <div className="reasoning-section" style={{ marginTop: 20 }}>
                  <div className="reasoning-section-title">Summary</div>
                  <div className="reasoning-text">{candidate.reasoning}</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <div className="reasoning-section">
                    <div className="reasoning-section-title">Strengths</div>
                    <ul className="strengths-list">
                      {(candidate.strengths || []).map((strength) => (
                        <li key={strength}>
                          <span className="material-symbols-outlined icon-bullet">check_circle</span> {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="reasoning-section">
                    <div className="reasoning-section-title">Gaps</div>
                    <ul className="gaps-list">
                      {(candidate.gaps || []).map((gap) => (
                        <li key={gap}>
                          <span className="material-symbols-outlined icon-bullet">error</span> {gap}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      ) : null}
    </AppShell>
  );
}
