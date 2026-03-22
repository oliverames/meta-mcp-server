import { describe, it, expect } from "vitest";
import { spawn } from "child_process";
import { join } from "path";

function sendMcpRequest(request: object): Promise<object> {
  return new Promise((resolve, reject) => {
    const proc = spawn("node", [join(process.cwd(), "dist/index.js")], {
      env: { ...process.env, META_ACCESS_TOKEN: "", THREADS_ACCESS_TOKEN: "" },
      stdio: ["pipe", "pipe", "pipe"],
    });

    let resolved = false;
    let stdout = "";
    proc.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
      // MCP responses are newline-delimited JSON
      const lines = stdout.split("\n").filter(Boolean);
      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
          if (parsed.id === (request as any).id) {
            resolved = true;
            proc.kill();
            resolve(parsed);
            return;
          }
        } catch { /* not yet complete */ }
      }
    });

    proc.stderr.on("data", () => {
      // Ignore stderr (MCP SDK may log here)
    });

    proc.on("error", (err) => {
      if (!resolved) reject(err);
    });

    // Send initialization first, then the actual request
    const init = JSON.stringify({
      jsonrpc: "2.0",
      id: 0,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: { name: "test", version: "1.0" },
      },
    });

    proc.stdin.write(init + "\n");

    // After a short delay, send the initialized notification and actual request
    setTimeout(() => {
      if (resolved || proc.killed) return;
      proc.stdin.write(JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) + "\n");
      proc.stdin.write(JSON.stringify(request) + "\n");
    }, 200);

    // Timeout after 10 seconds
    setTimeout(() => {
      if (resolved) return;
      proc.kill();
      reject(new Error(`Timeout waiting for response. Got: ${stdout}`));
    }, 10000);
  });
}

describe("MCP Server Integration", () => {
  it("starts without META_ACCESS_TOKEN and responds to initialize", async () => {
    const response = await sendMcpRequest({
      jsonrpc: "2.0",
      id: 0,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: { name: "test", version: "1.0" },
      },
    });

    expect((response as any).result).toBeDefined();
    expect((response as any).result.serverInfo.name).toBe("meta-mcp-server");
    expect((response as any).result.capabilities.tools).toBeDefined();
  });

  it("lists all 200 tools via tools/list", async () => {
    const response = await sendMcpRequest({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/list",
      params: {},
    });

    const tools = (response as any).result?.tools;
    expect(tools).toBeDefined();
    expect(Array.isArray(tools)).toBe(true);
    expect(tools.length).toBe(200);

    // Verify key tools exist
    const names = tools.map((t: any) => t.name);
    expect(names).toContain("meta_list_pages");
    expect(names).toContain("meta_publish_instagram_photo");
    expect(names).toContain("threads_publish_text");
    expect(names).toContain("meta_search_ad_library");
    expect(names).toContain("meta_get_campaign");
    expect(names).toContain("meta_check_instagram_publishing_limit");
    expect(names).toContain("meta_publish_page_story");
    expect(names).toContain("meta_create_live_video");
    expect(names).toContain("meta_get_live_videos");
    expect(names).toContain("meta_end_live_video");
  });

  it("returns helpful error when calling tool without token", async () => {
    const response = await sendMcpRequest({
      jsonrpc: "2.0",
      id: 2,
      method: "tools/call",
      params: {
        name: "meta_list_pages",
        arguments: {},
      },
    });

    const result = (response as any).result;
    expect(result).toBeDefined();
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("META_ACCESS_TOKEN");
  });
});
