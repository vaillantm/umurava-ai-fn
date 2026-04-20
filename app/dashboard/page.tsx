'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { AppShell } from '@/components/app-shell';
import { umuravaStore } from '@/lib/umurava-store';

const weeklyData = [
  { day: 'Mon', screened: 12, shortlisted: 4 },
  { day: 'Tue', screened: 19, shortlisted: 7 },
  { day: 'Wed', screened: 8,  shortlisted: 2 },
  { day: 'Thu', screened: 24, shortlisted: 9 },
  { day: 'Fri', screened: 17, shortlisted: 6 },
  { day: 'Sat', screened: 5,  shortlisted: 1 },
  { day: 'Sun', screened: 10, shortlisted: 3 }
];

const deptData = [
  { dept: 'Engineering', count: 48 },
  { dept: 'Data & AI',   count: 62 },
  { dept: 'Design',      count: 35 },
  { dept: 'DevOps',      count: 44 },
  { dept: 'Product',     count: 29 }
];

const pieData = [
  { name: 'Shortlisted', value: 32 },
  { name: 'Screened',    value: 58 },
  { name: 'Pending',     value: 10 }
];

const PIE_COLORS = ['#2563eb', '#16a34a', '#f59e0b'];

const statIcons: Record<string, string> = {
  activeJobs: 'work', totalApplicants: 'group',
  aiScreened: 'psychology', shortlisted: 'emoji_events'
};
const statColors: Record<string, string> = {
  activeJobs: 'var(--primary)', totalApplicants: '#7c3aed',
  aiScreened: 'var(--green)', shortlisted: '#f59e0b'
};
const statBg: Record<string, string> = {
  activeJobs: 'rgba(37,99,235,0.08)', totalApplicants: 'rgba(124,58,237,0.08)',
  aiScreened: 'rgba(22,163,74,0.08)', shortlisted: 'rgba(245,158,11,0.08)'
};

