import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { EncryptController } from '@interface/http/encrypt/encrypt.controller';
import { EncryptUseCase, EncryptOutput } from '@application/use-case/encrypt.use-case';
import { BatchEncryptUseCase } from '@application/use-case/encrypt-batch.use-case';
import { EncryptionTypeDto } from '@application/dto/encrypt-request.dto';
import { FhevmNotInitializedError, BatchValidationError } from '@domain/fhe/error/fhe.error';

describe('EncryptController', () => {
  let controller: EncryptController;
  let useCase: jest.Mocked<EncryptUseCase>;
  let batchUseCase: jest.Mocked<BatchEncryptUseCase>;

  const validContractAddress = '0x1234567890123456789012345678901234567890';
  const validUserAddress = '0xabcdef0123456789abcdef0123456789abcdef01';

  const mockOutput: EncryptOutput = {
    type: EncryptionTypeDto.UINT64,
    handle: '0xhandle',
    proof: '0xproof',
    contractAddress: validContractAddress,
    userAddress: validUserAddress,
    encryptionTimeMs: 1000,
  };

  beforeEach(async () => {
    const mockUseCase = {
      execute: jest.fn(),
    };

    const mockBatchUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EncryptController],
      providers: [
        { provide: EncryptUseCase, useValue: mockUseCase },
        { provide: BatchEncryptUseCase, useValue: mockBatchUseCase },
      ],
    }).compile();

    controller = module.get<EncryptController>(EncryptController);
    useCase = module.get(EncryptUseCase);
    batchUseCase = module.get(BatchEncryptUseCase);
  });

  describe('encrypt', () => {
    it('should return encrypted value for valid request', async () => {
      useCase.execute.mockResolvedValue({ ok: true, value: mockOutput });

      const result = await controller.encrypt({
        type: EncryptionTypeDto.UINT64,
        value: '1000',
        contractAddress: validContractAddress,
        userAddress: validUserAddress,
      });

      expect(result).toEqual(mockOutput);
      expect(useCase.execute).toHaveBeenCalledWith({
        type: EncryptionTypeDto.UINT64,
        value: '1000',
        contractAddress: validContractAddress,
        userAddress: validUserAddress,
      });
    });

    it('should throw error when use case fails', async () => {
      const error = new FhevmNotInitializedError();
      useCase.execute.mockResolvedValue({ ok: false, error });

      await expect(
        controller.encrypt({
          type: EncryptionTypeDto.UINT64,
          value: '1000',
          contractAddress: validContractAddress,
          userAddress: validUserAddress,
        }),
      ).rejects.toThrow(error);
    });
  });

  describe('encryptUint64', () => {
    it('should encrypt uint64 value', async () => {
      useCase.execute.mockResolvedValue({ ok: true, value: mockOutput });

      const result = await controller.encryptUint64({
        value: '1000',
        contractAddress: validContractAddress,
        userAddress: validUserAddress,
      });

      expect(result).toEqual(mockOutput);
      expect(useCase.execute).toHaveBeenCalledWith({
        type: EncryptionTypeDto.UINT64,
        value: '1000',
        contractAddress: validContractAddress,
        userAddress: validUserAddress,
      });
    });
  });

  describe('encryptAddress', () => {
    it('should encrypt address value', async () => {
      const addressOutput = { ...mockOutput, type: EncryptionTypeDto.ADDRESS };
      useCase.execute.mockResolvedValue({ ok: true, value: addressOutput });

      const result = await controller.encryptAddress({
        value: validUserAddress,
        contractAddress: validContractAddress,
        userAddress: validUserAddress,
      });

      expect(result.type).toBe(EncryptionTypeDto.ADDRESS);
      expect(useCase.execute).toHaveBeenCalledWith({
        type: EncryptionTypeDto.ADDRESS,
        value: validUserAddress,
        contractAddress: validContractAddress,
        userAddress: validUserAddress,
      });
    });
  });

  describe('encryptBool', () => {
    it('should encrypt bool value', async () => {
      const boolOutput = { ...mockOutput, type: EncryptionTypeDto.BOOL };
      useCase.execute.mockResolvedValue({ ok: true, value: boolOutput });

      const result = await controller.encryptBool({
        value: true,
        contractAddress: validContractAddress,
        userAddress: validUserAddress,
      });

      expect(result.type).toBe(EncryptionTypeDto.BOOL);
      expect(useCase.execute).toHaveBeenCalledWith({
        type: EncryptionTypeDto.BOOL,
        value: true,
        contractAddress: validContractAddress,
        userAddress: validUserAddress,
      });
    });
  });

  describe('encryptBatch', () => {
    it('should return batch results for valid request', async () => {
      const batchOutput = {
        results: [mockOutput, { ...mockOutput, type: EncryptionTypeDto.BOOL }],
        totalEncryptionTimeMs: 2000,
      };
      batchUseCase.execute.mockResolvedValue({ ok: true, value: batchOutput });

      const result = await controller.encryptBatch({
        contractAddress: validContractAddress,
        userAddress: validUserAddress,
        items: [
          { type: EncryptionTypeDto.UINT64, value: '1000' },
          { type: EncryptionTypeDto.BOOL, value: true },
        ],
      });

      expect(result.results).toHaveLength(2);
      expect(result.totalEncryptionTimeMs).toBe(2000);
    });

    it('should throw BadRequestException for BatchValidationError', async () => {
      const error = new BatchValidationError('Test validation error');
      batchUseCase.execute.mockResolvedValue({ ok: false, error });

      await expect(
        controller.encryptBatch({
          contractAddress: validContractAddress,
          items: [{ type: EncryptionTypeDto.UINT64, value: '1000' }],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw domain error when use case fails', async () => {
      const error = new FhevmNotInitializedError();
      batchUseCase.execute.mockResolvedValue({ ok: false, error });

      await expect(
        controller.encryptBatch({
          contractAddress: validContractAddress,
          userAddress: validUserAddress,
          items: [{ type: EncryptionTypeDto.UINT64, value: '1000' }],
        }),
      ).rejects.toThrow(error);
    });
  });
});
