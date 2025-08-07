import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, shareReplay } from 'rxjs';
import {
  Currency,
  CurrencyRate,
  Transaction,
  ConversionRequest,
  ConversionResult,
  FilterOptions,
  PaginationOptions,
} from '../models/currency.model';
import { MockDataService } from './mock-data.service';

@Injectable({
  providedIn: 'root',
})
export class CurrencyService {
  private mockDataService = inject(MockDataService);

  private currentRateSubject = new BehaviorSubject<CurrencyRate>(
    this.mockDataService.getCurrentRate()
  );
  private transactionsSubject = new BehaviorSubject<Transaction[]>(
    this.mockDataService.generateMockTransactions()
  );
  private loadingSubject = new BehaviorSubject<boolean>(false);

  public currentRate$ = this.currentRateSubject
    .asObservable()
    .pipe(shareReplay(1));

  public loading$ = this.loadingSubject.asObservable();

  updateRate(newRate: number): Observable<CurrencyRate> {
    this.loadingSubject.next(true);

    return new Observable((observer) => {
      setTimeout(() => {
        if (newRate <= 0) {
          this.loadingSubject.next(false);
          observer.error('Taxa deve ser maior que zero');
          return;
        }

        const updatedRate: CurrencyRate = {
          id: 'current-rate',
          fromCurrency: Currency.OURO_REAL,
          toCurrency: Currency.TIBAR,
          rate: newRate,
          lastUpdated: new Date(),
        };

        this.currentRateSubject.next(updatedRate);
        this.loadingSubject.next(false);
        observer.next(updatedRate);
        observer.complete();
      }, 1000);
    });
  }

  convertCurrency(request: ConversionRequest): Observable<ConversionResult> {
    this.loadingSubject.next(true);

    return new Observable((observer) => {
      setTimeout(() => {
        const currentRate = this.currentRateSubject.value.rate;
        let convertedAmount: number;

        if (
          request.fromCurrency === Currency.OURO_REAL &&
          request.toCurrency === Currency.TIBAR
        ) {
          convertedAmount = request.amount * currentRate;
        } else if (
          request.fromCurrency === Currency.TIBAR &&
          request.toCurrency === Currency.OURO_REAL
        ) {
          convertedAmount = request.amount / currentRate;
        } else {
          this.loadingSubject.next(false);
          observer.error('Conversão inválida');
          return;
        }

        // Verificar se o resultado seria 0 após arredondamento
        const roundedAmount = Math.round(convertedAmount * 100) / 100;
        if (roundedAmount === 0) {
          this.loadingSubject.next(false);
          observer.error(
            'O valor informado é muito pequeno e resultaria em 0,00 após a conversão'
          );
          return;
        }

        const result: ConversionResult = {
          fromAmount: request.amount,
          toAmount: roundedAmount,
          rate: currentRate,
          fromCurrency: request.fromCurrency,
          toCurrency: request.toCurrency,
        };

        const transaction: Transaction = {
          id: `TXN-${String(Date.now()).slice(-8).padStart(4, '0')}`,
          fromCurrency: request.fromCurrency,
          toCurrency: request.toCurrency,
          fromAmount: request.amount,
          toAmount: result.toAmount,
          rate: currentRate,
          timestamp: new Date(),
        };

        const currentTransactions = this.transactionsSubject.value;
        this.transactionsSubject.next([transaction, ...currentTransactions]);

        this.loadingSubject.next(false);
        observer.next(result);
        observer.complete();
      }, 2000);
    });
  }

  getTransactions(
    filters?: FilterOptions,
    pagination?: PaginationOptions
  ): Observable<{
    transactions: Transaction[];
    pagination: PaginationOptions;
  }> {
    this.loadingSubject.next(true);
    return new Observable((observer) => {
      setTimeout(() => {
        let filteredTransactions = [...this.transactionsSubject.value];
        if (filters) {
          if (filters.fromCurrency) {
            filteredTransactions = filteredTransactions.filter(
              (t) => t.fromCurrency === filters.fromCurrency
            );
          }
          if (filters.toCurrency) {
            filteredTransactions = filteredTransactions.filter(
              (t) => t.toCurrency === filters.toCurrency
            );
          }

          if (filters.dateFrom) {
            filteredTransactions = filteredTransactions.filter((t) => {
              return t.timestamp.getTime() >= filters.dateFrom!.getTime();
            });
          }

          if (filters.dateTo) {
            filteredTransactions = filteredTransactions.filter((t) => {
              return t.timestamp.getTime() <= filters.dateTo!.getTime();
            });
          }

          if (filters.minAmount) {
            filteredTransactions = filteredTransactions.filter(
              (t) => t.fromAmount >= filters.minAmount!
            );
          }
          if (filters.maxAmount) {
            filteredTransactions = filteredTransactions.filter(
              (t) => t.fromAmount <= filters.maxAmount!
            );
          }
        }

        const pageSize = pagination?.pageSize || 10;
        const page = pagination?.page || 1;
        const totalItems = filteredTransactions.length;
        const totalPages = Math.ceil(totalItems / pageSize);
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedTransactions = filteredTransactions.slice(
          startIndex,
          endIndex
        );

        const result = {
          transactions: paginatedTransactions,
          pagination: {
            page,
            pageSize,
            totalItems,
            totalPages,
          },
        };

        this.loadingSubject.next(false);
        observer.next(result);
        observer.complete();
      }, 500);
    });
  }
}
