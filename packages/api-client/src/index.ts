// ─────────────────────────────────────────────────────────────────────────────
// @aurazone/api-client
// Shared typed API client used by apps/customer and apps/admin
// ─────────────────────────────────────────────────────────────────────────────

// ─── Base Client ─────────────────────────────────────────────────────────────

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type RequestOptions = RequestInit & { params?: Record<string, string | number | boolean | undefined> };

const buildUrl = (path: string, params?: Record<string, string | number | boolean | undefined>): string => {
  if (!params) return path;
  const query = new URLSearchParams(
    Object.entries(params)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => [k, String(v)])
  ).toString();
  return query ? `${path}?${query}` : path;
};

export const createClient = (baseUrl: string) => {
  let isRefreshing = false;
  let refreshPromise: Promise<boolean> | null = null;

  const request = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
    const { params, ...init } = options;
    const url = buildUrl(`${baseUrl}${path}`, params);

    const executeRequest = async () => fetch(url, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...init.headers,
      },
      ...init,
    });

    let response = await executeRequest();

    // Automatic token refresh on 401
    if (response.status === 401 && !path.includes("/auth/login") && !path.includes("/auth/refresh")) {
      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = fetch(`${baseUrl}/auth/refresh`, {
          method: "POST",
          credentials: "include",
        }).then(res => {
          isRefreshing = false;
          return res.ok;
        }).catch(() => {
          isRefreshing = false;
          return false;
        });
      }

      const refreshed = await refreshPromise;
      if (refreshed) {
        // Retry the original request
        response = await executeRequest();
      }
    }

    if (response.status === 401) throw new ApiError("Unauthorized", 401);
    if (response.status === 403) throw new ApiError("Forbidden", 403);
    if (response.status === 404) throw new ApiError("Not found", 404);

    if (!response.ok) {
      const err = await response.json().catch(() => ({ message: response.statusText }));
      throw new ApiError(
        (err as { message?: string }).message ?? `API error ${response.status}`,
        response.status,
        err
      );
    }

    return response.json() as Promise<T>;
  };

  return {
    get: <T>(path: string, params?: Record<string, string | number | boolean | undefined>) =>
      request<T>(path, { method: "GET", params }),
    post: <T>(path: string, body?: unknown) =>
      request<T>(path, { method: "POST", body: JSON.stringify(body) }),
    put: <T>(path: string, body?: unknown) =>
      request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
    patch: <T>(path: string, body?: unknown) =>
      request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
    delete: <T>(path: string) =>
      request<T>(path, { method: "DELETE" }),
    uploadForm: <T>(path: string, formData: FormData) =>
      request<T>(path, {
        method: "POST",
        body: formData,
        headers: {}, // Let browser set Content-Type with boundary for multipart
      }),
  };
};

export { ApiError };

// ─── Default client instance ──────────────────────────────────────────────────
// Each app creates its own via createClient(process.env.NEXT_PUBLIC_API_URL)
// Re-export domain-specific API modules
export * from "./auth.js";
export * from "./stores.js";
export * from "./products.js";
export * from "./cart.js";
export * from "./wishlist.js";
export * from "./orders.js";
export * from "./payments.js";
export * from "./users.js";
export * from "./storefront.js";
export * from "./admin.js";
