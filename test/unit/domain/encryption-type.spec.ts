import { EncryptionType, UnsupportedEncryptionTypeError } from '@domain/fhe';

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
});
