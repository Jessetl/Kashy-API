import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import {
  type ExchangeRateSnapshot,
  type IExchangeRateProvider,
} from '../../../../shared-kernel/domain/interfaces/exchange-rate-provider.interface';
import { ShoppingItem } from '../../domain/entities/shopping-item.entity';
import { ShoppingList } from '../../domain/entities/shopping-list.entity';
import { ShoppingListStatus } from '../../domain/enums/shopping-list-status.enum';
import { ShoppingItemNotFoundException } from '../../domain/exceptions/shopping-item-not-found.exception';
import { ShoppingListNotFoundException } from '../../domain/exceptions/shopping-list-not-found.exception';
import { type IShoppingListRepository } from '../../domain/interfaces/repositories/shopping-list.repository.interface';
import { AddItemsToShoppingListUseCase } from './add-items-to-shopping-list.use-case';
import { CompareShoppingListsUseCase } from './compare-shopping-lists.use-case';
import { CompleteShoppingListUseCase } from './complete-shopping-list.use-case';
import { CreateShoppingListUseCase } from './create-shopping-list.use-case';
import { DeleteShoppingItemUseCase } from './delete-shopping-item.use-case';
import { DeleteShoppingListUseCase } from './delete-shopping-list.use-case';
import { DuplicateShoppingListUseCase } from './duplicate-shopping-list.use-case';
import { EditShoppingItemUseCase } from './edit-shopping-item.use-case';
import { GetShoppingListByIdUseCase } from './get-shopping-list-by-id.use-case';
import { GetShoppingListHistoryUseCase } from './get-shopping-list-history.use-case';
import { GetShoppingListsUseCase } from './get-shopping-lists.use-case';
import { GetSpendingStatsUseCase } from './get-spending-stats.use-case';
import { ToggleShoppingItemUseCase } from './toggle-shopping-item.use-case';
import { UpdateShoppingListUseCase } from './update-shopping-list.use-case';

function makeRepositoryMock(): jest.Mocked<IShoppingListRepository> {
  return {
    findById: jest.fn(),
    findByIdAndUserId: jest.fn(),
    findActiveByUserId: jest.fn(),
    findCompletedByUserId: jest.fn(),
    findByIdsAndUserId: jest.fn(),
    getSpendingStats: jest.fn(),
    save: jest.fn(),
    addItemsToList: jest.fn(),
    delete: jest.fn(),
  };
}

function makeExchangeRateProviderMock(): jest.Mocked<IExchangeRateProvider> {
  return {
    getCurrent: jest.fn(),
  };
}

function makeExchangeRate(rate: number): ExchangeRateSnapshot {
  return {
    rateLocalPerUsd: rate,
    source: 'bcv',
    fetchedAt: new Date('2026-04-09T00:00:00.000Z'),
  };
}

function makeItem(params?: {
  id?: string;
  listId?: string;
  productName?: string;
  totalLocal?: number;
  totalUsd?: number | null;
  isPurchased?: boolean;
}): ShoppingItem {
  const resolvedTotalUsd = params?.totalUsd !== undefined ? params.totalUsd : 1;
  const resolvedUnitPriceUsd =
    resolvedTotalUsd === null ? null : Number(resolvedTotalUsd);

  return ShoppingItem.reconstitute(params?.id ?? 'item-1', {
    listId: params?.listId ?? 'list-1',
    productName: params?.productName ?? 'Harina',
    category: 'Comida',
    unitPriceLocal: 10,
    quantity: 1,
    totalLocal: params?.totalLocal ?? 10,
    unitPriceUsd: resolvedUnitPriceUsd,
    totalUsd: resolvedTotalUsd,
    isPurchased: params?.isPurchased ?? false,
    createdAt: new Date('2026-04-01T00:00:00.000Z'),
  });
}

