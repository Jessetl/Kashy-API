import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DebtResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  userId!: string;

  @ApiProperty({ example: 'Prestamo a Juan' })
  title!: string;

  @ApiPropertyOptional({
    example: 'Prestamo para reparacion del carro',
    nullable: true,
  })
  description!: string | null;

  @ApiProperty({ example: 150.0 })
  amountUsd!: number;

  @ApiProperty({ example: 'MEDIUM', enum: ['HIGH', 'MEDIUM', 'LOW'] })
  priority!: string;

  @ApiProperty({ example: 5.0 })
  interestRatePct!: number;

  @ApiProperty({ example: 7.5 })
  interestAmountUsd!: number;

  @ApiPropertyOptional({ example: '2026-05-15', nullable: true })
  dueDate!: Date | null;

  @ApiProperty({ example: false })
  isPaid!: boolean;

  @ApiProperty({
    example: false,
    description: 'false = yo debo, true = me deben',
  })
  isCollection!: boolean;

  @ApiProperty({ example: '2026-04-09T12:00:00.000Z' })
  createdAt!: Date;
}
