import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';
import { IsEthereumAddress } from './encrypt-request.dto';

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
