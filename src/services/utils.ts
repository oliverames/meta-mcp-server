import { AxiosError } from "axios";
import { z } from "zod";
import { CHARACTER_LIMIT } from "../constants.js";

// Shared Zod schema for response_format parameter — used by all tools
export const ResponseFormatSchema = z
  .enum(["markdown", "json"])
  .default("markdown")
  .describe("Output format: 'markdown' for human-readable or 'json' for machine-readable");

// Shared annotation presets
export const READ_ONLY_ANNOTATIONS = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: false,
  openWorldHint: false,
} as const;

export const DESTRUCTIVE_ANNOTATIONS = {
  readOnlyHint: false,
  destructiveHint: true,
  idempotentHint: false,
  openWorldHint: false,
} as const;

export const MUTATING_ANNOTATIONS = {
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: false,
  openWorldHint: false,
} as const;

export function errorResult(error: unknown): { content: Array<{ type: "text"; text: string }>; isError: true } {
  return {
    content: [{ type: "text" as const, text: handleApiError(error) }],
    isError: true,
  };
}

export function handleApiError(error: unknown): string {
  if (error instanceof AxiosError) {
    if (error.response) {
      const data = error.response.data as Record<string, unknown> | undefined;
      const metaError = data?.error as Record<string, unknown> | undefined;
      if (metaError) {
        const code = metaError.code;
        const msg = metaError.message ?? metaError.error_user_msg;
        const subcode = metaError.error_subcode;

        // Provide actionable guidance for common error codes
        if (code === 190) {
          return (
            `Error: Access token is invalid or expired (${code}${subcode ? `/${subcode}` : ""}).\n\n` +
            `To fix: Generate a new long-lived token at https://developers.facebook.com/tools/explorer/ ` +
            `and update META_ACCESS_TOKEN in your MCP config.`
          );
        }
        if (code === 10 || code === 200) {
          return (
            `Error: Missing permission (${code}${subcode ? `/${subcode}` : ""}): ${msg}\n\n` +
            `Grant the required permission at https://developers.facebook.com/tools/explorer/ and regenerate your token.`
          );
        }

        return `Error (${code}${subcode ? `/${subcode}` : ""}): ${msg}`;
      }
      switch (error.response.status) {
        case 400:
          return "Error: Bad request — check your parameters.";
        case 401:
          return "Error: Unauthorized — your access token is invalid or expired. Regenerate at https://developers.facebook.com/tools/explorer/";
        case 403:
          return "Error: Permission denied — your token lacks the required permissions. Grant them at https://developers.facebook.com/tools/explorer/";
        case 404:
          return "Error: Resource not found — check the ID is correct.";
        case 429:
          return "Error: Rate limit exceeded — wait before making more requests. See Meta rate limiting docs.";
        default:
          return `Error: API request failed with status ${error.response.status}.`;
      }
    } else if (error.code === "ECONNABORTED") {
      return "Error: Request timed out — try again or break the query into smaller requests.";
    } else if (error.code === "ENOTFOUND") {
      return "Error: Cannot reach graph.facebook.com — check your internet connection.";
    }
  }
  if (error instanceof Error) {
    return `Error: ${error.message}`;
  }
  return `Error: Unexpected error occurred.`;
}

export function truncateField(text: string | undefined, limit = 200): string {
  if (!text) return "";
  return text.length > limit ? text.slice(0, limit) + "..." : text;
}

export function truncate(text: string, label = "items"): string {
  if (text.length <= CHARACTER_LIMIT) return text;
  const truncated = text.slice(0, CHARACTER_LIMIT);
  return (
    truncated +
    `\n\n[Response truncated at ${CHARACTER_LIMIT} characters. Use pagination (after cursor) or filters to get more ${label}.]`
  );
}

export function formatCurrency(amount: string | undefined, currency = "USD"): string {
  if (!amount) return "N/A";
  // Meta returns amounts in cents
  const dollars = (parseInt(amount, 10) / 100).toFixed(2);
  return `${dollars} ${currency}`;
}

export function formatBudget(
  daily?: string,
  lifetime?: string,
  currency = "USD"
): string {
  if (daily) return `${formatCurrency(daily, currency)}/day`;
  if (lifetime) return `${formatCurrency(lifetime, currency)} lifetime`;
  return "N/A";
}

export function formatDate(isoString?: string): string {
  if (!isoString) return "N/A";
  return new Date(isoString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatNumber(n: string | number | undefined): string {
  if (n === undefined || n === null) return "N/A";
  const num = Number(n);
  if (isNaN(num)) return String(n);
  return num.toLocaleString();
}

export function buildPaginationNote(
  count: number,
  afterCursor?: string
): string {
  if (!afterCursor) return "";
  return `\n\n_Showing ${count} results. Pass \`after="${afterCursor}"\` to get the next page._`;
}
