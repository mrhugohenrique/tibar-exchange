import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrService } from 'ngx-toastr';
import { Dialog } from '@angular/cdk/dialog';
import { of, throwError } from 'rxjs';

import { CurrencyConverterComponent } from './currency-converter.component';
import { CurrencyService } from '../../services/currency.service';
import { MockDataService } from '../../services/mock-data.service';
import {
  Currency,
  CurrencyRate,
  ConversionResult,
} from '../../models/currency.model';

import localePt from '@angular/common/locales/pt';
import { registerLocaleData } from '@angular/common';

registerLocaleData(localePt, 'pt-BR');

describe('CurrencyConverterComponent', () => {
  let component: CurrencyConverterComponent;
  let fixture: ComponentFixture<CurrencyConverterComponent>;
  let mockCurrencyService: jasmine.SpyObj<CurrencyService>;
  let mockToastrService: jasmine.SpyObj<ToastrService>;
  let mockDialogService: jasmine.SpyObj<Dialog>;
  let mockDataService: MockDataService;

  const mockRate: CurrencyRate = {
    id: 'TXN-001',
    fromCurrency: Currency.OURO_REAL,
    toCurrency: Currency.TIBAR,
    rate: 2.5,
    lastUpdated: new Date(),
  };

  beforeEach(async () => {
    const currencyServiceSpy = jasmine.createSpyObj(
      'CurrencyService',
      ['convertCurrency'],
      {
        currentRate$: of(mockRate),
        loading$: of(false),
      }
    );

    const toastrServiceSpy = jasmine.createSpyObj('ToastrService', [
      'success',
      'error',
      'warning',
    ]);

    const dialogServiceSpy = jasmine.createSpyObj('Dialog', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        CurrencyConverterComponent,
        ReactiveFormsModule,
        NoopAnimationsModule,
      ],
      providers: [
        { provide: CurrencyService, useValue: currencyServiceSpy },
        { provide: ToastrService, useValue: toastrServiceSpy },
        { provide: Dialog, useValue: dialogServiceSpy },
        MockDataService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CurrencyConverterComponent);
    component = fixture.componentInstance;
    mockCurrencyService = TestBed.inject(
      CurrencyService
    ) as jasmine.SpyObj<CurrencyService>;
    mockToastrService = TestBed.inject(
      ToastrService
    ) as jasmine.SpyObj<ToastrService>;
    mockDialogService = TestBed.inject(Dialog) as jasmine.SpyObj<Dialog>;
    mockDataService = TestBed.inject(MockDataService);

    fixture.detectChanges();
  });

  it('should: create', () => {
    expect(component).toBeTruthy();
  });

  it('should: initialize with default form values', () => {
    expect(component.conversionForm.controls.fromCurrency.value).toBe(
      Currency.OURO_REAL
    );
    expect(component.conversionForm.controls.toCurrency.value).toBe(
      Currency.TIBAR
    );
    expect(component.conversionForm.controls.amount.value).toBe(1);
  });

  it('should: load current rate on init', () => {
    expect(component.currentRate).toEqual(mockRate);
  });

  describe('Currency Validation', () => {
    it('should: prevent same currency selection', () => {
      component.conversionForm.patchValue({
        fromCurrency: Currency.OURO_REAL,
      });

      component.conversionForm.patchValue({
        toCurrency: Currency.OURO_REAL,
      });
      fixture.detectChanges();

      expect(component.conversionForm.controls.fromCurrency.value).toBe(
        Currency.TIBAR
      );
      expect(component.conversionForm.controls.toCurrency.value).toBe(
        Currency.OURO_REAL
      );
    });
  });

  describe('Form Validation', () => {
    it('should: validate required amount', () => {
      component.conversionForm.patchValue({ amount: null });
      component.conversionForm.markAllAsTouched();

      expect(component.conversionForm.controls.amount.hasError('required')).toBe(
        true
      );
    });

    it('should: validate minimum amount', () => {
      component.conversionForm.patchValue({ amount: 0 });
      component.conversionForm.markAllAsTouched();

      expect(component.conversionForm.controls.amount.hasError('min')).toBe(
        true
      );
    });

    it('should: validate maximum amount', () => {
      component.conversionForm.patchValue({ amount: 10000 });
      component.conversionForm.markAllAsTouched();

      expect(component.conversionForm.controls.amount.hasError('max')).toBe(
        true
      );
    });
  });

  describe('Currency Conversion', () => {
    it('should: convert currency successfully', () => {
      const mockResult: ConversionResult = {
        fromAmount: 100,
        toAmount: 250,
        rate: 2.5,
        fromCurrency: Currency.OURO_REAL,
        toCurrency: Currency.TIBAR,
      };

      mockCurrencyService.convertCurrency.and.returnValue(of(mockResult));

      component.conversionForm.patchValue({
        fromCurrency: Currency.OURO_REAL,
        toCurrency: Currency.TIBAR,
        amount: 100,
      });

      component.handleConvert();

      expect(mockCurrencyService.convertCurrency).toHaveBeenCalled();
      expect(component.conversionResult).toEqual(mockResult);
      expect(mockToastrService.success).toHaveBeenCalledWith(
        'Conversão realizada com sucesso!'
      );
    });

    it('should: handle conversion error', () => {
      mockCurrencyService.convertCurrency.and.returnValue(
        throwError(() => 'Erro ao realizar a conversão')
      );

      component.conversionForm.patchValue({
        fromCurrency: Currency.OURO_REAL,
        toCurrency: Currency.TIBAR,
        amount: 100,
      });

      component.handleConvert();

      expect(mockToastrService.error).toHaveBeenCalledWith(
        'Erro ao realizar a conversão'
      );
    });

    it('should: not convert when form is invalid', () => {
      component.conversionForm.patchValue({ amount: -1 });
      component.handleConvert();

      expect(mockCurrencyService.convertCurrency).not.toHaveBeenCalled();
      expect(mockToastrService.warning).toHaveBeenCalledWith(
        'Por favor, corrija os erros no formulário antes de continuar.'
      );
    });

    it('should: not convert when same currency error exists', () => {
      spyOn(component, 'validateSameCurrency').and.callFake(() => {
        component.sameCurrencyError = true;
      });
      component.conversionForm.patchValue({
        fromCurrency: Currency.OURO_REAL,
        toCurrency: Currency.OURO_REAL,
      });

      component.handleConvert();

      expect(mockCurrencyService.convertCurrency).not.toHaveBeenCalled();
      expect(mockToastrService.warning).toHaveBeenCalledWith(
        'Por favor, corrija os erros no formulário antes de continuar.'
      );
    });

    it('should: prevent conversion that would result in 0.00', () => {
      component.currentRate = {
        id: 'test',
        fromCurrency: Currency.OURO_REAL,
        toCurrency: Currency.TIBAR,
        rate: 2.5,
        lastUpdated: new Date(),
      };

      component.conversionForm.patchValue({
        fromCurrency: Currency.TIBAR,
        toCurrency: Currency.OURO_REAL,
        amount: 0.01, 
      });

      component.handleConvert();

      expect(mockCurrencyService.convertCurrency).not.toHaveBeenCalled();
      expect(mockToastrService.warning).toHaveBeenCalledWith(
        'O valor informado é muito pequeno e resultaria em 0,00 após a conversão. Por favor, insira um valor maior.'
      );
    });

    it('should: handle specific error messages from service', () => {
      mockCurrencyService.convertCurrency.and.returnValue(
        throwError(
          () =>
            'O valor informado é muito pequeno e resultaria em 0,00 após a conversão'
        )
      );

      component.conversionForm.patchValue({
        fromCurrency: Currency.OURO_REAL,
        toCurrency: Currency.TIBAR,
        amount: 100,
      });

      component.handleConvert();

      expect(mockToastrService.error).toHaveBeenCalledWith(
        'O valor informado é muito pequeno e resultaria em 0,00 após a conversão'
      );
    });
  });

  describe('Currency Swap', () => {
    it('should: swap currencies', () => {
      component.conversionForm.patchValue({
        fromCurrency: Currency.OURO_REAL,
        toCurrency: Currency.TIBAR,
      });

      component.handleSwapCurrencies();

      expect(component.conversionForm.controls.fromCurrency.value).toBe(
        Currency.TIBAR
      );
      expect(component.conversionForm.controls.toCurrency.value).toBe(
        Currency.OURO_REAL
      );
    });
  });

  describe('Update Rate Modal', () => {
    it('should: open update rate modal', () => {
      component.handleOpenUpdateRateModal();
      expect(mockDialogService.open).toHaveBeenCalled();
    });
  });

  describe('Helper Methods', () => {
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
