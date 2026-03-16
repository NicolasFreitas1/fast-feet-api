# FastFeet API Engineering Decisions

## Context

FastFeet API is a backend for a courier company that needs strict delivery workflows, clear authorization boundaries, and enough engineering depth to demonstrate more than CRUD.

The goal of this project was to model a realistic delivery operation while keeping the codebase approachable for local development, live demos, and technical evaluation.

## Problem

Design a backend for a courier company where:

- admins manage deliverymen, recipients, and orders
- deliverymen interact only with deliveries assigned to them
- orders move through explicit lifecycle transitions
- proof of delivery must be uploaded and validated
- recipients are notified when delivery status changes

This creates a system that is operationally simple on the surface, but full of backend decisions around permissions, ownership, state transitions, and infrastructure boundaries.

## Main Challenges

### 1. Role-based permissions

The API has two main actors: `admin` and `deliveryman`.

The challenge was not only authenticating users, but enforcing that each role sees and executes only the operations allowed by the business:

- admins can create, edit, list, and delete recipients, deliverymen, and orders
- admins can change another user's password
- deliverymen can pick up, deliver, return, and list only their own deliveries

This was implemented with a layered approach:

- HTTP guards block unauthorized roles at the framework boundary
- use cases still validate business permissions when ownership or order state matters

That second validation matters because authorization is not only about role, but also about business context.

### 2. Delivery lifecycle transitions

Orders are not generic records. They follow a controlled lifecycle:

`waiting -> pickedUp -> delivered`

and can also move to:

`pickedUp -> returned`

Each transition has business constraints:

- only `waiting` orders can be picked up
- only `pickedUp` orders can be delivered
- only the assigned deliveryman can deliver or return a picked-up order
- delivering an order requires a proof image URL

Instead of spreading these rules across controllers, the transitions are modeled in the domain and enforced by use cases. This makes the workflow easier to test and harder to bypass accidentally.

### 3. File upload validation

Proof of delivery is part of the workflow, so upload handling could not be treated as a generic attachment feature.

The system validates uploads before storage:

- accepted MIME types: `image/jpeg`, `image/png`, `image/webp`
- maximum file size: `5 MB`

This reduces invalid data entering the system and keeps the delivery flow deterministic.

### 4. Delivery ownership rules

A major business rule is that deliverymen must not interact with orders belonging to someone else.

That means the system must enforce:

- delivery listing scoped to the authenticated deliveryman
- delivery completion restricted to the current owner of the order
- return actions restricted to the same owner
- nearby delivery listing filtered for available work in the deliveryman's area

This is one of the parts that turns the project into a stronger case study, because it demonstrates ownership validation instead of only role validation.

## Architecture

### Clean Architecture

The codebase is organized to keep business rules independent from NestJS, Prisma, and storage details.

Current layers:

- `src/core`: shared primitives such as entities, `Either`, IDs, and domain event plumbing
- `src/domain`: enterprise entities, use cases, repository contracts, storage contracts, notification contracts
- `src/infra`: controllers, auth, Prisma repositories, storage implementations, notification implementation, cache, and environment wiring
- `test`: in-memory repositories, fakes, factories, and E2E helpers

That separation makes it possible to test the core logic without depending on HTTP or the database.

### Domain Events

Order status changes emit domain events such as:

- `OrderCreatedEvent`
- `OrderPickedUpEvent`
- `OrderDeliveredEvent`
- `OrderReturnedEvent`
- `OrderMarkedAsWaitingEvent`

These events trigger notification subscribers without coupling the order lifecycle directly to notification delivery.

This decision keeps the core use cases focused on business transitions while still allowing side effects such as recipient notifications.

### Repository Pattern

Use cases depend on repository contracts instead of Prisma directly.

Examples:

- `OrdersRepository`
- `RecipientsRepository`
- `DeliverymenRepository`
- `AdminsRepository`

Benefits of this choice:

- unit tests can use in-memory repositories
- Prisma remains an infrastructure detail
- business rules are easier to evolve without rewriting controllers

### Storage Abstraction

Proof-of-delivery uploads use the `StorageUploader` contract.

Current implementations:

- local storage uploader for frictionless local development
- R2/S3-compatible uploader for hosted environments

This gives the project a pragmatic default while preserving a clear production migration path.

## Testing Strategy

### Unit tests for use cases

The application layer is heavily covered with unit tests around:

- authentication
- recipient, order, and deliveryman management
- delivery pickup, delivery completion, and return flows
- upload validation
- nearby order listing
- password changes

Because use cases depend on contracts, tests run fast with in-memory repositories, fake hashers, fake uploaders, and fake notification senders.

### End-to-end tests for main flows

The HTTP layer is also covered with E2E tests for the core flows:

- authentication
- CRUD for recipients and deliverymen
- order creation and editing
- pickup, delivery, and return flows
- nearby delivery listing
- password changes

This ensures the public contract behaves correctly with real NestJS modules, Prisma, auth guards, and request validation.

### Deterministic database reset

One important decision was making the E2E suite deterministic.

The test setup resets persisted state by:

- truncating database tables between runs
- flushing the Redis test database when available
- removing uploaded test files from local storage

This avoids flaky tests caused by leftover state and makes the suite safer to trust in CI and local development.

## Production-minded Decisions

The project intentionally includes a few practical backend concerns that often get skipped in portfolio work:

- JWT authentication with RS256 keys
- request logging middleware
- security headers middleware
- configurable CORS allowlist
- global rate limiting
- Swagger/OpenAPI documentation
- cache integration through Redis-ready abstractions

These choices help position the repository as an engineering project, not only a feature demo.

## Trade-offs

### In-memory rate limiting

Rate limiting is applied globally, but the current strategy is still process-local.

Why this was acceptable:

- simpler local setup
- enough for demos and small deployments
- keeps operational complexity low

Trade-off:

- not ideal for horizontal scaling
- a distributed limiter backed by Redis would be the next step for production

### Local storage by default

Uploads default to local disk storage.

Why this was acceptable:

- easier reviewer setup
- no cloud account required to run the project
- faster onboarding for portfolio evaluation

Trade-off:

- local files are not ideal for distributed or containerized production environments
- object storage should be preferred in hosted deployments

### Logged notifications instead of real delivery channels

Notifications are abstracted behind a contract, but the current implementation logs delivery status changes.

Why this was acceptable:

- demonstrates the event-driven design without adding third-party messaging complexity
- keeps the project runnable by any reviewer

Trade-off:

- real email, SMS, or queue integrations would be needed for a production system

## What This Project Demonstrates

FastFeet API was designed to show backend engineering signals that hiring teams usually care about:

- business rules modeled explicitly instead of hidden in controllers
- authorization beyond simple login
- ownership validation for sensitive actions
- clean separation between domain logic and infrastructure
- testability with both unit and E2E coverage
- pragmatic trade-offs with a clear path to production hardening

## Conclusion

This project works well as an engineering case study because it shows decisions, constraints, and trade-offs, not only endpoints.

The most important message is: the backend was designed around workflow integrity.

That is what connects RBAC, order transitions, upload validation, storage abstraction, domain events, and deterministic tests into a single coherent system.
