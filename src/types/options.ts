/**
 * Response structure for Realtime Options request
 */
export interface RealtimeOptionsResponse {
    "endpoint"?: string;
    "message"?: string; // Premium endpoint message
    "data"?: Array<{
        "contractID"?: string;
        "symbol"?: string;
        "expiration"?: string;
        "strike"?: string;
        "type"?: string; // "call" or "put"
        "last"?: string;
        "mark"?: string;
        "bid"?: string;
        "bid_size"?: string;
        "ask"?: string;
        "ask_size"?: string;
        "volume"?: string;
        "open_interest"?: string;
        "date"?: string;
        // Greeks and implied volatility fields (when require_greeks=true)
        "implied_volatility"?: string;
        "delta"?: string;
        "gamma"?: string;
        "theta"?: string;
        "vega"?: string;
        "rho"?: string;
    }>;
    "Information"?: string; // For error or rate-limit messages
    "Note"?: string; // For API call frequency messages
}

/**
 * Response structure for Historical Options request
 */
export interface HistoricalOptionsResponse {
    "endpoint"?: string;
    "message"?: string; // Success message or error
    "data"?: Array<{
        "contractID"?: string;
        "symbol"?: string;
        "expiration"?: string;
        "strike"?: string;
        "type"?: string; // "call" or "put"
        "last"?: string;
        "mark"?: string;
        "bid"?: string;
        "bid_size"?: string;
        "ask"?: string;
        "ask_size"?: string;
        "volume"?: string;
        "open_interest"?: string;
        "date"?: string;
        "implied_volatility"?: string;
        "delta"?: string;
        "gamma"?: string;
        "theta"?: string;
        "vega"?: string;
        "rho"?: string;
    }>;
    "Information"?: string; // For error or rate-limit messages
    "Note"?: string; // For API call frequency messages
} 