import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { makeAlphaVantageRequest, makeAlphaVantageCSVRequest, parseCSV } from "../../utils/api.js";
import {
    CompanyOverviewResponse, ETFProfileResponse, DividendsResponse, SplitsResponse, SplitData,
    IncomeStatementResponse, IncomeStatementReport, BalanceSheetResponse, BalanceSheetReport, CashFlowResponse, CashFlowReport,
    EarningsResponse, AnnualEarning, QuarterlyEarning, IPOCalendarResponse, IPOCalendarEntry,
    EarningsCalendarResponse, EarningsCalendarEntry
} from "../../types/fundamental.js";

/**
 * Format Alpha Vantage company overview data into a readable string
 */
function formatCompanyOverview(overviewData: CompanyOverviewResponse): string {
    if (overviewData.Information) {
        return `Error: ${overviewData.Information}`;
    }

    if (overviewData.Note) {
        return `Note: ${overviewData.Note}`;
    }

    if (!overviewData.Symbol) {
        return "No company data available";
    }

    const sections = [
        // Basic company information
        [
            `== Company Information: ${overviewData.Name || "Unknown"} (${overviewData.Symbol}) ==`,
            `Asset Type: ${overviewData.AssetType || "Unknown"}`,
            `Exchange: ${overviewData.Exchange || "Unknown"}`,
            `Currency: ${overviewData.Currency || "Unknown"}`,
            `Country: ${overviewData.Country || "Unknown"}`,
            `Sector: ${overviewData.Sector || "Unknown"}`,
            `Industry: ${overviewData.Industry || "Unknown"}`,
            `Address: ${overviewData.Address || "Unknown"}`,
            `Website: ${overviewData.OfficialSite || "Unknown"}`,
            `CIK: ${overviewData.CIK || "Unknown"}`,
            `Fiscal Year End: ${overviewData.FiscalYearEnd || "Unknown"}`,
            `Latest Quarter: ${overviewData.LatestQuarter || "Unknown"}`,
            ``,
            `Description: ${overviewData.Description || "No description available"}`,
            ``
        ],

        // Financial metrics
        [
            `== Key Financial Metrics ==`,
            `Market Cap: ${overviewData.MarketCapitalization ? parseInt(overviewData.MarketCapitalization).toLocaleString() : "Unknown"}`,
            `EBITDA: ${overviewData.EBITDA ? parseInt(overviewData.EBITDA).toLocaleString() : "Unknown"}`,
            `Revenue (TTM): ${overviewData.RevenueTTM ? parseInt(overviewData.RevenueTTM).toLocaleString() : "Unknown"}`,
            `Gross Profit (TTM): ${overviewData.GrossProfitTTM ? parseInt(overviewData.GrossProfitTTM).toLocaleString() : "Unknown"}`,
            `Shares Outstanding: ${overviewData.SharesOutstanding ? parseInt(overviewData.SharesOutstanding).toLocaleString() : "Unknown"}`,
            ``
        ],

        // Ratios
        [
            `== Ratios and Performance ==`,
            `EPS: ${overviewData.EPS || "Unknown"}`,
            `PE Ratio: ${overviewData.PERatio || "Unknown"}`,
            `PEG Ratio: ${overviewData.PEGRatio || "Unknown"}`,
            `Forward PE: ${overviewData.ForwardPE || "Unknown"}`,
            `Price to Sales (TTM): ${overviewData.PriceToSalesRatioTTM || "Unknown"}`,
            `Price to Book: ${overviewData.PriceToBookRatio || "Unknown"}`,
            `EV to Revenue: ${overviewData.EVToRevenue || "Unknown"}`,
            `EV to EBITDA: ${overviewData.EVToEBITDA || "Unknown"}`,
            `Book Value: ${overviewData.BookValue || "Unknown"}`,
            `Revenue Per Share (TTM): ${overviewData.RevenuePerShareTTM || "Unknown"}`,
            `Diluted EPS (TTM): ${overviewData.DilutedEPSTTM || "Unknown"}`,
            ``
        ],

        // Profitability and growth
        [
            `== Profitability and Growth ==`,
            `Profit Margin: ${overviewData.ProfitMargin ? (Number(overviewData.ProfitMargin) * 100).toFixed(2) + "%" : "Unknown"}`,
            `Operating Margin (TTM): ${overviewData.OperatingMarginTTM ? (Number(overviewData.OperatingMarginTTM) * 100).toFixed(2) + "%" : "Unknown"}`,
            `Return on Assets (TTM): ${overviewData.ReturnOnAssetsTTM ? (Number(overviewData.ReturnOnAssetsTTM) * 100).toFixed(2) + "%" : "Unknown"}`,
            `Return on Equity (TTM): ${overviewData.ReturnOnEquityTTM ? (Number(overviewData.ReturnOnEquityTTM) * 100).toFixed(2) + "%" : "Unknown"}`,
            `Quarterly Earnings Growth (YOY): ${overviewData.QuarterlyEarningsGrowthYOY ? (Number(overviewData.QuarterlyEarningsGrowthYOY) * 100).toFixed(2) + "%" : "Unknown"}`,
            `Quarterly Revenue Growth (YOY): ${overviewData.QuarterlyRevenueGrowthYOY ? (Number(overviewData.QuarterlyRevenueGrowthYOY) * 100).toFixed(2) + "%" : "Unknown"}`,
            ``
        ],

        // Dividends
        [
            `== Dividends ==`,
            `Dividend Per Share: ${overviewData.DividendPerShare || "N/A"}`,
            `Dividend Yield: ${overviewData.DividendYield ? (Number(overviewData.DividendYield) * 100).toFixed(2) + "%" : "N/A"}`,
            `Dividend Date: ${overviewData.DividendDate || "N/A"}`,
            `Ex-Dividend Date: ${overviewData.ExDividendDate || "N/A"}`,
            ``
        ],

        // Market Data
        [
            `== Market Data ==`,
            `Beta: ${overviewData.Beta || "Unknown"}`,
            `52-Week High: ${overviewData["52WeekHigh"] || "Unknown"}`,
            `52-Week Low: ${overviewData["52WeekLow"] || "Unknown"}`,
            `50-Day Moving Average: ${overviewData["50DayMovingAverage"] || "Unknown"}`,
            `200-Day Moving Average: ${overviewData["200DayMovingAverage"] || "Unknown"}`,
            ``
        ],

        // Analyst Ratings
        [
            `== Analyst Ratings ==`,
            `Analyst Target Price: ${overviewData.AnalystTargetPrice || "Unknown"}`,
            `Strong Buy: ${overviewData.AnalystRatingStrongBuy || "0"}`,
            `Buy: ${overviewData.AnalystRatingBuy || "0"}`,
            `Hold: ${overviewData.AnalystRatingHold || "0"}`,
            `Sell: ${overviewData.AnalystRatingSell || "0"}`,
            `Strong Sell: ${overviewData.AnalystRatingStrongSell || "0"}`
        ]
    ];

    return sections.map(section => section.join('\n')).join('\n\n');
}

/**
 * Format Alpha Vantage ETF profile data into a readable string
 */
