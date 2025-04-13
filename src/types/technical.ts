/**
 * Technical indicator meta data structure
 */
export interface TechnicalMetaData {
    "1: Symbol"?: string;
    "2: Indicator"?: string;
    "3: Last Refreshed"?: string;
    "4: Interval"?: string;
    "5: Time Period"?: number;
    "6: Series Type"?: string;
    "7: Time Zone"?: string;
    [key: string]: any; // For additional flexible fields
}

/**
 * Common structure for single-value technical indicator
 */
export interface SingleValueTechnicalData {
    [key: string]: string; // e.g., "SMA": "123.456"
}

/**
 * Common structure for multi-value technical indicator (like BBANDS)
 */
export interface MultiValueTechnicalData {
    [key: string]: string; // e.g., "Real Upper Band": "123.456"
}

/**
 * Response structure for single-value technical indicator
 */
export interface SingleValueTechnicalResponse {
    "Meta Data"?: TechnicalMetaData;
    [key: string]: any; // For the "Technical Analysis: XYZ" field which varies by indicator
    Information?: string;
    Note?: string;
}

/**
 * Response structure for multi-value technical indicator
 */
export interface MultiValueTechnicalResponse {
    "Meta Data"?: TechnicalMetaData;
    [key: string]: any; // For the "Technical Analysis: XYZ" field which varies by indicator
    Information?: string;
    Note?: string;
}

// Simple Moving Average (SMA)
export type SMAResponse = SingleValueTechnicalResponse;

// Exponential Moving Average (EMA)
export type EMAResponse = SingleValueTechnicalResponse;

// Weighted Moving Average (WMA)
export type WMAResponse = SingleValueTechnicalResponse;

// Double Exponential Moving Average (DEMA)
export type DEMAResponse = SingleValueTechnicalResponse;

// Triple Exponential Moving Average (TEMA)
export type TEMAResponse = SingleValueTechnicalResponse;

// Triangular Moving Average (TRIMA)
export type TRIMAResponse = SingleValueTechnicalResponse;

// Kaufman Adaptive Moving Average (KAMA)
export type KAMAResponse = SingleValueTechnicalResponse;

// MESA Adaptive Moving Average (MAMA)
export type MAMAResponse = MultiValueTechnicalResponse; // Returns MAMA and FAMA

// Volume Weighted Average Price (VWAP)
export type VWAPResponse = SingleValueTechnicalResponse;

// Triple Exponential Moving Average (T3)
export type T3Response = SingleValueTechnicalResponse;

// Moving Average Convergence/Divergence (MACD)
export type MACDResponse = MultiValueTechnicalResponse; // Returns MACD, MACD_Signal, MACD_Hist

// MACD with customizable moving averages (MACDEXT)
export type MACDEXTResponse = MultiValueTechnicalResponse;

// Stochastic Oscillator (STOCH)
export type STOCHResponse = MultiValueTechnicalResponse; // Returns SlowK and SlowD

// Stochastic Fast (STOCHF)
export type STOCHFResponse = MultiValueTechnicalResponse; // Returns FastK and FastD

// Relative Strength Index (RSI)
export type RSIResponse = SingleValueTechnicalResponse;

// Stochastic RSI (STOCHRSI)
export type STOCHRSIResponse = MultiValueTechnicalResponse; // Returns FastK and FastD

// Williams %R (WILLR)
export type WILLRResponse = SingleValueTechnicalResponse;

// Average Directional Movement Index (ADX)
export type ADXResponse = SingleValueTechnicalResponse;

// Average Directional Movement Index Rating (ADXR)
export type ADXRResponse = SingleValueTechnicalResponse;

// Absolute Price Oscillator (APO)
export type APOResponse = SingleValueTechnicalResponse;

// Percentage Price Oscillator (PPO)
export type PPOResponse = SingleValueTechnicalResponse;

// Momentum (MOM)
export type MOMResponse = SingleValueTechnicalResponse;

// Balance of Power (BOP)
export type BOPResponse = SingleValueTechnicalResponse;

// Commodity Channel Index (CCI)
export type CCIResponse = SingleValueTechnicalResponse;

// Chande Momentum Oscillator (CMO)
export type CMOResponse = SingleValueTechnicalResponse;

// Rate of Change (ROC)
export type ROCResponse = SingleValueTechnicalResponse;

// Rate of Change Ratio (ROCR)
export type ROCRResponse = SingleValueTechnicalResponse;

// Aroon (AROON)
export type AROONResponse = MultiValueTechnicalResponse; // Returns Aroon Up and Aroon Down

// Aroon Oscillator (AROONOSC)
export type AROONOSCResponse = SingleValueTechnicalResponse;

// Money Flow Index (MFI)
export type MFIResponse = SingleValueTechnicalResponse;

// Triple Exponential Average (TRIX)
export type TRIXResponse = SingleValueTechnicalResponse;

// Ultimate Oscillator (ULTOSC)
export type ULTOSCResponse = SingleValueTechnicalResponse;

// Directional Movement Index (DX)
export type DXResponse = SingleValueTechnicalResponse;

// Minus Directional Indicator (MINUS_DI)
export type MINUS_DIResponse = SingleValueTechnicalResponse;

// Plus Directional Indicator (PLUS_DI)
export type PLUS_DIResponse = SingleValueTechnicalResponse;

// Minus Directional Movement (MINUS_DM)
export type MINUS_DMResponse = SingleValueTechnicalResponse;

// Plus Directional Movement (PLUS_DM)
export type PLUS_DMResponse = SingleValueTechnicalResponse;

// Bollinger Bands (BBANDS)
export type BBANDSResponse = MultiValueTechnicalResponse; // Returns Upper, Middle, and Lower bands

// MidPoint (MIDPOINT)
export type MIDPOINTResponse = SingleValueTechnicalResponse;

// MidPrice (MIDPRICE)
export type MIDPRICEResponse = SingleValueTechnicalResponse;

// Parabolic SAR (SAR)
export type SARResponse = SingleValueTechnicalResponse;

// True Range (TRANGE)
export type TRANGEResponse = SingleValueTechnicalResponse;

// Average True Range (ATR)
export type ATRResponse = SingleValueTechnicalResponse;

// Normalized Average True Range (NATR)
export type NATRResponse = SingleValueTechnicalResponse;

// Chaikin A/D Line (AD)
export type ADResponse = SingleValueTechnicalResponse;

// Chaikin A/D Oscillator (ADOSC)
export type ADOSCResponse = SingleValueTechnicalResponse;

// On-Balance Volume (OBV)
export type OBVResponse = SingleValueTechnicalResponse;

// Hilbert Transform - Instantaneous Trendline (HT_TRENDLINE)
export type HT_TRENDLINEResponse = SingleValueTechnicalResponse;

// Hilbert Transform - SineWave (HT_SINE)
export type HT_SINEResponse = MultiValueTechnicalResponse; // Returns sine and leadsine

// Hilbert Transform - Trend vs. Cycle Mode (HT_TRENDMODE)
export type HT_TRENDMODEResponse = SingleValueTechnicalResponse;

// Hilbert Transform - Dominant Cycle Period (HT_DCPERIOD)
export type HT_DCPERIODResponse = SingleValueTechnicalResponse;

// Hilbert Transform - Dominant Cycle Phase (HT_DCPHASE)
export type HT_DCPHASEResponse = SingleValueTechnicalResponse;

// Hilbert Transform - Phasor Components (HT_PHASOR)
export type HT_PHASORResponse = MultiValueTechnicalResponse; // Returns quadrature and phase 