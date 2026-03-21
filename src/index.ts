import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { MetaApiClient } from "./services/api.js";
import { registerPageTools } from "./tools/pages.js";
import { registerInstagramTools } from "./tools/instagram.js";
import { registerAdsTools } from "./tools/ads.js";
import { registerAudiencesTools } from "./tools/audiences.js";
import { registerInsightsTools } from "./tools/insights.js";
import { registerThreadsTools } from "./tools/threads.js";
import { registerAdLibraryTools } from "./tools/ad_library.js";
import { registerUtilityTools } from "./tools/utility.js";

const token = process.env.META_ACCESS_TOKEN ?? "";
const threadsToken = process.env.THREADS_ACCESS_TOKEN;

const client = new MetaApiClient(token, threadsToken);

const server = new McpServer({
  name: "meta-mcp-server",
  version: "1.0.0",
});

registerPageTools(server, client);
registerInstagramTools(server, client);
registerAdsTools(server, client);
registerAudiencesTools(server, client);
registerInsightsTools(server, client);
registerThreadsTools(server, client);
registerAdLibraryTools(server, client);
registerUtilityTools(server, client);

const transport = new StdioServerTransport();
await server.connect(transport);
