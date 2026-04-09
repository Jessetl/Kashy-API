import { Debt } from '../../domain/entities/debt.entity';
import { DebtResponseDto } from '../dtos/debt-response.dto';

export class DebtMapper {
  static toResponse(debt: Debt): DebtResponseDto {
    const dto = new DebtResponseDto();
    dto.id = debt.id;
    dto.userId = debt.userId;
    dto.title = debt.title;
    dto.description = debt.description;
    dto.amountUsd = debt.amountUsd;
    dto.priority = debt.priority;
    dto.interestRatePct = debt.interestRatePct;
    dto.interestAmountUsd = debt.interestAmountUsd;
    dto.dueDate = debt.dueDate;
    dto.isPaid = debt.isPaid;
    dto.isCollection = debt.isCollection;
    dto.createdAt = debt.createdAt;
    return dto;
  }
}
