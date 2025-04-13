import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { makeAlphaVantageRequest } from "../../utils/api.js";

// Import all technical indicator response types
import {
    SingleValueTechnicalResponse,
    MultiValueTechnicalResponse,
    SMAResponse,
    EMAResponse,
    WMAResponse,
    DEMAResponse,
    TEMAResponse,
    TRIMAResponse,
    KAMAResponse,
    MAMAResponse,
    VWAPResponse,
    T3Response,
    MACDResponse,
    MACDEXTResponse,
    STOCHResponse,
    STOCHFResponse,
    RSIResponse,
    STOCHRSIResponse,
    WILLRResponse,
    ADXResponse,
    ADXRResponse,
    APOResponse,
    PPOResponse,
    MOMResponse,
    BOPResponse,
    CCIResponse,
    CMOResponse,
    ROCResponse,
    ROCRResponse,
    AROONResponse,
    AROONOSCResponse,
    MFIResponse,
    TRIXResponse,
    ULTOSCResponse,
    DXResponse,
    MINUS_DIResponse,
    PLUS_DIResponse,
    MINUS_DMResponse,
    PLUS_DMResponse,
    BBANDSResponse,
    MIDPOINTResponse,
    MIDPRICEResponse,
    SARResponse,
    TRANGEResponse,
    ATRResponse,
    NATRResponse,
    ADResponse,
    ADOSCResponse,
    OBVResponse,
    HT_TRENDLINEResponse,
    HT_SINEResponse,
    HT_TRENDMODEResponse,
    HT_DCPERIODResponse,
    HT_DCPHASEResponse,
    HT_PHASORResponse
} from "../../types/technical.js";

/**
 * Format single-value technical indicator data into a readable string
 */
function formatSingleValueTechnical(
    response: SingleValueTechnicalResponse,
    limit: number = 10
): string {
    if (response.Information) {
        return `Error: ${response.Information}`;
    }

    if (response.Note) {
        return `Note: ${response.Note}`;
    }

    if (!response["Meta Data"]) {
        return "No technical indicator data available";
    }

    const metaData = response["Meta Data"];
    const indicator = metaData["2: Indicator"] || "Unknown Indicator";
    const symbol = metaData["1: Symbol"] || "Unknown";
    const lastRefreshed = metaData["3: Last Refreshed"] || "Unknown";
    const interval = metaData["4: Interval"] || "";
    const timePeriod = metaData["5: Time Period"] || "";
    const seriesType = metaData["6: Series Type"] || "";

    // Find the technical analysis data key (varies by indicator)
    const technicalKey = Object.keys(response).find(
        (key) => key.startsWith("Technical Analysis:")
    );

    if (!technicalKey || !response[technicalKey]) {
        return "No technical analysis data available";
    }

    // The indicator name is usually the last part of the technical analysis key
    const indicatorName = technicalKey.split(":")[1]?.trim() || indicator;
    const technicalData = response[technicalKey];

    // Build the output
    const result = [
        `== ${indicator} (${symbol}) ==`,
        `Last Refreshed: ${lastRefreshed}`,
        interval ? `Interval: ${interval}` : "",
        timePeriod ? `Time Period: ${timePeriod}` : "",
        seriesType ? `Series Type: ${seriesType}` : "",
        ""
    ].filter(line => line !== "");  // Remove empty lines

    // Get date keys and sort in descending order
    const dates = Object.keys(technicalData).sort((a, b) =>
        new Date(b).getTime() - new Date(a).getTime()
    );

    // Get the value key from the first data point
    const valueKey = Object.keys(technicalData[dates[0]])[0];

    // Limit the number of data points displayed
    const displayDates = dates.slice(0, limit);

    for (const date of displayDates) {
        const value = technicalData[date][valueKey];
        result.push(`${date}: ${valueKey} = ${value}`);
    }

    if (dates.length > limit) {
        result.push(`\n... and ${dates.length - limit} more data points (showing latest ${limit} only)`);
    }

    return result.join("\n");
}

/**
 * Format multi-value technical indicator data into a readable string
 */
