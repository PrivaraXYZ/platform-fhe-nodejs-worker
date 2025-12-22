import { Injectable, Inject } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { IFheService, FHE_SERVICE } from '@domain/fhe';

@Injectable()
export class FheHealthIndicator extends HealthIndicator {
  constructor(@Inject(FHE_SERVICE) private readonly fheService: IFheService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const isInitialized = this.fheService.isInitialized();

    const result = this.getStatus(key, isInitialized, {
      initialized: isInitialized,
    });

    if (isInitialized) {
      return result;
    }

    throw new HealthCheckError('FHE service not initialized', result);
  }
}
