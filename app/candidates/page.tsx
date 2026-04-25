'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { runScreening, listCandidates, listJobs, type CandidateRecord, type ScreeningResult } from '@/lib/api';
import { showToast } from '@/lib/toast';

const steps = ['Parse and normalize resumes', 'Extract structured profile data', 'Run AI scoring', 'Rank and create shortlist', 'Generate explanations'];

export default function CandidatesPage() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<CandidateRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [screeningOpen, setScreeningOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(-1);
  const [complete, setComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const [screeningResults, setScreeningResults] = useState<ScreeningResult[]>([]);
  const [activeJobId, setActiveJobId] = useState<string>('');
  const [jobOptions, setJobOptions] = useState<Array<{ id: string; title: string }>>([]);

  useEffect(() => {
    let alive = true;
    Promise.all([listCandidates(), listJobs()]).then(([candidateItems, jobItems]) => {
      if (!alive) return;
      setCandidates(candidateItems);
      setJobOptions(jobItems.map((job) => ({ id: String(job.id || ''), title: job.title })));
      setActiveJobId(jobItems[0]?.id || '');
    }).finally(() => {
      if (alive) setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!screeningOpen) return;
    setStepIndex(-1);
    setComplete(false);
    setProgress(0);

    if (!activeJobId) {
      showToast('Select a job before screening candidates.', 'info');
      return;
    }

    const delays = [400, 1000, 2000, 3200, 4400];
    const durations = [500, 700, 900, 700, 500];
    const timers: number[] = [];

    steps.forEach((_, index) => {
      timers.push(
        window.setTimeout(() => {
          setStepIndex(index);
          setProgress(((index + 1) / steps.length) * 95);
          timers.push(
            window.setTimeout(() => {
              if (index === steps.length - 1) {
                setProgress(100);
                setComplete(true);
              }
            }, durations[index])
          );
        }, delays[index])
      );
    });

    runScreening({
      jobId: activeJobId,
      candidateIds: candidates.map((candidate) => String(candidate.id || '')),
      shortlistSize: 20
    }).then((result) => setScreeningResults(result.results || []));

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [screeningOpen, candidates, activeJobId]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return candidates.filter((candidate) => {
      if (!query) return true;
      const fullName = `${candidate.personalInfo.firstName} ${candidate.personalInfo.lastName}`.toLowerCase();
      const skills = candidate.skills || [];
      return fullName.includes(query) || candidate.personalInfo.headline.toLowerCase().includes(query) || skills.some((skill) => skill.name.toLowerCase().includes(query));
    });
  }, [candidates, search]);

  const toggleCandidate = (id: string) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelected((current) => (current.size === candidates.length ? new Set() : new Set(candidates.map((candidate) => String(candidate.id)))));
  };

  return (
    <AppShell
      activeSidebar="candidates"
      navLinks={<div className="nav-link active">Candidates Data</div>}
      actions={
        <button className="btn btn-primary btn-sm" onClick={() => setScreeningOpen(true)} type="button">
          <span className="material-symbols-outlined">smart_toy</span> Run AI Screening
        </button>
      }
    >
      <div className="page-header">
        <div className="page-title">
          Candidate Data Pool <span>{loading ? 'Loading...' : candidates.length ? `${candidates.length} candidates` : 'No candidates yet'}</span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={activeJobId}
            onChange={(event) => setActiveJobId(event.target.value)}
            style={{ width: 280, padding: '8px 14px' }}
            disabled={loading || !jobOptions.length}
          >
            <option value="">{loading ? 'Loading jobs...' : 'Select job to screen for'}</option>
            {jobOptions.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Search data pool..."
            style={{ width: 220, padding: '8px 14px', fontSize: 13 }}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <button className="btn btn-ghost btn-sm" onClick={toggleSelectAll} type="button">
            Select All
          </button>
        </div>
      </div>
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace' }}>{selected.size} selected</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {activeJobId ? `Screening for ${jobOptions.find((job) => job.id === activeJobId)?.title || 'selected job'}` : 'Pick a job to enable screening'}
        </div>
        <div style={{ flex: 1 }} />
        <span className="badge badge-active">● {loading ? 'Loading...' : candidates.length ? `${candidates.length} in pool` : '0 in pool'}</span>
      </div>
      <div className="candidates-grid">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div className="candidate-card" key={i} style={{ cursor: 'default' }}>
              <div className="cand-top">
                <div className="skeleton" style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0 }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div className="skeleton" style={{ height: 14, width: '60%' }} />
                  <div className="skeleton" style={{ height: 11, width: '80%' }} />
                </div>
              </div>
              <div className="cand-skills" style={{ gap: 6, marginTop: 12 }}>
                {Array.from({ length: 3 }).map((_, j) => (
                  <div className="skeleton" key={j} style={{ height: 22, width: 72, borderRadius: 999 }} />
                ))}
              </div>
              <div className="cand-meta" style={{ marginTop: 12, gap: 12 }}>
                <div className="skeleton" style={{ height: 11, width: 90 }} />
                <div className="skeleton" style={{ height: 11, width: 60 }} />
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div style={{ gridColumn: '1/-1', padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
            No candidates found.
          </div>
        ) : filtered.map((candidate) => {
          const initials = `${candidate.personalInfo.firstName?.[0] || ''}${candidate.personalInfo.lastName?.[0] || ''}`.toUpperCase();
          const years = (candidate.experience || []).reduce((sum, entry) => {
            const start = new Date(entry.startDate);
            const end = entry.endDate === 'Present' ? new Date() : new Date(entry.endDate || entry.startDate);
            if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return sum;
            return sum + (Number(end) - Number(start)) / (1000 * 60 * 60 * 24 * 365.25);
          }, 0);

          return (
            <div key={String(candidate.id)} className={`candidate-card ${selected.has(String(candidate.id)) ? 'selected' : ''}`} onClick={() => toggleCandidate(String(candidate.id))}>
              <div className="cand-top">
                <div className="cand-avatar">{initials}</div>
                <div style={{ flex: 1 }}>
                  <div className="cand-name">
                    {candidate.personalInfo.firstName} {candidate.personalInfo.lastName}
                  </div>
                  <div className="cand-headline">{candidate.personalInfo.headline}</div>
                </div>
                <div className="cand-select-check">
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                    check
                  </span>
                </div>
              </div>
              <div className="cand-skills">
                {(candidate.skills || []).slice(0, 5).map((skill) => (
                  <span className="skill-pill" key={`${candidate.id}-${skill.name}`}>
                    {skill.name} ({skill.level})
                  </span>
                ))}
              </div>
              <div className="cand-meta">
                <span>
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                    location_on
                  </span>{' '}
                  {candidate.personalInfo.location}
                </span>
                <span>
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                    schedule
                  </span>{' '}
                  {years.toFixed(1)} years
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {screeningOpen ? (
        <div className="modal-overlay open" onClick={() => complete && setScreeningOpen(false)}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 24 }}>
                smart_toy
              </span>{' '}
              AI Screening
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.5 }}>
              Processing {candidates.length} candidates against the selected job requirements...
            </div>
            <div className="form-group" style={{ marginBottom: 18 }}>
              <label>Screen candidates for which job?</label>
              <select value={activeJobId} onChange={(event) => setActiveJobId(event.target.value)}>
                <option value="">Select a job</option>
                {jobOptions.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="progress-bar" style={{ marginBottom: 8 }}>
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace' }}>
                {complete ? 'Done' : stepIndex >= 0 ? steps[stepIndex] : 'Starting...'}
              </span>
              <span style={{ fontSize: 13, fontWeight: 800, fontFamily: 'DM Mono, monospace', color: progress === 100 ? 'var(--green)' : 'var(--primary)' }}>
                {Math.round(progress)}%
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {steps.map((step, index) => {
                const pct = Math.round(((index + 1) / steps.length) * 100);
                const isDone = index < stepIndex;
                const isRunning = index === stepIndex;
                return (
                  <div
                    key={step}
                    className={`proc-step ${isDone ? 'done' : isRunning ? 'running' : 'pending'}`}
                    style={{ padding: '12px 16px', borderRadius: 10, background: 'var(--surface2)' }}
                  >
                    <span className="proc-step-icon material-symbols-outlined" style={{ fontSize: 20, color: index <= stepIndex ? 'var(--primary)' : 'var(--text-muted)' }}>
                      {index === 0 ? 'description' : index === 1 ? 'psychology' : index === 2 ? 'calculate' : index === 3 ? 'leaderboard' : 'task_alt'}
                    </span>
                    <span style={{ flex: 1, fontSize: 13 }}>{step}</span>
                    <span style={{ fontSize: 12, fontFamily: 'DM Mono', color: isDone || (isRunning && complete) ? 'var(--green)' : isRunning ? 'var(--primary)' : 'var(--text-muted)', fontWeight: isDone || isRunning ? 700 : 400 }}>
                      {isDone || (isRunning && complete) ? 'complete' : isRunning ? 'processing' : 'waiting'}
                    </span>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 28 }}>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setScreeningOpen(false);
                  showToast(`AI screening complete. ${screeningResults.length} ranked results are ready.`, 'success');
                  router.push(activeJobId ? `/shortlist?jobId=${activeJobId}` : '/shortlist');
                }}
                style={{ display: complete ? 'inline-flex' : 'none' }}
                type="button"
              >
                <span className="material-symbols-outlined">done_all</span> View Shortlist Results
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
