import { BaseEntity } from '../../../../shared-kernel/domain/base-entity';
import { ShoppingListStatus } from '../enums/shopping-list-status.enum';
import { ShoppingListType } from '../enums/shopping-list-type.enum';
import { ShoppingItem } from './shopping-item.entity';

interface ShoppingListProps {
  userId: string;
  name: string;
  storeName: string | null;
  listType: ShoppingListType;
  countryCode: string;
  currencyCode: string;
  exchangeRateSnapshot: number;
  ivaEnabled: boolean;
  scheduledDate: Date | null;
  latitude: number | null;
  longitude: number | null;
  isActive: boolean;
  status: ShoppingListStatus;
  totalLocal: number;
  totalUsd: number;
  createdAt: Date;
  completedAt: Date | null;
  items: ShoppingItem[];
}

export class ShoppingList extends BaseEntity {
  readonly userId: string;
  readonly name: string;
  readonly storeName: string | null;
  readonly listType: ShoppingListType;
  readonly countryCode: string;
  readonly currencyCode: string;
  readonly exchangeRateSnapshot: number;
  readonly ivaEnabled: boolean;
  readonly scheduledDate: Date | null;
  readonly latitude: number | null;
  readonly longitude: number | null;
  readonly isActive: boolean;
  readonly status: ShoppingListStatus;
  readonly totalLocal: number;
  readonly totalUsd: number;
  readonly createdAt: Date;
  readonly completedAt: Date | null;
  readonly items: ShoppingItem[];

  private constructor(id: string, props: ShoppingListProps) {
    super(id);
    this.userId = props.userId;
    this.name = props.name;
    this.storeName = props.storeName;
    this.listType = props.listType;
    this.countryCode = props.countryCode;
    this.currencyCode = props.currencyCode;
    this.exchangeRateSnapshot = props.exchangeRateSnapshot;
    this.ivaEnabled = props.ivaEnabled;
    this.scheduledDate = props.scheduledDate;
    this.latitude = props.latitude;
    this.longitude = props.longitude;
    this.isActive = props.isActive;
    this.status = props.status;
    this.totalLocal = props.totalLocal;
    this.totalUsd = props.totalUsd;
    this.createdAt = props.createdAt;
    this.completedAt = props.completedAt;
    this.items = props.items;
  }

  static create(params: {
    id: string;
    userId: string;
    name: string;
    storeName?: string | null;
    listType: ShoppingListType;
    countryCode: string;
    currencyCode: string;
    exchangeRateSnapshot: number;
    ivaEnabled?: boolean;
    scheduledDate?: Date | null;
    latitude?: number | null;
    longitude?: number | null;
    isActive?: boolean;
    items?: ShoppingItem[];
  }): ShoppingList {
    const items = params.items ?? [];
    const totalLocal = items.reduce((sum, item) => sum + item.totalLocal, 0);
    const totalUsd = items.reduce((sum, item) => sum + (item.totalUsd ?? 0), 0);

    return new ShoppingList(params.id, {
      userId: params.userId,
      name: params.name,
      storeName: params.storeName ?? null,
      listType: params.listType,
      countryCode: params.countryCode,
      currencyCode: params.currencyCode,
      exchangeRateSnapshot: params.exchangeRateSnapshot,
      ivaEnabled: params.ivaEnabled ?? false,
      scheduledDate: params.scheduledDate ?? null,
      latitude: params.latitude ?? null,
      longitude: params.longitude ?? null,
      isActive: params.isActive ?? true,
      status: ShoppingListStatus.ACTIVE,
      totalLocal,
      totalUsd,
      createdAt: new Date(),
      completedAt: null,
      items,
    });
  }

  static reconstitute(id: string, props: ShoppingListProps): ShoppingList {
    return new ShoppingList(id, props);
  }
}
