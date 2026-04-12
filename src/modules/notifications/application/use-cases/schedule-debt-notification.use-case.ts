import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { UseCase } from '../../../../shared-kernel/application/use-case';
import type { INotificationRepository } from '../../domain/interfaces/repositories/notification.repository.interface';
import { NOTIFICATION_REPOSITORY } from '../../domain/interfaces/repositories/notification.repository.interface';
import type { IUserRepository } from '../../../users/domain/interfaces/repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../../users/domain/interfaces/repositories/user.repository.interface';
import { Notification } from '../../domain/entities/notification.entity';
import { NotificationResponseDto } from '../dtos/notification-response.dto';
import { NotificationMapper } from '../mappers/notification.mapper';

interface ScheduleDebtNotificationInput {
  userId: string;
  debtId: string;
  dueDate: Date;
}

@Injectable()
export class ScheduleDebtNotificationUseCase
  implements UseCase<ScheduleDebtNotificationInput, NotificationResponseDto | null>
{
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: INotificationRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    input: ScheduleDebtNotificationInput,
  ): Promise<NotificationResponseDto | null> {
    const user = await this.userRepository.findById(input.userId);
    if (!user || !user.notificationEnabled) {
      return null;
    }

    // Cancel existing notifications for this debt
    await this.notificationRepository.deleteByDebtId(input.debtId);

    // scheduled_at = due_date - 24h
    const scheduledAt = new Date(input.dueDate.getTime() - 24 * 60 * 60 * 1000);

    // Don't schedule if the notification time has already passed
    if (scheduledAt <= new Date()) {
      return null;
    }

    const notification = Notification.create(
      randomUUID(),
      input.userId,
      input.debtId,
      scheduledAt,
    );

    const saved = await this.notificationRepository.save(notification);
    return NotificationMapper.toResponse(saved);
  }
}
