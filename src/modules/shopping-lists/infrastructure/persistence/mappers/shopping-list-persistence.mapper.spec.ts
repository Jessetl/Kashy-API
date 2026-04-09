import { describe, expect, it } from '@jest/globals';
import { ShoppingItem } from '../../../domain/entities/shopping-item.entity';
import { ShoppingList } from '../../../domain/entities/shopping-list.entity';
import { ShoppingListStatus } from '../../../domain/enums/shopping-list-status.enum';
import { ShoppingItemOrmEntity } from '../orm-entities/shopping-item.orm-entity';
import { ShoppingListOrmEntity } from '../orm-entities/shopping-list.orm-entity';
import { ShoppingListPersistenceMapper } from './shopping-list-persistence.mapper';

describe('ShoppingListPersistenceMapper', () => {
  it('toDomain convierte orm a entidad de dominio con conversions numericas y nullables', () => {
    const itemOrm = new ShoppingItemOrmEntity();
    itemOrm.id = 'item-1';
    itemOrm.listId = 'list-1';
    itemOrm.productName = 'Harina';
    itemOrm.category = 'Comida';
    itemOrm.unitPriceLocal = '45.50' as unknown as number;
    itemOrm.quantity = 2;
    itemOrm.totalLocal = '91.00' as unknown as number;
    itemOrm.unitPriceUsd = null;
    itemOrm.totalUsd = null;
    itemOrm.isPurchased = false;
    itemOrm.createdAt = new Date('2026-04-01T00:00:00.000Z');

    const listOrm = new ShoppingListOrmEntity();
    listOrm.id = 'list-1';
    listOrm.userId = 'user-1';
    listOrm.name = 'Compra';
    listOrm.storeName = null;
    listOrm.status = ShoppingListStatus.ACTIVE;
    listOrm.ivaEnabled = true;
    listOrm.totalLocal = '91.00' as unknown as number;
    listOrm.totalUsd = '4.55' as unknown as number;
    listOrm.exchangeRateSnapshot = null;
    listOrm.createdAt = new Date('2026-04-01T00:00:00.000Z');
    listOrm.completedAt = null;
    listOrm.items = [itemOrm];

    const domain = ShoppingListPersistenceMapper.toDomain(listOrm);

    expect(domain.id).toBe('list-1');
    expect(domain.totalLocal).toBe(91);
    expect(domain.totalUsd).toBe(4.55);
    expect(domain.exchangeRateSnapshot).toBeNull();
    expect(domain.items[0].unitPriceUsd).toBeNull();
    expect(domain.items[0].totalUsd).toBeNull();
  });

  it('toDomain usa arreglo vacio si orm.items es undefined', () => {
    const listOrm = new ShoppingListOrmEntity();
    listOrm.id = 'list-2';
    listOrm.userId = 'user-1';
    listOrm.name = 'Compra';
    listOrm.storeName = 'Store';
    listOrm.status = ShoppingListStatus.ACTIVE;
    listOrm.ivaEnabled = false;
    listOrm.totalLocal = '0' as unknown as number;
    listOrm.totalUsd = '0' as unknown as number;
    listOrm.exchangeRateSnapshot = '34.5555' as unknown as number;
    listOrm.createdAt = new Date('2026-04-01T00:00:00.000Z');
    listOrm.completedAt = null;
    listOrm.items = undefined as never;

    const domain = ShoppingListPersistenceMapper.toDomain(listOrm);

    expect(domain.items).toEqual([]);
    expect(domain.exchangeRateSnapshot).toBe(34.5555);
  });

  it('toOrm mapea dominio a orm con items', () => {
    const item = ShoppingItem.create(
      'item-1',
      'list-1',
      'Arroz',
      'Comida',
      30,
      2,
      1.5,
      null,
      true,
    );
    const list = ShoppingList.create(
      'list-1',
      'user-1',
      'Compra',
      'Store',
      false,
      [item],
      20,
    );

    const orm = ShoppingListPersistenceMapper.toOrm(list);

    expect(orm.id).toBe('list-1');
    expect(orm.userId).toBe('user-1');
    expect(orm.items).toHaveLength(1);
    expect(orm.items[0].id).toBe('item-1');
    expect(orm.items[0].isPurchased).toBe(true);
  });

  it('toItemOrm mapea item individual', () => {
    const item = ShoppingItem.create(
      'item-2',
      'list-9',
      'Cafe',
      'Bebidas',
      10,
      1,
      null,
      20,
      false,
    );

    const ormItem = ShoppingListPersistenceMapper.toItemOrm(item);

    expect(ormItem.id).toBe('item-2');
    expect(ormItem.listId).toBe('list-9');
    expect(ormItem.totalLocal).toBe(10);
    expect(ormItem.unitPriceUsd).toBe(0.5);
  });
});
