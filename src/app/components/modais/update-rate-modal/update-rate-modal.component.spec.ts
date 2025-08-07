import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrService } from 'ngx-toastr';
import { DialogRef } from '@angular/cdk/dialog';
import { of, throwError } from 'rxjs';

import { UpdateRateModalComponent } from './update-rate-modal.component';
import { CurrencyService } from '../../../services/currency.service';
import { Currency, CurrencyRate } from '../../../models/currency.model';

describe('UpdateRateModalComponent', () => {
  let component: UpdateRateModalComponent;
  let fixture: ComponentFixture<UpdateRateModalComponent>;
  let mockCurrencyService: jasmine.SpyObj<CurrencyService>;
  let mockToastrService: jasmine.SpyObj<ToastrService>;
  let mockDialogRef: jasmine.SpyObj<DialogRef>;

  const mockRate: CurrencyRate = {
    id: 'test-rate',
    fromCurrency: Currency.OURO_REAL,
    toCurrency: Currency.TIBAR,
    rate: 2.5,
    lastUpdated: new Date('2025-08-15T10:30:00'),
  };

  beforeEach(async () => {
    const currencyServiceSpy = jasmine.createSpyObj(
      'CurrencyService',
      ['updateRate'],
      {
        currentRate$: of(mockRate),
        loading$: of(false),
      }
    );

    const toastrServiceSpy = jasmine.createSpyObj('ToastrService', [
      'success',
      'warning',
      'error',
    ]);

    const dialogRefSpy = jasmine.createSpyObj('DialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [
        UpdateRateModalComponent,
        ReactiveFormsModule,
        NoopAnimationsModule,
      ],
      providers: [
        { provide: CurrencyService, useValue: currencyServiceSpy },
        { provide: ToastrService, useValue: toastrServiceSpy },
        { provide: DialogRef, useValue: dialogRefSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UpdateRateModalComponent);
    component = fixture.componentInstance;
    mockCurrencyService = TestBed.inject(
      CurrencyService
    ) as jasmine.SpyObj<CurrencyService>;
    mockToastrService = TestBed.inject(
      ToastrService
    ) as jasmine.SpyObj<ToastrService>;
    mockDialogRef = TestBed.inject(DialogRef) as jasmine.SpyObj<DialogRef>;

    fixture.detectChanges();
  });

  it('should: create', () => {
    expect(component).toBeTruthy();
  });

  it('should: initialize with current rate', () => {
    expect(component.currentRate).toEqual(mockRate);
  });

  it('should: initialize rate form with validation', () => {
    expect(component.rateForm).toBeTruthy();
    expect(component.rateForm.controls.newRate.hasError('required')).toBe(true);
  });

  describe('Form Validation', () => {
    it('should: validate required new rate', () => {
      component.rateForm.patchValue({ newRate: null });
      component.rateForm.markAllAsTouched();

      expect(component.rateForm.controls.newRate.hasError('required')).toBe(
        true
      );
    });

    it('should: validate minimum rate', () => {
      component.rateForm.patchValue({ newRate: 0 });
      component.rateForm.markAllAsTouched();

      expect(component.rateForm.controls.newRate.hasError('min')).toBe(true);
    });

    it('should: validate maximum rate', () => {
      component.rateForm.patchValue({ newRate: 10000 });
      component.rateForm.markAllAsTouched();

      expect(component.rateForm.controls.newRate.hasError('max')).toBe(true);
    });

    it('should: accept valid rate', () => {
      component.rateForm.patchValue({ newRate: 3.0 });

      expect(component.rateForm.controls.newRate.valid).toBe(true);
    });
  });

  describe('Rate Update', () => {
    it('should: handle update error', () => {
      const newRate = 3.0;

      mockCurrencyService.updateRate.and.returnValue(
        throwError(() => 'Erro na atualização')
      );
      component.rateForm.patchValue({ newRate });

      component.handleSubmit();

      expect(mockCurrencyService.updateRate).toHaveBeenCalledWith(newRate);
      expect(mockToastrService.success).not.toHaveBeenCalled();
      expect(mockToastrService.error).toHaveBeenCalledWith(
        'Erro ao atualizar a taxa. Tente novamente mais tarde.'
      );
      expect(mockDialogRef.close).not.toHaveBeenCalled();
    });

    it('should: update rate successfully', () => {
      const newRate = 3.0;
      const updatedRate: CurrencyRate = { ...mockRate, rate: newRate };

      mockCurrencyService.updateRate.and.returnValue(of(updatedRate));
      component.rateForm.patchValue({ newRate });

      component.handleSubmit();

      expect(mockCurrencyService.updateRate).toHaveBeenCalledWith(newRate);
      expect(mockToastrService.success).toHaveBeenCalledWith(
        'Taxa atualizada com sucesso'
      );
      expect(mockDialogRef.close).toHaveBeenCalledWith(true);
    });

    it('should: handle update error', () => {
      const newRate = 3.0;

      mockCurrencyService.updateRate.and.returnValue(
        throwError(() => 'Erro na atualização')
      );
      component.rateForm.patchValue({ newRate });

      component.handleSubmit();

      expect(mockCurrencyService.updateRate).toHaveBeenCalledWith(newRate);
      expect(mockToastrService.success).not.toHaveBeenCalled();
      expect(mockDialogRef.close).not.toHaveBeenCalled();
    });

    it('should: not update when form is invalid', () => {
      component.rateForm.patchValue({ newRate: -1 });

      component.handleSubmit();

      expect(mockCurrencyService.updateRate).not.toHaveBeenCalled();
      expect(mockToastrService.warning).toHaveBeenCalledWith(
        'Por favor, corrija os erros no formulário'
      );
    });
  });

  describe('Modal Actions', () => {
    it('should: close modal with updated flag', () => {
      component.handleClose(true);

      expect(mockDialogRef.close).toHaveBeenCalledWith(true);
    });

    it('should: close modal without updated flag', () => {
      component.handleClose(false);

      expect(mockDialogRef.close).toHaveBeenCalledWith(false);
    });
  });

  describe('Date Formatting', () => {
    it('should: format date correctly', () => {
      const date = new Date('2025-08-15T10:30:00');
      const formatted = component.formatDate(date);

      expect(formatted).toContain('15/08/2025');
      expect(formatted).toContain('10:30');
    });

    it('should: handle undefined date', () => {
      const formatted = component.formatDate(undefined);

      expect(formatted).toBe('N/A');
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
