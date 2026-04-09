import { describe, expect, it } from '@jest/globals';
import { ShoppingItem } from '../../domain/entities/shopping-item.entity';
import { ShoppingList } from '../../domain/entities/shopping-list.entity';
import { ShoppingListMapper } from './shopping-list.mapper';

describe('ShoppingListMapper', () => {
  it('toResponse mapea lista e items', () => {
    const item = ShoppingItem.create(
      'item-1',
      'list-1',
      'Harina',
      'Comida',
      40,
      2,
      null,
      20,
      false,
    );

    const list = ShoppingList.create(
      'list-1',
      'user-1',
      'Compra semanal',
      'Super',
      true,
      [item],
      20,
    );

    const dto = ShoppingListMapper.toResponse(list);

    expect(dto.id).toBe('list-1');
    expect(dto.userId).toBe('user-1');
    expect(dto.items).toHaveLength(1);
    expect(dto.items[0].id).toBe('item-1');
    expect(dto.items[0].totalUsd).toBe(4);
  });

  it('toItemResponse mapea item individual', () => {
    const item = ShoppingItem.create(
      'item-2',
      'list-1',
      'Arroz',
      'Comida',
      10,
      3,
      1,
      null,
      true,
    );

    const dto = ShoppingListMapper.toItemResponse(item);

    expect(dto.id).toBe('item-2');
    expect(dto.listId).toBe('list-1');
    expect(dto.productName).toBe('Arroz');
    expect(dto.isPurchased).toBe(true);
    expect(dto.totalLocal).toBe(30);
  });
});
