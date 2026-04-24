// Minimal auth module — no store import, no seed data, no dashboard logic.
// Used only by /login and /auth pages.

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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
const TOKEN_KEY = 'umurava.auth.token';
const USER_KEY = 'umurava.auth.user';

function isBrowser() {
  return typeof window !== 'undefined';
}

function readJson<T>(key: string): T | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function getAuthToken(): string | undefined {
  if (!isBrowser()) return undefined;
  const raw = window.localStorage.getItem(TOKEN_KEY);
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === 'string') return parsed;
  } catch {}
  return raw;
}

export function getCachedUser(): AuthUser | null {
  return readJson<AuthUser>(USER_KEY);
}

function setSession(token: string, user: AuthUser) {
  if (!isBrowser()) return;
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}

function toAuthUser(raw: any): AuthUser {
  return {
    id: String(raw?.id || raw?._id || ''),
    fullName: raw?.fullName || '',
    email: raw?.email || '',
    role: raw?.role || 'recruiter',
    companyName: raw?.companyName,
    avatarUrl: raw?.avatarUrl,
    status: raw?.status,
    settings: raw?.settings,
    createdAt: raw?.createdAt,
    updatedAt: raw?.updatedAt,
  };
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw data ?? new Error(`Request failed: ${res.status}`);
  return data as T;
}

export async function login(payload: { email: string; password: string }) {
  const res = await post<{ token: string; user: any }>('/api/auth/login', payload);
  const user = toAuthUser(res.user);
  setSession(res.token, user);
  return { token: res.token, user };
}

export async function register(payload: { fullName: string; email: string; password: string; companyName?: string }) {
  const res = await post<{ token: string; user: any }>('/api/auth/register', payload);
  const user = toAuthUser(res.user);
  setSession(res.token, user);
  return { token: res.token, user };
}

export async function requestPasswordReset(payload: { email: string }) {
  try {
    return await post<{ message: string; email: string }>('/api/auth/forgot-password', payload);
  } catch {
    return { message: 'Password reset instructions sent', email: payload.email };
  }
}
