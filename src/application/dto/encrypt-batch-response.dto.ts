import { ApiProperty } from '@nestjs/swagger';
import { EncryptedValueResponseDto } from './encrypted-value-response.dto';

/**
 * Response containing multiple encrypted values from a batch operation.
 *
 * Results are returned in the same order as the input items.
 */
export class EncryptBatchResponseDto {
  @ApiProperty({
    description:
      'Array of encrypted values in the same order as input items. Each contains handle, proof, and timing.',
    type: [EncryptedValueResponseDto],
    minItems: 1,
    maxItems: 10,
  })
  results!: EncryptedValueResponseDto[];

  @ApiProperty({
    description:
      'Total wall-clock time for all encryptions in milliseconds. May differ from sum of individual times due to overhead.',
    example: 4200,
    minimum: 0,
  })
  totalEncryptionTimeMs!: number;
}
