import { BaseEntity } from '../../../../shared-kernel/domain/base-entity';
import { NotificationStatus } from '../enums/notification-status.enum';

interface NotificationProps {
  userId: string;
  debtId: string;
  type: string;
  scheduledAt: Date;
  sentAt: Date | null;
  status: NotificationStatus;
}

export class Notification extends BaseEntity {
  readonly userId: string;
  readonly debtId: string;
  readonly type: string;
  readonly scheduledAt: Date;
  readonly sentAt: Date | null;
  readonly status: NotificationStatus;

  private constructor(id: string, props: NotificationProps) {
    super(id);
    this.userId = props.userId;
    this.debtId = props.debtId;
    this.type = props.type;
    this.scheduledAt = props.scheduledAt;
    this.sentAt = props.sentAt;
    this.status = props.status;
  }

  static create(
    id: string,
    userId: string,
    debtId: string,
    scheduledAt: Date,
    type: string = 'debt_due_reminder',
  ): Notification {
    return new Notification(id, {
      userId,
      debtId,
      type,
      scheduledAt,
      sentAt: null,
      status: NotificationStatus.PENDING,
    });
  }

  markAsSent(): Notification {
    return new Notification(this.id, {
      userId: this.userId,
      debtId: this.debtId,
      type: this.type,
      scheduledAt: this.scheduledAt,
      sentAt: new Date(),
      status: NotificationStatus.SENT,
    });
  }

  markAsFailed(): Notification {
    return new Notification(this.id, {
      userId: this.userId,
      debtId: this.debtId,
      type: this.type,
      scheduledAt: this.scheduledAt,
      sentAt: null,
      status: NotificationStatus.FAILED,
    });
  }

  static reconstitute(id: string, props: NotificationProps): Notification {
    return new Notification(id, props);
  }
}
