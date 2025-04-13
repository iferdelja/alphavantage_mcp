# Alpha Vantage MCP

A Model Context Protocol (MCP) server for accessing [Alpha Vantage](https://www.alphavantage.co/) stock and financial data.

## Features

- Complete support for all Alpha Vantage API endpoints including stocks, economic indicators, technical indicators, forex, cryptocurrencies, and commodities

-  For reduced context window usage, certain endpoints are organized under same tool (technical indicators, forex, commodities, and cryptocurrencies)

## API Organization

To provide a more efficient experience and reduce context window usage:

- **Technical Indicators**: Consolidated into 5 unified endpoints (moving averages, momentum, volatility, volume, cycle) with type parameters
- **Commodities**: Unified into a single endpoint with commodity_type parameter
- **Forex**: Time series endpoints consolidated with a series_type parameter
- **Cryptocurrencies**: Time series endpoints consolidated with a series_type parameter

This organization maintains full functionality while significantly reducing the number of tools required.

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
- "Show me the RSI momentum indicator for AAPL with a 14-day period"
- "What's the exchange rate between USD and EUR?"
- "Get the monthly price data for Bitcoin in USD"
- "Show me crude oil prices for the last quarter"

## License

MIT