function formatMultiValueTechnical(
    response: MultiValueTechnicalResponse,
    limit: number = 10
): string {
    if (response.Information) {
        return `Error: ${response.Information}`;
    }

    if (response.Note) {
        return `Note: ${response.Note}`;
    }

    if (!response["Meta Data"]) {
        return "No technical indicator data available";
    }

    const metaData = response["Meta Data"];
    const indicator = metaData["2: Indicator"] || "Unknown Indicator";
    const symbol = metaData["1: Symbol"] || "Unknown";
    const lastRefreshed = metaData["3: Last Refreshed"] || "Unknown";
    const interval = metaData["4: Interval"] || "";
    const timePeriod = metaData["5: Time Period"] || "";
    const seriesType = metaData["6: Series Type"] || "";

    // Find the technical analysis data key (varies by indicator)
    const technicalKey = Object.keys(response).find(
        (key) => key.startsWith("Technical Analysis:")
    );

    if (!technicalKey || !response[technicalKey]) {
        return "No technical analysis data available";
    }

    const technicalData = response[technicalKey];

    // Build the output
    const result = [
        `== ${indicator} (${symbol}) ==`,
        `Last Refreshed: ${lastRefreshed}`,
        interval ? `Interval: ${interval}` : "",
        timePeriod ? `Time Period: ${timePeriod}` : "",
        seriesType ? `Series Type: ${seriesType}` : "",
        ""
    ].filter(line => line !== "");  // Remove empty lines

    // Get date keys and sort in descending order
    const dates = Object.keys(technicalData).sort((a, b) =>
        new Date(b).getTime() - new Date(a).getTime()
    );

    // Get the value keys from the first data point
    const valueKeys = Object.keys(technicalData[dates[0]]);

    // Limit the number of data points displayed
    const displayDates = dates.slice(0, limit);

    for (const date of displayDates) {
        result.push(`== ${date} ==`);
        for (const key of valueKeys) {
            result.push(`${key}: ${technicalData[date][key]}`);
        }
        result.push("");
    }

    if (dates.length > limit) {
        result.push(`... and ${dates.length - limit} more data points (showing latest ${limit} only)`);
    }

    return result.join("\n");
}

/**
 * Determine the function that should be used to format a technical indicator response
 */
function getFormatterByIndicator(indicator: string): (response: any, limit: number) => string {
    // List of indicators that return multiple values
    const multiValueIndicators = [
        "BBANDS", "MACD", "MACDEXT", "STOCH", "STOCHF", "STOCHRSI",
        "AROON", "MAMA", "HT_SINE", "HT_PHASOR"
    ];

    return multiValueIndicators.includes(indicator)
        ? formatMultiValueTechnical
        : formatSingleValueTechnical;
}

/**
 * Common parameters for technical indicators
 */
const commonParams = {
    symbol: z.string().describe("The stock or forex symbol (e.g., IBM, MSFT, USDEUR)"),
    interval: z.enum(["1min", "5min", "15min", "30min", "60min", "daily", "weekly", "monthly"])
        .describe("Time interval between data points"),
    time_period: z.number().optional().describe("Number of data points used to calculate each indicator value (default varies by indicator)"),
    series_type: z.enum(["close", "open", "high", "low"]).optional()
        .describe("The price series to use for calculations (default: close)"),
    limit: z.number().optional().describe("Number of data points to display (default: 10)")
};

/**
 * Create a technical indicator endpoint
 */