function formatETFProfile(etfData: ETFProfileResponse): string {
    if (etfData.Information) {
        return `Error: ${etfData.Information}`;
    }

    if (etfData.Note) {
        return `Note: ${etfData.Note}`;
    }

    if (!etfData.net_assets) {
        return "No ETF profile data available";
    }

    const sections = [
        // ETF Overview
        [
            `== ETF Profile Overview ==`,
            `Net Assets: $${Number(etfData.net_assets).toLocaleString()}`,
            `Expense Ratio: ${(Number(etfData.net_expense_ratio) * 100).toFixed(2)}%`,
            `Portfolio Turnover: ${(Number(etfData.portfolio_turnover) * 100).toFixed(2)}%`,
            `Dividend Yield: ${(Number(etfData.dividend_yield) * 100).toFixed(2)}%`,
            `Inception Date: ${etfData.inception_date || "Unknown"}`,
            `Leveraged: ${etfData.leveraged || "Unknown"}`
        ],

        // Sector Allocation
        etfData.sectors && etfData.sectors.length > 0 ? [
            `== Sector Allocation ==`,
            ...etfData.sectors.map(sector =>
                `${sector.sector}: ${(Number(sector.weight) * 100).toFixed(2)}%`
            )
        ] : [`== Sector Allocation ==`, `No sector data available`],

        // Top Holdings (show top 10 by default)
        etfData.holdings && etfData.holdings.length > 0 ? [
            `== Top Holdings ==`,
            ...etfData.holdings.slice(0, 10).map((holding, index) =>
                `${index + 1}. ${holding.symbol} - ${holding.description || "N/A"}: ${(Number(holding.weight) * 100).toFixed(2)}%`
            ),
            ``,
            `Total Holdings: ${etfData.holdings.length}`
        ] : [`== Top Holdings ==`, `No holdings data available`]
    ];

    return sections.map(section => section.join('\n')).join('\n\n');
}

/**
 * Format Alpha Vantage dividends data into a readable string
 */
function formatDividends(dividendsData: DividendsResponse): string {
    if (dividendsData.Information) {
        return `Error: ${dividendsData.Information}`;
    }

    if (dividendsData.Note) {
        return `Note: ${dividendsData.Note}`;
    }

    if (!dividendsData.symbol || !dividendsData.data || dividendsData.data.length === 0) {
        return "No dividend data available";
    }

    // Separate future and historical dividends
    const now = new Date();
    const futureDividends = dividendsData.data.filter(div => new Date(div.payment_date) > now);
    const historicalDividends = dividendsData.data.filter(div => new Date(div.payment_date) <= now);

    // Calculate some stats
    let totalAmount = 0;
    let dividendCount = historicalDividends.length;

    historicalDividends.forEach(div => {
        totalAmount += parseFloat(div.amount);
    });

    const averageDividend = dividendCount > 0 ? totalAmount / dividendCount : 0;

    // Find annual dividend patterns (if any)
    const annualDividends = new Map<number, number>();
    historicalDividends.forEach(div => {
        const year = new Date(div.payment_date).getFullYear();
        const amount = parseFloat(div.amount);

        if (annualDividends.has(year)) {
            annualDividends.set(year, annualDividends.get(year)! + amount);
        } else {
            annualDividends.set(year, amount);
        }
    });

    // Format the output
    const sections = [
        // Header
        [
            `== Dividend History for ${dividendsData.symbol} ==`,
            `Total Records: ${dividendsData.data.length}`,
            `Average Dividend: $${averageDividend.toFixed(2)}`,
            ``
        ],

        // Future (Declared) Dividends
        futureDividends.length > 0 ? [
            `== Upcoming Dividends ==`,
            ...futureDividends.map(div =>
                `Payment Date: ${div.payment_date} | Ex-Div Date: ${div.ex_dividend_date} | Amount: $${div.amount}`
            ),
            ``
        ] : [],

        // Annual Dividend Totals
        annualDividends.size > 0 ? [
            `== Annual Dividend Totals ==`,
            ...Array.from(annualDividends.entries())
                .sort((a, b) => b[0] - a[0]) // Sort by year descending
                .map(([year, amount]) => `${year}: $${amount.toFixed(2)}`),
            ``
        ] : [],

        // Historical Dividends
        [
            `== Recent Dividend History ==`,
            ...historicalDividends.slice(0, 10).map(div =>
                `Payment: ${div.payment_date} | Ex-Div: ${div.ex_dividend_date} | Declared: ${div.declaration_date} | Amount: $${div.amount}`
            ),
            ...(historicalDividends.length > 10 ? [`... and ${historicalDividends.length - 10} more historical dividends`] : [])
        ]
    ];

    return sections
        .filter(section => section.length > 0) // Remove empty sections
        .map(section => section.join('\n'))
        .join('\n\n');
}

/**
 * Format Alpha Vantage splits data into a readable string
 */
function formatSplits(splitsData: SplitsResponse): string {
    if (splitsData.Information) {
        return `Error: ${splitsData.Information}`;
    }

    if (splitsData.Note) {
        return `Note: ${splitsData.Note}`;
    }

    if (!splitsData.symbol || !splitsData.data || splitsData.data.length === 0) {
        return "No stock split data available";
    }

    // Sort splits by date (most recent first)
    const sortedSplits = [...splitsData.data].sort((a, b) =>
        new Date(b.effective_date).getTime() - new Date(a.effective_date).getTime()
    );

    // Group splits by decade for historical context
    const splitsByDecade = new Map<string, SplitData[]>();
    sortedSplits.forEach(split => {
        const year = new Date(split.effective_date).getFullYear();
        const decade = `${Math.floor(year / 10) * 10}s`;

        if (!splitsByDecade.has(decade)) {
            splitsByDecade.set(decade, []);
        }

        splitsByDecade.get(decade)!.push(split);
    });

    // Calculate cumulative split factor
    let cumulativeFactor = 1;
    splitsData.data.forEach(split => {
        cumulativeFactor *= parseFloat(split.split_factor);
    });

    // Format the output
    const sections = [
        // Header
        [
            `== Stock Split History for ${splitsData.symbol} ==`,
            `Total Split Events: ${splitsData.data.length}`,
            `Cumulative Split Factor: ${cumulativeFactor.toFixed(4)}`,
            `(Original shares multiplied by ${cumulativeFactor.toFixed(4)} equals current shares)`,
            ``
        ],

        // All splits in chronological order
        [
            `== All Stock Splits (Most Recent First) ==`,
            ...sortedSplits.map(split => {
                // Parse split factor to determine if it's a forward or reverse split
                const factor = parseFloat(split.split_factor);
                let splitType = '';
                let readableFactor = '';

                if (factor > 1) {
                    // Forward split
                    splitType = 'Forward Split';
                    // Convert to ratio format (e.g., 2.0000 becomes "2:1")
                    readableFactor = `${factor}:1`;
                } else if (factor < 1) {
                    // Reverse split
                    splitType = 'Reverse Split';
                    // Convert to ratio format (e.g., 0.5000 becomes "1:2")
                    readableFactor = `1:${Math.round(1 / factor)}`;
                } else {
                    // Equal to 1 (no real split)
                    splitType = 'Stock Distribution';
                    readableFactor = '1:1';
                }

                return `${split.effective_date}: ${splitType} - ${readableFactor} (factor: ${split.split_factor})`;
            })
        ],

        // Splits by decade (if there are enough splits to make this relevant)
        splitsData.data.length >= 3 ? [
            ``,
            `== Splits By Decade ==`,
            ...Array.from(splitsByDecade.entries())
                .sort((a, b) => b[0].localeCompare(a[0])) // Sort decades in descending order
                .map(([decade, splits]) =>
                    `${decade}: ${splits.length} split${splits.length !== 1 ? 's' : ''}`
                )
        ] : []
    ];

    return sections
        .filter(section => section.length > 0) // Remove empty sections
        .map(section => section.join('\n'))
        .join('\n');
}

