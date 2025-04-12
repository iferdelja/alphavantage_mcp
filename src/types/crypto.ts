/**
 * Response structure for Crypto Exchange Rate request
 * Note: Reusing the same structure as Forex Exchange Rate
 */
export interface CryptoExchangeRateResponse {
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
 * Response structure for Crypto Intraday request
 */
export interface CryptoIntradayResponse {
    "Meta Data"?: {
        "1. Information"?: string;
        "2. Digital Currency Code"?: string;
        "3. Digital Currency Name"?: string;
        "4. Market Code"?: string;
        "5. Market Name"?: string;
        "6. Last Refreshed"?: string;
        "7. Interval"?: string;
        "8. Output Size"?: string;
        "9. Time Zone"?: string;
    };
    "Time Series Crypto"?: Record<string, {
        "1. open"?: string;
        "2. high"?: string;
        "3. low"?: string;
        "4. close"?: string;
        "5. volume"?: string;
    }>;
    "Information"?: string; // For error or rate-limit messages
    "Note"?: string; // For API call frequency messages
}

/**
 * Response structure for Digital Currency Daily request
 */
export interface DigitalCurrencyDailyResponse {
    "Meta Data"?: {
        "1. Information"?: string;
        "2. Digital Currency Code"?: string;
        "3. Digital Currency Name"?: string;
        "4. Market Code"?: string;
        "5. Market Name"?: string;
        "6. Last Refreshed"?: string;
        "7. Time Zone"?: string;
    };
    "Time Series (Digital Currency Daily)"?: Record<string, {
        "1a. open (USD)"?: string;
        "1b. open (EUR)"?: string; // Will be whatever market was requested
        "2a. high (USD)"?: string;
        "2b. high (EUR)"?: string;
        "3a. low (USD)"?: string;
        "3b. low (EUR)"?: string;
        "4a. close (USD)"?: string;
        "4b. close (EUR)"?: string;
        "5. volume"?: string;
        "6. market cap (USD)"?: string;
    }>;
    "Information"?: string; // For error or rate-limit messages
    "Note"?: string; // For API call frequency messages
}

/**
 * Response structure for Digital Currency Weekly request
 */
export interface DigitalCurrencyWeeklyResponse {
    "Meta Data"?: {
        "1. Information"?: string;
        "2. Digital Currency Code"?: string;
        "3. Digital Currency Name"?: string;
        "4. Market Code"?: string;
        "5. Market Name"?: string;
        "6. Last Refreshed"?: string;
        "7. Time Zone"?: string;
    };
    "Time Series (Digital Currency Weekly)"?: Record<string, {
        "1a. open (USD)"?: string;
        "1b. open (EUR)"?: string; // Will be whatever market was requested
        "2a. high (USD)"?: string;
        "2b. high (EUR)"?: string;
        "3a. low (USD)"?: string;
        "3b. low (EUR)"?: string;
        "4a. close (USD)"?: string;
        "4b. close (EUR)"?: string;
        "5. volume"?: string;
        "6. market cap (USD)"?: string;
    }>;
    "Information"?: string; // For error or rate-limit messages
    "Note"?: string; // For API call frequency messages
}

/**
 * Response structure for Digital Currency Monthly request
 */
export interface DigitalCurrencyMonthlyResponse {
    "Meta Data"?: {
        "1. Information"?: string;
        "2. Digital Currency Code"?: string;
        "3. Digital Currency Name"?: string;
        "4. Market Code"?: string;
        "5. Market Name"?: string;
        "6. Last Refreshed"?: string;
        "7. Time Zone"?: string;
    };
    "Time Series (Digital Currency Monthly)"?: Record<string, {
        "1a. open (USD)"?: string;
        "1b. open (EUR)"?: string; // Will be whatever market was requested
        "2a. high (USD)"?: string;
        "2b. high (EUR)"?: string;
        "3a. low (USD)"?: string;
        "3b. low (EUR)"?: string;
        "4a. close (USD)"?: string;
        "4b. close (EUR)"?: string;
        "5. volume"?: string;
        "6. market cap (USD)"?: string;
    }>;
    "Information"?: string; // For error or rate-limit messages
    "Note"?: string; // For API call frequency messages
} 