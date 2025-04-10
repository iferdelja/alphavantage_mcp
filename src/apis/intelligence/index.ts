import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { makeAlphaVantageRequest } from "../../utils/api.js";
import {
    NewsMarketSentimentResponse,
    EarningsCallTranscriptResponse,
    TopGainersLosersResponse,
    InsiderTransactionsResponse,
    AdvancedAnalyticsResponse
} from "../../types/intelligence.js";

/**
 * List of supported news topics
 */
const SUPPORTED_TOPICS = [
    "blockchain",
    "earnings",
    "ipo",
    "mergers_and_acquisitions",
    "financial_markets",
    "economy_fiscal",
    "economy_monetary",
    "economy_macro",
    "energy_transportation",
    "finance",
    "life_sciences",
    "manufacturing",
    "real_estate",
    "retail_wholesale",
    "technology"
];

/**
 * List of supported analytics calculations
 */
const SUPPORTED_CALCULATIONS = [
    "MIN",
    "MAX",
    "MEAN",
    "MEDIAN",
    "CUMULATIVE_RETURN",
    "VARIANCE",
    "STDDEV",
    "MAX_DRAWDOWN",
    "HISTOGRAM",
    "AUTOCORRELATION",
    "COVARIANCE",
    "CORRELATION"
];

/**
 * List of supported intervals
 */
const SUPPORTED_INTERVALS = [
    "1min",
    "5min",
    "15min",
    "30min",
    "60min",
    "DAILY",
    "WEEKLY",
    "MONTHLY"
] as const;

/**
 * Format Alpha Vantage market news and sentiment data into a readable string
 */
function formatMarketNewsSentiment(newsData: NewsMarketSentimentResponse): string {
    if (newsData.Information) {
        return `Error: ${newsData.Information}`;
    }

    if (newsData.Note) {
        return `Note: ${newsData.Note}`;
    }

    const feed = newsData.feed;
    if (!feed || feed.length === 0) {
        return "No news data available";
    }

    const result = ["Market News & Sentiment"];

    if (newsData.sentiment_score_definition) {
        result.push(`\nSentiment Score: ${newsData.sentiment_score_definition}`);
    }

    if (newsData.relevance_score_definition) {
        result.push(`Relevance Score: ${newsData.relevance_score_definition}`);
    }

    result.push(`\nShowing ${feed.length} articles ${newsData.items ? `(of ${newsData.items} total)` : ""}`);

    feed.forEach((article, index) => {
        result.push(`\n=== Article ${index + 1} ===`);
        result.push(`Title: ${article.title || "N/A"}`);
        result.push(`Published: ${formatTimePublished(article.time_published) || "N/A"}`);
        result.push(`Source: ${article.source || "N/A"}${article.category_within_source ? ` (${article.category_within_source})` : ""}`);

        if (article.authors && article.authors.length > 0) {
            result.push(`Authors: ${article.authors.join(", ")}`);
        }

        result.push(`URL: ${article.url || "N/A"}`);

        if (article.summary) {
            result.push(`\nSummary: ${article.summary}`);
        }

        result.push(`Overall Sentiment: ${article.overall_sentiment_label || "N/A"} (${article.overall_sentiment_score || "N/A"})`);

        if (article.topics && article.topics.length > 0) {
            result.push(`\nTopics:`);
            article.topics.forEach(topic => {
                result.push(`- ${topic.topic || "N/A"} (Relevance: ${topic.relevance_score || "N/A"})`);
            });
        }

        if (article.ticker_sentiment && article.ticker_sentiment.length > 0) {
            result.push(`\nTicker Sentiment:`);
            article.ticker_sentiment.forEach(ticker => {
                result.push(`- ${ticker.ticker || "N/A"}: ${ticker.ticker_sentiment_label || "N/A"} (Score: ${ticker.ticker_sentiment_score || "N/A"}, Relevance: ${ticker.relevance_score || "N/A"})`);
            });
        }
    });

    return result.join("\n");
}

/**
 * Format time published from YYYYMMDDTHHMMSS format to a more readable format
 */
