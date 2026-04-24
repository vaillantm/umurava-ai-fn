'use client';

import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const PIE_COLORS = ['#2563eb', '#16a34a', '#f59e0b'];

type WeeklyPoint = { day: string; screened: number; shortlisted: number };
type PiePoint = { name: string; value: number };
type BarPoint = { dept: string; count: number };

export function WeeklyChart({ data }: { data: WeeklyPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
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
  );
}

export function PipelinePie({ data }: { data: PiePoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
          {data.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
        </Pie>
        <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function JobsBarChart({ data }: { data: BarPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="dept" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
        <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} name="Shortlist Size" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export { PIE_COLORS };
