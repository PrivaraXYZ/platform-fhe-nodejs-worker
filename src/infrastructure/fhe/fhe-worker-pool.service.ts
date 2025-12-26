import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { resolve } from 'path';
import { Piscina } from 'piscina';
import { Result, Ok, Err } from '@domain/common/result';
import { IFheService, EncryptionResult } from '@domain/fhe/service/fhe.service.interface';
import { FheConfig } from '@domain/fhe/model/fhe-config';
import {
  FheDomainError,
  FhevmNotInitializedError,
  FhevmInitializationError,
  EncryptionError,
  EncryptionTimeoutError,
  WorkerPoolExhaustedError,
} from '@domain/fhe/error/fhe.error';
import { EncryptedValue } from '@domain/fhe/value-object/encrypted-value';
import { EthereumAddress } from '@domain/fhe/value-object/ethereum-address';
import { Uint64Value } from '@domain/fhe/value-object/uint64-value';
import { WorkerConfig } from '../config/worker.config';

interface WorkerResult {
  handle: string;
  proof: string;
  encryptionTimeMs: number;
}

@Injectable()
export class FheWorkerPoolService implements IFheService, OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(FheWorkerPoolService.name);
  private pool: Piscina | null = null;
  private readonly fheConfig: FheConfig;
  private readonly workerConfig: WorkerConfig;
  private initialized = false;

  constructor(private readonly configService: ConfigService) {
    this.fheConfig = this.configService.get<FheConfig>('fhe')!;
    this.workerConfig = this.configService.get<WorkerConfig>('worker')!;
  }

  async onModuleInit(): Promise<void> {
    await this.initialize();
  }

  async onModuleDestroy(): Promise<void> {
    if (this.pool) {
      this.logger.log('Shutting down worker pool...');
      await this.pool.destroy();
      this.pool = null;
      this.initialized = false;
    }
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    this.logger.log('Initializing FHE worker pool...', {
      minThreads: this.workerConfig.minThreads,
      maxThreads: this.workerConfig.maxThreads,
    });

    try {
      this.pool = new Piscina({
        filename: resolve(__dirname, 'workers/fhe.worker.js'),
        minThreads: this.workerConfig.minThreads,
        maxThreads: this.workerConfig.maxThreads,
        idleTimeout: this.workerConfig.idleTimeout,
        maxQueue: this.workerConfig.maxQueue,
      });

      this.initialized = true;
      this.logger.log('FHE worker pool initialized successfully');
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error('Failed to initialize worker pool', err.stack);
      throw new FhevmInitializationError(err.message, err);
    }
  }

  isInitialized(): boolean {
    return this.initialized && this.pool !== null;
  }

  getConfig(): FheConfig {
    return this.fheConfig;
  }

  async encryptUint64(
    value: bigint,
    contractAddress: string,
    userAddress: string,
  ): Promise<Result<EncryptionResult, FheDomainError>> {
    const validationResult = this.validateInputs(contractAddress, userAddress);
    if (!validationResult.ok) return validationResult;

    const valueResult = Uint64Value.create(value);
    if (!valueResult.ok) return valueResult;

    return this.executeEncryption(
      'uint64',
      value.toString(),
      validationResult.value.contractAddress,
      validationResult.value.userAddress,
    );
  }

  async encryptAddress(
    address: string,
    contractAddress: string,
    userAddress: string,
  ): Promise<Result<EncryptionResult, FheDomainError>> {
    const validationResult = this.validateInputs(contractAddress, userAddress);
    if (!validationResult.ok) return validationResult;

    const addressResult = EthereumAddress.create(address, 'user');
    if (!addressResult.ok) return addressResult;

    return this.executeEncryption(
      'address',
      address,
      validationResult.value.contractAddress,
      validationResult.value.userAddress,
    );
  }

  async encryptBool(
    value: boolean,
    contractAddress: string,
    userAddress: string,
  ): Promise<Result<EncryptionResult, FheDomainError>> {
    const validationResult = this.validateInputs(contractAddress, userAddress);
    if (!validationResult.ok) return validationResult;

    return this.executeEncryption(
      'bool',
      value,
      validationResult.value.contractAddress,
      validationResult.value.userAddress,
    );
  }

  private validateInputs(
    contractAddress: string,
    userAddress: string,
  ): Result<{ contractAddress: EthereumAddress; userAddress: EthereumAddress }, FheDomainError> {
    const contractResult = EthereumAddress.createContract(contractAddress);
    if (!contractResult.ok) return contractResult;

    const userResult = EthereumAddress.createUser(userAddress);
    if (!userResult.ok) return userResult;

    return Ok({
      contractAddress: contractResult.value,
      userAddress: userResult.value,
    });
  }

  private async executeEncryption(
    type: 'uint64' | 'address' | 'bool',
    value: string | boolean,
    contractAddress: EthereumAddress,
    userAddress: EthereumAddress,
  ): Promise<Result<EncryptionResult, FheDomainError>> {
    if (!this.pool) {
      return Err(new FhevmNotInitializedError());
    }

    try {
      const result = await Promise.race([
        this.pool.run({
          type,
          value,
          contractAddress: contractAddress.toString(),
          userAddress: userAddress.toString(),
        }) as Promise<WorkerResult>,
        new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new EncryptionTimeoutError(this.workerConfig.taskTimeout)),
            this.workerConfig.taskTimeout,
          ),
        ),
      ]);

      const encryptedValue = this.createEncryptedValue(
        type,
        result.handle,
        result.proof,
        contractAddress,
        userAddress,
      );

      return Ok({
        encryptedValue,
        encryptionTimeMs: result.encryptionTimeMs,
      });
    } catch (error) {
      if (error instanceof FheDomainError) {
        return Err(error);
      }

      const err = error instanceof Error ? error : new Error(String(error));

      if (err.message.includes('queue')) {
        return Err(new WorkerPoolExhaustedError());
      }

      return Err(new EncryptionError(type, err.message, err));
    }
  }

  private createEncryptedValue(
    type: 'uint64' | 'address' | 'bool',
    handle: string,
    proof: string,
    contractAddress: EthereumAddress,
    userAddress: EthereumAddress,
  ): EncryptedValue {
    switch (type) {
      case 'uint64':
        return EncryptedValue.createUint64(handle, proof, contractAddress, userAddress);
      case 'address':
        return EncryptedValue.createAddress(handle, proof, contractAddress, userAddress);
      case 'bool':
        return EncryptedValue.createBool(handle, proof, contractAddress, userAddress);
    }
  }
}
