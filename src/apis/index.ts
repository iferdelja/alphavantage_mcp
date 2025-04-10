import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerCoreApis } from "./core/index.js";

/**
 * Register all API endpoints with the server
 */
export function registerAllApis(server: McpServer) {
    // Register core APIs
    registerCoreApis(server);

    // Future API groups can be registered here
    // registerFundamentalApis(server);
    // registerTechnicalApis(server);
} 