# FastFeet API

[![CI](https://github.com/NicolasFreitas1/fast-feet-api/actions/workflows/ci.yml/badge.svg)](https://github.com/NicolasFreitas1/fast-feet-api/actions/workflows/ci.yml)

FastFeet API is a delivery management backend built to showcase backend engineering fundamentals with production-minded decisions. It handles authentication, role-based access control, order lifecycle transitions, nearby deliveries, delivery proof upload, recipient notifications, cache integration, and automated test coverage.

This repository is meant to work well as a portfolio project:

- Clear business rules and authorization boundaries
- Clean Architecture with domain-driven separation
- Unit and end-to-end tests covering the core flows
- Swagger documentation and demo seed for fast evaluation
- Local-first setup with room to evolve toward production

## Project goals

This project was designed to demonstrate backend engineering practices such as:

- Clean Architecture with clear layer boundaries
- Domain-driven modeling around orders, recipients, and deliverymen
- RBAC enforcement across admin and delivery workflows
- Deterministic unit and end-to-end testing
- Infrastructure abstraction for storage, notifications, and persistence
- Production-minded trade-off awareness without sacrificing local developer experience

## Why this project stands out

FastFeet is not just a CRUD API. It models a real workflow with state transitions and business restrictions:

- Admins manage deliverymen, recipients, orders, and password changes
- Deliverymen can only interact with their own deliveries
- Orders move through explicit states such as `waiting`, `picked up`, `delivered`, and `returned`
- Delivery confirmation requires a file upload
- Recipients are notified whenever order status changes
- Nearby order listing uses recipient coordinates and deliveryman location

## Tech stack

- Node.js 20+
- NestJS 11
- TypeScript 5.9
- Prisma 7 + PostgreSQL
- Redis
- Zod
- Vitest + Supertest
- Swagger / OpenAPI
- AWS S3-compatible client for R2 uploads

## Architecture

The project follows a Clean Architecture style to keep business rules independent from frameworks and infrastructure details.

### Layered flow

```text
HTTP Controller
    -> Use Case
        -> Repository Contract
            -> Prisma Repository

Domain Events
    -> Notification Sender

Storage Contract
    -> Local Storage or R2/S3-compatible uploader
```

### Visual architecture

```text
                Client
                  |
                  v
         HTTP Controllers (NestJS)
                  |
                  v
       Use Cases (Application Layer)
          /                       \
         v                         v
Repository Contracts          Domain Events
         |                         |
         v                         v
 Prisma Repositories      Notification Service
         |
         v
    PostgreSQL

 Redis supports cache integration
 and production-oriented evolution.
```

### Layers

- `src/domain`: entities, value objects, use cases, domain events, contracts
- `src/infra`: controllers, auth, Prisma repositories, cache, storage, notification integration, environment config
- `src/core`: shared abstractions such as `Either`, entity base classes, and event plumbing
- `test`: in-memory repositories, factories, fakes, E2E helpers

### Design choices

- Business rules live in the application/domain layer, not in controllers
- RBAC is enforced by guards and validated again through use-case behavior
- Zod validates input boundaries while Swagger documents the HTTP contract
- Storage is abstracted so delivery proof upload can stay local in development and move to R2 in hosted environments
- Notification sending is modeled as a contract and triggered through domain events

## Domain model

### Core actors and entities

```text
User
|- Admin
`- Deliveryman

Order
|- Recipient
|- Deliveryman
`- Status
```

### Order lifecycle

```text
waiting
  |
  v
picked_up
  | \
  |  \
  v   v
delivered returned
```

### Authorization model

| Action | Admin | Deliveryman |
| --- | --- | --- |
| Authenticate | Yes | Yes |
| Manage deliverymen | Yes | No |
| Manage recipients | Yes | No |
| Manage orders | Yes | No |
| Change user password | Yes | No |
| Pick up order | No | Yes |
| Deliver order with proof | No | Yes |
| Return order | No | Yes |
| List own deliveries | No | Yes |
| List nearby deliveries | No | Yes |

## Quick evaluation

If you want to evaluate the project in a few minutes:

1. Install dependencies
2. Copy the environment files
3. Add JWT keys
4. Bootstrap local services and seed demo data
5. Run the API
6. Open Swagger and test the flows

### Copy env files

Windows PowerShell:

```powershell
Copy-Item .env.example .env
Copy-Item .env.test.example .env.test
```

macOS / Linux:

```bash
cp .env.example .env
cp .env.test.example .env.test
```

### Generate JWT keys

The API uses RS256 and expects the keys to be stored as base64 strings in `.env` and `.env.test`.

macOS / Linux:

```bash
openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -pubout -out public.pem
base64 -w 0 private.pem
base64 -w 0 public.pem
```

Windows PowerShell:

```powershell
openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -pubout -out public.pem
[Convert]::ToBase64String([IO.File]::ReadAllBytes("private.pem"))
[Convert]::ToBase64String([IO.File]::ReadAllBytes("public.pem"))
```

Paste the generated base64 strings into:

- `JWT_PRIVATE_KEY`
- `JWT_PUBLIC_KEY`

### Start the project

```bash
pnpm install
pnpm run bootstrap:local
pnpm run start:dev
```

The API will be available at `http://localhost:3333`.

## Demo credentials

The seed script creates ready-to-use demo accounts:

- Admin: `11111111111 / 123456`
- Deliveryman: `22222222222 / 123456`

It also creates demo recipients and example orders in different states.

## API documentation

- Swagger UI: `http://localhost:3333/docs`
- OpenAPI JSON: `http://localhost:3333/docs/openapi.json`
- Postman collection: [fast-feet-api.postman_collection.json](docs/postman/fast-feet-api.postman_collection.json)

## Swagger preview

The interactive Swagger UI is the fastest way to inspect the contract, test authorization, and validate the main workflows during a live review.

Recommended repository asset:

- `docs/images/swagger-ui.png`

After adding the screenshot, render it here:

```md
![Swagger UI](docs/images/swagger-ui.png)
```

## Main workflows

### 1. Authenticate

```http
POST /auth/login
Content-Type: application/json

{
  "cpf": "11111111111",
  "password": "123456"
}
```

Expected result:

- `200 OK`
- JWT access token for the authenticated user

### 2. Admin creates a recipient

```http
POST /recipients
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "John Doe",
  "cpf": "12345678901",
  "phone": "11999999999",
  "address": "Avenida Brasil, 100",
  "latitude": -23.55052,
  "longitude": -46.633308
}
```

Expected result:

- `201 Created`

### 3. Admin creates an order

```http
POST /orders
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Notebook delivery",
  "recipientId": "<recipient-id>"
}
```

Expected result:

- `201 Created`

### 4. Deliveryman picks up an order

```http
PATCH /orders/:id/pick-up
Authorization: Bearer <deliveryman-token>
```

Expected result:

- `200 OK`
- Order assigned to the authenticated deliveryman

### 5. Deliveryman delivers with proof upload

```bash
curl -X PATCH http://localhost:3333/orders/:id/deliver \
  -H "Authorization: Bearer <deliveryman-token>" \
  -F "file=@proof.jpg"
```

Expected result:

- `200 OK`
- Proof file stored through the configured storage driver

### 6. Deliveryman returns an order

```http
PATCH /orders/:id/return
Authorization: Bearer <deliveryman-token>
```

Expected result:

- `200 OK`

## Business rules covered

- Only admins can manage deliverymen, recipients, and orders
- Only admins can change another user's password
- Only deliverymen can pick up, deliver, and return orders
- Only the assigned deliveryman can finish or return a picked-up order
- An order can only be delivered with a proof image
- Deliverymen can list only their own deliveries
- Recipient notifications are emitted when order status changes

## Quality signals

The project currently validates the main engineering signals expected in a strong backend portfolio piece:

- `pnpm run lint`
- `pnpm run build`
- `pnpm test`
- `pnpm test:e2e`
- `pnpm run test:cov`

Latest local validation result:

- Unit tests: `72 passing`
- E2E tests: `51 passing`
- Coverage: `99.47% statements`, `94.44% branches`, `100% functions`, `99.47% lines`

There is also CI automation in [ci.yml](/c:/Development/fast-feet-api/.github/workflows/ci.yml).

## Scripts

- `pnpm run start:dev`: run the API in watch mode
- `pnpm run build`: compile the application
- `pnpm run test`: run unit tests
- `pnpm run test:e2e`: run E2E tests against PostgreSQL
- `pnpm run test:cov`: run unit tests with coverage
- `pnpm run db:migrate:deploy`: apply Prisma migrations
- `pnpm run db:seed:demo`: seed demo users and sample orders
- `pnpm run bootstrap:local`: start Docker services, run migrations, and seed demo data

## Environment variables

### Core application

| Variable | Required | Example | Purpose |
| --- | --- | --- | --- |
| `PORT` | No | `3333` | HTTP server port |
| `APP_BASE_URL` | No | `http://localhost:3333` | Public base URL for the API |
| `CORS_ORIGIN` | No | `http://localhost:3000` | Allowed frontend origin(s), comma-separated |
| `DATABASE_URL` | Yes | `postgresql://docker:docker@localhost:5432/fast-feet-api?schema=public` | PostgreSQL connection string |
| `JWT_PRIVATE_KEY` | Yes | `base64-encoded-private-key` | RS256 private key used to sign tokens |
| `JWT_PUBLIC_KEY` | Yes | `base64-encoded-public-key` | RS256 public key used to validate tokens |

### Cache and rate limit

| Variable | Required | Example | Purpose |
| --- | --- | --- | --- |
| `REDIS_HOST` | No | `localhost` | Redis host |
| `REDIS_PORT` | No | `6379` | Redis port |
| `REDIS_DB` | No | `0` | Redis database index |
| `RATE_LIMIT_WINDOW_MS` | No | `60000` | Rate limit window in milliseconds |
| `RATE_LIMIT_MAX_REQUESTS` | No | `100` | Max requests per window |

### Storage

| Variable | Required | Example | Purpose |
| --- | --- | --- | --- |
| `STORAGE_DRIVER` | No | `local` | Storage driver: `local` or `r2` |
| `STORAGE_LOCAL_DIR` | No | `data/uploads` | Local upload directory |
| `STORAGE_LOCAL_BASE_URL` | No | `http://localhost:3333/uploads` | Base URL for local uploads |
| `CLOUDFLARE_ACCOUNT_ID` | Only for `r2` | `...` | Cloudflare account identifier |
| `AWS_ENDPOINT_URL` | Optional | `https://...r2.cloudflarestorage.com` | Custom S3-compatible endpoint |
| `AWS_BUCKET_NAME` | Only for `r2` | `fast-feet` | Bucket name |
| `AWS_ACCESS_KEY_ID` | Only for `r2` | `...` | Access key |
| `AWS_SECRET_ACCESS_KEY` | Only for `r2` | `...` | Secret key |
| `UPLOAD_PUBLIC_BASE_URL` | Only for `r2` | `https://cdn.example.com` | Public base URL for uploaded files |

## Project structure

```text
src
|- core
|- domain
|  `- delivery
|     |- application
|     `- enterprise
`- infra
   |- auth
   |- cache
   |- database
   |- http
   |- notification
   `- storage

test
|- factories
|- repositories
|- storage
`- utils
```

## Production-minded defaults

- Configurable CORS allowlist
- Global security headers middleware
- Global request logging middleware
- Rate limiting through a custom guard backed by Nest Throttler
- Local storage driver by default for frictionless demos
- R2/S3-compatible upload support for hosted environments
- Swagger documentation with bearer auth support

## Trade-offs and future improvements

This project intentionally balances realism with simplicity:

- Rate limiting is in-memory, which is fine for demos and small deployments but should move to Redis for horizontal scale
- Notifications are currently logged through a service abstraction; the contract is ready for email, SMS, or queue-based delivery
- Swagger decorators are maintained manually because the HTTP layer uses Zod pipes instead of class-validator DTOs
- Local upload storage keeps the project easy to run locally, while R2 support provides a more production-ready path

## What I wanted to demonstrate

This project was designed to demonstrate:

- Domain-oriented backend design
- Clean separation between business rules and framework code
- Real authorization constraints beyond basic authentication
- Testable architecture with in-memory and integration-friendly adapters
- Pragmatic production thinking without sacrificing developer experience

If you are reviewing this repository as part of a hiring process, the fastest way to evaluate it is to run the demo seed, open Swagger, and test the admin and deliveryman flows end to end.
