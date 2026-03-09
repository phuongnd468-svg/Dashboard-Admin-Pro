export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

type QueryValue = string | number | boolean | null | undefined;

type ApiRequestOptions = Omit<RequestInit, 'body'> & {
  body?: BodyInit | object | null;
  query?: Record<string, QueryValue>;
  timeoutMs?: number;
};

const DEFAULT_TIMEOUT_MS = 10000;

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
}

export function getApiBaseUrl() {
  return normalizeBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL ?? '/api');
}

function buildApiUrl(path: string, query?: Record<string, QueryValue>) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const isAbsolute = /^https?:\/\//.test(path);
  const url = new URL(
    isAbsolute ? path : `${getApiBaseUrl()}${normalizedPath}`,
    typeof window === 'undefined' ? 'http://localhost' : window.location.origin,
  );

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        return;
      }
      url.searchParams.set(key, String(value));
    });
  }

  if (isAbsolute || getApiBaseUrl().startsWith('http')) {
    return url.toString();
  }

  return `${url.pathname}${url.search}`;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Object.prototype.toString.call(value) === '[object Object]';
}

function normalizeResponseBody<T>(payload: unknown): T {
  if (isPlainObject(payload) && 'data' in payload) {
    return payload.data as T;
  }

  return payload as T;
}

async function parseResponse(response: Response) {
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    return response.json();
  }

  return response.text();
}

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    return error.message || fallback;
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  return fallback;
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}) {
  const { body, headers, query, timeoutMs = DEFAULT_TIMEOUT_MS, ...rest } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const resolvedBody =
      body && isPlainObject(body) ? JSON.stringify(body) : (body as BodyInit | null | undefined);
    const response = await fetch(buildApiUrl(path, query), {
      ...rest,
      body: resolvedBody,
      headers: {
        Accept: 'application/json',
        ...(resolvedBody && isPlainObject(body) ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
      },
      cache: 'no-store',
      signal: controller.signal,
    });

    const payload = await parseResponse(response);

    if (!response.ok) {
      const message =
        (isPlainObject(payload) && typeof payload.message === 'string' && payload.message) ||
        response.statusText ||
        'Request failed';
      throw new ApiError(message, response.status, payload);
    }

    return normalizeResponseBody<T>(payload);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError('The request timed out.', 408);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