export default function DashboardPage() {
  const [summary, setSummary] = useState({ activeJobs: 0, totalApplicants: 0, aiScreened: 0, shortlisted: 0 });

  useEffect(() => { setSummary(umuravaStore.getDashboardSummary()); }, []);

  const stats = [
    { key: 'activeJobs',      label: 'Active Jobs',       value: summary.activeJobs,       delta: 'Live now' },
    { key: 'totalApplicants', label: 'Total Applicants',  value: summary.totalApplicants,  delta: '+12 this week' },
    { key: 'aiScreened',      label: 'AI Screened',       value: summary.aiScreened,       delta: 'Auto-processed' },
    { key: 'shortlisted',     label: 'Shortlisted',       value: summary.shortlisted,      delta: 'Top 10 / 20' }
  ];

  return (
    <AppShell
      activeSidebar="dashboard"
      navLinks={<div className="nav-link active">Dashboard</div>}
      actions={
        <Link className="btn btn-ghost btn-sm" href="/">
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>logout</span>
          Logout
        </Link>
      }
    >
      {/* Header */}
      <div className="dash-page-header">
        <div>
          <div className="dash-greeting">Good morning, Jane</div>
          <div className="dash-subtitle">Here's what's happening with your hiring pipeline today.</div>
        </div>
        <Link className="btn btn-primary" href="/jobs">
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
          New Job Posting
        </Link>
      </div>

      {/* Stats */}
      <div className="dash-stats-grid">
        {stats.map((s) => (
          <div className="dash-stat-card" key={s.key}>
            <div className="dash-stat-icon" style={{ background: statBg[s.key], color: statColors[s.key] }}>
              <span className="material-symbols-outlined">{statIcons[s.key]}</span>
            </div>
            <div className="dash-stat-body">
              <div className="dash-stat-value" style={{ color: statColors[s.key] }}>{s.value}</div>
              <div className="dash-stat-label">{s.label}</div>
              <div className="dash-stat-delta">{s.delta}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="dash-charts-row">
        {/* Area chart */}
        <div className="dash-card" style={{ flex: 2 }}>
          <div className="dash-card-header">
            <div className="dash-card-title">
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--primary)' }}>trending_up</span>
              Weekly Screening Activity
            </div>
          </div>
          <div style={{ padding: '16px 20px 8px' }}>
            <ResponsiveContainer width="100%" height={200}>
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
            <div style={{ display: 'flex', gap: 16, marginTop: 8, paddingLeft: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-muted)' }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: '#2563eb', display: 'inline-block' }} /> Screened
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-muted)' }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: '#16a34a', display: 'inline-block' }} /> Shortlisted
              </div>
            </div>
          </div>
        </div>

        {/* Pie chart */}
        <div className="dash-card" style={{ flex: 1 }}>
          <div className="dash-card-header">
            <div className="dash-card-title">
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#f59e0b' }}>donut_large</span>
              Pipeline Status
            </div>
          </div>
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%', marginTop: 8 }}>
              {pieData.map((d, i) => (
                <div key={d.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 2, background: PIE_COLORS[i], display: 'inline-block' }} />
                    <span style={{ color: 'var(--text-muted)' }}>{d.name}</span>
                  </div>
                  <span style={{ fontWeight: 700, color: 'var(--text)' }}>{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="dash-tables-row">
        {/* Bar chart + table */}
        <div className="dash-card" style={{ flex: 2 }}>
          <div className="dash-card-header">
            <div className="dash-card-title">
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--primary)' }}>work</span>
              Applicants by Department
            </div>
            <Link className="btn btn-ghost btn-sm" href="/jobs">View All →</Link>
          </div>
          <div style={{ padding: '16px 20px 8px' }}>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={deptData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="dept" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} name="Applicants" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Role</th><th>Dept</th><th>Applicants</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {[
                { role: 'Senior Backend Engineer', dept: 'Engineering', count: '48', status: 'active',  href: '/candidates' },
                { role: 'AI/ML Engineer',          dept: 'Data & AI',   count: '62', status: 'pending', href: '/candidates' },
                { role: 'Product Designer',        dept: 'Design',      count: '35', status: 'active',  href: '/shortlist' },
                { role: 'DevOps Engineer',         dept: 'Infrastructure', count: '44', status: 'closed', href: '/shortlist' }
              ].map((row) => (
                <tr key={row.role}>
                  <td><span className="dash-table-bold">{row.role}</span></td>
                  <td><span className="dash-table-muted">{row.dept}</span></td>
                  <td><span className="dash-table-muted">{row.count}</span></td>
                  <td><span className={`badge badge-${row.status}`}>● {row.status.charAt(0).toUpperCase() + row.status.slice(1)}</span></td>
                  <td><Link className="btn btn-ghost btn-sm" href={row.href}>{row.status === 'closed' ? 'Results →' : 'Screen →'}</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>

        {/* Recent screenings */}
        <div className="dash-card" style={{ flex: 1 }}>
          <div className="dash-card-header">
            <div className="dash-card-title">
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--green)' }}>psychology</span>
              Recent AI Screenings
            </div>
          </div>
          <div className="dash-screening-list">
            {[
              { name: 'Alice Uwimana',    role: 'Backend Eng.',   score: 92 },
              { name: 'Eric Nkurunziza', role: 'AI/ML Eng.',     score: 87 },
              { name: 'Grace Mutoni',    role: 'Product Design', score: 61 },
              { name: 'David Hakizimana', role: 'Backend Eng.',  score: 79 },
              { name: 'Amina Keza',      role: 'DevOps',         score: 74 }
            ].map((c) => (
              <div className="dash-screening-row" key={c.name}>
                <div className="dash-screening-avatar">{c.name.split(' ').map(n => n[0]).join('')}</div>
                <div className="dash-screening-info">
                  <div className="dash-screening-name">{c.name}</div>
                  <div className="dash-screening-role">{c.role}</div>
                </div>
                <div className="dash-screening-score" style={{ color: c.score >= 80 ? 'var(--green)' : c.score >= 70 ? 'var(--primary)' : 'var(--text-muted)' }}>
                  {c.score}<span style={{ fontSize: 10, opacity: 0.6 }}>/100</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
