import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { makeAlphaVantageRequest } from "../../utils/api.js";
import {
    GlobalQuoteResponse, SymbolSearchResponse, MarketStatusResponse, RealtimeBulkQuotesResponse,
    MonthlyAdjustedTimeSeriesResponse, WeeklyAdjustedTimeSeriesResponse,
    DailyAdjustedTimeSeriesResponse, IntradayTimeSeriesResponse
} from "../../types/core.js";

/**
 * Format Alpha Vantage quote data into a readable string
 */
function formatQuote(quoteData: GlobalQuoteResponse): string {
    if (quoteData.Information) {
        return `Error: ${quoteData.Information}`;
    }

    if (quoteData.Note) {
        return `Note: ${quoteData.Note}`;
    }

    const quote = quoteData["Global Quote"];
    if (!quote) {
        return "No quote data available";
    }

    return [
        `Symbol: ${quote["01. symbol"] || "Unknown"}`,
        `Price: ${quote["05. price"] || "Unknown"}`,
        `Open: ${quote["02. open"] || "Unknown"}`,
        `High: ${quote["03. high"] || "Unknown"}`,
        `Low: ${quote["04. low"] || "Unknown"}`,
        `Volume: ${quote["06. volume"] || "Unknown"}`,
        `Trading Day: ${quote["07. latest trading day"] || "Unknown"}`,
        `Previous Close: ${quote["08. previous close"] || "Unknown"}`,
        `Change: ${quote["09. change"] || "Unknown"} (${quote["10. change percent"] || "Unknown"})`,
    ].join("\n");
}

/**
 * Format Alpha Vantage search results into a readable string
 */
function formatSearchResults(searchData: SymbolSearchResponse): string {
    if (searchData.Information) {
        return `Error: ${searchData.Information}`;
    }

    if (searchData.Note) {
        return `Note: ${searchData.Note}`;
    }

    const matches = searchData.bestMatches;
    if (!matches || matches.length === 0) {
        return "No matching symbols found";
    }

    return matches.map(match => {
        return [
            `Symbol: ${match["1. symbol"] || "Unknown"}`,
            `Name: ${match["2. name"] || "Unknown"}`,
            `Type: ${match["3. type"] || "Unknown"}`,
            `Region: ${match["4. region"] || "Unknown"}`,
            `Currency: ${match["8. currency"] || "Unknown"}`,
            `Match Score: ${match["9. matchScore"] || "Unknown"}`,
        ].join("\n");
    }).join("\n\n");
}

/**
 * Format Alpha Vantage market status data into a readable string
 */
function formatMarketStatus(statusData: MarketStatusResponse): string {
    if (statusData.Information) {
        return `Error: ${statusData.Information}`;
    }

    if (statusData.Note) {
        return `Note: ${statusData.Note}`;
    }

    const markets = statusData.markets;
    if (!markets || markets.length === 0) {
        return "No market status data available";
    }

    const result = [`${statusData.endpoint || "Global Market Open & Close Status"}\n`];

    // Group markets by type
    const marketTypes = Array.from(new Set(markets.map(m => m.market_type)));

    for (const type of marketTypes) {
        result.push(`\n== ${type} Markets ==`);

        const typeMarkets = markets.filter(m => m.market_type === type);
        for (const market of typeMarkets) {
            result.push(`\nRegion: ${market.region || "Unknown"}`);
            result.push(`Exchanges: ${market.primary_exchanges || "Unknown"}`);
            result.push(`Hours: ${market.local_open || "?"} - ${market.local_close || "?"}`);
            result.push(`Status: ${market.current_status?.toUpperCase() || "Unknown"}`);
            if (market.notes) {
                result.push(`Notes: ${market.notes}`);
            }
        }
    }

    return result.join("\n");
}

/**
 * Format Alpha Vantage realtime bulk quotes data into a readable string
 */