function formatTimePublished(timeStr?: string): string {
    if (!timeStr) return "";

    try {
        // Extract date and time components
        const year = timeStr.substring(0, 4);
        const month = timeStr.substring(4, 6);
        const day = timeStr.substring(6, 8);
        const hour = timeStr.substring(9, 11);
        const minute = timeStr.substring(11, 13);

        // Create a more readable format
        return `${year}-${month}-${day} ${hour}:${minute}`;
    } catch (e) {
        return timeStr;
    }
}

/**
 * Format Alpha Vantage earnings call transcript data into a readable string
 */
function formatEarningsCallTranscript(transcriptData: EarningsCallTranscriptResponse): string {
    if (transcriptData.Information) {
        return `Error: ${transcriptData.Information}`;
    }

    if (transcriptData.Note) {
        return `Note: ${transcriptData.Note}`;
    }

    const transcript = transcriptData.transcript;
    if (!transcript || transcript.length === 0) {
        return "No transcript data available";
    }

    const result = [`Earnings Call Transcript: ${transcriptData.symbol} - ${transcriptData.quarter}`];

    // Calculate average sentiment for the entire call
    let totalSentiment = 0;
    let sentimentCount = 0;

    transcript.forEach(segment => {
        if (segment.sentiment) {
            totalSentiment += parseFloat(segment.sentiment);
            sentimentCount++;
        }
    });

    const avgSentiment = sentimentCount > 0 ? (totalSentiment / sentimentCount).toFixed(2) : "N/A";
    result.push(`Overall Sentiment Score: ${avgSentiment}`);

    result.push("\n--- Transcript ---");

    transcript.forEach((segment, index) => {
        result.push(`\n[${segment.speaker || "Unknown"} - ${segment.title || "No Title"}]`);
        result.push(`Sentiment: ${segment.sentiment || "N/A"}`);
        result.push(`\n${segment.content || "No content available"}`);

        // Add separator between segments
        if (index < transcript.length - 1) {
            result.push("\n---");
        }
    });

    return result.join("\n");
}

/**
 * Format Alpha Vantage top gainers, losers, and most active tickers data into a readable string
 */
function formatTopGainersLosers(marketData: TopGainersLosersResponse): string {
    if (marketData.Information) {
        return `Error: ${marketData.Information}`;
    }

    if (marketData.Note) {
        return `Note: ${marketData.Note}`;
    }

    const result = [marketData.metadata || "Top Gainers, Losers, and Most Actively Traded US Tickers"];
    result.push(`Last Updated: ${marketData.last_updated || "N/A"}`);

    // Format top gainers
    if (marketData.top_gainers && marketData.top_gainers.length > 0) {
        result.push("\n=== TOP GAINERS ===");
        marketData.top_gainers.forEach((ticker, index) => {
            result.push(`\n${index + 1}. ${ticker.ticker || "N/A"}`);
            result.push(`   Price: $${ticker.price || "N/A"}`);
            result.push(`   Change: ${ticker.change_amount || "N/A"} (${ticker.change_percentage || "N/A"})`);
            result.push(`   Volume: ${formatVolume(ticker.volume)}`);
        });
    }

    // Format top losers
    if (marketData.top_losers && marketData.top_losers.length > 0) {
        result.push("\n=== TOP LOSERS ===");
        marketData.top_losers.forEach((ticker, index) => {
            result.push(`\n${index + 1}. ${ticker.ticker || "N/A"}`);
            result.push(`   Price: $${ticker.price || "N/A"}`);
            result.push(`   Change: ${ticker.change_amount || "N/A"} (${ticker.change_percentage || "N/A"})`);
            result.push(`   Volume: ${formatVolume(ticker.volume)}`);
        });
    }

    // Format most actively traded
    if (marketData.most_actively_traded && marketData.most_actively_traded.length > 0) {
        result.push("\n=== MOST ACTIVELY TRADED ===");
        marketData.most_actively_traded.forEach((ticker, index) => {
            result.push(`\n${index + 1}. ${ticker.ticker || "N/A"}`);
            result.push(`   Price: $${ticker.price || "N/A"}`);
            result.push(`   Change: ${ticker.change_amount || "N/A"} (${ticker.change_percentage || "N/A"})`);
            result.push(`   Volume: ${formatVolume(ticker.volume)}`);
        });
    }

    return result.join("\n");
}

/**
 * Format volume to be more readable with commas and 'M' or 'B' suffix for millions/billions
 */
