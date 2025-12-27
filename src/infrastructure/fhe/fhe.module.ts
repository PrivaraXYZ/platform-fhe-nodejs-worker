import { Module } from '@nestjs/common';
import { FheWorkerPoolService } from './fhe-worker-pool.service';
import { FHE_SERVICE } from '@domain/fhe/service/fhe.service.interface';

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
