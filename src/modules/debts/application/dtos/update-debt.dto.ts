import { ApiPropertyOptional } from '@nestjs/swagger';
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

export class UpdateDebtDto {
  @ApiPropertyOptional({ example: 'Prestamo actualizado' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({ example: 'Descripcion actualizada' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string | null;

  @ApiPropertyOptional({ example: 200.0, description: 'Monto en USD' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amountUsd?: number;

  @ApiPropertyOptional({ example: 'HIGH', enum: DebtPriority })
  @IsOptional()
  @IsEnum(DebtPriority)
  priority?: DebtPriority;

  @ApiPropertyOptional({
    example: 10.0,
    description: 'Tasa de interes en porcentaje',
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  interestRatePct?: number;

  @ApiPropertyOptional({
    example: '2026-06-01',
    description: 'Fecha de vencimiento (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  dueDate?: string | null;

  @ApiPropertyOptional({
    example: true,
    description: 'false = yo debo, true = me deben',
  })
  @IsOptional()
  @IsBoolean()
  isCollection?: boolean;
}
