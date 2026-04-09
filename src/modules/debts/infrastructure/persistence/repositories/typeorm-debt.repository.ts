import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import type { IDebtRepository } from '../../../domain/interfaces/repositories/debt.repository.interface';
import { Debt } from '../../../domain/entities/debt.entity';
import { DebtOrmEntity } from '../orm-entities/debt.orm-entity';
import { DebtPersistenceMapper } from '../mappers/debt-persistence.mapper';

@Injectable()
export class TypeOrmDebtRepository implements IDebtRepository {
  constructor(
    @InjectRepository(DebtOrmEntity)
    private readonly ormRepository: Repository<DebtOrmEntity>,
  ) {}

  async findById(id: string): Promise<Debt | null> {
    const orm = await this.ormRepository.findOne({ where: { id } });
    return orm ? DebtPersistenceMapper.toDomain(orm) : null;
  }

  async findByIdAndUserId(id: string, userId: string): Promise<Debt | null> {
    const orm = await this.ormRepository.findOne({ where: { id, userId } });
    return orm ? DebtPersistenceMapper.toDomain(orm) : null;
  }

  async findByUserId(
    userId: string,
    filters?: {
      priority?: string;
      isCollection?: boolean;
      isPaid?: boolean;
    },
  ): Promise<Debt[]> {
    const where: FindOptionsWhere<DebtOrmEntity> = { userId };

    if (filters?.priority) {
      where.priority = filters.priority as DebtOrmEntity['priority'];
    }
    if (filters?.isCollection !== undefined) {
      where.isCollection = filters.isCollection;
    }
    if (filters?.isPaid !== undefined) {
      where.isPaid = filters.isPaid;
    }

    const orms = await this.ormRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });

    return orms.map((orm) => DebtPersistenceMapper.toDomain(orm));
  }

  async save(debt: Debt): Promise<Debt> {
    const orm = DebtPersistenceMapper.toOrm(debt);
    const saved = await this.ormRepository.save(orm);
    return DebtPersistenceMapper.toDomain(saved);
  }

  async delete(id: string): Promise<void> {
    await this.ormRepository.delete(id);
  }
}
