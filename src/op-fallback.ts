import { execFileSync } from "node:child_process";

/**
 * If the given env var is empty, attempt to resolve it from 1Password CLI.
 * Sets process.env[envVar] on success so downstream code can read it normally.
 */
export function resolveApiKey(envVar: string, opRef: string): void {
  if (process.env[envVar]) return;
  try {
    const value = execFileSync("op", ["read", opRef], {
      encoding: "utf-8",
      timeout: 10000,
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();
    if (value) process.env[envVar] = value;
  } catch {
    // 1Password CLI unavailable or item not found
  }
}
