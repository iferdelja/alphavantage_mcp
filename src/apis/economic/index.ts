import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { makeAlphaVantageRequest } from "../../utils/api.js";
import {
    EconomicIndicatorResponse,
    RealGDPResponse,
    RealGDPPerCapitaResponse,
    TreasuryYieldResponse,
    FederalFundsRateResponse,
    CPIResponse,
    InflationResponse,
    RetailSalesResponse,
    DurablesResponse,
    UnemploymentResponse,
    NonfarmPayrollResponse
} from "../../types/economic.js";

/**
 * Format Alpha Vantage economic indicator data into a readable string
 */
function formatEconomicData(economicData: EconomicIndicatorResponse, limit: number = 10): string {
    if (economicData.Information) {
        return `Error: ${economicData.Information}`;
    }

    if (economicData.Note) {
        return `Note: ${economicData.Note}`;
    }

    if (!economicData.name || !economicData.data || economicData.data.length === 0) {
        return "No economic indicator data available";
    }

    const result = [
        `== ${economicData.name} ==`,
        `Interval: ${economicData.interval || "Unknown"}`,
        `Unit: ${economicData.unit || "Unknown"}`,
        ``
    ];

    // Limit the number of data points displayed
    const displayData = economicData.data.slice(0, limit);

    for (const point of displayData) {
        // Format date to a more readable format
        const date = new Date(point.date);
        const formattedDate = economicData.interval === "monthly"
            ? date.toLocaleString('en-US', { month: 'long', year: 'numeric' })
            : economicData.interval === "quarterly"
                ? `Q${Math.floor(date.getMonth() / 3) + 1} ${date.getFullYear()}`
                : economicData.interval === "annual" || economicData.interval === "yearly"
                    ? date.getFullYear().toString()
                    : economicData.interval === "semiannual"
                        ? `${date.getMonth() < 6 ? "H1" : "H2"} ${date.getFullYear()}`
                        : point.date;

        result.push(`${formattedDate}: ${point.value} ${economicData.unit || ""}`);
    }

    if (economicData.data.length > limit) {
        result.push(`\n... and ${economicData.data.length - limit} more data points (showing latest ${limit} only)`);
    }

    return result.join("\n");
}

/**
 * Create a generic economic indicator endpoint function
 */
function createEconomicEndpoint<T extends EconomicIndicatorResponse>(
    server: McpServer,
    name: string,
    functionName: string,
    description: string,
    params: {
        interval?: boolean;
        maturity?: boolean;
    } = {}
) {
    const schema: Record<string, any> = {
        limit: z.number().optional().describe("Number of data points to display (default: 10)")
    };

    if (params.interval) {
        schema.interval = z.enum(["daily", "weekly", "monthly", "quarterly", "annual", "semiannual"]).optional()
            .describe("Time interval between data points (default depends on the indicator)");
    }

    if (params.maturity) {
        schema.maturity = z.enum(["3month", "2year", "5year", "7year", "10year", "30year"]).optional()
            .describe("Treasury maturity (default: 10year)");
    }

    server.tool(
        name,
        description,
        schema,
        async (args) => {
            const { limit = 10, ...restArgs } = args;
            const response = await makeAlphaVantageRequest<T>({
                function: functionName,
                ...restArgs
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
                        text: formatEconomicData(response, limit)
                    }
                ]
            };
        }
    );
}

/**
 * Register all economic indicators APIs with the server
 */
export function registerEconomicApis(server: McpServer) {
    // Real GDP endpoint
    createEconomicEndpoint<RealGDPResponse>(
        server,
        "get-real-gdp",
        "REAL_GDP",
        "Get real gross domestic product (GDP) of the United States",
        { interval: true }
    );

    // Real GDP Per Capita endpoint
    createEconomicEndpoint<RealGDPPerCapitaResponse>(
        server,
        "get-real-gdp-per-capita",
        "REAL_GDP_PER_CAPITA",
        "Get real GDP per capita of the United States"
    );

    // Treasury Yield endpoint
    createEconomicEndpoint<TreasuryYieldResponse>(
        server,
        "get-treasury-yield",
        "TREASURY_YIELD",
        "Get U.S. treasury yield of a given maturity",
        { interval: true, maturity: true }
    );

    // Federal Funds Rate endpoint
    createEconomicEndpoint<FederalFundsRateResponse>(
        server,
        "get-federal-funds-rate",
        "FEDERAL_FUNDS_RATE",
        "Get federal funds rate in the United States",
        { interval: true }
    );

    // CPI endpoint
    createEconomicEndpoint<CPIResponse>(
        server,
        "get-cpi",
        "CPI",
        "Get consumer price index (CPI) of the United States",
        { interval: true }
    );

    // Inflation endpoint
    createEconomicEndpoint<InflationResponse>(
        server,
        "get-inflation",
        "INFLATION",
        "Get annual inflation rates (consumer prices) of the United States"
    );

    // Retail Sales endpoint
    createEconomicEndpoint<RetailSalesResponse>(
        server,
        "get-retail-sales",
        "RETAIL_SALES",
        "Get advance estimates of U.S. retail and food services sales"
    );

    // Durable Goods Orders endpoint
    createEconomicEndpoint<DurablesResponse>(
        server,
        "get-durable-goods-orders",
        "DURABLES",
        "Get U.S. manufacturers' new orders of durable goods"
    );

    // Unemployment Rate endpoint
    createEconomicEndpoint<UnemploymentResponse>(
        server,
        "get-unemployment-rate",
        "UNEMPLOYMENT",
        "Get monthly unemployment data of the United States"
    );

    // Nonfarm Payroll endpoint
    createEconomicEndpoint<NonfarmPayrollResponse>(
        server,
        "get-nonfarm-payroll",
        "NONFARM_PAYROLL",
        "Get monthly US All Employees: Total Nonfarm (Nonfarm Payroll)"
    );
} 