import { Result } from '@domain/common';
import { EncryptedValue } from '../value-object';
import { FheConfig } from '../model';
import { FheDomainError } from '../error';

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
