import { EncryptionType } from './encryption-type';
import { EthereumAddress } from './ethereum-address';

export interface EncryptedValueJson {
  type: string;
  handle: string;
  proof: string;
  contractAddress: string;
  userAddress: string;
}

export class EncryptedValue {
  private constructor(
    public readonly type: EncryptionType,
    public readonly handle: string,
    public readonly proof: string,
    public readonly contractAddress: EthereumAddress,
    public readonly userAddress: EthereumAddress,
  ) {}

  static createUint64(
    handle: string,
    proof: string,
    contractAddress: EthereumAddress,
    userAddress: EthereumAddress,
  ): EncryptedValue {
    return new EncryptedValue(
      EncryptionType.UINT64,
      EncryptedValue.normalizeHex(handle),
      EncryptedValue.normalizeHex(proof),
      contractAddress,
      userAddress,
    );
  }

  static createAddress(
    handle: string,
    proof: string,
    contractAddress: EthereumAddress,
    userAddress: EthereumAddress,
  ): EncryptedValue {
    return new EncryptedValue(
      EncryptionType.ADDRESS,
      EncryptedValue.normalizeHex(handle),
      EncryptedValue.normalizeHex(proof),
      contractAddress,
      userAddress,
    );
  }

  static createBool(
    handle: string,
    proof: string,
    contractAddress: EthereumAddress,
    userAddress: EthereumAddress,
  ): EncryptedValue {
    return new EncryptedValue(
      EncryptionType.BOOL,
      EncryptedValue.normalizeHex(handle),
      EncryptedValue.normalizeHex(proof),
      contractAddress,
      userAddress,
    );
  }

  isForContract(address: EthereumAddress): boolean {
    return this.contractAddress.equals(address);
  }

  isForUser(address: EthereumAddress): boolean {
    return this.userAddress.equals(address);
  }

  toJSON(): EncryptedValueJson {
    return {
      type: this.type.toString(),
      handle: this.handle,
      proof: this.proof,
      contractAddress: this.contractAddress.toString(),
      userAddress: this.userAddress.toString(),
    };
  }

  private static normalizeHex(hex: string): string {
    const normalized = hex.toLowerCase();
    return normalized.startsWith('0x') ? normalized : `0x${normalized}`;
  }
}
