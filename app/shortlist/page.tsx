'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { AppShell } from '@/components/app-shell';
import { showToast } from '@/lib/toast';
import { umuravaStore, type ScreeningResult } from '@/lib/umurava-store';

export default function ShortlistPage() {
  const [results, setResults] = useState<ScreeningResult[]>([]);
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [shortlistSize, setShortlistSize] = useState(umuravaStore.getCurrentShortlistSize());
  const [summary, setSummary] = useState({
    totalCandidates: 0,
    shortlistedCount: 0,
    averageScore: 0,
    incompleteCount: 0,
    incompleteCandidates: [] as Array<{ candidateId: string | number; reason: string }>
  });

  useEffect(() => {
    const latest = umuravaStore.getLatestScreening() || umuravaStore.runScreening(undefined, { shortlistSize: umuravaStore.getCurrentShortlistSize() });
    setResults(latest.results || []);
    setShortlistSize(latest.shortlistSize);
    setSummary({
      totalCandidates: latest.totalCandidates,
      shortlistedCount: latest.shortlistedCount,
      averageScore: latest.averageScore,
      incompleteCount: latest.incompleteCount,
      incompleteCandidates: latest.incompleteCandidates
    });
  }, []);

  const visible = useMemo(() => results.slice(0, shortlistSize), [results, shortlistSize]);
  const exportResults = () => {
    const escapeHtml = (value: unknown) =>
      String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

    const rows = visible
      .map(
        (candidate, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${escapeHtml(candidate.personalInfo.firstName)} ${escapeHtml(candidate.personalInfo.lastName)}</td>
        <td>${escapeHtml(candidate.personalInfo.email)}</td>
        <td>${escapeHtml(candidate.personalInfo.headline)}</td>
        <td>${escapeHtml(candidate.personalInfo.location)}</td>
        <td>${escapeHtml(candidate.score)}</td>
        <td>${escapeHtml((candidate.strengths || []).join(' | '))}</td>
        <td>${escapeHtml((candidate.gaps || []).join(' | ') || 'None')}</td>
        <td>${escapeHtml(candidate.reasoning || '')}</td>
      </tr>`
      )
      .join('');

    const exportHtml = `
      <html>
        <head>
          <meta charset="UTF-8" />
          <style>
            body { font-family: Arial, sans-serif; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; vertical-align: top; }
            th { background: #e2e8f0; }
          </style>
        </head>
        <body>
          <h2>Umurava AI Shortlist</h2>
          <p>Job: Senior Backend Engineer</p>
          <p>Total candidates: ${escapeHtml(summary.totalCandidates)} | Shortlist size: ${escapeHtml(shortlistSize)}</p>
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Name</th>
                <th>Email</th>
                <th>Headline</th>
                <th>Location</th>
                <th>Score</th>
                <th>Strengths</th>
                <th>Gaps</th>
                <th>Reasoning</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </body>
      </html>`;
    const dataStr = 'data:application/vnd.ms-excel;charset=utf-8,' + encodeURIComponent(exportHtml);
    const anchor = document.createElement('a');
    anchor.setAttribute('href', dataStr);
    anchor.setAttribute('download', `umurava-shortlist-${new Date().toISOString().split('T')[0]}.xls`);
    anchor.click();
    showToast('Shortlist exported to Excel format.', 'success');
  };

  return (
    <AppShell
      activeSidebar="shortlist"
      navLinks={<div className="nav-link active">AI Shortlists</div>}
      actions={
        <button className="btn btn-primary btn-sm" onClick={exportResults} type="button">
          <span className="material-symbols-outlined">download</span> Export Excel
        </button>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 11, fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text-muted)', marginBottom: 6 }}>Total Screened</div>
          <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-.02em' }}>{summary.totalCandidates}</div>
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 11, fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text-muted)', marginBottom: 6 }}>Shortlisted</div>
          <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-.02em', color: 'var(--primary)' }}>{summary.shortlistedCount}</div>
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 11, fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text-muted)', marginBottom: 6 }}>Avg AI Score</div>
          <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-.02em', color: 'var(--green)' }}>{summary.averageScore}</div>
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, cursor: 'pointer' }} onClick={() => showToast('Use the incomplete CV count to review skipped candidates.', 'info')}>
          <div style={{ fontSize: 11, fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text-muted)', marginBottom: 6 }}>Incomplete CVs</div>
          <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-.02em', color: '#D97706' }}>{summary.incompleteCount}</div>
        </div>
      </div>

      <div id="incomplete-banner" style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 18px', background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: 10, marginBottom: 20 }}>
        <span className="material-symbols-outlined" style={{ color: '#D97706', flexShrink: 0, marginTop: 1 }}>
          warning
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#92400E', marginBottom: 2 }}>{summary.incompleteCount} resumes were incomplete or poorly formatted</div>
          <div style={{ fontSize: 12, color: '#92400E', lineHeight: 1.5 }}>
            These candidates were skipped from the shortlist and require manual review:{' '}
            <span style={{ fontFamily: 'DM Mono, monospace' }}>{summary.incompleteCandidates.map((item) => `#${item.candidateId}`).join(', ') || 'None'}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 0 3px rgba(22,163,74,.2)' }} />
        <span style={{ fontSize: 12, fontFamily: 'DM Mono, monospace', color: 'var(--text-muted)' }}>Gemini 2.5 Pro · Screened April 16, 2026 · Weighted scoring active</span>
      </div>

      <div className="shortlist-header">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div className="section-label" style={{ marginBottom: 8 }}>
              AI Screening Results (Human Review Required)
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Senior Backend Engineer</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Active shortlist from the current candidate pool · Screened via Gemini AI · April 16, 2026</div>
          </div>
          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
            <select
              value={shortlistSize}
              onChange={(event) => {
                const value = Number(event.target.value);
                setShortlistSize(value);
                umuravaStore.setShortlistSize(value);
                const latest = umuravaStore.runScreening(undefined, { shortlistSize: value });
                setResults(latest.results);
                setSummary({
                  totalCandidates: latest.totalCandidates,
                  shortlistedCount: latest.shortlistedCount,
                  averageScore: latest.averageScore,
                  incompleteCount: latest.incompleteCount,
                  incompleteCandidates: latest.incompleteCandidates
                });
              }}
              style={{ padding: '8px 12px', fontSize: 12, borderRadius: 8, border: '1px solid var(--border2)', background: 'var(--surface)' }}
            >
              <option value="10">Top 10</option>
              <option value="20">Top 20</option>
            </select>
            <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--primary)', fontFamily: 'DM Mono, monospace' }}>{shortlistSize}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>SHORTLISTED</div>
          </div>
        </div>
      </div>

      <div className="table-card">
        <div className="table-header">
          <div className="table-title">Ranked Candidates</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Click a candidate row to view AI reasoning</div>
        </div>
        <div>
          {visible.map((candidate, index) => (
            <div key={candidate.id} className="result-row" onClick={() => setSelectedId(candidate.id)}>
              <div className={`rank-badge rank-${index < 3 ? index + 1 : 'other'}`}>{index + 1}</div>
              <div className="result-info">
                <div className="result-name">
                  {candidate.personalInfo.firstName} {candidate.personalInfo.lastName}
                </div>
                <div className="result-role">
                  {candidate.personalInfo.headline} · {candidate.personalInfo.location}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginRight: 16, flexWrap: 'wrap' }}>
                {candidate.skills.slice(0, 3).map((skill) => (
                  <span className="skill-pill" key={`${candidate.id}-${skill.name}`}>
                    {skill.name}
                  </span>
                ))}
              </div>
              <div className="score-bar-wrap">
                <div className="score-num">{candidate.score}</div>
                <div className="score-bar">
                  <div className="score-fill" style={{ width: `${candidate.score}%`, background: candidate.score >= 85 ? 'var(--green)' : candidate.score >= 70 ? 'var(--primary)' : 'var(--red)' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, marginLeft: 8 }} onClick={(event) => event.stopPropagation()}>
                <Link className="btn btn-ghost btn-sm" href="/profile" onClick={() => window.localStorage.setItem('umurava.selectedProfileId', String(candidate.id))}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                    visibility
                  </span>{' '}
                  Profile
                </Link>
                <button className="btn btn-success btn-sm" onClick={() => umuravaStore.markInterview(candidate.id)} type="button">
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                    check
                  </span>{' '}
                  {candidate.workflowStatus === 'interview' ? 'Sent' : 'Interview'}
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => umuravaStore.markRejected(candidate.id)} type="button">
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                    close
                  </span>{' '}
                  {candidate.workflowStatus === 'rejected' ? 'Rejected' : 'Reject'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedId ? (
        <div id="reasoning-container">
          {(() => {
            const candidate = results.find((item) => String(item.id) === String(selectedId));
            if (!candidate) return null;
            const breakdown = candidate.scoreBreakdown || { skills: 0, experience: 0, education: 0, projects: 0, certifications: 0 };
            return (
              <div className="reasoning-panel open">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>
                    AI Reasoning - {candidate.personalInfo.firstName} {candidate.personalInfo.lastName}
                  </div>
                  <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 24, fontWeight: 800, color: 'var(--primary)' }}>{candidate.score}/100</div>
                </div>
                <div className="score-breakdown">
                  {Object.entries(breakdown).map(([key, value]) => (
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
                <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                  <Link className="btn btn-ghost btn-sm" href="/profile" onClick={() => window.localStorage.setItem('umurava.selectedProfileId', String(candidate.id))}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                      visibility
                    </span>{' '}
                    Full Profile
                  </Link>
                </div>
              </div>
            );
          })()}
        </div>
      ) : null}
    </AppShell>
  );
}
