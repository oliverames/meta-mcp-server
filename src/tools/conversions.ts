import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { MetaApiClient } from "../services/api.js";
import { errorResult, ResponseFormatSchema } from "../services/utils.js";

const UserDataSchema = z.object({
  em: z.string().optional().describe("Hashed (SHA256) email"),
  ph: z.string().optional().describe("Hashed (SHA256) phone"),
  fn: z.string().optional().describe("Hashed (SHA256) first name"),
  ln: z.string().optional().describe("Hashed (SHA256) last name"),
  ge: z.string().optional().describe("Hashed (SHA256) gender (m or f)"),
  db: z.string().optional().describe("Hashed (SHA256) date of birth (YYYYMMDD)"),
  ct: z.string().optional().describe("Hashed (SHA256) city"),
  st: z.string().optional().describe("Hashed (SHA256) state/province (2-letter code)"),
  zp: z.string().optional().describe("Hashed (SHA256) zip/postal code"),
  country: z.string().optional().describe("Hashed (SHA256) country (2-letter ISO code)"),
  fbc: z.string().optional().describe("Facebook click ID (_fbc cookie)"),
  fbp: z.string().optional().describe("Facebook browser ID (_fbp cookie)"),
  client_ip_address: z.string().optional(),
  client_user_agent: z.string().optional(),
  external_id: z.string().optional().describe("Your unique user ID"),
  madid: z.string().optional().describe("Mobile advertiser ID (IDFA or GAID)"),
  lead_id: z.string().optional().describe("Meta lead ID (for CRM conversion events)"),
  subscription_id: z.string().optional().describe("Subscription ID"),
  fb_login_id: z.string().optional().describe("Facebook Login ID"),
}).describe("User data for matching (at least one identifier required — more fields = better match rate)");

const CustomDataSchema = z.object({
  currency: z.string().optional(),
  value: z.number().optional(),
  content_name: z.string().optional(),
  content_ids: z.array(z.string()).optional(),
  content_type: z.string().optional().describe("'product' or 'product_group'"),
  content_category: z.string().optional(),
  contents: z.array(z.object({
    id: z.string(),
    quantity: z.number().optional(),
    item_price: z.number().optional(),
  })).optional().describe("Product-level data for multi-item conversions"),
  order_id: z.string().optional(),
  num_items: z.number().optional(),
  search_string: z.string().optional().describe("Search query (for Search events)"),
  status: z.string().optional().describe("Status of registration/subscription"),
  predicted_ltv: z.number().optional().describe("Predicted lifetime value"),
  delivery_category: z.enum(["in_store", "curbside", "home_delivery"]).optional(),
}).optional().describe("Custom event data");

const ActionSourceEnum = z.enum([
  "website", "app", "email", "phone_call", "chat",
  "physical_store", "system_generated", "business_messaging", "other",
]);

const ConversionInputSchema = z.object({
  pixel_id: z.string().describe("Meta Pixel ID"),
  event_name: z.string().describe("Conversion event name. Standard events: Purchase, Lead, AddToCart, CompleteRegistration, ViewContent, Search, InitiateCheckout, AddPaymentInfo, AddToWishlist, Subscribe, StartTrial, Contact, CustomizeProduct, Donate, FindLocation, Schedule, SubmitApplication, PageView. Custom event names are also accepted."),
  event_time: z.number().describe("Unix timestamp of the event"),
  event_source_url: z.string().optional().describe("URL where conversion happened"),
  user_data: UserDataSchema,
  custom_data: CustomDataSchema,
  event_id: z.string().optional().describe("Deduplication ID (matches browser pixel)"),
  action_source: ActionSourceEnum.describe("Where the conversion originated"),
  test_event_code: z.string().optional().describe("Test event code (won't affect production data)"),
  response_format: ResponseFormatSchema,
}).strict();

function buildEventPayload(args: z.infer<typeof ConversionInputSchema>) {
  const event: Record<string, unknown> = {
    event_name: args.event_name,
    event_time: args.event_time,
    action_source: args.action_source,
    user_data: args.user_data,
  };
  if (args.event_source_url) event.event_source_url = args.event_source_url;
  if (args.custom_data) event.custom_data = args.custom_data;
  if (args.event_id) event.event_id = args.event_id;
  return event;
}

