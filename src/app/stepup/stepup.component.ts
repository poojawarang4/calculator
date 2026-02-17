import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Chart } from 'chart.js';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { IonInput } from '@ionic/angular';
interface StepUpMonthlyRow {
  monthYear: string;
  invested: number;
  interest: number;
  totalValue: number;
}

@Component({
  selector: 'app-stepup',
  templateUrl: './stepup.component.html',
  styleUrls: ['./stepup.component.scss'],
  standalone: false,
})
export class StepupComponent implements OnInit, AfterViewInit {
  @ViewChild(IonInput) lnvestInput!: IonInput;
  @ViewChild('stepSipChart') stepSipChart!: ElementRef<HTMLCanvasElement>;
  investment = 5000;
  rate = 12;
  time = 10;
  stepUp = 10;
  investedAmount = 0;
  estReturns = 0;
  totalValue = 0;
  private chart: Chart | null = null;
  investmentAmountInWords = ''
  monthlyData: StepUpMonthlyRow[] = [];
  formattedInvestmentAmount: string = ''

  ngAfterViewInit() {
    this.initChart();
    this.calculateStepUpSIP();
  }

  ngOnInit(): void {
    this.formattedInvestmentAmount = this.investment.toLocaleString('en-IN');
    this.updateInvestmentAmountInWords();
  }

  calculateStepUpSIP() {
    const months = this.time * 12;
    const annualRate = this.rate / 100;
    const monthlyRate = Math.pow(1 + annualRate, 1 / 12) - 1;

    let sipAmount = this.investment;
    let invested = 0;
    let futureValue = 0;

    this.monthlyData = [];
    const startDate = new Date();

    for (let m = 1; m <= months; m++) {

      // Step-up every year
      if (m > 1 && (m - 1) % 12 === 0) {
        sipAmount *= (1 + this.stepUp / 100);
      }

      invested += sipAmount;
      futureValue = (futureValue + sipAmount) * (1 + monthlyRate);

      const date = new Date(startDate);
      date.setMonth(startDate.getMonth() + (m - 1));

      const monthYear = date.toLocaleString('default', {
        month: 'short',
        year: 'numeric'
      });

      this.monthlyData.push({
        monthYear,
        invested: Math.round(invested),
        interest: Math.round(futureValue - invested),
        totalValue: Math.round(futureValue)
      });
    }

    this.investedAmount = Math.round(invested);
    this.totalValue = Math.round(futureValue);
    this.estReturns = this.totalValue - this.investedAmount;

    this.initChart();
  }

  initChart() {
    this.destroyChart();
    const ctx = this.stepSipChart?.nativeElement?.getContext('2d');
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

  async onInvestmentAmountInput(event: any) {
    const inputEl = await this.lnvestInput.getInputElement();

    const start = inputEl.selectionStart || 0;

    let rawValue = inputEl.value;

    // Remove non-digits
    const numericValue = rawValue.replace(/[^\d]/g, '');
    this.investment = numericValue ? Number(numericValue) : 0;

    // format with commas
    const formatted = this.investment
      ? this.investment.toLocaleString('en-IN')
      : '';

    // force value back into input (important for Ionic)
    this.formattedInvestmentAmount = formatted;
    // Set value properly
    await this.lnvestInput.setFocus();
    inputEl.value = formatted;

    // Restore cursor position correctly
    const diff = formatted.length - rawValue.length;
    const newPos = start + diff;

    inputEl.setSelectionRange(newPos, newPos);

    this.updateInvestmentAmountInWords();
  }

  downloadExcel() {
    if (!this.monthlyData.length) return;

    const excelData = this.monthlyData.map(row => ({
      Month: row.monthYear,
      Invested: row.invested,
      Interest: row.interest,
      TotalValue: row.totalValue,
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

