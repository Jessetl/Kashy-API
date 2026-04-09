import { Debt } from '../../entities/debt.entity';

export const DEBT_REPOSITORY = Symbol('DEBT_REPOSITORY');

export interface IDebtRepository {
  findById(id: string): Promise<Debt | null>;
  findByIdAndUserId(id: string, userId: string): Promise<Debt | null>;
  findByUserId(
    userId: string,
    filters?: {
      priority?: string;
      isCollection?: boolean;
      isPaid?: boolean;
    },
  ): Promise<Debt[]>;
  save(debt: Debt): Promise<Debt>;
  delete(id: string): Promise<void>;
}
