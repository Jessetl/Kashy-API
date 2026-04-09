import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserOrmEntity } from './infrastructure/persistence/orm-entities/user.orm-entity';
import { TypeOrmUserRepository } from './infrastructure/persistence/repositories/typeorm-user.repository';
import { USER_REPOSITORY } from './domain/interfaces/repositories/user.repository.interface';
import { SyncFirebaseUserUseCase } from './application/use-cases/sync-firebase-user.use-case';
import { GetUserByIdUseCase } from './application/use-cases/get-user-by-id.use-case';
import { RegisterUserUseCase } from './application/use-cases/register-user.use-case';
import { LoginUserUseCase } from './application/use-cases/login-user.use-case';
import { RefreshUserTokenUseCase } from './application/use-cases/refresh-user-token.use-case';
import { UsersController } from './infrastructure/controllers/users.controller';
import { FIREBASE_USER_SYNC_PORT } from '../../shared-kernel/domain/interfaces/firebase-user-sync.port';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([UserOrmEntity])],
  controllers: [UsersController],
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: TypeOrmUserRepository,
    },
    SyncFirebaseUserUseCase,
    {
      provide: FIREBASE_USER_SYNC_PORT,
      useExisting: SyncFirebaseUserUseCase,
    },
    GetUserByIdUseCase,
    RegisterUserUseCase,
    LoginUserUseCase,
    RefreshUserTokenUseCase,
  ],
  exports: [USER_REPOSITORY, SyncFirebaseUserUseCase, FIREBASE_USER_SYNC_PORT],
})
export class UsersModule {}
