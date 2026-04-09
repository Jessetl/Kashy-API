import { describe, expect, it } from '@jest/globals';
import { AddShoppingItemsDto } from './add-shopping-items.dto';
import {
  CompareItemListPriceDto,
  CompareItemPriceDto,
  CompareShoppingListsResponseDto,
} from './compare-shopping-lists-response.dto';
import { CreateShoppingItemDto } from './create-shopping-item.dto';
import { CreateShoppingListDto } from './create-shopping-list.dto';
import { DeleteShoppingListResponseDto } from './delete-shopping-list-response.dto';
import { EditShoppingItemDto } from './edit-shopping-item.dto';
import { PaginatedShoppingListsResponseDto } from './paginated-shopping-lists-response.dto';
import { ShoppingItemResponseDto } from './shopping-item-response.dto';
import { ShoppingListResponseDto } from './shopping-list-response.dto';
import {
  SpendingStatDto,
  SpendingStatsResponseDto,
} from './spending-stats-response.dto';
import { UpdateShoppingItemDto } from './update-shopping-item.dto';
import { UpdateShoppingListDto } from './update-shopping-list.dto';

describe('Shopping list DTOs', () => {
  it('instancia DTOs del modulo para cobertura de decoradores', () => {
    const createItem = new CreateShoppingItemDto();
    createItem.productName = 'Harina';
    createItem.category = 'Comida';
    createItem.unitPriceLocal = 45.5;
    createItem.quantity = 2;
    createItem.totalLocal = 91;
    createItem.unitPriceUsd = 1.2;
    createItem.totalUsd = 2.4;
    createItem.isPurchased = false;

    const createList = new CreateShoppingListDto();
    createList.name = 'Compra semanal';
    createList.storeName = 'Super';
    createList.ivaEnabled = true;
    createList.items = [createItem];

    const updateItem = new UpdateShoppingItemDto();
    updateItem.id = '11111111-1111-4111-8111-111111111111';
    updateItem.productName = 'Arroz';
    updateItem.category = 'Comida';
    updateItem.unitPriceLocal = 30;
    updateItem.quantity = 1;
    updateItem.unitPriceUsd = 0.9;
    updateItem.isPurchased = true;

    const updateList = new UpdateShoppingListDto();
    updateList.name = 'Actualizada';
    updateList.storeName = 'Otro super';
    updateList.ivaEnabled = false;
    updateList.items = [updateItem];

    const editItem = new EditShoppingItemDto();
    editItem.productName = 'Leche';
    editItem.category = 'Lacteos';
    editItem.unitPriceLocal = 20;
    editItem.quantity = 3;
    editItem.unitPriceUsd = 0.5;
    editItem.isPurchased = true;

    const addItems = new AddShoppingItemsDto();
    addItems.items = [createItem];

    const responseItem = new ShoppingItemResponseDto();
    responseItem.id = 'i1';
    responseItem.listId = 'l1';
    responseItem.productName = 'Cafe';
    responseItem.category = 'Bebidas';
    responseItem.unitPriceLocal = 10;
    responseItem.quantity = 1;
    responseItem.totalLocal = 10;
    responseItem.unitPriceUsd = null;
    responseItem.totalUsd = null;
    responseItem.isPurchased = false;
    responseItem.createdAt = new Date();

    const responseList = new ShoppingListResponseDto();
    responseList.id = 'l1';
    responseList.userId = 'u1';
    responseList.name = 'Lista';
    responseList.storeName = null;
    responseList.status = 'ACTIVE';
    responseList.ivaEnabled = false;
    responseList.totalLocal = 10;
    responseList.totalUsd = 1;
    responseList.exchangeRateSnapshot = null;
    responseList.createdAt = new Date();
    responseList.completedAt = null;
    responseList.items = [responseItem];

    const paginated = new PaginatedShoppingListsResponseDto();
    paginated.data = [responseList];
    paginated.total = 1;
    paginated.page = 1;
    paginated.limit = 10;

    const comparePrice = new CompareItemListPriceDto();
    comparePrice.listId = 'l1';
    comparePrice.listName = 'Lista';
    comparePrice.unitPriceLocal = 10;
    comparePrice.unitPriceUsd = null;

    const compareItem = new CompareItemPriceDto();
    compareItem.productName = 'harina';
    compareItem.prices = [comparePrice];

    const compare = new CompareShoppingListsResponseDto();
    compare.comparisons = [compareItem];

    const stat = new SpendingStatDto();
    stat.period = '2026-01-01';
    stat.totalLocal = 100;
    stat.totalUsd = 5;
    stat.listCount = 1;

    const stats = new SpendingStatsResponseDto();
    stats.period = 'month';
    stats.stats = [stat];

    const deleted = new DeleteShoppingListResponseDto();
    deleted.message = 'Lista borrada exitosamente';

    expect(createList.items?.length).toBe(1);
    expect(updateList.items?.[0].productName).toBe('Arroz');
    expect(addItems.items[0].productName).toBe('Harina');
    expect(paginated.data[0].items[0].id).toBe('i1');
    expect(compare.comparisons[0].prices[0].listName).toBe('Lista');
    expect(stats.stats[0].listCount).toBe(1);
    expect(deleted.message).toContain('borrada');
    expect(editItem.productName).toBe('Leche');
  });
});