export function registerConversionTools(server: McpServer, client: MetaApiClient): void {
  // ─── Send Conversion Event ──────────────────────────────────────────────
  server.registerTool(
    "meta_send_conversion_event",
    {
      title: "Send Conversion Event (CAPI)",
      description: `Sends a server-side conversion event to Meta via the Conversions API.

Args:
  - pixel_id: Meta Pixel ID
  - event_name: Standard events: Purchase, Lead, AddToCart, CompleteRegistration, ViewContent, Search, InitiateCheckout, AddPaymentInfo, AddToWishlist, Subscribe, StartTrial, Contact, CustomizeProduct, Donate, FindLocation, Schedule, SubmitApplication, PageView. Custom event names also accepted.
  - event_time: Unix timestamp
  - event_source_url (optional): URL where conversion happened
  - user_data: At minimum one of: em (hashed email), ph (hashed phone), fbc, fbp, client_ip_address, client_user_agent, external_id
  - custom_data (optional): { currency, value, content_name, content_ids, content_type, order_id, num_items }
  - event_id (optional): For deduplication with browser pixel
  - action_source: "website", "app", "email", "phone_call", "chat", "physical_store", "system_generated", "business_messaging", "other"
  - test_event_code (optional): For testing without affecting production data`,
      inputSchema: ConversionInputSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async (args) => {
      try {
        const event = buildEventPayload(args);
        const payload: Record<string, unknown> = { data: [event] };
        if (args.test_event_code) payload.test_event_code = args.test_event_code;

        const result = await client.post<{ events_received: number; messages?: string[]; fbtrace_id?: string }>(
          `/${args.pixel_id}/events`,
          payload
        );

        if (args.response_format === "json") {
          return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
        }

        const lines = [
          `# Conversion Event Sent`,
          "",
          `- **Events Received**: ${result.events_received}`,
          `- **Event Name**: ${args.event_name}`,
          `- **Pixel ID**: \`${args.pixel_id}\``,
          `- **Action Source**: ${args.action_source}`,
        ];
        if (args.test_event_code) lines.push(`- **Test Event Code**: ${args.test_event_code}`);
        if (result.fbtrace_id) lines.push(`- **Trace ID**: ${result.fbtrace_id}`);
        if (result.messages?.length) lines.push("", "**Messages**:", ...result.messages.map(m => `- ${m}`));

        return { content: [{ type: "text" as const, text: lines.join("\n") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  // ─── Test Conversion Events ─────────────────────────────────────────────
  server.registerTool(
    "meta_test_conversion_events",
    {
      title: "Test Conversion Event (CAPI)",
      description: `Tests CAPI setup by sending a test event that won't affect production data.

Same args as meta_send_conversion_event but auto-sets a test_event_code if not provided.
Use the test_event_code from Events Manager > Test Events tab.`,
      inputSchema: ConversionInputSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async (args) => {
      try {
        const testCode = args.test_event_code || `TEST_${Date.now()}`;
        const event = buildEventPayload(args);
        const payload: Record<string, unknown> = { data: [event], test_event_code: testCode };

        const result = await client.post<{ events_received: number; messages?: string[]; fbtrace_id?: string }>(
          `/${args.pixel_id}/events`,
          payload
        );

        if (args.response_format === "json") {
          return { content: [{ type: "text" as const, text: JSON.stringify({ ...result, test_event_code: testCode }, null, 2) }] };
        }

        const lines = [
          `# Test Conversion Event Sent`,
          "",
          `- **Test Event Code**: ${testCode}`,
          `- **Events Received**: ${result.events_received}`,
          `- **Event Name**: ${args.event_name}`,
          `- **Pixel ID**: \`${args.pixel_id}\``,
          `- **Action Source**: ${args.action_source}`,
          "",
          `> Check Events Manager > Test Events tab to verify receipt.`,
        ];
        if (result.fbtrace_id) lines.push(`- **Trace ID**: ${result.fbtrace_id}`);
        if (result.messages?.length) lines.push("", "**Messages**:", ...result.messages.map(m => `- ${m}`));

        return { content: [{ type: "text" as const, text: lines.join("\n") }] };
      } catch (error) {
        return errorResult(error);
      }
    }
  );
}
