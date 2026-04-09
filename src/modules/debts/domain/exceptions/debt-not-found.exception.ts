import { NotFoundException } from '../../../../shared-kernel/domain/exceptions/not-found.exception';

export class DebtNotFoundException extends NotFoundException {
  constructor(id: string) {
    super('Debt', id);
  }
}
