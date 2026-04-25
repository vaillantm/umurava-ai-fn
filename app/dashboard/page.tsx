'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { AppShell } from '@/components/app-shell';
import { getDashboardSnapshot, logout, me, getCachedUser, type AuthUser, type CandidateRecord, type JobRecord, type ScreeningRecord } from '@/lib/backend';

const PIE_COLORS = ['#2563eb', '#16a34a', '#f59e0b'];

const statIcons: Record<string, string> = {
  activeJobs: 'work',
  totalApplicants: 'group',
  aiScreened: 'psychology',
  shortlisted: 'emoji_events'
};

const statColors: Record<string, string> = {
  activeJobs: 'var(--primary)',
  totalApplicants: '#7c3aed',
  aiScreened: 'var(--green)',
  shortlisted: '#f59e0b'
};

const statBg: Record<string, string> = {
  activeJobs: 'rgba(37,99,235,0.08)',
  totalApplicants: 'rgba(124,58,237,0.08)',
  aiScreened: 'rgba(22,163,74,0.08)',
  shortlisted: 'rgba(245,158,11,0.08)'
};

type Snapshot = {
  jobs: JobRecord[];
  candidates: CandidateRecord[];
  candidateTotal: number;
  aiScreenedTotal: number;
  latestScreening: ScreeningRecord | null;
};

