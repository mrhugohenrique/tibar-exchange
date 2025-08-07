import { FormControl } from '@angular/forms';
import { Currency } from '../../models/currency.model';

export interface CurrencyConverterInterface {
  fromCurrency: FormControl<Currency | null>;
  toCurrency: FormControl<Currency | null>;
  amount: FormControl<number | null>;
}