/**
 * Format Alpha Vantage income statement data into a readable string
 */
function formatIncomeStatement(incomeData: IncomeStatementResponse, reportType: 'annual' | 'quarterly' = 'annual'): string {
    if (incomeData.Information) {
        return `Error: ${incomeData.Information}`;
    }

    if (incomeData.Note) {
        return `Note: ${incomeData.Note}`;
    }

    const reports = reportType === 'annual' ? incomeData.annualReports : incomeData.quarterlyReports;

    if (!incomeData.symbol || !reports || reports.length === 0) {
        return `No ${reportType} income statement data available`;
    }

    // Format currency values in millions with proper formatting
    const formatCurrency = (valueStr: string): string => {
        if (!valueStr || valueStr === 'None') return 'N/A';

        const value = parseFloat(valueStr);
        const inMillions = value / 1000000;

        return `$${inMillions.toLocaleString(undefined, {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1
        })}M`;
    };

    // Format percentage values
    const calculatePercentage = (value: string, total: string): string => {
        if (!value || value === 'None' || !total || total === 'None') return 'N/A';

        const valueNum = parseFloat(value);
        const totalNum = parseFloat(total);

        if (totalNum === 0) return '0.0%';

        return `${((valueNum / totalNum) * 100).toFixed(1)}%`;
    };

    // Helper function to extract fiscal year or quarter
    const getFiscalPeriod = (dateStr: string, isQuarterly: boolean): string => {
        if (isQuarterly) {
            // For quarterly, return something like "Q1 2023"
            const date = new Date(dateStr);
            const year = date.getFullYear();
            // Approximate the quarter based on the month
            const month = date.getMonth();
            const quarter = Math.floor(month / 3) + 1;
            return `Q${quarter} ${year}`;
        } else {
            // For annual, just return the year
            return dateStr.substring(0, 4);
        }
    };

    // Create a table header with periods
    const periods = reports.map(report =>
        getFiscalPeriod(report.fiscalDateEnding, reportType === 'quarterly')
    );

    // Build the output sections
    const sections = [
        // Header
        [
            `== ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Income Statement for ${incomeData.symbol} ==`,
            `Currency: ${reports[0].reportedCurrency}`,
            `Periods: ${periods.join(', ')}`,
            ``
        ],

        // Revenue and Gross Profit
        [
            `== Revenue and Gross Profit ==`,
            ...periods.map((period, i) =>
                `${period}:
  Total Revenue: ${formatCurrency(reports[i].totalRevenue)}
  Cost of Revenue: ${formatCurrency(reports[i].costOfRevenue)} (${calculatePercentage(reports[i].costOfRevenue, reports[i].totalRevenue)} of revenue)
  Gross Profit: ${formatCurrency(reports[i].grossProfit)} (${calculatePercentage(reports[i].grossProfit, reports[i].totalRevenue)} of revenue)`
            )
        ],

        // Operating Expenses and Income
        [
            ``,
            `== Operating Expenses ==`,
            ...periods.map((period, i) =>
                `${period}:
  SG&A: ${formatCurrency(reports[i].sellingGeneralAndAdministrative)} (${calculatePercentage(reports[i].sellingGeneralAndAdministrative, reports[i].totalRevenue)} of revenue)
  R&D: ${formatCurrency(reports[i].researchAndDevelopment)} (${calculatePercentage(reports[i].researchAndDevelopment, reports[i].totalRevenue)} of revenue)
  Total Operating Expenses: ${formatCurrency(reports[i].operatingExpenses)}
  Operating Income: ${formatCurrency(reports[i].operatingIncome)} (${calculatePercentage(reports[i].operatingIncome, reports[i].totalRevenue)} of revenue)`
            )
        ],

        // Other Income and Expenses
        [
            ``,
            `== Other Income and Expenses ==`,
            ...periods.map((period, i) =>
                `${period}:
  Interest Income: ${formatCurrency(reports[i].interestIncome)}
  Interest Expense: ${formatCurrency(reports[i].interestExpense)}
  Net Interest Income: ${formatCurrency(reports[i].netInterestIncome)}
  Depreciation & Amortization: ${formatCurrency(reports[i].depreciationAndAmortization)}`
            )
        ],

        // Profit Metrics
        [
            ``,
            `== Profit Metrics ==`,
            ...periods.map((period, i) =>
                `${period}:
  Income Before Tax: ${formatCurrency(reports[i].incomeBeforeTax)} (${calculatePercentage(reports[i].incomeBeforeTax, reports[i].totalRevenue)} of revenue)
  Income Tax Expense: ${formatCurrency(reports[i].incomeTaxExpense)}
  Net Income: ${formatCurrency(reports[i].netIncome)} (${calculatePercentage(reports[i].netIncome, reports[i].totalRevenue)} of revenue)
  EBIT: ${formatCurrency(reports[i].ebit)}
  EBITDA: ${formatCurrency(reports[i].ebitda)}`
            )
        ]
    ];

    return sections
        .filter(section => section.length > 0) // Remove empty sections
        .map(section => section.join('\n'))
        .join('\n');
}

/**
 * Format Alpha Vantage balance sheet data into a readable string
 */
