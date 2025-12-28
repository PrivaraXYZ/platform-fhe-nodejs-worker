import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import {
  FHE_SERVICE,
  IFheService,
  EncryptionResult,
} from '@domain/fhe/service/fhe.service.interface';
import { EncryptedValue } from '@domain/fhe/value-object/encrypted-value';
import { EthereumAddress } from '@domain/fhe/value-object/ethereum-address';
import { FhevmNotInitializedError } from '@domain/fhe/error/fhe.error';
import { GlobalExceptionFilter } from '@interface/http/filter/global-exception.filter';

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

  describe('POST /api/v1/encrypt/batch', () => {
    describe('shared context flow', () => {
      it('should encrypt multiple values with shared context', () => {
        return request(app.getHttpServer())
          .post('/api/v1/encrypt/batch')
          .send({
            contractAddress: validContractAddress,
            userAddress: validUserAddress,
            items: [
              { type: 'euint64', value: '1000000' },
              { type: 'ebool', value: true },
            ],
          })
          .expect(200)
          .expect((res: any) => {
            expect(res.body.results).toHaveLength(2);
            expect(res.body.results[0].type).toBe('euint64');
            expect(res.body.results[1].type).toBe('ebool');
            expect(res.body.totalEncryptionTimeMs).toBeGreaterThanOrEqual(0);
          });
      });

      it('should encrypt all supported types', () => {
        return request(app.getHttpServer())
          .post('/api/v1/encrypt/batch')
          .send({
            contractAddress: validContractAddress,
            userAddress: validUserAddress,
            items: [
              { type: 'euint64', value: '42' },
              { type: 'eaddress', value: validUserAddress },
              { type: 'ebool', value: false },
            ],
          })
          .expect(200)
          .expect((res: any) => {
            expect(res.body.results).toHaveLength(3);
            expect(res.body.results[0].type).toBe('euint64');
            expect(res.body.results[1].type).toBe('eaddress');
            expect(res.body.results[2].type).toBe('ebool');
          });
      });
    });

    describe('per-item context flow', () => {
      it('should encrypt items with individual contexts', () => {
        const otherContract = '0x9999999999999999999999999999999999999999';
        const otherUser = '0x8888888888888888888888888888888888888888';

        return request(app.getHttpServer())
          .post('/api/v1/encrypt/batch')
          .send({
            items: [
              {
                type: 'euint64',
                value: '500',
                contractAddress: validContractAddress,
                userAddress: validUserAddress,
              },
              {
                type: 'ebool',
                value: true,
                contractAddress: otherContract,
                userAddress: otherUser,
              },
            ],
          })
          .expect(200)
          .expect((res: any) => {
            expect(res.body.results).toHaveLength(2);
          });
      });
    });

    describe('validation errors', () => {
      it('should return 400 when only contractAddress is provided at batch level', () => {
        return request(app.getHttpServer())
          .post('/api/v1/encrypt/batch')
          .send({
            contractAddress: validContractAddress,
            items: [{ type: 'euint64', value: '100' }],
          })
          .expect(400)
          .expect((res: any) => {
            expect(res.body.invalidParams[0].reason).toContain(
              'Both contractAddress and userAddress must be provided together at batch level',
            );
          });
      });

      it('should return 400 when only userAddress is provided at batch level', () => {
        return request(app.getHttpServer())
          .post('/api/v1/encrypt/batch')
          .send({
            userAddress: validUserAddress,
            items: [{ type: 'euint64', value: '100' }],
          })
          .expect(400)
          .expect((res: any) => {
            expect(res.body.invalidParams[0].reason).toContain(
              'Both contractAddress and userAddress must be provided together at batch level',
            );
          });
      });

      it('should return 400 when mixing shared and item-level context', () => {
        return request(app.getHttpServer())
          .post('/api/v1/encrypt/batch')
          .send({
            contractAddress: validContractAddress,
            userAddress: validUserAddress,
            items: [
              {
                type: 'euint64',
                value: '100',
                contractAddress: '0x9999999999999999999999999999999999999999',
                userAddress: '0x8888888888888888888888888888888888888888',
              },
            ],
          })
          .expect(400)
          .expect((res: any) => {
            expect(res.body.invalidParams[0].reason).toContain(
              'Cannot specify addresses when batch-level addresses are provided',
            );
          });
      });

      it('should return 400 when item is missing context', () => {
        return request(app.getHttpServer())
          .post('/api/v1/encrypt/batch')
          .send({
            items: [{ type: 'euint64', value: '100' }],
          })
          .expect(400)
          .expect((res: any) => {
            expect(res.body.invalidParams[0].reason).toContain(
              'Missing contractAddress and userAddress',
            );
          });
      });

      it('should return 400 for empty items array', () => {
        return request(app.getHttpServer())
          .post('/api/v1/encrypt/batch')
          .send({
            contractAddress: validContractAddress,
            userAddress: validUserAddress,
            items: [],
          })
          .expect(400);
      });

      it('should return 400 for too many items', () => {
        const items = Array.from({ length: 11 }, () => ({
          type: 'euint64',
          value: '100',
        }));

        return request(app.getHttpServer())
          .post('/api/v1/encrypt/batch')
          .send({
            contractAddress: validContractAddress,
            userAddress: validUserAddress,
            items,
          })
          .expect(400);
      });

      it('should return 400 for invalid type in item', () => {
        return request(app.getHttpServer())
          .post('/api/v1/encrypt/batch')
          .send({
            contractAddress: validContractAddress,
            userAddress: validUserAddress,
            items: [{ type: 'invalid', value: '100' }],
          })
          .expect(400);
      });

      it('should return 400 for invalid address format in item', () => {
        return request(app.getHttpServer())
          .post('/api/v1/encrypt/batch')
          .send({
            items: [
              {
                type: 'euint64',
                value: '100',
                contractAddress: 'invalid',
                userAddress: validUserAddress,
              },
            ],
          })
          .expect(400);
      });
    });

    describe('all-or-nothing error handling', () => {
      it('should return error when encryption fails for any item', () => {
        const error = new FhevmNotInitializedError();
        (mockFheService.encryptUint64 as jest.Mock)
          .mockResolvedValueOnce({ ok: true, value: createMockResult('uint64') })
          .mockResolvedValueOnce({ ok: false, error });

        return request(app.getHttpServer())
          .post('/api/v1/encrypt/batch')
          .send({
            contractAddress: validContractAddress,
            userAddress: validUserAddress,
            items: [
              { type: 'euint64', value: '100' },
              { type: 'euint64', value: '200' },
            ],
          })
          .expect(503)
          .expect((res: any) => {
            expect(res.body.type).toBe('urn:fhe:error:not-initialized');
          });
      });
    });

    describe('single item batch', () => {
      it('should handle single item batch', () => {
        return request(app.getHttpServer())
          .post('/api/v1/encrypt/batch')
          .send({
            contractAddress: validContractAddress,
            userAddress: validUserAddress,
            items: [{ type: 'euint64', value: '42' }],
          })
          .expect(200)
          .expect((res: any) => {
            expect(res.body.results).toHaveLength(1);
            expect(res.body.results[0].type).toBe('euint64');
          });
      });
    });
  });
});
