import { Notification } from '../../domain/entities/notification.entity';
import { NotificationResponseDto } from '../dtos/notification-response.dto';

export class NotificationMapper {
  static toResponse(notification: Notification): NotificationResponseDto {
    const dto = new NotificationResponseDto();
    dto.id = notification.id;
    dto.userId = notification.userId;
    dto.debtId = notification.debtId;
    dto.type = notification.type;
    dto.scheduledAt = notification.scheduledAt;
    dto.sentAt = notification.sentAt;
    dto.status = notification.status;
    return dto;
  }
}
