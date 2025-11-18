import { TransactionType } from './TransactionType';

export class Transaction {
  constructor(
    public readonly type: TransactionType,
    public readonly amount: number,
    public readonly date: Date,
  ) {
    if (amount <= 0) {
      throw new Error('Transaction amount must be positive');
    }
  }

  getAmount(): number {
    return this.type === TransactionType.DEPOSIT ? this.amount : -this.amount;
  }
}
