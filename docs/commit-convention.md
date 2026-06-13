# Commit Convention

This project uses a shared commit message format to keep the history readable, searchable, and useful for automation. Consistent commit messages make it easier to understand why a change was made, review project history, and prepare future release notes.

## Format

This project follows Conventional Commits.

Use this format:

```text
type(scope): short description
```

Commit messages must be written in English.

## Subject Rules

- `scope` is required.
- The subject must be short and clear.
- The subject must be lowercase.
- The subject must not end with a period.

## Allowed Types

- `feat` - new feature
- `fix` - bug fix
- `test` - tests
- `ci` - CI / GitHub Actions / release automation
- `docs` - documentation
- `chore` - maintenance without behavior changes
- `refactor` - code changes without behavior changes
- `build` - build system, dependencies, package scripts, Makefile
- `style` - formatting without behavior changes
- `perf` - performance improvements

## Allowed Scopes

- `spec` - TypeSpec / OpenAPI contract
- `frontend` - React/Vite frontend
- `backend` - Express backend
- `e2e` - browser integration tests
- `ci` - GitHub Actions
- `release` - release-please / changelog / versioning
- `docs` - documentation
- `deps` - dependencies
- `build` - build configuration / package scripts
- `make` - Makefile commands
- `project` - cross-project changes
- `commits` - commit convention documentation

## Good Examples

- `feat(frontend): add booking UI`
- `feat(backend): add booking API`
- `fix(backend): reject unavailable booking slots`
- `test(e2e): add booking flow scenario`
- `ci(release): configure release please`
- `docs(commits): document commit convention`
- `build(make): add project commands`

## Bad Examples

- `update`
- `fix`
- `changes`
- `wip`
- `final`
- `some fixes`
- `commit changes`
- `feat: add booking API`
- `fix(backend): Исправить бронирование`
- `fix(backend): reject unavailable slots.`

## Breaking Changes

Use `!` after the type and scope when a commit introduces a breaking change:

```text
feat(backend)!: change booking creation response
```

Add a `BREAKING CHANGE:` footer when the reason or migration details need to be explained:

```text
feat(spec)!: rename booking start time field

BREAKING CHANGE: `startTime` is replaced with `startsAt` in the booking API contract.
```

## Release Automation

The convention is intended to work with future release-please automation. Correct `feat`, `fix`, and breaking change syntax will allow release tooling to generate changelogs and determine release versions from commit history.

## Agent Rule

Agents must use this convention for every commit they create in this repository. Do not use vague messages such as `update`, `fix`, `changes`, `wip`, or `final`.
