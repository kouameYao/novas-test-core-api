import { Test, TestingModule } from '@nestjs/testing';
import { BankAccountController } from './BankAccountController';
import { DepositHandler } from '../../application/commands/handlers/DepositHandler';
import { WithdrawHandler } from '../../application/commands/handlers/WithdrawHandler';
import { GetStatementHandler } from '../../application/queries/handlers/GetStatementHandler';
import { GetBalanceHandler } from '../../application/queries/handlers/GetBalanceHandler';
import { DepositDto } from '../dto/DepositDto';
import { WithdrawDto } from '../dto/WithdrawDto';
import { StatementLine } from '../dto/StatementLine';
import { User } from '../../domain/entities/User';

describe('BankAccountController', () => {
  let controller: BankAccountController;
  let depositHandler: jest.Mocked<DepositHandler>;
  let withdrawHandler: jest.Mocked<WithdrawHandler>;
  let getStatementHandler: jest.Mocked<GetStatementHandler>;
  let getBalanceHandler: jest.Mocked<GetBalanceHandler>;
  let mockUser: User;

  beforeEach(async () => {
    const mockDepositHandler = {
      execute: jest.fn().mockResolvedValue(undefined),
    };

    const mockWithdrawHandler = {
      execute: jest.fn().mockResolvedValue(undefined),
    };

    const mockGetStatementHandler = {
      execute: jest.fn().mockResolvedValue([]),
    };

    const mockGetBalanceHandler = {
      execute: jest.fn().mockResolvedValue(100),
    };

    // Create a mock user
    mockUser = new User(
      'user-id',
      'test@example.com',
      'hashed-password',
      'user',
      'bank-account-id',
    );

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
          provide: GetBalanceHandler,
          useValue: mockGetBalanceHandler,
        },
      ],
    }).compile();

    controller = module.get<BankAccountController>(BankAccountController);
    depositHandler = module.get(DepositHandler);
    withdrawHandler = module.get(WithdrawHandler);
    getStatementHandler = module.get(GetStatementHandler);
    getBalanceHandler = module.get(GetBalanceHandler);
  });

  describe('deposit', () => {
    it('should execute deposit command', async () => {
      const depositDto: DepositDto = { amount: 100 };
      const req = { user: mockUser };

      await controller.deposit(depositDto, req);

      expect(depositHandler.execute).toHaveBeenCalled();
      const command = depositHandler.execute.mock.calls[0][0];
      expect(command.amount).toBe(100);
      expect(command.accountId).toBe('bank-account-id');
    });

    it('should return success message', async () => {
      const depositDto: DepositDto = { amount: 100 };
      const req = { user: mockUser };

      const result = await controller.deposit(depositDto, req);

      expect(result).toEqual({ message: 'Deposit successful' });
    });
  });

  describe('withdraw', () => {
    it('should execute withdraw command', async () => {
      const withdrawDto: WithdrawDto = { amount: 50 };
      const req = { user: mockUser };

      await controller.withdraw(withdrawDto, req);

      expect(withdrawHandler.execute).toHaveBeenCalled();
      const command = withdrawHandler.execute.mock.calls[0][0];
      expect(command.amount).toBe(50);
      expect(command.accountId).toBe('bank-account-id');
    });

    it('should return success message', async () => {
      const withdrawDto: WithdrawDto = { amount: 50 };
      const req = { user: mockUser };

      const result = await controller.withdraw(withdrawDto, req);

      expect(result).toEqual({ message: 'Withdrawal successful' });
    });
  });

  describe('getStatement', () => {
    it('should execute get statement query', async () => {
      const lines = [new StatementLine(new Date('2024-01-01'), 100, 100)];
      getStatementHandler.execute.mockResolvedValue(lines);
      const req = { user: mockUser };

      const result = await controller.getStatement(req);

      expect(getStatementHandler.execute).toHaveBeenCalled();
      expect(result).toEqual(lines);
    });
  });

  describe('getBalance', () => {
    it('should execute get balance query', async () => {
      getBalanceHandler.execute.mockResolvedValue(150);
      const req = { user: mockUser };

      const result = await controller.getBalance(req);

      expect(getBalanceHandler.execute).toHaveBeenCalled();
      expect(result).toEqual({ balance: 150 });
    });
  });
});
