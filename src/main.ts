import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from '@interface/http/filter/global-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

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
}

bootstrap();