function formatRealtimeBulkQuotes(quotesData: RealtimeBulkQuotesResponse): string {
    if (quotesData.Information) {
        return `Error: ${quotesData.Information}`;
    }

    if (quotesData.Note) {
        return `Note: ${quotesData.Note}`;
    }

    if (quotesData.message) {
        return `Message: ${quotesData.message}`;
    }

    const quotes = quotesData.data;
    if (!quotes || quotes.length === 0) {
        return "No quote data available";
    }

    const result = [`${quotesData.endpoint || "Realtime Bulk Quotes"}\n`];

    for (const quote of quotes) {
        result.push(`\n== ${quote.symbol || "Unknown"} ==`);
        result.push(`Timestamp: ${quote.timestamp || "Unknown"}`);
        result.push(`Price: ${quote.close || "Unknown"}`);
        result.push(`Open: ${quote.open || "Unknown"}`);
        result.push(`High: ${quote.high || "Unknown"}`);
        result.push(`Low: ${quote.low || "Unknown"}`);
        result.push(`Volume: ${quote.volume || "Unknown"}`);
        result.push(`Previous Close: ${quote.previous_close || "Unknown"}`);
        result.push(`Change: ${quote.change || "Unknown"} (${quote.change_percent || "Unknown"}%)`);

        // Add extended hours info if available
        if (quote.extended_hours_quote) {
            result.push(`\nExtended Hours Price: ${quote.extended_hours_quote}`);
            result.push(`Extended Hours Change: ${quote.extended_hours_change || "Unknown"} (${quote.extended_hours_change_percent || "Unknown"}%)`);
        }
    }

    return result.join("\n");
}

/**
 * Format Alpha Vantage monthly adjusted time series data into a readable string
 */
function formatMonthlyAdjustedTimeSeries(timeSeriesData: MonthlyAdjustedTimeSeriesResponse, limit: number = 12): string {
    if (timeSeriesData.Information) {
        return `Error: ${timeSeriesData.Information}`;
    }

    if (timeSeriesData.Note) {
        return `Note: ${timeSeriesData.Note}`;
    }

    const metaData = timeSeriesData["Meta Data"];
    const timeSeries = timeSeriesData["Monthly Adjusted Time Series"];

    if (!metaData || !timeSeries) {
        return "No time series data available";
    }

    const result = [
        `Monthly Adjusted Time Series for ${metaData["2. Symbol"] || "Unknown"}`,
        `Last Refreshed: ${metaData["3. Last Refreshed"] || "Unknown"}`,
        `Time Zone: ${metaData["4. Time Zone"] || "Unknown"}`,
        ""
    ];

    // Sort dates in descending order
    const dates = Object.keys(timeSeries).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    // Limit the number of months displayed
    const displayDates = dates.slice(0, limit);

    for (const date of displayDates) {
        const monthData = timeSeries[date];
        result.push(`== ${date} ==`);
        result.push(`Open: ${monthData["1. open"] || "Unknown"}`);
        result.push(`High: ${monthData["2. high"] || "Unknown"}`);
        result.push(`Low: ${monthData["3. low"] || "Unknown"}`);
        result.push(`Close: ${monthData["4. close"] || "Unknown"}`);
        result.push(`Adjusted Close: ${monthData["5. adjusted close"] || "Unknown"}`);
        result.push(`Volume: ${monthData["6. volume"] || "Unknown"}`);
        result.push(`Dividend: ${monthData["7. dividend amount"] || "0.0000"}`);
        result.push("");
    }

    if (dates.length > limit) {
        result.push(`... and ${dates.length - limit} more months (showing last ${limit} months only)`);
    }

    return result.join("\n");
}

/**
 * Format Alpha Vantage weekly adjusted time series data into a readable string
 */
