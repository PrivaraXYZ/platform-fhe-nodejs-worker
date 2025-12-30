import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsEnum,
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export const ETHEREUM_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

export function IsEthereumAddress(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isEthereumAddress',
      target: object.constructor,
      propertyName: propertyName,
      options: {
        message: `${propertyName} must be a valid Ethereum address`,
        ...validationOptions,
      },
      validator: {
        validate(value: unknown) {
          return typeof value === 'string' && ETHEREUM_ADDRESS_REGEX.test(value);
        },
      },
    });
  };
}

export function IsValidEncryptValue(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidEncryptValue',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const obj = args.object as { type?: EncryptionTypeDto };
          if (obj.type === EncryptionTypeDto.BOOL) {
            return typeof value === 'boolean';
          }
          return typeof value === 'string' && value.length > 0;
        },
        defaultMessage(args: ValidationArguments) {
          const obj = args.object as { type?: EncryptionTypeDto };
          if (obj.type === EncryptionTypeDto.BOOL) {
            return 'value must be a boolean when type is ebool';
          }
          return 'value must be a non-empty string when type is euint64 or eaddress';
        },
      },
    });
  };
}

export enum EncryptionTypeDto {
  UINT64 = 'euint64',
  ADDRESS = 'eaddress',
  BOOL = 'ebool',
}

export class EncryptRequestDto {
  @ApiProperty({
    description: 'Type of value to encrypt',
    enum: EncryptionTypeDto,
    example: EncryptionTypeDto.UINT64,
  })
  @IsEnum(EncryptionTypeDto)
  type!: EncryptionTypeDto;

  @ApiProperty({
    description: 'Value to encrypt (string for uint64/address, boolean for bool)',
    oneOf: [{ type: 'string' }, { type: 'boolean' }],
    examples: {
      uint64: { value: '1000000', summary: 'uint64 value as string' },
      address: { value: '0x1234567890123456789012345678901234567890', summary: 'Ethereum address' },
      bool: { value: true, summary: 'Boolean value' },
    },
  })
  @IsValidEncryptValue()
  value!: string | boolean;

  @ApiProperty({
    description: 'Contract address for encryption context',
    example: '0xaBaC0e90FeBC5973D943D36351b9CE04A47bdB41',
  })
  @IsNotEmpty()
  @IsEthereumAddress()
  contractAddress!: string;

  @ApiProperty({
    description: 'User address for encryption context',
    example: '0x1234567890123456789012345678901234567890',
  })
  @IsNotEmpty()
  @IsEthereumAddress()
  userAddress!: string;
}
