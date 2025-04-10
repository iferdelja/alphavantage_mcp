# Alpha Vantage MCP

A Model Context Protocol (MCP) server for accessing Alpha Vantage stock data.

## Features

- Get full access to stock data provided by Alpha Vantage

## Setup

1. Clone this repository
2. Install dependencies: `npm install`
3. Copy the example environment file: `cp .env.example .env`
4. Edit the `.env` file and add your Alpha Vantage API key
   - Get a free API key at [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
5. Build the project: `npm run build`

## Usage

### Connect to a Claude client

This MCP server can be used with any MCP-compatible client, such as Claude.

Example queries:
- "Get a stock quote for MSFT"

## License

MIT