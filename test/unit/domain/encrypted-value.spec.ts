import { EncryptedValue } from '@domain/fhe/value-object/encrypted-value';
import { EthereumAddress } from '@domain/fhe/value-object/ethereum-address';

describe('EncryptedValue', () => {
  const handle = '0x1234567890abcdef';
  const proof = '0xabcdef1234567890';
  const contractAddressStr = '0x1234567890123456789012345678901234567890';
  const userAddressStr = '0xabcdef0123456789abcdef0123456789abcdef01';

  let contractAddress: EthereumAddress;
  let userAddress: EthereumAddress;

  beforeEach(() => {
    const contractResult = EthereumAddress.createContract(contractAddressStr);
    const userResult = EthereumAddress.createUser(userAddressStr);

    if (contractResult.ok && userResult.ok) {
      contractAddress = contractResult.value;
      userAddress = userResult.value;
    }
  });

  describe('createUint64', () => {
    it('should create uint64 encrypted value', () => {
      const value = EncryptedValue.createUint64(handle, proof, contractAddress, userAddress);

      expect(value.type.toString()).toBe('euint64');
      expect(value.handle).toBe(handle);
      expect(value.proof).toBe(proof);
      expect(value.contractAddress.toString()).toBe(contractAddressStr.toLowerCase());
      expect(value.userAddress.toString()).toBe(userAddressStr.toLowerCase());
    });
  });

  describe('createAddress', () => {
    it('should create address encrypted value', () => {
      const value = EncryptedValue.createAddress(handle, proof, contractAddress, userAddress);

      expect(value.type.toString()).toBe('eaddress');
    });
  });

  describe('createBool', () => {
    it('should create bool encrypted value', () => {
      const value = EncryptedValue.createBool(handle, proof, contractAddress, userAddress);

      expect(value.type.toString()).toBe('ebool');
    });
  });

  describe('toJSON', () => {
    it('should serialize to JSON correctly', () => {
      const value = EncryptedValue.createUint64(handle, proof, contractAddress, userAddress);
      const json = value.toJSON();

      expect(json).toEqual({
        type: 'euint64',
        handle,
        proof,
        contractAddress: contractAddressStr.toLowerCase(),
        userAddress: userAddressStr.toLowerCase(),
      });
    });
  });
});