function formatBalanceSheet(balanceData: BalanceSheetResponse, reportType: 'annual' | 'quarterly' = 'annual'): string {
    if (balanceData.Information) {
        return `Error: ${balanceData.Information}`;
    }

    if (balanceData.Note) {
        return `Note: ${balanceData.Note}`;
    }

    const reports = reportType === 'annual' ? balanceData.annualReports : balanceData.quarterlyReports;

    if (!balanceData.symbol || !reports || reports.length === 0) {
        return `No ${reportType} balance sheet data available`;
    }

    // Format currency values in millions with proper formatting
    const formatCurrency = (valueStr: string): string => {
        if (!valueStr || valueStr === 'None') return 'N/A';

        const value = parseFloat(valueStr);
        const inMillions = value / 1000000;

        return `$${inMillions.toLocaleString(undefined, {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1
        })}M`;
    };

    // Format percentage values (e.g., of total assets)
    const calculatePercentage = (value: string, total: string): string => {
        if (!value || value === 'None' || !total || total === 'None') return 'N/A';

        const valueNum = parseFloat(value);
        const totalNum = parseFloat(total);

        if (totalNum === 0) return '0.0%';

        return `${((valueNum / totalNum) * 100).toFixed(1)}%`;
    };

    // Helper function to extract fiscal year or quarter
    const getFiscalPeriod = (dateStr: string, isQuarterly: boolean): string => {
        if (isQuarterly) {
            // For quarterly, return something like "Q1 2023"
            const date = new Date(dateStr);
            const year = date.getFullYear();
            // Approximate the quarter based on the month
            const month = date.getMonth();
            const quarter = Math.floor(month / 3) + 1;
            return `Q${quarter} ${year}`;
        } else {
            // For annual, just return the year
            return dateStr.substring(0, 4);
        }
    };

    // Create a table header with periods
    const periods = reports.map(report =>
        getFiscalPeriod(report.fiscalDateEnding, reportType === 'quarterly')
    );

    // Build the output sections
    const sections = [
        // Header
        [
            `== ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Balance Sheet for ${balanceData.symbol} ==`,
            `Currency: ${reports[0].reportedCurrency}`,
            `Periods: ${periods.join(', ')}`,
            ``
        ],

        // Assets
        [
            `== Assets ==`,
            ...periods.map((period, i) =>
                `${period}:
  Total Assets: ${formatCurrency(reports[i].totalAssets)}
  
  Current Assets: ${formatCurrency(reports[i].totalCurrentAssets)} (${calculatePercentage(reports[i].totalCurrentAssets, reports[i].totalAssets)} of total assets)
    - Cash & Equivalents: ${formatCurrency(reports[i].cashAndCashEquivalentsAtCarryingValue)}
    - Short-term Investments: ${formatCurrency(reports[i].shortTermInvestments)}
    - Inventory: ${formatCurrency(reports[i].inventory)}
    - Other Current Assets: ${formatCurrency(reports[i].otherCurrentAssets)}
  
  Non-Current Assets: ${formatCurrency(reports[i].totalNonCurrentAssets)} (${calculatePercentage(reports[i].totalNonCurrentAssets, reports[i].totalAssets)} of total assets)
    - Goodwill: ${formatCurrency(reports[i].goodwill)}
    - Intangible Assets: ${formatCurrency(reports[i].intangibleAssets)}
    - Long-term Investments: ${formatCurrency(reports[i].longTermInvestments)}`
            )
        ],

        // Liabilities
        [
            ``,
            `== Liabilities ==`,
            ...periods.map((period, i) =>
                `${period}:
  Total Liabilities: ${formatCurrency(reports[i].totalLiabilities)} (${calculatePercentage(reports[i].totalLiabilities, reports[i].totalAssets)} of total assets)
  
  Current Liabilities: ${formatCurrency(reports[i].totalCurrentLiabilities)} (${calculatePercentage(reports[i].totalCurrentLiabilities, reports[i].totalLiabilities)} of total liabilities)
    - Short-term Debt: ${formatCurrency(reports[i].shortTermDebt)}
    - Current Portion of Long-term Debt: ${formatCurrency(reports[i].currentLongTermDebt)}
    - Other Current Liabilities: ${formatCurrency(reports[i].otherCurrentLiabilities)}
  
  Non-Current Liabilities: ${formatCurrency(reports[i].totalNonCurrentLiabilities)} (${calculatePercentage(reports[i].totalNonCurrentLiabilities, reports[i].totalLiabilities)} of total liabilities)
    - Long-term Debt: ${formatCurrency(reports[i].longTermDebt)}
    - Capital Lease Obligations: ${formatCurrency(reports[i].capitalLeaseObligations)}
    - Other Non-Current Liabilities: ${formatCurrency(reports[i].otherNonCurrentLiabilities)}`
            )
        ],

        // Shareholders' Equity
        [
            ``,
            `== Shareholders' Equity ==`,
            ...periods.map((period, i) =>
                `${period}:
  Total Shareholders' Equity: ${formatCurrency(reports[i].totalShareholderEquity)} (${calculatePercentage(reports[i].totalShareholderEquity, reports[i].totalAssets)} of total assets)
    - Common Stock: ${formatCurrency(reports[i].commonStock)}
    - Retained Earnings: ${formatCurrency(reports[i].retainedEarnings)}
    - Shares Outstanding: ${reports[i].commonStockSharesOutstanding ? parseInt(reports[i].commonStockSharesOutstanding).toLocaleString() : 'N/A'}`
            )
        ],

        // Key Financial Ratios
        [
            ``,
            `== Key Financial Ratios ==`,
            ...periods.map((period, i) => {
                // Calculate some common financial ratios
                const currentRatio = reports[i].totalCurrentAssets !== 'None' && reports[i].totalCurrentLiabilities !== 'None' ?
                    (parseFloat(reports[i].totalCurrentAssets) / parseFloat(reports[i].totalCurrentLiabilities)).toFixed(2) : 'N/A';

                const debtToEquity = reports[i].shortLongTermDebtTotal !== 'None' && reports[i].totalShareholderEquity !== 'None' ?
                    (parseFloat(reports[i].shortLongTermDebtTotal) / parseFloat(reports[i].totalShareholderEquity)).toFixed(2) : 'N/A';

                const debtToAssets = reports[i].shortLongTermDebtTotal !== 'None' && reports[i].totalAssets !== 'None' ?
                    (parseFloat(reports[i].shortLongTermDebtTotal) / parseFloat(reports[i].totalAssets)).toFixed(2) : 'N/A';

                return `${period}:
  Current Ratio: ${currentRatio}
  Debt to Equity: ${debtToEquity}
  Debt to Assets: ${debtToAssets}
  Book Value per Share: ${reports[i].totalShareholderEquity !== 'None' && reports[i].commonStockSharesOutstanding !== 'None' ?
                        '$' + (parseFloat(reports[i].totalShareholderEquity) / parseFloat(reports[i].commonStockSharesOutstanding)).toFixed(2) : 'N/A'}`;
            })
        ]
    ];

    return sections
        .filter(section => section.length > 0) // Remove empty sections
        .map(section => section.join('\n'))
        .join('\n');
}

/**
 * Format Alpha Vantage cash flow data into a readable string
 */
