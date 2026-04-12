import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class NotificationResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  userId!: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  debtId!: string;

  @ApiProperty({ example: 'debt_due_reminder' })
  type!: string;

  @ApiProperty({ example: '2026-05-14T12:00:00.000Z' })
  scheduledAt!: Date;

  @ApiPropertyOptional({ example: '2026-05-14T12:00:00.000Z', nullable: true })
  sentAt!: Date | null;

  @ApiProperty({ example: 'PENDING', enum: ['PENDING', 'SENT', 'FAILED'] })
  status!: string;
}
