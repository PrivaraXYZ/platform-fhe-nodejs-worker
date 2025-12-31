import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger, LogLevel } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from '@interface/http/filter/global-exception.filter';
import { LoggingInterceptor } from '@infrastructure/logging/logging.interceptor';

function getLogLevels(level: string): LogLevel[] {
  const levels: LogLevel[] = ['error', 'warn', 'log', 'debug', 'verbose'];
  const index = levels.indexOf(level === 'info' ? 'log' : (level as LogLevel));
  return index >= 0 ? levels.slice(0, index + 1) : ['error', 'warn', 'log'];
}

async function bootstrap() {
  const logLevel = process.env.LOG_LEVEL || 'info';
  const isProduction = process.env.NODE_ENV === 'production';

  const app = await NestFactory.create(AppModule, {
    logger: isProduction
      ? {
          log: (message: string) =>
            console.log(
              JSON.stringify({ level: 'info', message, timestamp: new Date().toISOString() }),
            ),
          error: (message: string, trace?: string) =>
            console.error(
              JSON.stringify({
                level: 'error',
                message,
                trace,
                timestamp: new Date().toISOString(),
              }),
            ),
          warn: (message: string) =>
            console.warn(
              JSON.stringify({ level: 'warn', message, timestamp: new Date().toISOString() }),
            ),
          debug: (message: string) =>
            console.debug(
              JSON.stringify({ level: 'debug', message, timestamp: new Date().toISOString() }),
            ),
          verbose: (message: string) =>
            console.log(
              JSON.stringify({ level: 'verbose', message, timestamp: new Date().toISOString() }),
            ),
        }
      : getLogLevels(logLevel),
  });

  const logger = new Logger('Bootstrap');

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  app.enableCors();

  const swaggerDescription = `
## Overview

Stateless REST API for **Fully Homomorphic Encryption (FHE)** using [Zama Protocol](https://docs.zama.org/protocol).

This service encrypts values for use in FHE-enabled smart contracts, producing encrypted handles and proofs that can be submitted on-chain.

## Supported Types

| Type | Description | Value Range |
|------|-------------|-------------|
| \`euint64\` | Encrypted 64-bit unsigned integer | 0 to 18,446,744,073,709,551,615 |
| \`eaddress\` | Encrypted Ethereum address | 0x + 40 hex characters |
| \`ebool\` | Encrypted boolean | true / false |

## Quick Start

\`\`\`bash
curl -X POST http://localhost:${port}/api/v1/encrypt/uint64 \\
  -H "Content-Type: application/json" \\
  -d '{
    "value": "1000000",
    "contractAddress": "0xaBaC0e90FeBC5973D943D36351b9CE04A47bdB41",
    "userAddress": "0x1234567890123456789012345678901234567890"
  }'
\`\`\`

## Error Handling

All errors follow [RFC 7807 Problem Details](https://datatracker.ietf.org/doc/html/rfc7807) format.
`;

  const config = new DocumentBuilder()
    .setTitle('FHE Worker Service')
    .setDescription(swaggerDescription)
    .setVersion('1.0.0')
    .setContact('Privara', 'https://privara.xyz', 'support@privara.xyz')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .setExternalDoc('Zama Protocol Documentation', 'https://docs.zama.org/protocol')
    .addServer(`http://localhost:${port}`, 'Local Development')
    .addTag('Encrypt', 'FHE encryption endpoints for smart contract inputs')
    .addTag('Health', 'Liveness and readiness probes for orchestration')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'FHE Worker API',
    customfavIcon: 'https://zama.ai/favicon.ico',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { font-size: 2.5em }
      .swagger-ui .info hgroup.main { margin: 0 0 20px 0 }
      .swagger-ui .scheme-container { background: #fafafa; padding: 15px 0 }
    `,
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      filter: true,
      showRequestDuration: true,
      syntaxHighlight: {
        activate: true,
        theme: 'monokai',
      },
      tryItOutEnabled: true,
    },
  });

  app.enableShutdownHooks();

  await app.listen(port);
  logger.log(`Application running on port ${port}`);
  logger.log(`Swagger documentation: http://localhost:${port}/api/docs`);
  logger.log(`Log level: ${logLevel}`);
}

bootstrap();
