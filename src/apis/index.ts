import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerCoreApis } from "./core/index.js";
import { registerOptionsApis } from "./options/index.js";
import { registerIntelligenceApis } from "./intelligence/index.js";
import { registerFundamentalApis } from "./fundamental/index.js";

/**
 * Register all API endpoints with the server
 */
export function registerAllApis(server: McpServer) {
    // Register core APIs
    registerCoreApis(server);

    // Register options APIs
    registerOptionsApis(server);

    // Register intelligence APIs
    registerIntelligenceApis(server);

    // Register fundamental data APIs
    registerFundamentalApis(server);

    // Future API groups can be registered here
    // registerTechnicalApis(server);
} 