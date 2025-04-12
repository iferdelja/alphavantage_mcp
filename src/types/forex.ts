/**
 * Response structure for Currency Exchange Rate request
 */
export interface ExchangeRateResponse {
    "Realtime Currency Exchange Rate"?: {
        "1. From_Currency Code"?: string;
        "2. From_Currency Name"?: string;
        "3. To_Currency Code"?: string;
        "4. To_Currency Name"?: string;
        "5. Exchange Rate"?: string;
        "6. Last Refreshed"?: string;
        "7. Time Zone"?: string;
        "8. Bid Price"?: string;
        "9. Ask Price"?: string;
    };
    "Information"?: string; // For error or rate-limit messages
    "Note"?: string; // For API call frequency messages
}

/**
 * Response structure for FX Daily request
 */
export interface FxDailyResponse {
    "Meta Data"?: {
        "1. Information"?: string;
        "2. From Symbol"?: string;
        "3. To Symbol"?: string;
        "4. Output Size"?: string;
        "5. Last Refreshed"?: string;
        "6. Time Zone"?: string;
    };
    "Time Series FX (Daily)"?: Record<string, {
        "1. open"?: string;
        "2. high"?: string;
        "3. low"?: string;
        "4. close"?: string;
    }>;
    "Information"?: string; // For error or rate-limit messages
    "Note"?: string; // For API call frequency messages
}

/**
 * Response structure for FX Weekly request
 */
export interface FxWeeklyResponse {
    "Meta Data"?: {
        "1. Information"?: string;
        "2. From Symbol"?: string;
        "3. To Symbol"?: string;
        "4. Last Refreshed"?: string;
        "5. Time Zone"?: string;
    };
    "Time Series FX (Weekly)"?: Record<string, {
        "1. open"?: string;
        "2. high"?: string;
        "3. low"?: string;
        "4. close"?: string;
    }>;
    "Information"?: string; // For error or rate-limit messages
    "Note"?: string; // For API call frequency messages
}

/**
 * Response structure for FX Monthly request
 */
export interface FxMonthlyResponse {
    "Meta Data"?: {
        "1. Information"?: string;
        "2. From Symbol"?: string;
        "3. To Symbol"?: string;
        "4. Last Refreshed"?: string;
        "5. Time Zone"?: string;
    };
    "Time Series FX (Monthly)"?: Record<string, {
        "1. open"?: string;
        "2. high"?: string;
        "3. low"?: string;
        "4. close"?: string;
    }>;
    "Information"?: string; // For error or rate-limit messages
    "Note"?: string; // For API call frequency messages
} 