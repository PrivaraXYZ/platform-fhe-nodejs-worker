import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import {
  FHE_SERVICE,
  IFheService,
  EncryptionResult,
  EncryptedValue,
  EthereumAddress,
  FhevmNotInitializedError,
} from '@domain/fhe';
import { GlobalExceptionFilter } from '@interface/http/filter';

describe('Encrypt Endpoints (e2e)', () => {
  let app: INestApplication;

  const validContractAddress = '0x1234567890123456789012345678901234567890';
  const validUserAddress = '0xabcdef0123456789abcdef0123456789abcdef01';

  const createMockResult = (type: 'uint64' | 'address' | 'bool'): EncryptionResult => {
    const contractAddr = EthereumAddress.createContract(validContractAddress);
    const userAddr = EthereumAddress.createUser(validUserAddress);

    if (!contractAddr.ok || !userAddr.ok) throw new Error('Failed to create addresses');

    const encryptedValue =
      type === 'uint64'
        ? EncryptedValue.createUint64('0xhandle', '0xproof', contractAddr.value, userAddr.value)
        : type === 'address'
          ? EncryptedValue.createAddress('0xhandle', '0xproof', contractAddr.value, userAddr.value)
          : EncryptedValue.createBool('0xhandle', '0xproof', contractAddr.value, userAddr.value);

    return { encryptedValue, encryptionTimeMs: 1000 };
  };

  const mockFheService: Partial<IFheService> = {
    isInitialized: jest.fn().mockReturnValue(true),
    initialize: jest.fn().mockResolvedValue(undefined),
    getConfig: jest.fn().mockReturnValue({ network: { chainId: 11155111 } }),
    encryptUint64: jest.fn().mockResolvedValue({ ok: true, value: createMockResult('uint64') }),
    encryptAddress: jest.fn().mockResolvedValue({ ok: true, value: createMockResult('address') }),
    encryptBool: jest.fn().mockResolvedValue({ ok: true, value: createMockResult('bool') }),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(FHE_SERVICE)
      .useValue(mockFheService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    app.useGlobalFilters(new GlobalExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (mockFheService.encryptUint64 as jest.Mock).mockResolvedValue({
      ok: true,
      value: createMockResult('uint64'),
    });
    (mockFheService.encryptAddress as jest.Mock).mockResolvedValue({
      ok: true,
      value: createMockResult('address'),
    });
    (mockFheService.encryptBool as jest.Mock).mockResolvedValue({
      ok: true,
      value: createMockResult('bool'),
    });
  });

  describe('POST /api/v1/encrypt', () => {
    it('should encrypt uint64 value', () => {
      return request(app.getHttpServer())
        .post('/api/v1/encrypt')
        .send({
          type: 'euint64',
          value: '1000000',
          contractAddress: validContractAddress,
          userAddress: validUserAddress,
        })
        .expect(200)
        .expect((res: any) => {
          expect(res.body.type).toBe('euint64');
          expect(res.body.handle).toBe('0xhandle');
          expect(res.body.proof).toBe('0xproof');
          expect(res.body.encryptionTimeMs).toBe(1000);
        });
    });

    it('should encrypt address value', () => {
      return request(app.getHttpServer())
        .post('/api/v1/encrypt')
        .send({
          type: 'eaddress',
          value: validUserAddress,
          contractAddress: validContractAddress,
          userAddress: validUserAddress,
        })
        .expect(200)
        .expect((res: any) => {
          expect(res.body.type).toBe('eaddress');
        });
    });

    it('should encrypt bool value', () => {
      return request(app.getHttpServer())
        .post('/api/v1/encrypt')
        .send({
          type: 'ebool',
          value: true,
          contractAddress: validContractAddress,
          userAddress: validUserAddress,
        })
        .expect(200)
        .expect((res: any) => {
          expect(res.body.type).toBe('ebool');
        });
    });

    it('should return 400 for invalid type', () => {
      return request(app.getHttpServer())
        .post('/api/v1/encrypt')
        .send({
          type: 'invalid',
          value: '1000',
          contractAddress: validContractAddress,
          userAddress: validUserAddress,
        })
        .expect(400)
        .expect((res: any) => {
          expect(res.body.type).toBe('urn:fhe:error:validation');
        });
    });

    it('should return 400 for invalid contract address', () => {
      return request(app.getHttpServer())
        .post('/api/v1/encrypt')
        .send({
          type: 'euint64',
          value: '1000',
          contractAddress: 'invalid',
          userAddress: validUserAddress,
        })
        .expect(400);
    });
  });

  describe('POST /api/v1/encrypt/uint64', () => {
    it('should encrypt uint64 value', () => {
      return request(app.getHttpServer())
        .post('/api/v1/encrypt/uint64')
        .send({
          value: '1000000',
          contractAddress: validContractAddress,
          userAddress: validUserAddress,
        })
        .expect(200)
        .expect((res: any) => {
          expect(res.body.type).toBe('euint64');
        });
    });

    it('should return 400 for non-numeric value', () => {
      return request(app.getHttpServer())
        .post('/api/v1/encrypt/uint64')
        .send({
          value: 'abc',
          contractAddress: validContractAddress,
          userAddress: validUserAddress,
        })
        .expect(400);
    });
  });

  describe('POST /api/v1/encrypt/address', () => {
    it('should encrypt address value', () => {
      return request(app.getHttpServer())
        .post('/api/v1/encrypt/address')
        .send({
          value: validUserAddress,
          contractAddress: validContractAddress,
          userAddress: validUserAddress,
        })
        .expect(200)
        .expect((res: any) => {
          expect(res.body.type).toBe('eaddress');
        });
    });

    it('should return 400 for invalid address value', () => {
      return request(app.getHttpServer())
        .post('/api/v1/encrypt/address')
        .send({
          value: 'invalid',
          contractAddress: validContractAddress,
          userAddress: validUserAddress,
        })
        .expect(400);
    });
  });

  describe('POST /api/v1/encrypt/bool', () => {
    it('should encrypt bool value', () => {
      return request(app.getHttpServer())
        .post('/api/v1/encrypt/bool')
        .send({
          value: true,
          contractAddress: validContractAddress,
          userAddress: validUserAddress,
        })
        .expect(200)
        .expect((res: any) => {
          expect(res.body.type).toBe('ebool');
        });
    });

    it('should encrypt false value', () => {
      return request(app.getHttpServer())
        .post('/api/v1/encrypt/bool')
        .send({
          value: false,
          contractAddress: validContractAddress,
          userAddress: validUserAddress,
        })
        .expect(200);
    });
  });

  describe('Error handling', () => {
    it('should return 503 when FHE is not initialized', () => {
      const error = new FhevmNotInitializedError();
      (mockFheService.encryptUint64 as jest.Mock).mockResolvedValue({ ok: false, error });

      return request(app.getHttpServer())
        .post('/api/v1/encrypt/uint64')
        .send({
          value: '1000',
          contractAddress: validContractAddress,
          userAddress: validUserAddress,
        })
        .expect(503)
        .expect((res: any) => {
          expect(res.body.type).toBe('urn:fhe:error:not-initialized');
        });
    });
  });
});
