import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Chart } from 'chart.js';
interface LumpsumMonthlyRow {
  monthYear: string;
  invested: number;
  interest: number;
  totalValue: number;
}

@Component({
  selector: 'app-lumpsum',
  templateUrl: './lumpsum.component.html',
  styleUrls: ['./lumpsum.component.scss'],
  standalone: false,
})
export class LumpsumComponent implements OnInit {
  @ViewChild('sipChart') sipChart!: ElementRef<HTMLCanvasElement>;
  investmentType: 'sip' | 'lumpsum' = 'sip';
  investment = 500000;
  rate = 12;
  time = 10;
  investedAmount = 0;
  estReturns = 0;
  totalValue = 0;
  private chart: Chart | null = null;
  investmentAmountInWords = '';
  monthlyData: LumpsumMonthlyRow[] = [];
  formattedInvestmentAmount: string = ''

  ngAfterViewInit() {
    this.initChart();
    this.calculateLumpsum();
  }

  ngOnInit(): void {
    this.formattedInvestmentAmount = this.investment.toLocaleString('en-IN');
    this.updateInvestmentAmountInWords();
  }

  constructor() { }

  calculateLumpsum() {
    const annualRate = this.rate / 100;
    const monthlyRate = Math.pow(1 + annualRate, 1 / 12) - 1;
    const totalMonths = this.time * 12;

    this.monthlyData = [];
    let total = this.investment;

    const startDate = new Date();

    for (let i = 0; i < totalMonths; i++) {
      total = total * (1 + monthlyRate);

      const date = new Date(startDate);
      date.setMonth(startDate.getMonth() + i);

      const monthYear = date.toLocaleString('default', {
        month: 'short',
        year: 'numeric'
      });

      const interest = total - this.investment;

      this.monthlyData.push({
        monthYear,
        invested: this.investment,
        interest,
        totalValue: total
      });
    }

    this.totalValue = total;
    this.investedAmount = this.investment;
    this.estReturns = this.totalValue - this.investedAmount;

    this.initChart();
  }

  initChart() {
    this.destroyChart();
    const ctx = this.sipChart?.nativeElement?.getContext('2d');
    if (!ctx) return;

    this.chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Invested Amount', 'Est. Returns'],
        datasets: [{
          data: [this.investedAmount, this.estReturns],
          backgroundColor: ['#d3d3f3', '#4a7aff']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  }

  private destroyChart() {
    this.chart?.destroy();
    this.chart = null;
  }

  updateInvestmentAmountInWords() {
    if (!this.investment || this.investment <= 0) {
      this.investmentAmountInWords = '';
      return;
    }

    this.investmentAmountInWords =
      this.numberToWordsIndian(this.investment) + ' Rupees';
  }

  numberToWordsIndian(num: number): string {
    const a = [
      '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six',
      'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve',
      'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
      'Seventeen', 'Eighteen', 'Nineteen'
    ];

    const b = [
      '', '', 'Twenty', 'Thirty', 'Forty',
      'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
    ];

    if (num === 0) return 'Zero';

    let str = '';

    if (num >= 10000000) {
      str += this.numberToWordsIndian(Math.floor(num / 10000000)) + ' Crore ';
      num %= 10000000;
    }

    if (num >= 100000) {
      str += this.numberToWordsIndian(Math.floor(num / 100000)) + ' Lakh ';
      num %= 100000;
    }

    if (num >= 1000) {
      str += this.numberToWordsIndian(Math.floor(num / 1000)) + ' Thousand ';
      num %= 1000;
    }

    if (num >= 100) {
      str += this.numberToWordsIndian(Math.floor(num / 100)) + ' Hundred ';
      num %= 100;
    }

    if (num > 0) {
      if (str !== '') str += 'and ';
      str += num < 20 ? a[num] : b[Math.floor(num / 10)] + ' ' + a[num % 10];
    }

    return str.trim();
  }
  onInvestmentAmountInput(event: any) {
    let value = event.target.value ?? '';

    // remove everything except digits
    value = value.replace(/[^\d]/g, '');

    // update numeric value
    this.investment = value ? Number(value) : 0;

    // format with commas
    this.formattedInvestmentAmount = this.investment
      ? this.investment.toLocaleString('en-IN')
      : '';

    // force value back into input (important for Ionic)
    event.target.value = this.formattedInvestmentAmount;

    this.updateInvestmentAmountInWords();
  }

}