function formatVolume(volumeStr?: string): string {
    if (!volumeStr) return "N/A";

    try {
        const volume = parseInt(volumeStr, 10);

        if (isNaN(volume)) return volumeStr;

        if (volume >= 1_000_000_000) {
            return `${(volume / 1_000_000_000).toFixed(2)}B`;
        } else if (volume >= 1_000_000) {
            return `${(volume / 1_000_000).toFixed(2)}M`;
        } else if (volume >= 1_000) {
            return volume.toLocaleString();
        }

        return volumeStr;
    } catch (e) {
        return volumeStr;
    }
}

/**
 * Format Alpha Vantage insider transactions data into a readable string
 */
function formatInsiderTransactions(transactionsData: InsiderTransactionsResponse): string {
    try {
        if (transactionsData.Information) {
            return `Error: ${transactionsData.Information}`;
        }

        if (transactionsData.Note) {
            return `Note: ${transactionsData.Note}`;
        }

        const transactions = transactionsData.data;
        if (!transactions || transactions.length === 0) {
            return "No insider transactions data available";
        }

        // Get ticker from first transaction
        const ticker = transactions[0].ticker || "Unknown";

        const result = [`Insider Transactions for ${ticker}`];

        // Just take the first 10 transactions without sorting
        const limitedTransactions = transactions.slice(0, 10);

        limitedTransactions.forEach(transaction => {
            const date = transaction.transaction_date || "Unknown Date";
            result.push(`\n=== ${date} ===`);

            const transactionType = transaction.acquisition_or_disposal === "A" ? "ACQUISITION" :
                transaction.acquisition_or_disposal === "D" ? "DISPOSAL" :
                    "TRANSACTION";

            result.push(`\n${transaction.executive || "Unknown Executive"} (${transaction.executive_title || "Unknown Title"})`);
            result.push(`Type: ${transactionType} of ${transaction.security_type || "Securities"}`);

            const shareCount = transaction.shares || "0";
            const sharePrice = transaction.share_price || "0";
            const totalValue = (parseFloat(shareCount) * parseFloat(sharePrice)).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });

            result.push(`Shares: ${shareCount} @ $${sharePrice} = $${totalValue}`);
        });

        return result.join("\n");
    } catch (error) {
        console.error("Error formatting insider transactions:", error);
        return "Error processing insider transactions data. Please try again later.";
    }
}

/**
 * Format Alpha Vantage advanced analytics data into a readable string
 */
