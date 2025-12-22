import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString, IsNotEmpty, Matches } from 'class-validator';

export class EncryptBoolRequestDto {
  @ApiProperty({
    description: 'Boolean value to encrypt',
    example: true,
  })
  @IsBoolean()
  value!: boolean;

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
