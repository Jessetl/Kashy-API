import { describe, expect, it } from '@jest/globals';
import 'reflect-metadata';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddItemsToShoppingListUseCase } from './application/use-cases/add-items-to-shopping-list.use-case';
import { CompareShoppingListsUseCase } from './application/use-cases/compare-shopping-lists.use-case';
import { CompleteShoppingListUseCase } from './application/use-cases/complete-shopping-list.use-case';
import { CreateShoppingListUseCase } from './application/use-cases/create-shopping-list.use-case';
import { DeleteShoppingItemUseCase } from './application/use-cases/delete-shopping-item.use-case';
import { DeleteShoppingListUseCase } from './application/use-cases/delete-shopping-list.use-case';
import { DuplicateShoppingListUseCase } from './application/use-cases/duplicate-shopping-list.use-case';
import { EditShoppingItemUseCase } from './application/use-cases/edit-shopping-item.use-case';
import { GetShoppingListByIdUseCase } from './application/use-cases/get-shopping-list-by-id.use-case';
import { GetShoppingListHistoryUseCase } from './application/use-cases/get-shopping-list-history.use-case';
import { GetShoppingListsUseCase } from './application/use-cases/get-shopping-lists.use-case';
import { GetSpendingStatsUseCase } from './application/use-cases/get-spending-stats.use-case';
import { ToggleShoppingItemUseCase } from './application/use-cases/toggle-shopping-item.use-case';
import { UpdateShoppingListUseCase } from './application/use-cases/update-shopping-list.use-case';
import { SHOPPING_LIST_REPOSITORY } from './domain/interfaces/repositories/shopping-list.repository.interface';
import { ShoppingListsController } from './infrastructure/controllers/shopping-lists.controller';
import { ShoppingItemOrmEntity } from './infrastructure/persistence/orm-entities/shopping-item.orm-entity';
import { ShoppingListOrmEntity } from './infrastructure/persistence/orm-entities/shopping-list.orm-entity';
import { TypeOrmShoppingListRepository } from './infrastructure/persistence/repositories/typeorm-shopping-list.repository';
import { ShoppingListsModule } from './shopping-lists.module';

describe('ShoppingListsModule metadata', () => {
  it('declara imports esperados', () => {
    const imports = Reflect.getMetadata(
      'imports',
      ShoppingListsModule,
    ) as unknown[];

    expect(
      imports.some(
        (x) =>
          x ===
          TypeOrmModule.forFeature([
            ShoppingListOrmEntity,
            ShoppingItemOrmEntity,
          ]),
      ),
    ).toBe(false);
    expect(imports.length).toBeGreaterThan(0);
  });

  it('declara controller del modulo', () => {
    const controllers = Reflect.getMetadata(
      'controllers',
      ShoppingListsModule,
    ) as unknown[];

    expect(controllers).toContain(ShoppingListsController);
  });

  it('registra provider del repositorio por token y todos los use-cases', () => {
    const providers = Reflect.getMetadata(
      'providers',
      ShoppingListsModule,
    ) as unknown[];

    expect(providers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          provide: SHOPPING_LIST_REPOSITORY,
          useClass: TypeOrmShoppingListRepository,
        }),
        CreateShoppingListUseCase,
        GetShoppingListsUseCase,
        GetShoppingListByIdUseCase,
        UpdateShoppingListUseCase,
        DeleteShoppingListUseCase,
        AddItemsToShoppingListUseCase,
        EditShoppingItemUseCase,
        DeleteShoppingItemUseCase,
        ToggleShoppingItemUseCase,
        CompleteShoppingListUseCase,
        GetShoppingListHistoryUseCase,
        DuplicateShoppingListUseCase,
        CompareShoppingListsUseCase,
        GetSpendingStatsUseCase,
      ]),
    );
  });

  it('exporta el token del repositorio', () => {
    const exportsMetadata = Reflect.getMetadata(
      'exports',
      ShoppingListsModule,
    ) as unknown[];

    expect(exportsMetadata).toContain(SHOPPING_LIST_REPOSITORY);
  });
});
