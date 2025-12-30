export abstract class FheDomainError extends Error {
  abstract readonly code: string;

  protected constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class FhevmNotInitializedError extends FheDomainError {
  readonly code = 'FHEVM_NOT_INITIALIZED';

  constructor() {
    super('FHEVM not initialized. Service is not ready.');
  }
}

export class FhevmInitializationError extends FheDomainError {
  readonly code = 'FHEVM_INITIALIZATION_FAILED';

  constructor(
    message: string,
    public readonly cause?: Error,
  ) {
    super(`FHEVM initialization failed: ${message}`);
  }
}

export class EncryptionError extends FheDomainError {
  readonly code = 'ENCRYPTION_FAILED';

  constructor(
    public readonly valueType: string,
    message: string,
    public readonly cause?: Error,
  ) {
    super(`Failed to encrypt ${valueType}: ${message}`);
  }
}

export class EncryptionTimeoutError extends FheDomainError {
  readonly code = 'ENCRYPTION_TIMEOUT';

  constructor(public readonly timeoutMs: number) {
    super(`Encryption timeout after ${timeoutMs}ms`);
  }
}

export class InvalidContractAddressError extends FheDomainError {
  readonly code = 'INVALID_CONTRACT_ADDRESS';

  constructor(public readonly address: string) {
    super(`Invalid contract address: ${address}`);
  }
}

export class InvalidUserAddressError extends FheDomainError {
  readonly code = 'INVALID_USER_ADDRESS';

  constructor(public readonly address: string) {
    super(`Invalid user address: ${address}`);
  }
}

export class InvalidEncryptionValueError extends FheDomainError {
  readonly code = 'INVALID_ENCRYPTION_VALUE';

  constructor(
    public readonly value: unknown,
    message: string,
  ) {
    super(`Invalid encryption value: ${message}`);
  }
}

export class UnsupportedEncryptionTypeError extends FheDomainError {
  readonly code = 'UNSUPPORTED_ENCRYPTION_TYPE';

  constructor(public readonly type: string) {
    super(`Unsupported encryption type: ${type}`);
  }
}

export class WorkerPoolExhaustedError extends FheDomainError {
  readonly code = 'WORKER_POOL_EXHAUSTED';

  constructor() {
    super('Worker pool exhausted. Too many concurrent requests.');
  }
}

export class BatchValidationError extends FheDomainError {
  readonly code = 'BATCH_VALIDATION_ERROR';

  constructor(message: string) {
    super(message);
  }
}
