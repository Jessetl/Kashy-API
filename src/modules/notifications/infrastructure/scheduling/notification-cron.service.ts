import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ProcessPendingNotificationsUseCase } from '../../application/use-cases/process-pending-notifications.use-case';

@Injectable()
export class NotificationCronService {
  private readonly logger = new Logger(NotificationCronService.name);

  constructor(
    private readonly processPending: ProcessPendingNotificationsUseCase,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handlePendingNotifications(): Promise<void> {
    this.logger.debug('Checking for pending notifications...');
    try {
      const count = await this.processPending.execute();
      if (count > 0) {
        this.logger.log(`Processed ${count} pending notifications`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Cron error: ${message}`);
    }
  }
}
