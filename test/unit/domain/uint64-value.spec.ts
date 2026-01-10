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

  describe('create from string', () => {
    it('should create value from valid string', () => {
      const result = Uint64Value.create('1000');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.toBigInt()).toBe(1000n);
      }
    });

    it('should return error for invalid string', () => {
      const result = Uint64Value.create('not-a-number');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(InvalidEncryptionValueError);
        expect(result.error.message).toContain('Invalid numeric value');
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

  describe('equals', () => {
    it('should return true for equal values', () => {
      const result1 = Uint64Value.create(1000n);
      const result2 = Uint64Value.create(1000n);

      if (result1.ok && result2.ok) {
        expect(result1.value.equals(result2.value)).toBe(true);
      }
    });

    it('should return false for different values', () => {
      const result1 = Uint64Value.create(1000n);
      const result2 = Uint64Value.create(2000n);

      if (result1.ok && result2.ok) {
        expect(result1.value.equals(result2.value)).toBe(false);
      }
    });
  });
});
