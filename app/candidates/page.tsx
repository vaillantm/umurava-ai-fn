'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { runScreening, listCandidates, listJobs, type CandidateRecord, type JobRecord } from '@/lib/backend';
import { showToast } from '@/lib/toast';

const STEPS = [
  { label: 'Parse and normalize resumes', icon: 'description' },
  { label: 'Extract structured profile data', icon: 'psychology' },
  { label: 'Run AI scoring', icon: 'calculate' },
  { label: 'Rank and create shortlist', icon: 'leaderboard' },
  { label: 'Generate explanations', icon: 'task_alt' }
];

export default function CandidatesPage() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<CandidateRecord[]>([]);
  const [jobs, setJobs] = useState<JobRecord[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [screeningOpen, setScreeningOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(-1);
  const [complete, setComplete] = useState(false);
  const [failed, setFailed] = useState(false);
  const [progress, setProgress] = useState(0);
  const [shortlistCount, setShortlistCount] = useState(0);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [shortlistSize, setShortlistSize] = useState(20);

  useEffect(() => {
    let alive = true;
    Promise.all([listCandidates(), listJobs()]).then(([candidateItems, jobItems]) => {
      if (!alive) return;
      setCandidates(candidateItems);
      setJobs(jobItems);
      const firstActive = jobItems.find((j) => j.status === 'active') || jobItems[0];
      if (firstActive?.id) setSelectedJobId(firstActive.id);
    });
    return () => { alive = false; };
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return candidates.filter((c) => {
      if (!query) return true;
      const fullName = `${c.personalInfo.firstName} ${c.personalInfo.lastName}`.toLowerCase();
      return (
        fullName.includes(query) ||
        c.personalInfo.headline.toLowerCase().includes(query) ||
        (c.skills || []).some((s) => s.name.toLowerCase().includes(query))
      );
    });
  }, [candidates, search]);

  const toggleCandidate = (id: string) => {
    setSelected((cur) => {
      const next = new Set(cur);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelected((cur) =>
      cur.size === candidates.length ? new Set() : new Set(candidates.map((c) => String(c.id)))
    );
  };

  async function startScreening() {
    const jobId = selectedJobId;
    if (!jobId) {
      showToast('Please create a job posting first before running a screening.', 'info');
      return;
    }

    const targetIds = selected.size > 0
      ? Array.from(selected)
      : candidates.map((c) => String(c.id || ''));

    if (targetIds.length === 0) {
      showToast('No candidates available to screen.', 'info');
      return;
    }

    setScreeningOpen(true);
    setStepIndex(-1);
    setComplete(false);
    setFailed(false);
    setProgress(0);
    setShortlistCount(0);

    // Animate steps while API call runs in parallel
    const delays = [300, 900, 1800, 2800, 3800];
    const timers: ReturnType<typeof setTimeout>[] = [];
    delays.forEach((delay, i) => {
      timers.push(setTimeout(() => {
        setStepIndex(i);
        setProgress(((i + 1) / STEPS.length) * 85);
      }, delay));
    });

    try {
      const result = await runScreening({ jobId, candidateIds: targetIds, shortlistSize });
      timers.forEach(clearTimeout);
      setStepIndex(STEPS.length - 1);
      setProgress(100);
      setShortlistCount(result.shortlistedCount);
      setComplete(true);
    } catch {
      timers.forEach(clearTimeout);
      setFailed(true);
      setProgress(0);
      showToast('Screening failed. Please try again.', 'info');
    }
  }

  function closeModal() {
    if (!complete && !failed) return; // prevent closing mid-run
    setScreeningOpen(false);
  }

  return (
    <AppShell
      activeSidebar="candidates"
      navLinks={<div className="nav-link active">Candidates Data</div>}
      actions={
        <button className="btn btn-primary btn-sm" onClick={startScreening} type="button">
          <span className="material-symbols-outlined">smart_toy</span> Run AI Screening
        </button>
      }
    >
      <div className="page-header">
        <div className="page-title">
          Candidate Data Pool <span>{candidates.length ? `${candidates.length} candidates` : 'Loading...'}</span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {jobs.length > 0 && (
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              style={{ padding: '8px 14px', fontSize: 13 }}
            >
              {jobs.map((job) => (
                <option key={job.id} value={job.id || ''}>
                  {job.title} {job.status === 'active' ? '✓' : `(${job.status})`}
                </option>
              ))}
            </select>
          )}
          <select
            value={shortlistSize}
            onChange={(e) => setShortlistSize(Number(e.target.value))}
            style={{ padding: '8px 14px', fontSize: 13 }}
          >
            <option value={10}>Top 10</option>
            <option value={20}>Top 20</option>
            <option value={30}>Top 30</option>
          </select>
          <input
            type="text"
            placeholder="Search candidates..."
            style={{ width: 200, padding: '8px 14px', fontSize: 13 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn btn-ghost btn-sm" onClick={toggleSelectAll} type="button">
            {selected.size === candidates.length && candidates.length > 0 ? 'Deselect All' : 'Select All'}
          </button>
        </div>
      </div>

      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace' }}>
          {selected.size > 0 ? `${selected.size} selected` : 'All candidates will be screened'}
        </div>
        <div style={{ flex: 1 }} />
        <span className="badge badge-active">● {candidates.length ? `${candidates.length} in pool` : 'Loading...'}</span>
      </div>

      <div className="candidates-grid">
        {filtered.map((candidate) => {
          const initials = `${candidate.personalInfo.firstName?.[0] || ''}${candidate.personalInfo.lastName?.[0] || ''}`.toUpperCase();
          const years = (candidate.experience || []).reduce((sum, entry) => {
            const start = new Date(entry.startDate);
            const end = entry.endDate === 'Present' ? new Date() : new Date(entry.endDate || entry.startDate);
            if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return sum;
            return sum + (Number(end) - Number(start)) / (1000 * 60 * 60 * 24 * 365.25);
          }, 0);

          return (
            <div
              key={String(candidate.id)}
              className={`candidate-card ${selected.has(String(candidate.id)) ? 'selected' : ''}`}
              onClick={() => toggleCandidate(String(candidate.id))}
            >
              <div className="cand-top">
                <div className="cand-avatar">{initials}</div>
                <div style={{ flex: 1 }}>
                  <div className="cand-name">
                    {candidate.personalInfo.firstName} {candidate.personalInfo.lastName}
                  </div>
                  <div className="cand-headline">{candidate.personalInfo.headline}</div>
                </div>
                <div className="cand-select-check">
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check</span>
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
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>location_on</span>{' '}
                  {candidate.personalInfo.location}
                </span>
                <span>
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>schedule</span>{' '}
                  {years.toFixed(1)} yrs exp
                </span>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1/-1', padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
            {candidates.length === 0 ? 'No candidates yet. Upload candidates to get started.' : 'No candidates match your search.'}
          </div>
        )}
      </div>

      {screeningOpen && (
        <div className="modal-overlay open" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 24 }}>smart_toy</span>
              AI Screening
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.5 }}>
              {failed
                ? 'Screening failed. Please check your connection and try again.'
                : `Processing ${selected.size > 0 ? selected.size : candidates.length} candidates against "${jobs.find((j) => j.id === selectedJobId)?.title || 'selected job'}"...`}
            </div>

            {!failed && (
              <div className="progress-bar" style={{ marginBottom: 24 }}>
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {STEPS.map((step, i) => (
                <div
                  key={step.label}
                  className={`proc-step ${i < stepIndex ? 'done' : i === stepIndex ? 'running' : 'pending'}`}
                  style={{ padding: '12px 16px', borderRadius: 10, background: 'var(--surface2)', display: 'flex', alignItems: 'center', gap: 12 }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 20, color: i < stepIndex ? 'var(--green)' : i === stepIndex ? 'var(--primary)' : 'var(--text-muted)' }}
                  >
                    {i < stepIndex ? 'check_circle' : step.icon}
                  </span>
                  <span style={{ flex: 1, fontSize: 13 }}>{step.label}</span>
                  <span style={{ fontSize: 12, fontFamily: 'DM Mono', color: i < stepIndex ? 'var(--green)' : i === stepIndex ? 'var(--primary)' : 'var(--text-muted)' }}>
                    {i < stepIndex ? 'done' : i === stepIndex ? (complete ? 'done' : 'processing...') : 'waiting'}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 28, display: 'flex', gap: 10 }}>
              {complete && (
                <button
                  className="btn btn-primary"
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => {
                    setScreeningOpen(false);
                    showToast(`AI screening complete. ${shortlistCount} candidates shortlisted.`, 'success');
                    router.push('/shortlist');
                  }}
                  type="button"
                >
                  <span className="material-symbols-outlined">done_all</span>
                  View {shortlistCount} Shortlisted Results
                </button>
              )}
              {failed && (
                <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={closeModal} type="button">
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
