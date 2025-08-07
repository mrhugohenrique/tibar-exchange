import { FormControl } from '@angular/forms';

export interface TransactionInterface {
  fromCurrency: FormControl<number | null>;
  toCurrency: FormControl<number | null>;
  dateFrom: FormControl<string | null>;
  dateTo: FormControl<string | null>;
  minAmount: FormControl<number | null>;
  maxAmount: FormControl<number | null>;
}
