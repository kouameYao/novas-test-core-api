import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { BankAccountEntity } from './BankAccountEntity';
import { TransactionType } from '../../domain/model/TransactionType';

@Entity('transactions')
export class TransactionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  bankAccountId: string;

  @ManyToOne(() => BankAccountEntity, (account) => account.transactions)
  @JoinColumn({ name: 'bankAccountId' })
  bankAccount: BankAccountEntity;

  @Column({ type: 'varchar', length: 20 })
  type: TransactionType;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column('timestamp')
  date: Date;

  @CreateDateColumn()
  createdAt: Date;
}
