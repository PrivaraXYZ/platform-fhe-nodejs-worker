# Contributing

Thank you for your interest in contributing!

## Development Setup

### Prerequisites

- Node.js 24+
- npm 10+
- Docker (optional)

### Installation

```bash
git clone https://github.com/PrivaraXYZ/platform-fhe-worker.git
cd platform-fhe-worker
npm install
```

### Running Locally

```bash
npm run start:dev
```

### Running Tests

```bash
npm test              # Unit tests
npm run test:cov      # With coverage
npm run test:e2e      # E2E tests
```

## Code Style

- TypeScript strict mode
- ESLint + Prettier
- Minimal comments - code should be self-documenting
- Follow existing patterns in codebase

## Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `test:` - Tests
- `refactor:` - Code refactoring
- `chore:` - Build/config changes

## Pull Request Process

1. Fork the repository
2. Create feature branch (`git checkout -b feat/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feat/amazing-feature`)
5. Open Pull Request

### PR Checklist

- [ ] Tests pass (`npm test`)
- [ ] Linting passes (`npm run lint`)
- [ ] Coverage maintained (80%+)
- [ ] Documentation updated if needed

## Questions?

Open an issue or start a discussion.
