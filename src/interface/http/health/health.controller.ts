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
  @ApiOperation({
    summary: 'Liveness probe',
    description: `Basic liveness check for Kubernetes/container orchestration.

Returns 200 if the service process is running. Does not check external dependencies.

**Use for:** \`livenessProbe\` in Kubernetes deployments.`,
  })
  @ApiResponse({
    status: 200,
    description: 'Service is alive',
    content: {
      'application/json': {
        example: {
          status: 'ok',
          info: {},
          error: {},
          details: {},
        },
      },
    },
  })
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
  @ApiOperation({
    summary: 'Readiness probe',
    description: `Deep readiness check verifying FHEVM initialization.

Returns 200 only when the service is fully ready to handle encryption requests.
Returns 503 if FHEVM is not yet initialized or has failed.

**Use for:** \`readinessProbe\` in Kubernetes deployments.`,
  })
  @ApiResponse({
    status: 200,
    description: 'Service is ready to handle requests',
    content: {
      'application/json': {
        example: {
          status: 'ok',
          info: { fhe: { status: 'up' } },
          error: {},
          details: { fhe: { status: 'up' } },
        },
      },
    },
  })
  @ApiResponse({
    status: 503,
    description: 'Service not ready — FHEVM not initialized',
    content: {
      'application/json': {
        example: {
          status: 'error',
          info: {},
          error: { fhe: { status: 'down', message: 'FHEVM not initialized' } },
          details: { fhe: { status: 'down', message: 'FHEVM not initialized' } },
        },
      },
    },
  })
  @HealthCheck()
  readiness(): Promise<HealthCheckResult> {
    return this.health.check([() => this.fheHealth.isHealthy('fhe')]);
  }
}
