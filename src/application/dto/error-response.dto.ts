import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InvalidParamDto {
  @ApiProperty({
    description: 'Name of the invalid parameter',
    example: 'contractAddress',
  })
  name!: string;

  @ApiProperty({
    description: 'Reason why the parameter is invalid',
    example: 'Invalid Ethereum address format',
  })
  reason!: string;
}

export class ErrorResponseDto {
  @ApiProperty({
    description: 'URI reference identifying the problem type',
    example: 'urn:fhe:error:validation',
  })
  type!: string;

  @ApiProperty({
    description: 'Short, human-readable summary of the problem',
    example: 'Validation Failed',
  })
  title!: string;

  @ApiProperty({
    description: 'HTTP status code',
    example: 400,
  })
  status!: number;

  @ApiProperty({
    description: 'Human-readable explanation specific to this occurrence',
    example: 'Request validation failed',
  })
  detail!: string;

  @ApiProperty({
    description: 'URI reference identifying the specific occurrence',
    example: '/api/v1/encrypt/uint64',
  })
  instance!: string;

  @ApiPropertyOptional({
    description: 'List of invalid parameters (for validation errors)',
    type: [InvalidParamDto],
  })
  invalidParams?: InvalidParamDto[];
}
