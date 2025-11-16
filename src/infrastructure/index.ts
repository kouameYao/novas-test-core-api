import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BankAccountController } from './controllers/BankAccountController';
import { DepositHandler } from '../application/commands/handlers/DepositHandler';
import { WithdrawHandler } from '../application/commands/handlers/WithdrawHandler';
import { GetBalanceHandler } from '../application/queries/handlers/GetBalanceHandler';
import { GetStatementHandler } from '../application/queries/handlers/GetStatementHandler';
import { TypeOrmBankAccountRepository } from './adapters/TypeOrmBankAccountRepository';
import { BankAccountEntity } from './entities/BankAccountEntity';
import { TransactionEntity } from './entities/TransactionEntity';
import { SystemClock } from './adapters/SystemClock';
import { ConsoleStatementPrinter } from './adapters/ConsoleStatementPrinter';

@Module({
  imports: [
    TypeOrmModule.forFeature([BankAccountEntity, TransactionEntity]),
  ],
  controllers: [BankAccountController],
  providers: [
    // Adapters (Infrastructure) - must be provided first
    {
      provide: 'BankAccountRepository',
      useClass: TypeOrmBankAccountRepository,
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
      useClass: TypeOrmBankAccountRepository,
    },
  ],
})
export class BankAccountModule {}
