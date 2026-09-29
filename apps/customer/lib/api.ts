const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: { page?: number; limit?: number; total?: number; totalPages?: number };
}

class ApiClient {
  private baseUrl: string;
  private isRefreshing = false;
  private refreshPromise: Promise<boolean> | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {},
    _isRetry = false
  ): Promise<ApiResponse<T>> {
    const guestSession = typeof window !== "undefined" ? localStorage.getItem("guest_session_id") : null;
    
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      credentials: "include",
      headers: { 
        "Content-Type": "application/json", 
        ...(guestSession ? { "x-guest-session": guestSession } : {}),
        ...options.headers 
      },
    });

    // If 401 and not already a retry, attempt token refresh (only for authenticated users)
    if (
      res.status === 401 &&
      !_isRetry &&
      !path.includes("/auth/refresh") &&
      !path.includes("/auth/login") &&
      !path.includes("/auth/signup") &&
      !path.includes("/sessions")
    ) {
      // Only attempt refresh if user has likely been authenticated
      // (the browser will have the refresh_token cookie if they logged in)
      const refreshed = await this.tryRefresh();
      if (refreshed) {
        return this.request<T>(path, options, true);
      }
      // Refresh failed — don't throw generic error, let the original response through
    }

    const json = await res.json();
    if (!res.ok) throw new Error(json.message ?? `Request failed: ${res.status}`);
    return json;
  }

  private async tryRefresh(): Promise<boolean> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }
    this.isRefreshing = true;
    this.refreshPromise = (async () => {
      try {
        const res = await fetch(`${this.baseUrl}/auth/refresh`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        return res.ok;
      } catch {
        return false;
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();
    return this.refreshPromise;
  }

  get<T>(path: string) { return this.request<T>(path, { method: "GET" }); }
  post<T>(path: string, body?: unknown) { return this.request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }); }
  put<T>(path: string, body?: unknown) { return this.request<T>(path, { method: "PUT", body: body ? JSON.stringify(body) : undefined }); }
  patch<T>(path: string, body?: unknown) { return this.request<T>(path, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }); }
  delete<T>(path: string) { return this.request<T>(path, { method: "DELETE" }); }
}

export const api = new ApiClient(API_URL);