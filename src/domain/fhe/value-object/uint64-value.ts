import { Result, Ok, Err } from '@domain/common';
import { InvalidEncryptionValueError } from '../error';

const MAX_UINT64 = BigInt('18446744073709551615');

export class Uint64Value {
  private constructor(private readonly value: bigint) {}

  static create(value: string | bigint): Result<Uint64Value, InvalidEncryptionValueError> {
    try {
      const bigValue = typeof value === 'string' ? BigInt(value) : value;

      if (bigValue < 0n) {
        return Err(new InvalidEncryptionValueError(value, 'Value must be non-negative'));
      }

      if (bigValue > MAX_UINT64) {
        return Err(new InvalidEncryptionValueError(value, `Value exceeds maximum uint64 (${MAX_UINT64})`));
      }

      return Ok(new Uint64Value(bigValue));
    } catch {
      return Err(new InvalidEncryptionValueError(value, 'Invalid numeric value'));
    }
  }

  toBigInt(): bigint {
    return this.value;
  }

  toString(): string {
    return this.value.toString();
  }

  equals(other: Uint64Value): boolean {
    return this.value === other.value;
  }
}
