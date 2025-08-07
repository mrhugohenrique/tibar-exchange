import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Dialog } from '@angular/cdk/dialog';
import { of } from 'rxjs';
import localePt from '@angular/common/locales/pt';
import { registerLocaleData } from '@angular/common';

import { TransactionHistoryComponent } from './transaction-history.component';
import { CurrencyService } from '../../services/currency.service';
import { MockDataService } from '../../services/mock-data.service';
import {
  Currency,
  Transaction,
  PaginationOptions,
} from '../../models/currency.model';
import { ToastrService } from 'ngx-toastr';

registerLocaleData(localePt, 'pt-BR');

describe('TransactionHistoryComponent', () => {
  let component: TransactionHistoryComponent;
  let fixture: ComponentFixture<TransactionHistoryComponent>;
  let mockCurrencyService: jasmine.SpyObj<CurrencyService>;
  let mockToastrService: jasmine.SpyObj<ToastrService>;
  let mockDialogService: jasmine.SpyObj<Dialog>;
  let mockDataService: MockDataService;

  const mockTransactions: Transaction[] = [
    {
      id: 'TXN-001',
      fromCurrency: Currency.OURO_REAL,
      toCurrency: Currency.TIBAR,
      fromAmount: 100,
      toAmount: 250,
      rate: 2.5,
      timestamp: new Date('2025-08-15T10:30:00'),
    },
    {
      id: 'TXN-002',
      fromCurrency: Currency.TIBAR,
      toCurrency: Currency.OURO_REAL,
      fromAmount: 500,
      toAmount: 200,
      rate: 2.5,
      timestamp: new Date('2025-08-16T14:45:00'),
    },
  ];

  const mockPagination: PaginationOptions = {
    page: 1,
    pageSize: 10,
    totalItems: 2,
    totalPages: 1,
  };

  beforeEach(async () => {
    const currencyServiceSpy = jasmine.createSpyObj(
      'CurrencyService',
      ['getTransactions'],
      {
        loading$: of(false),
      }
    );

    const dialogServiceSpy = jasmine.createSpyObj('Dialog', ['open']);
    const toastrServiceSpy = jasmine.createSpyObj('ToastrService', ['warning']);

    await TestBed.configureTestingModule({
      imports: [
        TransactionHistoryComponent,
        ReactiveFormsModule,
        NoopAnimationsModule,
      ],
      providers: [
        { provide: CurrencyService, useValue: currencyServiceSpy },
        { provide: Dialog, useValue: dialogServiceSpy },
        { provide: ToastrService, useValue: toastrServiceSpy },
        MockDataService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TransactionHistoryComponent);
    component = fixture.componentInstance;
    mockCurrencyService = TestBed.inject(
      CurrencyService
    ) as jasmine.SpyObj<CurrencyService>;
    mockDialogService = TestBed.inject(Dialog) as jasmine.SpyObj<Dialog>;
    mockToastrService = TestBed.inject(
      ToastrService
    ) as jasmine.SpyObj<ToastrService>;
    mockDataService = TestBed.inject(MockDataService);

    mockCurrencyService.getTransactions.and.returnValue(
      of({
        transactions: mockTransactions,
        pagination: mockPagination,
      })
    );

    fixture.detectChanges();
  });

  it('should: create', () => {
    expect(component).toBeTruthy();
  });

  it('should: initialize filter form', () => {
    expect(component.filterForm).toBeTruthy();
    expect(component.filterForm.controls.fromCurrency).toBeTruthy();
    expect(component.filterForm.controls.toCurrency).toBeTruthy();
    expect(component.filterForm.controls.dateFrom).toBeTruthy();
    expect(component.filterForm.controls.dateTo).toBeTruthy();
    expect(component.filterForm.controls.minAmount).toBeTruthy();
    expect(component.filterForm.controls.maxAmount).toBeTruthy();
  });

  it('should: load transactions on init', () => {
    expect(mockCurrencyService.getTransactions).toHaveBeenCalled();
    expect(component.transactions).toEqual(mockTransactions);
    expect(component.pagination).toEqual(mockPagination);
  });

  describe('Filter Management', () => {
    it('should: clear filters', () => {
      component.filterForm.patchValue({
        fromCurrency: Currency.OURO_REAL,
        dateFrom: '2025-01-15',
      });

      component.handleClearFilters();

      expect(component.filterForm.controls.fromCurrency.value).toBe(
        Currency.OURO_REAL
      );
      expect(component.filterForm.controls.toCurrency.value).toBe(
        Currency.TIBAR
      );
      expect(component.filterForm.controls.dateFrom.value).toBeNull();
      expect(component.pagination.page).toBe(1);
    });

    it('should: apply filters and reset pagination', () => {
      component.pagination.page = 3;
      component.filterForm.patchValue({ fromCurrency: Currency.OURO_REAL });

      component.handleFilters();

      expect(component.pagination.page).toBe(1);
      expect(mockCurrencyService.getTransactions).toHaveBeenCalled();
    });
  });

  describe('Filter Building', () => {
    it('should: build filters from form values', () => {
      component.filterForm.patchValue({
        fromCurrency: 1,
        dateFrom: '2025-08-15',
        dateTo: '2025-08-20',
        minAmount: 50,
        maxAmount: 500,
      });

      const filters = component.buildFilters();

      expect(filters.fromCurrency).toBe(1);
      expect(filters.dateFrom).toBeInstanceOf(Date);
      expect(filters.dateTo).toBeInstanceOf(Date);
      expect(filters.minAmount).toBe(50);
      expect(filters.maxAmount).toBe(500);

      expect(filters.dateFrom?.getDate()).toBe(15);
      expect(filters.dateFrom?.getMonth()).toBe(7);
      expect(filters.dateFrom?.getFullYear()).toBe(2025);

      expect(filters.dateTo?.getDate()).toBe(20);
      expect(filters.dateTo?.getMonth()).toBe(7);
      expect(filters.dateTo?.getFullYear()).toBe(2025);
    });
  });

  describe('Pagination', () => {
    beforeEach(() => {
      component.pagination = {
        page: 2,
        pageSize: 10,
        totalItems: 50,
        totalPages: 5,
      };
    });

    it('should: go to specific page', () => {
      component.goToPage(3);

      expect(component.pagination.page).toBe(1);
      expect(mockCurrencyService.getTransactions).toHaveBeenCalled();
    });

    it('should: not go to invalid page numbers', () => {
      const originalPage = component.pagination.page;

      component.goToPage(0);
      expect(component.pagination.page).toBe(originalPage);

      component.goToPage(10);
      expect(component.pagination.page).toBe(originalPage);
    });

    it('should: generate correct page numbers', () => {
      const pages = component.getPageNumbers();

      expect(pages).toContain(1);
      expect(pages).toContain(2);
      expect(pages).toContain(3);
      expect(pages.length).toBeLessThanOrEqual(5);
    });

    it('should: calculate start index correctly', () => {
      expect(component.getStartIndex()).toBe(11);
    });

    it('should: calculate end index correctly', () => {
      expect(component.getEndIndex()).toBe(20);
    });
  });

  describe('Transaction Detail Modal', () => {
    it('should: open transaction detail modal', () => {
      const transaction = mockTransactions[0];

      component.openTransactionDetail(transaction);

      expect(mockDialogService.open).toHaveBeenCalled();
    });
  });

  describe('Helper Methods', () => {
    it('should: format date correctly', () => {
      const date = new Date('2025-08-15T10:30:00');
      const formatted = component.formatDate(date);

      expect(formatted).toContain('15/08/2025');
      expect(formatted).toContain('10:30');
    });

    it('should: get currency name', () => {
      spyOn(mockDataService, 'getCurrencyName').and.returnValue('Ouro Real');

      const name = component.getCurrencyName(Currency.OURO_REAL);

      expect(name).toBe('Ouro Real');
      expect(mockDataService.getCurrencyName).toHaveBeenCalledWith(
        Currency.OURO_REAL
      );
    });
  });

  describe('Component Lifecycle', () => {
    it('should: unsubscribe on destroy', () => {
      spyOn(component['_destroy$'], 'next');
      spyOn(component['_destroy$'], 'complete');

      component.ngOnDestroy();

      expect(component['_destroy$'].next).toHaveBeenCalled();
      expect(component['_destroy$'].complete).toHaveBeenCalled();
    });
  });
});
