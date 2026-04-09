import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '../../../../shared-kernel/application/use-case';
import type { IDebtRepository } from '../../domain/interfaces/repositories/debt.repository.interface';
import { DEBT_REPOSITORY } from '../../domain/interfaces/repositories/debt.repository.interface';
import { DebtNotFoundException } from '../../domain/exceptions/debt-not-found.exception';
import { DeleteDebtResponseDto } from '../dtos/delete-debt-response.dto';

interface DeleteDebtInput {
  debtId: string;
  userId: string;
}

@Injectable()
export class DeleteDebtUseCase implements UseCase<DeleteDebtInput, DeleteDebtResponseDto> {
  constructor(
    @Inject(DEBT_REPOSITORY)
    private readonly debtRepository: IDebtRepository,
  ) {}

  async execute(input: DeleteDebtInput): Promise<DeleteDebtResponseDto> {
    const existing = await this.debtRepository.findByIdAndUserId(
      input.debtId,
      input.userId,
    );

    if (!existing) {
      throw new DebtNotFoundException(input.debtId);
    }

    await this.debtRepository.delete(input.debtId);

    return { message: 'Deuda eliminada exitosamente' };
  }
}
