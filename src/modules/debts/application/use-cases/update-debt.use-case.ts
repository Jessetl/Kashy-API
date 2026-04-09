import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '../../../../shared-kernel/application/use-case';
import type { IDebtRepository } from '../../domain/interfaces/repositories/debt.repository.interface';
import { DEBT_REPOSITORY } from '../../domain/interfaces/repositories/debt.repository.interface';
import { UpdateDebtDto } from '../dtos/update-debt.dto';
import { DebtResponseDto } from '../dtos/debt-response.dto';
import { DebtMapper } from '../mappers/debt.mapper';
import { DebtNotFoundException } from '../../domain/exceptions/debt-not-found.exception';

interface UpdateDebtInput {
  debtId: string;
  userId: string;
  dto: UpdateDebtDto;
}

@Injectable()
export class UpdateDebtUseCase implements UseCase<UpdateDebtInput, DebtResponseDto> {
  constructor(
    @Inject(DEBT_REPOSITORY)
    private readonly debtRepository: IDebtRepository,
  ) {}

  async execute(input: UpdateDebtInput): Promise<DebtResponseDto> {
    const existing = await this.debtRepository.findByIdAndUserId(
      input.debtId,
      input.userId,
    );

    if (!existing) {
      throw new DebtNotFoundException(input.debtId);
    }

    const updated = existing.update({
      title: input.dto.title,
      description:
        input.dto.description !== undefined
          ? input.dto.description
          : undefined,
      amountUsd: input.dto.amountUsd,
      priority: input.dto.priority,
      interestRatePct: input.dto.interestRatePct,
      dueDate:
        input.dto.dueDate !== undefined
          ? input.dto.dueDate
            ? new Date(input.dto.dueDate)
            : null
          : undefined,
      isCollection: input.dto.isCollection,
    });

    const saved = await this.debtRepository.save(updated);
    return DebtMapper.toResponse(saved);
  }
}
