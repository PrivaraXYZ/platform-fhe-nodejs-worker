import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { IsEthereumAddress } from './encrypt-request.dto';

export class EncryptAddressRequestDto {
  @ApiProperty({
    description: 'Ethereum address to encrypt',
    example: '0x1234567890123456789012345678901234567890',
  })
  @IsNotEmpty()
  @IsEthereumAddress()
  value!: string;

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
