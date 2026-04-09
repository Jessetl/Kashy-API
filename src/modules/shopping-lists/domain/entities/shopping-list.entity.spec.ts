import { describe, expect, it } from '@jest/globals';
import { ShoppingListStatus } from '../enums/shopping-list-status.enum';
import { ShoppingItem } from './shopping-item.entity';
import { ShoppingList } from './shopping-list.entity';

function makeItem(params?: {
  id?: string;
  totalLocal?: number;
  totalUsd?: number | null;
  isPurchased?: boolean;
  createdAt?: Date;
}): ShoppingItem {
  const createdAt = params?.createdAt ?? new Date('2026-02-01T00:00:00.000Z');
  const resolvedTotalUsd = params?.totalUsd !== undefined ? params.totalUsd : 1;
  const resolvedUnitPriceUsd =
    resolvedTotalUsd === null ? null : Number(resolvedTotalUsd);

  return ShoppingItem.reconstitute(params?.id ?? 'item-1', {
    listId: 'list-1',
    productName: 'Producto',
    category: 'Categoria',
    unitPriceLocal: 10,
    quantity: 1,
    totalLocal: params?.totalLocal ?? 10,
    unitPriceUsd: resolvedUnitPriceUsd,
    totalUsd: resolvedTotalUsd,
    isPurchased: params?.isPurchased ?? false,
    createdAt,
  });
}

describe('ShoppingList', () => {
  it('create calcula totales usando items y totalUsd con fallback 0', () => {
    const itemA = makeItem({ id: 'a', totalLocal: 10, totalUsd: 1 });
    const itemB = makeItem({ id: 'b', totalLocal: 5, totalUsd: null });

    const list = ShoppingList.create(
      'list-1',
      'user-1',
      'Compra',
      'Tienda',
      true,
      [itemA, itemB],
      36.5,
    );

    expect(list.status).toBe(ShoppingListStatus.ACTIVE);
    expect(list.totalLocal).toBe(15);
    expect(list.totalUsd).toBe(1);
    expect(list.exchangeRateSnapshot).toBe(36.5);
  });

  it('addItems agrega y recalcula totales', () => {
    const base = ShoppingList.create(
      'list-1',
      'user-1',
      'Compra',
      null,
      false,
      [makeItem({ id: 'a', totalLocal: 10, totalUsd: 2 })],
    );

    const updated = base.addItems([
      makeItem({ id: 'b', totalLocal: 20, totalUsd: 3 }),
      makeItem({ id: 'c', totalLocal: 5, totalUsd: null }),
    ]);

    expect(updated.items).toHaveLength(3);
    expect(updated.totalLocal).toBe(35);
    expect(updated.totalUsd).toBe(5);
  });

  it('complete marca status completed y setea completedAt/snapshot', () => {
    const base = ShoppingList.create('list-1', 'user-1', 'Compra');
    const completed = base.complete(40.2);

    expect(completed.status).toBe(ShoppingListStatus.COMPLETED);
    expect(completed.exchangeRateSnapshot).toBe(40.2);
    expect(completed.completedAt).toBeInstanceOf(Date);
  });

  it('duplicate clona items con nuevos ids y isPurchased false', () => {
    const purchasedItem = makeItem({
      id: 'old-1',
      isPurchased: true,
      totalLocal: 11,
      totalUsd: 1,
    });
    const list = ShoppingList.create(
      'list-1',
      'user-1',
      'Compra',
      'Store',
      true,
      [purchasedItem],
      33,
    );

    const copy = list.duplicate('list-2', ['new-1']);

    expect(copy.id).toBe('list-2');
    expect(copy.status).toBe(ShoppingListStatus.ACTIVE);
    expect(copy.items).toHaveLength(1);
    expect(copy.items[0].id).toBe('new-1');
    expect(copy.items[0].isPurchased).toBe(false);
    expect(copy.items[0].listId).toBe('list-2');
  });

  it('removeItem quita item y recalcula', () => {
    const list = ShoppingList.create(
      'list-1',
      'user-1',
      'Compra',
      null,
      false,
      [
        makeItem({ id: 'keep', totalLocal: 10, totalUsd: 2 }),
        makeItem({ id: 'drop', totalLocal: 20, totalUsd: 1 }),
      ],
    );

    const updated = list.removeItem('drop');

    expect(updated.items).toHaveLength(1);
    expect(updated.items[0].id).toBe('keep');
    expect(updated.totalLocal).toBe(10);
    expect(updated.totalUsd).toBe(2);
  });

  it('replaceItem sustituye item por id y recalcula', () => {
    const original = makeItem({ id: 'target', totalLocal: 10, totalUsd: 2 });
    const list = ShoppingList.create(
      'list-1',
      'user-1',
      'Compra',
      null,
      false,
      [original, makeItem({ id: 'other', totalLocal: 5, totalUsd: null })],
    );

    const replacement = ShoppingItem.reconstitute('target', {
      listId: 'list-1',
      productName: 'Nuevo',
      category: 'Cat',
      unitPriceLocal: 1,
      quantity: 1,
      totalLocal: 50,
      unitPriceUsd: 2,
      totalUsd: 4,
      isPurchased: false,
      createdAt: new Date('2026-02-02T00:00:00.000Z'),
    });

    const updated = list.replaceItem(replacement);

    expect(updated.items.find((x) => x.id === 'target')?.totalLocal).toBe(50);
    expect(updated.totalLocal).toBe(55);
    expect(updated.totalUsd).toBe(4);
  });

  it('reconstitute conserva valores exactos', () => {
    const createdAt = new Date('2026-02-01T00:00:00.000Z');
    const completedAt = new Date('2026-02-05T00:00:00.000Z');

    const list = ShoppingList.reconstitute('list-1', {
      userId: 'user-1',
      name: 'Lista',
      storeName: null,
      status: ShoppingListStatus.COMPLETED,
      ivaEnabled: true,
      totalLocal: 123,
      totalUsd: 4,
      exchangeRateSnapshot: 31,
      createdAt,
      completedAt,
      items: [],
    });

    expect(list.status).toBe(ShoppingListStatus.COMPLETED);
    expect(list.totalLocal).toBe(123);
    expect(list.completedAt).toBe(completedAt);
  });
});