function formatWeeklyAdjustedTimeSeries(timeSeriesData: WeeklyAdjustedTimeSeriesResponse, limit: number = 12): string {
    if (timeSeriesData.Information) {
        return `Error: ${timeSeriesData.Information}`;
    }

    if (timeSeriesData.Note) {
        return `Note: ${timeSeriesData.Note}`;
    }

    const metaData = timeSeriesData["Meta Data"];
    const timeSeries = timeSeriesData["Weekly Adjusted Time Series"];

    if (!metaData || !timeSeries) {
        return "No time series data available";
    }

    const result = [
        `Weekly Adjusted Time Series for ${metaData["2. Symbol"] || "Unknown"}`,
        `Last Refreshed: ${metaData["3. Last Refreshed"] || "Unknown"}`,
        `Time Zone: ${metaData["4. Time Zone"] || "Unknown"}`,
        ""
    ];

    // Sort dates in descending order
    const dates = Object.keys(timeSeries).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    // Limit the number of weeks displayed
    const displayDates = dates.slice(0, limit);

    for (const date of displayDates) {
        const weekData = timeSeries[date];
        result.push(`== Week ending ${date} ==`);
        result.push(`Open: ${weekData["1. open"] || "Unknown"}`);
        result.push(`High: ${weekData["2. high"] || "Unknown"}`);
        result.push(`Low: ${weekData["3. low"] || "Unknown"}`);
        result.push(`Close: ${weekData["4. close"] || "Unknown"}`);
        result.push(`Adjusted Close: ${weekData["5. adjusted close"] || "Unknown"}`);
        result.push(`Volume: ${weekData["6. volume"] || "Unknown"}`);
        result.push(`Dividend: ${weekData["7. dividend amount"] || "0.0000"}`);
        result.push("");
    }

    if (dates.length > limit) {
        result.push(`... and ${dates.length - limit} more weeks (showing last ${limit} weeks only)`);
    }

    return result.join("\n");
}

/**
 * Format Alpha Vantage daily adjusted time series data into a readable string
 */
function formatDailyAdjustedTimeSeries(timeSeriesData: DailyAdjustedTimeSeriesResponse, limit: number = 20): string {
    if (timeSeriesData.Information) {
        return `Error: ${timeSeriesData.Information}`;
    }

    if (timeSeriesData.Note) {
        return `Note: ${timeSeriesData.Note}`;
    }

    const metaData = timeSeriesData["Meta Data"];
    const timeSeries = timeSeriesData["Time Series (Daily)"];

    if (!metaData || !timeSeries) {
        return "No time series data available";
    }

    const result = [
        `Daily Adjusted Time Series for ${metaData["2. Symbol"] || "Unknown"}`,
        `Last Refreshed: ${metaData["3. Last Refreshed"] || "Unknown"}`,
        `Output Size: ${metaData["4. Output Size"] || "Unknown"}`,
        `Time Zone: ${metaData["5. Time Zone"] || "Unknown"}`,
        ""
    ];

    // Sort dates in descending order
    const dates = Object.keys(timeSeries).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    // Limit the number of days displayed
    const displayDates = dates.slice(0, limit);

    for (const date of displayDates) {
        const dayData = timeSeries[date];
        result.push(`== ${date} ==`);
        result.push(`Open: ${dayData["1. open"] || "Unknown"}`);
        result.push(`High: ${dayData["2. high"] || "Unknown"}`);
        result.push(`Low: ${dayData["3. low"] || "Unknown"}`);
        result.push(`Close: ${dayData["4. close"] || "Unknown"}`);
        result.push(`Adjusted Close: ${dayData["5. adjusted close"] || "Unknown"}`);
        result.push(`Volume: ${dayData["6. volume"] || "Unknown"}`);
        result.push(`Dividend: ${dayData["7. dividend amount"] || "0.0000"}`);
        result.push(`Split Coefficient: ${dayData["8. split coefficient"] || "1.0"}`);
        result.push("");
    }

    if (dates.length > limit) {
        result.push(`... and ${dates.length - limit} more days (showing last ${limit} days only)`);
    }

    return result.join("\n");
}

/**
 * Format Alpha Vantage intraday time series data into a readable string
 */
