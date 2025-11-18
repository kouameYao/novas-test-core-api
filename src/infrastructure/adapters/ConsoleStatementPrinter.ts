import { Injectable } from '@nestjs/common';
import { StatementPrinter } from '../../domain/services/StatementPrinter';
import { StatementLine } from '../../interface/dto/StatementLine';

@Injectable()
export class ConsoleStatementPrinter implements StatementPrinter {
  print(lines: StatementLine[]): void {
    if (lines.length === 0) {
      console.log('No transactions');
      return;
    }

    console.log('Date       | Amount | Balance');
    console.log('--------------------------------');

    lines.forEach((line) => {
      const dateStr = line.date.toISOString().split('T')[0];
      const amountStr = line.amount >= 0 ? `+${line.amount}` : `${line.amount}`;
      console.log(`${dateStr} | ${amountStr.padStart(7)} | ${line.balance}`);
    });
  }
}
