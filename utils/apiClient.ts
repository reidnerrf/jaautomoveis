class ApiClient {
  private baseURL: string;

  constructor() {
    // Use relative base path so it works in dev (Vite proxy) and prod (same origin)
    this.baseURL = "/api";
  }

  private getAuthToken(): string | null {
    return localStorage.getItem("authToken");
  }

  private async request<TResponse>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<TResponse> {
    const token = this.getAuthToken();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: { ...headers, ...(options.headers as Record<string, string>) },
    });

    if (response.status === 401) {
      // Handle token expiration
      localStorage.removeItem("authToken");
      window.location.href = "/admin/login";
      throw new Error("Unauthorized - Please login again");
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return (await response.json()) as TResponse;
  }

  async get<TResponse>(endpoint: string): Promise<TResponse> {
    return this.request<TResponse>(endpoint, { method: "GET" });
  }

  async post<TBody extends object, TResponse>(endpoint: string, data: TBody): Promise<TResponse> {
    return this.request<TResponse>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async put<TBody extends object, TResponse>(endpoint: string, data: TBody): Promise<TResponse> {
    return this.request<TResponse>(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async delete<TResponse>(endpoint: string): Promise<TResponse> {
    return this.request<TResponse>(endpoint, { method: "DELETE" });
  }
}

export const apiClient = new ApiClient();