export default function DashboardPage() {
  const [snapshot, setSnapshot] = useState<Snapshot>({ jobs: [], candidates: [], candidateTotal: 0, aiScreenedTotal: 0, latestScreening: null });
  const [user, setUser] = useState<AuthUser | null>(() => getCachedUser());

  useEffect(() => {
    let alive = true;
    Promise.all([getDashboardSnapshot(), me().catch(() => null)]).then(([data, currentUser]) => {
      if (!alive) return;
      setSnapshot(data);
      if (currentUser) setUser(currentUser);
    });
    return () => {
      alive = false;
    };
  }, []);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    const name = user?.fullName?.split(' ')[0] || 'there';
    if (hour < 12) return `Good morning, ${name}`;
    if (hour < 18) return `Good afternoon, ${name}`;
    return `Good evening, ${name}`;
  }, [user]);

  const summary = useMemo(() => {
    const activeJobs = snapshot.jobs.filter((job) => job.status !== 'closed').length;
    const totalApplicants = snapshot.candidateTotal;
    const aiScreened = snapshot.latestScreening?.results.length || 0;
    const aiScreenedTotal = snapshot.aiScreenedTotal;
    const shortlisted = snapshot.latestScreening?.shortlistedCount || 0;
    const incompleteCount = snapshot.latestScreening?.incompleteCandidates.length || 0;
    return { activeJobs, totalApplicants, aiScreened, aiScreenedTotal, shortlisted, incompleteCount };
  }, [snapshot]);

  const weeklyData = useMemo(() => {
    const results = snapshot.latestScreening?.results || [];
    const base = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return base.map((day, index) => {
      const chunk = results.filter((_, resultIndex) => resultIndex % 7 === index);
      return {
        day,
        screened: chunk.length,
        shortlisted: chunk.filter((item) => item.decision === 'shortlisted').length
      };
    });
  }, [snapshot.latestScreening]);

  const jobRows = useMemo(() => {
    return snapshot.jobs.slice(0, 4).map((job) => ({
      title: job.title,
      dept: job.department || 'General',
      location: job.location || 'Remote',
      count: summary.totalApplicants,
      status: job.status || 'draft',
      href: '/jobs'
    }));
  }, [snapshot.jobs, summary.totalApplicants]);

  const pieData = useMemo(
    () => [
      { name: 'Shortlisted', value: summary.shortlisted || 0 },
      { name: 'Screened', value: Math.max(summary.aiScreened - summary.shortlisted, 0) },
      { name: 'Pending', value: summary.incompleteCount }
    ],
    [summary]
  );

  const stats = [
    { key: 'activeJobs', label: 'Active Jobs', value: summary.activeJobs, delta: 'Live now' },
    { key: 'totalApplicants', label: 'Total Applicants', value: summary.totalApplicants, delta: 'Synced from API' },
    {
      key: 'aiScreened',
      label: 'AI Screened',
      value: summary.aiScreenedTotal,
      delta:
        summary.aiScreenedTotal > 0
          ? 'Synced from screenings API'
          : snapshot.latestScreening
            ? 'No candidates screened yet'
            : 'No screening data yet'
    },
    { key: 'shortlisted', label: 'Shortlisted', value: summary.shortlisted, delta: 'Top ranked results' }
  ];

  return (
    <AppShell
      activeSidebar="dashboard"
      user={user}
      navLinks={<div className="nav-link active">Dashboard</div>}
      actions={
        <button
          className="btn btn-ghost btn-sm"
          type="button"
          onClick={async () => {
            await logout();
            window.location.assign('/');
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
            logout
          </span>
          Logout
        </button>
      }
    >
      <div className="dash-page-header">
        <div>
          <div className="dash-greeting">{greeting}</div>
          <div className="dash-subtitle">Here's what's happening with your hiring pipeline today.</div>
        </div>
        <Link className="btn btn-primary" href="/jobs">
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
            add
          </span>
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
              <div className="dash-stat-value" style={{ color: statColors[stat.key] }}>
                {stat.value}
              </div>
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
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--primary)' }}>
                trending_up
              </span>
              Weekly Screening Activity
            </div>
          </div>
          <div className="dash-card-body">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={weeklyData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gScreened" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gShortlisted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="screened" stroke="#2563eb" strokeWidth={2} fill="url(#gScreened)" name="Screened" />
                <Area type="monotone" dataKey="shortlisted" stroke="#16a34a" strokeWidth={2} fill="url(#gShortlisted)" name="Shortlisted" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="dash-card dash-card-side">
          <div className="dash-card-header">
            <div className="dash-card-title">
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#f59e0b' }}>
                donut_large
              </span>
              Pipeline Status
            </div>
          </div>
          <div className="dash-card-body dash-card-stack">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="dash-pie-legend">
              {pieData.map((item, index) => (
                <div key={item.name} className="dash-pie-row">
                  <div className="dash-pie-label">
                    <span className="dash-pie-swatch" style={{ background: PIE_COLORS[index] }} />
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
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--primary)' }}>
                work
              </span>
              Active Jobs
            </div>
            <Link className="btn btn-ghost btn-sm" href="/jobs">
              View all
            </Link>
          </div>
          <div className="dash-card-body">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={snapshot.jobs.map((job) => ({ dept: job.department || job.title, count: job.shortlistSize || 0 }))} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="dept" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} name="Shortlist Size" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Dept</th>
                  <th>Location</th>
                  <th>Applicants</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {jobRows.map((row) => (
                  <tr key={`${row.title}-${row.dept}`}>
                    <td>
                      <span className="dash-table-bold">{row.title}</span>
                    </td>
                    <td>
                      <span className="dash-table-muted">{row.dept}</span>
                    </td>
                    <td>
                      <span className="dash-table-muted">{row.location}</span>
                    </td>
                    <td>
                      <span className="dash-table-muted">{row.count}</span>
                    </td>
                    <td>
                      <span className={`badge badge-${row.status === 'active' ? 'active' : row.status === 'closed' ? 'closed' : 'pending'}`}>
                        {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      <Link className="btn btn-ghost btn-sm" href={row.href}>
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
                {jobRows.length === 0 && (
                  <tr>
                    <td colSpan={6}>
                      <div className="dash-empty-state">No jobs yet. Create your first job posting.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="dash-card dash-card-side">
          <div className="dash-card-header">
            <div className="dash-card-title">
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--green)' }}>
                psychology
              </span>
              Recent AI Screenings
            </div>
            {snapshot.latestScreening && (
              <Link className="btn btn-ghost btn-sm" href="/shortlist">
                View all
              </Link>
            )}
          </div>
          <div className="dash-screening-list">
            {(snapshot.latestScreening?.results || []).slice(0, 5).map((candidate) => {
              const candidateRecord = snapshot.candidates.find((item) => String(item.id) === String(candidate.candidateId));
              const name = candidateRecord
                ? `${candidateRecord.personalInfo.firstName} ${candidateRecord.personalInfo.lastName}`
                : candidate.candidateId;
              const role = candidateRecord?.personalInfo.headline || 'Candidate';
              return (
                <div className="dash-screening-row" key={candidate.candidateId}>
                  <div className="dash-screening-avatar">
                    {name
                      .split(' ')
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((part) => part[0])
                      .join('')}
                  </div>
                  <div className="dash-screening-info">
                    <div className="dash-screening-name">{name}</div>
                    <div className="dash-screening-role">{role}</div>
                  </div>
                  <div className="dash-screening-score" style={{ color: candidate.score >= 80 ? 'var(--green)' : candidate.score >= 70 ? 'var(--primary)' : 'var(--text-muted)' }}>
                    {candidate.score}
                    <span style={{ fontSize: 10, opacity: 0.6 }}>/100</span>
                  </div>
                </div>
              );
            })}
            {!snapshot.latestScreening && <div className="dash-empty-state">Run a screening to populate results here.</div>}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
