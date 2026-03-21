import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { errorResult, ResponseFormatSchema } from "../services/utils.js";
import axios from "axios";
import { writeFileSync } from "fs";
import { join } from "path";

const QUICKCHART_BASE = "https://quickchart.io/chart";

function buildChartUrl(config: object, width: number, height: number): string {
  const params = new URLSearchParams({
    c: JSON.stringify(config),
    w: String(width),
    h: String(height),
    bkg: "white",
    f: "png",
  });
  return `${QUICKCHART_BASE}?${params.toString()}`;
}

export function registerChartTools(server: McpServer): void {
  // ─── Generate Insight Chart ──────────────────────────────────────────────
  server.registerTool(
    "meta_generate_chart",
    {
      title: "Generate a Chart from Data",
      description: `Generates a chart image (PNG) from provided data. Uses QuickChart (Chart.js) to render.

Perfect for creating visual reports from Meta insights data. The chart is saved as a PNG file
that can be inserted into Word docs, presentations, or shared directly.

Args:
  - chart_type (string): 'bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'horizontalBar'
  - title (string): Chart title
  - labels (string[]): X-axis labels or pie slice labels
  - datasets (array): One or more datasets, each with:
      - label (string): Dataset name (e.g., "Impressions")
      - data (number[]): Data values matching labels
      - color (string, optional): CSS color (e.g., "#1877F2", "rgba(24,119,242,0.5)")
  - width (number): Image width in pixels (default: 800)
  - height (number): Image height in pixels (default: 400)
  - output_path (string, optional): Save PNG to this path. If omitted, returns the chart URL.
  - stacked (boolean, optional): Stack bars/lines (default: false)
  - show_values (boolean, optional): Display data values on the chart (default: false)

Returns: Chart URL or file path. The URL can be opened in a browser or fetched as a PNG.

Example datasets for ad performance:
  labels: ["Mon","Tue","Wed","Thu","Fri"]
  datasets: [
    { label: "Impressions", data: [1200,1800,1500,2100,1900], color: "#1877F2" },
    { label: "Clicks", data: [45,62,51,78,65], color: "#42B72A" }
  ]`,
      inputSchema: z
        .object({
          chart_type: z.enum(["bar", "line", "pie", "doughnut", "radar", "polarArea", "horizontalBar"]).default("bar"),
          title: z.string(),
          labels: z.array(z.string()),
          datasets: z.array(
            z.object({
              label: z.string(),
              data: z.array(z.number()),
              color: z.string().optional().describe("CSS color (e.g., '#1877F2')"),
            })
          ),
          width: z.number().default(800),
          height: z.number().default(400),
          output_path: z.string().optional().describe("Save PNG to this file path"),
          stacked: z.boolean().optional().default(false),
          show_values: z.boolean().optional().default(false),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ chart_type, title, labels, datasets, width, height, output_path, stacked, show_values, response_format }) => {
      try {
        const DEFAULT_COLORS = [
          "#1877F2", "#42B72A", "#F02849", "#F7B928", "#8B5CF6",
          "#06B6D4", "#F97316", "#EC4899", "#14B8A6", "#6366F1",
        ];

        const chartConfig: Record<string, unknown> = {
          type: chart_type,
          data: {
            labels,
            datasets: datasets.map((ds, i) => ({
              label: ds.label,
              data: ds.data,
              backgroundColor: ds.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length],
              borderColor: ds.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length],
              borderWidth: chart_type === "line" ? 2 : 1,
              fill: chart_type === "line" ? false : undefined,
            })),
          },
          options: {
            title: { display: true, text: title, fontSize: 16 },
            scales: ["bar", "line", "horizontalBar"].includes(chart_type)
              ? {
                  xAxes: [{ stacked, ticks: { autoSkip: true, maxRotation: 45 } }],
                  yAxes: [{ stacked, ticks: { beginAtZero: true } }],
                }
              : undefined,
            plugins: show_values
              ? {
                  datalabels: {
                    display: true,
                    color: "#333",
                    font: { weight: "bold" },
                  },
                }
              : undefined,
          },
        };

        const url = buildChartUrl(chartConfig, width, height);

        if (output_path) {
          const response = await axios.get(url, { responseType: "arraybuffer", timeout: 30000 });
          const resolvedPath = output_path.startsWith("/") ? output_path : join(process.cwd(), output_path);
          writeFileSync(resolvedPath, response.data);

          if (response_format === "json") {
            return { content: [{ type: "text", text: JSON.stringify({ path: resolvedPath, url }, null, 2) }] };
          }
          return {
            content: [{ type: "text", text: `Chart saved to \`${resolvedPath}\`\n\n**Title**: ${title}\n**Type**: ${chart_type}\n**Size**: ${width}x${height}px` }],
          };
        }

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify({ url, chart_config: chartConfig }, null, 2) }] };
        }
        return {
          content: [{ type: "text", text: `**${title}**\n\nChart URL (open in browser or download):\n${url}\n\n_Use \`output_path\` parameter to save directly as PNG._` }],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Generate Comparison Chart ──────────────────────────────────────────
  server.registerTool(
    "meta_generate_comparison_chart",
    {
      title: "Generate a Before/After or A/B Comparison Chart",
      description: `Generates a side-by-side comparison chart — perfect for comparing two time periods,
two campaigns, or A/B test results.

Args:
  - title (string): Chart title
  - metrics (string[]): Metric names (y-axis labels)
  - group_a (object): { label: string, values: number[], color?: string }
  - group_b (object): { label: string, values: number[], color?: string }
  - chart_type (string): 'bar' or 'horizontalBar' (default: 'horizontalBar')
  - width (number): Width in pixels (default: 800)
  - height (number): Height in pixels (default: 400)
  - output_path (string, optional): Save PNG to this path

Example — comparing two weeks:
  title: "This Week vs Last Week"
  metrics: ["Impressions", "Reach", "Clicks", "Spend"]
  group_a: { label: "Last Week", values: [12000, 8000, 450, 150] }
  group_b: { label: "This Week", values: [15000, 10500, 620, 185] }`,
      inputSchema: z
        .object({
          title: z.string(),
          metrics: z.array(z.string()).describe("Metric names (y-axis labels)"),
          group_a: z.object({
            label: z.string(),
            values: z.array(z.number()),
            color: z.string().optional(),
          }),
          group_b: z.object({
            label: z.string(),
            values: z.array(z.number()),
            color: z.string().optional(),
          }),
          chart_type: z.enum(["bar", "horizontalBar"]).default("horizontalBar"),
          width: z.number().default(800),
          height: z.number().default(400),
          output_path: z.string().optional(),
          response_format: ResponseFormatSchema,
        })
        .strict(),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ title, metrics, group_a, group_b, chart_type, width, height, output_path, response_format }) => {
      try {
        const chartConfig = {
          type: chart_type,
          data: {
            labels: metrics,
            datasets: [
              {
                label: group_a.label,
                data: group_a.values,
                backgroundColor: group_a.color ?? "rgba(24,119,242,0.7)",
                borderColor: group_a.color ?? "#1877F2",
                borderWidth: 1,
              },
              {
                label: group_b.label,
                data: group_b.values,
                backgroundColor: group_b.color ?? "rgba(66,183,42,0.7)",
                borderColor: group_b.color ?? "#42B72A",
                borderWidth: 1,
              },
            ],
          },
          options: {
            title: { display: true, text: title, fontSize: 16 },
            plugins: {
              datalabels: { display: true, color: "#333", font: { weight: "bold" } },
            },
          },
        };

        const url = buildChartUrl(chartConfig, width, height);

        if (output_path) {
          const response = await axios.get(url, { responseType: "arraybuffer", timeout: 30000 });
          const resolvedPath = output_path.startsWith("/") ? output_path : join(process.cwd(), output_path);
          writeFileSync(resolvedPath, response.data);

          if (response_format === "json") {
            return { content: [{ type: "text", text: JSON.stringify({ path: resolvedPath, url }, null, 2) }] };
          }
          return {
            content: [{ type: "text", text: `Comparison chart saved to \`${resolvedPath}\`\n\n**${group_a.label}** vs **${group_b.label}**` }],
          };
        }

        if (response_format === "json") {
          return { content: [{ type: "text", text: JSON.stringify({ url }, null, 2) }] };
        }
        return {
          content: [{ type: "text", text: `**${title}**\n\nChart URL:\n${url}` }],
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );
}
