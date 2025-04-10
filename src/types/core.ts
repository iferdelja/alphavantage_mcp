/**
 * Response structure for a Global Quote request
 */
export interface GlobalQuoteResponse {
    "Global Quote"?: {
        "01. symbol"?: string;
        "02. open"?: string;
        "03. high"?: string;
        "04. low"?: string;
        "05. price"?: string;
        "06. volume"?: string;
        "07. latest trading day"?: string;
        "08. previous close"?: string;
        "09. change"?: string;
        "10. change percent"?: string;
    };
    "Information"?: string; // For error or rate-limit messages
    "Note"?: string; // For API call frequency messages
}

/**
 * Response structure for a Symbol Search request
 */
export interface SymbolSearchResponse {
    "bestMatches"?: Array<{
        "1. symbol"?: string;
        "2. name"?: string;
        "3. type"?: string;
        "4. region"?: string;
        "5. marketOpen"?: string;
        "6. marketClose"?: string;
        "7. timezone"?: string;
        "8. currency"?: string;
        "9. matchScore"?: string;
    }>;
    "Information"?: string; // For error or rate-limit messages
    "Note"?: string; // For API call frequency messages
}

/**
 * Response structure for Market Status request
 */
export interface MarketStatusResponse {
    "endpoint"?: string;
    "markets"?: Array<{
        "market_type"?: string;
        "region"?: string;
        "primary_exchanges"?: string;
        "local_open"?: string;
        "local_close"?: string;
        "current_status"?: string;
        "notes"?: string;
    }>;
    "Information"?: string; // For error or rate-limit messages
    "Note"?: string; // For API call frequency messages
}

/**
 * Response structure for Realtime Bulk Quotes request
 */
export interface RealtimeBulkQuotesResponse {
    "endpoint"?: string;
    "message"?: string; // Premium endpoint message
    "data"?: Array<{
        "symbol"?: string;
        "timestamp"?: string;
        "open"?: string;
        "high"?: string;
        "low"?: string;
        "close"?: string;
        "volume"?: string;
        "previous_close"?: string;
        "change"?: string;
        "change_percent"?: string;
        "extended_hours_quote"?: string;
        "extended_hours_change"?: string;
        "extended_hours_change_percent"?: string;
    }>;
    "Information"?: string; // For error or rate-limit messages
    "Note"?: string; // For API call frequency messages
}

/**
 * Response structure for Monthly Adjusted Time Series request
 */
export interface MonthlyAdjustedTimeSeriesResponse {
    "Meta Data"?: {
        "1. Information"?: string;
        "2. Symbol"?: string;
        "3. Last Refreshed"?: string;
        "4. Time Zone"?: string;
    };
    "Monthly Adjusted Time Series"?: Record<string, {
        "1. open"?: string;
        "2. high"?: string;
        "3. low"?: string;
        "4. close"?: string;
        "5. adjusted close"?: string;
        "6. volume"?: string;
        "7. dividend amount"?: string;
    }>;
    "Information"?: string; // For error or rate-limit messages
    "Note"?: string; // For API call frequency messages
}

/**
 * Response structure for Weekly Adjusted Time Series request
 */
export interface WeeklyAdjustedTimeSeriesResponse {
    "Meta Data"?: {
        "1. Information"?: string;
        "2. Symbol"?: string;
        "3. Last Refreshed"?: string;
        "4. Time Zone"?: string;
    };
    "Weekly Adjusted Time Series"?: Record<string, {
        "1. open"?: string;
        "2. high"?: string;
        "3. low"?: string;
        "4. close"?: string;
        "5. adjusted close"?: string;
        "6. volume"?: string;
        "7. dividend amount"?: string;
    }>;
    "Information"?: string; // For error or rate-limit messages
    "Note"?: string; // For API call frequency messages
}

/**
 * Response structure for Daily Adjusted Time Series request
 */
export interface DailyAdjustedTimeSeriesResponse {
    "Meta Data"?: {
        "1. Information"?: string;
        "2. Symbol"?: string;
        "3. Last Refreshed"?: string;
        "4. Output Size"?: string;
        "5. Time Zone"?: string;
    };
    "Time Series (Daily)"?: Record<string, {
        "1. open"?: string;
        "2. high"?: string;
        "3. low"?: string;
        "4. close"?: string;
        "5. adjusted close"?: string;
        "6. volume"?: string;
        "7. dividend amount"?: string;
        "8. split coefficient"?: string;
    }>;
    "Information"?: string; // For error or rate-limit messages
    "Note"?: string; // For API call frequency messages
}

/**
 * Response structure for Intraday Time Series request
 */
export interface IntradayTimeSeriesResponse {
    "Meta Data"?: {
        "1. Information"?: string;
        "2. Symbol"?: string;
        "3. Last Refreshed"?: string;
        "4. Interval"?: string;
        "5. Output Size"?: string;
        "6. Time Zone"?: string;
    };
    "Time Series (1min)"?: Record<string, {
        "1. open"?: string;
        "2. high"?: string;
        "3. low"?: string;
        "4. close"?: string;
        "5. volume"?: string;
    }>;
    "Time Series (5min)"?: Record<string, {
        "1. open"?: string;
        "2. high"?: string;
        "3. low"?: string;
        "4. close"?: string;
        "5. volume"?: string;
    }>;
    "Time Series (15min)"?: Record<string, {
        "1. open"?: string;
        "2. high"?: string;
        "3. low"?: string;
        "4. close"?: string;
        "5. volume"?: string;
    }>;
    "Time Series (30min)"?: Record<string, {
        "1. open"?: string;
        "2. high"?: string;
        "3. low"?: string;
        "4. close"?: string;
        "5. volume"?: string;
    }>;
    "Time Series (60min)"?: Record<string, {
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
 * Common interface for Alpha Vantage API responses
 */
export interface AlphaVantageBaseResponse {
    "Information"?: string;
    "Note"?: string;
} 