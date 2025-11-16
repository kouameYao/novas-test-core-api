import { Transaction } from './Transaction';
import { TransactionType } from './TransactionType';

describe('Transaction', () => {
  const testDate = new Date('2024-01-01');

  describe('deposit transaction', () => {
    it('should create a deposit transaction', () => {
      const transaction = new Transaction(
        TransactionType.DEPOSIT,
        100,
        testDate,
      );

      expect(transaction.type).toBe(TransactionType.DEPOSIT);
      expect(transaction.amount).toBe(100);
      expect(transaction.date).toBe(testDate);
      expect(transaction.getAmount()).toBe(100);
    });
  });

  describe('withdrawal transaction', () => {
    it('should create a withdrawal transaction', () => {
      const transaction = new Transaction(
        TransactionType.WITHDRAWAL,
        50,
        testDate,
      );

      expect(transaction.type).toBe(TransactionType.WITHDRAWAL);
      expect(transaction.amount).toBe(50);
      expect(transaction.date).toBe(testDate);
      expect(transaction.getAmount()).toBe(-50);
    });
  });

  describe('validation', () => {
    it('should throw error for zero amount', () => {
      expect(() => {
        new Transaction(TransactionType.DEPOSIT, 0, testDate);
      }).toThrow('Transaction amount must be positive');
    });

    it('should throw error for negative amount', () => {
      expect(() => {
        new Transaction(TransactionType.DEPOSIT, -10, testDate);
      }).toThrow('Transaction amount must be positive');
    });
  });
});
