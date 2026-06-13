### Hexlet tests and linter status:
[![Actions Status](https://github.com/AlexeyFrost/ai-for-developers-project-386/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/AlexeyFrost/ai-for-developers-project-386/actions)

## Commit messages

This project uses Conventional Commits. See [Commit convention](docs/commit-convention.md).

## E2E scenarios

Main integration scenarios are documented in [E2E scenarios](docs/e2e-scenarios.md).

## Playwright E2E

Install dependencies in all packages with `make deps`, then install Chromium and its OS dependencies with `make e2e-install`.
On Linux this can require sudo privileges.

Run browser e2e tests with `make test-e2e`.

Playwright starts the real backend at `http://localhost:3001` and the real frontend at `http://localhost:5173`; the frontend uses `VITE_API_BASE_URL=http://localhost:3001`.
