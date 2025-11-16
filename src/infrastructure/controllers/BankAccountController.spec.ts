import { Test, TestingModule } from '@nestjs/testing';
import { BankAccountController } from './BankAccountController';
import { DepositHandler } from '../../application/commands/handlers/DepositHandler';
import { WithdrawHandler } from '../../application/commands/handlers/WithdrawHandler';
import { GetStatementHandler } from '../../application/queries/handlers/GetStatementHandler';
import { StatementPrinter } from '../../domain/services/StatementPrinter';
import { StatementLine } from '../../application/dto/StatementLine';

describe('BankAccountController', () => {
  let controller: BankAccountController;
  let depositHandler: jest.Mocked<DepositHandler>;
  let withdrawHandler: jest.Mocked<WithdrawHandler>;
  let getStatementHandler: jest.Mocked<GetStatementHandler>;
  let statementPrinter: jest.Mocked<StatementPrinter>;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(async () => {
    // Mock console.error to avoid noise in tests
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    const mockDepositHandler = {
      execute: jest.fn().mockResolvedValue(undefined),
    };

    const mockWithdrawHandler = {
      execute: jest.fn().mockResolvedValue(undefined),
    };

    const mockGetStatementHandler = {
      execute: jest.fn().mockResolvedValue([]),
    };

    const mockStatementPrinter = {
      print: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BankAccountController,
        {
          provide: DepositHandler,
          useValue: mockDepositHandler,
        },
        {
          provide: WithdrawHandler,
          useValue: mockWithdrawHandler,
        },
        {
          provide: GetStatementHandler,
          useValue: mockGetStatementHandler,
        },
        {
          provide: 'StatementPrinter',
          useValue: mockStatementPrinter,
        },
      ],
    }).compile();

    controller = module.get<BankAccountController>(BankAccountController);
    depositHandler = module.get(DepositHandler);
    withdrawHandler = module.get(WithdrawHandler);
    getStatementHandler = module.get(GetStatementHandler);
    statementPrinter = module.get('StatementPrinter');
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('deposit', () => {
    it('should execute deposit command', () => {
      controller.deposit(100);

      expect(depositHandler.execute).toHaveBeenCalled();
      const command = depositHandler.execute.mock.calls[0][0];
      expect(command.amount).toBe(100);
    });

    it('should handle deposit errors', async () => {
      const error = new Error('Deposit failed');
      depositHandler.execute.mockRejectedValue(error);

      // Fire and forget, but error should be caught and logged
      controller.deposit(100);

      // Wait for async error handling
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(depositHandler.execute).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Deposit error:', error);
    });
  });

  describe('withdraw', () => {
    it('should execute withdraw command', () => {
      controller.withdraw(50);

      expect(withdrawHandler.execute).toHaveBeenCalled();
      const command = withdrawHandler.execute.mock.calls[0][0];
      expect(command.amount).toBe(50);
    });

    it('should handle withdraw errors', async () => {
      const error = new Error('Withdraw failed');
      withdrawHandler.execute.mockRejectedValue(error);

      controller.withdraw(50);

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(withdrawHandler.execute).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Withdraw error:', error);
    });
  });

  describe('printStatement', () => {
    it('should execute get statement query and print', async () => {
      const lines = [new StatementLine(new Date('2024-01-01'), 100, 100)];
      getStatementHandler.execute.mockResolvedValue(lines);

      controller.printStatement();

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(getStatementHandler.execute).toHaveBeenCalled();
      expect(statementPrinter.print).toHaveBeenCalledWith(lines);
    });

    it('should handle print statement errors', async () => {
      const error = new Error('Query failed');
      getStatementHandler.execute.mockRejectedValue(error);

      controller.printStatement();

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(getStatementHandler.execute).toHaveBeenCalled();
      expect(statementPrinter.print).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Print statement error:',
        error,
      );
    });
  });
});
