# FastFeet API

FastFeet API is a REST service for a fictional courier company. It covers authentication, recipient and deliveryman management, order lifecycle control, nearby delivery search, recipient notifications, cache integration, and delivery proof upload.

The project was built to be portfolio-ready: business rules are explicit, RBAC is enforced, tests cover the main flows, and the local setup is short enough to demo live.

## Stack

- Node.js 20+
- NestJS 10
- TypeScript 5
- Prisma 7 with PostgreSQL
- Vitest + Supertest
- Redis
- AWS SDK S3 client for R2/S3-compatible uploads

## Architecture

The codebase follows a Clean Architecture split:

- `src/domain`: entities, value objects, use cases, domain events, contracts
- `src/infra`: HTTP layer, auth, Prisma repositories, cache, storage, env, notification integration
- `src/core`: shared abstractions such as `Either`, entities and domain event plumbing

Business rules stay in the application/domain layer. Controllers translate HTTP input/output and delegate to use cases.

## Main business rules

- Only admins can manage deliverymen, recipients and orders.
- Only admins can move an order back to `waiting`.
- Only deliverymen can pick up, deliver and return orders.
- Only the assigned deliveryman can deliver or return a picked up order.
- Delivery confirmation requires a multipart image upload.
- Deliverymen can only list their own deliveries.
- Recipient notifications are fired on order status changes.

## Local setup

1. Copy the environment file.

```bash
cp .env.example .env
cp .env.test.example .env.test
```

2. Fill the JWT keys in `.env` and `.env.test`.

3. Start local services and seed demo data.

```bash
pnpm install
pnpm run bootstrap:local
pnpm run start:dev
```

The API runs at `http://localhost:3333`.

## Demo credentials

- Admin: `11111111111 / 123456`
- Deliveryman: `22222222222 / 123456`

## API docs

- Human-friendly docs: `http://localhost:3333/docs`
- OpenAPI contract: `http://localhost:3333/docs/openapi.json`
- Postman collection: [docs/postman/fast-feet-api.postman_collection.json](/c:/Development/fast-feet-api/docs/postman/fast-feet-api.postman_collection.json)

## Core flows

### Authenticate

```http
POST /auth/login
Content-Type: application/json

{
  "cpf": "11111111111",
  "password": "123456"
}
```

### Deliver with file upload

```bash
curl -X PATCH http://localhost:3333/orders/:id/deliver \
  -H "Authorization: Bearer <token>" \
  -F "file=@proof.jpg"
```

### Return an order

```http
PATCH /orders/:id/return
Authorization: Bearer <deliveryman-token>
```

## Scripts

- `pnpm run start:dev`: run the API in watch mode
- `pnpm run test`: run unit tests
- `pnpm run test:e2e`: run E2E tests with direct SQL schema setup
- `pnpm run test:cov`: generate coverage
- `pnpm run db:seed:demo`: seed demo users and sample orders
- `pnpm run bootstrap:local`: start Docker services, apply migrations and seed demo data

## Testing

- Unit tests cover the application layer and key negative cases.
- E2E tests cover authentication, RBAC, transitions, multipart delivery proof upload and deterministic database reset.
- Coverage reports are generated with `pnpm run test:cov`.

## Production-minded defaults

- Configurable CORS allowlist
- Global security headers middleware
- In-memory rate limiting for API protection
- Local storage driver by default, R2-compatible upload support when `STORAGE_DRIVER=r2`

## Known trade-offs

- Rate limiting is in-memory, which is enough for demo and small deployments but should move to Redis for horizontal scale.
- The project serves a static OpenAPI contract instead of generating Swagger dynamically because the current workspace does not include Swagger packages.
- Local upload storage is the default for easier demos; use R2/S3-compatible storage in hosted environments.