function formatAdvancedAnalytics(analyticsData: AdvancedAnalyticsResponse): string {
    if (analyticsData.Information) {
        return `Error: ${analyticsData.Information}`;
    }

    if (analyticsData.Note) {
        return `Note: ${analyticsData.Note}`;
    }

    if (!analyticsData.meta_data || !analyticsData.payload) {
        return "No analytics data available";
    }

    const metaData = analyticsData.meta_data;
    const result = ["Advanced Analytics (Fixed Window)"];

    // Format metadata
    result.push(`\nSymbols: ${metaData.symbols || "N/A"}`);
    result.push(`Date Range: ${metaData.min_dt || "N/A"} to ${metaData.max_dt || "N/A"}`);
    result.push(`Data Type: ${metaData.ohlc || "Close"}`);
    result.push(`Interval: ${metaData.interval || "N/A"}`);

    // Format calculations
    const returnsCalc = analyticsData.payload.RETURNS_CALCULATIONS;
    if (!returnsCalc) {
        return result.join("\n") + "\n\nNo calculations data available";
    }

    result.push("\n=== CALCULATIONS ===");

    // Process each calculation type
    Object.entries(returnsCalc).forEach(([calcType, calcData]) => {
        result.push(`\n--- ${calcType} ---`);

        // Handle different calculation types with specific formatting
        if (calcType === "CORRELATION" || calcType === "COVARIANCE") {
            // Format matrix outputs
            const matrixData = calcData as { index?: string[], correlation?: number[][], covariance?: number[][] };
            const indices = matrixData.index || [];
            const matrix = matrixData.correlation || matrixData.covariance || [];

            if (indices.length > 0 && matrix.length > 0) {
                // Header row with symbols
                let headerRow = "           ";
                indices.forEach(idx => {
                    headerRow += idx.padStart(12);
                });
                result.push(headerRow);

                // Matrix rows
                for (let i = 0; i < indices.length; i++) {
                    let row = indices[i].padEnd(10);
                    for (let j = 0; j <= i; j++) {
                        row += matrix[i][j].toFixed(4).padStart(12);
                    }
                    result.push(row);
                }
            } else {
                result.push("No matrix data available");
            }
        } else if (calcType === "HISTOGRAM") {
            // Format histogram output
            const histData = calcData as { bins?: number[], counts?: { [symbol: string]: number[] } };
            const bins = histData.bins || [];
            const counts = histData.counts || {};

            if (bins.length > 0 && Object.keys(counts).length > 0) {
                // Create a table with bins and counts for each symbol
                result.push("Bin Range    " + Object.keys(counts).map(sym => sym.padStart(8)).join("  "));

                for (let i = 0; i < bins.length - 1; i++) {
                    const binRange = `${bins[i].toFixed(3)} to ${bins[i + 1].toFixed(3)}`;
                    let row = binRange.padEnd(12);

                    Object.keys(counts).forEach(symbol => {
                        const countValue = counts[symbol][i] || 0;
                        row += countValue.toString().padStart(8) + "  ";
                    });

                    result.push(row);
                }
            } else {
                result.push("No histogram data available");
            }
        } else {
            // Format simple calculation outputs (MIN, MAX, MEAN, etc.)
            const simpleData = calcData as { [symbol: string]: number };
            Object.entries(simpleData).forEach(([symbol, value]) => {
                let formattedValue: string;

                // Format value based on calculation type
                if (calcType === "CUMULATIVE_RETURN" || calcType.includes("DRAWDOWN")) {
                    // Show as percentage
                    formattedValue = `${(value * 100).toFixed(2)}%`;
                } else if (["VARIANCE", "STDDEV"].includes(calcType)) {
                    // Show with more precision
                    formattedValue = value.toFixed(6);
                } else {
                    // Default formatting
                    formattedValue = value.toFixed(4);
                }

                result.push(`${symbol}: ${formattedValue}`);
            });
        }
    });

    return result.join("\n");
}

/**
 * Register all intelligence-related APIs with the server
 */