function formatCashFlow(cashFlowData: CashFlowResponse, reportType: 'annual' | 'quarterly' = 'annual'): string {
    if (cashFlowData.Information) {
        return `Error: ${cashFlowData.Information}`;
    }

    if (cashFlowData.Note) {
        return `Note: ${cashFlowData.Note}`;
    }

    const reports = reportType === 'annual' ? cashFlowData.annualReports : cashFlowData.quarterlyReports;

    if (!cashFlowData.symbol || !reports || reports.length === 0) {
        return `No ${reportType} cash flow data available`;
    }

    // Format currency values in millions with proper formatting
    const formatCurrency = (valueStr: string): string => {
        if (!valueStr || valueStr === 'None') return 'N/A';

        const value = parseFloat(valueStr);
        const inMillions = value / 1000000;

        // Format with + sign for positive values
        const sign = inMillions >= 0 ? '+' : '';

        return `${sign}$${Math.abs(inMillions).toLocaleString(undefined, {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1
        })}M`;
    };

    // Format a value as a percentage of another
    const calculatePercentage = (value: string, total: string): string => {
        if (!value || value === 'None' || !total || total === 'None') return 'N/A';

        const valueNum = parseFloat(value);
        const totalNum = parseFloat(total);

        if (totalNum === 0) return '0.0%';

        return `${((valueNum / totalNum) * 100).toFixed(1)}%`;
    };

    // Helper function to extract fiscal year or quarter
    const getFiscalPeriod = (dateStr: string, isQuarterly: boolean): string => {
        if (isQuarterly) {
            // For quarterly, return something like "Q1 2023"
            const date = new Date(dateStr);
            const year = date.getFullYear();
            // Approximate the quarter based on the month
            const month = date.getMonth();
            const quarter = Math.floor(month / 3) + 1;
            return `Q${quarter} ${year}`;
        } else {
            // For annual, just return the year
            return dateStr.substring(0, 4);
        }
    };

    // Calculate Free Cash Flow (FCF)
    const calculateFCF = (report: CashFlowReport): string => {
        if (report.operatingCashflow === 'None' || report.capitalExpenditures === 'None') {
            return 'N/A';
        }

        const operatingCash = parseFloat(report.operatingCashflow);
        const capEx = parseFloat(report.capitalExpenditures);

        return formatCurrency((operatingCash - capEx).toString());
    };

    // Create a table header with periods
    const periods = reports.map(report =>
        getFiscalPeriod(report.fiscalDateEnding, reportType === 'quarterly')
    );

    // Build the output sections
    const sections = [
        // Header
        [
            `== ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Cash Flow Statement for ${cashFlowData.symbol} ==`,
            `Currency: ${reports[0].reportedCurrency}`,
            `Periods: ${periods.join(', ')}`,
            ``
        ],

        // Operating Activities
        [
            `== Cash Flow from Operating Activities ==`,
            ...periods.map((period, i) =>
                `${period}:
  Net Income: ${formatCurrency(reports[i].netIncome)}
  Depreciation & Amortization: ${formatCurrency(reports[i].depreciationDepletionAndAmortization)}
  Change in Inventory: ${formatCurrency(reports[i].changeInInventory)}
  Net Operating Cash Flow: ${formatCurrency(reports[i].operatingCashflow)}`
            )
        ],

        // Investing Activities
        [
            ``,
            `== Cash Flow from Investing Activities ==`,
            ...periods.map((period, i) =>
                `${period}:
  Capital Expenditures: ${formatCurrency(reports[i].capitalExpenditures)}
  Cash Flow from Investment: ${reports[i].cashflowFromInvestment !== 'None' ?
                    formatCurrency(reports[i].cashflowFromInvestment) : 'N/A'}`
            )
        ],

        // Financing Activities
        [
            ``,
            `== Cash Flow from Financing Activities ==`,
            ...periods.map((period, i) =>
                `${period}:
  Dividend Payout: ${formatCurrency(reports[i].dividendPayout)}
  Stock Repurchase: ${reports[i].proceedsFromRepurchaseOfEquity !== 'None' ?
                    formatCurrency(reports[i].proceedsFromRepurchaseOfEquity) : 'N/A'}
  Debt Proceeds: ${reports[i].proceedsFromIssuanceOfLongTermDebtAndCapitalSecuritiesNet !== 'None' ?
                    formatCurrency(reports[i].proceedsFromIssuanceOfLongTermDebtAndCapitalSecuritiesNet) : 'N/A'}
  Net Financing Cash Flow: ${formatCurrency(reports[i].cashflowFromFinancing)}`
            )
        ],

        // Key Metrics and Ratios
        [
            ``,
            `== Key Cash Flow Metrics ==`,
            ...periods.map((period, i) => {
                // Calculate Free Cash Flow
                const fcf = calculateFCF(reports[i]);

                // Calculate FCF Yield if possible
                let fcfYield = 'N/A';
                if (fcf !== 'N/A' && reports[i].netIncome !== 'None') {
                    const fcfNum = parseFloat(reports[i].operatingCashflow) - parseFloat(reports[i].capitalExpenditures);
                    const netIncomeNum = parseFloat(reports[i].netIncome);

                    if (netIncomeNum !== 0) {
                        fcfYield = `${((fcfNum / netIncomeNum) * 100).toFixed(1)}%`;
                    }
                }

                // Calculate capEx as % of Operating Cash Flow
                const capExRatio = reports[i].capitalExpenditures !== 'None' && reports[i].operatingCashflow !== 'None' ?
                    `${((parseFloat(reports[i].capitalExpenditures) / parseFloat(reports[i].operatingCashflow)) * 100).toFixed(1)}%` : 'N/A';

                return `${period}:
  Free Cash Flow (OCF - CapEx): ${fcf}
  FCF to Net Income Ratio: ${fcfYield}
  Capital Expenditure to OCF: ${capExRatio}
  Dividend Payout Ratio: ${reports[i].dividendPayout !== 'None' && reports[i].operatingCashflow !== 'None' ?
                        `${((parseFloat(reports[i].dividendPayout) / parseFloat(reports[i].operatingCashflow)) * 100).toFixed(1)}%` : 'N/A'}`;
            })
        ]
    ];

    return sections
        .filter(section => section.length > 0) // Remove empty sections
        .map(section => section.join('\n'))
        .join('\n');
}

/**
 * Format Alpha Vantage earnings data into a readable string
 */
