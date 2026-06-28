# 002 - Module Architecture

**Document ID:** 002

**Document Name:** Module Architecture

**Status:** Draft

---

# 1. Purpose

This document defines the standard architecture for every business module within Practice365.

Every module must follow the same internal structure to ensure consistency, maintainability, discoverability and AI-assisted development.

This architecture applies to both backend and frontend modules.

---

# 2. Design Principles

Every module should:

- Have a single business responsibility.
- Own its own implementation.
- Minimize dependencies on other modules.
- Be independently understandable.
- Be independently testable.
- Be independently replaceable.

---

# 3. Backend Module Structure

Every backend module follows the same directory structure.

```
modules/

<module-name>/

    controller/

    service/

    repository/

    validation/

    routes/

    schemas/

    types/

    constants/

    middleware/

    utils/

    tests/

    index.ts
```

Business-specific folders may be added if necessary.

---

# 4. Responsibilities

## Controller

Responsible for

- HTTP Requests
- HTTP Responses
- Calling Services

Controllers must never contain business logic.

---

## Service

Responsible for

- Business rules
- Workflows
- State transitions
- Validation orchestration
- Cross-module coordination

Services contain the core business logic.

---

## Repository

Responsible for

- MongoDB queries
- Persistence
- Aggregation pipelines
- Database transactions

Repositories must not contain business logic.

---

## Validation

Responsible for

- Request validation
- Type validation
- Input schemas

Validation occurs before service execution.

---

## Routes

Responsible for

- Express route definitions
- Middleware registration
- Controller mapping

---

## Schemas

Responsible for

- Mongoose schemas
- Indexes
- Relationships

Business rules belong in services, not schemas.

---

## Types

Contains

- Types
- Interfaces
- Enums
- Shared module types

---

## Constants

Contains

- Enums
- Default values
- Module constants

---

## Middleware

Contains middleware specific to the module.

Examples

- Ownership validation
- Permission middleware
- Resource loading

---

## Utils

Contains helper functions used only by this module.

Shared utilities belong in packages/utils.

---

## Tests

Contains

- Unit Tests
- Integration Tests

---

# 5. Frontend Module Structure

Every frontend module follows the same structure.

```
modules/

<module-name>/

    pages/

    components/

    hooks/

    api/

    schemas/

    types/

    utils/

    constants/

    tests/

    index.ts
```

---

# 6. Frontend Responsibilities

## Pages

Represent application screens.

Pages orchestrate components.

Business logic should not exist here.

---

## Components

Reusable UI components for the module.

Components should be as stateless as practical.

---

## Hooks

Contain module-specific React hooks.

Examples

```
useLogin()

useCreateMatter()

useInvoices()
```

---

## API

Contains API communication.

Frontend should never call fetch or axios directly outside this layer.

---

## Schemas

Contains frontend validation schemas.

---

## Types

Contains frontend-only interfaces.

Shared interfaces belong in packages/types.

---

## Utils

Contains helper functions used only by this module.

---

## Constants

Contains

- Labels
- Configuration
- Static module values

---

## Tests

Contains

- Component tests
- Hook tests
- Integration tests

---

# 7. Dependency Rules

Modules may depend on

- Shared Packages
- Foundation Services
- Infrastructure

Modules should avoid directly depending on unrelated business modules.

When cross-module interaction is required, communication should occur through clearly defined services.

---

# 8. Ownership

Each module owns

- Database schema
- API endpoints
- Validation
- UI
- Tests
- Documentation

No other module should modify another module's internal implementation.

---

# 9. Shared Packages

Use shared packages only when functionality is reused across multiple modules.

Avoid extracting code prematurely.

Common examples include

- UI components
- Validation utilities
- Shared types
- Configuration
- Utility functions

---

# 10. Testing Requirements

Every module must include

- Unit tests
- Integration tests

Business-critical modules should also include end-to-end test scenarios.

---

# 11. Module Lifecycle

Every module follows the same lifecycle.

```
Specification

↓

Review

↓

Approval

↓

Implementation

↓

Testing

↓

Code Review

↓

Merge

↓

Maintenance
```

No implementation begins before the Module PRD is approved.

---

# 12. Module Review Checklist

Before approving a module verify

- Folder structure follows this document.
- Responsibilities are clearly separated.
- Business logic exists only in services.
- Database logic exists only in repositories.
- Validation is isolated.
- Tests exist.
- Shared packages are reused appropriately.
- Module documentation is complete.