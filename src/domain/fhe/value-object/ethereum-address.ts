import { Result, Ok, Err } from '@domain/common';
import { InvalidContractAddressError, InvalidUserAddressError } from '../error';

const ETH_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

export class EthereumAddress {
  private constructor(private readonly value: string) {}

  static create(
    address: string,
    type: 'contract' | 'user' = 'user',
  ): Result<EthereumAddress, InvalidContractAddressError | InvalidUserAddressError> {
    if (!ETH_ADDRESS_REGEX.test(address)) {
      return type === 'contract'
        ? Err(new InvalidContractAddressError(address))
        : Err(new InvalidUserAddressError(address));
    }
    return Ok(new EthereumAddress(address.toLowerCase()));
  }

  static createContract(
    address: string,
  ): Result<EthereumAddress, InvalidContractAddressError> {
    if (!ETH_ADDRESS_REGEX.test(address)) {
      return Err(new InvalidContractAddressError(address));
    }
    return Ok(new EthereumAddress(address.toLowerCase()));
  }

  static createUser(address: string): Result<EthereumAddress, InvalidUserAddressError> {
    if (!ETH_ADDRESS_REGEX.test(address)) {
      return Err(new InvalidUserAddressError(address));
    }
    return Ok(new EthereumAddress(address.toLowerCase()));
  }

  equals(other: EthereumAddress): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
