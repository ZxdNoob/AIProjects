const REQUEST_TIMEOUT_MS = 5000;

export interface HttpErrorShape {
  message: string;
  status?: number;
  code?: string;
  details?: unknown;
}

export class HttpError extends Error {
  status?: number;
  code?: string;
  details?: unknown;

  constructor(shape: HttpErrorShape) {
    super(shape.message);
    this.name = 'HttpError';
    this.status = shape.status;
    this.code = shape.code;
    this.details = shape.details;
  }
}

export interface FetchOptions extends RequestInit {
  timeoutMs?: number;
}

export async function fetchWithTimeout(url: string, options: FetchOptions = {}): Promise<Response> {
  const { timeoutMs = REQUEST_TIMEOUT_MS, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error?.name === 'AbortError') {
      throw new HttpError({ message: `请求超时 (${timeoutMs}ms)` });
    }
    throw error;
  }
}

export async function requestJson<T>(url: string, options: FetchOptions = {}): Promise<T> {
  const response = await fetchWithTimeout(url, options);
  if (!response.ok) {
    let details: unknown = undefined;
    try {
      details = await response.json();
    } catch {
      // ignore
    }
    throw new HttpError({
      message: `HTTP ${response.status}`,
      status: response.status,
      details,
    });
  }
  const body = (await response.json()) as any;
  // 兼容后端两种响应形态：
  // - legacy: { stats: ... } / { history: ... }
  // - product: { data: { ... }, meta: ... }
  if (body && typeof body === 'object' && 'data' in body) {
    return body.data as T;
  }
  return body as T;
}

