import { BankAccount } from './BankAccount';
import { FakeClock } from '../../infrastructure/adapters/FakeClock';
import { NegativeAmountError } from '../exceptions/NegativeAmountError';
import { InsufficientFundsError } from '../exceptions/InsufficientFundsError';

/**
 * Tests demonstrating that BankAccount respects the immutable interface:
 * - deposit(amount: number): void
 * - withdraw(amount: number): void
 * - printStatement(): void
 */
describe('BankAccount - Interface Compliance', () => {
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  describe('Interface: deposit(amount: number): void', () => {
    it('should deposit a positive amount without date parameter', () => {
      const clock = new FakeClock(new Date('2024-01-10'));
      const account = new BankAccount('test-account', clock);

      account.deposit(1000);

      expect(account.calculateBalance()).toBe(1000);
      expect(account.getTransactions()).toHaveLength(1);
      expect(account.getTransactions()[0].amount).toBe(1000);
      expect(account.getTransactions()[0].date).toEqual(new Date('2024-01-10'));
    });

    it('should throw NegativeAmountError for zero amount', () => {
      const account = new BankAccount('test-account');
      expect(() => account.deposit(0)).toThrow(NegativeAmountError);
    });

    it('should throw NegativeAmountError for negative amount', () => {
      const account = new BankAccount('test-account');
      expect(() => account.deposit(-10)).toThrow(NegativeAmountError);
    });
  });

  describe('Interface: withdraw(amount: number): void', () => {
    it('should withdraw a positive amount without date parameter', () => {
      const clock = new FakeClock(new Date('2024-01-13'));
      const account = new BankAccount('test-account', clock);
      account.deposit(3000);

      account.withdraw(500);

      expect(account.calculateBalance()).toBe(2500);
      expect(account.getTransactions()).toHaveLength(2);
    });

    it('should throw InsufficientFundsError when balance is insufficient', () => {
      const account = new BankAccount('test-account');
      account.deposit(50);

      expect(() => account.withdraw(100)).toThrow(InsufficientFundsError);
    });

    it('should throw NegativeAmountError for zero amount', () => {
      const account = new BankAccount('test-account');
      account.deposit(100);

      expect(() => account.withdraw(0)).toThrow(NegativeAmountError);
    });
  });

  describe('Interface: printStatement(): void', () => {
    it('should print statement with correct format and descending date order', () => {
      const clock = new FakeClock(new Date('2024-01-10'));
      const account = new BankAccount('test-account', clock);

      // Set dates manually for predictable test
      account.depositWithDate(1000, new Date('2024-01-10'));
      clock.setDate(new Date('2024-01-13'));
      account.depositWithDate(2000, new Date('2024-01-13'));
      clock.setDate(new Date('2024-01-14'));
      account.withdrawWithDate(500, new Date('2024-01-14'));

      account.printStatement();

      expect(consoleLogSpy).toHaveBeenCalledWith('Date || Montant || Solde');
      expect(consoleLogSpy).toHaveBeenCalledWith('2024-01-14 || -500 || 2500');
      expect(consoleLogSpy).toHaveBeenCalledWith('2024-01-13 || 2000 || 3000');
      expect(consoleLogSpy).toHaveBeenCalledWith('2024-01-10 || 1000 || 1000');

      // Verify order: most recent first
      const calls = consoleLogSpy.mock.calls;
      const dateIndex = calls.findIndex((call) =>
        call[0].includes('2024-01-14'),
      );
      const date13Index = calls.findIndex((call) =>
        call[0].includes('2024-01-13'),
      );
      const date10Index = calls.findIndex((call) =>
        call[0].includes('2024-01-10'),
      );

      expect(dateIndex).toBeLessThan(date13Index);
      expect(date13Index).toBeLessThan(date10Index);
    });

    it('should print header only when no transactions', () => {
      const account = new BankAccount('test-account');
      account.printStatement();

      expect(consoleLogSpy).toHaveBeenCalledWith('Date || Montant || Solde');
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    });

    it('should display correct running balance', () => {
      const clock = new FakeClock(new Date('2024-01-01'));
      const account = new BankAccount('test-account', clock);

      account.deposit(100);
      account.deposit(50);
      account.withdraw(30);

      account.printStatement();

      // Should show: -30 || 120, +50 || 150, +100 || 100 (descending)
      const calls = consoleLogSpy.mock.calls;
      const balance120 = calls.some((call) => call[0].includes('|| 120'));
      const balance150 = calls.some((call) => call[0].includes('|| 150'));
      const balance100 = calls.some((call) => call[0].includes('|| 100'));

      expect(balance120).toBe(true);
      expect(balance150).toBe(true);
      expect(balance100).toBe(true);
    });
  });

  describe('Example from requirements', () => {
    it('should match the expected output format', () => {
      const account = new BankAccount('test-account');

      // Create transactions with specific dates
      account.depositWithDate(1000, new Date('2024-01-10'));
      account.depositWithDate(2000, new Date('2024-01-13'));
      account.withdrawWithDate(500, new Date('2024-01-14'));

      account.printStatement();

      // Expected output:
      // Date || Montant || Solde
      // 2024-01-14 || -500 || 2500
      // 2024-01-13 || 2000 || 3000
      // 2024-01-10 || 1000 || 1000

      expect(consoleLogSpy).toHaveBeenCalledWith('Date || Montant || Solde');
      expect(consoleLogSpy).toHaveBeenCalledWith('2024-01-14 || -500 || 2500');
      expect(consoleLogSpy).toHaveBeenCalledWith('2024-01-13 || 2000 || 3000');
      expect(consoleLogSpy).toHaveBeenCalledWith('2024-01-10 || 1000 || 1000');
    });
  });
});
