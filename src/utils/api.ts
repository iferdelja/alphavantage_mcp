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
    console.error("url", url);
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

/**
 * Makes a request to the Alpha Vantage API and processes the response as CSV
 * @param params Query parameters to include in the request
 * @returns The CSV response as a string or null if an error occurred
 */
export async function makeAlphaVantageCSVRequest(params: Record<string, string>): Promise<string | null> {
    const queryParams = {
        ...params,
        apikey: ALPHA_VANTAGE_API_KEY as string
    };

    const searchParams = new URLSearchParams(queryParams);
    const url = `${ALPHA_VANTAGE_API_BASE}/query?${searchParams.toString()}`;
    console.error("csv url", url);
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.text();
    } catch (error) {
        console.error("Error making Alpha Vantage CSV request:", error);
        return null;
    }
}

/**
 * Parse CSV data string into an array of objects
 * @param csv The CSV string to parse
 * @returns An array of objects where keys are the CSV headers
 */
export function parseCSV<T>(csv: string): T[] {
    if (!csv) return [];

    const lines = csv.trim().split('\n');
    if (lines.length <= 1) return []; // If only header or empty

    const headers = lines[0].split(',');

    return lines.slice(1).map(line => {
        const values = line.split(',');
        const entry: any = {};

        headers.forEach((header, i) => {
            entry[header] = values[i] || '';
        });

        return entry as T;
    });
} 