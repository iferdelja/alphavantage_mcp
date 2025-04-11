export interface CompanyOverviewResponse {
    // Error responses
    Information?: string;
    Note?: string;

    // Company overview data
    Symbol?: string;
    AssetType?: string;
    Name?: string;
    Description?: string;
    CIK?: string;
    Exchange?: string;
    Currency?: string;
    Country?: string;
    Sector?: string;
    Industry?: string;
    Address?: string;
    OfficialSite?: string;
    FiscalYearEnd?: string;
    LatestQuarter?: string;
    MarketCapitalization?: string;
    EBITDA?: string;
    PERatio?: string;
    PEGRatio?: string;
    BookValue?: string;
    DividendPerShare?: string;
    DividendYield?: string;
    EPS?: string;
    RevenuePerShareTTM?: string;
    ProfitMargin?: string;
    OperatingMarginTTM?: string;
    ReturnOnAssetsTTM?: string;
    ReturnOnEquityTTM?: string;
    RevenueTTM?: string;
    GrossProfitTTM?: string;
    DilutedEPSTTM?: string;
    QuarterlyEarningsGrowthYOY?: string;
    QuarterlyRevenueGrowthYOY?: string;
    AnalystTargetPrice?: string;
    AnalystRatingStrongBuy?: string;
    AnalystRatingBuy?: string;
    AnalystRatingHold?: string;
    AnalystRatingSell?: string;
    AnalystRatingStrongSell?: string;
    TrailingPE?: string;
    ForwardPE?: string;
    PriceToSalesRatioTTM?: string;
    PriceToBookRatio?: string;
    EVToRevenue?: string;
    EVToEBITDA?: string;
    Beta?: string;
    "52WeekHigh"?: string;
    "52WeekLow"?: string;
    "50DayMovingAverage"?: string;
    "200DayMovingAverage"?: string;
    SharesOutstanding?: string;
    DividendDate?: string;
    ExDividendDate?: string;
}

export interface ETFSector {
    sector: string;
    weight: string;
}

export interface ETFHolding {
    symbol: string;
    description: string;
    weight: string;
}

export interface ETFProfileResponse {
    // Error responses
    Information?: string;
    Note?: string;

    // ETF profile data
    net_assets?: string;
    net_expense_ratio?: string;
    portfolio_turnover?: string;
    dividend_yield?: string;
    inception_date?: string;
    leveraged?: string;

    // Sector allocation and holdings
    sectors?: ETFSector[];
    holdings?: ETFHolding[];
}

export interface DividendData {
    ex_dividend_date: string;
    declaration_date: string;
    record_date: string;
    payment_date: string;
    amount: string;
}

export interface DividendsResponse {
    // Error responses
    Information?: string;
    Note?: string;

    // Dividends data
    symbol?: string;
    data?: DividendData[];
}

export interface SplitData {
    effective_date: string;
    split_factor: string;
}

export interface SplitsResponse {
    // Error responses
    Information?: string;
    Note?: string;

    // Splits data
    symbol?: string;
    data?: SplitData[];
}

export interface IncomeStatementReport {
    fiscalDateEnding: string;
    reportedCurrency: string;
    grossProfit: string;
    totalRevenue: string;
    costOfRevenue: string;
    costofGoodsAndServicesSold: string;
    operatingIncome: string;
    sellingGeneralAndAdministrative: string;
    researchAndDevelopment: string;
    operatingExpenses: string;
    investmentIncomeNet: string;
    netInterestIncome: string;
    interestIncome: string;
    interestExpense: string;
    nonInterestIncome: string;
    otherNonOperatingIncome: string;
    depreciation: string;
    depreciationAndAmortization: string;
    incomeBeforeTax: string;
    incomeTaxExpense: string;
    interestAndDebtExpense: string;
    netIncomeFromContinuingOperations: string;
    comprehensiveIncomeNetOfTax: string;
    ebit: string;
    ebitda: string;
    netIncome: string;
}

export interface IncomeStatementResponse {
    // Error responses
    Information?: string;
    Note?: string;

    // Income statement data
    symbol?: string;
    annualReports?: IncomeStatementReport[];
    quarterlyReports?: IncomeStatementReport[];
}

