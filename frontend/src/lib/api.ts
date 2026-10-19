/**
 * Personal Workspace API Client
 * Same-Origin Architecture: Uses relative URLs (/api/...)
 */

export function getCsrfToken(): string | null {
  const match = document.cookie.match(/(^|;)\s*XSRF-TOKEN\s*=\s*([^;]+)/);
  return match ? decodeURIComponent(match[2]) : null;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // Enforce same-origin relative URL starting with /api
  let path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (!path.startsWith('/api/') && path !== '/api') {
    path = `/api${path}`;
  }
  const url = path;

  const headers = new Headers(options.headers || {});
  headers.set('Accept', 'application/json');

  if (options.body && typeof options.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // Double-submit CSRF cookie token on mutating requests
  const method = (options.method || 'GET').toUpperCase();
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      headers.set('X-XSRF-TOKEN', csrfToken);
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'same-origin', // use session cookies
  });

  if (!response.ok) {
    let errorDetail = `İstek başarısız oldu (${response.status})`;
    try {
      const errorJson = await response.json();
      if (errorJson.detail) {
        errorDetail = errorJson.detail;
      } else if (errorJson.message) {
        errorDetail = errorJson.message;
      }
    } catch {
      // not JSON
    }
    throw new Error(errorDetail);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
