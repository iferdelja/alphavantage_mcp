import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

// Get the directory where the script is running (ESM compatible)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try to find and load .env file from multiple locations
const envPaths = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(__dirname, '../..', '.env'),
    path.resolve(__dirname, '../../..', '.env'),
];

let dotenvConfigResult;
for (const envPath of envPaths) {
    try {
        if (fs.existsSync(envPath)) {
            console.error(`Found .env file at: ${envPath}`);
            dotenvConfigResult = dotenv.config({ path: envPath });
            break;
        }
    } catch (error) {
        console.error(`Error checking .env at ${envPath}:`, error);
    }
}

// Check for API key in environment variables
export const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
if (!ALPHA_VANTAGE_API_KEY) {
    console.error("Missing ALPHA_VANTAGE_API_KEY in environment variables.");
    console.error(`Searched for .env file in: ${envPaths.join(', ')}`);
    console.error("Please create a .env file with ALPHA_VANTAGE_API_KEY=your_api_key");
    console.error("Or set the environment variable directly");
    process.exit(1);
}

export const ALPHA_VANTAGE_API_BASE = "https://www.alphavantage.co";
export const USER_AGENT = "alphavantage-mcp/1.0"; 