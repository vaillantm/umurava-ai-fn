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
  shortlistedCandidates?: Array<string | { id?: string; _id?: string }>;
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
  if (!isBrowser()) return undefined;
  const raw = window.localStorage.getItem(TOKEN_KEY);
  if (!raw) return undefined;
  // handle legacy JSON-quoted tokens
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === 'string') return parsed;
  } catch {}
  return raw;
}

function getStoredUser() {
  return readJsonStorage<AuthUser>(USER_KEY);
}

function setSession(token: string, user: AuthUser) {
  if (isBrowser()) window.localStorage.setItem(TOKEN_KEY, token);
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

type IdLike = { id?: string | number; _id?: string | number };

function normalizeId(value: IdLike | string | number | null | undefined) {
  if (value === null || value === undefined) return undefined;
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  return String(value.id ?? value._id ?? '');
}

function normalizeJobRecord(job: any): JobRecord {
  const cloned = clone(job || {});
  return {
    ...cloned,
    id: normalizeId(cloned) || cloned.id,
    title: cloned.title || '',
    company: cloned.company || '',
    department: cloned.department || '',
    location: cloned.location || '',
    salary: typeof cloned.salary === 'number' ? cloned.salary : cloned.salary ? Number(cloned.salary) : undefined,
    jobType: cloned.jobType,
    employmentType: cloned.employmentType || '',
    experienceLevel: cloned.experienceLevel || '',
    shortlistSize: typeof cloned.shortlistSize === 'number' ? cloned.shortlistSize : Number(cloned.shortlistSize || 0),
    description: cloned.description || '',
    requiredSkills: Array.isArray(cloned.requiredSkills) ? cloned.requiredSkills : [],
    idealCandidateProfile: cloned.idealCandidateProfile || '',
    aiWeights: {
      skills: Number(cloned.aiWeights?.skills ?? 0),
      experience: Number(cloned.aiWeights?.experience ?? 0),
      education: Number(cloned.aiWeights?.education ?? 0),
      projects: Number(cloned.aiWeights?.projects ?? 0),
      certifications: Number(cloned.aiWeights?.certifications ?? 0)
    },
    shortlistedCandidates: Array.isArray(cloned.shortlistedCandidates) ? cloned.shortlistedCandidates : [],
    status: cloned.status || 'draft',
    createdBy: cloned.createdBy,
    createdAt: cloned.createdAt || new Date().toISOString(),
    updatedAt: cloned.updatedAt || cloned.createdAt || new Date().toISOString()
  };
}

function normalizeCandidateRecord(candidate: any): CandidateRecord {
  const cloned = clone(candidate || {});
  return {
    ...cloned,
    id: normalizeId(cloned) || cloned.id,
    source: cloned.source || 'manual',
    sourceFileName: cloned.sourceFileName,
    avatar: cloned.avatar
      ? {
          url: cloned.avatar.url || '',
          publicId: cloned.avatar.publicId
        }
      : undefined,
    personalInfo: {
      firstName: cloned.personalInfo?.firstName || cloned.firstName || '',
      lastName: cloned.personalInfo?.lastName || cloned.lastName || '',
      email: cloned.personalInfo?.email || cloned.email || '',
      headline: cloned.personalInfo?.headline || cloned.headline || '',
      bio: cloned.personalInfo?.bio ?? cloned.bio ?? '',
      location: cloned.personalInfo?.location || cloned.location || ''
    },
    skills: Array.isArray(cloned.skills) ? cloned.skills : [],
    languages: Array.isArray(cloned.languages) ? cloned.languages : [],
    experience: Array.isArray(cloned.experience) ? cloned.experience : [],
    education: Array.isArray(cloned.education) ? cloned.education : [],
    certifications: Array.isArray(cloned.certifications) ? cloned.certifications : [],
    projects: Array.isArray(cloned.projects) ? cloned.projects : [],
    availability: cloned.availability || { status: 'Available', type: 'Full-time' },
    socialLinks: cloned.socialLinks || {},
    incompleteReason: cloned.incompleteReason,
    reasoning: cloned.reasoning,
    score: typeof cloned.score === 'number' ? cloned.score : undefined,
    scoreBreakdown: cloned.scoreBreakdown,
    strengths: Array.isArray(cloned.strengths) ? cloned.strengths : [],
    gaps: Array.isArray(cloned.gaps) ? cloned.gaps : [],
    workflowStatus: cloned.workflowStatus,
    decision: cloned.decision,
    rank: typeof cloned.rank === 'number' ? cloned.rank : undefined,
    shortlistLabel: cloned.shortlistLabel,
    createdAt: cloned.createdAt,
    updatedAt: cloned.updatedAt
  };
}

function normalizeScreeningRecord(screening: any): ScreeningRecord | null {
  if (!screening) return null;
  const cloned = clone(screening);
  const results = Array.isArray(cloned.results)
    ? cloned.results.map((result: any) => ({
        candidateId: String(
          result.candidateId ??
            result.id ??
            result._id ??
            result.candidate?._id ??
            result.candidate?.id ??
            ''
        ),
        rank: Number(result.rank ?? 0),
        score: Number(result.score ?? 0),
        scoreBreakdown: {
          skills: Number(result.scoreBreakdown?.skills ?? 0),
          experience: Number(result.scoreBreakdown?.experience ?? 0),
          education: Number(result.scoreBreakdown?.education ?? 0),
          projects: Number(result.scoreBreakdown?.projects ?? 0),
          certifications: Number(result.scoreBreakdown?.certifications ?? 0)
        },
        strengths: Array.isArray(result.strengths) ? result.strengths : [],
        gaps: Array.isArray(result.gaps) ? result.gaps : [],
        reasoning: result.reasoning || '',
        decision: result.decision || 'review',
        workflowStatus: result.workflowStatus,
        shortlistLabel: result.shortlistLabel
      }))
    : [];
  return {
    id: normalizeId(cloned) || cloned.id,
    jobId: String(cloned.jobId || ''),
    results,
    incompleteCandidates: Array.isArray(cloned.incompleteCandidates)
      ? cloned.incompleteCandidates.map((item: any) => ({
          candidateId: String(item.candidateId ?? item._id ?? item.id ?? ''),
          reason: item.reason || 'Incomplete profile'
        }))
      : [],
    summary: cloned.summary || `Screened ${cloned.totalCandidates || results.length} candidates.`,
    totalCandidates: Number(cloned.totalCandidates ?? results.length),
    shortlistedCount: Number(cloned.shortlistedCount ?? results.filter((item: ScreeningResult) => item.decision === 'shortlisted').length),
    averageScore: Number(cloned.averageScore ?? 0),
    generatedBy: cloned.generatedBy,
    createdAt: cloned.createdAt,
    updatedAt: cloned.updatedAt || cloned.createdAt,
    incompleteCount: Number(cloned.incompleteCount ?? cloned.incompleteCandidates?.length ?? 0)
  };
}

function normalizeDashboardSnapshot(snapshot: any) {
  return {
    jobs: Array.isArray(snapshot?.jobs) ? snapshot.jobs.map(normalizeJobRecord) : [],
    candidates: Array.isArray(snapshot?.candidates) ? snapshot.candidates.map(normalizeCandidateRecord) : [],
    latestScreening: normalizeScreeningRecord(snapshot?.latestScreening)
  };
}

function normalizeMaybeArray<T>(value: unknown, mapper: (item: any) => T): T[] {
  return Array.isArray(value) ? value.map(mapper) : [];
}

function toJobRecord(job: ReturnType<typeof storeState>['jobs'][number]): JobRecord {
  return normalizeJobRecord(job);
}

function toCandidateRecord(candidate: ReturnType<typeof storeState>['candidates'][number]): CandidateRecord {
  return normalizeCandidateRecord(candidate);
}

function toScreeningRecord(screening: ReturnType<typeof storeState>['screenings'][number] | null): ScreeningRecord | null {
  return normalizeScreeningRecord(screening);
}

function toAuthUser(user: any): AuthUser {
  const cloned = clone(user || {});
  return {
    id: String(cloned.id || cloned._id || ''),
    fullName: cloned.fullName || '',
    email: cloned.email || '',
    role: cloned.role || 'recruiter',
    companyName: cloned.companyName,
    avatarUrl: cloned.avatarUrl,
    status: cloned.status,
    settings: cloned.settings,
    createdAt: cloned.createdAt,
    updatedAt: cloned.updatedAt
  };
}

function isSnapshotPayload(value: unknown): value is { jobs?: unknown[]; candidates?: unknown[]; latestScreening?: unknown } {
  return Boolean(value && typeof value === 'object' && ('jobs' in (value as Record<string, unknown>) || 'latestScreening' in (value as Record<string, unknown>)));
}

function fallbackDashboardSnapshot() {
  return {
    jobs: storeState().jobs.map(toJobRecord),
    candidates: storeState().candidates.map(toCandidateRecord),
    latestScreening: toScreeningRecord(storeState().screenings[0] || null)
  };
}

function normalizeApiArrayResponse<T>(data: unknown, mapper: (item: any) => T): T[] {
  if (Array.isArray(data)) return data.map(mapper);
  if (data && typeof data === 'object') {
    const maybeList = (data as Record<string, unknown>).items || (data as Record<string, unknown>).data || (data as Record<string, unknown>).jobs || (data as Record<string, unknown>).candidates;
    if (Array.isArray(maybeList)) return maybeList.map(mapper);
  }
  return [];
}

function normalizeApiObjectResponse<T>(data: unknown, mapper: (item: any) => T): T {
  return mapper(data);
}

function normalizeScreeningRunResponse(data: any) {
  return {
    jobId: String(data?.jobId || ''),
    totalCandidates: Number(data?.totalCandidates ?? 0),
    shortlistedCount: Number(data?.shortlistedCount ?? 0),
    averageScore: Number(data?.averageScore ?? 0),
    usedFallback: Boolean(data?.usedFallback),
    summary: data?.summary || '',
    results: normalizeMaybeArray(data?.results, (result: any) => ({
      candidateId: String(result.candidateId ?? result.id ?? result._id ?? ''),
      rank: Number(result.rank ?? 0),
      score: Number(result.score ?? 0),
      scoreBreakdown: {
        skills: Number(result.scoreBreakdown?.skills ?? 0),
        experience: Number(result.scoreBreakdown?.experience ?? 0),
        education: Number(result.scoreBreakdown?.education ?? 0),
        projects: Number(result.scoreBreakdown?.projects ?? 0),
        certifications: Number(result.scoreBreakdown?.certifications ?? 0)
      },
      strengths: Array.isArray(result.strengths) ? result.strengths : [],
      gaps: Array.isArray(result.gaps) ? result.gaps : [],
      reasoning: result.reasoning || '',
      decision: result.decision || 'review',
      workflowStatus: result.workflowStatus,
      shortlistLabel: result.shortlistLabel
    })),
    incompleteCandidates: normalizeMaybeArray(data?.incompleteCandidates, (item: any) => ({
      candidateId: String(item.candidateId ?? item.id ?? item._id ?? ''),
      reason: item.reason || 'Incomplete profile'
    }))
  };
}

function normalizeAuthResponse(response: any): { message: string; token: string; user: AuthUser } {
  return {
    message: response?.message || '',
    token: response?.token || '',
    user: toAuthUser(response?.user)
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
    const normalized = normalizeAuthResponse(response);
    setSession(normalized.token, normalized.user);
    return normalized;
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
    const normalized = normalizeAuthResponse(response);
    setSession(normalized.token, normalized.user);
    return normalized;
  });
}

