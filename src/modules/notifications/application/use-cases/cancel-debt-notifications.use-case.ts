import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '../../../../shared-kernel/application/use-case';
import type { INotificationRepository } from '../../domain/interfaces/repositories/notification.repository.interface';
import { NOTIFICATION_REPOSITORY } from '../../domain/interfaces/repositories/notification.repository.interface';

interface CancelDebtNotificationsInput {
  debtId: string;
}

@Injectable()
export class CancelDebtNotificationsUseCase
  implements UseCase<CancelDebtNotificationsInput, void>
{
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: INotificationRepository,
  ) {}

  async execute(input: CancelDebtNotificationsInput): Promise<void> {
    await this.notificationRepository.deleteByDebtId(input.debtId);
  }
}
