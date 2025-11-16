import { Test, TestingModule } from '@nestjs/testing';
import { InMemoryBankAccountRepository } from './InMemoryBankAccountRepository';
import { BankAccount } from '../../domain/model/BankAccount';

describe('InMemoryBankAccountRepository', () => {
  let repository: InMemoryBankAccountRepository;
  const testDate = new Date('2024-01-01');

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InMemoryBankAccountRepository],
    }).compile();

    repository = module.get<InMemoryBankAccountRepository>(
      InMemoryBankAccountRepository,
    );
  });

  it('should return null when account does not exist', async () => {
    const account = await repository.findById('non-existent');
    expect(account).toBeNull();
  });

  it('should save and retrieve account', async () => {
    const account = new BankAccount('test-account');
    account.depositWithDate(100, testDate);

    await repository.save(account);
    const retrieved = await repository.findById('test-account');

    expect(retrieved).not.toBeNull();
    expect(retrieved?.getId()).toBe('test-account');
    expect(retrieved?.calculateBalance()).toBe(100);
  });

  it('should return a clone of the account', async () => {
    const account = new BankAccount('test-account');
    account.depositWithDate(100, testDate);

    await repository.save(account);
    const retrieved1 = await repository.findById('test-account');
    const retrieved2 = await repository.findById('test-account');

    expect(retrieved1).not.toBe(retrieved2);
    expect(retrieved1?.calculateBalance()).toBe(retrieved2?.calculateBalance());
  });

  it('should update existing account', async () => {
    const account = new BankAccount('test-account');
    account.depositWithDate(100, testDate);
    await repository.save(account);

    const retrieved = await repository.findById('test-account');
    retrieved?.depositWithDate(50, testDate);
    await repository.save(retrieved!);

    const updated = await repository.findById('test-account');
    expect(updated?.calculateBalance()).toBe(150);
  });
});