function formatIntradayTimeSeries(timeSeriesData: IntradayTimeSeriesResponse, limit: number = 20): string {
    if (timeSeriesData.Information) {
        return `Error: ${timeSeriesData.Information}`;
    }

    if (timeSeriesData.Note) {
        return `Note: ${timeSeriesData.Note}`;
    }

    const metaData = timeSeriesData["Meta Data"];
    if (!metaData) {
        return "No meta data available";
    }

    const interval = metaData["4. Interval"] || "Unknown";
    const timeSeriesKey = `Time Series (${interval})` as keyof IntradayTimeSeriesResponse;
    const timeSeries = timeSeriesData[timeSeriesKey] as Record<string, {
        "1. open"?: string;
        "2. high"?: string;
        "3. low"?: string;
        "4. close"?: string;
        "5. volume"?: string;
    }> | undefined;

    if (!timeSeries) {
        return `No time series data available for interval: ${interval}`;
    }

    const result = [
        `Intraday (${interval}) Time Series for ${metaData["2. Symbol"] || "Unknown"}`,
        `Last Refreshed: ${metaData["3. Last Refreshed"] || "Unknown"}`,
        `Output Size: ${metaData["5. Output Size"] || "Unknown"}`,
        `Time Zone: ${metaData["6. Time Zone"] || "Unknown"}`,
        ""
    ];

    // Sort dates in descending order (newest first)
    const timestamps = Object.keys(timeSeries).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    // Limit the number of intervals displayed
    const displayTimestamps = timestamps.slice(0, limit);

    for (const timestamp of displayTimestamps) {
        const intervalData = timeSeries[timestamp];
        result.push(`== ${timestamp} ==`);
        result.push(`Open: ${intervalData["1. open"] || "Unknown"}`);
        result.push(`High: ${intervalData["2. high"] || "Unknown"}`);
        result.push(`Low: ${intervalData["3. low"] || "Unknown"}`);
        result.push(`Close: ${intervalData["4. close"] || "Unknown"}`);
        result.push(`Volume: ${intervalData["5. volume"] || "Unknown"}`);
        result.push("");
    }

    if (timestamps.length > limit) {
        result.push(`... and ${timestamps.length - limit} more data points (showing last ${limit} intervals only)`);
    }

    return result.join("\n");
}

/**
 * Format current date and time in multiple time zones
 */
function formatCurrentTime(): string {
    const now = new Date();

    // Format UTC time
    const utcTimeString = now.toLocaleString('en-US', {
        timeZone: 'UTC',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });

    // Format Eastern time (ET)
    const etTimeString = now.toLocaleString('en-US', {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });

    // Format Pacific time (PT)
    const ptTimeString = now.toLocaleString('en-US', {
        timeZone: 'America/Los_Angeles',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });

    return [
        `UTC Time: ${utcTimeString}`,
        `Eastern Time (ET): ${etTimeString}`,
        `Pacific Time (PT): ${ptTimeString}`
    ].join('\n');
}

/**
 * Register all core API endpoints with the server
 */
