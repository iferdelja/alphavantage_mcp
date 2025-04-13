import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { makeAlphaVantageRequest } from "../../utils/api.js";
import { ExchangeRateResponse, FxDailyResponse, FxWeeklyResponse, FxMonthlyResponse } from "../../types/forex.js";

/**
 * Format Alpha Vantage exchange rate data into a readable string
 */
function formatExchangeRate(exchangeRateData: ExchangeRateResponse): string {
    if (exchangeRateData.Information) {
        return `Error: ${exchangeRateData.Information}`;
    }

    if (exchangeRateData.Note) {
        return `Note: ${exchangeRateData.Note}`;
    }

    const rateData = exchangeRateData["Realtime Currency Exchange Rate"];
    if (!rateData) {
        return "No exchange rate data available";
    }

    return [
        `== Exchange Rate Information ==`,
        `From: ${rateData["1. From_Currency Code"] || "Unknown"} (${rateData["2. From_Currency Name"] || "Unknown"})`,
        `To: ${rateData["3. To_Currency Code"] || "Unknown"} (${rateData["4. To_Currency Name"] || "Unknown"})`,
        `Exchange Rate: ${rateData["5. Exchange Rate"] || "Unknown"}`,
        `Bid Price: ${rateData["8. Bid Price"] || "Unknown"}`,
        `Ask Price: ${rateData["9. Ask Price"] || "Unknown"}`,
        `Last Refreshed: ${rateData["6. Last Refreshed"] || "Unknown"} ${rateData["7. Time Zone"] || ""}`,
    ].join("\n");
}

/**
 * Format Alpha Vantage FX daily time series data into a readable string
 */
function formatFxDailyTimeSeries(timeSeriesData: FxDailyResponse, limit: number = 10): string {
    if (timeSeriesData.Information) {
        return `Error: ${timeSeriesData.Information}`;
    }

    if (timeSeriesData.Note) {
        return `Note: ${timeSeriesData.Note}`;
    }

    const metaData = timeSeriesData["Meta Data"];
    const timeSeries = timeSeriesData["Time Series FX (Daily)"];

    if (!metaData || !timeSeries) {
        return "No daily FX time series data available";
    }

    const result = [
        `== Daily FX Time Series for ${metaData["2. From Symbol"] || "Unknown"}/${metaData["3. To Symbol"] || "Unknown"} ==`,
        `Last Refreshed: ${metaData["5. Last Refreshed"] || "Unknown"}`,
        `Time Zone: ${metaData["6. Time Zone"] || "Unknown"}`,
        ``
    ];

    // Sort dates in descending order
    const dates = Object.keys(timeSeries).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    // Limit the number of dates displayed
    const displayDates = dates.slice(0, limit);

    for (const date of displayDates) {
        const dayData = timeSeries[date];
        result.push(`== ${date} ==`);
        result.push(`Open: ${dayData["1. open"] || "Unknown"}`);
        result.push(`High: ${dayData["2. high"] || "Unknown"}`);
        result.push(`Low: ${dayData["3. low"] || "Unknown"}`);
        result.push(`Close: ${dayData["4. close"] || "Unknown"}`);
        result.push(``);
    }

    if (dates.length > limit) {
        result.push(`... and ${dates.length - limit} more days (showing last ${limit} days only)`);
    }

    return result.join("\n");
}

/**
 * Format Alpha Vantage FX weekly time series data into a readable string
 */
function formatFxWeeklyTimeSeries(timeSeriesData: FxWeeklyResponse, limit: number = 10): string {
    if (timeSeriesData.Information) {
        return `Error: ${timeSeriesData.Information}`;
    }

    if (timeSeriesData.Note) {
        return `Note: ${timeSeriesData.Note}`;
    }

    const metaData = timeSeriesData["Meta Data"];
    const timeSeries = timeSeriesData["Time Series FX (Weekly)"];

    if (!metaData || !timeSeries) {
        return "No weekly FX time series data available";
    }

    const result = [
        `== Weekly FX Time Series for ${metaData["2. From Symbol"] || "Unknown"}/${metaData["3. To Symbol"] || "Unknown"} ==`,
        `Last Refreshed: ${metaData["4. Last Refreshed"] || "Unknown"}`,
        `Time Zone: ${metaData["5. Time Zone"] || "Unknown"}`,
        ``
    ];

    // Sort dates in descending order
    const dates = Object.keys(timeSeries).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    // Limit the number of dates displayed
    const displayDates = dates.slice(0, limit);

    for (const date of displayDates) {
        const weekData = timeSeries[date];
        result.push(`== Week Ending ${date} ==`);
        result.push(`Open: ${weekData["1. open"] || "Unknown"}`);
        result.push(`High: ${weekData["2. high"] || "Unknown"}`);
        result.push(`Low: ${weekData["3. low"] || "Unknown"}`);
        result.push(`Close: ${weekData["4. close"] || "Unknown"}`);
        result.push(``);
    }

    if (dates.length > limit) {
        result.push(`... and ${dates.length - limit} more weeks (showing last ${limit} weeks only)`);
    }

    return result.join("\n");
}

