import { Test, TestingModule } from '@nestjs/testing';
import {
  BatchEncryptUseCase,
  BatchValidationError,
} from '@application/use-case/encrypt-batch.use-case';
import { EncryptUseCase, EncryptOutput } from '@application/use-case/encrypt.use-case';
import { EncryptionTypeDto } from '@application/dto/encrypt-request.dto';
import { IFheService, FHE_SERVICE } from '@domain/fhe/service/fhe.service.interface';
import { FhevmNotInitializedError } from '@domain/fhe/error/fhe.error';

describe('BatchEncryptUseCase', () => {
  let useCase: BatchEncryptUseCase;
  let encryptUseCase: jest.Mocked<EncryptUseCase>;

  const contractAddress = '0x1234567890123456789012345678901234567890';
  const userAddress = '0xabcdef0123456789abcdef0123456789abcdef01';

  const createMockEncryptOutput = (type: EncryptionTypeDto): EncryptOutput => ({
    type,
    handle: '0xhandle',
    proof: '0xproof',
    contractAddress,
    userAddress,
    encryptionTimeMs: 1000,
  });

  beforeEach(async () => {
    const mockEncryptUseCase = {
      execute: jest.fn(),
    };

    const mockFheService: Partial<jest.Mocked<IFheService>> = {
      isInitialized: jest.fn().mockReturnValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BatchEncryptUseCase,
        { provide: EncryptUseCase, useValue: mockEncryptUseCase },
        { provide: FHE_SERVICE, useValue: mockFheService },
      ],
    }).compile();

    useCase = module.get<BatchEncryptUseCase>(BatchEncryptUseCase);
    encryptUseCase = module.get(EncryptUseCase);
  });

  describe('shared context flow', () => {
    it('should encrypt multiple items with shared context', async () => {
      encryptUseCase.execute
        .mockResolvedValueOnce({
          ok: true,
          value: createMockEncryptOutput(EncryptionTypeDto.UINT64),
        })
        .mockResolvedValueOnce({
          ok: true,
          value: createMockEncryptOutput(EncryptionTypeDto.BOOL),
        });

      const result = await useCase.execute({
        contractAddress,
        userAddress,
        items: [
          { type: EncryptionTypeDto.UINT64, value: '1000000' },
          { type: EncryptionTypeDto.BOOL, value: true },
        ],
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.results).toHaveLength(2);
        expect(result.value.results[0].type).toBe(EncryptionTypeDto.UINT64);
        expect(result.value.results[1].type).toBe(EncryptionTypeDto.BOOL);
        expect(result.value.totalEncryptionTimeMs).toBeGreaterThanOrEqual(0);
      }

      expect(encryptUseCase.execute).toHaveBeenCalledTimes(2);
      expect(encryptUseCase.execute).toHaveBeenNthCalledWith(1, {
        type: EncryptionTypeDto.UINT64,
        value: '1000000',
        contractAddress,
        userAddress,
      });
      expect(encryptUseCase.execute).toHaveBeenNthCalledWith(2, {
        type: EncryptionTypeDto.BOOL,
        value: true,
        contractAddress,
        userAddress,
      });
    });
  });

  describe('per-item context flow', () => {
    it('should encrypt items with individual contexts', async () => {
      const otherContract = '0x9999999999999999999999999999999999999999';
      const otherUser = '0x8888888888888888888888888888888888888888';

      encryptUseCase.execute
        .mockResolvedValueOnce({
          ok: true,
          value: createMockEncryptOutput(EncryptionTypeDto.UINT64),
        })
        .mockResolvedValueOnce({
          ok: true,
          value: {
            ...createMockEncryptOutput(EncryptionTypeDto.ADDRESS),
            contractAddress: otherContract,
            userAddress: otherUser,
          },
        });

      const result = await useCase.execute({
        items: [
          {
            type: EncryptionTypeDto.UINT64,
            value: '500',
            contractAddress,
            userAddress,
          },
          {
            type: EncryptionTypeDto.ADDRESS,
            value: otherUser,
            contractAddress: otherContract,
            userAddress: otherUser,
          },
        ],
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.results).toHaveLength(2);
      }

      expect(encryptUseCase.execute).toHaveBeenNthCalledWith(1, {
        type: EncryptionTypeDto.UINT64,
        value: '500',
        contractAddress,
        userAddress,
      });
      expect(encryptUseCase.execute).toHaveBeenNthCalledWith(2, {
        type: EncryptionTypeDto.ADDRESS,
        value: otherUser,
        contractAddress: otherContract,
        userAddress: otherUser,
      });
    });
  });

  describe('validation errors', () => {
    it('should return error when only contractAddress is provided at batch level', async () => {
      const result = await useCase.execute({
        contractAddress,
        items: [{ type: EncryptionTypeDto.UINT64, value: '100' }],
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(BatchValidationError);
        expect(result.error.message).toContain(
          'Both contractAddress and userAddress must be provided together at batch level',
        );
      }
    });

    it('should return error when only userAddress is provided at batch level', async () => {
      const result = await useCase.execute({
        userAddress,
        items: [{ type: EncryptionTypeDto.UINT64, value: '100' }],
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(BatchValidationError);
        expect(result.error.message).toContain(
          'Both contractAddress and userAddress must be provided together at batch level',
        );
      }
    });

    it('should return error when item has only contractAddress', async () => {
      const result = await useCase.execute({
        items: [
          {
            type: EncryptionTypeDto.UINT64,
            value: '100',
            contractAddress,
          },
        ],
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(BatchValidationError);
        expect(result.error.message).toContain('Item 0');
        expect(result.error.message).toContain(
          'Both contractAddress and userAddress must be provided together',
        );
      }
    });

    it('should return error when item has only userAddress', async () => {
      const result = await useCase.execute({
        items: [
          {
            type: EncryptionTypeDto.BOOL,
            value: true,
            userAddress,
          },
        ],
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(BatchValidationError);
        expect(result.error.message).toContain('Item 0');
      }
    });

    it('should return error when mixing shared and item-level context', async () => {
      const result = await useCase.execute({
        contractAddress,
        userAddress,
        items: [
          {
            type: EncryptionTypeDto.UINT64,
            value: '100',
            contractAddress: '0x9999999999999999999999999999999999999999',
            userAddress: '0x8888888888888888888888888888888888888888',
          },
        ],
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(BatchValidationError);
        expect(result.error.message).toContain('Item 0');
        expect(result.error.message).toContain(
          'Cannot specify addresses when batch-level addresses are provided',
        );
      }
    });

    it('should return error when item is missing context and no shared context provided', async () => {
      const result = await useCase.execute({
        items: [{ type: EncryptionTypeDto.UINT64, value: '100' }],
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(BatchValidationError);
        expect(result.error.message).toContain('Item 0');
        expect(result.error.message).toContain('Missing contractAddress and userAddress');
      }
    });

    it('should return error for second item with invalid context', async () => {
      const result = await useCase.execute({
        items: [
          {
            type: EncryptionTypeDto.UINT64,
            value: '100',
            contractAddress,
            userAddress,
          },
          {
            type: EncryptionTypeDto.BOOL,
            value: true,
            // Missing context
          },
        ],
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(BatchValidationError);
        expect(result.error.message).toContain('Item 1');
      }
    });
  });

  describe('all-or-nothing error handling', () => {
    it('should return error and stop processing when encryption fails', async () => {
      const error = new FhevmNotInitializedError();
      encryptUseCase.execute
        .mockResolvedValueOnce({
          ok: true,
          value: createMockEncryptOutput(EncryptionTypeDto.UINT64),
        })
        .mockResolvedValueOnce({ ok: false, error });

      const result = await useCase.execute({
        contractAddress,
        userAddress,
        items: [
          { type: EncryptionTypeDto.UINT64, value: '100' },
          { type: EncryptionTypeDto.BOOL, value: true },
          { type: EncryptionTypeDto.ADDRESS, value: userAddress },
        ],
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBe(error);
      }

      // Should have stopped after second item
      expect(encryptUseCase.execute).toHaveBeenCalledTimes(2);
    });

    it('should return error immediately when first item fails', async () => {
      const error = new FhevmNotInitializedError();
      encryptUseCase.execute.mockResolvedValueOnce({ ok: false, error });

      const result = await useCase.execute({
        contractAddress,
        userAddress,
        items: [
          { type: EncryptionTypeDto.UINT64, value: '100' },
          { type: EncryptionTypeDto.BOOL, value: true },
        ],
      });

      expect(result.ok).toBe(false);
      expect(encryptUseCase.execute).toHaveBeenCalledTimes(1);
    });
  });

  describe('single item batch', () => {
    it('should handle single item batch with shared context', async () => {
      encryptUseCase.execute.mockResolvedValueOnce({
        ok: true,
        value: createMockEncryptOutput(EncryptionTypeDto.UINT64),
      });

      const result = await useCase.execute({
        contractAddress,
        userAddress,
        items: [{ type: EncryptionTypeDto.UINT64, value: '42' }],
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.results).toHaveLength(1);
      }
    });
  });
});
