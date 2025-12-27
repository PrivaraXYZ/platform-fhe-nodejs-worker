import { Uint64Value } from '@domain/fhe/value-object/uint64-value';
import { InvalidEncryptionValueError } from '@domain/fhe/error/fhe.error';

describe('Uint64Value', () => {
  describe('create', () => {
    it('should create value from valid bigint', () => {
      const result = Uint64Value.create(1000n);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.toBigInt()).toBe(1000n);
      }
    });

    it('should create value from zero', () => {
      const result = Uint64Value.create(0n);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.toBigInt()).toBe(0n);
      }
    });

    it('should create value from max uint64', () => {
      const maxUint64 = BigInt('18446744073709551615');
      const result = Uint64Value.create(maxUint64);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.toBigInt()).toBe(maxUint64);
      }
    });

    it('should return error for negative value', () => {
      const result = Uint64Value.create(-1n);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(InvalidEncryptionValueError);
        expect(result.error.message).toContain('negative');
      }
    });

    it('should return error for value exceeding max uint64', () => {
      const tooLarge = BigInt('18446744073709551616');
      const result = Uint64Value.create(tooLarge);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(InvalidEncryptionValueError);
        expect(result.error.message).toContain('exceeds');
      }
    });
  });

  describe('toString', () => {
    it('should return string representation', () => {
      const result = Uint64Value.create(12345n);

      if (result.ok) {
        expect(result.value.toString()).toBe('12345');
      }
    });
  });
});
