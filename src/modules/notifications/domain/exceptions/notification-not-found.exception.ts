import { NotFoundException } from '../../../../shared-kernel/domain/exceptions/not-found.exception';

export class NotificationNotFoundException extends NotFoundException {
  constructor(id: string) {
    super('Notification', id);
  }
}
