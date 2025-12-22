import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  Matches,
  IsEnum,
  IsOptional,
  IsBoolean,
  ValidateIf,
} from 'class-validator';

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
  @ValidateIf((o) => o.type !== EncryptionTypeDto.BOOL)
  @IsString()
  @IsNotEmpty()
  @ValidateIf((o) => o.type === EncryptionTypeDto.BOOL)
  @IsBoolean()
  value!: string | boolean;

  @ApiProperty({
    description: 'Contract address for encryption context',
    example: '0xaBaC0e90FeBC5973D943D36351b9CE04A47bdB41',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^0x[a-fA-F0-9]{40}$/, { message: 'Invalid Ethereum address format' })
  contractAddress!: string;

  @ApiProperty({
    description: 'User address for encryption context',
    example: '0x1234567890123456789012345678901234567890',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^0x[a-fA-F0-9]{40}$/, { message: 'Invalid Ethereum address format' })
  userAddress!: string;
}
