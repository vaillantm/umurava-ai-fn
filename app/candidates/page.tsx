'use client';

import { useEffect, useMemo, useState } from 'react';
import { AppShell } from '@/components/app-shell';
import { showToast } from '@/lib/toast';
import { umuravaStore, type CandidateProfile } from '@/lib/umurava-store';

const steps = ['Parse & normalize resumes', 'Extract structured profile data', 'Run Gemini AI scoring', 'Rank & create shortlist', 'Generate explanations'];

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [selected, setSelected] = useState<Set<string | number>>(new Set());
  const [search, setSearch] = useState('');
  const [screeningOpen, setScreeningOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(-1);
  const [complete, setComplete] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setCandidates([...umuravaStore.getCandidates()]);
  }, []);

  useEffect(() => {
    if (!screeningOpen) return;
    setStepIndex(-1);
    setComplete(false);
    setProgress(0);
    umuravaStore.runScreening(undefined, { shortlistSize: umuravaStore.getCurrentShortlistSize() });

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

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [screeningOpen]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return candidates.filter((candidate) => {
      if (!query) return true;
      const fullName = `${candidate.personalInfo.firstName} ${candidate.personalInfo.lastName}`.toLowerCase();
      return fullName.includes(query) || candidate.personalInfo.headline.toLowerCase().includes(query) || candidate.skills.some((skill) => skill.name.toLowerCase().includes(query));
    });
  }, [candidates, search]);

  const toggleCandidate = (id: string | number) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelected((current) => (current.size === candidates.length ? new Set() : new Set(candidates.map((candidate) => candidate.id))));
  };

  return (
    <AppShell
      activeSidebar="candidates"
      navLinks={<div className="nav-link active">Candidates Data</div>}
      actions={
        <button className="btn btn-primary btn-sm" onClick={() => setScreeningOpen(true)}>
          <span className="material-symbols-outlined">smart_toy</span> Run AI Screening
        </button>
      }
    >
      <div className="page-header">
        <div className="page-title">
          Candidate Data Pool <span>{candidates.length ? `${candidates.length} candidates` : 'Loading...'}</span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search data pool…"
            style={{ width: 220, padding: '8px 14px', fontSize: 13 }}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <button className="btn btn-ghost btn-sm" onClick={toggleSelectAll}>
            Select All
          </button>
        </div>
      </div>
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace' }}>{selected.size} selected</div>
        <div style={{ flex: 1 }} />
        <span className="badge badge-active">● {candidates.length ? `${candidates.length} in pool` : 'Loading...'}</span>
      </div>
      <div className="candidates-grid">
        {filtered.map((candidate) => {
          const initials = `${candidate.personalInfo.firstName?.[0] || ''}${candidate.personalInfo.lastName?.[0] || ''}`.toUpperCase();
          const years = candidate.experience.reduce((sum, entry) => {
            const start = new Date(entry.startDate);
            const end = entry.endDate === 'Present' ? new Date() : new Date(entry.endDate);
            if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return sum;
            return sum + (Number(end) - Number(start)) / (1000 * 60 * 60 * 24 * 365.25);
          }, 0);

          return (
            <div key={candidate.id} className={`candidate-card ${selected.has(candidate.id) ? 'selected' : ''}`} onClick={() => toggleCandidate(candidate.id)}>
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
                {candidate.skills.slice(0, 5).map((skill) => (
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
              Gemini AI Screening
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.5 }}>
              Processing {candidates.length} candidates against the active job requirements...
            </div>
            <div className="progress-bar" style={{ marginBottom: 24 }}>
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {steps.map((step, index) => (
                <div
                  key={step}
                  className={`proc-step ${index < stepIndex ? 'done' : index === stepIndex ? 'running' : 'pending'}`}
                  style={{ padding: '12px 16px', borderRadius: 10, background: 'var(--surface2)' }}
                >
                  <span className="proc-step-icon material-symbols-outlined" style={{ fontSize: 20, color: index <= stepIndex ? 'var(--primary)' : 'var(--text-muted)' }}>
                    {index === 0 ? 'description' : index === 1 ? 'psychology' : index === 2 ? 'calculate' : index === 3 ? 'leaderboard' : 'task_alt'}
                  </span>
                  <span style={{ flex: 1, fontSize: 13 }}>{step}</span>
                  <span className="proc-step-status" style={{ fontSize: 12, fontFamily: 'DM Mono' }}>
                    {index < stepIndex ? 'complete' : index === stepIndex ? 'processing' : 'waiting'}
                  </span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 28 }}>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setScreeningOpen(false);
                  showToast('AI screening complete. Shortlist is ready.', 'success');
                }}
                style={{ display: complete ? 'inline-flex' : 'none' }}
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
