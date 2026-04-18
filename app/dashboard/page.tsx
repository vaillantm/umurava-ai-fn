'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AppShell } from '@/components/app-shell';
import { umuravaStore } from '@/lib/umurava-store';

export default function DashboardPage() {
  const [summary, setSummary] = useState({ activeJobs: 0, totalApplicants: 0, aiScreened: 0, shortlisted: 0 });

  useEffect(() => {
    setSummary(umuravaStore.getDashboardSummary());
  }, []);

  return (
    <AppShell
      activeSidebar="dashboard"
      navLinks={<div className="nav-link active">Dashboard</div>}
      actions={
        <>
          <Link className="btn btn-ghost btn-sm" href="/">
            Logout
          </Link>
        </>
      }
    >
      <div className="page-header">
        <div className="page-title">
          Dashboard <span>Welcome back, Jane Doe</span>
        </div>
        <Link className="btn btn-primary btn-sm" href="/jobs">
          + New Job Posting
        </Link>
      </div>
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-card-label">Active Jobs</div>
          <div className="stat-card-value primary">{summary.activeJobs}</div>
          <div className="stat-card-delta">
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
              arrow_upward
            </span>{' '}
            live
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Total Applicants</div>
          <div className="stat-card-value">{summary.totalApplicants}</div>
          <div className="stat-card-delta">
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
              arrow_upward
            </span>{' '}
            live
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">AI Screened</div>
          <div className="stat-card-value green">{summary.aiScreened}</div>
          <div className="stat-card-delta">
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
              arrow_upward
            </span>{' '}
            live
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Shortlisted</div>
          <div className="stat-card-value">{summary.shortlisted}</div>
          <div className="stat-card-delta" style={{ color: 'var(--text-muted)' }}>
            Top 10/20
          </div>
        </div>
      </div>

      <div className="table-card">
        <div className="table-header">
          <div className="table-title">Active Job Postings</div>
          <Link className="btn btn-ghost btn-sm" href="/jobs">
            View All →
          </Link>
        </div>
        <table>
          <thead>
            <tr>
              <th>Role</th>
              <th>Department</th>
              <th>Applicant Data</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <b>Senior Backend Engineer</b>
              </td>
              <td style={{ color: 'var(--text-muted)' }}>Engineering</td>
              <td>
                <span className="badge badge-screening">● 48 candidates</span>
              </td>
              <td>
                <span className="badge badge-active">● Active</span>
              </td>
              <td>
                <Link className="btn btn-ghost btn-sm" href="/candidates">
                  Screen →
                </Link>
              </td>
            </tr>
            <tr>
              <td>
                <b>AI/ML Engineer</b>
              </td>
              <td style={{ color: 'var(--text-muted)' }}>Data & AI</td>
              <td>
                <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>62 candidates</span>
              </td>
              <td>
                <span className="badge badge-pending">● Pending</span>
              </td>
              <td>
                <Link className="btn btn-ghost btn-sm" href="/candidates">
                  Screen →
                </Link>
              </td>
            </tr>
            <tr>
              <td>
                <b>Product Designer</b>
              </td>
              <td style={{ color: 'var(--text-muted)' }}>Design</td>
              <td>
                <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>35 candidates</span>
              </td>
              <td>
                <span className="badge badge-active">● Active</span>
              </td>
              <td>
                <Link className="btn btn-ghost btn-sm" href="/shortlist">
                  View Results
                </Link>
              </td>
            </tr>
            <tr>
              <td>
                <b>DevOps Engineer</b>
              </td>
              <td style={{ color: 'var(--text-muted)' }}>Infrastructure</td>
              <td>
                <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>44 candidates</span>
              </td>
              <td>
                <span className="badge badge-closed">● Closed</span>
              </td>
              <td>
                <Link className="btn btn-ghost btn-sm" href="/shortlist">
                  View Results →
                </Link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="table-card">
        <div className="table-header">
          <div className="table-title">Recent AI Screenings</div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Candidate</th>
              <th>Role</th>
              <th>AI Score</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <b>Alice Uwimana</b>
              </td>
              <td style={{ color: 'var(--text-muted)' }}>Senior Backend Engineer</td>
              <td>
                <span style={{ color: 'var(--primary)', fontWeight: 700, fontFamily: 'DM Mono' }}>92/100</span>
              </td>
              <td>
                <span className="badge badge-active">● Shortlisted</span>
              </td>
            </tr>
            <tr>
              <td>
                <b>Eric Nkurunziza</b>
              </td>
              <td style={{ color: 'var(--text-muted)' }}>AI/ML Engineer</td>
              <td>
                <span style={{ color: 'var(--primary)', fontWeight: 700, fontFamily: 'DM Mono' }}>87/100</span>
              </td>
              <td>
                <span className="badge badge-active">● Shortlisted</span>
              </td>
            </tr>
            <tr>
              <td>
                <b>Grace Mutoni</b>
              </td>
              <td style={{ color: 'var(--text-muted)' }}>Product Designer</td>
              <td>
                <span style={{ color: 'var(--text-muted)', fontWeight: 700, fontFamily: 'DM Mono' }}>61/100</span>
              </td>
              <td>
                <span className="badge badge-closed">● Not Selected</span>
              </td>
            </tr>
            <tr>
              <td>
                <b>David Hakizimana</b>
              </td>
              <td style={{ color: 'var(--text-muted)' }}>Senior Backend Engineer</td>
              <td>
                <span style={{ color: 'var(--primary)', fontWeight: 700, fontFamily: 'DM Mono' }}>79/100</span>
              </td>
              <td>
                <span className="badge badge-active">● Shortlisted</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
