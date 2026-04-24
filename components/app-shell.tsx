'use client';

import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import { getCachedUser, type AuthUser } from '@/lib/backend';

type SidebarKey = 'dashboard' | 'jobs' | 'candidates' | 'shortlist' | 'external' | 'settings';

type AppShellProps = {
  activeSidebar?: SidebarKey;
  navLabel?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  navLinks?: ReactNode;
  showDashboardLink?: boolean;
};

const sidebarItems: Array<{ key: SidebarKey; label: string; icon: string; href: string }> = [
  { key: 'dashboard', label: 'Dashboard', icon: 'dashboard', href: '/dashboard' },
  { key: 'jobs', label: 'Jobs', icon: 'work', href: '/jobs' },
  { key: 'candidates', label: 'Candidates Data', icon: 'group', href: '/candidates' },
  { key: 'shortlist', label: 'AI Shortlists', icon: 'emoji_events', href: '/shortlist' },
  { key: 'external', label: 'Bulk CV Upload', icon: 'upload_file', href: '/external' },
  { key: 'settings', label: 'AI Settings', icon: 'settings', href: '/settings' }
];

export function AppShell({ activeSidebar, navLabel, children, actions, navLinks, showDashboardLink = true }: AppShellProps) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(getCachedUser());
  }, []);

  return (
    <div className="page">
      <nav>
        <Link className="nav-logo" href="/">
          <div className="nav-logo-mark">
            <span className="material-symbols-outlined">psychology</span>
          </div>
          <div className="nav-logo-text">Umurava AI</div>
        </Link>
        <div className="nav-links">{navLinks}</div>
        <div className="nav-actions">
          {showDashboardLink ? (
            <Link className="profile-chip" href="/profile" style={{ cursor: 'pointer' }}>
              <img alt={`${user?.fullName || 'Recruiter'} profile picture`} src={user?.avatarUrl || 'https://i.pravatar.cc/68?img=47'} />
              <div className="profile-text">
                <div className="profile-name">{user?.fullName || 'Recruiter'}</div>
                <div className="profile-role">{user?.role ? `${user.role.charAt(0).toUpperCase()}${user.role.slice(1)}` : 'Recruiter'}</div>
              </div>
            </Link>
          ) : null}
          {actions}
        </div>
      </nav>
      <div className="dash-layout">
        <aside className="sidebar">
          {sidebarItems.map((item) => (
            <Link key={item.key} className={`sidebar-item ${activeSidebar === item.key ? 'active' : ''}`} href={item.href}>
              <span className="icon">
                <span className="material-symbols-outlined">{item.icon}</span>
              </span>
              {item.label}
            </Link>
          ))}
          <div style={{ flex: 1 }} />
        </aside>
        <main className="main-content">
          {navLabel ? <div className="page-header">{navLabel}</div> : null}
          {children}
        </main>
      </div>
    </div>
  );
}
