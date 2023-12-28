import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import {
  HttpClient,
  HttpClientModule,
  HttpErrorResponse,
} from '@angular/common/http';
import { FormsModule } from '@angular/forms';

interface Currency {
  symbol: string;
  name: string;
  symbol_native: string;
  decimal_digits: number;
  rounding: number;
  code: string;
  name_plural: string;
}

interface CurrencyData {
  data: {
    [currencyCode: string]: Currency;
  };
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HttpClientModule, CommonModule, RouterOutlet, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'Currency Swap';

  data: CurrencyData = { data: {} };
  currencies: string[] = [];
  fromCurrency: string = 'USD';
  toCurrency: string = 'EUR';
  amount: number = 1;
  result: number = 0;
  conversionMessage: string = '';

  httpClient = inject(HttpClient);

  ngOnInit(): void {
    this.getAllCurrencies();
  }

  private allCurrenciesUrl =
    'https://api.freecurrencyapi.com/v1/currencies?apikey=fca_live_ahC2uFekMcOQJgvkLu8C4D8vBPdPSm1lpyOovv9I&currencies=';
  private baseUrl = 'https://api.freecurrencyapi.com/v1/latest';
  private apiKey = 'fca_live_ahC2uFekMcOQJgvkLu8C4D8vBPdPSm1lpyOovv9I';

  getAllCurrencies() {
    this.httpClient.get<CurrencyData>(this.allCurrenciesUrl).subscribe(
      (response: CurrencyData) => {
        this.data = response;
        this.currencies = Object.keys(response.data);
      },
      (error: HttpErrorResponse) => {
        console.error('An error occurred:', error.message);
      }
    );
  }

  convertCurrencies() {
    let apiUrl: string;

    if (this.fromCurrency === 'USD') {
      apiUrl = `${this.baseUrl}?apikey=${this.apiKey}&currencies=${this.toCurrency}`;
    } else {
      apiUrl = `${this.baseUrl}?apikey=${this.apiKey}&currencies=${this.toCurrency}&base_currency=${this.fromCurrency}`;
    }

    this.httpClient.get<any>(apiUrl).subscribe(
      (response: any) => {
        if (response && response.data && response.data[this.toCurrency]) {
          const exchangeRate = response.data[this.toCurrency];

          this.result = this.amount * exchangeRate;
          this.result = parseFloat(this.result.toFixed(2));
          this.conversionMessage = `${this.amount} ${this.fromCurrency} = ${this.result} ${this.toCurrency}`;
        } else {
          console.error(
            'Conversion failed. Check the API response for details.'
          );
        }
      },
      (error: HttpErrorResponse) => {
        console.error('An error occurred:', error.message);
      }
    );
  }

  updateAmount(event: Event) {
    const amountValue = (event.target as HTMLSelectElement).value;
    this.amount = Number(amountValue);
  }

  updateFromCurrency(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.fromCurrency = selectedValue;
  }

  updateToCurrency(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.toCurrency = selectedValue;
  }
}
