import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { makeAlphaVantageRequest } from "../../utils/api.js";
import {
    CryptoExchangeRateResponse,
    CryptoIntradayResponse,
    DigitalCurrencyDailyResponse,
    DigitalCurrencyWeeklyResponse,
    DigitalCurrencyMonthlyResponse
} from "../../types/crypto.js";

/**
 * Format Alpha Vantage crypto exchange rate data into a readable string
 */
function formatCryptoExchangeRate(exchangeRateData: CryptoExchangeRateResponse): string {
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
        `== Cryptocurrency Exchange Rate Information ==`,
        `From: ${rateData["1. From_Currency Code"] || "Unknown"} (${rateData["2. From_Currency Name"] || "Unknown"})`,
        `To: ${rateData["3. To_Currency Code"] || "Unknown"} (${rateData["4. To_Currency Name"] || "Unknown"})`,
        `Exchange Rate: ${rateData["5. Exchange Rate"] || "Unknown"}`,
        `Bid Price: ${rateData["8. Bid Price"] || "Unknown"}`,
        `Ask Price: ${rateData["9. Ask Price"] || "Unknown"}`,
        `Last Refreshed: ${rateData["6. Last Refreshed"] || "Unknown"} ${rateData["7. Time Zone"] || ""}`,
    ].join("\n");
}

/**
 * Format Alpha Vantage crypto intraday time series data into a readable string
 */
function formatCryptoIntradaySeries(timeSeriesData: CryptoIntradayResponse, limit: number = 10): string {
    if (timeSeriesData.Information) {
        return `Error: ${timeSeriesData.Information}`;
    }

    if (timeSeriesData.Note) {
        return `Note: ${timeSeriesData.Note}`;
    }

    const metaData = timeSeriesData["Meta Data"];
    const timeSeries = timeSeriesData["Time Series Crypto"];

    if (!metaData || !timeSeries) {
        return "No intraday cryptocurrency time series data available";
    }

    const result = [
        `== ${metaData["7. Interval"] || ""} Intraday Cryptocurrency Data for ${metaData["2. Digital Currency Code"] || "Unknown"} (${metaData["3. Digital Currency Name"] || "Unknown"}) ==`,
        `Market: ${metaData["4. Market Code"] || "Unknown"} (${metaData["5. Market Name"] || "Unknown"})`,
        `Last Refreshed: ${metaData["6. Last Refreshed"] || "Unknown"}`,
        `Time Zone: ${metaData["9. Time Zone"] || "Unknown"}`,
        ``
    ];

    // Sort timestamps in descending order
    const timestamps = Object.keys(timeSeries).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    // Limit the number of timestamps displayed
    const displayTimestamps = timestamps.slice(0, limit);

    for (const timestamp of displayTimestamps) {
        const data = timeSeries[timestamp];
        result.push(`== ${timestamp} ==`);
        result.push(`Open: ${data["1. open"] || "Unknown"}`);
        result.push(`High: ${data["2. high"] || "Unknown"}`);
        result.push(`Low: ${data["3. low"] || "Unknown"}`);
        result.push(`Close: ${data["4. close"] || "Unknown"}`);
        result.push(`Volume: ${data["5. volume"] || "Unknown"}`);
        result.push(``);
    }

    if (timestamps.length > limit) {
        result.push(`... and ${timestamps.length - limit} more data points (showing last ${limit} only)`);
    }

    return result.join("\n");
}

/**
 * Format Alpha Vantage digital currency daily time series data into a readable string
 */
