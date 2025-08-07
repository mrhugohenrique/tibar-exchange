import { Injectable } from '@angular/core';
import { Currency, CurrencyRate, Transaction } from '../models/currency.model';
import { MOCK_TRANSACTIONS } from '../data/database';

@Injectable({
  providedIn: 'root',
})
export class MockDataService {
  private readonly INITIAL_RATE = 2.5; // 1 Ouro Real = 2.5 Tibares

  getCurrentRate(): CurrencyRate {
    return {
      id: 'current-rate',
      fromCurrency: Currency.OURO_REAL,
      toCurrency: Currency.TIBAR,
      rate: this.INITIAL_RATE,
      lastUpdated: new Date(),
    };
  }

  generateMockTransactions(): Transaction[] {
    return [...MOCK_TRANSACTIONS].sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  getCurrencyName(currency: Currency): string {
    switch (currency) {
      case Currency.OURO_REAL:
        return 'Ouro Real';
      case Currency.TIBAR:
        return 'Tibar';
    }
  }
}
