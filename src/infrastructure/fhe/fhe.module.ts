import { Module } from '@nestjs/common';
import { FheWorkerPoolService } from './fhe-worker-pool.service';
import { FHE_SERVICE } from '@domain/fhe';

@Module({
  providers: [
    {
      provide: FHE_SERVICE,
      useClass: FheWorkerPoolService,
    },
    FheWorkerPoolService,
  ],
  exports: [FHE_SERVICE, FheWorkerPoolService],
})
export class FheModule {}
