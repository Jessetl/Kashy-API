import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '../../../../shared-kernel/application/use-case';
import type { IDebtRepository } from '../../domain/interfaces/repositories/debt.repository.interface';
import { DEBT_REPOSITORY } from '../../domain/interfaces/repositories/debt.repository.interface';
import { DebtResponseDto } from '../dtos/debt-response.dto';
import { DebtMapper } from '../mappers/debt.mapper';

interface GetDebtsInput {
  userId: string;
  priority?: string;
  isCollection?: boolean;
  isPaid?: boolean;
}

@Injectable()
export class GetDebtsUseCase implements UseCase<GetDebtsInput, DebtResponseDto[]> {
  constructor(
    @Inject(DEBT_REPOSITORY)
    private readonly debtRepository: IDebtRepository,
  ) {}

  async execute(input: GetDebtsInput): Promise<DebtResponseDto[]> {
    const debts = await this.debtRepository.findByUserId(input.userId, {
      priority: input.priority,
      isCollection: input.isCollection,
      isPaid: input.isPaid,
    });

    return debts.map((debt) => DebtMapper.toResponse(debt));
  }
}
