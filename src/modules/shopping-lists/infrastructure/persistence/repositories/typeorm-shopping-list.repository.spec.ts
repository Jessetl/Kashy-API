import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { In, type Repository } from 'typeorm';
import { ShoppingItem } from '../../../domain/entities/shopping-item.entity';
import { ShoppingList } from '../../../domain/entities/shopping-list.entity';
import { ShoppingListStatus } from '../../../domain/enums/shopping-list-status.enum';
import { ShoppingItemOrmEntity } from '../orm-entities/shopping-item.orm-entity';
import { ShoppingListOrmEntity } from '../orm-entities/shopping-list.orm-entity';
import { TypeOrmShoppingListRepository } from './typeorm-shopping-list.repository';

function buildListOrm(id: string, userId = 'user-1'): ShoppingListOrmEntity {
  const item = new ShoppingItemOrmEntity();
  item.id = `${id}-item-1`;
  item.listId = id;
  item.productName = 'Harina';
  item.category = 'Comida';
  item.unitPriceLocal = '40.00' as unknown as number;
  item.quantity = 1;
  item.totalLocal = '40.00' as unknown as number;
  item.unitPriceUsd = '2.00' as unknown as number;
  item.totalUsd = '2.00' as unknown as number;
  item.isPurchased = false;
  item.createdAt = new Date('2026-04-01T00:00:00.000Z');

  const orm = new ShoppingListOrmEntity();
  orm.id = id;
  orm.userId = userId;
  orm.name = `List ${id}`;
  orm.storeName = 'Store';
  orm.status = ShoppingListStatus.ACTIVE;
  orm.ivaEnabled = false;
  orm.totalLocal = '40.00' as unknown as number;
  orm.totalUsd = '2.00' as unknown as number;
  orm.exchangeRateSnapshot = '20.00' as unknown as number;
  orm.createdAt = new Date('2026-04-01T00:00:00.000Z');
  orm.completedAt = null;
  orm.items = [item];
  return orm;
}

