export const NOTIFICATION_QUEUE_SERVICE = Symbol('NOTIFICATION_QUEUE_SERVICE');

export interface NotificationMessage {
  notificationId: string;
  userId: string;
  debtId: string;
  debtTitle: string;
  fcmToken: string;
}

export interface INotificationQueueService {
  publish(message: NotificationMessage): Promise<void>;
}
