import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/conversao',
    pathMatch: 'full',
  },
  {
    path: 'conversao',
    loadComponent: () =>
      import(
        '../app/components/currency-converter/currency-converter.component'
      ).then((m) => m.CurrencyConverterComponent),
  },
  {
    path: 'relatorios',
    loadComponent: () =>
      import(
        '../app/components/transaction-history/transaction-history.component'
      ).then((m) => m.TransactionHistoryComponent),
  },
];
