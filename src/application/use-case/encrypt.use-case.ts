import { Injectable, Inject, Logger } from '@nestjs/common';
import { Result } from '@domain/common/result';
import {
  IFheService,
  FHE_SERVICE,
  EncryptionResult,
} from '@domain/fhe/service/fhe.service.interface';
import { FheDomainError } from '@domain/fhe/error/fhe.error';
import { EncryptionTypeDto } from '../dto/encrypt-request.dto';

export interface EncryptInput {
  type: EncryptionTypeDto;
  value: string | boolean;
  contractAddress: string;
  userAddress: string;
}

export interface EncryptOutput {
  type: EncryptionTypeDto;
  handle: string;
  proof: string;
  contractAddress: string;
  userAddress: string;
  encryptionTimeMs: number;
}

@Injectable()
export class EncryptUseCase {
  private readonly logger = new Logger(EncryptUseCase.name);

  constructor(@Inject(FHE_SERVICE) private readonly fheService: IFheService) {}

  async execute(input: EncryptInput): Promise<Result<EncryptOutput, FheDomainError>> {
    const contractShort =
      input.contractAddress.slice(0, 10) + '...' + input.contractAddress.slice(-4);
    this.logger.debug(`Encrypting ${input.type} for contract=${contractShort}`);

    const result = await this.performEncryption(input);

    if (!result.ok) {
      this.logger.warn(`Encryption failed: ${result.error.code} - ${result.error.message}`);
      return result;
    }

    this.logger.debug(`Encrypted ${input.type} in ${result.value.encryptionTimeMs}ms`);

    return {
      ok: true,
      value: {
        type: input.type,
        handle: result.value.encryptedValue.handle,
        proof: result.value.encryptedValue.proof,
        contractAddress: result.value.encryptedValue.contractAddress.toString(),
        userAddress: result.value.encryptedValue.userAddress.toString(),
        encryptionTimeMs: result.value.encryptionTimeMs,
      },
    };
  }

  private async performEncryption(
    input: EncryptInput,
  ): Promise<Result<EncryptionResult, FheDomainError>> {
    switch (input.type) {
      case EncryptionTypeDto.UINT64:
        return this.fheService.encryptUint64(
          BigInt(input.value as string),
          input.contractAddress,
          input.userAddress,
        );

      case EncryptionTypeDto.ADDRESS:
        return this.fheService.encryptAddress(
          input.value as string,
          input.contractAddress,
          input.userAddress,
        );

      case EncryptionTypeDto.BOOL:
        return this.fheService.encryptBool(
          input.value as boolean,
          input.contractAddress,
          input.userAddress,
        );
    }
  }
}
