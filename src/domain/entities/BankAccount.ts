import { Transaction } from './Transaction';
import { TransactionType } from './TransactionType';
import { NegativeAmountError } from '../exceptions/NegativeAmountError';
import { InsufficientFundsError } from '../exceptions/InsufficientFundsError';
import { Clock } from '../services/Clock';

/**
 * BankAccount class respecting the immutable interface:
 * - deposit(amount: number): void
 * - withdraw(amount: number): void
 * - printStatement(): void
 */
export class BankAccount {
  private transactions: Transaction[] = [];

  constructor(
    private readonly id: string,
    private readonly clock?: Clock,
  ) {}

  getId(): string {
    return this.id;
  }

  getTransactions(): readonly Transaction[] {
    return [...this.transactions];
  }

  /**
   * Deposits an amount into the account.
   * Refuses null or negative amounts.
   * @param amount - The amount to deposit (must be positive)
   */
  deposit(amount: number): void {
    if (amount <= 0) {
      throw new NegativeAmountError(amount);
    }

    const date = this.getCurrentDate();
    const transaction = new Transaction(TransactionType.DEPOSIT, amount, date);
    this.transactions.push(transaction);
  }

  /**
   * Withdraws an amount from the account.
   * Refuses null or negative amounts.
   * Refuses withdrawals leading to negative balance (no overdraft allowed).
   * @param amount - The amount to withdraw (must be positive)
   */
  withdraw(amount: number): void {
    if (amount <= 0) {
      throw new NegativeAmountError(amount);
    }

    const currentBalance = this.calculateBalance();
    if (currentBalance < amount) {
      throw new InsufficientFundsError(currentBalance, amount);
    }

    const date = this.getCurrentDate();
    const transaction = new Transaction(
      TransactionType.WITHDRAWAL,
      amount,
      date,
    );
    this.transactions.push(transaction);
  }

  /**
   * Prints the account statement.
   * Displays: Date || Amount || Balance
   * Lines sorted by descending date (most recent first).
   */
  printStatement(): void {
    if (this.transactions.length === 0) {
      console.log('Date || Montant || Solde');
      return;
    }

    // Calculate running balance in chronological order
    let runningBalance = 0;
    const statementLines: Array<{
      date: Date;
      amount: number;
      balance: number;
    }> = [];

    this.transactions.forEach((transaction) => {
      const amount =
        transaction.type === TransactionType.DEPOSIT
          ? transaction.amount
          : -transaction.amount;
      runningBalance += amount;
      statementLines.push({
        date: transaction.date,
        amount,
        balance: runningBalance,
      });
    });

    // Sort by descending date (most recent first)
    statementLines.sort((a, b) => b.date.getTime() - a.date.getTime());

    // Print header
    console.log('Date || Montant || Solde');

    // Print each line
    statementLines.forEach((line) => {
      const dateStr = line.date.toISOString().split('T')[0];
      const amountStr = line.amount.toString();
      const balanceStr = line.balance.toString();
      console.log(`${dateStr} || ${amountStr} || ${balanceStr}`);
    });
  }

  /**
   * @deprecated Use deposit(amount) instead. This method is kept for backward compatibility.
   */
  depositWithDate(amount: number, date: Date): void {
    if (amount <= 0) {
      throw new NegativeAmountError(amount);
    }

    const transaction = new Transaction(TransactionType.DEPOSIT, amount, date);
    this.transactions.push(transaction);
  }

  /**
   * @deprecated Use withdraw(amount) instead. This method is kept for backward compatibility.
   */
  withdrawWithDate(amount: number, date: Date): void {
    if (amount <= 0) {
      throw new NegativeAmountError(amount);
    }

    const currentBalance = this.calculateBalance();
    if (currentBalance < amount) {
      throw new InsufficientFundsError(currentBalance, amount);
    }

    const transaction = new Transaction(
      TransactionType.WITHDRAWAL,
      amount,
      date,
    );
    this.transactions.push(transaction);
  }

  calculateBalance(): number {
    return this.transactions.reduce(
      (balance, transaction) => balance + transaction.getAmount(),
      0,
    );
  }

  private getCurrentDate(): Date {
    return this.clock ? this.clock.now() : new Date();
  }
}