function createTechnicalEndpoint<T>(
    server: McpServer,
    name: string,
    description: string,
    functionName: string,
    additionalParams: Record<string, z.ZodType<any>> = {},
    defaultParams: Record<string, any> = {}
) {
    // Merge the common parameters with any additional parameters
    const params = { ...commonParams, ...additionalParams };

    server.tool(
        name,
        description,
        params,
        async (args) => {
            const { limit = 10, ...restArgs } = args;

            // Merge provided arguments with default parameters
            // Convert all parameters to strings to match the API's requirements
            const apiParams: Record<string, string> = {
                function: functionName,
                ...Object.entries(defaultParams).reduce((acc, [key, value]) => {
                    acc[key] = String(value);
                    return acc;
                }, {} as Record<string, string>)
            };

            // Convert all parameters to strings
            Object.entries(restArgs as Record<string, any>).forEach(([key, value]) => {
                if (value !== undefined) {
                    apiParams[key] = String(value);
                }
            });

            const response = await makeAlphaVantageRequest<T>(apiParams);

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

            // Get the appropriate formatter for this indicator
            const formatter = getFormatterByIndicator(functionName);

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

/**
 * Register all technical indicator APIs with the server
 */
export function registerTechnicalApis(server: McpServer) {
    // === MOVING AVERAGES ===

    // Unified moving averages endpoint
    server.tool(
        "get-moving-average",
        "Get various types of moving averages (SMA, EMA, WMA, DEMA, TEMA, TRIMA, KAMA, MAMA, VWAP, T3)",
        {
            ma_type: z.enum(["SMA", "EMA", "WMA", "DEMA", "TEMA", "TRIMA", "KAMA", "MAMA", "VWAP", "T3"]).describe("The type of moving average to calculate"),
            symbol: z.string().describe("The stock or forex symbol (e.g., IBM, MSFT, USDEUR)"),
            interval: z.enum(["1min", "5min", "15min", "30min", "60min", "daily", "weekly", "monthly"]).describe("Time interval between data points"),
            time_period: z.number().optional().describe("Number of data points used for calculation (required for most MA types)"),
            series_type: z.enum(["close", "open", "high", "low"]).optional().describe("The price series to use for calculations (default: close)"),
            fastlimit: z.number().optional().describe("Upper limit used in the adaptive algorithm (for MAMA only, default: 0.5)"),
            slowlimit: z.number().optional().describe("Lower limit used in the adaptive algorithm (for MAMA only, default: 0.05)"),
            limit: z.number().optional().describe("Number of data points to display (default: 10)")
        },
        async (args) => {
            const { ma_type, limit = 10, ...restArgs } = args;

            // Convert all parameters to strings for the API request
            const apiParams: Record<string, string> = {
                function: ma_type
            };

            // Add the rest of the parameters
            Object.entries(restArgs as Record<string, any>).forEach(([key, value]) => {
                if (value !== undefined) {
                    apiParams[key] = String(value);
                }
            });

            const response = await makeAlphaVantageRequest<any>(apiParams);

            if (!response) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `Error: Failed to fetch ${ma_type} data.`
                        }
                    ]
                };
            }

            // Get the appropriate formatter for this indicator
            const formatter = getFormatterByIndicator(ma_type);

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

    // === MOMENTUM INDICATORS ===

    // Unified momentum indicators endpoint
    server.tool(
        "get-momentum-indicator",
        "Get momentum indicators (MACD, MACDEXT, STOCH, STOCHF, RSI, STOCHRSI, WILLR, ADX, ADXR, APO, PPO, MOM, BOP, CCI, CMO, ROC, ROCR)",
        {
            indicator_type: z.enum([
                "MACD", "MACDEXT", "STOCH", "STOCHF", "RSI", "STOCHRSI", "WILLR",
                "ADX", "ADXR", "APO", "PPO", "MOM", "BOP", "CCI", "CMO", "ROC", "ROCR"
            ]).describe("The type of momentum indicator to calculate"),
            symbol: z.string().describe("The stock or forex symbol (e.g., IBM, MSFT, USDEUR)"),
            interval: z.enum(["1min", "5min", "15min", "30min", "60min", "daily", "weekly", "monthly"]).describe("Time interval between data points"),
            time_period: z.number().optional().describe("Number of data points used for calculation (required for most indicators)"),
            series_type: z.enum(["close", "open", "high", "low"]).optional().describe("The price series to use for calculations (default: close)"),

            // MACD/MACDEXT/APO/PPO parameters
            fastperiod: z.number().optional().describe("Fast period (default: 12)"),
            slowperiod: z.number().optional().describe("Slow period (default: 26)"),
            signalperiod: z.number().optional().describe("Signal period (default: 9)"),

            // MACDEXT parameters
            fastmatype: z.number().optional().describe("Fast MA type (0=SMA, 1=EMA, 2=WMA, 3=DEMA, 4=TEMA, 5=TRIMA)"),
            slowmatype: z.number().optional().describe("Slow MA type (0=SMA, 1=EMA, 2=WMA, 3=DEMA, 4=TEMA, 5=TRIMA)"),
            signalmatype: z.number().optional().describe("Signal MA type (0=SMA, 1=EMA, 2=WMA, 3=DEMA, 4=TEMA, 5=TRIMA)"),

            // STOCH parameters
            fastkperiod: z.number().optional().describe("Fast K period (default: 5)"),
            slowkperiod: z.number().optional().describe("Slow K period (default: 3)"),
            slowdperiod: z.number().optional().describe("Slow D period (default: 3)"),
            slowkmatype: z.number().optional().describe("Slow K MA type (0=SMA, 1=EMA, 2=WMA, 3=DEMA)"),
            slowdmatype: z.number().optional().describe("Slow D MA type (0=SMA, 1=EMA, 2=WMA, 3=DEMA)"),

            // STOCHF parameters
            fastdperiod: z.number().optional().describe("Fast D period (default: 3)"),
            fastdmatype: z.number().optional().describe("Fast D MA type (0=SMA, 1=EMA, 2=WMA, 3=DEMA)"),

            // APO/PPO parameters
            matype: z.number().optional().describe("MA type (0=SMA, 1=EMA, 2=WMA, 3=DEMA, 4=TEMA, 5=TRIMA)"),

            limit: z.number().optional().describe("Number of data points to display (default: 10)")
        },
        async (args) => {
            const { indicator_type, limit = 10, ...restArgs } = args;

            // Convert all parameters to strings for the API request
            const apiParams: Record<string, string> = {
                function: indicator_type
            };

            // Add the rest of the parameters
            Object.entries(restArgs as Record<string, any>).forEach(([key, value]) => {
                if (value !== undefined) {
                    apiParams[key] = String(value);
                }
            });

            const response = await makeAlphaVantageRequest<any>(apiParams);

            if (!response) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `Error: Failed to fetch ${indicator_type} data.`
                        }
                    ]
                };
            }

            // Get the appropriate formatter for this indicator
            const formatter = getFormatterByIndicator(indicator_type);

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

    // === VOLATILITY INDICATORS ===

    // Unified volatility indicators endpoint
    server.tool(
        "get-volatility-indicator",
        "Get volatility indicators (BBANDS, MIDPOINT, MIDPRICE, SAR, TRANGE, ATR, NATR)",
        {
            indicator_type: z.enum([
                "BBANDS", "MIDPOINT", "MIDPRICE", "SAR", "TRANGE", "ATR", "NATR"
            ]).describe("The type of volatility indicator to calculate"),
            symbol: z.string().describe("The stock or forex symbol (e.g., IBM, MSFT, USDEUR)"),
            interval: z.enum(["1min", "5min", "15min", "30min", "60min", "daily", "weekly", "monthly"]).describe("Time interval between data points"),
            series_type: z.enum(["close", "open", "high", "low"]).optional().describe("The price series to use for calculations (default: close)"),

            // Parameters for specific indicators
            time_period: z.number().optional().describe("Number of data points for calculation (required for BBANDS, MIDPOINT, MIDPRICE, ATR, NATR)"),

            // BBANDS parameters
            nbdevup: z.number().optional().describe("Standard deviations above the middle band (default: 2)"),
            nbdevdn: z.number().optional().describe("Standard deviations below the middle band (default: 2)"),
            matype: z.number().optional().describe("MA type for the middle band (0=SMA, 1=EMA, 2=WMA, 3=DEMA, 4=TEMA, 5=TRIMA)"),

            // SAR parameters
            acceleration: z.number().optional().describe("Acceleration factor (default: 0.02)"),
            maximum: z.number().optional().describe("Maximum acceleration factor (default: 0.2)"),

            limit: z.number().optional().describe("Number of data points to display (default: 10)")
        },
        async (args) => {
            const { indicator_type, limit = 10, ...restArgs } = args;

            // Convert all parameters to strings for the API request
            const apiParams: Record<string, string> = {
                function: indicator_type
            };

            // Add the rest of the parameters
            Object.entries(restArgs as Record<string, any>).forEach(([key, value]) => {
                if (value !== undefined) {
                    apiParams[key] = String(value);
                }
            });

            const response = await makeAlphaVantageRequest<any>(apiParams);

            if (!response) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `Error: Failed to fetch ${indicator_type} data.`
                        }
                    ]
                };
            }

            // Get the appropriate formatter for this indicator
            const formatter = getFormatterByIndicator(indicator_type);

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

    // === VOLUME INDICATORS ===

    // Unified volume indicators endpoint
    server.tool(
        "get-volume-indicator",
        "Get volume indicators (AD, ADOSC, OBV)",
        {
            indicator_type: z.enum([
                "AD", "ADOSC", "OBV"
            ]).describe("The type of volume indicator to calculate"),
            symbol: z.string().describe("The stock or forex symbol (e.g., IBM, MSFT, USDEUR)"),
            interval: z.enum(["1min", "5min", "15min", "30min", "60min", "daily", "weekly", "monthly"]).describe("Time interval between data points"),

            // ADOSC parameters
            fastperiod: z.number().optional().describe("Fast period (default: 3)"),
            slowperiod: z.number().optional().describe("Slow period (default: 10)"),

            limit: z.number().optional().describe("Number of data points to display (default: 10)")
        },
        async (args) => {
            const { indicator_type, limit = 10, ...restArgs } = args;

            // Convert all parameters to strings for the API request
            const apiParams: Record<string, string> = {
                function: indicator_type
            };

            // Add the rest of the parameters
            Object.entries(restArgs as Record<string, any>).forEach(([key, value]) => {
                if (value !== undefined) {
                    apiParams[key] = String(value);
                }
            });

            const response = await makeAlphaVantageRequest<any>(apiParams);

            if (!response) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `Error: Failed to fetch ${indicator_type} data.`
                        }
                    ]
                };
            }

            // Get the appropriate formatter for this indicator
            const formatter = getFormatterByIndicator(indicator_type);

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

    // === CYCLE INDICATORS ===

    // Unified cycle indicators endpoint
    server.tool(
        "get-cycle-indicator",
        "Get Hilbert Transform cycle indicators (HT_TRENDLINE, HT_SINE, HT_TRENDMODE, HT_DCPERIOD, HT_DCPHASE, HT_PHASOR)",
        {
            indicator_type: z.enum([
                "HT_TRENDLINE", "HT_SINE", "HT_TRENDMODE",
                "HT_DCPERIOD", "HT_DCPHASE", "HT_PHASOR"
            ]).describe("The type of Hilbert Transform cycle indicator to calculate"),
            symbol: z.string().describe("The stock or forex symbol (e.g., IBM, MSFT, USDEUR)"),
            interval: z.enum(["1min", "5min", "15min", "30min", "60min", "daily", "weekly", "monthly"]).describe("Time interval between data points"),
            series_type: z.enum(["close", "open", "high", "low"]).optional().describe("The price series to use for calculations (default: close)"),
            limit: z.number().optional().describe("Number of data points to display (default: 10)")
        },
        async (args) => {
            const { indicator_type, limit = 10, ...restArgs } = args;

            // Convert all parameters to strings for the API request
            const apiParams: Record<string, string> = {
                function: indicator_type
            };

            // Add the rest of the parameters
            Object.entries(restArgs as Record<string, any>).forEach(([key, value]) => {
                if (value !== undefined) {
                    apiParams[key] = String(value);
                }
            });

            const response = await makeAlphaVantageRequest<any>(apiParams);

            if (!response) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `Error: Failed to fetch ${indicator_type} data.`
                        }
                    ]
                };
            }

            // Get the appropriate formatter for this indicator
            const formatter = getFormatterByIndicator(indicator_type);

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