import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerAllApis } from "./apis/index.js";

// Create server instance
const server = new McpServer({
    name: "alphavantage_mcp",
    version: "1.0.0",
    capabilities: {
        resources: {},
        tools: {},
    },
});

// Register all API endpoints
registerAllApis(server);

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Alpha Vantage MCP Server running on stdio");
}

main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});