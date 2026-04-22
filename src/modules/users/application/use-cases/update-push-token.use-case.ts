import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '../../../../shared-kernel/application/use-case';
import { NotFoundException } from '../../../../shared-kernel/domain/exceptions/not-found.exception';
import type { IUserRepository } from '../../domain/interfaces/repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../domain/interfaces/repositories/user.repository.interface';
import { UserResponseDto } from '../dtos/user-response.dto';
import { UserMapper } from '../mappers/user.mapper';

interface Input {
  firebaseUid: string;
  token: string | null;
  platform: string | null;
}

@Injectable()
export class UpdatePushTokenUseCase implements UseCase<Input, UserResponseDto> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
  ) {}

  async execute({
    firebaseUid,
    token,
    platform,
  }: Input): Promise<UserResponseDto> {
    const user = await this.userRepository.findByFirebaseUid(firebaseUid);
    if (!user) {
      throw new NotFoundException('User', firebaseUid);
    }

    const updated = user.updateProfile({
      fcmToken: token,
      fcmPlatform: platform,
    });
    const saved = await this.userRepository.save(updated);
    return UserMapper.toResponse(saved);
  }
}
