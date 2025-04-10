/**
 * Response structure for News Market Sentiment request
 */
export interface NewsMarketSentimentResponse {
    "items"?: string;
    "sentiment_score_definition"?: string;
    "relevance_score_definition"?: string;
    "feed"?: Array<{
        "title"?: string;
        "url"?: string;
        "time_published"?: string;
        "authors"?: string[];
        "summary"?: string;
        "banner_image"?: string;
        "source"?: string;
        "category_within_source"?: string;
        "source_domain"?: string;
        "topics"?: Array<{
            "topic"?: string;
            "relevance_score"?: string;
        }>;
        "overall_sentiment_score"?: number;
        "overall_sentiment_label"?: string;
        "ticker_sentiment"?: Array<{
            "ticker"?: string;
            "relevance_score"?: string;
            "ticker_sentiment_score"?: string;
            "ticker_sentiment_label"?: string;
        }>;
    }>;
    "Information"?: string; // For error or rate-limit messages
    "Note"?: string; // For API call frequency messages
}

/**
 * Response structure for Earnings Call Transcript request
 */
export interface EarningsCallTranscriptResponse {
    "symbol"?: string;
    "quarter"?: string;
    "transcript"?: Array<{
        "speaker"?: string;
        "title"?: string;
        "content"?: string;
        "sentiment"?: string;
    }>;
    "Information"?: string; // For error or rate-limit messages
    "Note"?: string; // For API call frequency messages
}

/**
 * Response structure for Top Gainers, Losers, and Most Active Tickers request
 */
export interface TopGainersLosersResponse {
    "metadata"?: string;
    "last_updated"?: string;
    "top_gainers"?: Array<{
        "ticker"?: string;
        "price"?: string;
        "change_amount"?: string;
        "change_percentage"?: string;
        "volume"?: string;
    }>;
    "top_losers"?: Array<{
        "ticker"?: string;
        "price"?: string;
        "change_amount"?: string;
        "change_percentage"?: string;
        "volume"?: string;
    }>;
    "most_actively_traded"?: Array<{
        "ticker"?: string;
        "price"?: string;
        "change_amount"?: string;
        "change_percentage"?: string;
        "volume"?: string;
    }>;
    "Information"?: string; // For error or rate-limit messages
    "Note"?: string; // For API call frequency messages
}

/**
 * Response structure for Insider Transactions request
 */
export interface InsiderTransactionsResponse {
    "data"?: Array<{
        "transaction_date"?: string;
        "ticker"?: string;
        "executive"?: string;
        "executive_title"?: string;
        "security_type"?: string;
        "acquisition_or_disposal"?: string; // "A" for acquisition, "D" for disposal
        "shares"?: string;
        "share_price"?: string;
    }>;
    "Information"?: string; // For error or rate-limit messages
    "Note"?: string; // For API call frequency messages
}

/**
 * Response structure for Advanced Analytics (Fixed Window) request
 */
export interface AdvancedAnalyticsResponse {
    "meta_data"?: {
        "symbols"?: string;
        "min_dt"?: string;
        "max_dt"?: string;
        "ohlc"?: string;
        "interval"?: string;
    };
    "payload"?: {
        "RETURNS_CALCULATIONS"?: {
            [calculationType: string]: {
                [symbol: string]: number | any;
            } | {
                "index"?: string[];
                "correlation"?: number[][];
            } | {
                "index"?: string[];
                "covariance"?: number[][];
            } | {
                "bins"?: number[];
                "counts"?: {
                    [symbol: string]: number[];
                };
            };
        };
    };
    "Information"?: string; // For error or rate-limit messages
    "Note"?: string; // For API call frequency messages
} 