import { Module } from '@nestjs/common';
import { EncryptController } from './encrypt.controller';
import { EncryptUseCase } from '@application/use-case';
import { FheModule } from '@infrastructure/fhe';

@Module({
  imports: [FheModule],
  controllers: [EncryptController],
  providers: [EncryptUseCase],
})
export class EncryptModule {}
