import type { ExchangeRateSnapshot } from '../../../../shared-kernel/domain/interfaces/exchange-rate-provider.interface';
import { ExchangeRateResponseDto } from '../dtos/exchange-rate-response.dto';

export class ExchangeRateMapper {
  static toResponse(rate: ExchangeRateSnapshot): ExchangeRateResponseDto {
    const dto = new ExchangeRateResponseDto();
    dto.rateLocalPerUsd = rate.rateLocalPerUsd;
    dto.source = rate.source;
    dto.fetchedAt = rate.fetchedAt;
    return dto;
  }
}
