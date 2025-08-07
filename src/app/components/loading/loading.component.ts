import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencyService } from '../../services/currency.service';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      *ngIf="loading$ | async" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-8 flex flex-col items-center space-y-4 shadow-2xl">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        <div class="text-center">
          <h3 class="text-lg font-semibold text-gray-800">Processando...</h3>
          <p class="text-gray-600">Aguarde enquanto processamos sua solicitação</p>
        </div>
      </div>
    </div>
  `,
})
export class LoadingComponent {
  private readonly _currencyService = inject(CurrencyService);
  
  loading$ = this._currencyService.loading$;
}