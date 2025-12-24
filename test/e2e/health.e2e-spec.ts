import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { FHE_SERVICE, IFheService } from '@domain/fhe';

describe('Health Endpoints (e2e)', () => {
  let app: INestApplication;

  const mockFheService: Partial<IFheService> = {
    isInitialized: jest.fn().mockReturnValue(true),
    initialize: jest.fn().mockResolvedValue(undefined),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(FHE_SERVICE)
      .useValue(mockFheService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /health', () => {
    it('should return ok status', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res: any) => {
          expect(res.body.status).toBe('ok');
        });
    });
  });

  describe('GET /health/ready', () => {
    it('should return healthy when FHE is initialized', () => {
      (mockFheService.isInitialized as jest.Mock).mockReturnValue(true);

      return request(app.getHttpServer())
        .get('/health/ready')
        .expect(200)
        .expect((res: any) => {
          expect(res.body.status).toBe('ok');
          expect(res.body.info.fhe.status).toBe('up');
        });
    });

    it('should return unhealthy when FHE is not initialized', () => {
      (mockFheService.isInitialized as jest.Mock).mockReturnValue(false);

      return request(app.getHttpServer())
        .get('/health/ready')
        .expect(503)
        .expect((res: any) => {
          expect(res.body.status).toBe('error');
        });
    });
  });
});
