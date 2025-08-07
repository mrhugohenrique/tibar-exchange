import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';
import { catchError, Subject, takeUntil, tap } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { CurrencyService } from '../../services/currency.service';
import { MockDataService } from '../../services/mock-data.service';
import {
  Currency,
  CurrencyRate,
  ConversionRequest,
  ConversionResult,
} from '../../models/currency.model';
import { CurrencyConverterInterface } from './currency-converter.interface';
import { Dialog } from '@angular/cdk/dialog';
import { UpdateRateModalComponent } from '../modais/update-rate-modal/update-rate-modal.component';

@Component({
  selector: 'app-currency-converter',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './currency-converter.component.html',
})
export class CurrencyConverterComponent implements OnInit, OnDestroy {
  private readonly _fb = inject(FormBuilder);
  private readonly _currencyService = inject(CurrencyService);
  private readonly _mockDataService = inject(MockDataService);
  private readonly _toastr = inject(ToastrService);
  private readonly _dialog = inject(Dialog);

  private readonly _destroy$ = new Subject<void>();

  readonly CURRENCY = Currency;
    readonly CURRENCIES_OPTIONS = [
    { value: Currency.OURO_REAL, label: 'Ouro Real' },
    { value: Currency.TIBAR, label: 'Tibar' },
  ];

  currentRate: CurrencyRate | null = null;
  conversionResult: ConversionResult | null = null;
  loading$ = this._currencyService.loading$;

  conversionForm = this._fb.group<CurrencyConverterInterface>({
    fromCurrency: this._fb.control(Currency.OURO_REAL, Validators.required),
    toCurrency: this._fb.control<Currency>(Currency.TIBAR, Validators.required),
    amount: this._fb.control<number>(1, [
      Validators.required,
      Validators.min(1),
      Validators.max(9999.99),
    ]),
  });

  sameCurrencyError = false;

  ngOnInit(): void {
    this._currencyService.currentRate$
      .pipe(takeUntil(this._destroy$))
      .subscribe((rate) => {
        this.currentRate = rate;
      });

    this.conversionForm.controls.fromCurrency?.valueChanges.subscribe(
      (from) => {
        const toCurrency = this.conversionForm.controls.toCurrency.value;
        if (from === toCurrency) {
          this.conversionForm.patchValue({
            toCurrency:
              from === this.CURRENCY.OURO_REAL
                ? this.CURRENCY.TIBAR
                : this.CURRENCY.OURO_REAL,
          });
        }
        this.validateSameCurrency();
      }
    );

    this.conversionForm.controls.toCurrency.valueChanges.subscribe((to) => {
      const fromCurrency = this.conversionForm.controls.fromCurrency.value;
      if (to === fromCurrency) {
        this.conversionForm.patchValue({
          fromCurrency:
            to === this.CURRENCY.OURO_REAL
              ? this.CURRENCY.TIBAR
              : this.CURRENCY.OURO_REAL,
        });
      }
      this.validateSameCurrency();
    });
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

  validateSameCurrency(): void {
    const fromCurrency = this.conversionForm.controls.fromCurrency.value;
    const toCurrency = this.conversionForm.controls.toCurrency.value;
    this.sameCurrencyError = fromCurrency === toCurrency;
  }

  handleConvert() {
    this.conversionForm.markAllAsTouched();

    const amount = this.conversionForm.controls.amount.value as number;
    const fromCurrency = this.conversionForm.controls.fromCurrency
      .value as Currency;
    const toCurrency = this.conversionForm.controls.toCurrency
      .value as Currency;

    if (amount && this.currentRate) {
      let convertedAmount: number;
      if (
        fromCurrency === Currency.OURO_REAL &&
        toCurrency === Currency.TIBAR
      ) {
        convertedAmount = amount * this.currentRate.rate;
      } else {
        convertedAmount = amount / this.currentRate.rate;
      }

      if (Math.round(convertedAmount * 100) / 100 === 0) {
        this._toastr.warning(
          'O valor informado é muito pequeno e resultaria em 0,00 após a conversão. Por favor, insira um valor maior.'
        );
        return;
      }
    }

    if (this.conversionForm.invalid || this.sameCurrencyError) {
      this._toastr.warning(
        'Por favor, corrija os erros no formulário antes de continuar.'
      );
      return;
    }

    if (this.conversionForm.valid && !this.sameCurrencyError) {
      const request: ConversionRequest = {
        fromCurrency,
        toCurrency,
        amount,
      };

      this._currencyService
        .convertCurrency(request)
        .pipe(
          takeUntil(this._destroy$),
          tap((result) => {
            this.conversionResult = result;
            this._toastr.success('Conversão realizada com sucesso!');
          }),
          catchError((error) => {
            this._toastr.error(
              typeof error === 'string' ? error : 'Erro ao realizar a conversão'
            );
            return [];
          })
        )
        .subscribe();
    }
  }

  handleSwapCurrencies(): void {
    const fromCurrency = this.conversionForm.controls.fromCurrency.value;
    const toCurrency = this.conversionForm.controls.toCurrency.value;

    this.conversionForm.patchValue({
      fromCurrency: toCurrency,
      toCurrency: fromCurrency,
    });
  }

  handleOpenUpdateRateModal() {
    this._dialog.open(UpdateRateModalComponent, {
      data: this.currentRate,
      width: '100%',
      maxWidth: '90vw',
      disableClose: true,
    });
  }

  getCurrencyName(currency: Currency): string {
    return this._mockDataService.getCurrencyName(currency);
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
