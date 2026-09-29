const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
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
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      credentials: "include",
      headers: { "Content-Type": "application/json", ...options.headers },
    });

    // If 401 and not already a retry, attempt token refresh
    if (
      res.status === 401 &&
      !_isRetry &&
      !path.includes("/auth/refresh") &&
      !path.includes("/auth/login")
    ) {
      const refreshed = await this.tryRefresh();
      if (refreshed) {
        return this.request<T>(path, options, true);
      }
      // Refresh failed — redirect to login
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      throw new Error("Session expired");
    }

    const json = await res.json();
    if (!res.ok) throw new Error(json.message ?? `Request failed: ${res.status}`);
    return json;
  }

  /**
   * Attempt to refresh the access token.
   * Deduplicates concurrent refresh attempts.
   */
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