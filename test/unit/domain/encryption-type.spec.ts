import { EncryptionType } from '@domain/fhe/value-object/encryption-type';
import { UnsupportedEncryptionTypeError } from '@domain/fhe/error/fhe.error';

describe('EncryptionType', () => {
  describe('fromString', () => {
    it('should create UINT64 from euint64', () => {
      const result = EncryptionType.fromString('euint64');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.toString()).toBe(EncryptionType.UINT64.toString());
      }
    });

    it('should create ADDRESS from eaddress', () => {
      const result = EncryptionType.fromString('eaddress');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.toString()).toBe(EncryptionType.ADDRESS.toString());
      }
    });

    it('should create BOOL from ebool', () => {
      const result = EncryptionType.fromString('ebool');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.toString()).toBe(EncryptionType.BOOL.toString());
      }
    });

    it('should return error for unsupported type', () => {
      const result = EncryptionType.fromString('euint256');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(UnsupportedEncryptionTypeError);
        expect(result.error.message).toContain('euint256');
      }
    });
  });

  describe('toString', () => {
    it('should return euint64 for UINT64', () => {
      expect(EncryptionType.UINT64.toString()).toBe('euint64');
    });

    it('should return eaddress for ADDRESS', () => {
      expect(EncryptionType.ADDRESS.toString()).toBe('eaddress');
    });

    it('should return ebool for BOOL', () => {
      expect(EncryptionType.BOOL.toString()).toBe('ebool');
    });
  });

  describe('values', () => {
    it('should return all encryption types', () => {
      const values = EncryptionType.values();

      expect(values).toHaveLength(3);
      expect(values).toContain(EncryptionType.UINT64);
      expect(values).toContain(EncryptionType.ADDRESS);
      expect(values).toContain(EncryptionType.BOOL);
    });
  });

  describe('equals', () => {
    it('should return true for same types', () => {
      expect(EncryptionType.UINT64.equals(EncryptionType.UINT64)).toBe(true);
      expect(EncryptionType.ADDRESS.equals(EncryptionType.ADDRESS)).toBe(true);
      expect(EncryptionType.BOOL.equals(EncryptionType.BOOL)).toBe(true);
    });

    it('should return false for different types', () => {
      expect(EncryptionType.UINT64.equals(EncryptionType.ADDRESS)).toBe(false);
      expect(EncryptionType.ADDRESS.equals(EncryptionType.BOOL)).toBe(false);
      expect(EncryptionType.BOOL.equals(EncryptionType.UINT64)).toBe(false);
    });
  });

  describe('type checks', () => {
    it('isUint64 should return true only for UINT64', () => {
      expect(EncryptionType.UINT64.isUint64()).toBe(true);
      expect(EncryptionType.ADDRESS.isUint64()).toBe(false);
      expect(EncryptionType.BOOL.isUint64()).toBe(false);
    });

    it('isAddress should return true only for ADDRESS', () => {
      expect(EncryptionType.UINT64.isAddress()).toBe(false);
      expect(EncryptionType.ADDRESS.isAddress()).toBe(true);
      expect(EncryptionType.BOOL.isAddress()).toBe(false);
    });

    it('isBool should return true only for BOOL', () => {
      expect(EncryptionType.UINT64.isBool()).toBe(false);
      expect(EncryptionType.ADDRESS.isBool()).toBe(false);
      expect(EncryptionType.BOOL.isBool()).toBe(true);
    });
  });
});
