import { umuravaStore } from '@/lib/umurava-store';

export type UserRole = 'recruiter' | 'admin';

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  companyName?: string;
  avatarUrl?: string;
  status?: 'active' | 'inactive' | 'suspended';
  settings?: {
    primaryModel?: string;
    batchOutput?: boolean;
    explainableStructuring?: boolean;
    biasDetection?: boolean;
    promptContext?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CandidateRecord {
  id?: string;
  source: 'manual' | 'json' | 'csv' | 'pdf' | 'bulk';
  sourceFileName?: string;
  avatar?: { url: string; publicId?: string };
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    headline: string;
    bio?: string;
    location: string;
  };
  skills?: Array<{ name: string; level: string; yearsOfExperience: number }>;
  languages?: Array<{ name: string; proficiency: string }>;
  experience?: Array<{
    company: string;
    role: string;
    startDate: string;
    endDate?: string;
    description?: string;
    technologies?: string[];
    isCurrent?: boolean;
    yearsOfExperience?: number;
  }>;
  education?: Array<{
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startYear: number;
    endYear?: number;
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
    issueDate: string;
  }>;
  projects?: Array<{
    name: string;
    description: string;
    technologies: string[];
    role: string;
    link?: string;
    startDate: string;
    endDate?: string;
  }>;
  availability?: {
    status: string;
    type: string;
    startDate?: string;
  };
  socialLinks?: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

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
  aiWeights?: {
    skills: number;
    experience: number;
    education: number;
    projects: number;
    certifications: number;
  };
  status?: 'draft' | 'active' | 'closed';
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ScreeningResult {
  candidateId: string;
  rank: number;
  score: number;
  scoreBreakdown: {
    skills?: number;
    experience?: number;
    education?: number;
    projects?: number;
    certifications?: number;
  };
  strengths: string[];
  gaps: string[];
  reasoning: string;
  decision: 'shortlisted' | 'review' | 'rejected';
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

type ApiErrorShape = { message: string; errors?: unknown };

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
const TOKEN_KEY = 'umurava.auth.token';
const USER_KEY = 'umurava.auth.user';

function isBrowser() {
  return typeof window !== 'undefined';
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function readJsonStorage<T>(key: string): T | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeJsonStorage<T>(key: string, value: T) {
  if (!isBrowser()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function removeStorage(key: string) {
  if (!isBrowser()) return;
  window.localStorage.removeItem(key);
}

function getStoredToken() {
  return isBrowser() ? window.localStorage.getItem(TOKEN_KEY) || undefined : undefined;
}

function getStoredUser() {
  return readJsonStorage<AuthUser>(USER_KEY);
}

function setSession(token: string, user: AuthUser) {
  writeJsonStorage(TOKEN_KEY, token);
  writeJsonStorage(USER_KEY, user);
}

function clearSession() {
  removeStorage(TOKEN_KEY);
  removeStorage(USER_KEY);
}

async function apiRequest<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const error = data as ApiErrorShape | null;
    throw error ?? new Error(`Request failed: ${response.status}`);
  }

  return data as T;
}

async function safeRequest<T>(path: string, options: RequestInit, fallback: () => Promise<T> | T, token?: string) {
  try {
    return await apiRequest<T>(path, options, token);
  } catch {
    return await fallback();
  }
}

function storeState() {
  return umuravaStore.getState();
}

function toJobRecord(job: ReturnType<typeof storeState>['jobs'][number]): JobRecord {
  return clone(job) as JobRecord;
}

function toCandidateRecord(candidate: ReturnType<typeof storeState>['candidates'][number]): CandidateRecord {
  return clone(candidate) as CandidateRecord;
}

function toScreeningRecord(screening: ReturnType<typeof storeState>['screenings'][number] | null): ScreeningRecord | null {
  if (!screening) return null;
  return {
    id: screening.id,
    jobId: screening.jobId,
    results: screening.results.map((result) => ({
      candidateId: String((result as { id?: string | number }).id || ''),
      rank: result.rank,
      score: result.score,
      scoreBreakdown: result.scoreBreakdown,
      strengths: result.strengths,
      gaps: result.gaps,
      reasoning: result.reasoning || '',
      decision: result.decision as ScreeningResult['decision']
    })),
    incompleteCandidates: screening.incompleteCandidates.map((item) => ({
      candidateId: String(item.candidateId),
      reason: item.reason
    })),
    summary: `Screened ${screening.totalCandidates} candidates and shortlisted ${screening.shortlistedCount}.`,
    totalCandidates: screening.totalCandidates,
    shortlistedCount: screening.shortlistedCount,
    averageScore: screening.averageScore,
    generatedBy: screening.generatedBy,
    createdAt: screening.createdAt,
    updatedAt: screening.createdAt
  };
}

function upsertLocalJob(job: Partial<JobRecord> & { id?: string }) {
  const state = storeState();
  const existing = state.jobs.find((item) => item.id === job.id);
  const next = {
    ...clone(existing ?? state.jobs[0]),
    ...clone(job),
    id: job.id || `job_${Date.now()}`,
    createdAt: existing?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  if (existing) {
    state.jobs = state.jobs.map((item) => (item.id === next.id ? (next as typeof item) : item));
  } else {
    state.jobs.unshift(next as typeof state.jobs[number]);
  }
  state.activeJobId = next.id;
  umuravaStore.persist();
  return next as JobRecord;
}

function removeLocalJob(jobId: string) {
  const state = storeState();
  const nextJobs = state.jobs.filter((job) => job.id !== jobId);
  if (!nextJobs.length) return;
  state.jobs = nextJobs;
  if (state.activeJobId === jobId) {
    state.activeJobId = state.jobs[0]?.id || '';
  }
  umuravaStore.persist();
}

function upsertLocalCandidate(candidate: CandidateRecord) {
  const state = storeState();
  const normalized = clone(candidate);
  if (!normalized.id) normalized.id = `cand_${Date.now()}`;
  const index = state.candidates.findIndex((item) => String(item.id) === String(normalized.id));
  if (index >= 0) {
    state.candidates[index] = normalized as typeof state.candidates[number];
  } else {
    state.candidates.push(normalized as typeof state.candidates[number]);
  }
  umuravaStore.persist();
  return normalized;
}

function removeLocalCandidate(candidateId: string) {
  const state = storeState();
  state.candidates = state.candidates.filter((candidate) => String(candidate.id) !== String(candidateId));
  umuravaStore.persist();
}

function normalizeFormData(payload: CandidateRecord | FormData) {
  if (payload instanceof FormData) return payload;
  const formData = new FormData();
  formData.append('personalInfo', JSON.stringify(payload.personalInfo));
  formData.append('skills', JSON.stringify(payload.skills ?? []));
  formData.append('languages', JSON.stringify(payload.languages ?? []));
  formData.append('experience', JSON.stringify(payload.experience ?? []));
  formData.append('education', JSON.stringify(payload.education ?? []));
  formData.append('certifications', JSON.stringify(payload.certifications ?? []));
  formData.append('projects', JSON.stringify(payload.projects ?? []));
  formData.append('availability', JSON.stringify(payload.availability ?? {}));
  formData.append('socialLinks', JSON.stringify(payload.socialLinks ?? {}));
  return formData;
}

function createPlaceholderAvatarFile(name = 'avatar.png') {
  if (!isBrowser()) return undefined;
  const bytes = Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO7pX9EAAAAASUVORK5CYII='), (char) => char.charCodeAt(0));
  return new File([bytes], name, { type: 'image/png' });
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}

export function getAuthToken() {
  return getStoredToken();
}

export function getCachedUser() {
  return getStoredUser();
}

export async function login(payload: { email: string; password: string }) {
  return apiRequest<{ message: string; token: string; user: AuthUser }>(
    '/api/auth/login',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    },
  ).then((response) => {
    setSession(response.token, response.user);
    return response;
  });
}

export async function register(payload: { fullName: string; email: string; password: string; companyName?: string }) {
  return apiRequest<{ message: string; token: string; user: AuthUser }>(
    '/api/auth/register',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    },
  ).then((response) => {
    setSession(response.token, response.user);
    return response;
  });
}

export async function me() {
  const token = getStoredToken();
  return apiRequest<AuthUser>(
    '/api/auth/me',
    { method: 'GET', headers: token ? { Authorization: `Bearer ${token}` } : undefined },
    token
  );
}

export async function logout() {
  const token = getStoredToken();
  await apiRequest<{ message?: string }>(
    '/api/auth/logout',
    { method: 'POST', headers: token ? { Authorization: `Bearer ${token}` } : undefined },
    token
  );
  clearSession();
}

export async function updateProfile(payload: { fullName?: string; companyName?: string; avatar?: File }) {
  const token = getStoredToken();
  const formData = new FormData();
  if (payload.fullName) formData.append('fullName', payload.fullName);
  if (payload.companyName) formData.append('companyName', payload.companyName);
  if (payload.avatar) formData.append('avatar', payload.avatar);

  return apiRequest<AuthUser>(
    '/api/auth/profile',
    {
      method: 'PATCH',
      body: formData,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined
    },
    token
  ).then((user) => {
    writeJsonStorage(USER_KEY, user);
    return user;
  });
}

export async function getSettings() {
  const token = getStoredToken();
  return safeRequest<NonNullable<AuthUser['settings']>>(
    '/api/auth/settings',
    { method: 'GET' },
    () =>
      getStoredUser()?.settings || {
        primaryModel: 'gemini-2.5-pro',
        batchOutput: true,
        explainableStructuring: true,
        biasDetection: true,
        promptContext: ''
      },
    token
  );
}

export async function updateSettings(payload: NonNullable<AuthUser['settings']>) {
  const token = getStoredToken();
  return safeRequest<{ message?: string; settings: NonNullable<AuthUser['settings']> }>(
    '/api/auth/settings',
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    },
    () => {
      const current = getStoredUser();
      if (current) {
        writeJsonStorage(USER_KEY, { ...current, settings: payload });
      }
      return { message: 'Settings updated locally', settings: payload };
    },
    token
  ).then((response) => {
    const current = getStoredUser();
    if (current) writeJsonStorage(USER_KEY, { ...current, settings: response.settings });
    return response.settings;
  });
}

export async function listJobs() {
  const token = getStoredToken();
  return safeRequest<JobRecord[]>(
    '/api/jobs',
    { method: 'GET' },
    () => storeState().jobs.map(toJobRecord),
    token
  );
}

export async function createJob(payload: JobRecord) {
  const token = getStoredToken();
  return safeRequest<JobRecord>(
    '/api/jobs',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    },
    () => upsertLocalJob(payload),
    token
  );
}

