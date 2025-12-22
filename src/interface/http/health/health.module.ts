import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { FheHealthIndicator } from './fhe.health';
import { FheModule } from '@infrastructure/fhe';

@Module({
  imports: [TerminusModule, FheModule],
  controllers: [HealthController],
  providers: [FheHealthIndicator],
})
export class HealthModule {}
