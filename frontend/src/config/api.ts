/**
 * API Configuration
 * Centralized API URL configuration and helpers.
 *
 * This file normalizes the build-time `VITE_API_URL` so that whether the
 * environment contains a trailing `/api` or not, the app will always use a
 * single, consistent API base URL.
 */

// Raw environment value (might include '/api' or trailing slash)
// Default to production backend if VITE_API_URL is not set
// CRITICAL: Always use production backend (env vars not loading in Cloud Run)
const RAW = import.meta.env.VITE_API_URL || 'https://canary-backend-672344972017.europe-west1.run.app';

// Log what we're actually getting from environment
console.log('🔍 ENV CHECK:', {
  'import.meta.env.VITE_API_URL': import.meta.env.VITE_API_URL,
  'import.meta.env.MODE': import.meta.env.MODE,
  'RAW (before normalize)': RAW,
});

// Normalize: remove trailing slashes and trailing '/api' if present
function normalizeBase(raw: string): string {
  let r = raw.trim();
  // Remove trailing slashes
  while (r.endsWith('/')) r = r.slice(0, -1);
  // If it ends with '/api', strip that so we have the raw base
  if (r.toLowerCase().endsWith('/api')) {
    r = r.slice(0, -4);
  }
  return r;
}

export const RAW_BASE = normalizeBase(RAW);
// API base url always exposed with a single '/api' suffix
export const API_BASE_URL = `${RAW_BASE}/api`;

// Development logging to help debugging build-time values
if (import.meta.env.DEV) {
  console.log('🔧 API Configuration:', {
    VITE_API_URL: import.meta.env.VITE_API_URL,
    RAW_BASE,
    API_BASE_URL,
    mode: import.meta.env.MODE,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Build a full API URL from a path (path may start with or without a slash)
 */
export function getApiUrl(path: string): string {
  const clean = path.startsWith('/') ? path.slice(1) : path;
  return `${API_BASE_URL}/${clean}`;
}

export function getAuthToken(): string | null {
  return localStorage.getItem('authToken') || localStorage.getItem('auth_token');
}

export function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

// Build version: 2025-10-25