function makeList(params?: {
  id?: string;
  userId?: string;
  status?: ShoppingListStatus;
  items?: ShoppingItem[];
  exchangeRateSnapshot?: number | null;
}): ShoppingList {
  const base = ShoppingList.create(
    params?.id ?? 'list-1',
    params?.userId ?? 'user-1',
    'Compra',
    'Super',
    false,
    params?.items ?? [makeItem({ id: 'item-1' })],
    params?.exchangeRateSnapshot ?? 35,
  );

  if (params?.status && params.status !== ShoppingListStatus.ACTIVE) {
    return ShoppingList.reconstitute(base.id, {
      userId: base.userId,
      name: base.name,
      storeName: base.storeName,
      status: params.status,
      ivaEnabled: base.ivaEnabled,
      totalLocal: base.totalLocal,
      totalUsd: base.totalUsd,
      exchangeRateSnapshot: base.exchangeRateSnapshot,
      createdAt: base.createdAt,
      completedAt: new Date('2026-04-02T00:00:00.000Z'),
      items: base.items,
    });
  }

  return base;
}

describe('Shopping list use-cases', () => {
  let repository: jest.Mocked<IShoppingListRepository>;
  let exchangeRateProvider: jest.Mocked<IExchangeRateProvider>;

  beforeEach(() => {
    repository = makeRepositoryMock();
    exchangeRateProvider = makeExchangeRateProviderMock();
    exchangeRateProvider.getCurrent.mockResolvedValue(makeExchangeRate(20));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('CreateShoppingListUseCase', () => {
    it('crea lista con conversion automatica y persiste', async () => {
      const useCase = new CreateShoppingListUseCase(
        repository,
        exchangeRateProvider,
      );
      const generatedList = makeList({
        id: 'new-list',
        items: [
          makeItem({
            id: 'new-item',
            listId: 'new-list',
            totalLocal: 40,
            totalUsd: 2,
          }),
        ],
      });

      repository.save.mockResolvedValue(generatedList);

      const result = await useCase.execute({
        userId: 'user-1',
        dto: {
          name: 'Compra de abril',
          storeName: 'Super',
          ivaEnabled: true,
          items: [
            {
              productName: 'Leche',
              category: 'Lacteos',
              unitPriceLocal: 40,
              quantity: 1,
              totalLocal: 40,
            },
            {
              productName: 'Huevos',
              category: 'Comida',
              unitPriceLocal: 20,
              totalLocal: 20,
              unitPriceUsd: 1,
            },
          ],
        },
      });

      expect(exchangeRateProvider.getCurrent).toHaveBeenCalledTimes(1);
      expect(repository.save).toHaveBeenCalledTimes(1);
      expect(result.id).toBe('new-list');
      expect(result.items[0].id).toBe('new-item');
    });
  });

  describe('GetShoppingListsUseCase', () => {
    it('lista activas del usuario', async () => {
      const useCase = new GetShoppingListsUseCase(repository);
      repository.findActiveByUserId.mockResolvedValue([
        makeList({ id: 'list-a' }),
      ]);

      const result = await useCase.execute('user-1');

      expect(repository.findActiveByUserId).toHaveBeenCalledWith('user-1');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('list-a');
    });
  });

  describe('GetShoppingListByIdUseCase', () => {
    it('retorna lista cuando existe', async () => {
      const useCase = new GetShoppingListByIdUseCase(repository);
      repository.findByIdAndUserId.mockResolvedValue(
        makeList({ id: 'list-1' }),
      );

      const result = await useCase.execute({
        listId: 'list-1',
        userId: 'user-1',
      });
      expect(result.id).toBe('list-1');
    });

    it('lanza not found cuando la lista no existe', async () => {
      const useCase = new GetShoppingListByIdUseCase(repository);
      repository.findByIdAndUserId.mockResolvedValue(null);

      await expect(
        useCase.execute({ listId: 'missing', userId: 'user-1' }),
      ).rejects.toBeInstanceOf(ShoppingListNotFoundException);
    });
  });

  describe('AddItemsToShoppingListUseCase', () => {
    it('agrega items y actualiza totales en persistencia', async () => {
      const useCase = new AddItemsToShoppingListUseCase(
        repository,
        exchangeRateProvider,
      );
      repository.findByIdAndUserId.mockResolvedValue(
        makeList({ id: 'list-1', items: [] }),
      );

      const savedItem = makeItem({
        id: 'saved-item',
        listId: 'list-1',
        totalLocal: 60,
        totalUsd: 3,
      });
      repository.addItemsToList.mockResolvedValue([savedItem]);

      const result = await useCase.execute({
        listId: 'list-1',
        userId: 'user-1',
        items: [
          {
            productName: 'Queso',
            category: 'Lacteos',
            unitPriceLocal: 60,
            quantity: 1,
            totalLocal: 60,
          },
        ],
      });

      expect(repository.addItemsToList).toHaveBeenCalledWith(
        'list-1',
        expect.any(Array),
        60,
        3,
      );
      expect(result[0].id).toBe('saved-item');
    });

    it('respeta quantity/unitPriceUsd enviados cuando vienen definidos', async () => {
      const useCase = new AddItemsToShoppingListUseCase(
        repository,
        exchangeRateProvider,
      );
      repository.findByIdAndUserId.mockResolvedValue(
        makeList({ id: 'list-1', items: [] }),
      );

      repository.addItemsToList.mockResolvedValue([
        makeItem({
          id: 'item-2',
          listId: 'list-1',
          totalLocal: 200,
          totalUsd: 10,
        }),
      ]);

      await useCase.execute({
        listId: 'list-1',
        userId: 'user-1',
        items: [
          {
            productName: 'Carne',
            category: 'Proteina',
            unitPriceLocal: 50,
            quantity: 4,
            unitPriceUsd: 2.5,
            totalLocal: 200,
          },
        ],
      });

      const addItemsCall = repository.addItemsToList.mock.calls[0];
      const generatedItems = addItemsCall[1];

      expect(generatedItems[0].quantity).toBe(4);
      expect(generatedItems[0].unitPriceUsd).toBe(2.5);
    });

    it('lanza not found cuando no existe lista', async () => {
      const useCase = new AddItemsToShoppingListUseCase(
        repository,
        exchangeRateProvider,
      );
      repository.findByIdAndUserId.mockResolvedValue(null);

      await expect(
        useCase.execute({ listId: 'x', userId: 'user-1', items: [] }),
      ).rejects.toBeInstanceOf(ShoppingListNotFoundException);
    });
  });

  describe('EditShoppingItemUseCase', () => {
    it('actualiza un item existente y guarda lista', async () => {
      const useCase = new EditShoppingItemUseCase(
        repository,
        exchangeRateProvider,
      );
      const list = makeList({
        id: 'list-1',
        items: [
          makeItem({
            id: 'item-1',
            totalLocal: 10,
            totalUsd: 1,
            isPurchased: false,
          }),
        ],
      });
      repository.findByIdAndUserId.mockResolvedValue(list);
      repository.save.mockImplementation(async (value) => value);

      const result = await useCase.execute({
        listId: 'list-1',
        itemId: 'item-1',
        userId: 'user-1',
        dto: {
          productName: 'Nuevo nombre',
          category: 'Comida',
          unitPriceLocal: 50,
          quantity: 2,
          unitPriceUsd: undefined,
          isPurchased: true,
        },
      });

      expect(repository.save).toHaveBeenCalledTimes(1);
      expect(result.items.find((i) => i.id === 'item-1')?.totalLocal).toBe(100);
      expect(result.items.find((i) => i.id === 'item-1')?.isPurchased).toBe(
        true,
      );
    });

    it('lanza not found cuando la lista no existe', async () => {
      const useCase = new EditShoppingItemUseCase(
        repository,
        exchangeRateProvider,
      );
      repository.findByIdAndUserId.mockResolvedValue(null);

      await expect(
        useCase.execute({
          listId: 'list-1',
          itemId: 'item-1',
          userId: 'user-1',
          dto: { productName: 'A', category: 'B', unitPriceLocal: 1 },
        }),
      ).rejects.toBeInstanceOf(ShoppingListNotFoundException);
    });

    it('lanza not found cuando el item no existe', async () => {
      const useCase = new EditShoppingItemUseCase(
        repository,
        exchangeRateProvider,
      );
      repository.findByIdAndUserId.mockResolvedValue(
        makeList({ id: 'list-1', items: [] }),
      );

      await expect(
        useCase.execute({
          listId: 'list-1',
          itemId: 'item-404',
          userId: 'user-1',
          dto: { productName: 'A', category: 'B', unitPriceLocal: 1 },
        }),
      ).rejects.toBeInstanceOf(ShoppingItemNotFoundException);
    });
  });

  describe('ToggleShoppingItemUseCase', () => {
    it('alterna estado de compra y guarda', async () => {
      const useCase = new ToggleShoppingItemUseCase(repository);
      repository.findByIdAndUserId.mockResolvedValue(
        makeList({ items: [makeItem({ id: 'item-1', isPurchased: false })] }),
      );
      repository.save.mockImplementation(async (value) => value);

      const result = await useCase.execute({
        listId: 'list-1',
        itemId: 'item-1',
        userId: 'user-1',
      });

      expect(result.items.find((i) => i.id === 'item-1')?.isPurchased).toBe(
        true,
      );
    });

    it('lanza not found cuando lista no existe', async () => {
      const useCase = new ToggleShoppingItemUseCase(repository);
      repository.findByIdAndUserId.mockResolvedValue(null);

      await expect(
        useCase.execute({
          listId: 'list-x',
          itemId: 'item-1',
          userId: 'user-1',
        }),
      ).rejects.toBeInstanceOf(ShoppingListNotFoundException);
    });

    it('lanza not found cuando item no existe', async () => {
      const useCase = new ToggleShoppingItemUseCase(repository);
      repository.findByIdAndUserId.mockResolvedValue(makeList({ items: [] }));

      await expect(
        useCase.execute({
          listId: 'list-1',
          itemId: 'item-x',
          userId: 'user-1',
        }),
      ).rejects.toBeInstanceOf(ShoppingItemNotFoundException);
    });
  });

  describe('CompleteShoppingListUseCase', () => {
    it('completa lista con snapshot de tasa vigente', async () => {
      const useCase = new CompleteShoppingListUseCase(
        repository,
        exchangeRateProvider,
      );
      repository.findByIdAndUserId.mockResolvedValue(
        makeList({ id: 'list-1' }),
      );
      repository.save.mockImplementation(async (value) => value);

      const result = await useCase.execute({
        listId: 'list-1',
        userId: 'user-1',
      });

      expect(result.status).toBe(ShoppingListStatus.COMPLETED);
      expect(result.exchangeRateSnapshot).toBe(20);
    });

    it('lanza not found si la lista no existe', async () => {
      const useCase = new CompleteShoppingListUseCase(
        repository,
        exchangeRateProvider,
      );
      repository.findByIdAndUserId.mockResolvedValue(null);

      await expect(
        useCase.execute({ listId: 'missing', userId: 'user-1' }),
      ).rejects.toBeInstanceOf(ShoppingListNotFoundException);
    });
  });

  describe('DeleteShoppingListUseCase', () => {
    it('elimina lista existente', async () => {
      const useCase = new DeleteShoppingListUseCase(repository);
      repository.findByIdAndUserId.mockResolvedValue(
        makeList({ id: 'list-1' }),
      );
      repository.delete.mockResolvedValue(undefined);

      const result = await useCase.execute({
        listId: 'list-1',
        userId: 'user-1',
      });

      expect(repository.delete).toHaveBeenCalledWith('list-1');
      expect(result.message).toBe('Lista borrada exitosamente');
    });

    it('lanza not found si no existe', async () => {
      const useCase = new DeleteShoppingListUseCase(repository);
      repository.findByIdAndUserId.mockResolvedValue(null);

      await expect(
        useCase.execute({ listId: 'missing', userId: 'user-1' }),
      ).rejects.toBeInstanceOf(ShoppingListNotFoundException);
    });
  });

  describe('DeleteShoppingItemUseCase', () => {
    it('elimina item y persiste lista', async () => {
      const useCase = new DeleteShoppingItemUseCase(repository);
      repository.findByIdAndUserId.mockResolvedValue(
        makeList({
          items: [makeItem({ id: 'item-1' }), makeItem({ id: 'item-2' })],
        }),
      );
      repository.save.mockImplementation(async (value) => value);

      const result = await useCase.execute({
        listId: 'list-1',
        itemId: 'item-1',
        userId: 'user-1',
      });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].id).toBe('item-2');
    });

    it('lanza not found si lista no existe', async () => {
      const useCase = new DeleteShoppingItemUseCase(repository);
      repository.findByIdAndUserId.mockResolvedValue(null);

      await expect(
        useCase.execute({
          listId: 'list-x',
          itemId: 'item-1',
          userId: 'user-1',
        }),
      ).rejects.toBeInstanceOf(ShoppingListNotFoundException);
    });

    it('lanza not found si item no existe', async () => {
      const useCase = new DeleteShoppingItemUseCase(repository);
      repository.findByIdAndUserId.mockResolvedValue(makeList({ items: [] }));

      await expect(
        useCase.execute({
          listId: 'list-1',
          itemId: 'item-x',
          userId: 'user-1',
        }),
      ).rejects.toBeInstanceOf(ShoppingItemNotFoundException);
    });
  });

  describe('GetShoppingListHistoryUseCase', () => {
    it('mapea pagina de listas completadas', async () => {
      const useCase = new GetShoppingListHistoryUseCase(repository);
      repository.findCompletedByUserId.mockResolvedValue({
        data: [
          makeList({ id: 'completed-1', status: ShoppingListStatus.COMPLETED }),
        ],
        total: 1,
        page: 2,
        limit: 5,
      });

      const result = await useCase.execute({
        userId: 'user-1',
        page: 2,
        limit: 5,
      });

      expect(result.total).toBe(1);
      expect(result.page).toBe(2);
      expect(result.data[0].id).toBe('completed-1');
    });
  });

  describe('DuplicateShoppingListUseCase', () => {
    it('duplica lista e items con nuevos ids', async () => {
      const useCase = new DuplicateShoppingListUseCase(repository);
      repository.findByIdAndUserId.mockResolvedValue(
        makeList({ items: [makeItem({ id: 'old-1', isPurchased: true })] }),
      );
      repository.save.mockImplementation(async (value) => value);

      const result = await useCase.execute({
        listId: 'list-1',
        userId: 'user-1',
      });

      expect(result.id).not.toBe('list-1');
      expect(result.items[0].id).not.toBe('old-1');
      expect(result.items[0].isPurchased).toBe(false);
    });

    it('duplica lista sin items cuando la lista original esta vacia', async () => {
      const useCase = new DuplicateShoppingListUseCase(repository);
      repository.findByIdAndUserId.mockResolvedValue(makeList({ items: [] }));
      repository.save.mockImplementation(async (value) => value);

      const result = await useCase.execute({
        listId: 'list-1',
        userId: 'user-1',
      });

      expect(result.items).toEqual([]);
      expect(result.id).not.toBe('list-1');
    });

    it('lanza not found cuando lista original no existe', async () => {
      const useCase = new DuplicateShoppingListUseCase(repository);
      repository.findByIdAndUserId.mockResolvedValue(null);

      await expect(
        useCase.execute({ listId: 'missing', userId: 'user-1' }),
      ).rejects.toBeInstanceOf(ShoppingListNotFoundException);
    });
  });

  describe('UpdateShoppingListUseCase', () => {
    it('actualiza metadata sin tocar items cuando dto.items no viene', async () => {
      const useCase = new UpdateShoppingListUseCase(
        repository,
        exchangeRateProvider,
      );
      const existing = makeList({
        id: 'list-1',
        items: [makeItem({ id: 'item-1', totalLocal: 30, totalUsd: 2 })],
        exchangeRateSnapshot: 11,
      });
      repository.findByIdAndUserId.mockResolvedValue(existing);
      repository.save.mockImplementation(async (value) => value);

      const result = await useCase.execute({
        listId: 'list-1',
        userId: 'user-1',
        dto: { name: 'Nuevo nombre', ivaEnabled: true },
      });

      expect(exchangeRateProvider.getCurrent).not.toHaveBeenCalled();
      expect(result.name).toBe('Nuevo nombre');
      expect(result.ivaEnabled).toBe(true);
      expect(result.totalLocal).toBe(existing.totalLocal);
      expect(result.items).toHaveLength(1);
    });

    it('actualiza/crea items y recalcula totales cuando dto.items viene', async () => {
      const useCase = new UpdateShoppingListUseCase(
        repository,
        exchangeRateProvider,
      );
      const existing = makeList({
        id: 'list-1',
        items: [
          makeItem({
            id: 'existing-item',
            totalLocal: 10,
            totalUsd: 1,
            isPurchased: true,
          }),
        ],
        exchangeRateSnapshot: 5,
      });
      repository.findByIdAndUserId.mockResolvedValue(existing);
      repository.save.mockImplementation(async (value) => value);

      const result = await useCase.execute({
        listId: 'list-1',
        userId: 'user-1',
        dto: {
          storeName: null as unknown as string,
          items: [
            {
              id: 'existing-item',
              productName: 'Actualizado',
              category: 'Comida',
              unitPriceLocal: 20,
              quantity: undefined,
              unitPriceUsd: undefined,
              isPurchased: false,
            },
            {
              id: 'id-no-existente-en-mapa',
              productName: 'Nuevo 1',
              category: 'Comida',
              unitPriceLocal: 50,
              quantity: 1,
              unitPriceUsd: undefined,
              isPurchased: undefined,
            },
            {
              productName: 'Nuevo 2',
              category: 'Comida',
              unitPriceLocal: 30,
              quantity: 1,
              unitPriceUsd: null as unknown as number,
              isPurchased: true,
            },
          ],
        },
      });

      expect(exchangeRateProvider.getCurrent).toHaveBeenCalledTimes(1);
      expect(result.items).toHaveLength(3);
      expect(result.storeName).toBeNull();
      expect(result.exchangeRateSnapshot).toBe(20);
      expect(result.totalLocal).toBe(100);
      expect(result.totalUsd).toBe(5);
    });

    it('lanza not found cuando la lista no existe', async () => {
      const useCase = new UpdateShoppingListUseCase(
        repository,
        exchangeRateProvider,
      );
      repository.findByIdAndUserId.mockResolvedValue(null);

      await expect(
        useCase.execute({
          listId: 'missing',
          userId: 'user-1',
          dto: { name: 'x' },
        }),
      ).rejects.toBeInstanceOf(ShoppingListNotFoundException);
    });
  });

  describe('CompareShoppingListsUseCase', () => {
    it('compara productos repetidos entre listas (normaliza nombre)', async () => {
      const useCase = new CompareShoppingListsUseCase(repository);
      repository.findByIdsAndUserId.mockResolvedValue([
        ShoppingList.create('l1', 'user-1', 'Lista 1', null, false, [
          makeItem({
            id: 'i1',
            listId: 'l1',
            productName: '  Harina PAN ',
            totalLocal: 10,
            totalUsd: 1,
          }),
        ]),
        ShoppingList.create('l2', 'user-1', 'Lista 2', null, false, [
          makeItem({
            id: 'i2',
            listId: 'l2',
            productName: 'harina pan',
            totalLocal: 12,
            totalUsd: 1.2,
          }),
          makeItem({
            id: 'i3',
            listId: 'l2',
            productName: 'azucar',
            totalLocal: 8,
            totalUsd: 0.8,
          }),
        ]),
      ]);

      const result = await useCase.execute({
        ids: ['l1', 'l2'],
        userId: 'user-1',
      });

      expect(result.comparisons).toHaveLength(1);
      expect(result.comparisons[0].productName).toBe('harina pan');
      expect(result.comparisons[0].prices).toHaveLength(2);
    });
  });

  describe('GetSpendingStatsUseCase', () => {
    it('mapea filas del repositorio a dto de respuesta', async () => {
      const useCase = new GetSpendingStatsUseCase(repository);
      repository.getSpendingStats.mockResolvedValue([
        { period: '2026-04-01', totalLocal: 100, totalUsd: 5, listCount: 2 },
      ]);

      const result = await useCase.execute({
        userId: 'user-1',
        period: 'month',
      });

      expect(result.period).toBe('month');
      expect(result.stats).toHaveLength(1);
      expect(result.stats[0].listCount).toBe(2);
      expect(repository.getSpendingStats).toHaveBeenCalledWith(
        'user-1',
        'month',
      );
    });
  });
});
