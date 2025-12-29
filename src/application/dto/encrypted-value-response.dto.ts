import { ApiProperty } from '@nestjs/swagger';
import { EncryptionTypeDto } from './encrypt-request.dto';

/**
 * Response containing the encrypted value with handle and proof.
 *
 * The `handle` is a unique identifier for the encrypted value on-chain.
 * The `proof` is cryptographic proof required to verify the encryption.
 */
export class EncryptedValueResponseDto {
  @ApiProperty({
    description: 'Type of encrypted value',
    enum: EncryptionTypeDto,
    enumName: 'EncryptionType',
    example: 'euint64',
  })
  type!: EncryptionTypeDto;

  @ApiProperty({
    description:
      'Encrypted handle — unique identifier for the encrypted value. Use this in smart contract calls.',
    example: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    pattern: '^0x[a-fA-F0-9]+$',
  })
  handle!: string;

  @ApiProperty({
    description:
      'Encryption proof — cryptographic proof required to verify the encryption on-chain.',
    example: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    pattern: '^0x[a-fA-F0-9]+$',
  })
  proof!: string;

  @ApiProperty({
    description: 'Contract address used for encryption context',
    example: '0xaBaC0e90FeBC5973D943D36351b9CE04A47bdB41',
    pattern: '^0x[a-fA-F0-9]{40}$',
  })
  contractAddress!: string;

  @ApiProperty({
    description: 'User address used for encryption context',
    example: '0x1234567890123456789012345678901234567890',
    pattern: '^0x[a-fA-F0-9]{40}$',
  })
  userAddress!: string;

  @ApiProperty({
    description: 'Time taken for encryption in milliseconds',
    example: 2350,
    minimum: 0,
  })
  encryptionTimeMs!: number;
}
