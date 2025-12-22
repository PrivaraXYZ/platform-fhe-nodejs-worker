import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiExtraModels,
} from '@nestjs/swagger';
import {
  EncryptRequestDto,
  EncryptUint64RequestDto,
  EncryptAddressRequestDto,
  EncryptBoolRequestDto,
  EncryptedValueResponseDto,
  EncryptionTypeDto,
} from '@application/dto';
import { EncryptUseCase } from '@application/use-case';

@ApiTags('Encrypt')
@ApiExtraModels(EncryptedValueResponseDto)
@Controller('api/v1/encrypt')
export class EncryptController {
  constructor(private readonly encryptUseCase: EncryptUseCase) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Encrypt a value (generic endpoint)',
    description: 'Encrypts a value of any supported type (euint64, eaddress, ebool)',
  })
  @ApiBody({ type: EncryptRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Value encrypted successfully',
    type: EncryptedValueResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 422, description: 'Invalid address or value' })
  @ApiResponse({ status: 500, description: 'Encryption failed' })
  @ApiResponse({ status: 503, description: 'Service not ready' })
  @ApiResponse({ status: 504, description: 'Encryption timeout' })
  async encrypt(@Body() dto: EncryptRequestDto): Promise<EncryptedValueResponseDto> {
    const result = await this.encryptUseCase.execute({
      type: dto.type,
      value: dto.value,
      contractAddress: dto.contractAddress,
      userAddress: dto.userAddress,
    });

    if (!result.ok) throw result.error;

    return result.value as EncryptedValueResponseDto;
  }

  @Post('uint64')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Encrypt a uint64 value',
    description: 'Shortcut endpoint for encrypting uint64 values',
  })
  @ApiBody({ type: EncryptUint64RequestDto })
  @ApiResponse({
    status: 200,
    description: 'Value encrypted successfully',
    type: EncryptedValueResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 422, description: 'Invalid address or value' })
  @ApiResponse({ status: 500, description: 'Encryption failed' })
  @ApiResponse({ status: 503, description: 'Service not ready' })
  @ApiResponse({ status: 504, description: 'Encryption timeout' })
  async encryptUint64(
    @Body() dto: EncryptUint64RequestDto,
  ): Promise<EncryptedValueResponseDto> {
    const result = await this.encryptUseCase.execute({
      type: EncryptionTypeDto.UINT64,
      value: dto.value,
      contractAddress: dto.contractAddress,
      userAddress: dto.userAddress,
    });

    if (!result.ok) throw result.error;

    return result.value as EncryptedValueResponseDto;
  }

  @Post('address')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Encrypt an address value',
    description: 'Shortcut endpoint for encrypting Ethereum addresses',
  })
  @ApiBody({ type: EncryptAddressRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Value encrypted successfully',
    type: EncryptedValueResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 422, description: 'Invalid address or value' })
  @ApiResponse({ status: 500, description: 'Encryption failed' })
  @ApiResponse({ status: 503, description: 'Service not ready' })
  @ApiResponse({ status: 504, description: 'Encryption timeout' })
  async encryptAddress(
    @Body() dto: EncryptAddressRequestDto,
  ): Promise<EncryptedValueResponseDto> {
    const result = await this.encryptUseCase.execute({
      type: EncryptionTypeDto.ADDRESS,
      value: dto.value,
      contractAddress: dto.contractAddress,
      userAddress: dto.userAddress,
    });

    if (!result.ok) throw result.error;

    return result.value as EncryptedValueResponseDto;
  }

  @Post('bool')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Encrypt a boolean value',
    description: 'Shortcut endpoint for encrypting boolean values',
  })
  @ApiBody({ type: EncryptBoolRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Value encrypted successfully',
    type: EncryptedValueResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 422, description: 'Invalid address or value' })
  @ApiResponse({ status: 500, description: 'Encryption failed' })
  @ApiResponse({ status: 503, description: 'Service not ready' })
  @ApiResponse({ status: 504, description: 'Encryption timeout' })
  async encryptBool(
    @Body() dto: EncryptBoolRequestDto,
  ): Promise<EncryptedValueResponseDto> {
    const result = await this.encryptUseCase.execute({
      type: EncryptionTypeDto.BOOL,
      value: dto.value,
      contractAddress: dto.contractAddress,
      userAddress: dto.userAddress,
    });

    if (!result.ok) throw result.error;

    return result.value as EncryptedValueResponseDto;
  }
}
