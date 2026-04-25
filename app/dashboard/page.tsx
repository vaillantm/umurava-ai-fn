'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { AppShell } from '@/components/app-shell';
import { getCachedUser, listJobs, listCandidates, getLatestScreening, logout, type CandidateRecord, type JobRecord, type ScreeningRecord } from '@/lib/api';

const WeeklyChartDynamic = dynamic(() => import('@/components/dashboard-charts').then((m) => ({ default: m.WeeklyChart })), { ssr: false, loading: () => <div style={{ height: 220 }} /> });
const PipelinePieDynamic = dynamic(() => import('@/components/dashboard-charts').then((m) => ({ default: m.PipelinePie })), { ssr: false, loading: () => <div style={{ height: 180 }} /> });
const JobsBarChartDynamic = dynamic(() => import('@/components/dashboard-charts').then((m) => ({ default: m.JobsBarChart })), { ssr: false, loading: () => <div style={{ height: 180 }} /> });

const PIE_COLORS_STATIC = ['#2563eb', '#16a34a', '#f59e0b'];

const statIcons: Record<string, string> = { activeJobs: 'work', totalApplicants: 'group', aiScreened: 'psychology', shortlisted: 'emoji_events' };
const statColors: Record<string, string> = { activeJobs: 'var(--primary)', totalApplicants: '#7c3aed', aiScreened: 'var(--green)', shortlisted: '#f59e0b' };
const statBg: Record<string, string> = { activeJobs: 'rgba(37,99,235,0.08)', totalApplicants: 'rgba(124,58,237,0.08)', aiScreened: 'rgba(22,163,74,0.08)', shortlisted: 'rgba(245,158,11,0.08)' };

type Snapshot = { jobs: JobRecord[]; candidates: CandidateRecord[]; latestScreening: ScreeningRecord | null };