export function registerIntelligenceApis(server: McpServer) {
    // Market News & Sentiment API
    server.tool(
        "get-market-news-sentiment",
        "Get market news and sentiment data from premier news outlets covering stocks, cryptocurrencies, forex, and various financial topics.",
        {
            tickers: z.string().optional().describe("Stock/crypto/forex symbols to filter articles by (e.g., 'IBM' or 'COIN,CRYPTO:BTC,FOREX:USD')"),
            topics: z.string().optional().describe(`News topics to filter by (e.g., 'technology' or 'technology,ipo'). Supported topics: ${SUPPORTED_TOPICS.join(", ")}`),
            time_from: z.string().optional().describe("Start time in YYYYMMDDTHHMM format (e.g., '20220410T0130')"),
            time_to: z.string().optional().describe("End time in YYYYMMDDTHHMM format"),
            sort: z.enum(["LATEST", "EARLIEST", "RELEVANCE"]).optional().describe("Sort order for results (default: LATEST)"),
            limit: z.number().optional().describe("Maximum number of results to return (default: 50, max: 1000)")
        },
        async ({ tickers, topics, time_from, time_to, sort, limit }) => {
            const apiParams: Record<string, string> = {
                function: "NEWS_SENTIMENT"
            };

            if (tickers) {
                apiParams.tickers = tickers;
            }

            if (topics) {
                apiParams.topics = topics;
            }

            if (time_from) {
                apiParams.time_from = time_from;
            }

            if (time_to) {
                apiParams.time_to = time_to;
            }

            if (sort) {
                apiParams.sort = sort;
            }

            if (limit !== undefined) {
                apiParams.limit = limit.toString();
            }

            const data = await makeAlphaVantageRequest<NewsMarketSentimentResponse>(apiParams);
            if (!data) {
                return {
                    content: [
                        {
                            type: "text",
                            text: "Failed to fetch market news and sentiment data. Please try again later."
                        }
                    ]
                };
            }

            return {
                content: [
                    {
                        type: "text",
                        text: formatMarketNewsSentiment(data)
                    }
                ]
            };
        }
    );

    // Earnings Call Transcript API
    server.tool(
        "get-earnings-call-transcript",
        "Get earnings call transcripts with LLM-based sentiment signals, covering over 15 years of history.",
        {
            symbol: z.string().describe("The symbol of the company (e.g., IBM)"),
            quarter: z.string().describe("Fiscal quarter in YYYYQM format (e.g., 2024Q1)")
        },
        async ({ symbol, quarter }) => {
            const apiParams: Record<string, string> = {
                function: "EARNINGS_CALL_TRANSCRIPT",
                symbol,
                quarter
            };

            const data = await makeAlphaVantageRequest<EarningsCallTranscriptResponse>(apiParams);
            if (!data) {
                return {
                    content: [
                        {
                            type: "text",
                            text: "Failed to fetch earnings call transcript data. Please try again later."
                        }
                    ]
                };
            }

            return {
                content: [
                    {
                        type: "text",
                        text: formatEarningsCallTranscript(data)
                    }
                ]
            };
        }
    );

    // Top Gainers, Losers, and Most Actively Traded Tickers API
    server.tool(
        "get-top-gainers-losers",
        "Get the top 20 gainers, losers, and most actively traded US market tickers.",
        {},
        async () => {
            const apiParams: Record<string, string> = {
                function: "TOP_GAINERS_LOSERS"
            };

            const data = await makeAlphaVantageRequest<TopGainersLosersResponse>(apiParams);
            if (!data) {
                return {
                    content: [
                        {
                            type: "text",
                            text: "Failed to fetch top gainers, losers, and active tickers data. Please try again later."
                        }
                    ]
                };
            }

            return {
                content: [
                    {
                        type: "text",
                        text: formatTopGainersLosers(data)
                    }
                ]
            };
        }
    );

    // Insider Transactions API
    server.tool(
        "get-insider-transactions",
        "Get latest and historical insider transactions made by key stakeholders of a specific company.",
        {
            symbol: z.string().describe("The symbol of the company (e.g., IBM)")
        },
        async ({ symbol }) => {
            const apiParams: Record<string, string> = {
                function: "INSIDER_TRANSACTIONS",
                symbol
            };

            const data = await makeAlphaVantageRequest<InsiderTransactionsResponse>(apiParams);
            if (!data) {
                return {
                    content: [
                        {
                            type: "text",
                            text: "Failed to fetch insider transactions data. Please try again later."
                        }
                    ]
                };
            }

            return {
                content: [
                    {
                        type: "text",
                        text: formatInsiderTransactions(data)
                    }
                ]
            };
        }
    );

    // Advanced Analytics (Fixed Window) API
    server.tool(
        "get-advanced-analytics",
        "Get a rich set of advanced analytics metrics for time series over a fixed window.",
        {
            symbols: z.string().describe("Comma-separated list of symbols (e.g., 'IBM,AAPL,MSFT')"),
            range: z.array(z.string()).describe("Date range(s) for the series. Use one value for start date or two values for start and end dates"),
            interval: z.enum(SUPPORTED_INTERVALS).describe("Time interval between data points (e.g., 'DAILY', '1min')"),
            calculations: z.string().describe(`Comma-separated list of analytics metrics to calculate. Supported: ${SUPPORTED_CALCULATIONS.join(", ")}`),
            ohlc: z.enum(["open", "high", "low", "close"]).optional().describe("Price data to use for calculations (default: close)")
        },
        async ({ symbols, range, interval, calculations, ohlc }) => {
            const apiParams: Record<string, string> = {
                function: "ANALYTICS_FIXED_WINDOW",
                symbols,
                interval
            };

            // Add ranges (can be one or two for start/end dates)
            range.forEach((r, idx) => {
                apiParams[`range${idx > 0 ? idx + 1 : ''}`] = r;
            });

            if (calculations) {
                apiParams.calculations = calculations;
            }

            if (ohlc) {
                apiParams.ohlc = ohlc;
            }

            const data = await makeAlphaVantageRequest<AdvancedAnalyticsResponse>(apiParams);
            if (!data) {
                return {
                    content: [
                        {
                            type: "text",
                            text: "Failed to fetch advanced analytics data. Please try again later."
                        }
                    ]
                };
            }

            return {
                content: [
                    {
                        type: "text",
                        text: formatAdvancedAnalytics(data)
                    }
                ]
            };
        }
    );
} 