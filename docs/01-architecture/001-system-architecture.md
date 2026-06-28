# 001 - System Architecture

**Document ID:** 001

**Document Name:** System Architecture

**Status:** Draft

---

# 1. Purpose

This document defines the overall architecture of the Practice365 platform.

It establishes the high-level structure of the repository, applications, shared packages, architectural boundaries, and interaction patterns between different parts of the system.

Every module implemented within Practice365 must conform to this architecture.

---

# 2. Architectural Goals

The architecture is designed to achieve the following goals:

- Scalability
- Maintainability
- Modularity
- Testability
- Security
- Clear separation of responsibilities
- AI-assisted development
- Long-term extensibility

---

# 3. High-Level Architecture

Practice365 follows a Monorepo architecture.

The repository contains multiple applications and shared packages.

```
Practice365
│
├── apps
│     ├── api
│     ├── web
│     └── worker
│
├── packages
│
├── infrastructure
│
├── docs
│
└── scripts
```

Each application has a clearly defined responsibility.

---

# 4. Applications

## API

Technology

- Node.js
- Express
- TypeScript
- MongoDB

Responsibilities

- Business Logic
- REST APIs
- Authentication
- Authorization
- Database access
- Integrations
- Background job scheduling

The API is the single source of truth.

---

## Web

Technology

- React
- Vite
- TypeScript
- Tailwind CSS

Responsibilities

- User Interface
- Forms
- Dashboards
- API Consumption
- Client-side routing
- State management

The frontend contains presentation logic only.

Business rules remain in the backend.

---

## Worker

Responsibilities

- Scheduled jobs
- Queue processing
- Email delivery
- Notifications
- Cleanup jobs
- Future asynchronous processing

Workers never expose HTTP APIs.

---

# 5. Shared Packages

The repository contains reusable packages.

## config

Shared configuration.

---

## types

Shared TypeScript types.

---

## validation

Shared validation schemas.

---

## utils

Shared helper functions.

---

## ui

Reusable UI components.

---

# 6. Architectural Layers

The system follows layered architecture.

```
React UI

↓

API

↓

Business Services

↓

Repositories

↓

MongoDB
```

Each layer has a clearly defined responsibility.

---

# 7. Backend Architecture

The backend follows Feature-First Architecture.

```
modules/

auth/

users/

firms/

leads/

clients/

matters/

billing/
```

Each module owns its own implementation.

---

Each module contains

```
controller

service

repository

validation

types

constants

routes
```

Business-specific additions are allowed where necessary.

---

# 8. Frontend Architecture

The frontend also follows Feature-First Architecture.

```
modules/

auth/

dashboard/

clients/

matters/

billing/
```

Each module contains

```
pages

components

hooks

api

schemas

types
```

Shared components belong in the shared folders.

---

# 9. Shared Ownership

Business logic belongs only in the API.

Frontend modules never duplicate backend business rules.

Shared packages contain reusable code only.

---

# 10. Module Independence

Every business module should be independently understandable.

Modules should expose well-defined interfaces.

Avoid tight coupling between unrelated modules.

Dependencies between modules should be explicit.

---

# 11. Data Flow

```
User

↓

React UI

↓

API Request

↓

Controller

↓

Service

↓

Repository

↓

MongoDB

↓

Repository

↓

Service

↓

Controller

↓

API Response

↓

React UI
```

Every request follows the same flow.

---

# 12. Cross-Cutting Concerns

The following concerns span multiple modules.

- Authentication
- Authorization
- Validation
- Logging
- Audit
- Notifications
- Timeline
- Error Handling

These should be implemented consistently across the platform.

---

# 13. Repository Principles

The repository is organized by business capability rather than technical layer.

Documentation evolves alongside code.

Shared functionality should be extracted into packages only when reused.

Avoid premature abstraction.

---

# 14. AI Development

The repository is intentionally optimized for AI-assisted development.

Each module should:

- Have a single implementation specification.
- Be independently understandable.
- Minimize hidden dependencies.
- Clearly define ownership.
- Be testable in isolation.

---

# 15. Architecture Review Checklist

Before introducing a new module verify:

- The module has a clear responsibility.
- Ownership is well defined.
- Business logic remains in the backend.
- Dependencies are explicit.
- Shared packages are reused where appropriate.
- No architectural principles are violated.