export default function DashboardPage() {
  const [snapshot, setSnapshot] = useState<Snapshot>({ jobs: [], candidates: [], latestScreening: null });
  const user = getCachedUser();

  useEffect(() => {
    let alive = true;
    Promise.all([listJobs(), listCandidates(), getLatestScreening()]).then(([jobs, candidates, latestScreening]) => {
      if (!alive) return;
      setSnapshot({ jobs, candidates, latestScreening });
    });
    return () => { alive = false; };
  }, []);

  const summary = useMemo(() => {
    const activeJobs = snapshot.jobs.filter((job) => job.status !== 'closed').length;
    const totalApplicants = snapshot.candidates.length;
    const aiScreened = snapshot.latestScreening?.results.length || 0;
    const shortlisted = snapshot.latestScreening?.shortlistedCount || 0;
    const incompleteCount = snapshot.latestScreening?.incompleteCandidates.length || 0;
    return { activeJobs, totalApplicants, aiScreened, shortlisted, incompleteCount };
  }, [snapshot]);

  const weeklyData = useMemo(() => {
    const results = snapshot.latestScreening?.results || [];
    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
      const chunk = results.filter((_, i) => i % 7 === index);
      return { day, screened: chunk.length, shortlisted: chunk.filter((r) => r.decision === 'shortlisted').length };
    });
  }, [snapshot.latestScreening]);

  const jobRows = useMemo(() => snapshot.jobs.map((job) => ({
    title: job.title, company: job.company || 'Umurava', dept: job.department || 'General',
    location: job.location || 'Remote',
    shortlisted: Array.isArray(job.shortlistedCandidates) ? job.shortlistedCandidates.length : 0,
    shortlistSize: job.shortlistSize || 0, status: job.status || 'draft', href: '/jobs'
  })), [snapshot.jobs]);

  const pieData = useMemo(() => [
    { name: 'Shortlisted', value: summary.shortlisted || 0 },
    { name: 'Screened', value: Math.max(summary.aiScreened - summary.shortlisted, 0) },
    { name: 'Pending', value: summary.incompleteCount }
  ], [summary]);

  const barData = useMemo(() => snapshot.jobs.map((job) => ({ dept: job.department || job.title, count: job.shortlistSize || 0 })), [snapshot.jobs]);

  const stats = [
    { key: 'activeJobs', label: 'Active Jobs', value: summary.activeJobs, delta: 'Live now' },
    { key: 'totalApplicants', label: 'Total Applicants', value: summary.totalApplicants, delta: 'Synced from API' },
    { key: 'aiScreened', label: 'AI Screened', value: summary.aiScreened, delta: 'Latest screening' },
    { key: 'shortlisted', label: 'Shortlisted', value: summary.shortlisted, delta: 'Top ranked results' }
  ];

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
          <div className="dash-greeting">Good morning, {user?.fullName?.split(' ')[0] || 'Jane'}</div>
          <div className="dash-subtitle">Here's what's happening with your hiring pipeline today.</div>
        </div>
        <Link className="btn btn-primary" href="/jobs">
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
          New Job Posting
        </Link>
      </div>

      <div className="dash-stats-grid">
        {stats.map((stat) => (
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

      <div className="dash-charts-row">
        <div className="dash-card dash-card-wide">
          <div className="dash-card-header">
            <div className="dash-card-title">
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--primary)' }}>trending_up</span>
              Weekly Screening Activity
            </div>
          </div>
          <div className="dash-card-body">
            <WeeklyChartDynamic data={weeklyData} />
          </div>
        </div>

        <div className="dash-card dash-card-side">
          <div className="dash-card-header">
            <div className="dash-card-title">
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#f59e0b' }}>donut_large</span>
              Pipeline Status
            </div>
          </div>
          <div className="dash-card-body dash-card-stack">
            <PipelinePieDynamic data={pieData} />
            <div className="dash-pie-legend">
              {pieData.map((item, index) => (
                <div key={item.name} className="dash-pie-row">
                  <div className="dash-pie-label">
                    <span className="dash-pie-swatch" style={{ background: PIE_COLORS_STATIC[index] }} />
                    {item.name}
                  </div>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="dash-tables-row">
        <div className="dash-card dash-card-wide">
          <div className="dash-card-header">
            <div className="dash-card-title">
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--primary)' }}>work</span>
              Active Jobs
            </div>
            <Link className="btn btn-ghost btn-sm" href="/jobs">View all</Link>
          </div>
          <div className="dash-card-body">
            <JobsBarChartDynamic data={barData} />
          </div>
          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead>
                <tr><th>Role</th><th>Company</th><th>Location</th><th>Shortlisted</th><th>Status</th><th /></tr>
              </thead>
              <tbody>
                {jobRows.length ? jobRows.map((row) => (
                  <tr key={`${row.title}-${row.company}-${row.dept}`}>
                    <td><span className="dash-table-bold">{row.title}</span></td>
                    <td><span className="dash-table-muted">{row.company}</span></td>
                    <td><span className="dash-table-muted">{row.location}</span></td>
                    <td><span className="dash-table-muted">{row.shortlisted}/{row.shortlistSize}</span></td>
                    <td>
                      <span className={`badge badge-${row.status === 'active' ? 'active' : row.status === 'closed' ? 'closed' : 'pending'}`}>
                        {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                      </span>
                    </td>
                    <td><Link className="btn btn-ghost btn-sm" href={row.href}>Open</Link></td>
                  </tr>
                )) : (
                  <tr><td colSpan={6}><div className="dash-empty-state">No jobs yet. Create a job to populate this table.</div></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="dash-card dash-card-side">
          <div className="dash-card-header">
            <div className="dash-card-title">
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--green)' }}>psychology</span>
              Recent AI Screenings
            </div>
          </div>
          <div className="dash-screening-list">
            {(snapshot.latestScreening?.results || []).slice(0, 5).map((candidate) => {
              const rec = snapshot.candidates.find((c) => String(c.id) === String(candidate.candidateId));
              const name = rec ? `${rec.personalInfo.firstName} ${rec.personalInfo.lastName}` : candidate.candidateId;
              const role = rec?.personalInfo.headline || 'Candidate';
              return (
                <div className="dash-screening-row" key={candidate.candidateId}>
                  <div className="dash-screening-avatar">{name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('')}</div>
                  <div className="dash-screening-info">
                    <div className="dash-screening-name">{name}</div>
                    <div className="dash-screening-role">{role}</div>
                  </div>
                  <div className="dash-screening-score" style={{ color: candidate.score >= 80 ? 'var(--green)' : candidate.score >= 70 ? 'var(--primary)' : 'var(--text-muted)' }}>
                    {candidate.score}<span style={{ fontSize: 10, opacity: 0.6 }}>/100</span>
                  </div>
                </div>
              );
            })}
            {!snapshot.latestScreening ? <div className="dash-empty-state">Run a screening to populate results here.</div> : null}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
