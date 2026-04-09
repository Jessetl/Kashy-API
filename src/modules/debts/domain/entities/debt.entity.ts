import { BaseEntity } from '../../../../shared-kernel/domain/base-entity';
import { DebtPriority } from '../enums/debt-priority.enum';

interface DebtProps {
  userId: string;
  title: string;
  description: string | null;
  amountUsd: number;
  priority: DebtPriority;
  interestRatePct: number;
  interestAmountUsd: number;
  dueDate: Date | null;
  isPaid: boolean;
  isCollection: boolean;
  createdAt: Date;
}

export class Debt extends BaseEntity {
  readonly userId: string;
  readonly title: string;
  readonly description: string | null;
  readonly amountUsd: number;
  readonly priority: DebtPriority;
  readonly interestRatePct: number;
  readonly interestAmountUsd: number;
  readonly dueDate: Date | null;
  readonly isPaid: boolean;
  readonly isCollection: boolean;
  readonly createdAt: Date;

  private constructor(id: string, props: DebtProps) {
    super(id);
    this.userId = props.userId;
    this.title = props.title;
    this.description = props.description;
    this.amountUsd = props.amountUsd;
    this.priority = props.priority;
    this.interestRatePct = props.interestRatePct;
    this.interestAmountUsd = props.interestAmountUsd;
    this.dueDate = props.dueDate;
    this.isPaid = props.isPaid;
    this.isCollection = props.isCollection;
    this.createdAt = props.createdAt;
  }

  static create(
    id: string,
    userId: string,
    title: string,
    amountUsd: number,
    priority: DebtPriority = DebtPriority.MEDIUM,
    description: string | null = null,
    interestRatePct: number = 0,
    dueDate: Date | null = null,
    isCollection: boolean = false,
  ): Debt {
    const interestAmountUsd = amountUsd * (interestRatePct / 100);

    return new Debt(id, {
      userId,
      title,
      description,
      amountUsd,
      priority,
      interestRatePct,
      interestAmountUsd,
      dueDate,
      isPaid: false,
      isCollection,
      createdAt: new Date(),
    });
  }

  markAsPaid(): Debt {
    return new Debt(this.id, {
      userId: this.userId,
      title: this.title,
      description: this.description,
      amountUsd: this.amountUsd,
      priority: this.priority,
      interestRatePct: this.interestRatePct,
      interestAmountUsd: this.interestAmountUsd,
      dueDate: this.dueDate,
      isPaid: true,
      isCollection: this.isCollection,
      createdAt: this.createdAt,
    });
  }

  update(props: {
    title?: string;
    description?: string | null;
    amountUsd?: number;
    priority?: DebtPriority;
    interestRatePct?: number;
    dueDate?: Date | null;
    isCollection?: boolean;
  }): Debt {
    const newAmountUsd = props.amountUsd ?? this.amountUsd;
    const newInterestRatePct = props.interestRatePct ?? this.interestRatePct;
    const newInterestAmountUsd = newAmountUsd * (newInterestRatePct / 100);

    return new Debt(this.id, {
      userId: this.userId,
      title: props.title ?? this.title,
      description:
        props.description !== undefined
          ? props.description
          : this.description,
      amountUsd: newAmountUsd,
      priority: props.priority ?? this.priority,
      interestRatePct: newInterestRatePct,
      interestAmountUsd: newInterestAmountUsd,
      dueDate: props.dueDate !== undefined ? props.dueDate : this.dueDate,
      isPaid: this.isPaid,
      isCollection: props.isCollection ?? this.isCollection,
      createdAt: this.createdAt,
    });
  }

  static reconstitute(id: string, props: DebtProps): Debt {
    return new Debt(id, props);
  }
}
