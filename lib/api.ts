// Lightweight API client — no store, no seed data, no side effects at import time.

const API = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

function token(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  const raw = window.localStorage.getItem('umurava.auth.token');
  if (!raw) return undefined;
  try { const p = JSON.parse(raw); if (typeof p === 'string') return p; } catch {}
  return raw;
}

async function req<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  const t = token();
  if (t) headers.set('Authorization', `Bearer ${t}`);
  const res = await fetch(`${API}${path}`, { ...init, headers });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error((data as any)?.message || `${res.status} ${path}`);
  return data as T;
}

function arr<T>(data: unknown, mapper: (x: any) => T): T[] {
  if (Array.isArray(data)) return data.map(mapper);
  if (data && typeof data === 'object') {
    const d = data as Record<string, unknown>;
    const list = d.items ?? d.data ?? d.jobs ?? d.candidates ?? d.results;
    if (Array.isArray(list)) return list.map(mapper);
  }
  return [];
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface JobRecord {
  id?: string;
  title: string;
  company: string;
  department?: string;
  location?: string;
  salary?: number;
  jobType?: 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance';
  employmentType?: string;
  experienceLevel?: string;
  shortlistSize?: number;
  description: string;
  requiredSkills?: string[];
  idealCandidateProfile?: string;
  aiWeights?: { skills: number; experience: number; education: number; projects: number; certifications: number };
  shortlistedCandidates?: Array<string | { id?: string; _id?: string }>;
  status?: 'draft' | 'active' | 'closed';
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CandidateRecord {
  id?: string;
  source: 'manual' | 'json' | 'csv' | 'pdf' | 'bulk';
  sourceFileName?: string;
  avatar?: { url: string; publicId?: string };
  personalInfo: { firstName: string; lastName: string; email: string; headline: string; bio?: string; location: string };
  skills?: Array<{ name: string; level: string; yearsOfExperience: number }>;
  languages?: Array<{ name: string; proficiency: string }>;
  experience?: Array<{ company: string; role: string; startDate: string; endDate?: string; description?: string; technologies?: string[]; isCurrent?: boolean }>;
  education?: Array<{ institution: string; degree: string; fieldOfStudy: string; startYear: number; endYear?: number }>;
  certifications?: Array<{ name: string; issuer: string; issueDate: string }>;
  projects?: Array<{ name: string; description: string; technologies: string[]; role: string; link?: string; startDate: string; endDate?: string }>;
  availability?: { status: string; type: string; startDate?: string };
  socialLinks?: { linkedin?: string; github?: string; portfolio?: string };
  score?: number;
  scoreBreakdown?: { skills: number; experience: number; education: number; projects: number; certifications: number };
  strengths?: string[];
  gaps?: string[];
  reasoning?: string;
  decision?: string;
  rank?: number;
  workflowStatus?: string;
  shortlistLabel?: string;
  incompleteReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ScreeningResult {
  candidateId: string;
  rank: number;
  score: number;
  scoreBreakdown: { skills: number; experience: number; education: number; projects: number; certifications: number };
  strengths: string[];
  gaps: string[];
  reasoning: string;
  decision: 'shortlisted' | 'review' | 'rejected';
  workflowStatus?: string;
  shortlistLabel?: string;
}

export interface ScreeningRecord {
  id?: string;
  jobId: string;
  results: ScreeningResult[];
  incompleteCandidates: Array<{ candidateId: string; reason: string }>;
  summary: string;
  totalCandidates: number;
  shortlistedCount: number;
  averageScore: number;
  generatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type { AuthUser } from '@/lib/auth';

// ─── Normalizers ──────────────────────────────────────────────────────────────

function id(x: any): string | undefined {
  return x?.id ? String(x.id) : x?._id ? String(x._id) : undefined;
}

export function normalizeJob(x: any): JobRecord {
  return {
    ...x,
    id: id(x) ?? x?.id,
    title: x?.title || '',
    company: x?.company || '',
    requiredSkills: Array.isArray(x?.requiredSkills) ? x.requiredSkills : [],
    shortlistedCandidates: Array.isArray(x?.shortlistedCandidates) ? x.shortlistedCandidates : [],
    status: x?.status || 'draft',
    aiWeights: x?.aiWeights ?? { skills: 40, experience: 30, education: 15, projects: 10, certifications: 5 },
  };
}

export function normalizeCandidate(x: any): CandidateRecord {
  return {
    ...x,
    id: id(x) ?? x?.id,
    source: x?.source || 'manual',
    personalInfo: {
      firstName: x?.personalInfo?.firstName || x?.firstName || '',
      lastName: x?.personalInfo?.lastName || x?.lastName || '',
      email: x?.personalInfo?.email || x?.email || '',
      headline: x?.personalInfo?.headline || x?.headline || '',
      bio: x?.personalInfo?.bio ?? x?.bio ?? '',
      location: x?.personalInfo?.location || x?.location || '',
    },
    skills: Array.isArray(x?.skills) ? x.skills : [],
    languages: Array.isArray(x?.languages) ? x.languages : [],
    experience: Array.isArray(x?.experience) ? x.experience : [],
    education: Array.isArray(x?.education) ? x.education : [],
    certifications: Array.isArray(x?.certifications) ? x.certifications : [],
    projects: Array.isArray(x?.projects) ? x.projects : [],
    availability: x?.availability || { status: 'Available', type: 'Full-time' },
    socialLinks: x?.socialLinks || {},
  };
}

function normalizeScreening(x: any): ScreeningRecord | null {
  if (!x) return null;
  return {
    ...x,
    id: id(x) ?? x?.id,
    jobId: String(x?.jobId || ''),
    results: Array.isArray(x?.results) ? x.results.map((r: any) => ({
      candidateId: String(r?.candidateId ?? r?.id ?? r?._id ?? ''),
      rank: Number(r?.rank ?? 0),
      score: Number(r?.score ?? 0),
      scoreBreakdown: { skills: Number(r?.scoreBreakdown?.skills ?? 0), experience: Number(r?.scoreBreakdown?.experience ?? 0), education: Number(r?.scoreBreakdown?.education ?? 0), projects: Number(r?.scoreBreakdown?.projects ?? 0), certifications: Number(r?.scoreBreakdown?.certifications ?? 0) },
      strengths: Array.isArray(r?.strengths) ? r.strengths : [],
      gaps: Array.isArray(r?.gaps) ? r.gaps : [],
      reasoning: r?.reasoning || '',
      decision: r?.decision || 'review',
      workflowStatus: r?.workflowStatus,
      shortlistLabel: r?.shortlistLabel,
    })) : [],
    incompleteCandidates: Array.isArray(x?.incompleteCandidates) ? x.incompleteCandidates.map((c: any) => ({ candidateId: String(c?.candidateId ?? c?._id ?? c?.id ?? ''), reason: c?.reason || 'Incomplete profile' })) : [],
    summary: x?.summary || '',
    totalCandidates: Number(x?.totalCandidates ?? 0),
    shortlistedCount: Number(x?.shortlistedCount ?? 0),
    averageScore: Number(x?.averageScore ?? 0),
    generatedBy: x?.generatedBy,
    createdAt: x?.createdAt,
    updatedAt: x?.updatedAt,
  };
}

// ─── Jobs ─────────────────────────────────────────────────────────────────────

export async function listJobs(): Promise<JobRecord[]> {
  const data = await req<unknown>('/api/jobs', { method: 'GET' });
  return arr(data, normalizeJob);
}

export async function createJob(payload: Partial<JobRecord>): Promise<JobRecord> {
  const data = await req<any>('/api/jobs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  return normalizeJob(data?.job ?? data);
}

export async function updateJob(jobId: string, payload: Partial<JobRecord>): Promise<JobRecord> {
  const data = await req<any>(`/api/jobs/${jobId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  return normalizeJob(data?.job ?? data);
}

export async function deleteJob(jobId: string): Promise<void> {
  await req(`/api/jobs/${jobId}`, { method: 'DELETE' });
}

// ─── Candidates ───────────────────────────────────────────────────────────────

export async function listCandidates(): Promise<CandidateRecord[]> {
  const data = await req<unknown>('/api/candidates', { method: 'GET' });
  return arr(data, normalizeCandidate);
}

export async function getCandidate(candidateId: string): Promise<CandidateRecord> {
  const data = await req<any>(`/api/candidates/${candidateId}`, { method: 'GET' });
  return normalizeCandidate(data?.candidate ?? data);
}

export async function createCandidate(payload: CandidateRecord & { avatarFile?: File }): Promise<CandidateRecord> {
  const form = new FormData();
  form.append('personalInfo', JSON.stringify(payload.personalInfo));
  form.append('skills', JSON.stringify(payload.skills ?? []));
  form.append('languages', JSON.stringify(payload.languages ?? []));
  form.append('experience', JSON.stringify(payload.experience ?? []));
  form.append('education', JSON.stringify(payload.education ?? []));
  form.append('certifications', JSON.stringify(payload.certifications ?? []));
  form.append('projects', JSON.stringify(payload.projects ?? []));
  form.append('availability', JSON.stringify(payload.availability ?? {}));
  form.append('socialLinks', JSON.stringify(payload.socialLinks ?? {}));
  if (payload.avatarFile) form.append('avatar', payload.avatarFile);
  const data = await req<any>('/api/candidates', { method: 'POST', body: form });
  return normalizeCandidate(data?.candidate ?? data);
}

export async function updateCandidateWithAvatar(candidateId: string, payload: CandidateRecord, avatar?: File): Promise<CandidateRecord> {
  const form = new FormData();
  form.append('personalInfo', JSON.stringify(payload.personalInfo));
  form.append('skills', JSON.stringify(payload.skills ?? []));
  form.append('languages', JSON.stringify(payload.languages ?? []));
  form.append('experience', JSON.stringify(payload.experience ?? []));
  form.append('education', JSON.stringify(payload.education ?? []));
  form.append('certifications', JSON.stringify(payload.certifications ?? []));
  form.append('projects', JSON.stringify(payload.projects ?? []));
  form.append('availability', JSON.stringify(payload.availability ?? {}));
  form.append('socialLinks', JSON.stringify(payload.socialLinks ?? {}));
  if (avatar) form.append('avatar', avatar);
  const data = await req<any>(`/api/candidates/${candidateId}`, { method: 'PATCH', body: form });
  return normalizeCandidate(data?.candidate ?? data);
}

export async function deleteCandidate(candidateId: string): Promise<void> {
  await req(`/api/candidates/${candidateId}`, { method: 'DELETE' });
}

// ─── Screenings ───────────────────────────────────────────────────────────────

export async function getLatestScreening(jobId?: string): Promise<ScreeningRecord | null> {
  try {
    const path = jobId ? `/api/screenings/jobs/${jobId}/latest` : '/api/screenings/latest';
    const data = await req<any>(path, { method: 'GET' });
    return normalizeScreening(data?.screening ?? data);
  } catch {
    return null;
  }
}

export async function runScreening(payload: { jobId: string; candidateIds: string[]; shortlistSize?: number }) {
  const data = await req<any>('/api/screenings/run', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  const s = data?.screening ?? data;
  return {
    jobId: String(s?.jobId || ''),
    totalCandidates: Number(s?.totalCandidates ?? 0),
    shortlistedCount: Number(s?.shortlistedCount ?? 0),
    averageScore: Number(s?.averageScore ?? 0),
    summary: s?.summary || '',
    results: Array.isArray(s?.results) ? s.results.map((r: any) => ({ candidateId: String(r?.candidateId ?? r?.id ?? ''), rank: Number(r?.rank ?? 0), score: Number(r?.score ?? 0), scoreBreakdown: r?.scoreBreakdown ?? {}, strengths: r?.strengths ?? [], gaps: r?.gaps ?? [], reasoning: r?.reasoning || '', decision: r?.decision || 'review' })) : [],
    incompleteCandidates: Array.isArray(s?.incompleteCandidates) ? s.incompleteCandidates.map((c: any) => ({ candidateId: String(c?.candidateId ?? c?.id ?? ''), reason: c?.reason || 'Incomplete profile' })) : [],
  };
}

export async function exportScreening(screeningId: string): Promise<ScreeningRecord> {
  const data = await req<any>(`/api/screenings/${screeningId}/export`, { method: 'GET' });
  return normalizeScreening(data?.screening ?? data) as ScreeningRecord;
}

// ─── Uploads ──────────────────────────────────────────────────────────────────

export async function uploadJson(file: File): Promise<CandidateRecord[]> {
  const form = new FormData(); form.append('file', file);
  const data = await req<any>('/api/uploads/json', { method: 'POST', body: form });
  return arr(data?.candidates ?? data, normalizeCandidate);
}

export async function uploadCsv(file: File): Promise<CandidateRecord[]> {
  const form = new FormData(); form.append('file', file);
  const data = await req<any>('/api/uploads/csv', { method: 'POST', body: form });
  return arr(data?.candidates ?? data, normalizeCandidate);
}

export async function uploadPdf(file: File): Promise<CandidateRecord[]> {
  const form = new FormData(); form.append('file', file);
  const data = await req<any>('/api/uploads/pdf', { method: 'POST', body: form });
  return arr(data?.candidates ?? data, normalizeCandidate);
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export interface AISettings {
  primaryModel?: string;
  batchOutput?: boolean;
  explainableStructuring?: boolean;
  biasDetection?: boolean;
  promptContext?: string;
}

const SETTINGS_KEY = 'umurava.auth.user';

function localSettings(): AISettings {
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(SETTINGS_KEY) : null;
    return raw ? (JSON.parse(raw)?.settings ?? {}) : {};
  } catch { return {}; }
}

export async function getSettings(): Promise<AISettings> {
  try {
    return await req<AISettings>('/api/auth/settings', { method: 'GET' });
  } catch {
    return localSettings();
  }
}

export async function updateSettings(payload: AISettings): Promise<AISettings> {
  try {
    const data = await req<any>('/api/auth/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    return data?.settings ?? payload;
  } catch {
    return payload;
  }
}

// ─── Auth helpers (re-exported for convenience) ───────────────────────────────
export { getCachedUser, getAuthToken, clearSession } from '@/lib/auth';

export async function logout(): Promise<void> {
  const t = token();
  try { await req('/api/auth/logout', { method: 'POST', headers: t ? { Authorization: `Bearer ${t}` } : {} }); } catch {}
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem('umurava.auth.token');
    window.localStorage.removeItem('umurava.auth.user');
  }
}