function formatEarnings(earningsData: EarningsResponse): string {
    if (earningsData.Information) {
        return `Error: ${earningsData.Information}`;
    }

    if (earningsData.Note) {
        return `Note: ${earningsData.Note}`;
    }

    if (!earningsData.symbol) {
        return "No earnings data available";
    }

    // Helper function to determine if an upcoming earnings date is expected
    const isExpectedEarnings = (earnings: AnnualEarning): boolean => {
        return earnings.reportedEPS === "0" || parseFloat(earnings.reportedEPS) === 0;
    };

    // Find upcoming earnings dates
    const upcomingEarnings = earningsData.annualEarnings?.filter(isExpectedEarnings) || [];

    // Format annual earnings
    const annualEarningsSection = () => {
        if (!earningsData.annualEarnings || earningsData.annualEarnings.length === 0) {
            return ["== Annual Earnings ==", "No annual earnings data available"];
        }

        const historicalEarnings = earningsData.annualEarnings.filter(e => !isExpectedEarnings(e));

        // Calculate YoY growth rates
        const earningsWithGrowth = historicalEarnings.map((earning, index, array) => {
            if (index < array.length - 1) {
                const currentEPS = parseFloat(earning.reportedEPS);
                const previousEPS = parseFloat(array[index + 1].reportedEPS);
                const growthRate = previousEPS !== 0 ? ((currentEPS - previousEPS) / previousEPS) * 100 : 0;
                return {
                    ...earning,
                    growthRate: growthRate.toFixed(2)
                };
            }
            return { ...earning, growthRate: "N/A" };
        });

        return [
            "== Annual Earnings ==",
            ...earningsWithGrowth.map((earning, index) =>
                `${earning.fiscalDateEnding.substring(0, 4)}: $${earning.reportedEPS}${earning.growthRate !== "N/A" ? ` (YoY: ${parseFloat(earning.growthRate) >= 0 ? '+' : ''}${earning.growthRate}%)` : ''}`
            )
        ];
    };

    // Format quarterly earnings with surprises
    const quarterlyEarningsSection = () => {
        if (!earningsData.quarterlyEarnings || earningsData.quarterlyEarnings.length === 0) {
            return ["== Quarterly Earnings ==", "No quarterly earnings data available"];
        }

        // Sort quarterly earnings by date (most recent first)
        const sortedEarnings = [...earningsData.quarterlyEarnings].sort(
            (a, b) => new Date(b.fiscalDateEnding).getTime() - new Date(a.fiscalDateEnding).getTime()
        );

        return [
            "== Quarterly Earnings (Last 8 Quarters) ==",
            ...sortedEarnings.slice(0, 8).map(quarter => {
                const fiscalDate = quarter.fiscalDateEnding;
                const reportedDate = quarter.reportedDate;
                const reportedEPS = quarter.reportedEPS;
                const estimatedEPS = quarter.estimatedEPS === "None" ? "N/A" : quarter.estimatedEPS;

                // Calculate surprise and format with +/- sign
                const surprise = quarter.surprise === "None" ? "N/A" :
                    `${parseFloat(quarter.surprise) >= 0 ? '+' : ''}$${quarter.surprise}`;

                // Format surprise percentage with +/- sign
                const surprisePercent = quarter.surprisePercentage === "None" ? "N/A" :
                    `${parseFloat(quarter.surprisePercentage) >= 0 ? '+' : ''}${quarter.surprisePercentage}%`;

                // Check if the quarter beat, met, or missed estimates
                let result = "N/A";
                if (estimatedEPS !== "N/A" && reportedEPS !== "None") {
                    const diff = parseFloat(reportedEPS) - parseFloat(estimatedEPS);
                    if (diff > 0) result = "Beat";
                    else if (diff < 0) result = "Missed";
                    else result = "Met";
                }

                // Determine which quarter (Q1-Q4) based on the date
                const quarterDate = new Date(fiscalDate);
                const quarter_num = Math.floor(quarterDate.getMonth() / 3) + 1;
                const year = quarterDate.getFullYear();

                return `Q${quarter_num} ${year} (Reported: ${reportedDate}): Actual: $${reportedEPS} | Est: ${estimatedEPS} | ${result} by ${surprise} (${surprisePercent})`;
            })
        ];
    };

    // Calculate earnings trends and statistics
    const earningsTrendsSection = () => {
        if (!earningsData.annualEarnings || earningsData.annualEarnings.length <= 1) {
            return [];
        }

        const historicalEarnings = earningsData.annualEarnings.filter(e => !isExpectedEarnings(e));
        if (historicalEarnings.length <= 1) {
            return [];
        }

        // Calculate average annual EPS growth rate (CAGR) over available periods
        const firstEPS = parseFloat(historicalEarnings[historicalEarnings.length - 1].reportedEPS);
        const lastEPS = parseFloat(historicalEarnings[0].reportedEPS);
        const years = historicalEarnings.length - 1;

        const cagr = years > 0 ? (Math.pow(lastEPS / firstEPS, 1 / years) - 1) * 100 : 0;

        // Calculate average EPS over 3 and 5 years (if available)
        const last3Years = historicalEarnings.slice(0, Math.min(3, historicalEarnings.length));
        const last5Years = historicalEarnings.slice(0, Math.min(5, historicalEarnings.length));

        const avg3YearEPS = last3Years.reduce((sum, e) => sum + parseFloat(e.reportedEPS), 0) / last3Years.length;
        const avg5YearEPS = last5Years.reduce((sum, e) => sum + parseFloat(e.reportedEPS), 0) / last5Years.length;

        return [
            "== Earnings Trends ==",
            `Average Annual EPS Growth Rate: ${cagr.toFixed(2)}%`,
            `3-Year Average EPS: $${avg3YearEPS.toFixed(2)}`,
            `5-Year Average EPS: $${avg5YearEPS.toFixed(2)}`,
            `Latest Annual EPS: $${historicalEarnings[0].reportedEPS}`
        ];
    };

    // Build the output with all sections
    let sections = [
        // Header
        [
            `== Earnings Data for ${earningsData.symbol} ==`,
            ``
        ]
    ];

    // Add upcoming earnings if any
    if (upcomingEarnings.length > 0) {
        sections.push([
            "== Upcoming Earnings Dates ==",
            ...upcomingEarnings.map(earning =>
                `Fiscal Year Ending: ${earning.fiscalDateEnding}`
            ),
            ``
        ]);
    }

    // Add remaining sections
    sections.push(annualEarningsSection());
    sections.push([""]); // Add spacing
    sections.push(quarterlyEarningsSection());

    const trends = earningsTrendsSection();
    if (trends.length > 0) {
        sections.push([""]);
        sections.push(trends);
    }

    return sections
        .map(section => section.join('\n'))
        .join('\n');
}

/**
 * Format Alpha Vantage IPO Calendar data into a readable string
 */
function formatIPOCalendar(ipoData: IPOCalendarResponse): string {
    if (ipoData.Information) {
        return `Error: ${ipoData.Information}`;
    }

    if (ipoData.Note) {
        return `Note: ${ipoData.Note}`;
    }

    if (!ipoData.data || ipoData.data.length === 0) {
        return "No upcoming IPO data available";
    }

    // Group IPOs by month
    const iposByMonth = new Map<string, IPOCalendarEntry[]>();

    ipoData.data.forEach(ipo => {
        if (!ipo.ipoDate) return;

        const date = new Date(ipo.ipoDate);
        const monthYear = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;

        if (!iposByMonth.has(monthYear)) {
            iposByMonth.set(monthYear, []);
        }

        iposByMonth.get(monthYear)!.push(ipo);
    });

    // Sort IPOs by date within each month
    iposByMonth.forEach(ipos => {
        ipos.sort((a, b) => new Date(a.ipoDate).getTime() - new Date(b.ipoDate).getTime());
    });

    // Format the output
    const sections = [
        // Header
        [
            `== Upcoming IPO Calendar ==`,
            `Total Upcoming IPOs: ${ipoData.data.length}`,
            ``
        ]
    ];

    // Get months in chronological order
    const months = Array.from(iposByMonth.keys()).sort((a, b) => {
        const dateA = new Date(iposByMonth.get(a)![0].ipoDate);
        const dateB = new Date(iposByMonth.get(b)![0].ipoDate);
        return dateA.getTime() - dateB.getTime();
    });

    // Add each month's IPOs
    months.forEach(month => {
        const ipos = iposByMonth.get(month)!;

        sections.push([
            `== ${month} ==`,
            ...ipos.map(ipo => {
                const date = new Date(ipo.ipoDate).toLocaleDateString();
                const priceRange = ipo.priceRangeLow === "0" && ipo.priceRangeHigh === "0"
                    ? "TBD"
                    : `${ipo.priceRangeLow}-${ipo.priceRangeHigh} ${ipo.currency}`;

                return `${date} - ${ipo.symbol} - ${ipo.name} - ${ipo.exchange} - Price Range: ${priceRange}`;
            }),
            ``
        ]);
    });

    return sections
        .filter(section => section.length > 0) // Remove empty sections
        .map(section => section.join('\n'))
        .join('\n');
}

/**
 * Format Alpha Vantage Earnings Calendar data into a readable string
 */
