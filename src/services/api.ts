import axios, { AxiosError } from "axios";
import { GRAPH_API_BASE, THREADS_API_BASE } from "../constants.js";

export class MetaApiClient {
  private readonly userToken: string;
  private readonly threadsToken: string | undefined;
  private readonly pageTokenCache = new Map<string, string>();

  constructor(userToken: string, threadsToken?: string) {
    this.userToken = userToken;
    this.threadsToken = threadsToken;
  }

  requireUserToken(): void {
    if (!this.userToken) {
      throw new Error(
        "META_ACCESS_TOKEN is not configured. " +
          "Add it to your MCP server config under env: { \"META_ACCESS_TOKEN\": \"your_token\" }. " +
          "Get a token from https://developers.facebook.com/tools/explorer/"
      );
    }
  }

  async get<T>(path: string, params: Record<string, unknown> = {}): Promise<T> {
    this.requireUserToken();
    const response = await axios.get(`${GRAPH_API_BASE}${path}`, {
      params: { access_token: this.userToken, ...params },
      timeout: 30000,
    });
    return response.data as T;
  }

  async getWithToken<T>(
    path: string,
    token: string,
    params: Record<string, unknown> = {}
  ): Promise<T> {
    const response = await axios.get(`${GRAPH_API_BASE}${path}`, {
      params: { access_token: token, ...params },
      timeout: 30000,
    });
    return response.data as T;
  }

  async post<T>(
    path: string,
    fields: Record<string, unknown> = {},
    token?: string
  ): Promise<T> {
    this.requireUserToken();
    const body = new URLSearchParams();
    body.append("access_token", token ?? this.userToken);
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined && value !== null) {
        body.append(
          key,
          typeof value === "object" ? JSON.stringify(value) : String(value)
        );
      }
    }
    const response = await axios.post(`${GRAPH_API_BASE}${path}`, body, {
      timeout: 30000,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    return response.data as T;
  }

  async delete<T>(
    path: string,
    token?: string,
    params: Record<string, unknown> = {}
  ): Promise<T> {
    this.requireUserToken();
    const response = await axios.delete(`${GRAPH_API_BASE}${path}`, {
      params: { access_token: token ?? this.userToken, ...params },
      timeout: 30000,
    });
    return response.data as T;
  }

  // Page token management
  cachePageToken(pageId: string, token: string): void {
    this.pageTokenCache.set(pageId, token);
  }

  getPageToken(pageId: string): string | undefined {
    return this.pageTokenCache.get(pageId);
  }

  requirePageToken(pageId: string): string {
    const token = this.pageTokenCache.get(pageId);
    if (!token) {
      throw new Error(
        `No access token cached for page ${pageId}. ` +
          `Call meta_list_pages first to load page tokens, then use the page ID from those results.`
      );
    }
    return token;
  }

  getUserToken(): string {
    return this.userToken;
  }

  getPageTokenCount(): number {
    return this.pageTokenCache.size;
  }

  // Threads API methods (different base URL)
  requireThreadsToken(): string {
    if (!this.threadsToken) {
      throw new Error(
        "No THREADS_ACCESS_TOKEN configured. " +
          "Set it in your MCP config env to use Threads tools."
      );
    }
    return this.threadsToken;
  }

  hasThreadsToken(): boolean {
    return !!this.threadsToken;
  }

  async threadsGet<T>(path: string, params: Record<string, unknown> = {}): Promise<T> {
    const token = this.requireThreadsToken();
    const response = await axios.get(`${THREADS_API_BASE}${path}`, {
      params: { access_token: token, ...params },
      timeout: 30000,
    });
    return response.data as T;
  }

  async threadsPost<T>(path: string, fields: Record<string, unknown> = {}): Promise<T> {
    const token = this.requireThreadsToken();
    const body = new URLSearchParams();
    body.append("access_token", token);
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined && value !== null) {
        body.append(
          key,
          typeof value === "object" ? JSON.stringify(value) : String(value)
        );
      }
    }
    const response = await axios.post(`${THREADS_API_BASE}${path}`, body, {
      timeout: 30000,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    return response.data as T;
  }

  async threadsDelete<T>(path: string): Promise<T> {
    const token = this.requireThreadsToken();
    const response = await axios.delete(`${THREADS_API_BASE}${path}`, {
      params: { access_token: token },
      timeout: 30000,
    });
    return response.data as T;
  }

  /**
   * Polls a container's status until it's FINISHED or max attempts reached.
   * Used for video processing in Instagram (reels, stories, carousels) and Threads.
   * @param containerId Container ID to poll
   * @param platform 'instagram' or 'threads' — determines API and status field name
   * @param maxAttempts Maximum number of 5-second intervals to wait (default 12 = 60s)
   * @returns The final status string
   */
  async pollContainerStatus(
    containerId: string,
    platform: "instagram" | "threads" = "instagram",
    maxAttempts = 12
  ): Promise<string> {
    const statusField = platform === "threads" ? "status" : "status_code";
    let statusCode = "IN_PROGRESS";

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      // Check first, then sleep — saves 5s on fast completions
      const result = platform === "threads"
        ? await this.threadsGet<Record<string, string>>(`/${containerId}`, { fields: statusField })
        : await this.get<Record<string, string>>(`/${containerId}`, { fields: statusField });
      statusCode = result[statusField] ?? "IN_PROGRESS";
      if (statusCode !== "IN_PROGRESS") break;
      await new Promise((r) => setTimeout(r, 5000));
    }

    return statusCode;
  }
}
