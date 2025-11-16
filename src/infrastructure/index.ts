import { Module } from '@nestjs/common';
import { BankAccountController } from './controllers/BankAccountController';
import { DepositHandler } from '../application/commands/handlers/DepositHandler';
import { WithdrawHandler } from '../application/commands/handlers/WithdrawHandler';
import { GetBalanceHandler } from '../application/queries/handlers/GetBalanceHandler';
import { GetStatementHandler } from '../application/queries/handlers/GetStatementHandler';
import { PrismaBankAccountRepository } from './adapters/PrismaBankAccountRepository';
import { SystemClock } from './adapters/SystemClock';
import { ConsoleStatementPrinter } from './adapters/ConsoleStatementPrinter';

@Module({
  controllers: [BankAccountController],
  providers: [
    // Adapters (Infrastructure) - must be provided first
    {
      provide: 'BankAccountRepository',
      useClass: PrismaBankAccountRepository,
    },
    {
      provide: 'Clock',
      useClass: SystemClock,
    },
    {
      provide: 'StatementPrinter',
      useClass: ConsoleStatementPrinter,
    },
    // Handlers
    DepositHandler,
    WithdrawHandler,
    GetBalanceHandler,
    GetStatementHandler,
  ],
  exports: [
    {
      provide: 'BankAccountRepository',
      useClass: PrismaBankAccountRepository,
    },
  ],
})
export class BankAccountModule {}
