import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../../../shared-kernel/infrastructure/decorators/public.decorator';
import { RegisterUserUseCase } from '../../application/use-cases/register-user.use-case';
import { LoginUserUseCase } from '../../application/use-cases/login-user.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/refresh-token.use-case';
import { RegisterUserDto } from '../../application/dtos/register-user.dto';
import { LoginUserDto } from '../../application/dtos/login-user.dto';
import { AuthResponseDto } from '../../application/dtos/auth-response.dto';
import { RefreshResponseDto } from '../../application/dtos/refresh-response.dto';
import { RegisterResponseDto } from '../../application/dtos/register-response.dto';
import {
  DeviceIdHeader,
  DeviceInfo,
  DeviceInfoHeaders,
} from '../decorators/device-info.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUser: RegisterUserUseCase,
    private readonly loginUser: LoginUserUseCase,
    private readonly refreshToken: RefreshTokenUseCase,
  ) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registrar nuevo usuario',
    description:
      'Crea cuenta en Firebase Auth, fila en users y preferencias por defecto. Envia correo de verificacion via Firebase. No emite JWT — el usuario debe verificar su email e iniciar sesion.',
  })
  @ApiResponse({
    status: 201,
    description: 'Usuario registrado, correo de verificacion enviado',
    type: RegisterResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos invalidos o email en uso' })
  @ApiResponse({ status: 409, description: 'Usuario ya existe' })
  register(@Body() dto: RegisterUserDto): Promise<RegisterResponseDto> {
    return this.registerUser.execute(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login con email + password',
    description:
      'Autentica contra Firebase, upserta refresh token encriptado en user_devices y devuelve JWT custom (15 min) + perfil.',
  })
  @ApiHeader({ name: 'X-Device-Id', required: true })
  @ApiHeader({ name: 'X-Device-Name', required: true })
  @ApiHeader({ name: 'X-Fcm-Token', required: false })
  @ApiHeader({ name: 'X-Platform', required: false })
  @ApiHeader({ name: 'X-App-Version', required: false })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Credenciales invalidas' })
  login(
    @Body() dto: LoginUserDto,
    @DeviceInfoHeaders() device: DeviceInfo,
  ): Promise<AuthResponseDto> {
    return this.loginUser.execute({ dto, device });
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Renovar JWT custom',
    description:
      'Usa el firebase_refresh_token encriptado del dispositivo (lookup por X-Device-Id) para obtener un nuevo idToken de Firebase y firma un nuevo JWT custom.',
  })
  @ApiHeader({ name: 'X-Device-Id', required: true })
  @ApiHeader({ name: 'X-Device-Name', required: false })
  @ApiResponse({
    status: 200,
    description: 'JWT renovado',
    type: RefreshResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Refresh token invalido o revocado',
  })
  refresh(
    @DeviceIdHeader() deviceId: string,
    @Headers('x-device-name') _deviceName?: string,
  ): Promise<RefreshResponseDto> {
    void _deviceName;
    return this.refreshToken.execute({ deviceId });
  }
}