export function registerCoreApis(server: McpServer) {
    // Register current time tool
    server.tool(
        "get-current-time",
        "Get the current date and time in UTC, Eastern Time (ET), and Pacific Time (PT)",
        {},
        async () => {
            const formattedTime = formatCurrentTime();

            return {
                content: [
                    {
                        type: "text",
                        text: formattedTime,
                    },
                ],
            };
        },
    );

    // Register Alpha Vantage quote tool
    server.tool(
        "get-stock-quote",
        "Get the latest price and volume information for a ticker symbol",
        {
            symbol: z.string().describe("The stock symbol to look up (e.g., IBM, AAPL, MSFT)"),
        },
        async ({ symbol }) => {
            const quoteData = await makeAlphaVantageRequest<GlobalQuoteResponse>({
                function: "GLOBAL_QUOTE",
                symbol,
                datatype: "json"
            });

            if (!quoteData) {
                return {
                    content: [
                        {
                            type: "text",
                            text: "Failed to retrieve quote data",
                        },
                    ],
                };
            }

            const formattedQuote = formatQuote(quoteData);

            return {
                content: [
                    {
                        type: "text",
                        text: formattedQuote,
                    },
                ],
            };
        },
    );

    // Register Alpha Vantage symbol search tool
    server.tool(
        "search-ticker",
        "Search for stock symbols based on keywords",
        {
            keywords: z.string().describe("The search keywords (e.g., Microsoft, Tesla, Banking)"),
        },
        async ({ keywords }) => {
            const searchData = await makeAlphaVantageRequest<SymbolSearchResponse>({
                function: "SYMBOL_SEARCH",
                keywords,
                datatype: "json"
            });

            if (!searchData) {
                return {
                    content: [
                        {
                            type: "text",
                            text: "Failed to retrieve search results",
                        },
                    ],
                };
            }

            const formattedResults = formatSearchResults(searchData);

            return {
                content: [
                    {
                        type: "text",
                        text: formattedResults,
                    },
                ],
            };
        },
    );

    // Register Alpha Vantage market status tool
    server.tool(
        "get-market-status",
        "Get the current market status (open vs. closed) of major trading venues worldwide",
        {},
        async () => {
            const statusData = await makeAlphaVantageRequest<MarketStatusResponse>({
                function: "MARKET_STATUS",
                datatype: "json"
            });

            if (!statusData) {
                return {
                    content: [
                        {
                            type: "text",
                            text: "Failed to retrieve market status data",
                        },
                    ],
                };
            }

            const formattedStatus = formatMarketStatus(statusData);

            return {
                content: [
                    {
                        type: "text",
                        text: formattedStatus,
                    },
                ],
            };
        },
    );

    // Register Alpha Vantage realtime bulk quotes tool
    server.tool(
        "get-bulk-quotes",
        "Get realtime quotes for multiple US-traded symbols in bulk (up to 100 symbols)",
        {
            symbols: z.string().describe("Up to 100 ticker symbols separated by commas (e.g., MSFT,AAPL,IBM)"),
        },
        async ({ symbols }) => {
            const quotesData = await makeAlphaVantageRequest<RealtimeBulkQuotesResponse>({
                function: "REALTIME_BULK_QUOTES",
                symbol: symbols,
                datatype: "json"
            });

            if (!quotesData) {
                return {
                    content: [
                        {
                            type: "text",
                            text: "Failed to retrieve bulk quotes data",
                        },
                    ],
                };
            }

            const formattedQuotes = formatRealtimeBulkQuotes(quotesData);

            return {
                content: [
                    {
                        type: "text",
                        text: formattedQuotes,
                    },
                ],
            };
        },
    );

    // Register Alpha Vantage monthly adjusted time series tool
    server.tool(
        "get-monthly-adjusted",
        "Get monthly adjusted time series data (20+ years of historical data) for a stock symbol",
        {
            symbol: z.string().describe("The stock symbol to look up (e.g., IBM, AAPL, MSFT)"),
            months: z.number().optional().describe("Number of months to display (default: 12)"),
        },
        async ({ symbol, months }) => {
            const timeSeriesData = await makeAlphaVantageRequest<MonthlyAdjustedTimeSeriesResponse>({
                function: "TIME_SERIES_MONTHLY_ADJUSTED",
                symbol,
                datatype: "json"
            });

            if (!timeSeriesData) {
                return {
                    content: [
                        {
                            type: "text",
                            text: "Failed to retrieve monthly adjusted time series data",
                        },
                    ],
                };
            }

            const formattedTimeSeries = formatMonthlyAdjustedTimeSeries(timeSeriesData, months);

            return {
                content: [
                    {
                        type: "text",
                        text: formattedTimeSeries,
                    },
                ],
            };
        },
    );

    // Register Alpha Vantage weekly adjusted time series tool
    server.tool(
        "get-weekly-adjusted",
        "Get weekly adjusted time series data (20+ years of historical data) for a stock symbol",
        {
            symbol: z.string().describe("The stock symbol to look up (e.g., IBM, AAPL, MSFT)"),
            weeks: z.number().optional().describe("Number of weeks to display (default: 12)"),
        },
        async ({ symbol, weeks }) => {
            const timeSeriesData = await makeAlphaVantageRequest<WeeklyAdjustedTimeSeriesResponse>({
                function: "TIME_SERIES_WEEKLY_ADJUSTED",
                symbol,
                datatype: "json"
            });

            if (!timeSeriesData) {
                return {
                    content: [
                        {
                            type: "text",
                            text: "Failed to retrieve weekly adjusted time series data",
                        },
                    ],
                };
            }

            const formattedTimeSeries = formatWeeklyAdjustedTimeSeries(timeSeriesData, weeks);

            return {
                content: [
                    {
                        type: "text",
                        text: formattedTimeSeries,
                    },
                ],
            };
        },
    );

    // Register Alpha Vantage daily adjusted time series tool
    server.tool(
        "get-daily-adjusted",
        "Get daily adjusted time series data with splits and dividend events for a stock symbol",
        {
            symbol: z.string().describe("The stock symbol to look up (e.g., IBM, AAPL, MSFT)"),
            outputsize: z.enum(["compact", "full"]).optional().describe("Data size to return: 'compact' = last 100 data points (default), 'full' = 20+ years of data"),
            days: z.number().optional().describe("Number of days to display (default: 20)"),
        },
        async ({ symbol, outputsize, days }) => {
            const timeSeriesData = await makeAlphaVantageRequest<DailyAdjustedTimeSeriesResponse>({
                function: "TIME_SERIES_DAILY_ADJUSTED",
                symbol,
                outputsize: outputsize || "compact",
                datatype: "json"
            });

            if (!timeSeriesData) {
                return {
                    content: [
                        {
                            type: "text",
                            text: "Failed to retrieve daily adjusted time series data",
                        },
                    ],
                };
            }

            const formattedTimeSeries = formatDailyAdjustedTimeSeries(timeSeriesData, days);

            return {
                content: [
                    {
                        type: "text",
                        text: formattedTimeSeries,
                    },
                ],
            };
        },
    );

    // Register Alpha Vantage intraday time series tool
    server.tool(
        "get-intraday",
        "Get intraday time series data (OHLCV) for a stock symbol",
        {
            symbol: z.string().describe("The stock symbol to look up (e.g., IBM, AAPL, MSFT)"),
            interval: z.enum(["1min", "5min", "15min", "30min", "60min"]).describe("Time interval between data points"),
            adjusted: z.boolean().optional().describe("Whether to return adjusted data (default: true)"),
            extended_hours: z.boolean().optional().describe("Whether to include extended hours data (default: true)"),
            month: z.string().optional().describe("Specific month in YYYY-MM format (e.g., 2009-01)"),
            outputsize: z.enum(["compact", "full"]).optional().describe("Data size to return: 'compact' = last 100 data points (default), 'full' = trailing 30 days or full month"),
            datapoints: z.number().optional().describe("Number of data points to display (default: 20)"),
        },
        async ({ symbol, interval, adjusted, extended_hours, month, outputsize, datapoints }) => {
            const params: Record<string, string> = {
                function: "TIME_SERIES_INTRADAY",
                symbol,
                interval,
                datatype: "json"
            };

            // Add optional parameters if specified
            if (adjusted !== undefined) {
                params.adjusted = adjusted.toString();
            }
            if (extended_hours !== undefined) {
                params.extended_hours = extended_hours.toString();
            }
            if (month) {
                params.month = month;
            }
            if (outputsize) {
                params.outputsize = outputsize;
            }

            const timeSeriesData = await makeAlphaVantageRequest<IntradayTimeSeriesResponse>(params);

            if (!timeSeriesData) {
                return {
                    content: [
                        {
                            type: "text",
                            text: "Failed to retrieve intraday time series data",
                        },
                    ],
                };
            }

            const formattedTimeSeries = formatIntradayTimeSeries(timeSeriesData, datapoints);

            return {
                content: [
                    {
                        type: "text",
                        text: formattedTimeSeries,
                    },
                ],
            };
        },
    );
} 