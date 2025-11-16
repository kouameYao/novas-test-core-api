import { StatementLine } from '../../application/dto/StatementLine';

export interface StatementPrinter {
  print(lines: StatementLine[]): void;
}