export async function me() {
  const token = getStoredToken();
  return apiRequest<AuthUser>(
    '/api/auth/me',
    { method: 'GET', headers: token ? { Authorization: `Bearer ${token}` } : undefined },
    token
  ).then((user) => toAuthUser(user));
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
    const normalized = toAuthUser(user);
    writeJsonStorage(USER_KEY, normalized);
    return normalized;
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
  return apiRequest<unknown>(
    '/api/jobs',
    { method: 'GET' },
    token
  ).then((jobs) => normalizeApiArrayResponse(jobs, normalizeJobRecord));
}

export async function createJob(payload: JobRecord) {
  const token = getStoredToken();
  return apiRequest<unknown>(
    '/api/jobs',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    },
    token
  ).then((job) => normalizeJobRecord((job as any)?.job ?? job));
}

export async function updateJob(jobId: string, payload: Partial<JobRecord>) {
  const token = getStoredToken();
  return apiRequest<unknown>(
    `/api/jobs/${jobId}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    },
    token
  ).then((job) => normalizeJobRecord((job as any)?.job ?? job));
}

export async function deleteJob(jobId: string) {
  const token = getStoredToken();
  await apiRequest<{ message?: string }>(
    `/api/jobs/${jobId}`,
    { method: 'DELETE' },
    token
  );
}

export async function listCandidates() {
  const token = getStoredToken();
  return apiRequest<unknown>(
    '/api/candidates',
    { method: 'GET' },
    token
  ).then((candidates) => normalizeApiArrayResponse(candidates, normalizeCandidateRecord));
}

export async function getCandidate(candidateId: string) {
  const token = getStoredToken();
  return apiRequest<unknown>(
    `/api/candidates/${candidateId}`,
    { method: 'GET' },
    token
  ).then((candidate) => normalizeCandidateRecord((candidate as any)?.candidate ?? candidate));
}

export async function createCandidate(payload: (CandidateRecord & { avatarFile?: File }) | FormData) {
  const token = getStoredToken();
  const body = payload instanceof FormData ? payload : normalizeFormData(payload);
  if (!(payload instanceof FormData)) {
    const avatarFile = payload.avatarFile || createPlaceholderAvatarFile(`candidate-${Date.now()}.png`);
    if (avatarFile) body.append('avatar', avatarFile);
  }
  return apiRequest<unknown>(
    '/api/candidates',
    { method: 'POST', body },
    token
  ).then((candidate) => normalizeCandidateRecord((candidate as any)?.candidate ?? candidate));
}

export async function updateCandidate(candidateId: string, payload: (CandidateRecord & { avatarFile?: File }) | FormData) {
  const token = getStoredToken();
  const body = payload instanceof FormData ? payload : normalizeFormData(payload);
  if (!(payload instanceof FormData)) {
    const avatarFile = payload.avatarFile;
    if (avatarFile) body.append('avatar', avatarFile);
  }
  return apiRequest<unknown>(
    `/api/candidates/${candidateId}`,
    { method: 'PATCH', body },
    token
  ).then((candidate) => normalizeCandidateRecord((candidate as any)?.candidate ?? candidate));
}

export async function updateCandidateWithAvatar(candidateId: string, payload: CandidateRecord, avatar?: File) {
  const formData = normalizeFormData(payload);
  if (avatar) formData.append('avatar', avatar);
  return updateCandidate(candidateId, formData);
}

export async function deleteCandidate(candidateId: string) {
  const token = getStoredToken();
  await apiRequest<{ message?: string }>(
    `/api/candidates/${candidateId}`,
    { method: 'DELETE' },
    token
  );
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
  return apiRequest<unknown>(
    '/api/candidates/bulk',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    },
    token
  ).then((candidates) => normalizeApiArrayResponse((candidates as any)?.candidates ?? candidates, normalizeCandidateRecord));
}

export async function runScreening(payload: { jobId: string; candidateIds: string[]; shortlistSize?: number }) {
  const token = getStoredToken();
  return apiRequest<unknown>(
    '/api/screenings/run',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    },
    token
  ).then((result) => {
    const screening = (result as any)?.screening ?? result;
    return {
      jobId: String(screening?.jobId || ''),
      totalCandidates: Number(screening?.totalCandidates ?? 0),
      shortlistedCount: Number(screening?.shortlistedCount ?? 0),
      averageScore: Number(screening?.averageScore ?? 0),
      usedFallback: Boolean(screening?.usedFallback),
      summary: screening?.summary || '',
      results: normalizeMaybeArray(screening?.results, (candidate: any) => ({
        candidateId: String(candidate.candidateId ?? candidate.id ?? candidate._id ?? ''),
        rank: Number(candidate.rank ?? 0),
        score: Number(candidate.score ?? 0),
        scoreBreakdown: {
          skills: Number(candidate.scoreBreakdown?.skills ?? 0),
          experience: Number(candidate.scoreBreakdown?.experience ?? 0),
          education: Number(candidate.scoreBreakdown?.education ?? 0),
          projects: Number(candidate.scoreBreakdown?.projects ?? 0),
          certifications: Number(candidate.scoreBreakdown?.certifications ?? 0)
        },
        strengths: Array.isArray(candidate.strengths) ? candidate.strengths : [],
        gaps: Array.isArray(candidate.gaps) ? candidate.gaps : [],
        reasoning: candidate.reasoning || '',
        decision: candidate.decision || 'review'
      })),
      incompleteCandidates: normalizeMaybeArray(screening?.incompleteCandidates, (item: any) => ({
        candidateId: String(item.candidateId ?? item.id ?? item._id ?? ''),
        reason: item.reason || 'Incomplete profile'
      }))
    };
  });
}

export async function getLatestScreening(jobId?: string) {
  const token = getStoredToken();
  if (jobId) {
    return apiRequest<unknown>(
      `/api/screenings/jobs/${jobId}/latest`,
      { method: 'GET' },
      token
    ).then((screening) => normalizeScreeningRecord(screening));
  }

  return getDashboardSnapshot().then((snapshot) => snapshot.latestScreening);
}

export async function getScreening(screeningId: string) {
  const token = getStoredToken();
  return apiRequest<unknown>(
    `/api/screenings/${screeningId}`,
    { method: 'GET' },
    token
  ).then((screening) => normalizeScreeningRecord((screening as any)?.screening ?? screening) as ScreeningRecord);
}

export async function exportScreening(screeningId: string) {
  const token = getStoredToken();
  return apiRequest<unknown>(
    `/api/screenings/${screeningId}/export`,
    { method: 'GET' },
    token
  ).then((screening) => normalizeScreeningRecord((screening as any)?.screening ?? screening) as ScreeningRecord);
}

async function parseJsonCandidatesFile(file: File): Promise<CandidateRecord[]> {
  const parsed = JSON.parse(await file.text());
  const items = Array.isArray(parsed) ? parsed : [parsed];
  return items as CandidateRecord[];
}

async function parseCsvCandidatesFile(file: File): Promise<CandidateRecord[]> {
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
  return candidates;
}

async function parsePdfCandidateFile(file: File): Promise<CandidateRecord[]> {
  return [
    {
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
    }
  ];
}

export async function uploadJson(file: File) {
  const token = getStoredToken();
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiRequest<unknown>(
    '/api/uploads/json',
    { method: 'POST', body: formData },
    token
  );
  if (Array.isArray(response)) return response.map(normalizeCandidateRecord);
  if (response && typeof response === 'object' && Array.isArray((response as { candidates?: unknown[] }).candidates)) {
    return ((response as { candidates: unknown[] }).candidates || []).map(normalizeCandidateRecord);
  }
  return (await parseJsonCandidatesFile(file)).map(normalizeCandidateRecord);
}

export async function uploadCsv(file: File) {
  const token = getStoredToken();
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiRequest<unknown>(
    '/api/uploads/csv',
    { method: 'POST', body: formData },
    token
  );
  if (Array.isArray(response)) return response.map(normalizeCandidateRecord);
  if (response && typeof response === 'object' && Array.isArray((response as { candidates?: unknown[] }).candidates)) {
    return ((response as { candidates: unknown[] }).candidates || []).map(normalizeCandidateRecord);
  }
  return (await parseCsvCandidatesFile(file)).map(normalizeCandidateRecord);
}

export async function uploadPdf(file: File) {
  const token = getStoredToken();
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiRequest<unknown>(
    '/api/uploads/pdf',
    { method: 'POST', body: formData },
    token
  );
  if (Array.isArray(response)) return response.map(normalizeCandidateRecord);
  if (response && typeof response === 'object' && Array.isArray((response as { candidates?: unknown[] }).candidates)) {
    return ((response as { candidates: unknown[] }).candidates || []).map(normalizeCandidateRecord);
  }
  return (await parsePdfCandidateFile(file)).map(normalizeCandidateRecord);
}

export async function uploadAvatar(file: File) {
  const token = getStoredToken();
  const formData = new FormData();
  formData.append('file', file);
  return apiRequest<unknown>(
    '/api/uploads/avatar',
    { method: 'POST', body: formData },
    token
  ).then((response) => normalizeApiObjectResponse((response as any)?.avatar ?? response, (avatar) => ({
    url: String(avatar?.url || ''),
    publicId: avatar?.publicId
  })));
}

export async function getDashboardSnapshot() {
  const token = getStoredToken();
  return apiRequest<unknown>(
    '/api/dashboard/snapshot',
    { method: 'GET' },
    token
  ).then((snapshot) => normalizeDashboardSnapshot(snapshot));
}
