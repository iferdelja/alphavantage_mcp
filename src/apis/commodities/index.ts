import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { makeAlphaVantageRequest } from "../../utils/api.js";
import {
    CommodityResponse,
    WTIResponse,
    BrentResponse,
    NaturalGasResponse,
    CopperResponse,
    AluminumResponse,
    WheatResponse,
    CornResponse,
    CottonResponse,
    SugarResponse,
    CoffeeResponse,
    GlobalCommoditiesIndexResponse
} from "../../types/commodities.js";

/**
 * Format Alpha Vantage commodity data into a readable string
 */
function formatCommodityData(commodityData: CommodityResponse, limit: number = 10): string {
    if (commodityData.Information) {
        return `Error: ${commodityData.Information}`;
    }

    if (commodityData.Note) {
        return `Note: ${commodityData.Note}`;
    }

    if (!commodityData.name || !commodityData.data || commodityData.data.length === 0) {
        return "No commodity data available";
    }

    const result = [
        `== ${commodityData.name} ==`,
        `Interval: ${commodityData.interval || "Unknown"}`,
        `Unit: ${commodityData.unit || "Unknown"}`,
        ``
    ];

    // Limit the number of data points displayed
    const displayData = commodityData.data.slice(0, limit);

    for (const point of displayData) {
        // Format date to a more readable format
        const date = new Date(point.date);
        const formattedDate = commodityData.interval === "monthly"
            ? date.toLocaleString('en-US', { month: 'long', year: 'numeric' })
            : commodityData.interval === "quarterly"
                ? `Q${Math.floor(date.getMonth() / 3) + 1} ${date.getFullYear()}`
                : commodityData.interval === "annual"
                    ? date.getFullYear().toString()
                    : point.date;

        result.push(`${formattedDate}: ${point.value} ${commodityData.unit || ""}`);
    }

    if (commodityData.data.length > limit) {
        result.push(`\n... and ${commodityData.data.length - limit} more data points (showing latest ${limit} only)`);
    }

    return result.join("\n");
}

/**
 * Create a generic commodity endpoint function
 */
function createCommodityEndpoint<T extends CommodityResponse>(
    server: McpServer,
    name: string,
    functionName: string,
    description: string
) {
    server.tool(
        name,
        description,
        {
            interval: z.enum(["daily", "weekly", "monthly", "quarterly", "annual"]).optional().describe("Time interval between data points (default: monthly)"),
            limit: z.number().optional().describe("Number of data points to display (default: 10)")
        },
        async ({ interval = "monthly", limit = 10 }) => {
            const response = await makeAlphaVantageRequest<T>({
                function: functionName,
                interval
            });

            if (!response) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `Error: Failed to fetch ${description.toLowerCase()}.`
                        }
                    ]
                };
            }

            return {
                content: [
                    {
                        type: "text",
                        text: formatCommodityData(response, limit)
                    }
                ]
            };
        }
    );
}

/**
 * Register all commodities APIs with the server
 */
export function registerCommoditiesApis(server: McpServer) {
    // Crude Oil (WTI) endpoint
    createCommodityEndpoint<WTIResponse>(
        server,
        "get-wti",
        "WTI",
        "Get West Texas Intermediate (WTI) crude oil prices"
    );

    // Crude Oil (Brent) endpoint
    createCommodityEndpoint<BrentResponse>(
        server,
        "get-brent",
        "BRENT",
        "Get Brent (Europe) crude oil prices"
    );

    // Natural Gas endpoint
    createCommodityEndpoint<NaturalGasResponse>(
        server,
        "get-natural-gas",
        "NATURAL_GAS",
        "Get natural gas prices"
    );

    // Copper endpoint
    createCommodityEndpoint<CopperResponse>(
        server,
        "get-copper",
        "COPPER",
        "Get global copper prices"
    );

    // Aluminum endpoint
    createCommodityEndpoint<AluminumResponse>(
        server,
        "get-aluminum",
        "ALUMINUM",
        "Get global aluminum prices"
    );

    // Wheat endpoint
    createCommodityEndpoint<WheatResponse>(
        server,
        "get-wheat",
        "WHEAT",
        "Get global wheat prices"
    );

    // Corn endpoint
    createCommodityEndpoint<CornResponse>(
        server,
        "get-corn",
        "CORN",
        "Get global corn prices"
    );

    // Cotton endpoint
    createCommodityEndpoint<CottonResponse>(
        server,
        "get-cotton",
        "COTTON",
        "Get global cotton prices"
    );

    // Sugar endpoint
    createCommodityEndpoint<SugarResponse>(
        server,
        "get-sugar",
        "SUGAR",
        "Get global sugar prices"
    );

    // Coffee endpoint
    createCommodityEndpoint<CoffeeResponse>(
        server,
        "get-coffee",
        "COFFEE",
        "Get global coffee prices"
    );

    // Global Commodities Index endpoint
    createCommodityEndpoint<GlobalCommoditiesIndexResponse>(
        server,
        "get-global-commodities-index",
        "ALL_COMMODITIES",
        "Get global price index of all commodities"
    );
} 