export interface BalanceSheetReport {
    fiscalDateEnding: string;
    reportedCurrency: string;
    totalAssets: string;
    totalCurrentAssets: string;
    cashAndCashEquivalentsAtCarryingValue: string;
    cashAndShortTermInvestments: string;
    inventory: string;
    currentNetReceivables: string;
    totalNonCurrentAssets: string;
    propertyPlantEquipment: string;
    accumulatedDepreciationAmortizationPPE: string;
    intangibleAssets: string;
    intangibleAssetsExcludingGoodwill: string;
    goodwill: string;
    investments: string;
    longTermInvestments: string;
    shortTermInvestments: string;
    otherCurrentAssets: string;
    otherNonCurrentAssets: string;
    totalLiabilities: string;
    totalCurrentLiabilities: string;
    currentAccountsPayable: string;
    deferredRevenue: string;
    currentDebt: string;
    shortTermDebt: string;
    totalNonCurrentLiabilities: string;
    capitalLeaseObligations: string;
    longTermDebt: string;
    currentLongTermDebt: string;
    longTermDebtNoncurrent: string;
    shortLongTermDebtTotal: string;
    otherCurrentLiabilities: string;
    otherNonCurrentLiabilities: string;
    totalShareholderEquity: string;
    treasuryStock: string;
    retainedEarnings: string;
    commonStock: string;
    commonStockSharesOutstanding: string;
}

export interface BalanceSheetResponse {
    // Error responses
    Information?: string;
    Note?: string;

    // Balance sheet data
    symbol?: string;
    annualReports?: BalanceSheetReport[];
    quarterlyReports?: BalanceSheetReport[];
}

export interface CashFlowReport {
    fiscalDateEnding: string;
    reportedCurrency: string;
    operatingCashflow: string;
    paymentsForOperatingActivities: string;
    proceedsFromOperatingActivities: string;
    changeInOperatingLiabilities: string;
    changeInOperatingAssets: string;
    depreciationDepletionAndAmortization: string;
    capitalExpenditures: string;
    changeInReceivables: string;
    changeInInventory: string;
    profitLoss: string;
    cashflowFromInvestment: string;
    cashflowFromFinancing: string;
    proceedsFromRepaymentsOfShortTermDebt: string;
    paymentsForRepurchaseOfCommonStock: string;
    paymentsForRepurchaseOfEquity: string;
    paymentsForRepurchaseOfPreferredStock: string;
    dividendPayout: string;
    dividendPayoutCommonStock: string;
    dividendPayoutPreferredStock: string;
    proceedsFromIssuanceOfCommonStock: string;
    proceedsFromIssuanceOfLongTermDebtAndCapitalSecuritiesNet: string;
    proceedsFromIssuanceOfPreferredStock: string;
    proceedsFromRepurchaseOfEquity: string;
    proceedsFromSaleOfTreasuryStock: string;
    changeInCashAndCashEquivalents: string;
    changeInExchangeRate: string;
    netIncome: string;
}

export interface CashFlowResponse {
    // Error responses
    Information?: string;
    Note?: string;

    // Cash flow data
    symbol?: string;
    annualReports?: CashFlowReport[];
    quarterlyReports?: CashFlowReport[];
}

export interface AnnualEarning {
    fiscalDateEnding: string;
    reportedEPS: string;
}

export interface QuarterlyEarning {
    fiscalDateEnding: string;
    reportedDate: string;
    reportedEPS: string;
    estimatedEPS: string;
    surprise: string;
    surprisePercentage: string;
}

export interface EarningsResponse {
    // Error responses
    Information?: string;
    Note?: string;

    // Earnings data
    symbol?: string;
    annualEarnings?: AnnualEarning[];
    quarterlyEarnings?: QuarterlyEarning[];
}

export interface IPOCalendarEntry {
    symbol: string;
    name: string;
    ipoDate: string;
    priceRangeLow: string;
    priceRangeHigh: string;
    currency: string;
    exchange: string;
}

export interface IPOCalendarResponse {
    // Error responses
    Information?: string;
    Note?: string;

    // IPO Calendar data in CSV format (processed into an array)
    data?: IPOCalendarEntry[];
}

export interface EarningsCalendarEntry {
    symbol: string;
    name: string;
    reportDate: string;
    fiscalDateEnding: string;
    estimate: string;
    currency: string;
}

export interface EarningsCalendarResponse {
    // Error responses
    Information?: string;
    Note?: string;

    // Earnings Calendar data in CSV format (processed into an array)
    data?: EarningsCalendarEntry[];
} 