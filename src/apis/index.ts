import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerCoreApis } from "./core/index.js";
import { registerOptionsApis } from "./options/index.js";
import { registerIntelligenceApis } from "./intelligence/index.js";
import { registerFundamentalApis } from "./fundamental/index.js";
import { registerForexApis } from "./forex/index.js";
import { registerCryptoApis } from "./crypto/index.js";
import { registerCommoditiesApis } from "./commodities/index.js";
import { registerEconomicApis } from "./economic/index.js";
import { registerTechnicalApis } from "./technical/index.js";

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

    // Register forex (FX) APIs
    registerForexApis(server);

    // Register cryptocurrencies APIs
    registerCryptoApis(server);

    // Register commodities APIs
    registerCommoditiesApis(server);

    // Register economic indicators APIs
    registerEconomicApis(server);

    // Register technical indicators APIs
    registerTechnicalApis(server);
} 