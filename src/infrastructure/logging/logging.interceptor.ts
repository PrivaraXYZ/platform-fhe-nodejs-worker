import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { randomUUID } from 'crypto';

export const CORRELATION_ID_HEADER = 'x-correlation-id';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const correlationId = (request.headers[CORRELATION_ID_HEADER] as string) || randomUUID();
    request.headers[CORRELATION_ID_HEADER] = correlationId;
    response.setHeader(CORRELATION_ID_HEADER, correlationId);

    const { method, originalUrl, body } = request;
    const startTime = Date.now();

    const sanitizedBody = this.sanitizeBody(body);
    this.logger.log(
      `→ ${method} ${originalUrl} | id=${correlationId}${sanitizedBody ? ` | body=${sanitizedBody}` : ''}`,
    );

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          const statusCode = response.statusCode;
          this.logger.log(
            `← ${statusCode} ${method} ${originalUrl} (${duration}ms) | id=${correlationId}`,
          );
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          const statusCode = error.status || 500;
          this.logger.warn(
            `← ${statusCode} ${method} ${originalUrl} (${duration}ms) | id=${correlationId} | error=${error.message}`,
          );
        },
      }),
    );
  }

  private sanitizeBody(body: unknown): string | null {
    if (!body || typeof body !== 'object') return null;

    const sanitized = { ...body } as Record<string, unknown>;

    // Truncate long values, hide sensitive data
    if (sanitized.value && typeof sanitized.value === 'string' && sanitized.value.length > 20) {
      sanitized.value = sanitized.value.substring(0, 10) + '...';
    }

    if (sanitized.items && Array.isArray(sanitized.items)) {
      sanitized.items = `[${sanitized.items.length} items]`;
    }

    return JSON.stringify(sanitized);
  }
}

export function getCorrelationId(request: Request): string {
  return (request.headers[CORRELATION_ID_HEADER] as string) || 'unknown';
}
