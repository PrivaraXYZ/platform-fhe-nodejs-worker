import { Result, Ok, Err } from '@domain/common';
import { UnsupportedEncryptionTypeError } from '../error';

export enum EncryptionTypeValue {
  UINT64 = 'euint64',
  ADDRESS = 'eaddress',
  BOOL = 'ebool',
}

const SUPPORTED_TYPES = new Set(Object.values(EncryptionTypeValue));

export class EncryptionType {
  static readonly UINT64 = new EncryptionType(EncryptionTypeValue.UINT64);
  static readonly ADDRESS = new EncryptionType(EncryptionTypeValue.ADDRESS);
  static readonly BOOL = new EncryptionType(EncryptionTypeValue.BOOL);

  private constructor(private readonly value: EncryptionTypeValue) {}

  static fromString(type: string): Result<EncryptionType, UnsupportedEncryptionTypeError> {
    if (!SUPPORTED_TYPES.has(type as EncryptionTypeValue)) {
      return Err(new UnsupportedEncryptionTypeError(type));
    }
    return Ok(new EncryptionType(type as EncryptionTypeValue));
  }

  static values(): EncryptionType[] {
    return [EncryptionType.UINT64, EncryptionType.ADDRESS, EncryptionType.BOOL];
  }

  toString(): string {
    return this.value;
  }

  equals(other: EncryptionType): boolean {
    return this.value === other.value;
  }

  isUint64(): boolean {
    return this.value === EncryptionTypeValue.UINT64;
  }

  isAddress(): boolean {
    return this.value === EncryptionTypeValue.ADDRESS;
  }

  isBool(): boolean {
    return this.value === EncryptionTypeValue.BOOL;
  }
}
