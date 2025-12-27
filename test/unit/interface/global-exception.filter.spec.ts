import { ArgumentsHost, BadRequestException, HttpStatus } from '@nestjs/common';
import { GlobalExceptionFilter } from '@interface/http/filter/global-exception.filter';
import {
  FhevmNotInitializedError,
  EncryptionError,
  EncryptionTimeoutError,
  InvalidContractAddressError,
  WorkerPoolExhaustedError,
} from '@domain/fhe/error/fhe.error';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let mockResponse: { status: jest.Mock; json: jest.Mock };
  let mockRequest: { url: string };
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    filter = new GlobalExceptionFilter();

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockRequest = { url: '/api/v1/encrypt' };

    mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as unknown as ArgumentsHost;
  });

  describe('validation errors', () => {
    it('should handle BadRequestException with RFC 7807 format', () => {
      const exception = new BadRequestException({
        message: ['value must be a string', 'contractAddress is invalid'],
        statusCode: 400,
      });

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'urn:fhe:error:validation',
          title: 'Validation Failed',
          status: 400,
          invalidParams: expect.arrayContaining([
            expect.objectContaining({ reason: 'value must be a string' }),
            expect.objectContaining({ reason: 'contractAddress is invalid' }),
          ]),
        }),
      );
    });
  });

  describe('domain errors', () => {
    it('should handle FhevmNotInitializedError as 503', () => {
      const exception = new FhevmNotInitializedError();

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.SERVICE_UNAVAILABLE);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'urn:fhe:error:not-initialized',
          title: 'Service Not Ready',
          status: 503,
        }),
      );
    });

    it('should handle EncryptionError as 500', () => {
      const exception = new EncryptionError('uint64', 'Failed');

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'urn:fhe:error:encryption-failed',
          title: 'Encryption Failed',
          status: 500,
        }),
      );
    });

    it('should handle EncryptionTimeoutError as 504', () => {
      const exception = new EncryptionTimeoutError(45000);

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.GATEWAY_TIMEOUT);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'urn:fhe:error:timeout',
          title: 'Encryption Timeout',
          status: 504,
        }),
      );
    });

    it('should handle InvalidContractAddressError as 422', () => {
      const exception = new InvalidContractAddressError('bad-address');

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNPROCESSABLE_ENTITY);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'urn:fhe:error:invalid-address',
          title: 'Invalid Address',
          status: 422,
        }),
      );
    });

    it('should handle WorkerPoolExhaustedError as 503', () => {
      const exception = new WorkerPoolExhaustedError();

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.SERVICE_UNAVAILABLE);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'urn:fhe:error:pool-exhausted',
          title: 'Service Overloaded',
          status: 503,
        }),
      );
    });
  });

  describe('unknown errors', () => {
    it('should handle unknown errors as 500', () => {
      const exception = new Error('Something went wrong');

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'urn:fhe:error:internal',
          title: 'Internal Server Error',
          status: 500,
        }),
      );
    });
  });

  describe('instance field', () => {
    it('should include request URL as instance', () => {
      const exception = new Error('Test');

      filter.catch(exception, mockHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          instance: '/api/v1/encrypt',
        }),
      );
    });
  });
});