/**
 * Format Alpha Vantage FX monthly time series data into a readable string
 */
function formatFxMonthlyTimeSeries(timeSeriesData: FxMonthlyResponse, limit: number = 10): string {
    if (timeSeriesData.Information) {
        return `Error: ${timeSeriesData.Information}`;
    }

    if (timeSeriesData.Note) {
        return `Note: ${timeSeriesData.Note}`;
    }

    const metaData = timeSeriesData["Meta Data"];
    const timeSeries = timeSeriesData["Time Series FX (Monthly)"];

    if (!metaData || !timeSeries) {
        return "No monthly FX time series data available";
    }

    const result = [
        `== Monthly FX Time Series for ${metaData["2. From Symbol"] || "Unknown"}/${metaData["3. To Symbol"] || "Unknown"} ==`,
        `Last Refreshed: ${metaData["4. Last Refreshed"] || "Unknown"}`,
        `Time Zone: ${metaData["5. Time Zone"] || "Unknown"}`,
        ``
    ];

    // Sort dates in descending order
    const dates = Object.keys(timeSeries).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    // Limit the number of dates displayed
    const displayDates = dates.slice(0, limit);

    for (const date of displayDates) {
        const monthData = timeSeries[date];
        // Format the date to show month and year (e.g., "April 2025")
        const dateObj = new Date(date);
        const formattedDate = dateObj.toLocaleString('en-US', { month: 'long', year: 'numeric' });

        result.push(`== ${formattedDate} (${date}) ==`);
        result.push(`Open: ${monthData["1. open"] || "Unknown"}`);
        result.push(`High: ${monthData["2. high"] || "Unknown"}`);
        result.push(`Low: ${monthData["3. low"] || "Unknown"}`);
        result.push(`Close: ${monthData["4. close"] || "Unknown"}`);
        result.push(``);
    }

    if (dates.length > limit) {
        result.push(`... and ${dates.length - limit} more months (showing last ${limit} months only)`);
    }

    return result.join("\n");
}

/**
 * Get the appropriate formatter based on the series type
 */
function getFormatterBySeries(seriesType: string): (response: any, limit: number) => string {
    const formatters: Record<string, any> = {
        "FX_DAILY": formatFxDailyTimeSeries,
        "FX_WEEKLY": formatFxWeeklyTimeSeries,
        "FX_MONTHLY": formatFxMonthlyTimeSeries
    };

    return formatters[seriesType] || formatFxDailyTimeSeries;
}

/**
 * Register all forex (FX) APIs with the server
 */
export function registerForexApis(server: McpServer) {
    // Exchange Rates endpoint
    server.tool(
        "get-exchange-rate",
        "Get realtime exchange rate for any pair of digital or physical currencies",
        {
            from_currency: z.string().describe("The source currency (e.g., USD, BTC)"),
            to_currency: z.string().describe("The target currency (e.g., JPY, EUR)")
        },
        async ({ from_currency, to_currency }) => {
            const response = await makeAlphaVantageRequest<ExchangeRateResponse>({
                function: "CURRENCY_EXCHANGE_RATE",
                from_currency,
                to_currency
            });

            if (!response) {
                return {
                    content: [
                        {
                            type: "text",
                            text: "Error: Failed to fetch exchange rate data."
                        }
                    ]
                };
            }

            return {
                content: [
                    {
                        type: "text",
                        text: formatExchangeRate(response)
                    }
                ]
            };
        }
    );

    // Unified FX time series endpoint
    server.tool(
        "get-fx-series",
        "Get time series data of a forex currency pair",
        {
            series_type: z.enum(["daily", "weekly", "monthly"])
                .describe("The type of time series data to retrieve"),
            from_symbol: z.string().describe("The source currency (e.g., EUR)"),
            to_symbol: z.string().describe("The target currency (e.g., USD)"),
            outputsize: z.enum(["compact", "full"]).optional()
                .describe("Data size: 'compact' (last 100 data points) or 'full' (full-length time series) - only applies to daily series"),
            limit: z.number().optional().describe("Number of data points to display (default: 10)")
        },
        async (args) => {
            const { series_type, from_symbol, to_symbol, outputsize = "compact", limit = 10 } = args;

            // Map the user-friendly series_type to the actual API function
            const functionMap: Record<string, string> = {
                "daily": "FX_DAILY",
                "weekly": "FX_WEEKLY",
                "monthly": "FX_MONTHLY"
            };

            const function_name = functionMap[series_type];

            // Create the API params object
            const apiParams: Record<string, string> = {
                function: function_name,
                from_symbol,
                to_symbol
            };

            // Add outputsize only for daily series
            if (series_type === "daily") {
                apiParams.outputsize = outputsize;
            }

            const response = await makeAlphaVantageRequest<any>(apiParams);

            if (!response) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `Error: Failed to fetch ${series_type} FX data.`
                        }
                    ]
                };
            }

            // Get the appropriate formatter based on the series type
            const formatter = getFormatterBySeries(function_name);

            return {
                content: [
                    {
                        type: "text",
                        text: formatter(response, limit)
                    }
                ]
            };
        }
    );
} 