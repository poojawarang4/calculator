import { Component, AfterViewInit, ElementRef, ViewChild, OnInit } from '@angular/core';
import Chart from 'chart.js/auto';
interface SipMonthlyRow {
  monthYear: string;
  invested: number;
  totalValue: number;
  interest: number;
}
@Component({
  selector: 'app-sip',
  templateUrl: './sip.component.html',
  styleUrls: ['./sip.component.scss'],
  standalone: false,
})

export class SipComponent implements OnInit, AfterViewInit {
  @ViewChild('sipChart') sipChart!: ElementRef<HTMLCanvasElement>;
  investmentType: 'sip' | 'lumpsum' = 'sip';
  investment = 50000;
  rate = 12;
  time = 10;
  investedAmount = 0;
  estReturns = 0;
  totalValue = 0;
  private chart: Chart | null = null;
  investmentAmountInWords = '';
  monthlyData: SipMonthlyRow[] = [];
  formattedInvestmentAmount: string = ''

  ngAfterViewInit() {
    this.initChart();
    this.calculateSIP();
  }

  ngOnInit(): void {
    this.formattedInvestmentAmount = this.investment.toLocaleString('en-IN');
    this.updateInvestmentAmountInWords();
  }

  constructor() { }

  calculateSIP() {
    const totalMonths = this.time * 12;
    const annualRate = this.rate / 100;
    const r = Math.pow(1 + annualRate, 1 / 12) - 1;

    let total = 0;
    this.monthlyData = [];

    const startDate = new Date(); // current date

    for (let i = 0; i < totalMonths; i++) {
      total = (total + this.investment) * (1 + r);

      const invested = this.investment * (i + 1);
      const interest = total - invested;

      const date = new Date(startDate);
      date.setMonth(startDate.getMonth() + i);

      const monthYear = date.toLocaleString('default', {
        month: 'short',
        year: 'numeric'
      });

      this.monthlyData.push({
        monthYear,
        invested,
        interest,
        totalValue: total
      });
    }

    this.totalValue = total;
    this.investedAmount = this.investment * totalMonths;
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
          legend: { position: 'bottom' },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = Math.round(context.raw as number);

                // Indian comma format
                const formattedValue = value.toLocaleString('en-IN');

                return `${label}: ₹ ${formattedValue}`;
              }
            }
          }
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
