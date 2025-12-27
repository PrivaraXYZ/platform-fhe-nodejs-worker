import { EthereumAddress } from '@domain/fhe/value-object/ethereum-address';
import { InvalidContractAddressError, InvalidUserAddressError } from '@domain/fhe/error/fhe.error';

describe('EthereumAddress', () => {
  const validAddress = '0x1234567890123456789012345678901234567890';
  const validAddressUppercase = '0xABCD567890123456789012345678901234567890';

  describe('create', () => {
    it('should create address from valid hex string', () => {
      const result = EthereumAddress.create(validAddress, 'user');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.toString()).toBe(validAddress.toLowerCase());
      }
    });

    it('should normalize address to lowercase', () => {
      const result = EthereumAddress.create(validAddressUppercase, 'user');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.toString()).toBe(validAddressUppercase.toLowerCase());
      }
    });

    it('should return error for invalid address', () => {
      const result = EthereumAddress.create('invalid', 'user');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(InvalidUserAddressError);
      }
    });

    it('should return error for address without 0x prefix', () => {
      const result = EthereumAddress.create('1234567890123456789012345678901234567890', 'user');

      expect(result.ok).toBe(false);
    });

    it('should return error for address with wrong length', () => {
      const result = EthereumAddress.create('0x123', 'user');

      expect(result.ok).toBe(false);
    });
  });

  describe('createContract', () => {
    it('should create contract address', () => {
      const result = EthereumAddress.createContract(validAddress);

      expect(result.ok).toBe(true);
    });

    it('should return InvalidContractAddressError for invalid address', () => {
      const result = EthereumAddress.createContract('invalid');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(InvalidContractAddressError);
      }
    });
  });

  describe('createUser', () => {
    it('should create user address', () => {
      const result = EthereumAddress.createUser(validAddress);

      expect(result.ok).toBe(true);
    });

    it('should return InvalidUserAddressError for invalid address', () => {
      const result = EthereumAddress.createUser('invalid');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(InvalidUserAddressError);
      }
    });
  });

  describe('equals', () => {
    it('should return true for equal addresses', () => {
      const result1 = EthereumAddress.create(validAddress, 'user');
      const result2 = EthereumAddress.create(validAddress, 'user');

      if (result1.ok && result2.ok) {
        expect(result1.value.equals(result2.value)).toBe(true);
      }
    });

    it('should return true for same address with different case', () => {
      const result1 = EthereumAddress.create(validAddress.toLowerCase(), 'user');
      const result2 = EthereumAddress.create(
        validAddress.toUpperCase().replace('0X', '0x'),
        'user',
      );

      if (result1.ok && result2.ok) {
        expect(result1.value.equals(result2.value)).toBe(true);
      }
    });
  });
});
