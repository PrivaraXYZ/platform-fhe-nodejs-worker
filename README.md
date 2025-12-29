# FHE Worker Service

Stateless REST API for Fully Homomorphic Encryption using Zama FHEVM.

## Features

- Encrypt uint64, address, bool for FHE smart contracts
- Worker Thread Pool for parallel encryption
- Docker-ready deployment
- OpenAPI/Swagger documentation
- Health checks (liveness + readiness)
- RFC 7807 error responses

## Quick Start

### Docker

```bash
docker-compose -f docker/docker-compose.yml up -d
```

### From Source

```bash
npm install
npm run build
npm run start:prod
```

The service will be available at `http://localhost:3000`.

## API Reference

### Generic Endpoint

```http
POST /api/v1/encrypt
Content-Type: application/json

{
  "type": "euint64",
  "value": "1000000",
  "contractAddress": "0xaBaC0e90FeBC5973D943D36351b9CE04A47bdB41",
  "userAddress": "0x1234567890123456789012345678901234567890"
}
```

Supported types: `euint64`, `eaddress`, `ebool`

### Typed Shortcuts

```http
POST /api/v1/encrypt/uint64
POST /api/v1/encrypt/address
POST /api/v1/encrypt/bool
```

### Batch Encryption

Encrypt multiple values in a single request (max 10 items).

**Shared context** (same addresses for all items):
```http
POST /api/v1/encrypt/batch
Content-Type: application/json

{
  "contractAddress": "0xaBaC0e90FeBC5973D943D36351b9CE04A47bdB41",
  "userAddress": "0x1234567890123456789012345678901234567890",
  "items": [
    { "type": "euint64", "value": "1000000" },
    { "type": "ebool", "value": true },
    { "type": "eaddress", "value": "0xabcdef0123456789abcdef0123456789abcdef01" }
  ]
}
```

**Per-item context** (different addresses per item):
```http
POST /api/v1/encrypt/batch
Content-Type: application/json

{
  "items": [
    {
      "type": "euint64",
      "value": "500",
      "contractAddress": "0xaBaC0e90FeBC5973D943D36351b9CE04A47bdB41",
      "userAddress": "0x1234567890123456789012345678901234567890"
    },
    {
      "type": "ebool",
      "value": false,
      "contractAddress": "0x9999999999999999999999999999999999999999",
      "userAddress": "0x8888888888888888888888888888888888888888"
    }
  ]
}
```

**Batch Response:**
```json
{
  "results": [
    {
      "type": "euint64",
      "handle": "0x...",
      "proof": "0x...",
      "contractAddress": "0x...",
      "userAddress": "0x...",
      "encryptionTimeMs": 1200
    }
  ],
  "totalEncryptionTimeMs": 3500
}
```

All-or-nothing: if any item fails, the entire batch returns an error.

### Response

```json
{
  "type": "euint64",
  "handle": "0x1234...abcd",
  "proof": "0xabcd...1234",
  "contractAddress": "0xaBaC0e90FeBC5973D943D36351b9CE04A47bdB41",
  "userAddress": "0x1234567890123456789012345678901234567890",
  "encryptionTimeMs": 2350
}
```

### Health Checks

```http
GET /health        # Liveness probe
GET /health/ready  # Readiness probe (FHEVM initialized)
```

### API Documentation

Swagger UI available at `/api/docs`.

### Postman Collection

Import the collection from `postman/FHE-Worker-Service.postman_collection.json`.

## Configuration

### Application

| Variable    | Default       | Description                              |
|-------------|---------------|------------------------------------------|
| `PORT`      | `3000`        | HTTP server port                         |
| `NODE_ENV`  | `development` | Environment mode                         |
| `LOG_LEVEL` | `info`        | Logging level (debug, info, warn, error) |

### Worker Pool

| Variable              | Default     | Description            |
|-----------------------|-------------|------------------------|
| `WORKER_MIN_THREADS`  | `2`         | Minimum worker threads |
| `WORKER_MAX_THREADS`  | `CPU cores` | Maximum worker threads |
| `WORKER_IDLE_TIMEOUT` | `60000`     | Idle timeout (ms)      |
| `WORKER_MAX_QUEUE`    | `100`       | Maximum queued tasks   |
| `WORKER_TASK_TIMEOUT` | `45000`     | Task timeout (ms)      |

### FHE Network

| Variable           | Default                                      | Description         |
|--------------------|----------------------------------------------|---------------------|
| `FHE_CHAIN_ID`     | `11155111`                                   | Blockchain chain ID |
| `FHE_NETWORK_NAME` | `Ethereum Sepolia`                           | Network name        |
| `FHE_NETWORK_URL`  | `https://eth-sepolia.public.blastapi.io`     | RPC URL             |
| `FHE_GATEWAY_URL`  | `https://relayer.testnet.zama.org`           | Zama relayer URL    |
| `FHE_ACL_ADDRESS`  | `0xf0Ffdc93b7E186bC2f8CB3dAA75D86d1930A433D` | ACL contract        |
| `FHE_KMS_ADDRESS`  | `0xbE0E383937d564D7FF0BC3b46c51f0bF8d5C311A` | KMS contract        |

## Architecture

```
src/
├── domain/           # Business logic, value objects, errors
├── application/      # Use cases, DTOs
├── infrastructure/   # Worker pool, Zama SDK integration
└── interface/        # Controllers, filters, health checks
```

### Worker Thread Pool

Uses Piscina for CPU parallelism and fault isolation. Each worker maintains its own FHEVM instance for thread-safe
encryption.

## Development

### Prerequisites

- Node.js 24+
- npm 10+

### Installation

```bash
npm install
```

### Running

```bash
npm run start:dev   # Development with watch
npm run start:prod  # Production
```

### Testing

```bash
npm test            # Unit tests
npm run test:cov    # With coverage
npm run test:e2e    # E2E tests
```

### Building Docker Image

```bash
docker build -f docker/Dockerfile -t fhe-worker .
```

## Error Handling

All errors follow RFC 7807 Problem Details format:

```json
{
  "type": "urn:fhe:error:encryption-failed",
  "title": "Encryption Failed",
  "status": 500,
  "detail": "Failed to encrypt uint64",
  "instance": "/api/v1/encrypt/uint64"
}
```

### Error Types

| Error                 | Status | Type URN                              |
|-----------------------|--------|---------------------------------------|
| Validation failed     | 400    | `urn:fhe:error:validation`            |
| Invalid address       | 422    | `urn:fhe:error:invalid-address`       |
| Value out of range    | 422    | `urn:fhe:error:invalid-value`         |
| Unsupported type      | 422    | `urn:fhe:error:unsupported-type`      |
| Encryption failed     | 500    | `urn:fhe:error:encryption-failed`     |
| Internal error        | 500    | `urn:fhe:error:internal`              |
| FHEVM not ready       | 503    | `urn:fhe:error:not-initialized`       |
| Initialization failed | 503    | `urn:fhe:error:initialization-failed` |
| Pool exhausted        | 503    | `urn:fhe:error:pool-exhausted`        |
| Timeout               | 504    | `urn:fhe:error:timeout`               |

## License

MIT
