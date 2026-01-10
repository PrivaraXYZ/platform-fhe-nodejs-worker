# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-10

### Added

- Batch encryption endpoint with parallel processing support
- Worker pool implementation using Piscina for concurrent FHE operations
- Health check endpoints (liveness and readiness probes)
- Swagger/OpenAPI documentation at `/api/docs`
- Docker multi-stage build with Alpine Linux
- Non-root container user for security
- Configurable worker pool (min/max threads, queue size, timeouts)
- RFC 7807 Problem Details error format
- Comprehensive logging with configurable levels
- Unit and E2E test suites with 80% coverage threshold
- Postman collection for API testing
- ESLint and Prettier configuration
- Husky git hooks for code quality
- GitHub issue and PR templates

### Technical Details

- Built with NestJS v11 and TypeScript
- Zama FHE Relayer SDK v0.3.0-8 integration
- Clean Architecture pattern (domain, application, infrastructure, interface layers)
- Requires Node.js >= 24.0.0

[1.0.0]: https://github.com/PrivaraXYZ/platform-fhe-nodejs-worker/releases/tag/v1.0.0
