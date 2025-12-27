import { Result } from '@domain/common/result';
import { EncryptedValue } from '../value-object/encrypted-value';
import { FheConfig } from '../model/fhe-config';
import { FheDomainError } from '../error/fhe.error';

export interface EncryptionResult {
  encryptedValue: EncryptedValue;
  encryptionTimeMs: number;
}

export interface IFheService {
  initialize(): Promise<void>;
  isInitialized(): boolean;
  getConfig(): FheConfig;

  encryptUint64(
    value: bigint,
    contractAddress: string,
    userAddress: string,
  ): Promise<Result<EncryptionResult, FheDomainError>>;

  encryptAddress(
    address: string,
    contractAddress: string,
    userAddress: string,
  ): Promise<Result<EncryptionResult, FheDomainError>>;

  encryptBool(
    value: boolean,
    contractAddress: string,
    userAddress: string,
  ): Promise<Result<EncryptionResult, FheDomainError>>;
}

export const FHE_SERVICE = Symbol('IFheService');
