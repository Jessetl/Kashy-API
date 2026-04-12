import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { UseCase } from '../../../../shared-kernel/application/use-case';
import type { IDebtRepository } from '../../domain/interfaces/repositories/debt.repository.interface';
import { DEBT_REPOSITORY } from '../../domain/interfaces/repositories/debt.repository.interface';
import { UpdateDebtDto } from '../dtos/update-debt.dto';
import { DebtResponseDto } from '../dtos/debt-response.dto';
import { DebtMapper } from '../mappers/debt.mapper';
import { DebtNotFoundException } from '../../domain/exceptions/debt-not-found.exception';
import { ScheduleDebtNotificationUseCase } from '../../../notifications/application/use-cases/schedule-debt-notification.use-case';
import { CancelDebtNotificationsUseCase } from '../../../notifications/application/use-cases/cancel-debt-notifications.use-case';

interface UpdateDebtInput {
  debtId: string;
  userId: string;
  dto: UpdateDebtDto;
}

@Injectable()
export class UpdateDebtUseCase implements UseCase<UpdateDebtInput, DebtResponseDto> {
  private readonly logger = new Logger(UpdateDebtUseCase.name);

  constructor(
    @Inject(DEBT_REPOSITORY)
    private readonly debtRepository: IDebtRepository,
    @Optional()
    private readonly scheduleNotification?: ScheduleDebtNotificationUseCase,
    @Optional()
    private readonly cancelNotifications?: CancelDebtNotificationsUseCase,
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

    // Reschedule notification if due_date changed
    if (input.dto.dueDate !== undefined) {
      try {
        if (saved.dueDate && this.scheduleNotification) {
          await this.scheduleNotification.execute({
            userId: saved.userId,
            debtId: saved.id,
            dueDate: saved.dueDate,
          });
        } else if (!saved.dueDate && this.cancelNotifications) {
          await this.cancelNotifications.execute({ debtId: saved.id });
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.error(`Failed to update notification: ${message}`);
      }
    }

    return DebtMapper.toResponse(saved);
  }
}
