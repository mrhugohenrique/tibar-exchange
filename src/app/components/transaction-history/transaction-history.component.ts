import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormControl,
} from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { CurrencyService } from '../../services/currency.service';
import { MockDataService } from '../../services/mock-data.service';
import { TransactionDetailModalComponent } from '../modais/transaction-detail-modal/transaction-detail-modal.component';
import {
  Transaction,
  Currency,
  FilterOptions,
  PaginationOptions,
} from '../../models/currency.model';
import { TransactionInterface } from './transaction-history.interface';
import { Dialog } from '@angular/cdk/dialog';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-transaction-history',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './transaction-history.component.html',
})
export class TransactionHistoryComponent implements OnInit, OnDestroy {
  private readonly _fb = inject(FormBuilder);
  private readonly _currencyService = inject(CurrencyService);
  private readonly _mockDataService = inject(MockDataService);
  private readonly _toastr = inject(ToastrService);
  private readonly _dialog = inject(Dialog);

  private readonly _destroy$ = new Subject<void>();

  readonly MAX_AMOUNT_LENGTH = 10;
  readonly CURRENCY = Currency;
  readonly CURRENCIES_OPTIONS = [
    { value: Currency.OURO_REAL, label: 'Ouro Real' },
    { value: Currency.TIBAR, label: 'Tibar' },
  ];

  transactions: Transaction[] = [];
  selectedTransaction: Transaction | null = null;
  loading$ = this._currencyService.loading$;
  sameCurrencyError = false;

  filterForm: FormGroup<TransactionInterface> =
    this._fb.group<TransactionInterface>({
      fromCurrency: this._fb.control(this.CURRENCY.OURO_REAL),
      toCurrency: this._fb.control(this.CURRENCY.TIBAR),
      dateFrom: this._fb.control(null),
      dateTo: this._fb.control(null),
      minAmount: this._fb.control(null),
      maxAmount: this._fb.control(null),
    });

  pagination: PaginationOptions = {
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
  };

  ngOnInit() {
    this.loadTransactions();
    this.filterForm.controls.fromCurrency?.valueChanges.subscribe((from) => {
      const toCurrency = this.filterForm.controls.toCurrency.value;
      if (from === toCurrency) {
        this.filterForm.patchValue({
          toCurrency:
            from === this.CURRENCY.OURO_REAL
              ? this.CURRENCY.TIBAR
              : this.CURRENCY.OURO_REAL,
        });
      }
      this.validateSameCurrency();
    });

    this.filterForm.controls.toCurrency.valueChanges.subscribe((to) => {
      const fromCurrency = this.filterForm.controls.fromCurrency.value;
      if (to === fromCurrency) {
        this.filterForm.patchValue({
          fromCurrency:
            to === this.CURRENCY.OURO_REAL
              ? this.CURRENCY.TIBAR
              : this.CURRENCY.OURO_REAL,
        });
      }
      this.validateSameCurrency();
    });
  }

  validateSameCurrency(): void {
    const fromCurrency = this.filterForm.controls.fromCurrency.value;
    const toCurrency = this.filterForm.controls.toCurrency.value;
    this.sameCurrencyError = fromCurrency === toCurrency;
  }

  validateAmountInput(event: Event, control: FormControl<number | null>) {
    const inputElement = event.target as HTMLInputElement;
    let value = inputElement.value;
    value = value.replace(',', '.');

    value = value.replace(/[^0-9.]/g, '');

    const parts = value.split('.');
    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('');
    }

    const numericValue = parseFloat(value);

    if (!isNaN(numericValue)) {
      control.setValue(numericValue, { emitEvent: false });
    } else {
      control.setValue(null, { emitEvent: false });
    }

    inputElement.value = value;
  }

   loadTransactions() {
    const filters = this.buildFilters();

    this._currencyService
      .getTransactions(filters, this.pagination)
      .pipe(takeUntil(this._destroy$))
      .subscribe((result) => {
        this.transactions = result.transactions;
        this.pagination = result.pagination;
      });
  }

  buildFilters(): FilterOptions {
    const formValue = this.filterForm.value;
    const filters: FilterOptions = {};

    if (formValue.fromCurrency !== null) {
      filters.fromCurrency = formValue.fromCurrency as Currency;
    }

    if (formValue.toCurrency !== null) {
      filters.toCurrency = formValue.toCurrency as Currency;
    }

    if (formValue.dateFrom) {
      const parts = formValue.dateFrom.split('-');
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      date.setHours(0, 0, 0, 0);
      filters.dateFrom = date;
    }

    if (formValue.dateTo) {
      const parts = formValue.dateTo.split('-');
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      date.setHours(23, 59, 59, 999);
      filters.dateTo = date;
    }

    if (formValue.minAmount) {
      filters.minAmount = formValue.minAmount;
    }

    if (formValue.maxAmount) {
      filters.maxAmount = formValue.maxAmount;
    }

    return filters;
  }

  handleFilters() {
    const formValue = this.filterForm.value;
    const dateFrom = formValue.dateFrom ? new Date(formValue.dateFrom) : null;
    const dateTo = formValue.dateTo ? new Date(formValue.dateTo) : null;

    if (dateFrom && dateTo && dateFrom.getTime() > dateTo.getTime()) {
      this._toastr.warning(
        'A data de início não pode ser posterior à data de fim.'
      );
      return;
    }

    this.pagination.page = 1;
    this.loadTransactions();
  }

  handleClearFilters() {
    this.filterForm.reset();
    this.filterForm.controls.fromCurrency.setValue(this.CURRENCY.OURO_REAL);
    this.filterForm.controls.toCurrency.setValue(this.CURRENCY.TIBAR);
    this.pagination.page = 1;
    this.loadTransactions();
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.pagination.totalPages) {
      this.pagination.page = page;
      this.loadTransactions();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = 5;
    const currentPage = this.pagination.page;
    const totalPages = this.pagination.totalPages;

    let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(totalPages, startPage + maxPages - 1);

    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  getStartIndex(): number {
    return (this.pagination.page - 1) * this.pagination.pageSize + 1;
  }

  getEndIndex(): number {
    return Math.min(
      this.pagination.page * this.pagination.pageSize,
      this.pagination.totalItems
    );
  }

  openTransactionDetail(transaction: Transaction) {
    this._dialog.open(TransactionDetailModalComponent, {
      data: transaction,
      width: '100%',
      maxWidth: '90vw',
      disableClose: true,
    });
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  getCurrencyName(currency: Currency): string {
    return this._mockDataService.getCurrencyName(currency);
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