function formatDigitalCurrencyDaily(timeSeriesData: DigitalCurrencyDailyResponse, limit: number = 10): string {
    if (timeSeriesData.Information) {
        return `Error: ${timeSeriesData.Information}`;
    }

    if (timeSeriesData.Note) {
        return `Note: ${timeSeriesData.Note}`;
    }

    const metaData = timeSeriesData["Meta Data"];
    const timeSeries = timeSeriesData["Time Series (Digital Currency Daily)"];

    if (!metaData || !timeSeries) {
        return "No daily cryptocurrency time series data available";
    }

    const marketCode = metaData["4. Market Code"] || "Unknown";

    const result = [
        `== Daily Cryptocurrency Data for ${metaData["2. Digital Currency Code"] || "Unknown"} (${metaData["3. Digital Currency Name"] || "Unknown"}) ==`,
        `Market: ${marketCode} (${metaData["5. Market Name"] || "Unknown"})`,
        `Last Refreshed: ${metaData["6. Last Refreshed"] || "Unknown"}`,
        `Time Zone: ${metaData["7. Time Zone"] || "Unknown"}`,
        ``
    ];

    // Sort dates in descending order
    const dates = Object.keys(timeSeries).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    // Limit the number of dates displayed
    const displayDates = dates.slice(0, limit);

    for (const date of displayDates) {
        const data = timeSeries[date];
        result.push(`== ${date} ==`);
        result.push(`Open (USD): ${data["1a. open (USD)"] || "Unknown"}`);
        // Use a safer approach for dynamic property names
        const openMarket = data[`1b. open (${marketCode})` as keyof typeof data] || data["1b. open (EUR)"] || "Unknown";
        result.push(`Open (${marketCode}): ${openMarket}`);

        result.push(`High (USD): ${data["2a. high (USD)"] || "Unknown"}`);
        const highMarket = data[`2b. high (${marketCode})` as keyof typeof data] || data["2b. high (EUR)"] || "Unknown";
        result.push(`High (${marketCode}): ${highMarket}`);

        result.push(`Low (USD): ${data["3a. low (USD)"] || "Unknown"}`);
        const lowMarket = data[`3b. low (${marketCode})` as keyof typeof data] || data["3b. low (EUR)"] || "Unknown";
        result.push(`Low (${marketCode}): ${lowMarket}`);

        result.push(`Close (USD): ${data["4a. close (USD)"] || "Unknown"}`);
        const closeMarket = data[`4b. close (${marketCode})` as keyof typeof data] || data["4b. close (EUR)"] || "Unknown";
        result.push(`Close (${marketCode}): ${closeMarket}`);

        result.push(`Volume: ${data["5. volume"] || "Unknown"}`);
        result.push(`Market Cap (USD): ${data["6. market cap (USD)"] || "Unknown"}`);
        result.push(``);
    }

    if (dates.length > limit) {
        result.push(`... and ${dates.length - limit} more days (showing last ${limit} days only)`);
    }

    return result.join("\n");
}

/**
 * Format Alpha Vantage digital currency weekly time series data into a readable string
 */
