import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { UseCase } from '../../../../shared-kernel/application/use-case';
import type { IDebtRepository } from '../../domain/interfaces/repositories/debt.repository.interface';
import { DEBT_REPOSITORY } from '../../domain/interfaces/repositories/debt.repository.interface';
import { Debt } from '../../domain/entities/debt.entity';
import { DebtPriority } from '../../domain/enums/debt-priority.enum';
import { CreateDebtDto } from '../dtos/create-debt.dto';
import { DebtResponseDto } from '../dtos/debt-response.dto';
import { DebtMapper } from '../mappers/debt.mapper';
import { ScheduleDebtNotificationUseCase } from '../../../notifications/application/use-cases/schedule-debt-notification.use-case';

interface CreateDebtInput {
  userId: string;
  dto: CreateDebtDto;
}

@Injectable()
export class CreateDebtUseCase implements UseCase<
  CreateDebtInput,
  DebtResponseDto
> {
  private readonly logger = new Logger(CreateDebtUseCase.name);

  constructor(
    @Inject(DEBT_REPOSITORY)
    private readonly debtRepository: IDebtRepository,
    @Optional()
    private readonly scheduleNotification?: ScheduleDebtNotificationUseCase,
  ) {}

  async execute(input: CreateDebtInput): Promise<DebtResponseDto> {
    const debt = Debt.create(
      randomUUID(),
      input.userId,
      input.dto.title,
      input.dto.amountUsd,
      input.dto.priority ?? DebtPriority.MEDIUM,
      input.dto.description ?? null,
      input.dto.interestRatePct ?? 0,
      input.dto.dueDate ? new Date(input.dto.dueDate) : null,
      input.dto.isCollection ?? false,
    );

    const saved = await this.debtRepository.save(debt);

    if (saved.dueDate && this.scheduleNotification) {
      try {
        await this.scheduleNotification.execute({
          userId: saved.userId,
          debtId: saved.id,
          dueDate: saved.dueDate,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.error(`Failed to schedule notification: ${message}`);
      }
    }

    return DebtMapper.toResponse(saved);
  }
}
