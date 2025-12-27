import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { Response, Request } from 'express';
import {
  FheDomainError,
  FhevmNotInitializedError,
  FhevmInitializationError,
  EncryptionError,
  EncryptionTimeoutError,
  InvalidContractAddressError,
  InvalidUserAddressError,
  InvalidEncryptionValueError,
  UnsupportedEncryptionTypeError,
  WorkerPoolExhaustedError,
} from '@domain/fhe/error/fhe.error';

interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  invalidParams?: { name: string; reason: string }[];
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const problem = this.buildProblem(exception, request.url);

    if (problem.status >= 500) {
      this.logger.error(
        `${problem.title}: ${problem.detail}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    response.status(problem.status).json(problem);
  }

  private buildProblem(exception: unknown, instance: string): ProblemDetails {
    if (exception instanceof BadRequestException) {
      return this.handleValidationError(exception, instance);
    }

    if (exception instanceof FheDomainError) {
      return this.handleDomainError(exception, instance);
    }

    return this.handleUnknownError(exception, instance);
  }

  private handleValidationError(exception: BadRequestException, instance: string): ProblemDetails {
    const response = exception.getResponse() as {
      message: string | string[];
      statusCode: number;
    };

    const messages = Array.isArray(response.message) ? response.message : [response.message];

    return {
      type: 'urn:fhe:error:validation',
      title: 'Validation Failed',
      status: HttpStatus.BAD_REQUEST,
      detail: 'Request validation failed',
      instance,
      invalidParams: messages.map((msg) => ({
        name: this.extractFieldName(msg),
        reason: msg,
      })),
    };
  }

  private handleDomainError(error: FheDomainError, instance: string): ProblemDetails {
    const mapping = this.getErrorMapping(error);

    return {
      type: mapping.type,
      title: mapping.title,
      status: mapping.status,
      detail: error.message,
      instance,
    };
  }

  private handleUnknownError(exception: unknown, instance: string): ProblemDetails {
    const message = exception instanceof Error ? exception.message : 'Unknown error';

    return {
      type: 'urn:fhe:error:internal',
      title: 'Internal Server Error',
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      detail: message,
      instance,
    };
  }

  private getErrorMapping(error: FheDomainError): {
    type: string;
    title: string;
    status: number;
  } {
    if (error instanceof FhevmNotInitializedError) {
      return {
        type: 'urn:fhe:error:not-initialized',
        title: 'Service Not Ready',
        status: HttpStatus.SERVICE_UNAVAILABLE,
      };
    }

    if (error instanceof FhevmInitializationError) {
      return {
        type: 'urn:fhe:error:initialization-failed',
        title: 'Initialization Failed',
        status: HttpStatus.SERVICE_UNAVAILABLE,
      };
    }

    if (error instanceof EncryptionTimeoutError) {
      return {
        type: 'urn:fhe:error:timeout',
        title: 'Encryption Timeout',
        status: HttpStatus.GATEWAY_TIMEOUT,
      };
    }

    if (error instanceof WorkerPoolExhaustedError) {
      return {
        type: 'urn:fhe:error:pool-exhausted',
        title: 'Service Overloaded',
        status: HttpStatus.SERVICE_UNAVAILABLE,
      };
    }

    if (error instanceof InvalidContractAddressError || error instanceof InvalidUserAddressError) {
      return {
        type: 'urn:fhe:error:invalid-address',
        title: 'Invalid Address',
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      };
    }

    if (error instanceof InvalidEncryptionValueError) {
      return {
        type: 'urn:fhe:error:invalid-value',
        title: 'Invalid Value',
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      };
    }

    if (error instanceof UnsupportedEncryptionTypeError) {
      return {
        type: 'urn:fhe:error:unsupported-type',
        title: 'Unsupported Type',
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      };
    }

    if (error instanceof EncryptionError) {
      return {
        type: 'urn:fhe:error:encryption-failed',
        title: 'Encryption Failed',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }

    return {
      type: `urn:fhe:error:${error.code}`,
      title: 'Domain Error',
      status: HttpStatus.INTERNAL_SERVER_ERROR,
    };
  }

  private extractFieldName(message: string): string {
    const match = message.match(/^(\w+)/);
    return match ? match[1] : 'unknown';
  }
}
