/**
 * Common response structure for commodities data
 */
export interface CommodityResponse {
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

// Using the same type for all commodity endpoints as they share the same structure
export type WTIResponse = CommodityResponse;
export type BrentResponse = CommodityResponse;
export type NaturalGasResponse = CommodityResponse;
export type CopperResponse = CommodityResponse;
export type AluminumResponse = CommodityResponse;
export type WheatResponse = CommodityResponse;
export type CornResponse = CommodityResponse;
export type CottonResponse = CommodityResponse;
export type SugarResponse = CommodityResponse;
export type CoffeeResponse = CommodityResponse;
export type GlobalCommoditiesIndexResponse = CommodityResponse; 