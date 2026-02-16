import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Chart } from 'chart.js/auto';
interface EmiMonthlyRow {
  monthYear: string;
  emi: number;
  principal: number;
  interest: number;
  balance: number;
}

@Component({
  selector: 'app-emi',
  templateUrl: './emi.page.html',
  styleUrls: ['./emi.page.scss'],
  standalone: false,
})
export class EmiPage implements OnInit, AfterViewInit {
  loanAmount: number = 500000;
  interestRate: number = 10;
  years: number = 10;
  emi: number | null = null;
  totalInterest: number | null = null;
  totalPayment: number | null = null;
  private chart: Chart | null = null;
  @ViewChild('emiChart') emiChart!: ElementRef<HTMLCanvasElement>;
  loanAmountInWords = '';
  monthlyData: EmiMonthlyRow[] = [];
  formattedLoanAmount: string = '';

  constructor() { }

  ngOnInit() {
    this.formattedLoanAmount = this.loanAmount.toLocaleString('en-IN');
    this.updateLoanAmountInWords();
  }

  ngAfterViewInit() {
    this.calculateEMI();
  }

  calculateEMI() {
    let P = this.loanAmount;
    let annualRate = this.interestRate;
    let r = annualRate / 12 / 100;
    let n = this.years * 12;

    if (P > 0 && r > 0 && n > 0) {

      this.emi = (P * r * Math.pow(1 + r, n)) /
        (Math.pow(1 + r, n) - 1);

      this.totalPayment = this.emi * n;
      this.totalInterest = this.totalPayment - P;

      // 🔹 Build amortization table
      this.monthlyData = [];
      let balance = P;
      const startDate = new Date();

      for (let i = 0; i < n; i++) {
        const interest = balance * r;
        const principal = this.emi - interest;
        balance -= principal;

        const date = new Date(startDate);
        date.setMonth(startDate.getMonth() + i);

        const monthYear = date.toLocaleString('default', {
          month: 'short',
          year: 'numeric'
        });

        this.monthlyData.push({
          monthYear,
          emi: Math.round(this.emi),
          principal: Math.round(principal),
          interest: Math.round(interest),
          balance: Math.max(0, Math.round(balance))
        });
      }

      setTimeout(() => this.renderChart(P, this.totalInterest!), 0);
    } else {
      this.reset();
    }
  }

  renderChart(principal: number, interest: number) {
    this.destroyChart();
    const ctx = this.emiChart.nativeElement.getContext('2d');
    if (ctx) {
      this.chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Principal Loan Amount', 'Total Interest'],
          datasets: [{
            data: [principal, interest],
            backgroundColor: ['#d3d3f3', '#4a7aff'],
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
  }

  private destroyChart() {
    this.chart?.destroy();
    this.chart = null;
  }

  private reset() {
    this.emi = null;
    this.totalPayment = null;
    this.totalInterest = null;
    this.destroyChart();
  }

  updateLoanAmountInWords() {
    if (!this.loanAmount || this.loanAmount <= 0) {
      this.loanAmountInWords = '';
      return;
    }

    this.loanAmountInWords =
      this.numberToWordsIndian(this.loanAmount) + ' Rupees';
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
  onLoanAmountInput(event: any) {
    let value = event.target.value ?? '';

    // remove everything except digits
    value = value.replace(/[^\d]/g, '');

    // update numeric value
    this.loanAmount = value ? Number(value) : 0;

    // format with commas
    this.formattedLoanAmount = this.loanAmount
      ? this.loanAmount.toLocaleString('en-IN')
      : '';

    // force value back into input (important for Ionic)
    event.target.value = this.formattedLoanAmount;

    this.updateLoanAmountInWords();
  }

}
