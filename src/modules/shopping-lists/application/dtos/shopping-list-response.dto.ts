import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ShoppingListType } from '../../domain/enums/shopping-list-type.enum';
import { ShoppingItemResponseDto } from './shopping-item-response.dto';

export class ShoppingListResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  userId!: string;

  @ApiProperty({ example: 'Compra semanal' })
  name!: string;

  @ApiPropertyOptional({ example: 'Supermercado Central', nullable: true })
  storeName!: string | null;

  @ApiProperty({ enum: ShoppingListType, example: ShoppingListType.TEMPLATE })
  listType!: ShoppingListType;

  @ApiProperty({ example: 'VE' })
  countryCode!: string;

  @ApiProperty({ example: 'VES' })
  currencyCode!: string;

  @ApiProperty({ example: 36.5 })
  exchangeRateSnapshot!: number;

  @ApiProperty({ example: false })
  ivaEnabled!: boolean;

  @ApiPropertyOptional({
    example: '2026-04-15T18:00:00.000Z',
    nullable: true,
  })
  scheduledDate!: Date | null;

  @ApiPropertyOptional({ example: 10.4806, nullable: true })
  latitude!: number | null;

  @ApiPropertyOptional({ example: -66.9036, nullable: true })
  longitude!: number | null;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ type: [ShoppingItemResponseDto] })
  items!: ShoppingItemResponseDto[];
}
