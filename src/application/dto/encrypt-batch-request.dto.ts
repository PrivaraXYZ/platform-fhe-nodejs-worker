import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  Matches,
  IsEnum,
  IsBoolean,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  ArrayMaxSize,
  ValidateIf,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EncryptionTypeDto } from './encrypt-request.dto';

/**
 * Single item in a batch encryption request.
 *
 * Can include per-item addresses or inherit from batch level.
 */
export class BatchItemDto {
  @ApiProperty({
    description: 'Type of value to encrypt',
    enum: EncryptionTypeDto,
    enumName: 'EncryptionType',
    example: 'euint64',
  })
  @IsEnum(EncryptionTypeDto)
  type!: EncryptionTypeDto;

  @ApiProperty({
    description: 'Value to encrypt. String for uint64/address, boolean for bool.',
    oneOf: [{ type: 'string' }, { type: 'boolean' }],
    examples: ['1000000', '0xabcdef...', true],
  })
  @ValidateIf((o) => o.type !== EncryptionTypeDto.BOOL)
  @IsString()
  @IsNotEmpty()
  @ValidateIf((o) => o.type === EncryptionTypeDto.BOOL)
  @IsBoolean()
  value!: string | boolean;

  @ApiPropertyOptional({
    description:
      'Contract address for this item. Required if not provided at batch level. Must not be set if batch-level address exists.',
    example: '0xaBaC0e90FeBC5973D943D36351b9CE04A47bdB41',
    pattern: '^0x[a-fA-F0-9]{40}$',
  })
  @IsOptional()
  @IsString()
  @Matches(/^0x[a-fA-F0-9]{40}$/, { message: 'Invalid Ethereum address format' })
  contractAddress?: string;

  @ApiPropertyOptional({
    description:
      'User address for this item. Required if not provided at batch level. Must not be set if batch-level address exists.',
    example: '0x1234567890123456789012345678901234567890',
    pattern: '^0x[a-fA-F0-9]{40}$',
  })
  @IsOptional()
  @IsString()
  @Matches(/^0x[a-fA-F0-9]{40}$/, { message: 'Invalid Ethereum address format' })
  userAddress?: string;
}

/**
 * Request to encrypt multiple values in a single batch operation.
 *
 * Supports two modes:
 * - **Shared Context:** Provide addresses at batch level, items inherit them
 * - **Per-Item Context:** Omit batch addresses, provide them for each item
 *
 * Mixing modes is not allowed — use one or the other.
 */
export class EncryptBatchRequestDto {
  @ApiPropertyOptional({
    description:
      'Shared contract address for all items. If set, userAddress must also be set. Items must not have their own addresses.',
    example: '0xaBaC0e90FeBC5973D943D36351b9CE04A47bdB41',
    pattern: '^0x[a-fA-F0-9]{40}$',
  })
  @IsOptional()
  @IsString()
  @Matches(/^0x[a-fA-F0-9]{40}$/, { message: 'Invalid Ethereum address format' })
  contractAddress?: string;

  @ApiPropertyOptional({
    description:
      'Shared user address for all items. If set, contractAddress must also be set. Items must not have their own addresses.',
    example: '0x1234567890123456789012345678901234567890',
    pattern: '^0x[a-fA-F0-9]{40}$',
  })
  @IsOptional()
  @IsString()
  @Matches(/^0x[a-fA-F0-9]{40}$/, { message: 'Invalid Ethereum address format' })
  userAddress?: string;

  @ApiProperty({
    description:
      'Array of items to encrypt. Maximum 10 items per batch. All items must have consistent address handling.',
    type: [BatchItemDto],
    minItems: 1,
    maxItems: 10,
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => BatchItemDto)
  items!: BatchItemDto[];
}
