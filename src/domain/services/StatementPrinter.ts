import { StatementLine } from '../../interface/dto/StatementLine';

export interface StatementPrinter {
  print(lines: StatementLine[]): void;
}
