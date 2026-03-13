// API client for Smart Visita backend
// Points to VITE_API_URL environment variable

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function getToken(): string | null {
  return localStorage.getItem('sv_token');
}

async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  return res;
}

// Auth
export async function loginAdmin(username: string, password: string) {
  const res = await apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Login failed.');
  }
  return res.json(); // { token, admin }
}

export async function verifyToken() {
  const res = await apiFetch('/api/auth/verify', { method: 'POST' });
  if (!res.ok) return null;
  return res.json(); // { valid, admin }
}

// Card extraction
export async function extractCards(images: string[]) {
  const res = await apiFetch('/api/extract-card', {
    method: 'POST',
    body: JSON.stringify({ images }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Extraction failed.');
  }
  return res.json(); // { cards }
}

// Fetch all cards from DB
export async function fetchCards() {
  const res = await apiFetch('/api/cards');
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to fetch cards.');
  }
  return res.json(); // { cards }
}

// Save newly extracted cards
export async function saveCards(cards: object[]) {
  const res = await apiFetch('/api/cards', {
    method: 'POST',
    body: JSON.stringify({ cards }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to save cards.');
  }
  return res.json();
}

// Delete a single card
export async function deleteCard(id: string) {
  const res = await apiFetch(`/api/cards/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to delete card.');
  }
  return res.json();
}

// Delete multiple cards by IDs
export async function deleteCardsBatch(ids: string[]) {
  const res = await apiFetch('/api/cards/delete-batch', {
    method: 'POST',
    body: JSON.stringify({ ids }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to delete cards.');
  }
  return res.json();
}
