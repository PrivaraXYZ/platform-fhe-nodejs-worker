import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService, HealthCheckResult } from '@nestjs/terminus';
import { FheHealthIndicator } from './fhe.health';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly fheHealth: FheHealthIndicator,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Liveness probe' })
  @ApiResponse({ status: 200, description: 'Service is alive' })
  @HealthCheck()
  liveness(): HealthCheckResult {
    return {
      status: 'ok',
      info: {},
      error: {},
      details: {},
    };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe' })
  @ApiResponse({ status: 200, description: 'Service is ready' })
  @ApiResponse({ status: 503, description: 'Service not ready' })
  @HealthCheck()
  readiness(): Promise<HealthCheckResult> {
    return this.health.check([() => this.fheHealth.isHealthy('fhe')]);
  }
}
