# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please report it responsibly.

### How to Report

Please report security vulnerabilities through GitHub's Security Advisories:

**[Report a vulnerability](https://github.com/PrivaraXYZ/platform-fhe-nodejs-worker/security/advisories/new)**

### What to Include

When reporting a vulnerability, please include:

- A clear description of the vulnerability
- Steps to reproduce the issue
- Potential impact assessment
- Any suggested fixes (optional)

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 5 business days
- **Resolution Target**: Depends on severity

### Security Measures

This project implements several security measures:

- Multi-stage Docker builds with non-root user
- Input validation using class-validator
- Strict TypeScript configuration
- Regular dependency updates
- Health check endpoints for monitoring

## Security Best Practices

When deploying this service:

1. Always use HTTPS in production
2. Configure appropriate firewall rules
3. Use secrets management for sensitive configuration
4. Enable container security scanning
5. Monitor logs for suspicious activity
