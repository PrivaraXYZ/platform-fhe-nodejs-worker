import { Module } from '@nestjs/common';
import { EncryptController } from './encrypt.controller';
import { EncryptUseCase } from '@application/use-case/encrypt.use-case';
import { BatchEncryptUseCase } from '@application/use-case/encrypt-batch.use-case';
import { FheModule } from '@infrastructure/fhe/fhe.module';

@Module({
  imports: [FheModule],
  controllers: [EncryptController],
  providers: [EncryptUseCase, BatchEncryptUseCase],
})
export class EncryptModule {}
