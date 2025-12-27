import {
  FheDomainError,
  FhevmNotInitializedError,
  FhevmInitializationError,
  EncryptionError,
  EncryptionTimeoutError,
  InvalidContractAddressError,
  InvalidUserAddressError,
  InvalidEncryptionValueError,
  UnsupportedEncryptionTypeError,
  WorkerPoolExhaustedError,
} from '@domain/fhe/error/fhe.error';

describe('FHE Domain Errors', () => {
  describe('FhevmNotInitializedError', () => {
    it('should have correct code and message', () => {
      const error = new FhevmNotInitializedError();

      expect(error).toBeInstanceOf(FheDomainError);
      expect(error.code).toBe('FHEVM_NOT_INITIALIZED');
      expect(error.message).toContain('not initialized');
    });
  });

  describe('FhevmInitializationError', () => {
    it('should include original error details', () => {
      const cause = new Error('SDK failed');
      const error = new FhevmInitializationError('Init failed', cause);

      expect(error.code).toBe('FHEVM_INITIALIZATION_FAILED');
      expect(error.message).toContain('Init failed');
      expect(error.cause).toBe(cause);
    });
  });

  describe('EncryptionError', () => {
    it('should include type and details', () => {
      const error = new EncryptionError('uint64', 'Encryption failed');

      expect(error.code).toBe('ENCRYPTION_FAILED');
      expect(error.message).toContain('uint64');
      expect(error.message).toContain('Encryption failed');
    });
  });

  describe('EncryptionTimeoutError', () => {
    it('should include timeout duration', () => {
      const error = new EncryptionTimeoutError(45000);

      expect(error.code).toBe('ENCRYPTION_TIMEOUT');
      expect(error.message).toContain('45000');
    });
  });

  describe('InvalidContractAddressError', () => {
    it('should include invalid address', () => {
      const error = new InvalidContractAddressError('bad-address');

      expect(error.code).toBe('INVALID_CONTRACT_ADDRESS');
      expect(error.message).toContain('bad-address');
    });
  });

  describe('InvalidUserAddressError', () => {
    it('should include invalid address', () => {
      const error = new InvalidUserAddressError('bad-address');

      expect(error.code).toBe('INVALID_USER_ADDRESS');
      expect(error.message).toContain('bad-address');
    });
  });

  describe('InvalidEncryptionValueError', () => {
    it('should include invalid value', () => {
      const error = new InvalidEncryptionValueError('uint64', 'Value is negative');

      expect(error.code).toBe('INVALID_ENCRYPTION_VALUE');
      expect(error.message).toContain('negative');
    });
  });

  describe('UnsupportedEncryptionTypeError', () => {
    it('should include unsupported type', () => {
      const error = new UnsupportedEncryptionTypeError('euint256');

      expect(error.code).toBe('UNSUPPORTED_ENCRYPTION_TYPE');
      expect(error.message).toContain('euint256');
    });
  });

  describe('WorkerPoolExhaustedError', () => {
    it('should have correct code and message', () => {
      const error = new WorkerPoolExhaustedError();

      expect(error.code).toBe('WORKER_POOL_EXHAUSTED');
      expect(error.message).toContain('exhausted');
    });
  });
});
