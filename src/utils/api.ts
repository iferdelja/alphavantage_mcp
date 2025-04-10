import { ALPHA_VANTAGE_API_BASE, ALPHA_VANTAGE_API_KEY } from "../config/index.js";

/**
 * Makes a request to the Alpha Vantage API
 * @param params Query parameters to include in the request
 * @returns The parsed JSON response or null if an error occurred
 */
export async function makeAlphaVantageRequest<T>(params: Record<string, string>): Promise<T | null> {
    const queryParams = {
        ...params,
        apikey: ALPHA_VANTAGE_API_KEY as string
    };

    const searchParams = new URLSearchParams(queryParams);
    const url = `${ALPHA_VANTAGE_API_BASE}/query?${searchParams.toString()}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return (await response.json()) as T;
    } catch (error) {
        console.error("Error making Alpha Vantage request:", error);
        return null;
    }
} 