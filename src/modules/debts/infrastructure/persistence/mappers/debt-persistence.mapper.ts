import { Debt } from '../../../domain/entities/debt.entity';
import { DebtOrmEntity } from '../orm-entities/debt.orm-entity';

export class DebtPersistenceMapper {
  static toDomain(orm: DebtOrmEntity): Debt {
    return Debt.reconstitute(orm.id, {
      userId: orm.userId,
      title: orm.title,
      description: orm.description,
      amountUsd: Number(orm.amountUsd),
      priority: orm.priority,
      interestRatePct: Number(orm.interestRatePct),
      interestAmountUsd: Number(orm.interestAmountUsd),
      dueDate: orm.dueDate,
      isPaid: orm.isPaid,
      isCollection: orm.isCollection,
      createdAt: orm.createdAt,
    });
  }

  static toOrm(debt: Debt): DebtOrmEntity {
    const orm = new DebtOrmEntity();
    orm.id = debt.id;
    orm.userId = debt.userId;
    orm.title = debt.title;
    orm.description = debt.description;
    orm.amountUsd = debt.amountUsd;
    orm.priority = debt.priority;
    orm.interestRatePct = debt.interestRatePct;
    orm.interestAmountUsd = debt.interestAmountUsd;
    orm.dueDate = debt.dueDate;
    orm.isPaid = debt.isPaid;
    orm.isCollection = debt.isCollection;
    orm.createdAt = debt.createdAt;
    return orm;
  }
}
