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
 * Register all commodities APIs with the server
 */
export function registerCommoditiesApis(server: McpServer) {
    server.tool(
        "get-commodity",
        "Get global commodity prices for various types",
        {
            commodity_type: z.enum([
                "WTI", "BRENT", "NATURAL_GAS", "COPPER", "ALUMINUM",
                "WHEAT", "CORN", "COTTON", "SUGAR", "COFFEE", "ALL_COMMODITIES"
            ]).describe("The type of commodity data to retrieve"),
            interval: z.enum(["daily", "weekly", "monthly", "quarterly", "annual"])
                .optional()
                .describe("Time interval between data points (default: monthly)"),
            limit: z.number()
                .optional()
                .describe("Number of data points to display (default: 10)")
        },
        async (args) => {
            const { commodity_type, interval = "monthly", limit = 10 } = args;

            // Map commodity types to their descriptions for better error messages
            const commodityDescriptions: Record<string, string> = {
                "WTI": "West Texas Intermediate (WTI) crude oil prices",
                "BRENT": "Brent (Europe) crude oil prices",
                "NATURAL_GAS": "natural gas prices",
                "COPPER": "global copper prices",
                "ALUMINUM": "global aluminum prices",
                "WHEAT": "global wheat prices",
                "CORN": "global corn prices",
                "COTTON": "global cotton prices",
                "SUGAR": "global sugar prices",
                "COFFEE": "global coffee prices",
                "ALL_COMMODITIES": "global price index of all commodities"
            };

            const response = await makeAlphaVantageRequest<CommodityResponse>({
                function: commodity_type,
                interval
            });

            if (!response) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `Error: Failed to fetch ${commodityDescriptions[commodity_type] || 'commodity data'}.`
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