function formatDigitalCurrencyWeekly(timeSeriesData: DigitalCurrencyWeeklyResponse, limit: number = 10): string {
    if (timeSeriesData.Information) {
        return `Error: ${timeSeriesData.Information}`;
    }

    if (timeSeriesData.Note) {
        return `Note: ${timeSeriesData.Note}`;
    }

    const metaData = timeSeriesData["Meta Data"];
    const timeSeries = timeSeriesData["Time Series (Digital Currency Weekly)"];

    if (!metaData || !timeSeries) {
        return "No weekly cryptocurrency time series data available";
    }

    const marketCode = metaData["4. Market Code"] || "Unknown";

    const result = [
        `== Weekly Cryptocurrency Data for ${metaData["2. Digital Currency Code"] || "Unknown"} (${metaData["3. Digital Currency Name"] || "Unknown"}) ==`,
        `Market: ${marketCode} (${metaData["5. Market Name"] || "Unknown"})`,
        `Last Refreshed: ${metaData["6. Last Refreshed"] || "Unknown"}`,
        `Time Zone: ${metaData["7. Time Zone"] || "Unknown"}`,
        ``
    ];

    // Sort dates in descending order
    const dates = Object.keys(timeSeries).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    // Limit the number of dates displayed
    const displayDates = dates.slice(0, limit);

    for (const date of displayDates) {
        const data = timeSeries[date];
        result.push(`== Week Ending ${date} ==`);
        result.push(`Open (USD): ${data["1a. open (USD)"] || "Unknown"}`);
        // Use a safer approach for dynamic property names
        const openMarket = data[`1b. open (${marketCode})` as keyof typeof data] || data["1b. open (EUR)"] || "Unknown";
        result.push(`Open (${marketCode}): ${openMarket}`);

        result.push(`High (USD): ${data["2a. high (USD)"] || "Unknown"}`);
        const highMarket = data[`2b. high (${marketCode})` as keyof typeof data] || data["2b. high (EUR)"] || "Unknown";
        result.push(`High (${marketCode}): ${highMarket}`);

        result.push(`Low (USD): ${data["3a. low (USD)"] || "Unknown"}`);
        const lowMarket = data[`3b. low (${marketCode})` as keyof typeof data] || data["3b. low (EUR)"] || "Unknown";
        result.push(`Low (${marketCode}): ${lowMarket}`);

        result.push(`Close (USD): ${data["4a. close (USD)"] || "Unknown"}`);
        const closeMarket = data[`4b. close (${marketCode})` as keyof typeof data] || data["4b. close (EUR)"] || "Unknown";
        result.push(`Close (${marketCode}): ${closeMarket}`);

        result.push(`Volume: ${data["5. volume"] || "Unknown"}`);
        result.push(`Market Cap (USD): ${data["6. market cap (USD)"] || "Unknown"}`);
        result.push(``);
    }

    if (dates.length > limit) {
        result.push(`... and ${dates.length - limit} more weeks (showing last ${limit} weeks only)`);
    }

    return result.join("\n");
}

/**
 * Format Alpha Vantage digital currency monthly time series data into a readable string
 */
function formatDigitalCurrencyMonthly(timeSeriesData: DigitalCurrencyMonthlyResponse, limit: number = 10): string {
    if (timeSeriesData.Information) {
        return `Error: ${timeSeriesData.Information}`;
    }

    if (timeSeriesData.Note) {
        return `Note: ${timeSeriesData.Note}`;
    }

    const metaData = timeSeriesData["Meta Data"];
    const timeSeries = timeSeriesData["Time Series (Digital Currency Monthly)"];

    if (!metaData || !timeSeries) {
        return "No monthly cryptocurrency time series data available";
    }

    const marketCode = metaData["4. Market Code"] || "Unknown";

    const result = [
        `== Monthly Cryptocurrency Data for ${metaData["2. Digital Currency Code"] || "Unknown"} (${metaData["3. Digital Currency Name"] || "Unknown"}) ==`,
        `Market: ${marketCode} (${metaData["5. Market Name"] || "Unknown"})`,
        `Last Refreshed: ${metaData["6. Last Refreshed"] || "Unknown"}`,
        `Time Zone: ${metaData["7. Time Zone"] || "Unknown"}`,
        ``
    ];

    // Sort dates in descending order
    const dates = Object.keys(timeSeries).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    // Limit the number of dates displayed
    const displayDates = dates.slice(0, limit);

    for (const date of displayDates) {
        const data = timeSeries[date];
        // Format the date to show month and year (e.g., "April 2025")
        const dateObj = new Date(date);
        const formattedDate = dateObj.toLocaleString('en-US', { month: 'long', year: 'numeric' });

        result.push(`== ${formattedDate} (${date}) ==`);
        result.push(`Open (USD): ${data["1a. open (USD)"] || "Unknown"}`);
        // Use a safer approach for dynamic property names
        const openMarket = data[`1b. open (${marketCode})` as keyof typeof data] || data["1b. open (EUR)"] || "Unknown";
        result.push(`Open (${marketCode}): ${openMarket}`);

        result.push(`High (USD): ${data["2a. high (USD)"] || "Unknown"}`);
        const highMarket = data[`2b. high (${marketCode})` as keyof typeof data] || data["2b. high (EUR)"] || "Unknown";
        result.push(`High (${marketCode}): ${highMarket}`);

        result.push(`Low (USD): ${data["3a. low (USD)"] || "Unknown"}`);
        const lowMarket = data[`3b. low (${marketCode})` as keyof typeof data] || data["3b. low (EUR)"] || "Unknown";
        result.push(`Low (${marketCode}): ${lowMarket}`);

        result.push(`Close (USD): ${data["4a. close (USD)"] || "Unknown"}`);
        const closeMarket = data[`4b. close (${marketCode})` as keyof typeof data] || data["4b. close (EUR)"] || "Unknown";
        result.push(`Close (${marketCode}): ${closeMarket}`);

        result.push(`Volume: ${data["5. volume"] || "Unknown"}`);
        result.push(`Market Cap (USD): ${data["6. market cap (USD)"] || "Unknown"}`);
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
        "CRYPTO_INTRADAY": formatCryptoIntradaySeries,
        "DIGITAL_CURRENCY_DAILY": formatDigitalCurrencyDaily,
        "DIGITAL_CURRENCY_WEEKLY": formatDigitalCurrencyWeekly,
        "DIGITAL_CURRENCY_MONTHLY": formatDigitalCurrencyMonthly
    };

    return formatters[seriesType] || formatDigitalCurrencyDaily;
}

