import { Test, TestingModule } from '@nestjs/testing';
import { GetStatementHandler } from './GetStatementHandler';
import { GetStatementQuery } from '../implements/GetStatementQuery';
import { BankAccountRepository } from '../../../domain/ports/BankAccountRepository';
import { BankAccount } from '../../../domain/entities/BankAccount';

describe('GetStatementHandler', () => {
  let handler: GetStatementHandler;
  let repository: jest.Mocked<BankAccountRepository>;

  const accountId = 'test-account';
  const date1 = new Date('2024-01-01');
  const date2 = new Date('2024-01-02');
  const date3 = new Date('2024-01-03');

  beforeEach(async () => {
    const mockRepository: jest.Mocked<BankAccountRepository> = {
      findById: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetStatementHandler,
        {
          provide: 'BankAccountRepository',
          useValue: mockRepository,
        },
      ],
    }).compile();

    handler = module.get<GetStatementHandler>(GetStatementHandler);
    repository = module.get('BankAccountRepository');
  });

  it('should return empty array when account does not exist', async () => {
    repository.findById.mockResolvedValue(null);

    const query = new GetStatementQuery(accountId);
    const lines = await handler.execute(query);

    expect(lines).toEqual([]);
    expect(repository.findById).toHaveBeenCalledWith(accountId);
  });

  it('should return statement lines sorted DESC by date', async () => {
    const account = new BankAccount(accountId);
    account.depositWithDate(100, date1);
    account.depositWithDate(50, date2);
    account.withdrawWithDate(30, date3);
    repository.findById.mockResolvedValue(account);

    const query = new GetStatementQuery(accountId);
    const lines = await handler.execute(query);

    expect(lines).toHaveLength(3);
    // Should be sorted DESC by date
    expect(lines[0].date).toEqual(date3);
    expect(lines[0].amount).toBe(-30);
    expect(lines[0].balance).toBe(120);

    expect(lines[1].date).toEqual(date2);
    expect(lines[1].amount).toBe(50);
    expect(lines[1].balance).toBe(150);

    expect(lines[2].date).toEqual(date1);
    expect(lines[2].amount).toBe(100);
    expect(lines[2].balance).toBe(100);
  });

  it('should calculate running balance correctly', async () => {
    const account = new BankAccount(accountId);
    account.depositWithDate(100, date1);
    account.withdrawWithDate(30, date2);
    account.depositWithDate(50, date3);
    repository.findById.mockResolvedValue(account);

    const query = new GetStatementQuery(accountId);
    const lines = await handler.execute(query);

    expect(lines[0].balance).toBe(120); // 100 - 30 + 50
    expect(lines[1].balance).toBe(70); // 100 - 30
    expect(lines[2].balance).toBe(100); // 100
  });
});
