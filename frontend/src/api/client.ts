export const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

/** 
 * Rapidly polls /health until the HF Spaces backend is alive.
 * Uses short intervals (1.5s) so cold-start wake time is minimised.
 * Gives up after 60 attempts (~90s) to avoid infinite loops.
 */
export const wakeBackend = async (attempt = 0): Promise<void> => {
    if (attempt >= 60) return;  // give up after ~90s
    try {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 5000); // 5s per probe
        const res = await fetch(`${BASE_URL}/health`, { signal: controller.signal });
        clearTimeout(id);
        if (res.ok) return; // ✅ backend is awake
    } catch {
        // fetch failed or timed out — keep retrying
    }
    await new Promise(r => setTimeout(r, 1500)); // 1.5s gap between probes
    return wakeBackend(attempt + 1);
};
export class ApiError extends Error {
    constructor(
        public status: number,
        message: string
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
    const url = `${BASE_URL}${path}`;
    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
        ...options,
    });

    if (!response.ok) {
        let message = `HTTP ${response.status}`;
        try {
            const body = await response.json();
            message = body.detail || body.message || message;
        } catch {
            /* ignore parse error */
        }
        throw new ApiError(response.status, message);
    }

    if (response.status === 204) return undefined as T;
    return response.json();
}

export const api = {
    get: <T>(path: string) => request<T>(path),
    post: <T>(path: string, body?: unknown) =>
        request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
    patch: <T>(path: string, body?: unknown) =>
        request<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
};
