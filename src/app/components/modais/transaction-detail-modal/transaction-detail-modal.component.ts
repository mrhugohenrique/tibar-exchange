import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MockDataService } from '../../../services/mock-data.service';
import { Currency, Transaction } from '../../../models/currency.model';
import { Subject } from 'rxjs';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transaction-detail-modal.component.html',
})
export class TransactionDetailModalComponent implements OnInit, OnDestroy {
  private readonly _destroy$ = new Subject<void>();

  private readonly _mockDataService = inject(MockDataService);
  private readonly _dialogRef = inject(DialogRef);
  private readonly _data = inject(DIALOG_DATA) as Transaction;

  transaction: Transaction | null = null;
  ngOnInit(): void {
    if (this._data) {
      this.transaction = this._data;
    } else {
      this.handleClose();
    }
  }

  handleClose() {
    this._dialogRef.close();
  }

  getCurrencyName(currency: Currency): string {
    return this._mockDataService.getCurrencyName(currency);
  }

  formatDate(date: Date | undefined): string {
    if (!date) return 'N/A';
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
