import { Test, TestingModule } from '@nestjs/testing';
import { HealthCheckService, HealthCheckError } from '@nestjs/terminus';
import { HealthController, FheHealthIndicator } from '@interface/http/health';
import { IFheService, FHE_SERVICE } from '@domain/fhe';

describe('HealthController', () => {
  let controller: HealthController;
  let healthCheckService: jest.Mocked<HealthCheckService>;
  let fheHealthIndicator: FheHealthIndicator;
  let fheService: jest.Mocked<IFheService>;

  beforeEach(async () => {
    const mockHealthCheckService = {
      check: jest.fn(),
    };

    const mockFheService = {
      isInitialized: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        FheHealthIndicator,
        { provide: HealthCheckService, useValue: mockHealthCheckService },
        { provide: FHE_SERVICE, useValue: mockFheService },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    healthCheckService = module.get(HealthCheckService);
    fheHealthIndicator = module.get<FheHealthIndicator>(FheHealthIndicator);
    fheService = module.get(FHE_SERVICE);
  });

  describe('liveness', () => {
    it('should return ok status', () => {
      const result = controller.liveness();

      expect(result.status).toBe('ok');
    });
  });

  describe('readiness', () => {
    it('should call health check service', async () => {
      const expectedResult = {
        status: 'ok' as const,
        info: { fhe: { status: 'up' as const } },
        error: {},
        details: { fhe: { status: 'up' as const } },
      };
      healthCheckService.check.mockResolvedValue(expectedResult);

      const result = await controller.readiness();

      expect(healthCheckService.check).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });
});

describe('FheHealthIndicator', () => {
  let indicator: FheHealthIndicator;
  let fheService: jest.Mocked<IFheService>;

  beforeEach(async () => {
    const mockFheService = {
      isInitialized: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FheHealthIndicator,
        { provide: FHE_SERVICE, useValue: mockFheService },
      ],
    }).compile();

    indicator = module.get<FheHealthIndicator>(FheHealthIndicator);
    fheService = module.get(FHE_SERVICE);
  });

  describe('isHealthy', () => {
    it('should return healthy when FHE is initialized', async () => {
      fheService.isInitialized.mockReturnValue(true);

      const result = await indicator.isHealthy('fhe');

      expect(result).toEqual({
        fhe: { status: 'up', initialized: true },
      });
    });

    it('should throw HealthCheckError when FHE is not initialized', async () => {
      fheService.isInitialized.mockReturnValue(false);

      await expect(indicator.isHealthy('fhe')).rejects.toThrow(HealthCheckError);
    });
  });
});
