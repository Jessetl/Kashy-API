import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdatePushTokenDto {
  @ApiProperty({
    example: 'fcm_device_token_xxxxx',
    description: 'Token FCM del dispositivo',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(4096)
  token!: string;

  @ApiProperty({
    example: 'android',
    enum: ['android', 'ios', 'web'],
    description: 'Plataforma del dispositivo que genera el token',
  })
  @IsString()
  @IsIn(['android', 'ios', 'web'])
  platform!: 'android' | 'ios' | 'web';
}
