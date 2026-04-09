import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '../../../../shared-kernel/application/use-case';
import type { IDebtRepository } from '../../domain/interfaces/repositories/debt.repository.interface';
import { DEBT_REPOSITORY } from '../../domain/interfaces/repositories/debt.repository.interface';
import { DebtResponseDto } from '../dtos/debt-response.dto';
import { DebtMapper } from '../mappers/debt.mapper';
import { DebtNotFoundException } from '../../domain/exceptions/debt-not-found.exception';

interface GetDebtByIdInput {
  debtId: string;
  userId: string;
}

@Injectable()
export class GetDebtByIdUseCase implements UseCase<GetDebtByIdInput, DebtResponseDto> {
  constructor(
    @Inject(DEBT_REPOSITORY)
    private readonly debtRepository: IDebtRepository,
  ) {}

  async execute(input: GetDebtByIdInput): Promise<DebtResponseDto> {
    const debt = await this.debtRepository.findByIdAndUserId(
      input.debtId,
      input.userId,
    );

    if (!debt) {
      throw new DebtNotFoundException(input.debtId);
    }

    return DebtMapper.toResponse(debt);
  }
}
