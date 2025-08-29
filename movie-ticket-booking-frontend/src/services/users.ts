// User service for calling backend /api/users endpoints
// Maps backend User fields to frontend expectations used in SuperAdminUsersPage

export type BackendUser = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'CUSTOMER' | 'THEATER_OWNER' | 'ADMIN' | 'SUPER_ADMIN';
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateUserPayload = {
  firstName: string;
  lastName: string;
  email: string;
  role: BackendUser['role'];
  active: boolean;
};

export type UpdateUserPayload = CreateUserPayload;

const API_BASE = (import.meta as any)?.env?.VITE_API_BASE_URL || 'http://localhost:8080';

function buildHeaders(includeJson: boolean = true): Record<string, string> {
  const headers: Record<string, string> = {};
  if (includeJson) headers['Content-Type'] = 'application/json';
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function handleJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = '';
    try { detail = await res.text(); } catch { /* ignore */ }
    throw new Error(`HTTP ${res.status} ${res.statusText}${detail ? `: ${detail}` : ''}`);
  }
  return res.json();
}

export async function listUsers(): Promise<BackendUser[]> {
  const res = await fetch(`${API_BASE}/api/users`, {
    headers: buildHeaders(true),
    credentials: 'include',
  });
  return handleJson<BackendUser[]>(res);
}

export async function getUser(id: number): Promise<BackendUser> {
  const res = await fetch(`${API_BASE}/api/users/${id}`, {
    headers: buildHeaders(true),
    credentials: 'include',
  });
  return handleJson<BackendUser>(res);
}

export async function createUser(payload: CreateUserPayload): Promise<BackendUser> {
  const res = await fetch(`${API_BASE}/api/users`, {
    method: 'POST',
    headers: buildHeaders(true),
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  return handleJson<BackendUser>(res);
}

export async function updateUser(id: number, payload: UpdateUserPayload): Promise<BackendUser> {
  const res = await fetch(`${API_BASE}/api/users/${id}`, {
    method: 'PUT',
    headers: buildHeaders(true),
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  return handleJson<BackendUser>(res);
}

export async function deleteUser(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/users/${id}`, {
    method: 'DELETE',
    headers: buildHeaders(false),
    credentials: 'include',
  });
  if (!res.ok) {
    let detail = '';
    try { detail = await res.text(); } catch { /* ignore */ }
    throw new Error(`HTTP ${res.status} ${res.statusText}${detail ? `: ${detail}` : ''}`);
  }
}
