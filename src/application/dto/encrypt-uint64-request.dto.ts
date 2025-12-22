import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class EncryptUint64RequestDto {
  @ApiProperty({
    description: 'Uint64 value to encrypt (as string to handle large numbers)',
    example: '1000000',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d+$/, { message: 'Value must be a valid uint64 string' })
  value!: string;

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
