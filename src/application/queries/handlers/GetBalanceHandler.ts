import { Injectable, Inject } from '@nestjs/common';
import { GetBalanceQuery } from '../implements/GetBalanceQuery';
import { BankAccountRepository } from '../../../domain/ports/BankAccountRepository';

@Injectable()
export class GetBalanceHandler {
  constructor(
    @Inject('BankAccountRepository')
    private readonly repository: BankAccountRepository,
  ) {}

  async execute(query: GetBalanceQuery): Promise<number> {
    const account = await this.repository.findById(query.accountId);

    if (!account) {
      return 0;
    }

    return account.calculateBalance();
  }
}
