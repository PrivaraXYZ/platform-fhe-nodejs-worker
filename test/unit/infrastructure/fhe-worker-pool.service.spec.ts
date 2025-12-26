import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { FheWorkerPoolService } from '@infrastructure/fhe/fhe-worker-pool.service';
import { FhevmNotInitializedError } from '@domain/fhe/error/fhe.error';

const mockRun = jest.fn().mockResolvedValue({
  handle: '0xhandle',
  proof: '0xproof',
  encryptionTimeMs: 1000,
});
const mockDestroy = jest.fn().mockResolvedValue(undefined);

jest.mock('piscina', () => ({
  Piscina: jest.fn().mockImplementation(() => ({
    run: mockRun,
    destroy: mockDestroy,
  })),
}));

describe('FheWorkerPoolService', () => {
  let service: FheWorkerPoolService;

  const validContractAddress = '0x1234567890123456789012345678901234567890';
  const validUserAddress = '0xabcdef0123456789abcdef0123456789abcdef01';

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn((key: string) => {
        const configs: Record<string, unknown> = {
          fhe: {
            network: {
              chainId: 11155111,
              networkName: 'Ethereum Sepolia',
              networkUrl: 'https://eth-sepolia.public.blastapi.io',
              gatewayUrl: 'https://relayer.testnet.zama.org',
              aclAddress: '0xf0Ffdc93b7E186bC2f8CB3dAA75D86d1930A433D',
              kmsAddress: '0xbE0E383937d564D7FF0BC3b46c51f0bF8d5C311A',
            },
          },
          worker: {
            minThreads: 2,
            maxThreads: 4,
            idleTimeout: 60000,
            maxQueue: 100,
            taskTimeout: 45000,
          },
        };
        return configs[key];
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [FheWorkerPoolService, { provide: ConfigService, useValue: mockConfigService }],
    }).compile();

    service = module.get<FheWorkerPoolService>(FheWorkerPoolService);
  });

  describe('isInitialized', () => {
    it('should return false before initialization', () => {
      expect(service.isInitialized()).toBe(false);
    });

    it('should return true after initialization', async () => {
      await service.initialize();

      expect(service.isInitialized()).toBe(true);
    });
  });

  describe('getConfig', () => {
    it('should return FHE config', () => {
      const config = service.getConfig();

      expect(config.network.chainId).toBe(11155111);
      expect(config.network.networkName).toBe('Ethereum Sepolia');
    });
  });

  describe('encryptUint64', () => {
    it('should return error when not initialized', async () => {
      const result = await service.encryptUint64(1000n, validContractAddress, validUserAddress);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(FhevmNotInitializedError);
      }
    });

    it('should encrypt uint64 when initialized', async () => {
      await service.initialize();

      const result = await service.encryptUint64(1000n, validContractAddress, validUserAddress);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.encryptedValue.handle).toBe('0xhandle');
        expect(result.value.encryptedValue.proof).toBe('0xproof');
        expect(result.value.encryptionTimeMs).toBe(1000);
      }
    });

    it('should return error for invalid contract address', async () => {
      await service.initialize();

      const result = await service.encryptUint64(1000n, 'invalid', validUserAddress);

      expect(result.ok).toBe(false);
    });

    it('should return error for invalid user address', async () => {
      await service.initialize();

      const result = await service.encryptUint64(1000n, validContractAddress, 'invalid');

      expect(result.ok).toBe(false);
    });
  });

  describe('encryptAddress', () => {
    it('should encrypt address when initialized', async () => {
      await service.initialize();

      const result = await service.encryptAddress(
        validUserAddress,
        validContractAddress,
        validUserAddress,
      );

      expect(result.ok).toBe(true);
    });
  });

  describe('encryptBool', () => {
    it('should encrypt bool when initialized', async () => {
      await service.initialize();

      const result = await service.encryptBool(true, validContractAddress, validUserAddress);

      expect(result.ok).toBe(true);
    });
  });

  describe('onModuleDestroy', () => {
    it('should destroy pool on module destroy', async () => {
      await service.initialize();
      await service.onModuleDestroy();

      expect(service.isInitialized()).toBe(false);
    });
  });
});
