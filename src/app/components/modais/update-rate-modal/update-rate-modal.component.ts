import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from '@angular/forms';
import { Subject, takeUntil, tap, catchError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { DialogRef } from '@angular/cdk/dialog';
import { CurrencyService } from '../../../services/currency.service';
import { CurrencyRate } from '../../../models/currency.model';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './update-rate-modal.component.html',
})
export class UpdateRateModalComponent implements OnInit, OnDestroy {
  private readonly _destroy$ = new Subject<void>();

  private readonly _fb = inject(FormBuilder);
  private readonly _currencyService = inject(CurrencyService);
  private readonly _toastr = inject(ToastrService);
  private readonly _dialogRef = inject(DialogRef);

  currentRate!: CurrencyRate;
  rateForm!: FormGroup<{ newRate: FormControl<number | null> }>;
  loading$ = this._currencyService.loading$;

  get newRateValue(): number {
    return this.rateForm.controls.newRate.value || 0;
  }

  ngOnInit() {
    this._currencyService.currentRate$
      .pipe(takeUntil(this._destroy$))
      .subscribe((rate) => {
        this.currentRate = rate;
      });

    this.rateForm = this._fb.group<{ newRate: FormControl<number | null> }>({
      newRate: this._fb.control(null, [
        Validators.required,
        Validators.min(0.01),
        Validators.max(9999.99),
      ]),
    });
  }

  handleSubmit() {
    this.rateForm.markAllAsTouched();

    if (this.rateForm.valid) {
      const newRate = this.rateForm.controls.newRate.value as number;

      this._currencyService
        .updateRate(newRate)
        .pipe(
          takeUntil(this._destroy$),
          tap((_) => {
            this.handleClose(true);
            this._toastr.success('Taxa atualizada com sucesso');
          }),
          catchError((error) => {
            this._toastr.error('Erro ao atualizar a taxa. Tente novamente mais tarde.');
            return [];
          })
        )
        .subscribe();
    } else {
      this._toastr.warning('Por favor, corrija os erros no formulário');
    }
  }

  // Restante do código...
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

  handleClose(updated: boolean) {
    this._dialogRef.close(updated);
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