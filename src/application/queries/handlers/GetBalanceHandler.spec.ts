import { Test, TestingModule } from '@nestjs/testing';
import { GetBalanceHandler } from './GetBalanceHandler';
import { GetBalanceQuery } from '../implements/GetBalanceQuery';
import { BankAccountRepository } from '../../../ports/BankAccountRepository';
import { BankAccount } from '../../../domain/model/BankAccount';

describe('GetBalanceHandler', () => {
  let handler: GetBalanceHandler;
  let repository: jest.Mocked<BankAccountRepository>;

  const testDate = new Date('2024-01-01');
  const accountId = 'test-account';

  beforeEach(async () => {
    const mockRepository: jest.Mocked<BankAccountRepository> = {
      findById: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetBalanceHandler,
        {
          provide: 'BankAccountRepository',
          useValue: mockRepository,
        },
      ],
    }).compile();

    handler = module.get<GetBalanceHandler>(GetBalanceHandler);
    repository = module.get('BankAccountRepository');
  });

  it('should return 0 when account does not exist', async () => {
    repository.findById.mockResolvedValue(null);

    const query = new GetBalanceQuery(accountId);
    const balance = await handler.execute(query);

    expect(balance).toBe(0);
    expect(repository.findById).toHaveBeenCalledWith(accountId);
  });

  it('should return correct balance for existing account', async () => {
    const account = new BankAccount(accountId);
    account.depositWithDate(100, testDate);
    account.depositWithDate(50, testDate);
    account.withdrawWithDate(30, testDate);
    repository.findById.mockResolvedValue(account);

    const query = new GetBalanceQuery(accountId);
    const balance = await handler.execute(query);

    expect(balance).toBe(120);
    expect(repository.findById).toHaveBeenCalledWith(accountId);
  });
});
