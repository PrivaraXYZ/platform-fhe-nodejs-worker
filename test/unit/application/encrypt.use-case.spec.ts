import { Test, TestingModule } from '@nestjs/testing';
import { EncryptUseCase } from '@application/use-case/encrypt.use-case';
import { EncryptionTypeDto } from '@application/dto/encrypt-request.dto';
import {
  IFheService,
  FHE_SERVICE,
  EncryptionResult,
} from '@domain/fhe/service/fhe.service.interface';
import { EncryptedValue } from '@domain/fhe/value-object/encrypted-value';
import { EthereumAddress } from '@domain/fhe/value-object/ethereum-address';
import { FhevmNotInitializedError } from '@domain/fhe/error/fhe.error';

describe('EncryptUseCase', () => {
  let useCase: EncryptUseCase;
  let fheService: jest.Mocked<IFheService>;

  const contractAddress = '0x1234567890123456789012345678901234567890';
  const userAddress = '0xabcdef0123456789abcdef0123456789abcdef01';

  beforeEach(async () => {
    const mockFheService: Partial<jest.Mocked<IFheService>> = {
      encryptUint64: jest.fn(),
      encryptAddress: jest.fn(),
      encryptBool: jest.fn(),
      isInitialized: jest.fn().mockReturnValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [EncryptUseCase, { provide: FHE_SERVICE, useValue: mockFheService }],
    }).compile();

    useCase = module.get<EncryptUseCase>(EncryptUseCase);
    fheService = module.get(FHE_SERVICE);
  });

  const createMockResult = (type: 'uint64' | 'address' | 'bool'): EncryptionResult => {
    const contractAddr = EthereumAddress.createContract(contractAddress);
    const userAddr = EthereumAddress.createUser(userAddress);

    if (!contractAddr.ok || !userAddr.ok) throw new Error('Failed to create addresses');

    const encryptedValue =
      type === 'uint64'
        ? EncryptedValue.createUint64('0xhandle', '0xproof', contractAddr.value, userAddr.value)
        : type === 'address'
          ? EncryptedValue.createAddress('0xhandle', '0xproof', contractAddr.value, userAddr.value)
          : EncryptedValue.createBool('0xhandle', '0xproof', contractAddr.value, userAddr.value);

    return { encryptedValue, encryptionTimeMs: 1000 };
  };

  describe('execute with uint64', () => {
    it('should encrypt uint64 value successfully', async () => {
      const mockResult = createMockResult('uint64');
      fheService.encryptUint64.mockResolvedValue({ ok: true, value: mockResult });

      const result = await useCase.execute({
        type: EncryptionTypeDto.UINT64,
        value: '1000000',
        contractAddress,
        userAddress,
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.type).toBe(EncryptionTypeDto.UINT64);
        expect(result.value.handle).toBe('0xhandle');
        expect(result.value.proof).toBe('0xproof');
        expect(result.value.encryptionTimeMs).toBe(1000);
      }

      expect(fheService.encryptUint64).toHaveBeenCalledWith(
        BigInt('1000000'),
        contractAddress,
        userAddress,
      );
    });
  });

  describe('execute with address', () => {
    it('should encrypt address value successfully', async () => {
      const mockResult = createMockResult('address');
      fheService.encryptAddress.mockResolvedValue({ ok: true, value: mockResult });

      const result = await useCase.execute({
        type: EncryptionTypeDto.ADDRESS,
        value: userAddress,
        contractAddress,
        userAddress,
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.type).toBe(EncryptionTypeDto.ADDRESS);
      }

      expect(fheService.encryptAddress).toHaveBeenCalledWith(
        userAddress,
        contractAddress,
        userAddress,
      );
    });
  });

  describe('execute with bool', () => {
    it('should encrypt bool value successfully', async () => {
      const mockResult = createMockResult('bool');
      fheService.encryptBool.mockResolvedValue({ ok: true, value: mockResult });

      const result = await useCase.execute({
        type: EncryptionTypeDto.BOOL,
        value: true,
        contractAddress,
        userAddress,
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.type).toBe(EncryptionTypeDto.BOOL);
      }

      expect(fheService.encryptBool).toHaveBeenCalledWith(true, contractAddress, userAddress);
    });
  });

  describe('error handling', () => {
    it('should return error when service fails', async () => {
      const error = new FhevmNotInitializedError();
      fheService.encryptUint64.mockResolvedValue({ ok: false, error });

      const result = await useCase.execute({
        type: EncryptionTypeDto.UINT64,
        value: '1000',
        contractAddress,
        userAddress,
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBe(error);
      }
    });
  });
});
