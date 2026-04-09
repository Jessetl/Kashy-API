import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { DebtPriority } from '../../domain/enums/debt-priority.enum';

export class ListDebtsQueryDto {
  @ApiPropertyOptional({ example: 'HIGH', enum: DebtPriority })
  @IsOptional()
  @IsEnum(DebtPriority)
  priority?: DebtPriority;

  @ApiPropertyOptional({
    example: 'false',
    description: 'Filtrar por cobros (true) o deudas (false)',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  is_collection?: boolean;

  @ApiPropertyOptional({
    example: 'false',
    description: 'Filtrar por pagadas (true) o pendientes (false)',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  is_paid?: boolean;
}
