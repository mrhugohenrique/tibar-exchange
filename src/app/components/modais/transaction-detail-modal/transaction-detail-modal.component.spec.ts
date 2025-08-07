import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import localePt from '@angular/common/locales/pt';
import { registerLocaleData } from '@angular/common';

import { TransactionDetailModalComponent } from './transaction-detail-modal.component';
import { MockDataService } from '../../../services/mock-data.service';
import { Currency, Transaction } from '../../../models/currency.model';

registerLocaleData(localePt, 'pt-BR');

describe('TransactionDetailModalComponent', () => {
  describe('When a transaction is provided', () => {
    let component: TransactionDetailModalComponent;
    let fixture: ComponentFixture<TransactionDetailModalComponent>;
    let mockDialogRef: jasmine.SpyObj<DialogRef>;
    let mockDataService: MockDataService;

    const mockTransaction: Transaction = {
      id: 'TXN-001',
      fromCurrency: Currency.OURO_REAL,
      toCurrency: Currency.TIBAR,
      fromAmount: 100,
      toAmount: 250,
      rate: 2.5,
      timestamp: new Date('2025-08-15T10:30:00'),
    };

    beforeEach(async () => {
      const dialogRefSpy = jasmine.createSpyObj('DialogRef', ['close']);

      await TestBed.configureTestingModule({
        imports: [TransactionDetailModalComponent],
        providers: [
          { provide: DialogRef, useValue: dialogRefSpy },
          { provide: DIALOG_DATA, useValue: mockTransaction },
          MockDataService,
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(TransactionDetailModalComponent);
      component = fixture.componentInstance;
      mockDialogRef = TestBed.inject(DialogRef) as jasmine.SpyObj<DialogRef>;
      mockDataService = TestBed.inject(MockDataService);

      fixture.detectChanges();
    });

    it('should: create', () => {
      expect(component).toBeTruthy();
    });

    it('should: initialize with transaction data', () => {
      expect(component.transaction).toEqual(mockTransaction);
    });

    it('should: close modal', () => {
      component.handleClose();
      expect(mockDialogRef.close).toHaveBeenCalled();
    });

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

    it('should: unsubscribe on destroy', () => {
      spyOn(component['_destroy$'], 'next');
      spyOn(component['_destroy$'], 'complete');
      component.ngOnDestroy();
      expect(component['_destroy$'].next).toHaveBeenCalled();
      expect(component['_destroy$'].complete).toHaveBeenCalled();
    });
  });

  describe('When no transaction data is provided', () => {
    let emptyFixture: ComponentFixture<TransactionDetailModalComponent>;
    let emptyComponent: TransactionDetailModalComponent;
    let emptyMockDialogRef: jasmine.SpyObj<DialogRef>;

    beforeEach(async () => {
      emptyMockDialogRef = jasmine.createSpyObj('DialogRef', ['close']);

      await TestBed.configureTestingModule({
        imports: [TransactionDetailModalComponent],
        providers: [
          { provide: DialogRef, useValue: emptyMockDialogRef },
          { provide: DIALOG_DATA, useValue: null },
          MockDataService,
        ],
      }).compileComponents();

      emptyFixture = TestBed.createComponent(TransactionDetailModalComponent);
      emptyComponent = emptyFixture.componentInstance;
    });

    it('should: close modal when no transaction data provided', () => {
      spyOn(emptyComponent, 'handleClose').and.callThrough();
      emptyFixture.detectChanges();

      expect(emptyComponent.transaction).toBeNull();
      expect(emptyComponent.handleClose).toHaveBeenCalled();
      expect(emptyMockDialogRef.close).toHaveBeenCalled();
    });
  });
});
