import { ApiProperty } from '@nestjs/swagger';
import { EncryptionTypeDto } from './encrypt-request.dto';

export class EncryptedValueResponseDto {
  @ApiProperty({
    description: 'Type of encrypted value',
    enum: EncryptionTypeDto,
    example: EncryptionTypeDto.UINT64,
  })
  type!: EncryptionTypeDto;

  @ApiProperty({
    description: 'Encrypted handle (hex string)',
    example: '0x1234567890abcdef...',
  })
  handle!: string;

  @ApiProperty({
    description: 'Encryption proof (hex string)',
    example: '0xabcdef1234567890...',
  })
  proof!: string;

  @ApiProperty({
    description: 'Contract address used for encryption',
    example: '0xaBaC0e90FeBC5973D943D36351b9CE04A47bdB41',
  })
  contractAddress!: string;

  @ApiProperty({
    description: 'User address used for encryption',
    example: '0x1234567890123456789012345678901234567890',
  })
  userAddress!: string;

  @ApiProperty({
    description: 'Time taken for encryption in milliseconds',
    example: 2350,
  })
  encryptionTimeMs!: number;
}
