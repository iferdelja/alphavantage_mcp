/**
 * Common response structure for economic indicator data
 */
export interface EconomicIndicatorResponse {
    name?: string;
    interval?: string;
    unit?: string;
    data?: {
        date: string;
        value: string;
    }[];
    Information?: string; // For error or rate-limit messages
    Note?: string; // For API call frequency messages
}

// Using the same type for all economic indicator endpoints as they share the same structure
export type RealGDPResponse = EconomicIndicatorResponse;
export type RealGDPPerCapitaResponse = EconomicIndicatorResponse;
export type TreasuryYieldResponse = EconomicIndicatorResponse;
export type FederalFundsRateResponse = EconomicIndicatorResponse;
export type CPIResponse = EconomicIndicatorResponse;
export type InflationResponse = EconomicIndicatorResponse;
export type RetailSalesResponse = EconomicIndicatorResponse;
export type DurablesResponse = EconomicIndicatorResponse;
export type UnemploymentResponse = EconomicIndicatorResponse;
export type NonfarmPayrollResponse = EconomicIndicatorResponse; 