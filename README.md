### Hexlet tests and linter status:
[![Actions Status](https://github.com/AlexeyFrost/ai-for-developers-project-386/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/AlexeyFrost/ai-for-developers-project-386/actions)

## Commit messages

This project uses Conventional Commits. See [Commit convention](docs/commit-convention.md).

## Releases

Releases are automated with release-please. It creates or updates a release PR with the proposed version and changelog generated from Conventional Commits. Commit rules are documented in [Commit convention](docs/commit-convention.md).

## Docker

Start the production app in Docker:

```bash
make up
```

`make up` builds the `calendar-app` image, removes old app containers, and starts a new detached container named `calendar-app`. Open `http://localhost:3000`.

Stop and remove the container:

```bash
make down
```

The container uses the `PORT` environment variable. The default is `3000`; override it when needed:

```bash
make up PORT=3005
```

Manual equivalent:

```bash
docker rm -f calendar-app || true
docker build -t calendar-app .
docker run -d --name calendar-app -p 3000:3000 -e PORT=3000 calendar-app
```

The backend serves API routes and the built frontend from the same origin. In production the frontend uses relative API paths, so `VITE_API_BASE_URL` is not required.

WSL troubleshooting: if Docker fails with `docker-credential-desktop.exe: exec format error`, this is a local Docker credential helper issue, not an application issue. The Makefile uses project-local `DOCKER_CONFIG=.tmp/docker-config` for Docker commands to avoid the broken helper without storing credentials in the repository.

Deployed application URL: add after deployment.

Render deployment note: Docker setup is ready. Create a Render Web Service from this repository, use the root `Dockerfile`, let Render provide `PORT`, then verify `/`, `/owner`, and `/book` before adding the public URL here.

## E2E scenarios

Main integration scenarios are documented in [E2E scenarios](docs/e2e-scenarios.md).

## Playwright E2E

Install dependencies in all packages with `make deps`, then install Chromium and its OS dependencies with `make e2e-install`.
On Linux this can require sudo privileges.

Run browser e2e tests with `make test-e2e`.

Playwright starts the real backend at `http://localhost:3001` and the real frontend at `http://localhost:5173`; the frontend uses `VITE_API_BASE_URL=http://localhost:3001`.
