# Suggested commit groups

Use small commits grouped by intent, following the same pattern already used in this repository:

`:<emoji>: <type>: <short description>`

## Current pattern from git log

Examples already used:

- `:sparkles: feat: add deliveryman CRUD`
- `:sparkles: feat: add recipient CRUD`
- `:sparkles: feat: create recipient use case`
- `:bug: fix: fix tsconfig`
- `:ok_hand: style: eslint fix`

## Commit plan for the current git status

The commands below are organized to cover the files currently shown by `git status`.

## 1. Core and domain foundations

```powershell
git add src/core/ src/domain/delivery/enterprise/
git commit -m ":sparkles: feat: expand delivery domain foundation"
```

Covers:

- core helpers, entities, events and shared abstractions
- delivery domain entities and domain events

## 2. Auth and application use cases

```powershell
git add src/domain/delivery/application/cryptography/ src/domain/delivery/application/notification/ src/domain/delivery/application/repository/ src/domain/delivery/application/storage/ src/domain/delivery/application/subscribers/ src/domain/delivery/application/use-cases/
git commit -m ":sparkles: feat: add auth and order management use cases"
```

Covers:

- authentication and password change
- order CRUD and order workflow use cases
- upload, notification and subscriber contracts
- repository and cryptography contracts

## 3. Infra, HTTP and persistence

```powershell
git add src/infra/ prisma/schema.prisma prisma.config.ts
git add -A prisma/migrations
git commit -m ":sparkles: feat: add api infrastructure for auth and orders"
```

Covers:

- auth guards, decorators and JWT strategy
- Prisma repositories, mappers and modules
- HTTP controllers, DTOs, presenters and middlewares
- cache, notification and storage integrations
- new migrations and removal of the old migration file

## 4. Tests and test support

```powershell
git add test/ src/**/*.spec.ts
git commit -m ":white_check_mark: test: cover auth orders and delivery flows"
```

Covers:

- use case specs
- controller E2E specs
- test factories, fakes, repositories and E2E helpers

## 5. Project setup, scripts and automation

```powershell
git add .github/ .env.example .env.test.example .gitignore package.json pnpm-lock.yaml scripts/ test/setup-e2e.ts test/global-setup-e2e.ts tsconfig.build.json vitest.config.ts vitest.config.e2e.ts
git commit -m ":wrench: chore: update local setup and CI automation"
```

Covers:

- CI workflow
- env examples and ignore rules
- package scripts and lockfile
- bootstrap, seed and E2E scripts
- build and test configuration

## 6. Public documentation

```powershell
git add README.md COMMITS.md docs/api/ docs/postman/
git commit -m ":memo: docs: update api documentation and onboarding"
```

Covers:

- main README
- commit guide
- OpenAPI and static docs page
- Postman collection

## 7. Optional internal docs

Only use this commit if you want internal project notes in the GitHub repository.

```powershell
git add docs/convencoes.md docs/freelance-checklist.md docs/requisitos.md docs/todo.md
git commit -m ":memo: docs: add internal project notes"
```

If you want a cleaner public repository, skip this commit for now.

## Notes

- Keep descriptions in English to match the existing history.
- Prefer one clear intent per commit.
- If a commit is only formatting, keep using `:ok_hand: style: ...`.
- If a commit is only a bug fix, keep using `:bug: fix: ...`.
- If `src/**/*.spec.ts` does not expand in your shell, replace it with explicit folders such as `src/domain/delivery/application/use-cases/*.spec.ts` and `src/infra/http/controllers/**/*.e2e-spec.ts`.
