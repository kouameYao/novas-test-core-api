import { Injectable, Inject } from '@nestjs/common';
import { GetStatementQuery } from '../implements/GetStatementQuery';
import { BankAccountRepository } from '../../../ports/BankAccountRepository';
import { StatementLine } from '../../dto/StatementLine';
import { TransactionType } from '../../../domain/model/TransactionType';

@Injectable()
export class GetStatementHandler {
  constructor(
    @Inject('BankAccountRepository')
    private readonly repository: BankAccountRepository,
  ) {}

  async execute(query: GetStatementQuery): Promise<StatementLine[]> {
    const account = await this.repository.findById(query.accountId);

    if (!account) {
      return [];
    }

    const transactions = account.getTransactions();
    let runningBalance = 0;

    // Calculate running balance in chronological order
    const chronologicalLines: StatementLine[] = transactions.map(
      (transaction) => {
        const amount =
          transaction.type === TransactionType.DEPOSIT
            ? transaction.amount
            : -transaction.amount;
        runningBalance += amount;
        return new StatementLine(transaction.date, amount, runningBalance);
      },
    );

    // Sort DESC by date for statement display
    const lines: StatementLine[] = chronologicalLines.sort(
      (a, b) => b.date.getTime() - a.date.getTime(),
    );

    return lines;
  }
}
