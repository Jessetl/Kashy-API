import { ApiProperty } from '@nestjs/swagger';

export class DeleteDebtResponseDto {
  @ApiProperty({ example: 'Deuda eliminada exitosamente' })
  message!: string;
}