export async function updateJob(jobId: string, payload: Partial<JobRecord>) {
  const token = getStoredToken();
  return safeRequest<JobRecord>(
    `/api/jobs/${jobId}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    },
    () => upsertLocalJob({ ...payload, id: jobId }),
    token
  );
}

export async function deleteJob(jobId: string) {
  const token = getStoredToken();
  await safeRequest<{ message?: string }>(
    `/api/jobs/${jobId}`,
    { method: 'DELETE' },
    () => {
      removeLocalJob(jobId);
      return { message: 'Deleted locally' };
    },
    token
  );
  removeLocalJob(jobId);
}

export async function listCandidates() {
  const token = getStoredToken();
  return safeRequest<CandidateRecord[]>(
    '/api/candidates',
    { method: 'GET' },
    () => storeState().candidates.map(toCandidateRecord),
    token
  );
}

export async function getCandidate(candidateId: string) {
  const token = getStoredToken();
  return safeRequest<CandidateRecord>(
    `/api/candidates/${candidateId}`,
    { method: 'GET' },
    () => {
      const candidate = storeState().candidates.find((item) => String(item.id) === String(candidateId)) || storeState().candidates[0];
      if (!candidate) {
        return {
          source: 'manual',
          personalInfo: {
            firstName: '',
            lastName: '',
            email: '',
            headline: '',
            location: ''
          }
        };
      }
      return toCandidateRecord(candidate);
    },
    token
  );
}

export async function createCandidate(payload: (CandidateRecord & { avatarFile?: File }) | FormData) {
  const token = getStoredToken();
  const body = payload instanceof FormData ? payload : normalizeFormData(payload);
  if (!(payload instanceof FormData)) {
    const avatarFile = payload.avatarFile || createPlaceholderAvatarFile(`candidate-${Date.now()}.png`);
    if (avatarFile) body.append('avatar', avatarFile);
  }
  return safeRequest<CandidateRecord>(
    '/api/candidates',
    { method: 'POST', body },
    () => upsertLocalCandidate(payload instanceof FormData ? ({ source: 'manual', personalInfo: { firstName: 'Imported', lastName: 'Candidate', email: `candidate-${Date.now()}@umurava.ai`, headline: 'Imported candidate', location: 'Unknown' } } as CandidateRecord) : payload),
    token
  );
}

export async function updateCandidate(candidateId: string, payload: (CandidateRecord & { avatarFile?: File }) | FormData) {
  const token = getStoredToken();
  const body = payload instanceof FormData ? payload : normalizeFormData(payload);
  if (!(payload instanceof FormData)) {
    const avatarFile = payload.avatarFile;
    if (avatarFile) body.append('avatar', avatarFile);
  }
  return safeRequest<CandidateRecord>(
    `/api/candidates/${candidateId}`,
    { method: 'PATCH', body },
    () => {
      const current = storeState().candidates.find((candidate) => String(candidate.id) === String(candidateId));
      const base: CandidateRecord = current
        ? (clone(current) as CandidateRecord)
        : {
            id: candidateId,
            source: 'manual',
            personalInfo: {
              firstName: '',
              lastName: '',
              email: '',
              headline: '',
              location: ''
            }
          };
      return upsertLocalCandidate({
        ...base,
        ...(payload instanceof FormData ? {} : payload),
        id: candidateId
      });
    },
    token
  );
}

export async function updateCandidateWithAvatar(candidateId: string, payload: CandidateRecord, avatar?: File) {
  const formData = normalizeFormData(payload);
  if (avatar) formData.append('avatar', avatar);
  return updateCandidate(candidateId, formData);
}

export async function deleteCandidate(candidateId: string) {
  const token = getStoredToken();
  await safeRequest<{ message?: string }>(
    `/api/candidates/${candidateId}`,
    { method: 'DELETE' },
    () => {
      removeLocalCandidate(candidateId);
      return { message: 'Deleted locally' };
    },
    token
  );
  removeLocalCandidate(candidateId);
}

export async function requestPasswordReset(payload: { email: string }) {
  return safeRequest<{ message: string; email: string }>(
    '/api/auth/forgot-password',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    },
    () => ({ message: 'Password reset instructions sent', email: payload.email })
  );
}

export async function bulkCreateCandidates(payload: CandidateRecord[]) {
  const token = getStoredToken();
  return safeRequest<CandidateRecord[]>(
    '/api/candidates/bulk',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    },
    () => payload.map(upsertLocalCandidate),
    token
  );
}

export async function runScreening(payload: { jobId: string; candidateIds: string[]; shortlistSize?: number }) {
  const token = getStoredToken();
  return safeRequest<{
    jobId: string;
    totalCandidates: number;
    shortlistedCount: number;
    averageScore: number;
    usedFallback: boolean;
    summary: string;
    results: ScreeningResult[];
    incompleteCandidates: Array<{ candidateId: string; reason: string }>;
  }>(
    '/api/screenings/run',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    },
    () => {
      const screening = umuravaStore.runScreening(payload.jobId, { shortlistSize: payload.shortlistSize });
      return {
        jobId: screening.jobId,
        totalCandidates: screening.totalCandidates,
        shortlistedCount: screening.shortlistedCount,
        averageScore: screening.averageScore,
        usedFallback: true,
        summary: `Screened ${screening.totalCandidates} candidates and shortlisted ${screening.shortlistedCount}.`,
        results: screening.results.map((candidate) => ({
          candidateId: String(candidate.id),
          rank: candidate.rank,
          score: candidate.score,
          scoreBreakdown: candidate.scoreBreakdown,
          strengths: candidate.strengths,
          gaps: candidate.gaps,
          reasoning: candidate.reasoning || '',
          decision: candidate.decision as ScreeningResult['decision']
        })),
        incompleteCandidates: screening.incompleteCandidates.map((item) => ({
          candidateId: String(item.candidateId),
          reason: item.reason
        }))
      };
    },
    token
  );
}

export async function getLatestScreening(jobId?: string) {
  const token = getStoredToken();
  const localFallback = () => {
    const latest = jobId
      ? storeState().screenings.find((screening) => screening.jobId === jobId) || storeState().screenings[0] || null
      : storeState().screenings[0] || null;
    return toScreeningRecord(latest);
  };

  if (jobId) {
    return safeRequest<ScreeningRecord | null>(
      `/api/screenings/jobs/${jobId}/latest`,
      { method: 'GET' },
      localFallback,
      token
    );
  }

  return localFallback();
}

export async function getScreening(screeningId: string) {
  const token = getStoredToken();
  return safeRequest<ScreeningRecord>(
    `/api/screenings/${screeningId}`,
    { method: 'GET' },
    () => toScreeningRecord(storeState().screenings.find((screening) => screening.id === screeningId) || storeState().screenings[0]) as ScreeningRecord,
    token
  );
}

export async function exportScreening(screeningId: string) {
  const token = getStoredToken();
  return safeRequest<ScreeningRecord>(
    `/api/screenings/${screeningId}/export`,
    { method: 'GET' },
    () => toScreeningRecord(storeState().screenings.find((screening) => screening.id === screeningId) || storeState().screenings[0]) as ScreeningRecord,
    token
  );
}

export async function uploadJson(file: File) {
  const token = getStoredToken();
  const formData = new FormData();
  formData.append('file', file);
  return safeRequest<CandidateRecord[]>(
    '/api/uploads/json',
    { method: 'POST', body: formData },
    async () => {
      const parsed = JSON.parse(await file.text());
      const items = Array.isArray(parsed) ? parsed : [parsed];
      return bulkCreateCandidates(items as CandidateRecord[]);
    },
    token
  );
}

export async function uploadCsv(file: File) {
  const token = getStoredToken();
  const formData = new FormData();
  formData.append('file', file);
  return safeRequest<CandidateRecord[]>(
    '/api/uploads/csv',
    { method: 'POST', body: formData },
    async () => {
      const text = await file.text();
      const lines = text.trim().split('\n').filter(Boolean);
      const headers = lines[0]?.split(',').map((item) => item.trim().replace(/"/g, '')) || [];
      const candidates: CandidateRecord[] = [];
      lines.slice(1).forEach((line) => {
        const values = line.split(',').map((item) => item.trim().replace(/"/g, ''));
        const row: Record<string, string> = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        if (!row.firstName || !row.lastName || !row.email) return;
        candidates.push({
          source: 'csv',
          personalInfo: {
            firstName: row.firstName,
            lastName: row.lastName,
            email: row.email,
            headline: row.headline || 'Candidate',
            location: row.location || 'Unknown',
            bio: ''
          },
          skills: row.skills ? row.skills.split(';').map((skill) => ({ name: skill.trim(), level: 'Intermediate', yearsOfExperience: Number(row.yearsExperience) || 1 })) : [],
          languages: [],
          experience: row.company ? [{ company: row.company, role: row.role || 'Professional', startDate: '2020-01', endDate: 'Present', description: '', technologies: [], isCurrent: true }] : [],
          education: row.degree ? [{ institution: 'University', degree: row.degree, fieldOfStudy: 'General', startYear: 2016, endYear: 2020 }] : [],
          certifications: [],
          projects: [],
          availability: { status: row.availability || 'Available', type: 'Full-time' },
          socialLinks: {}
        });
      });
      return bulkCreateCandidates(candidates);
    },
    token
  );
}

export async function uploadPdf(file: File) {
  const token = getStoredToken();
  const formData = new FormData();
  formData.append('file', file);
  return safeRequest<CandidateRecord[]>(
    '/api/uploads/pdf',
    { method: 'POST', body: formData },
    () => {
      const candidate: CandidateRecord = {
        source: 'pdf',
        sourceFileName: file.name,
        personalInfo: {
          firstName: file.name.split('.')[0].split('_')[0] || 'Candidate',
          lastName: file.name.split('_')[1] || 'PDF',
          email: `candidate-${Date.now()}@parsed.ai`,
          headline: 'Parsed from PDF Resume',
          location: 'Kigali, Rwanda',
          bio: 'Extracted via local fallback parsing.'
        },
        skills: [{ name: 'Node.js', level: 'Intermediate', yearsOfExperience: 2 }],
        languages: [],
        experience: [{ company: 'Previous Company', role: 'Professional', startDate: '2021-01', endDate: 'Present', description: 'Extracted from PDF.', technologies: [], isCurrent: true }],
        education: [{ institution: 'University', degree: "Bachelor's", fieldOfStudy: 'Computer Science', startYear: 2017, endYear: 2021 }],
        certifications: [],
        projects: [],
        availability: { status: 'Available', type: 'Full-time' },
        socialLinks: {}
      };
      return [upsertLocalCandidate(candidate)];
    },
    token
  );
}

export async function uploadAvatar(file: File) {
  const token = getStoredToken();
  const formData = new FormData();
  formData.append('file', file);
  return safeRequest<{ url: string; publicId?: string }>(
    '/api/uploads/avatar',
    { method: 'POST', body: formData },
    () => ({ url: URL.createObjectURL(file) }),
    token
  );
}

export async function getDashboardSnapshot() {
  const [jobs, candidates, latestScreening] = await Promise.all([listJobs(), listCandidates(), getLatestScreening()]);
  return {
    jobs,
    candidates,
    latestScreening
  };
}
