import {
  Entity,
  PrimaryColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TransactionEntity } from './TransactionEntity';

@Entity('bank_accounts')
export class BankAccountEntity {
  @PrimaryColumn('uuid')
  id: string;

  @OneToMany(
    () => TransactionEntity,
    (transaction) => transaction.bankAccount,
    {
      cascade: true,
      eager: true,
    },
  )
  transactions: TransactionEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
