import { Test, TestingModule } from '@nestjs/testing';
import { DepositHandler } from './DepositHandler';
import { DepositCommand } from '../implements/DepositCommand';
import { BankAccountRepository } from '../../../domain/ports/BankAccountRepository';
import { Clock } from '../../../domain/services/Clock';
import { BankAccount } from '../../../domain/model/BankAccount';

describe('DepositHandler', () => {
  let handler: DepositHandler;
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
        DepositHandler,
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

    handler = module.get<DepositHandler>(DepositHandler);
    repository = module.get('BankAccountRepository');
    clock = module.get('Clock');
  });

  it('should create account and deposit when account does not exist', async () => {
    repository.findById.mockResolvedValue(null);

    const command = new DepositCommand(accountId, 100);
    await handler.execute(command);

    expect(repository.findById).toHaveBeenCalledWith(accountId);
    expect(repository.save).toHaveBeenCalled();
    const savedAccount = repository.save.mock.calls[0][0];
    expect(savedAccount.calculateBalance()).toBe(100);
  });

  it('should deposit to existing account', async () => {
    const existingAccount = new BankAccount(accountId);
    existingAccount.depositWithDate(50, testDate);
    repository.findById.mockResolvedValue(existingAccount);

    const command = new DepositCommand(accountId, 100);
    await handler.execute(command);

    expect(repository.findById).toHaveBeenCalledWith(accountId);
    expect(repository.save).toHaveBeenCalled();
    const savedAccount = repository.save.mock.calls[0][0];
    expect(savedAccount.calculateBalance()).toBe(150);
  });

  it('should use clock for transaction date', async () => {
    repository.findById.mockResolvedValue(null);

    const command = new DepositCommand(accountId, 100);
    await handler.execute(command);

    expect(clock.now).toHaveBeenCalled();
  });

  it('should throw error for negative amount', async () => {
    repository.findById.mockResolvedValue(null);

    const command = new DepositCommand(accountId, -10);
    await expect(handler.execute(command)).rejects.toThrow();
  });
});