function formatEarningsCalendar(earningsData: EarningsCalendarResponse): string {
    if (earningsData.Information) {
        return `Error: ${earningsData.Information}`;
    }

    if (earningsData.Note) {
        return `Note: ${earningsData.Note}`;
    }

    if (!earningsData.data || earningsData.data.length === 0) {
        return "No upcoming earnings data available";
    }

    // Group earnings by month
    const earningsByMonth = new Map<string, EarningsCalendarEntry[]>();

    earningsData.data.forEach(entry => {
        if (!entry.reportDate) return;

        const date = new Date(entry.reportDate);
        const monthYear = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;

        if (!earningsByMonth.has(monthYear)) {
            earningsByMonth.set(monthYear, []);
        }

        earningsByMonth.get(monthYear)!.push(entry);
    });

    // Sort earnings by date within each month
    earningsByMonth.forEach(entries => {
        entries.sort((a, b) => new Date(a.reportDate).getTime() - new Date(b.reportDate).getTime());
    });

    // Format the output
    const sections = [
        // Header
        [
            `== Upcoming Earnings Calendar ==`,
            `Total Upcoming Earnings Reports: ${earningsData.data.length}`,
            ``
        ]
    ];

    // Get months in chronological order
    const months = Array.from(earningsByMonth.keys()).sort((a, b) => {
        const dateA = new Date(earningsByMonth.get(a)![0].reportDate);
        const dateB = new Date(earningsByMonth.get(b)![0].reportDate);
        return dateA.getTime() - dateB.getTime();
    });

    // Add each month's earnings
    months.forEach(month => {
        const entries = earningsByMonth.get(month)!;

        sections.push([
            `== ${month} ==`,
            ...entries.map(entry => {
                const date = new Date(entry.reportDate).toLocaleDateString();
                const estimateText = entry.estimate ? `Estimate: $${entry.estimate}` : "No estimate available";
                const fiscalPeriod = entry.fiscalDateEnding ? `Fiscal Period: ${entry.fiscalDateEnding}` : "";

                return `${date} - ${entry.symbol} - ${entry.name || entry.symbol} - ${estimateText} - ${fiscalPeriod} - ${entry.currency}`;
            }),
            ``
        ]);
    });

    return sections
        .filter(section => section.length > 0) // Remove empty sections
        .map(section => section.join('\n'))
        .join('\n');
}

/**
 * Register all fundamental data API endpoints with the server
 */
