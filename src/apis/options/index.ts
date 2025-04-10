import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { makeAlphaVantageRequest } from "../../utils/api.js";
import { RealtimeOptionsResponse, HistoricalOptionsResponse } from "../../types/options.js";

/**
 * Format Alpha Vantage realtime options data into a readable string
 */
function formatRealtimeOptions(optionsData: RealtimeOptionsResponse): string {
    if (optionsData.Information) {
        return `Error: ${optionsData.Information}`;
    }

    if (optionsData.Note) {
        return `Note: ${optionsData.Note}`;
    }

    if (optionsData.message) {
        return `Message: ${optionsData.message}`;
    }

    const options = optionsData.data;
    if (!options || options.length === 0) {
        return "No options data available";
    }

    const result = [`${optionsData.endpoint || "Realtime Options"}\n`];

    // Group by expiration date
    const expirationDates = Array.from(new Set(options.map(option => option.expiration)));
    expirationDates.sort(); // Sort chronologically

    for (const expDate of expirationDates) {
        result.push(`\n== Expiration: ${expDate} ==`);

        const expirationOptions = options.filter(opt => opt.expiration === expDate);

        // Sort by strike price
        const sortedOptions = expirationOptions.sort((a, b) => {
            const strikeA = parseFloat(a.strike || "0");
            const strikeB = parseFloat(b.strike || "0");
            return strikeA - strikeB;
        });

        for (const option of sortedOptions) {
            const optionType = option.type?.toUpperCase() || "UNKNOWN";
            result.push(`\n${option.symbol} ${expDate} ${option.strike} ${optionType} (${option.contractID})`);
            result.push(`Last: ${option.last || "N/A"} | Mark: ${option.mark || "N/A"}`);
            result.push(`Bid: ${option.bid || "N/A"} (${option.bid_size || "N/A"}) | Ask: ${option.ask || "N/A"} (${option.ask_size || "N/A"})`);
            result.push(`Volume: ${option.volume || "N/A"} | Open Interest: ${option.open_interest || "N/A"}`);

            // Add Greeks if available
            if (option.implied_volatility) {
                result.push(`IV: ${option.implied_volatility || "N/A"} | Delta: ${option.delta || "N/A"} | Gamma: ${option.gamma || "N/A"}`);
                result.push(`Theta: ${option.theta || "N/A"} | Vega: ${option.vega || "N/A"} | Rho: ${option.rho || "N/A"}`);
            }
        }
    }

    return result.join("\n");
}

/**
 * Format Alpha Vantage historical options data into a readable string
 */
function formatHistoricalOptions(optionsData: HistoricalOptionsResponse): string {
    if (optionsData.Information) {
        return `Error: ${optionsData.Information}`;
    }

    if (optionsData.Note) {
        return `Note: ${optionsData.Note}`;
    }

    if (optionsData.message && optionsData.message !== "success") {
        return `Message: ${optionsData.message}`;
    }

    const options = optionsData.data;
    if (!options || options.length === 0) {
        return "No historical options data available";
    }

    // Get the date from the first option (they should all be the same date)
    const tradeDate = options[0].date || "Unknown Date";
    const result = [`${optionsData.endpoint || "Historical Options"} - ${tradeDate}\n`];

    // Group by expiration date
    const expirationDates = Array.from(new Set(options.map(option => option.expiration)));
    expirationDates.sort(); // Sort chronologically

    for (const expDate of expirationDates) {
        result.push(`\n== Expiration: ${expDate} ==`);

        const expirationOptions = options.filter(opt => opt.expiration === expDate);

        // Sort by strike price
        const sortedOptions = expirationOptions.sort((a, b) => {
            const strikeA = parseFloat(a.strike || "0");
            const strikeB = parseFloat(b.strike || "0");
            return strikeA - strikeB;
        });

        for (const option of sortedOptions) {
            const optionType = option.type?.toUpperCase() || "UNKNOWN";
            result.push(`\n${option.symbol} ${expDate} ${option.strike} ${optionType} (${option.contractID})`);
            result.push(`Last: ${option.last || "N/A"} | Mark: ${option.mark || "N/A"}`);
            result.push(`Bid: ${option.bid || "N/A"} (${option.bid_size || "N/A"}) | Ask: ${option.ask || "N/A"} (${option.ask_size || "N/A"})`);
            result.push(`Volume: ${option.volume || "N/A"} | Open Interest: ${option.open_interest || "N/A"}`);

            // Always include Greeks for historical options
            result.push(`IV: ${option.implied_volatility || "N/A"} | Delta: ${option.delta || "N/A"} | Gamma: ${option.gamma || "N/A"}`);
            result.push(`Theta: ${option.theta || "N/A"} | Vega: ${option.vega || "N/A"} | Rho: ${option.rho || "N/A"}`);
        }
    }

    return result.join("\n");
}

/**
 * Register all options-related APIs with the server
 */
export function registerOptionsApis(server: McpServer) {
    // Realtime Options Trending Premium API
    server.tool(
        "get-realtime-options",
        "Get realtime US options data with full market coverage, sorted by expiration dates and strike prices.",
        {
            symbol: z.string().describe("The name of the equity (e.g., IBM)"),
            require_greeks: z.boolean().optional().describe("Enable greeks & implied volatility fields (default: false)"),
            contract: z.string().optional().describe("Specific US options contract ID"),
            datatype: z.enum(["json", "csv"]).optional().describe("Response format (default: json)")
        },
        async ({ symbol, require_greeks, contract, datatype }) => {
            const apiParams: Record<string, string> = {
                function: "REALTIME_OPTIONS",
                symbol
            };

            if (require_greeks !== undefined) {
                apiParams.require_greeks = require_greeks.toString();
            }

            if (contract) {
                apiParams.contract = contract;
            }

            if (datatype) {
                apiParams.datatype = datatype;
            }

            const data = await makeAlphaVantageRequest<RealtimeOptionsResponse>(apiParams);
            if (!data) {
                return {
                    content: [
                        {
                            type: "text",
                            text: "Failed to fetch options data. Please try again later."
                        }
                    ]
                };
            }

            return {
                content: [
                    {
                        type: "text",
                        text: formatRealtimeOptions(data)
                    }
                ]
            };
        }
    );

    // Historical Options Trending API
    server.tool(
        "get-historical-options",
        "Get historical options data covering 15+ years of history with implied volatility and Greeks.",
        {
            symbol: z.string().describe("The name of the equity (e.g., IBM)"),
            date: z.string().optional().describe("Specific date in YYYY-MM-DD format (default: previous trading session)"),
            datatype: z.enum(["json", "csv"]).optional().describe("Response format (default: json)")
        },
        async ({ symbol, date, datatype }) => {
            const apiParams: Record<string, string> = {
                function: "HISTORICAL_OPTIONS",
                symbol
            };

            if (date) {
                apiParams.date = date;
            }

            if (datatype) {
                apiParams.datatype = datatype;
            }

            const data = await makeAlphaVantageRequest<HistoricalOptionsResponse>(apiParams);
            if (!data) {
                return {
                    content: [
                        {
                            type: "text",
                            text: "Failed to fetch historical options data. Please try again later."
                        }
                    ]
                };
            }

            return {
                content: [
                    {
                        type: "text",
                        text: formatHistoricalOptions(data)
                    }
                ]
            };
        }
    );
} 