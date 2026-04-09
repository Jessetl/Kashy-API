import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '../../../../shared-kernel/application/use-case';
import type { IDebtRepository } from '../../domain/interfaces/repositories/debt.repository.interface';
import { DEBT_REPOSITORY } from '../../domain/interfaces/repositories/debt.repository.interface';
import { DebtResponseDto } from '../dtos/debt-response.dto';
import { DebtMapper } from '../mappers/debt.mapper';
import { DebtNotFoundException } from '../../domain/exceptions/debt-not-found.exception';

interface PayDebtInput {
  debtId: string;
  userId: string;
}

@Injectable()
export class PayDebtUseCase implements UseCase<PayDebtInput, DebtResponseDto> {
  constructor(
    @Inject(DEBT_REPOSITORY)
    private readonly debtRepository: IDebtRepository,
  ) {}

  async execute(input: PayDebtInput): Promise<DebtResponseDto> {
    const existing = await this.debtRepository.findByIdAndUserId(
      input.debtId,
      input.userId,
    );

    if (!existing) {
      throw new DebtNotFoundException(input.debtId);
    }

    const paid = existing.markAsPaid();
    const saved = await this.debtRepository.save(paid);
    return DebtMapper.toResponse(saved);
  }
}