export function registerFundamentalApis(server: McpServer) {
    // Company Overview endpoint
    server.tool(
        "get-company-overview",
        "Get the company information, financial ratios, and other key metrics for a specific stock",
        {
            symbol: z.string().describe("The stock symbol to lookup"),
        },
        async ({ symbol }) => {
            const response = await makeAlphaVantageRequest<CompanyOverviewResponse>({
                function: "OVERVIEW",
                symbol
            });

            if (!response) {
                return {
                    content: [
                        {
                            type: "text",
                            text: "Error: Failed to fetch company overview data."
                        }
                    ]
                };
            }

            return {
                content: [
                    {
                        type: "text",
                        text: formatCompanyOverview(response)
                    }
                ]
            };
        }
    );

    // ETF Profile & Holdings endpoint
    server.tool(
        "get-etf-profile",
        "Get ETF profile, sector allocation, and holdings data for a specific ETF",
        {
            symbol: z.string().describe("The ETF symbol to lookup (e.g., QQQ, SPY, VOO)"),
            show_all_holdings: z.boolean().optional().describe("Set to true to display all holdings instead of just the top 10"),
        },
        async ({ symbol, show_all_holdings }) => {
            const response = await makeAlphaVantageRequest<ETFProfileResponse>({
                function: "ETF_PROFILE",
                symbol
            });

            if (!response) {
                return {
                    content: [
                        {
                            type: "text",
                            text: "Error: Failed to fetch ETF profile data."
                        }
                    ]
                };
            }

            // If user wants to see all holdings, add them all to the output
            if (show_all_holdings && response.holdings && response.holdings.length > 10) {
                const formattedProfile = formatETFProfile(response);

                // Add the remaining holdings
                const allHoldings = [`== All Holdings ==`];
                response.holdings.forEach((holding, index) => {
                    allHoldings.push(`${index + 1}. ${holding.symbol} - ${holding.description || "N/A"}: ${(Number(holding.weight) * 100).toFixed(2)}%`);
                });

                return {
                    content: [
                        {
                            type: "text",
                            text: formattedProfile + "\n\n" + allHoldings.join('\n')
                        }
                    ]
                };
            }

            return {
                content: [
                    {
                        type: "text",
                        text: formatETFProfile(response)
                    }
                ]
            };
        }
    );

    // Dividends Trending endpoint
    server.tool(
        "get-dividends",
        "Get historical and future (declared) dividend distributions for a specific stock",
        {
            symbol: z.string().describe("The stock symbol to lookup"),
            show_all_history: z.boolean().optional().describe("Set to true to display all historical dividends instead of just the recent 10"),
        },
        async ({ symbol, show_all_history }) => {
            const response = await makeAlphaVantageRequest<DividendsResponse>({
                function: "DIVIDENDS",
                symbol
            });

            if (!response) {
                return {
                    content: [
                        {
                            type: "text",
                            text: "Error: Failed to fetch dividend data."
                        }
                    ]
                };
            }

            // If user wants to see all dividend history
            if (show_all_history && response.data && response.data.length > 10) {
                // Get the basic formatted output first
                const formattedDividends = formatDividends(response);

                // Add full dividend history
                const now = new Date();
                const historicalDividends = response.data.filter(div => new Date(div.payment_date) <= now);

                const fullHistory = [
                    `== Complete Dividend History ==`
                ];

                historicalDividends.forEach(div => {
                    fullHistory.push(`Payment: ${div.payment_date} | Ex-Div: ${div.ex_dividend_date} | Declared: ${div.declaration_date} | Amount: $${div.amount}`);
                });

                return {
                    content: [
                        {
                            type: "text",
                            text: formattedDividends + "\n\n" + fullHistory.join('\n')
                        }
                    ]
                };
            }

            return {
                content: [
                    {
                        type: "text",
                        text: formatDividends(response)
                    }
                ]
            };
        }
    );

    // Stock Splits endpoint
    server.tool(
        "get-stock-splits",
        "Get historical stock split events for a specific stock",
        {
            symbol: z.string().describe("The stock symbol to lookup"),
        },
        async ({ symbol }) => {
            const response = await makeAlphaVantageRequest<SplitsResponse>({
                function: "SPLITS",
                symbol
            });

            if (!response) {
                return {
                    content: [
                        {
                            type: "text",
                            text: "Error: Failed to fetch stock split data."
                        }
                    ]
                };
            }

            return {
                content: [
                    {
                        type: "text",
                        text: formatSplits(response)
                    }
                ]
            };
        }
    );

    // Income Statement endpoint
    server.tool(
        "get-income-statement",
        "Get annual and quarterly income statements for a specific company",
        {
            symbol: z.string().describe("The stock symbol to lookup"),
            report_type: z.enum(['annual', 'quarterly']).optional().describe("The type of report to retrieve (default: annual)"),
            limit: z.number().optional().describe("The number of periods to display (default: all available)"),
        },
        async ({ symbol, report_type = 'annual', limit }) => {
            const response = await makeAlphaVantageRequest<IncomeStatementResponse>({
                function: "INCOME_STATEMENT",
                symbol
            });

            if (!response) {
                return {
                    content: [
                        {
                            type: "text",
                            text: "Error: Failed to fetch income statement data."
                        }
                    ]
                };
            }

            // Limit the number of reports if specified
            if (limit && limit > 0) {
                if (report_type === 'annual' && response.annualReports) {
                    response.annualReports = response.annualReports.slice(0, limit);
                } else if (report_type === 'quarterly' && response.quarterlyReports) {
                    response.quarterlyReports = response.quarterlyReports.slice(0, limit);
                }
            }

            return {
                content: [
                    {
                        type: "text",
                        text: formatIncomeStatement(response, report_type)
                    }
                ]
            };
        }
    );

    // Balance Sheet endpoint
    server.tool(
        "get-balance-sheet",
        "Get annual and quarterly balance sheets for a specific company",
        {
            symbol: z.string().describe("The stock symbol to lookup"),
            report_type: z.enum(['annual', 'quarterly']).optional().describe("The type of report to retrieve (default: annual)"),
            limit: z.number().optional().describe("The number of periods to display (default: all available)"),
        },
        async ({ symbol, report_type = 'annual', limit }) => {
            const response = await makeAlphaVantageRequest<BalanceSheetResponse>({
                function: "BALANCE_SHEET",
                symbol
            });

            if (!response) {
                return {
                    content: [
                        {
                            type: "text",
                            text: "Error: Failed to fetch balance sheet data."
                        }
                    ]
                };
            }

            // Limit the number of reports if specified
            if (limit && limit > 0) {
                if (report_type === 'annual' && response.annualReports) {
                    response.annualReports = response.annualReports.slice(0, limit);
                } else if (report_type === 'quarterly' && response.quarterlyReports) {
                    response.quarterlyReports = response.quarterlyReports.slice(0, limit);
                }
            }

            return {
                content: [
                    {
                        type: "text",
                        text: formatBalanceSheet(response, report_type)
                    }
                ]
            };
        }
    );

    // Cash Flow endpoint
    server.tool(
        "get-cash-flow",
        "Get annual and quarterly cash flow statements for a specific company",
        {
            symbol: z.string().describe("The stock symbol to lookup"),
            report_type: z.enum(['annual', 'quarterly']).optional().describe("The type of report to retrieve (default: annual)"),
            limit: z.number().optional().describe("The number of periods to display (default: all available)"),
        },
        async ({ symbol, report_type = 'annual', limit }) => {
            const response = await makeAlphaVantageRequest<CashFlowResponse>({
                function: "CASH_FLOW",
                symbol
            });

            if (!response) {
                return {
                    content: [
                        {
                            type: "text",
                            text: "Error: Failed to fetch cash flow data."
                        }
                    ]
                };
            }

            // Limit the number of reports if specified
            if (limit && limit > 0) {
                if (report_type === 'annual' && response.annualReports) {
                    response.annualReports = response.annualReports.slice(0, limit);
                } else if (report_type === 'quarterly' && response.quarterlyReports) {
                    response.quarterlyReports = response.quarterlyReports.slice(0, limit);
                }
            }

            return {
                content: [
                    {
                        type: "text",
                        text: formatCashFlow(response, report_type)
                    }
                ]
            };
        }
    );

    // Earnings endpoint
    server.tool(
        "get-earnings",
        "Get annual and quarterly earnings (EPS) data for a specific company",
        {
            symbol: z.string().describe("The stock symbol to lookup"),
        },
        async ({ symbol }) => {
            const response = await makeAlphaVantageRequest<EarningsResponse>({
                function: "EARNINGS",
                symbol
            });

            if (!response) {
                return {
                    content: [
                        {
                            type: "text",
                            text: "Error: Failed to fetch earnings data."
                        }
                    ]
                };
            }

            return {
                content: [
                    {
                        type: "text",
                        text: formatEarnings(response)
                    }
                ]
            };
        }
    );

    // IPO Calendar endpoint
    server.tool(
        "get-ipo-calendar",
        "Get a list of upcoming IPOs expected in the next 3 months",
        {},
        async () => {
            try {
                // Use our CSV utility to fetch the data
                const csvData = await makeAlphaVantageCSVRequest({
                    function: "IPO_CALENDAR"
                });

                if (!csvData) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: "Error: Failed to fetch IPO calendar data."
                            }
                        ]
                    };
                }

                // Parse CSV to array of objects using our utility
                // We need to cast the result as the generic type parameter might not be enough
                const parsedData = parseCSV<IPOCalendarEntry>(csvData) as IPOCalendarEntry[];
                const ipoData: IPOCalendarResponse = {
                    data: parsedData
                };

                if (parsedData.length === 0) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: "No upcoming IPO data available or error parsing the response."
                            }
                        ]
                    };
                }

                return {
                    content: [
                        {
                            type: "text",
                            text: formatIPOCalendar(ipoData)
                        }
                    ]
                };
            } catch (error) {
                console.error("Error fetching IPO calendar data:", error);
                return {
                    content: [
                        {
                            type: "text",
                            text: "Error: Failed to fetch IPO calendar data."
                        }
                    ]
                };
            }
        }
    );

    // Earnings Calendar endpoint
    server.tool(
        "get-earnings-calendar",
        "Get a list of company earnings expected in the next 3, 6, or 12 months",
        {
            symbol: z.string().optional().describe("The stock symbol to lookup (e.g., IBM). When not set, returns the full list of company earnings scheduled."),
            horizon: z.enum(["3month", "6month", "12month"]).optional().describe("Time horizon for expected earnings. Options are 3month, 6month, or 12month. Default is 3month."),
        },
        async ({ symbol, horizon }) => {
            try {
                // Build the parameters object
                const params: Record<string, string> = {
                    function: "EARNINGS_CALENDAR"
                };

                // Add optional parameters if provided
                if (symbol) {
                    params.symbol = symbol;
                }

                if (horizon) {
                    params.horizon = horizon;
                }

                // Use our CSV utility to fetch the data
                const csvData = await makeAlphaVantageCSVRequest(params);

                if (!csvData) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: "Error: Failed to fetch earnings calendar data."
                            }
                        ]
                    };
                }

                // Parse CSV to array of objects using our utility
                const parsedData = parseCSV<EarningsCalendarEntry>(csvData);
                const earningsData: EarningsCalendarResponse = {
                    data: parsedData
                };

                if (parsedData.length === 0) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: "No upcoming earnings data available or error parsing the response."
                            }
                        ]
                    };
                }

                return {
                    content: [
                        {
                            type: "text",
                            text: formatEarningsCalendar(earningsData)
                        }
                    ]
                };
            } catch (error) {
                console.error("Error fetching earnings calendar data:", error);
                return {
                    content: [
                        {
                            type: "text",
                            text: "Error: Failed to fetch earnings calendar data."
                        }
                    ]
                };
            }
        }
    );

    // More fundamental data endpoints can be added here in the future
} 