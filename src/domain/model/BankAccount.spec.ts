import { BankAccount } from './BankAccount';
import { TransactionType } from './TransactionType';
import { NegativeAmountError } from '../errors/NegativeAmountError';
import { InsufficientFundsError } from '../errors/InsufficientFundsError';

describe('BankAccount', () => {
  const accountId = 'test-account';
  const testDate = new Date('2024-01-01');

  describe('deposit (with date - deprecated method)', () => {
    it('should deposit a positive amount', () => {
      const account = new BankAccount(accountId);
      account.depositWithDate(100, testDate);

      expect(account.calculateBalance()).toBe(100);
      expect(account.getTransactions()).toHaveLength(1);
      expect(account.getTransactions()[0].type).toBe(TransactionType.DEPOSIT);
      expect(account.getTransactions()[0].amount).toBe(100);
    });

    it('should throw NegativeAmountError for zero amount', () => {
      const account = new BankAccount(accountId);
      expect(() => account.depositWithDate(0, testDate)).toThrow(
        NegativeAmountError,
      );
    });

    it('should throw NegativeAmountError for negative amount', () => {
      const account = new BankAccount(accountId);
      expect(() => account.depositWithDate(-10, testDate)).toThrow(
        NegativeAmountError,
      );
    });

    it('should accumulate multiple deposits', () => {
      const account = new BankAccount(accountId);
      account.depositWithDate(100, testDate);
      account.depositWithDate(50, testDate);

      expect(account.calculateBalance()).toBe(150);
      expect(account.getTransactions()).toHaveLength(2);
    });
  });

  describe('withdraw (with date - deprecated method)', () => {
    it('should withdraw when sufficient balance', () => {
      const account = new BankAccount(accountId);
      account.depositWithDate(100, testDate);
      account.withdrawWithDate(30, testDate);

      expect(account.calculateBalance()).toBe(70);
      expect(account.getTransactions()).toHaveLength(2);
      expect(account.getTransactions()[1].type).toBe(
        TransactionType.WITHDRAWAL,
      );
      expect(account.getTransactions()[1].amount).toBe(30);
    });

    it('should throw InsufficientFundsError when balance is insufficient', () => {
      const account = new BankAccount(accountId);
      account.depositWithDate(50, testDate);

      expect(() => account.withdrawWithDate(100, testDate)).toThrow(
        InsufficientFundsError,
      );
    });

    it('should throw NegativeAmountError for zero amount', () => {
      const account = new BankAccount(accountId);
      account.depositWithDate(100, testDate);

      expect(() => account.withdrawWithDate(0, testDate)).toThrow(
        NegativeAmountError,
      );
    });

    it('should throw NegativeAmountError for negative amount', () => {
      const account = new BankAccount(accountId);
      account.depositWithDate(100, testDate);

      expect(() => account.withdrawWithDate(-10, testDate)).toThrow(
        NegativeAmountError,
      );
    });
  });

  describe('calculateBalance', () => {
    it('should return 0 for new account', () => {
      const account = new BankAccount(accountId);
      expect(account.calculateBalance()).toBe(0);
    });

    it('should calculate balance correctly with multiple transactions', () => {
      const account = new BankAccount(accountId);
      account.depositWithDate(100, testDate);
      account.depositWithDate(50, testDate);
      account.withdrawWithDate(30, testDate);
      account.withdrawWithDate(20, testDate);

      expect(account.calculateBalance()).toBe(100);
    });
  });

  describe('transactions immutability', () => {
    it('should return a copy of transactions', () => {
      const account = new BankAccount(accountId);
      account.depositWithDate(100, testDate);

      const transactions1 = account.getTransactions();
      const transactions2 = account.getTransactions();

      expect(transactions1).not.toBe(transactions2);
      expect(transactions1).toEqual(transactions2);
    });
  });
});