/**
 * Register all cryptocurrency APIs with the server
 */
export function registerCryptoApis(server: McpServer) {
    // Crypto Exchange Rates endpoint
    server.tool(
        "get-crypto-exchange-rate",
        "Get realtime exchange rate for any pair of digital or physical currencies",
        {
            from_currency: z.string().describe("The source currency (e.g., BTC)"),
            to_currency: z.string().describe("The target currency (e.g., USD)")
        },
        async ({ from_currency, to_currency }) => {
            const response = await makeAlphaVantageRequest<CryptoExchangeRateResponse>({
                function: "CURRENCY_EXCHANGE_RATE",
                from_currency,
                to_currency
            });

            if (!response) {
                return {
                    content: [
                        {
                            type: "text",
                            text: "Error: Failed to fetch crypto exchange rate data."
                        }
                    ]
                };
            }

            return {
                content: [
                    {
                        type: "text",
                        text: formatCryptoExchangeRate(response)
                    }
                ]
            };
        }
    );

    // Unified crypto time series endpoint
    server.tool(
        "get-digital-currency",
        "Get time series data for a digital currency with various intervals",
        {
            series_type: z.enum([
                "intraday", "daily", "weekly", "monthly"
            ]).describe("The type of time series data to retrieve"),
            symbol: z.string().describe("The cryptocurrency symbol (e.g., BTC)"),
            market: z.string().describe("The exchange market (e.g., USD)"),
            interval: z.enum(["1min", "5min", "15min", "30min", "60min"]).optional()
                .describe("Time interval between data points (required for intraday series)"),
            outputsize: z.enum(["compact", "full"]).optional()
                .describe("Data size for intraday: 'compact' (last 100 data points) or 'full' (trailing 30 days)"),
            limit: z.number().optional().describe("Number of data points to display (default: 10)")
        },
        async (args) => {
            const { series_type, symbol, market, interval, outputsize = "compact", limit = 10 } = args;

            // Map the user-friendly series_type to the actual API function
            const functionMap: Record<string, string> = {
                "intraday": "CRYPTO_INTRADAY",
                "daily": "DIGITAL_CURRENCY_DAILY",
                "weekly": "DIGITAL_CURRENCY_WEEKLY",
                "monthly": "DIGITAL_CURRENCY_MONTHLY"
            };

            const function_name = functionMap[series_type];

            // Create the API params object
            const apiParams: Record<string, string> = {
                function: function_name,
                symbol,
                market
            };

            // Add interval and outputsize only for intraday
            if (series_type === "intraday") {
                if (!interval) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: "Error: interval parameter is required for intraday data."
                            }
                        ]
                    };
                }
                apiParams.interval = interval;
                apiParams.outputsize = outputsize;
            }

            const response = await makeAlphaVantageRequest<any>(apiParams);

            if (!response) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `Error: Failed to fetch ${series_type} cryptocurrency data.`
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