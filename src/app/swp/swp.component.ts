import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Chart } from 'chart.js';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { IonInput } from '@ionic/angular';
interface SwpMonthlyRow {
  monthYear: string;
  withdrawn: number;
  interest: number;
  balance: number;
}

@Component({
  selector: 'app-swp',
  templateUrl: './swp.component.html',
  styleUrls: ['./swp.component.scss'],
  standalone: false,
})
export class SwpComponent implements OnInit, AfterViewInit {
  @ViewChild('lnvestInput', { static: false }) lnvestInput!: IonInput;
  @ViewChild('withdrawalInput', { static: false }) withdrawalInput!: IonInput;
  @ViewChild('swpChart') swpChart!: ElementRef;
  initialInvestment = 5000000;
  monthlyWithdrawal = 10000;
  annualReturn = 8;
  years = 5;
  totalWithdrawal = 0;
  finalValue = 0;
  private chart: Chart | null = null;
  investmentAmountInWords = '';
  monthlyWithdrawalAmountInWords = '';
  monthlyTable: SwpMonthlyRow[] = [];
  formattedInitialInvestmentAmount: string = ''
  formattedMonthlyWithdrawalAmount: string = ''

  ngAfterViewInit() {
    this.initChart();
    this.calculateSWP();
  }

  ngOnInit(): void {
    this.formattedInitialInvestmentAmount = this.initialInvestment.toLocaleString('en-IN');
    this.formattedMonthlyWithdrawalAmount = this.monthlyWithdrawal.toLocaleString('en-IN');
    this.updateInvestmentAmountInWords();
  }

  calculateSWP() {
    const investment = +this.initialInvestment;
    const withdrawal = +this.monthlyWithdrawal;
    const annualRate = +this.annualReturn / 100;
    const months = +this.years * 12;
    const monthlyRate = Math.pow(1 + annualRate, 1 / 12) - 1;

    let balance = investment;
    let withdrawn = 0;

    this.monthlyTable = [];

    const startDate = new Date(); // current month

    for (let i = 0; i < months; i++) {
      const openingBalance = balance;

      // Interest
      const interest = openingBalance * monthlyRate;
      balance += interest;

      // Withdrawal
      let actualWithdrawal = 0;
      if (balance >= withdrawal) {
        balance -= withdrawal;
        actualWithdrawal = withdrawal;
        withdrawn += withdrawal;
      } else {
        actualWithdrawal = balance;
        withdrawn += balance;
        balance = 0;
      }

      // Month + Year
      const currentDate = new Date(startDate);
      currentDate.setMonth(startDate.getMonth() + i);

      const monthYear = currentDate.toLocaleString('default', {
        month: 'short',
        year: 'numeric'
      });

      this.monthlyTable.push({
        monthYear,
        withdrawn: Math.round(actualWithdrawal),
        interest: Math.round(interest),
        balance: Math.round(balance)
      });

      if (balance <= 0) break;
    }

    this.totalWithdrawal = Math.round(withdrawn);
    this.finalValue = Math.round(balance);

    this.initChart();
  }

  initChart() {
    this.destroyChart();
    const ctx = this.swpChart?.nativeElement?.getContext('2d');
    if (!ctx) return;

    this.chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Initial Investment', 'Final Value'],
        datasets: [{
          data: [this.initialInvestment, this.finalValue],
          backgroundColor: ['#d8d9f6', '#4a6cf7']
        }]
      },
      options: {
        cutout: '65%',
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
    if (!this.initialInvestment || this.initialInvestment <= 0) {
      this.investmentAmountInWords = '';
      return;
    }

    this.investmentAmountInWords =
      this.numberToWordsIndian(this.initialInvestment) + ' Rupees';

    if (!this.monthlyWithdrawal || this.monthlyWithdrawal <= 0) {
      this.monthlyWithdrawalAmountInWords = '';
      return;
    }

    this.monthlyWithdrawalAmountInWords =
      this.numberToWordsIndian(this.monthlyWithdrawal) + ' Rupees';
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

  async onInvestmentAmountInput(event: any) {
    const inputEl = await this.lnvestInput.getInputElement();

    const start = inputEl.selectionStart || 0;

    let rawValue = inputEl.value;

    // Remove non-digits
    const numericValue = rawValue.replace(/[^\d]/g, '');
    this.initialInvestment = numericValue ? Number(numericValue) : 0;

    // format with commas
    const formatted = this.initialInvestment
      ? this.initialInvestment.toLocaleString('en-IN')
      : '';

    // force value back into input (important for Ionic)
    this.formattedInitialInvestmentAmount = formatted;
    // Set value properly
    inputEl.value = formatted;

    // Restore cursor position correctly
    const diff = formatted.length - rawValue.length;
    const newPos = start + diff;

    inputEl.setSelectionRange(newPos, newPos);

    this.updateInvestmentAmountInWords();
  }

  async onMonthlyWithdrawalAmountInput(event: any) {
    const inputEl = await this.withdrawalInput.getInputElement();

    const start = inputEl.selectionStart || 0;

    let rawValue = inputEl.value;

    // Remove non-digits
    const numericValue = rawValue.replace(/[^\d]/g, '');
    this.monthlyWithdrawal = numericValue ? Number(numericValue) : 0;

    // format with commas
    const formatted = this.monthlyWithdrawal
      ? this.monthlyWithdrawal.toLocaleString('en-IN')
      : '';

    // force value back into input (important for Ionic)
    this.formattedMonthlyWithdrawalAmount = formatted;
    // Set value properly
    inputEl.value = formatted;

    // Restore cursor position correctly
    const diff = formatted.length - rawValue.length;
    const newPos = start + diff;

    inputEl.setSelectionRange(newPos, newPos);

    this.updateInvestmentAmountInWords();
  }

  downloadExcel() {
    if (!this.monthlyTable.length) return;

    const excelData = this.monthlyTable.map(row => ({
      Month: row.monthYear,
      Withdrow: row.withdrawn,
      Interest: row.interest,
      Balance: row.balance,
    }));

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelData);

    // 🔥 Apply Indian number format to numeric columns
    const range = XLSX.utils.decode_range(worksheet['!ref']!);

    for (let row = range.s.r + 1; row <= range.e.r; row++) {
      for (let col = 1; col <= 4; col++) { // numeric columns
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        if (worksheet[cellAddress]) {
          worksheet[cellAddress].z = '#,##,##0'; // Indian comma format
        }
      }
    }

    const workbook: XLSX.WorkBook = {
      Sheets: { 'EMI Schedule': worksheet },
      SheetNames: ['EMI Schedule']
    };

    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array'
    });

    this.saveExcelFile(excelBuffer, 'EMI_Monthly_Breakdown');
  }

  saveExcelFile(buffer: any, fileName: string) {
    const data: Blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    });

    FileSaver.saveAs(data, `${fileName}.xlsx`);
  }

}