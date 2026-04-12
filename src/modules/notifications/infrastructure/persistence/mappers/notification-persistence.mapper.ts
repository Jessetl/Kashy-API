import { Notification } from '../../../domain/entities/notification.entity';
import { NotificationOrmEntity } from '../orm-entities/notification.orm-entity';

export class NotificationPersistenceMapper {
  static toDomain(orm: NotificationOrmEntity): Notification {
    return Notification.reconstitute(orm.id, {
      userId: orm.userId,
      debtId: orm.debtId,
      type: orm.type,
      scheduledAt: orm.scheduledAt,
      sentAt: orm.sentAt,
      status: orm.status,
    });
  }

  static toOrm(notification: Notification): NotificationOrmEntity {
    const orm = new NotificationOrmEntity();
    orm.id = notification.id;
    orm.userId = notification.userId;
    orm.debtId = notification.debtId;
    orm.type = notification.type;
    orm.scheduledAt = notification.scheduledAt;
    orm.sentAt = notification.sentAt;
    orm.status = notification.status;
    return orm;
  }
}