describe('TypeOrmShoppingListRepository', () => {
  let ormRepository: jest.Mocked<Repository<ShoppingListOrmEntity>>;
  let itemOrmRepository: jest.Mocked<Repository<ShoppingItemOrmEntity>>;
  let repository: TypeOrmShoppingListRepository;

  beforeEach(() => {
    ormRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
      findAndCount: jest.fn(),
      createQueryBuilder: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<Repository<ShoppingListOrmEntity>>;

    itemOrmRepository = {
      save: jest.fn(),
    } as unknown as jest.Mocked<Repository<ShoppingItemOrmEntity>>;

    repository = new TypeOrmShoppingListRepository(
      ormRepository,
      itemOrmRepository,
    );
  });

  it('findById retorna dominio o null', async () => {
    ormRepository.findOne.mockResolvedValueOnce(buildListOrm('list-1'));
    ormRepository.findOne.mockResolvedValueOnce(null);

    const found = await repository.findById('list-1');
    const missing = await repository.findById('missing');

    expect(ormRepository.findOne).toHaveBeenNthCalledWith(1, {
      where: { id: 'list-1' },
      relations: ['items'],
    });
    expect(found?.id).toBe('list-1');
    expect(missing).toBeNull();
  });

  it('findByIdAndUserId retorna dominio o null', async () => {
    ormRepository.findOne.mockResolvedValueOnce(
      buildListOrm('list-1', 'user-1'),
    );
    ormRepository.findOne.mockResolvedValueOnce(null);

    const found = await repository.findByIdAndUserId('list-1', 'user-1');
    const missing = await repository.findByIdAndUserId('list-1', 'user-2');

    expect(found?.userId).toBe('user-1');
    expect(missing).toBeNull();
  });

  it('findActiveByUserId filtra ACTIVE y ordena desc', async () => {
    ormRepository.find.mockResolvedValue([buildListOrm('l1')]);

    const result = await repository.findActiveByUserId('user-1');

    expect(ormRepository.find).toHaveBeenCalledWith({
      where: { userId: 'user-1', status: ShoppingListStatus.ACTIVE },
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
    expect(result).toHaveLength(1);
  });

  it('save persiste y recarga relaciones', async () => {
    const domain = ShoppingList.create(
      'list-1',
      'user-1',
      'Compra',
      'Store',
      false,
      [
        ShoppingItem.create(
          'item-1',
          'list-1',
          'Harina',
          'Comida',
          10,
          1,
          1,
          null,
          false,
        ),
      ],
    );

    ormRepository.save.mockResolvedValue({
      id: 'list-1',
    } as ShoppingListOrmEntity);
    ormRepository.findOne.mockResolvedValue(buildListOrm('list-1'));

    const saved = await repository.save(domain);

    expect(ormRepository.save).toHaveBeenCalledTimes(1);
    expect(ormRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'list-1' },
      relations: ['items'],
    });
    expect(saved.id).toBe('list-1');
  });

  it('findCompletedByUserId aplica paginacion', async () => {
    const completed = buildListOrm('c1');
    completed.status = ShoppingListStatus.COMPLETED;
    completed.completedAt = new Date('2026-04-02T00:00:00.000Z');

    ormRepository.findAndCount.mockResolvedValue([[completed], 1]);

    const result = await repository.findCompletedByUserId('user-1', 2, 10);

    expect(ormRepository.findAndCount).toHaveBeenCalledWith({
      where: { userId: 'user-1', status: ShoppingListStatus.COMPLETED },
      relations: ['items'],
      order: { completedAt: 'DESC' },
      skip: 10,
      take: 10,
    });
    expect(result.total).toBe(1);
    expect(result.page).toBe(2);
  });

  it('findByIdsAndUserId retorna [] para ids vacio y consulta con In para ids con datos', async () => {
    const empty = await repository.findByIdsAndUserId([], 'user-1');
    expect(empty).toEqual([]);
    expect(ormRepository.find).not.toHaveBeenCalled();

    ormRepository.find.mockResolvedValue([
      buildListOrm('l1'),
      buildListOrm('l2'),
    ]);
    const result = await repository.findByIdsAndUserId(['l1', 'l2'], 'user-1');

    expect(ormRepository.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: 'user-1',
          id: In(['l1', 'l2']),
        }),
        relations: ['items'],
        order: { createdAt: 'DESC' },
      }),
    );
    expect(result).toHaveLength(2);
  });

  it('getSpendingStats construye query por week/month y mapea numeros', async () => {
    const queryBuilder = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      getRawMany: jest.fn(),
    };

    ormRepository.createQueryBuilder.mockReturnValue(queryBuilder as never);
    queryBuilder.getRawMany.mockResolvedValue([
      {
        period: '2026-04-01',
        totalLocal: '100.5',
        totalUsd: '5.25',
        listCount: '2',
      },
    ]);

    const weekResult = await repository.getSpendingStats('user-1', 'week');
    expect(queryBuilder.select).toHaveBeenCalledWith(
      expect.stringContaining("date_trunc('week'"),
      'period',
    );
    expect(weekResult[0].totalLocal).toBe(100.5);
    expect(weekResult[0].listCount).toBe(2);

    queryBuilder.getRawMany.mockResolvedValue([]);
    await repository.getSpendingStats('user-1', 'month');
    expect(queryBuilder.select).toHaveBeenLastCalledWith(
      expect.stringContaining("date_trunc('month'"),
      'period',
    );
  });

  it('addItemsToList persiste items y actualiza totales de lista', async () => {
    const domainItems = [
      ShoppingItem.create(
        'item-1',
        'list-1',
        'Harina',
        'Comida',
        40,
        1,
        2,
        null,
        false,
      ),
    ];

    const savedItemOrm = new ShoppingItemOrmEntity();
    savedItemOrm.id = 'item-1';
    savedItemOrm.listId = 'list-1';
    savedItemOrm.productName = 'Harina';
    savedItemOrm.category = 'Comida';
    savedItemOrm.unitPriceLocal = '40.00' as unknown as number;
    savedItemOrm.quantity = 1;
    savedItemOrm.totalLocal = '40.00' as unknown as number;
    savedItemOrm.unitPriceUsd = '2.00' as unknown as number;
    savedItemOrm.totalUsd = '2.00' as unknown as number;
    savedItemOrm.isPurchased = false;
    savedItemOrm.createdAt = new Date('2026-04-01T00:00:00.000Z');

    itemOrmRepository.save.mockResolvedValue([savedItemOrm]);
    ormRepository.update.mockResolvedValue({} as never);

    const result = await repository.addItemsToList(
      'list-1',
      domainItems,
      40,
      2,
    );

    expect(itemOrmRepository.save).toHaveBeenCalledTimes(1);
    expect(ormRepository.update).toHaveBeenCalledWith('list-1', {
      totalLocal: 40,
      totalUsd: 2,
    });
    expect(result[0].id).toBe('item-1');
    expect(result[0].totalUsd).toBe(2);
  });

  it('delete delega al orm repository', async () => {
    ormRepository.delete.mockResolvedValue({} as never);

    await repository.delete('list-9');

    expect(ormRepository.delete).toHaveBeenCalledWith('list-9');
  });
});
