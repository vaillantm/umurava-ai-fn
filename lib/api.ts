// Lightweight API client — no store, no seed data, no side effects at import time.

const API = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

const OFFLINE_ERROR_PATTERNS = [
  'ETIMEDOUT',
  'ECONNREFUSED',
  'Failed to fetch',
  'NetworkError',
  'fetch failed',
  'socket hang up',
  'connect'
];

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

function isOfflineError(error: unknown): boolean {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : typeof error === 'object' && error !== null && 'message' in error && typeof (error as { message?: unknown }).message === 'string'
          ? (error as { message: string }).message
          : '';

  return OFFLINE_ERROR_PATTERNS.some((pattern) => message.includes(pattern));
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

async function withOfflineFallback<T>(request: () => Promise<T>, fallback: () => T | Promise<T>): Promise<T> {
  try {
    return await request();
  } catch (error) {
    if (!isOfflineError(error)) throw error;
    return await fallback();
  }
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

function withQuery(path: string, query: Record<string, string | number | undefined | null>): string {
  const search = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    search.set(key, String(value));
  });
  const qs = search.toString();
  return qs ? `${path}?${qs}` : path;
}

function toJsonFile(input: File | string | unknown): File {
  if (input instanceof File) return input;
  const text = typeof input === 'string' ? input : JSON.stringify(input, null, 2);
  return new File([text], 'candidates.json', { type: 'application/json' });
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

export interface DashboardSnapshot {
  jobs: JobRecord[];
  candidates: CandidateRecord[];
  latestScreening: ScreeningRecord | null;
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

function normalizeDashboardSnapshot(data: any): DashboardSnapshot {
  return {
    jobs: Array.isArray(data?.jobs) ? data.jobs.map(normalizeJob) : [],
    candidates: Array.isArray(data?.candidates) ? data.candidates.map(normalizeCandidate) : [],
    latestScreening: normalizeScreening(data?.latestScreening ?? data?.screening ?? null),
  };
}

const FALLBACK_DB = {
  jobs: [
    {
      id: 'job-demo-001',
      title: 'Senior Product Designer',
      company: 'Umurava AI',
      department: 'Design',
      location: 'Remote',
      salary: 90000,
      jobType: 'full-time',
      employmentType: 'Full-time',
      experienceLevel: 'Senior (5+ yrs)',
      shortlistSize: 20,
      description: 'Design the recruiter experience for the AI screening platform.',
      requiredSkills: ['Figma', 'Design Systems', 'UX Research', 'Prototyping'],
      idealCandidateProfile: 'Strong product designer with SaaS experience.',
      aiWeights: { skills: 40, experience: 30, education: 15, projects: 10, certifications: 5 },
      shortlistedCandidates: ['cand-demo-001', 'cand-demo-002'],
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ] as JobRecord[],
  candidates: [
    {
      id: 'cand-demo-001',
      source: 'manual',
      personalInfo: {
        firstName: 'Amina',
        lastName: 'Umutoni',
        email: 'amina@example.com',
        headline: 'Senior Product Designer',
        bio: 'Designs intuitive SaaS workflows.',
        location: 'Kigali, Rwanda'
      },
      skills: [
        { name: 'Figma', level: 'Expert', yearsOfExperience: 6 },
        { name: 'UX Research', level: 'Advanced', yearsOfExperience: 5 }
      ],
      experience: [
        { company: 'Spark HR', role: 'Product Designer', startDate: '2021-01-01', endDate: '2025-01-01', description: 'Worked on HR workflow tooling.' }
      ],
      education: [{ institution: 'University of Rwanda', degree: 'BA', fieldOfStudy: 'Design', startYear: 2014, endYear: 2018 }],
      certifications: [{ name: 'Google UX Design Certificate', issuer: 'Google', issueDate: '2023-06-01' }],
      projects: [],
      availability: { status: 'Available', type: 'Full-time' },
      socialLinks: { linkedin: 'https://linkedin.com' },
      score: 94,
      strengths: ['Strong UX systems thinking', 'Fast prototyping'],
      gaps: ['Needs more AI workflow exposure'],
      reasoning: 'Matches the role on product design, research, and system thinking.',
      decision: 'shortlisted',
      rank: 1,
      workflowStatus: 'shortlisted',
      shortlistLabel: 'Top 1'
    },
    {
      id: 'cand-demo-002',
      source: 'manual',
      personalInfo: {
        firstName: 'Brian',
        lastName: 'Karemera',
        email: 'brian@example.com',
        headline: 'UI Engineer',
        bio: 'Builds polished product interfaces.',
        location: 'Nairobi, Kenya'
      },
      skills: [
        { name: 'React', level: 'Expert', yearsOfExperience: 7 },
        { name: 'TypeScript', level: 'Advanced', yearsOfExperience: 5 }
      ],
      experience: [
        { company: 'Atlas SaaS', role: 'Frontend Engineer', startDate: '2020-01-01', endDate: '2025-01-01', description: 'Built internal dashboards.' }
      ],
      education: [{ institution: 'Strathmore University', degree: 'BSc', fieldOfStudy: 'Computer Science', startYear: 2012, endYear: 2016 }],
      certifications: [],
      projects: [],
      availability: { status: 'Available', type: 'Full-time' },
      socialLinks: {},
      score: 88,
      strengths: ['Strong frontend execution', 'Design-system discipline'],
      gaps: ['Less research experience'],
      reasoning: 'Excellent front-end fit with strong product UI experience.',
      decision: 'shortlisted',
      rank: 2,
      workflowStatus: 'shortlisted',
      shortlistLabel: 'Top 2'
    },
    {
      id: 'cand-demo-003',
      source: 'manual',
      personalInfo: {
        firstName: 'Claire',
        lastName: 'Mugisha',
        email: 'claire@example.com',
        headline: 'Content Strategist',
        bio: 'Writes product content and recruiter copy.',
        location: 'Kigali, Rwanda'
      },
      skills: [
        { name: 'Copywriting', level: 'Advanced', yearsOfExperience: 4 },
        { name: 'SEO', level: 'Intermediate', yearsOfExperience: 3 }
      ],
      experience: [],
      education: [],
      certifications: [],
      projects: [],
      availability: { status: 'Available', type: 'Contract' },
      socialLinks: {},
      score: 74,
      strengths: ['Strong messaging', 'Clear written communication'],
      gaps: ['Limited design background'],
      reasoning: 'Good fit for content tasks but outside the core design brief.',
      decision: 'review',
      rank: 3,
      workflowStatus: 'review',
      shortlistLabel: 'Top 3'
    }
  ] as CandidateRecord[],
  screenings: [] as ScreeningRecord[],
  settings: {} as AISettings
};

function buildFallbackScreening(jobId: string, candidateIds: string[], shortlistSize = 20): ScreeningRecord {
  const job = FALLBACK_DB.jobs.find((item) => String(item.id) === String(jobId)) || FALLBACK_DB.jobs[0];
  const results = FALLBACK_DB.candidates
    .filter((candidate) => !candidateIds.length || candidateIds.includes(String(candidate.id)))
    .map((candidate, index) => ({
      candidateId: String(candidate.id || ''),
      rank: Number(candidate.rank || index + 1),
      score: Number(candidate.score || 0),
      scoreBreakdown: candidate.scoreBreakdown || { skills: 40, experience: 30, education: 15, projects: 10, certifications: 5 },
      strengths: candidate.strengths || [],
      gaps: candidate.gaps || [],
      reasoning: candidate.reasoning || '',
      decision: (candidate.decision as ScreeningResult['decision']) || 'review',
      workflowStatus: candidate.workflowStatus,
      shortlistLabel: candidate.shortlistLabel
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, shortlistSize);

  const incompleteCandidates = FALLBACK_DB.candidates
    .filter((candidate) => !candidate.personalInfo.firstName || !candidate.personalInfo.lastName || !candidate.personalInfo.email)
    .map((candidate) => ({ candidateId: String(candidate.id || ''), reason: 'Incomplete profile' }));

  return {
    id: `fallback-${jobId || job?.id || 'demo'}`,
    jobId: String(job?.id || jobId || ''),
    results,
    incompleteCandidates,
    summary: `Fallback shortlist generated locally for ${job?.title || 'the selected job'}.`,
    totalCandidates: results.length,
    shortlistedCount: results.filter((item) => item.decision === 'shortlisted').length,
    averageScore: results.length ? Number((results.reduce((sum, item) => sum + item.score, 0) / results.length).toFixed(1)) : 0,
    generatedBy: 'offline-fallback',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

// ─── Jobs ─────────────────────────────────────────────────────────────────────

export async function listJobs(): Promise<JobRecord[]> {
  return withOfflineFallback(
    async () => {
      const data = await req<unknown>('/api/jobs', { method: 'GET' });
      return arr(data, normalizeJob);
    },
    () => clone(FALLBACK_DB.jobs)
  );
}

export async function createJob(payload: Partial<JobRecord>): Promise<JobRecord> {
  return withOfflineFallback(
    async () => {
      const data = await req<any>('/api/jobs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      return normalizeJob(data?.job ?? data);
    },
    () => {
      const job = normalizeJob({
        ...payload,
        id: `job-${Date.now()}`,
        title: payload.title || 'Untitled Job',
        company: payload.company || 'Umurava AI',
        description: payload.description || '',
        status: payload.status || 'draft',
        requiredSkills: payload.requiredSkills || [],
        shortlistedCandidates: [],
        aiWeights: payload.aiWeights || { skills: 40, experience: 30, education: 15, projects: 10, certifications: 5 }
      });
      FALLBACK_DB.jobs.unshift(job);
      return clone(job);
    }
  );
}

export async function updateJob(jobId: string, payload: Partial<JobRecord>): Promise<JobRecord> {
  return withOfflineFallback(
    async () => {
      const data = await req<any>(`/api/jobs/${jobId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      return normalizeJob(data?.job ?? data);
    },
    () => {
      const index = FALLBACK_DB.jobs.findIndex((job) => String(job.id) === String(jobId));
      const current = index >= 0 ? FALLBACK_DB.jobs[index] : FALLBACK_DB.jobs[0];
      const updated = normalizeJob({ ...current, ...payload, id: current?.id || jobId });
      if (index >= 0) FALLBACK_DB.jobs[index] = updated;
      return clone(updated);
    }
  );
}

export async function deleteJob(jobId: string): Promise<void> {
  await withOfflineFallback(
    () => req(`/api/jobs/${jobId}`, { method: 'DELETE' }),
    () => {
      const index = FALLBACK_DB.jobs.findIndex((job) => String(job.id) === String(jobId));
      if (index >= 0) FALLBACK_DB.jobs.splice(index, 1);
    }
  );
}

// ─── Candidates ───────────────────────────────────────────────────────────────

export async function listCandidates(): Promise<CandidateRecord[]> {
  return withOfflineFallback(
    async () => {
      const data = await req<unknown>('/api/candidates', { method: 'GET' });
      return arr(data, normalizeCandidate);
    },
    () => clone(FALLBACK_DB.candidates)
  );
}

export async function getCandidate(candidateId: string): Promise<CandidateRecord> {
  return withOfflineFallback(
    async () => {
      const data = await req<any>(`/api/candidates/${candidateId}`, { method: 'GET' });
      return normalizeCandidate(data?.candidate ?? data);
    },
    () => clone(FALLBACK_DB.candidates.find((candidate) => String(candidate.id) === String(candidateId)) || FALLBACK_DB.candidates[0])
  );
}

export async function createCandidate(payload: CandidateRecord & { avatarFile?: File }): Promise<CandidateRecord> {
  return withOfflineFallback(
    async () => {
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
    },
    () => {
      const candidate = normalizeCandidate({
        ...payload,
        id: `cand-${Date.now()}`,
        source: payload.source || 'manual'
      });
      FALLBACK_DB.candidates.unshift(candidate);
      return clone(candidate);
    }
  );
}

export async function updateCandidateWithAvatar(candidateId: string, payload: CandidateRecord, avatar?: File): Promise<CandidateRecord> {
  return withOfflineFallback(
    async () => {
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
    },
    () => {
      const index = FALLBACK_DB.candidates.findIndex((candidate) => String(candidate.id) === String(candidateId));
      const updated = normalizeCandidate({ ...payload, id: candidateId });
      if (index >= 0) FALLBACK_DB.candidates[index] = updated;
      return clone(updated);
    }
  );
}

export async function deleteCandidate(candidateId: string): Promise<void> {
  await withOfflineFallback(
    () => req(`/api/candidates/${candidateId}`, { method: 'DELETE' }),
    () => {
      const index = FALLBACK_DB.candidates.findIndex((candidate) => String(candidate.id) === String(candidateId));
      if (index >= 0) FALLBACK_DB.candidates.splice(index, 1);
    }
  );
}

// ─── Screenings ───────────────────────────────────────────────────────────────

export async function getLatestScreening(jobId?: string): Promise<ScreeningRecord | null> {
  return withOfflineFallback(
    async () => {
      const path = jobId ? `/api/screenings/latest?jobId=${jobId}` : '/api/screenings/latest';
      const data = await req<any>(path, { method: 'GET' });
      return normalizeScreening(data?.screening ?? data);
    },
    () => clone(FALLBACK_DB.screenings.find((screening) => !jobId || String(screening.jobId) === String(jobId)) || buildFallbackScreening(jobId || FALLBACK_DB.jobs[0]?.id || '', FALLBACK_DB.candidates.map((candidate) => String(candidate.id || ''))))
  );
}

export async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
  return withOfflineFallback(
    async () => {
      const data = await req<any>('/api/dashboard/snapshot', { method: 'GET' });
      return normalizeDashboardSnapshot(data);
    },
    async () => {
      const jobs = await listJobs();
      const candidates = await listCandidates();
      const latestScreening = await getLatestScreening();
      return { jobs, candidates, latestScreening };
    }
  );
}

export async function runScreening(payload: { jobId: string; candidateIds: string[]; shortlistSize?: number }) {
  return withOfflineFallback(
    async () => {
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
    },
    () => {
      const screening = buildFallbackScreening(payload.jobId, payload.candidateIds, payload.shortlistSize || 20);
      const index = FALLBACK_DB.screenings.findIndex((item) => String(item.jobId) === String(payload.jobId));
      if (index >= 0) FALLBACK_DB.screenings[index] = screening;
      else FALLBACK_DB.screenings.unshift(screening);
      return {
        jobId: screening.jobId,
        totalCandidates: screening.totalCandidates,
        shortlistedCount: screening.shortlistedCount,
        averageScore: screening.averageScore,
        summary: screening.summary,
        results: screening.results,
        incompleteCandidates: screening.incompleteCandidates
      };
    }
  );
}

export async function runBulkScreening(payload: { jobId: string; files: File[]; shortlistSize?: number }) {
  return withOfflineFallback(
    async () => {
      const form = new FormData();
      form.append('jobId', payload.jobId);
      if (typeof payload.shortlistSize === 'number') form.append('shortlistSize', String(payload.shortlistSize));
      payload.files.forEach((file) => form.append('files', file));

      const data = await req<any>('/api/screenings/bulk-run', { method: 'POST', body: form });
      const s = data?.screening ?? data;
      return {
        jobId: String(s?.jobId || payload.jobId || ''),
        totalCandidates: Number(s?.totalCandidates ?? 0),
        shortlistedCount: Number(s?.shortlistedCount ?? 0),
        averageScore: Number(s?.averageScore ?? 0),
        summary: s?.summary || '',
        results: Array.isArray(s?.results)
          ? s.results.map((r: any) => ({
              candidateId: String(r?.candidateId ?? r?.id ?? ''),
              rank: Number(r?.rank ?? 0),
              score: Number(r?.score ?? 0),
              scoreBreakdown: r?.scoreBreakdown ?? {},
              strengths: r?.strengths ?? [],
              gaps: r?.gaps ?? [],
              reasoning: r?.reasoning || '',
              decision: r?.decision || 'review'
            }))
          : [],
        incompleteCandidates: Array.isArray(s?.incompleteCandidates)
          ? s.incompleteCandidates.map((c: any) => ({ candidateId: String(c?.candidateId ?? c?.id ?? ''), reason: c?.reason || 'Incomplete profile' }))
          : [],
      };
    },
    async () => runScreening({ jobId: payload.jobId, candidateIds: FALLBACK_DB.candidates.map((candidate) => String(candidate.id || '')), shortlistSize: payload.shortlistSize || 20 })
  );
}

export async function exportScreening(screeningId: string): Promise<ScreeningRecord> {
  return withOfflineFallback(
    async () => {
      const data = await req<any>(`/api/screenings/${screeningId}/export`, { method: 'GET' });
      return normalizeScreening(data?.screening ?? data) as ScreeningRecord;
    },
    () => clone(FALLBACK_DB.screenings.find((screening) => String(screening.id) === String(screeningId)) || buildFallbackScreening(FALLBACK_DB.jobs[0]?.id || '', FALLBACK_DB.candidates.map((candidate) => String(candidate.id || ''))))
  );
}

// ─── Uploads ──────────────────────────────────────────────────────────────────

export async function uploadJson(fileOrJson: File | string | unknown, jobId?: string): Promise<CandidateRecord[]> {
  return withOfflineFallback(
    async () => {
      const form = new FormData();
      form.append('file', toJsonFile(fileOrJson));
      const data = await req<any>(withQuery('/api/uploads/json', { jobId }), { method: 'POST', body: form });
      return arr(data?.candidates ?? data, normalizeCandidate);
    },
    () => clone(FALLBACK_DB.candidates)
  );
}

export async function uploadCsv(file: File, jobId?: string): Promise<CandidateRecord[]> {
  return withOfflineFallback(
    async () => {
      const form = new FormData(); form.append('file', file);
      const data = await req<any>(withQuery('/api/uploads/csv', { jobId }), { method: 'POST', body: form });
      return arr(data?.candidates ?? data, normalizeCandidate);
    },
    () => clone(FALLBACK_DB.candidates)
  );
}

export async function uploadPdf(file: File, jobId?: string): Promise<CandidateRecord[]> {
  return withOfflineFallback(
    async () => {
      const form = new FormData(); form.append('file', file);
      const data = await req<any>(withQuery('/api/uploads/pdf', { jobId }), { method: 'POST', body: form });
      return arr(data?.candidates ?? data, normalizeCandidate);
    },
    () => clone(FALLBACK_DB.candidates)
  );
}

export async function uploadBulkPdf(files: File[], jobId?: string): Promise<CandidateRecord[]> {
  return withOfflineFallback(
    async () => {
      const form = new FormData();
      files.forEach((file) => form.append('files', file));
      const data = await req<any>(withQuery('/api/uploads/bulk-pdf', { jobId }), { method: 'POST', body: form });
      return arr(data?.candidates ?? data, normalizeCandidate);
    },
    () => clone(FALLBACK_DB.candidates)
  );
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
  return withOfflineFallback(
    () => req<AISettings>('/api/auth/settings', { method: 'GET' }),
    () => localSettings() || FALLBACK_DB.settings
  );
}

export async function updateSettings(payload: AISettings): Promise<AISettings> {
  return withOfflineFallback(
    async () => {
      const data = await req<any>('/api/auth/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      return data?.settings ?? payload;
    },
    () => {
      FALLBACK_DB.settings = { ...FALLBACK_DB.settings, ...payload };
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(SETTINGS_KEY, JSON.stringify({ settings: FALLBACK_DB.settings }));
      }
      return clone(FALLBACK_DB.settings);
    }
  );
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
