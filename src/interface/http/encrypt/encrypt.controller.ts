import { Controller, Post, Body, HttpCode, HttpStatus, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiExtraModels } from '@nestjs/swagger';
import { EncryptRequestDto, EncryptionTypeDto } from '@application/dto/encrypt-request.dto';
import { EncryptUint64RequestDto } from '@application/dto/encrypt-uint64-request.dto';
import { EncryptAddressRequestDto } from '@application/dto/encrypt-address-request.dto';
import { EncryptBoolRequestDto } from '@application/dto/encrypt-bool-request.dto';
import { EncryptedValueResponseDto } from '@application/dto/encrypted-value-response.dto';
import { EncryptBatchRequestDto } from '@application/dto/encrypt-batch-request.dto';
import { EncryptBatchResponseDto } from '@application/dto/encrypt-batch-response.dto';
import { ErrorResponseDto } from '@application/dto/error-response.dto';
import { EncryptUseCase } from '@application/use-case/encrypt.use-case';
import { BatchEncryptUseCase } from '@application/use-case/encrypt-batch.use-case';
import { BatchValidationError } from '@domain/fhe/error/fhe.error';

@ApiTags('Encrypt')
@ApiExtraModels(EncryptedValueResponseDto, EncryptBatchResponseDto, ErrorResponseDto)
@Controller('api/v1/encrypt')
export class EncryptController {
  constructor(
    private readonly encryptUseCase: EncryptUseCase,
    private readonly batchEncryptUseCase: BatchEncryptUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Encrypt a value (generic endpoint)',
    description: `Universal encryption endpoint supporting all types.

Use this when you need to dynamically choose the encryption type at runtime.
For better type safety, prefer the typed endpoints: \`/uint64\`, \`/address\`, \`/bool\`.`,
  })
  @ApiBody({
    type: EncryptRequestDto,
    examples: {
      uint64: {
        summary: 'Encrypt uint64',
        value: {
          type: 'euint64',
          value: '1000000',
          contractAddress: '0xaBaC0e90FeBC5973D943D36351b9CE04A47bdB41',
          userAddress: '0x1234567890123456789012345678901234567890',
        },
      },
      address: {
        summary: 'Encrypt address',
        value: {
          type: 'eaddress',
          value: '0xabcdef0123456789abcdef0123456789abcdef01',
          contractAddress: '0xaBaC0e90FeBC5973D943D36351b9CE04A47bdB41',
          userAddress: '0x1234567890123456789012345678901234567890',
        },
      },
      bool: {
        summary: 'Encrypt boolean',
        value: {
          type: 'ebool',
          value: true,
          contractAddress: '0xaBaC0e90FeBC5973D943D36351b9CE04A47bdB41',
          userAddress: '0x1234567890123456789012345678901234567890',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Value encrypted successfully',
    type: EncryptedValueResponseDto,
    content: {
      'application/json': {
        example: {
          type: 'euint64',
          handle: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          proof: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
          contractAddress: '0xaBaC0e90FeBC5973D943D36351b9CE04A47bdB41',
          userAddress: '0x1234567890123456789012345678901234567890',
          encryptionTimeMs: 2350,
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error', type: ErrorResponseDto })
  @ApiResponse({ status: 422, description: 'Invalid address or value', type: ErrorResponseDto })
  @ApiResponse({ status: 500, description: 'Encryption failed', type: ErrorResponseDto })
  @ApiResponse({ status: 503, description: 'Service not ready', type: ErrorResponseDto })
  @ApiResponse({ status: 504, description: 'Encryption timeout', type: ErrorResponseDto })
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
    description: `Encrypts a 64-bit unsigned integer for use in FHE smart contracts.

**Value Range:** 0 to 18,446,744,073,709,551,615

**Use Cases:**
- Token amounts and balances
- Timestamps and durations
- Numeric identifiers
- Counters and indexes`,
  })
  @ApiBody({
    type: EncryptUint64RequestDto,
    examples: {
      'token-amount': {
        summary: 'Token Amount',
        description: 'Encrypt 1 USDC (6 decimals)',
        value: {
          value: '1000000',
          contractAddress: '0xaBaC0e90FeBC5973D943D36351b9CE04A47bdB41',
          userAddress: '0x1234567890123456789012345678901234567890',
        },
      },
      'small-value': {
        summary: 'Small Value',
        value: {
          value: '42',
          contractAddress: '0xaBaC0e90FeBC5973D943D36351b9CE04A47bdB41',
          userAddress: '0x1234567890123456789012345678901234567890',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Value encrypted successfully',
    type: EncryptedValueResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error', type: ErrorResponseDto })
  @ApiResponse({ status: 422, description: 'Invalid address or value', type: ErrorResponseDto })
  @ApiResponse({ status: 500, description: 'Encryption failed', type: ErrorResponseDto })
  @ApiResponse({ status: 503, description: 'Service not ready', type: ErrorResponseDto })
  @ApiResponse({ status: 504, description: 'Encryption timeout', type: ErrorResponseDto })
  async encryptUint64(@Body() dto: EncryptUint64RequestDto): Promise<EncryptedValueResponseDto> {
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
    summary: 'Encrypt an Ethereum address',
    description: `Encrypts an Ethereum address for use in FHE smart contracts.

**Format:** \`0x\` followed by 40 hexadecimal characters

**Use Cases:**
- Private recipient addresses in transfers
- Hidden counterparty information
- Confidential wallet references
- Anonymous voting targets`,
  })
  @ApiBody({
    type: EncryptAddressRequestDto,
    examples: {
      recipient: {
        summary: 'Recipient Address',
        description: 'Encrypt a transfer recipient',
        value: {
          value: '0xabcdef0123456789abcdef0123456789abcdef01',
          contractAddress: '0xaBaC0e90FeBC5973D943D36351b9CE04A47bdB41',
          userAddress: '0x1234567890123456789012345678901234567890',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Value encrypted successfully',
    type: EncryptedValueResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error', type: ErrorResponseDto })
  @ApiResponse({ status: 422, description: 'Invalid address or value', type: ErrorResponseDto })
  @ApiResponse({ status: 500, description: 'Encryption failed', type: ErrorResponseDto })
  @ApiResponse({ status: 503, description: 'Service not ready', type: ErrorResponseDto })
  @ApiResponse({ status: 504, description: 'Encryption timeout', type: ErrorResponseDto })
  async encryptAddress(@Body() dto: EncryptAddressRequestDto): Promise<EncryptedValueResponseDto> {
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
    description: `Encrypts a boolean value for use in FHE smart contracts.

**Values:** \`true\` or \`false\`

**Use Cases:**
- Private voting (yes/no)
- Confidential flags and toggles
- Hidden approval states
- Secret binary choices`,
  })
  @ApiBody({
    type: EncryptBoolRequestDto,
    examples: {
      'vote-yes': {
        summary: 'Vote Yes',
        description: 'Encrypt a positive vote',
        value: {
          value: true,
          contractAddress: '0xaBaC0e90FeBC5973D943D36351b9CE04A47bdB41',
          userAddress: '0x1234567890123456789012345678901234567890',
        },
      },
      'vote-no': {
        summary: 'Vote No',
        description: 'Encrypt a negative vote',
        value: {
          value: false,
          contractAddress: '0xaBaC0e90FeBC5973D943D36351b9CE04A47bdB41',
          userAddress: '0x1234567890123456789012345678901234567890',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Value encrypted successfully',
    type: EncryptedValueResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error', type: ErrorResponseDto })
  @ApiResponse({ status: 422, description: 'Invalid address or value', type: ErrorResponseDto })
  @ApiResponse({ status: 500, description: 'Encryption failed', type: ErrorResponseDto })
  @ApiResponse({ status: 503, description: 'Service not ready', type: ErrorResponseDto })
  @ApiResponse({ status: 504, description: 'Encryption timeout', type: ErrorResponseDto })
  async encryptBool(@Body() dto: EncryptBoolRequestDto): Promise<EncryptedValueResponseDto> {
    const result = await this.encryptUseCase.execute({
      type: EncryptionTypeDto.BOOL,
      value: dto.value,
      contractAddress: dto.contractAddress,
      userAddress: dto.userAddress,
    });

    if (!result.ok) throw result.error;

    return result.value as EncryptedValueResponseDto;
  }

  @Post('batch')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Encrypt multiple values in batch',
    description: `Encrypts multiple values in a single request. Supports two modes:

**Shared Context Mode:** Provide \`contractAddress\` and \`userAddress\` at the batch level — all items inherit these addresses.

**Per-Item Context Mode:** Omit batch-level addresses and provide them individually for each item.

> **Note:** All-or-nothing semantics — if any item fails, the entire batch fails.`,
  })
  @ApiBody({
    type: EncryptBatchRequestDto,
    examples: {
      'shared-context': {
        summary: 'Shared Context',
        description: 'All items use the same contract and user addresses',
        value: {
          contractAddress: '0xaBaC0e90FeBC5973D943D36351b9CE04A47bdB41',
          userAddress: '0x1234567890123456789012345678901234567890',
          items: [
            { type: 'euint64', value: '1000000' },
            { type: 'ebool', value: true },
            { type: 'eaddress', value: '0xabcdef0123456789abcdef0123456789abcdef01' },
          ],
        },
      },
      'per-item-context': {
        summary: 'Per-Item Context',
        description: 'Each item specifies its own contract and user addresses',
        value: {
          items: [
            {
              type: 'euint64',
              value: '500',
              contractAddress: '0xaBaC0e90FeBC5973D943D36351b9CE04A47bdB41',
              userAddress: '0x1234567890123456789012345678901234567890',
            },
            {
              type: 'ebool',
              value: false,
              contractAddress: '0x9999999999999999999999999999999999999999',
              userAddress: '0x8888888888888888888888888888888888888888',
            },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'All values encrypted successfully',
    type: EncryptBatchResponseDto,
    content: {
      'application/json': {
        example: {
          results: [
            {
              type: 'euint64',
              handle: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
              proof: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
              contractAddress: '0xaBaC0e90FeBC5973D943D36351b9CE04A47bdB41',
              userAddress: '0x1234567890123456789012345678901234567890',
              encryptionTimeMs: 2350,
            },
            {
              type: 'ebool',
              handle: '0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321',
              proof: '0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0',
              contractAddress: '0xaBaC0e90FeBC5973D943D36351b9CE04A47bdB41',
              userAddress: '0x1234567890123456789012345678901234567890',
              encryptionTimeMs: 1850,
            },
          ],
          totalEncryptionTimeMs: 4200,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
    type: ErrorResponseDto,
    content: {
      'application/json': {
        example: {
          type: 'urn:fhe:error:validation',
          title: 'Validation Failed',
          status: 400,
          detail: 'Request validation failed',
          instance: '/api/v1/encrypt/batch',
          invalidParams: [
            {
              name: 'Both',
              reason:
                'Both contractAddress and userAddress must be provided together at batch level',
            },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 422,
    description: 'Invalid address or value',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Encryption failed',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 503,
    description: 'Service not ready (FHEVM not initialized)',
    type: ErrorResponseDto,
    content: {
      'application/json': {
        example: {
          type: 'urn:fhe:error:not-initialized',
          title: 'Service Not Ready',
          status: 503,
          detail: 'FHEVM not initialized. Service is not ready.',
          instance: '/api/v1/encrypt/batch',
        },
      },
    },
  })
  @ApiResponse({
    status: 504,
    description: 'Encryption timeout',
    type: ErrorResponseDto,
  })
  async encryptBatch(@Body() dto: EncryptBatchRequestDto): Promise<EncryptBatchResponseDto> {
    const result = await this.batchEncryptUseCase.execute({
      contractAddress: dto.contractAddress,
      userAddress: dto.userAddress,
      items: dto.items.map((item) => ({
        type: item.type,
        value: item.value,
        contractAddress: item.contractAddress,
        userAddress: item.userAddress,
      })),
    });

    if (!result.ok) {
      if (result.error instanceof BatchValidationError) {
        throw new BadRequestException(result.error.message);
      }
      throw result.error;
    }

    return result.value as EncryptBatchResponseDto;
  }
}
