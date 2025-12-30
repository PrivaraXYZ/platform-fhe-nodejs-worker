import { Injectable } from '@nestjs/common';
import { Result, Ok, Err } from '@domain/common/result';
import { FheDomainError, BatchValidationError } from '@domain/fhe/error/fhe.error';
import { EncryptionTypeDto } from '../dto/encrypt-request.dto';
import { EncryptUseCase, EncryptOutput } from './encrypt.use-case';

export interface BatchItem {
  type: EncryptionTypeDto;
  value: string | boolean;
  contractAddress?: string;
  userAddress?: string;
}

export interface BatchEncryptInput {
  contractAddress?: string;
  userAddress?: string;
  items: BatchItem[];
}

export interface BatchEncryptOutput {
  results: EncryptOutput[];
  totalEncryptionTimeMs: number;
}

@Injectable()
export class BatchEncryptUseCase {
  constructor(private readonly encryptUseCase: EncryptUseCase) {}

  async execute(
    input: BatchEncryptInput,
  ): Promise<Result<BatchEncryptOutput, FheDomainError | BatchValidationError>> {
    const validationResult = this.validateInput(input);
    if (!validationResult.ok) return validationResult;

    const normalizedItems = this.normalizeItems(input);
    const results: EncryptOutput[] = [];
    const startTime = Date.now();

    for (const item of normalizedItems) {
      const result = await this.encryptUseCase.execute(item);
      if (!result.ok) return result;
      results.push(result.value);
    }

    return Ok({
      results,
      totalEncryptionTimeMs: Date.now() - startTime,
    });
  }

  private validateInput(input: BatchEncryptInput): Result<void, BatchValidationError> {
    const hasSharedContext = input.contractAddress && input.userAddress;
    const hasPartialSharedContext =
      (input.contractAddress && !input.userAddress) ||
      (!input.contractAddress && input.userAddress);

    if (hasPartialSharedContext) {
      return Err(
        new BatchValidationError(
          'Both contractAddress and userAddress must be provided together at batch level',
        ),
      );
    }

    for (let i = 0; i < input.items.length; i++) {
      const item = input.items[i];
      const hasItemContext = item.contractAddress && item.userAddress;
      const hasPartialItemContext =
        (item.contractAddress && !item.userAddress) || (!item.contractAddress && item.userAddress);

      if (hasPartialItemContext) {
        return Err(
          new BatchValidationError(
            `Item ${i}: Both contractAddress and userAddress must be provided together`,
          ),
        );
      }

      if (hasSharedContext && hasItemContext) {
        return Err(
          new BatchValidationError(
            `Item ${i}: Cannot specify addresses when batch-level addresses are provided`,
          ),
        );
      }

      if (!hasSharedContext && !hasItemContext) {
        return Err(new BatchValidationError(`Item ${i}: Missing contractAddress and userAddress`));
      }
    }

    return Ok(undefined);
  }

  private normalizeItems(input: BatchEncryptInput): Array<{
    type: EncryptionTypeDto;
    value: string | boolean;
    contractAddress: string;
    userAddress: string;
  }> {
    return input.items.map((item) => ({
      type: item.type,
      value: item.value,
      contractAddress: item.contractAddress || input.contractAddress!,
      userAddress: item.userAddress || input.userAddress!,
    }));
  }
}
