import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { DebtPriority } from '../../domain/enums/debt-priority.enum';

export class CreateDebtDto {
  @ApiProperty({ example: 'Prestamo a Juan' })
  @IsString()
  @MaxLength(255)
  title!: string;

  @ApiPropertyOptional({ example: 'Prestamo para reparacion del carro' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ example: 150.0, description: 'Monto en USD' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amountUsd!: number;

  @ApiPropertyOptional({
    example: 'MEDIUM',
    enum: DebtPriority,
    default: 'MEDIUM',
  })
  @IsOptional()
  @IsEnum(DebtPriority)
  priority?: DebtPriority;

  @ApiPropertyOptional({
    example: 5.0,
    description: 'Tasa de interes en porcentaje',
    default: 0,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  interestRatePct?: number;

  @ApiPropertyOptional({
    example: '2026-05-15',
    description: 'Fecha de vencimiento (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  dueDate?: string;

  @ApiPropertyOptional({
    example: false,
    description: 'false = yo debo, true = me deben',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isCollection?: boolean;
}
