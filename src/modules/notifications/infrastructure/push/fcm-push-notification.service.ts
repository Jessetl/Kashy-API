import { Inject, Injectable, Logger } from '@nestjs/common';
import type * as admin from 'firebase-admin';
import { FIREBASE_ADMIN } from '../../../../shared-kernel/infrastructure/firebase/firebase-admin.provider';
import type { IPushNotificationService } from '../../domain/interfaces/push-notification.service.interface';

@Injectable()
export class FcmPushNotificationService implements IPushNotificationService {
  private readonly logger = new Logger(FcmPushNotificationService.name);

  constructor(
    @Inject(FIREBASE_ADMIN)
    private readonly firebaseAdmin: admin.app.App,
  ) {}

  async sendPush(
    fcmToken: string,
    title: string,
    body: string,
  ): Promise<boolean> {
    try {
      await this.firebaseAdmin.messaging().send({
        token: fcmToken,
        notification: { title, body },
        android: {
          priority: 'high',
          notification: {
            channelId: 'debt_reminders',
            priority: 'high',
          },
        },
        apns: {
          payload: {
            aps: {
              alert: { title, body },
              sound: 'default',
              badge: 1,
            },
          },
        },
      });

      this.logger.debug(`Push sent to token ${fcmToken.substring(0, 10)}...`);
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`FCM send failed: ${message}`);
      return false;
    }
  }
}
