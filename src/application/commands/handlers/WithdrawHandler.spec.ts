import { Test, TestingModule } from '@nestjs/testing';
import { WithdrawHandler } from './WithdrawHandler';
import { WithdrawCommand } from '../implements/WithdrawCommand';
import { BankAccountRepository } from '../../../domain/ports/BankAccountRepository';
import { Clock } from '../../../domain/services/Clock';
import { BankAccount } from '../../../domain/model/BankAccount';
import { InsufficientFundsError } from '../../../domain/errors/InsufficientFundsError';

describe('WithdrawHandler', () => {
  let handler: WithdrawHandler;
  let repository: jest.Mocked<BankAccountRepository>;
  let clock: jest.Mocked<Clock>;

  const testDate = new Date('2024-01-01');
  const accountId = 'test-account';

  beforeEach(async () => {
    const mockRepository: jest.Mocked<BankAccountRepository> = {
      findById: jest.fn(),
      save: jest.fn(),
    };

    const mockClock: jest.Mocked<Clock> = {
      now: jest.fn().mockReturnValue(testDate),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WithdrawHandler,
        {
          provide: 'BankAccountRepository',
          useValue: mockRepository,
        },
        {
          provide: 'Clock',
          useValue: mockClock,
        },
      ],
    }).compile();

    handler = module.get<WithdrawHandler>(WithdrawHandler);
    repository = module.get('BankAccountRepository');
    clock = module.get('Clock');
  });

  it('should withdraw when sufficient balance', async () => {
    const account = new BankAccount(accountId);
    account.depositWithDate(100, testDate);
    repository.findById.mockResolvedValue(account);

    const command = new WithdrawCommand(accountId, 30);
    await handler.execute(command);

    expect(repository.findById).toHaveBeenCalledWith(accountId);
    expect(repository.save).toHaveBeenCalled();
    const savedAccount = repository.save.mock.calls[0][0];
    expect(savedAccount.calculateBalance()).toBe(70);
  });

  it('should throw error when account does not exist', async () => {
    repository.findById.mockResolvedValue(null);

    const command = new WithdrawCommand(accountId, 30);
    await expect(handler.execute(command)).rejects.toThrow(
      `Account ${accountId} not found`,
    );
  });

  it('should throw InsufficientFundsError when balance is insufficient', async () => {
    const account = new BankAccount(accountId);
    account.depositWithDate(50, testDate);
    repository.findById.mockResolvedValue(account);

    const command = new WithdrawCommand(accountId, 100);
    await expect(handler.execute(command)).rejects.toThrow(
      InsufficientFundsError,
    );
  });

  it('should use clock for transaction date', async () => {
    const account = new BankAccount(accountId);
    account.depositWithDate(100, testDate);
    repository.findById.mockResolvedValue(account);

    const command = new WithdrawCommand(accountId, 30);
    await handler.execute(command);

    expect(clock.now).toHaveBeenCalled();
  });
});
