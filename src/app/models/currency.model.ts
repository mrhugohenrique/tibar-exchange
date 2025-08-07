export interface CurrencyRate {
  id: string;
  fromCurrency: Currency;
  toCurrency: Currency;
  rate: number;
  lastUpdated: Date;
}

export interface Transaction {
  id: string;
  fromCurrency: Currency;
  toCurrency: Currency;
  fromAmount: number;
  toAmount: number;
  rate: number;
  timestamp: Date;
}

export interface ConversionRequest {
  fromCurrency: Currency;
  toCurrency: Currency;
  amount: number;
}

export interface ConversionResult {
  fromAmount: number;
  toAmount: number;
  rate: number;
  fromCurrency: Currency;
  toCurrency: Currency;
}

export enum Currency {
  OURO_REAL = 1,
  TIBAR = 2
}

export interface FilterOptions {
  fromCurrency?: Currency;
  toCurrency?: Currency;
  dateFrom?: Date;
  dateTo?: Date;
  minAmount?: number;
  maxAmount?: number;
}

export interface PaginationOptions {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}