# Practice365

A SaaS platform for daily practice management — built as a TypeScript monorepo.

## Technology Stack

| Layer       | Technology                       |
| ----------- | -------------------------------- |
| Runtime     | Node.js 20+                      |
| Language    | TypeScript 5.x                   |
| API         | Express                          |
| Frontend    | React + Vite + Tailwind CSS      |
| Database    | MongoDB (Mongoose)               |
| Worker      | Node.js                          |
| Monorepo    | npm workspaces                   |

## Monorepo Structure

```
practice365/
├── apps/
│   ├── api/              # REST API server
│   ├── web/              # React frontend
│   └── worker/           # Background job processor
├── packages/
│   ├── config/           # Shared configuration
│   ├── types/            # Shared TypeScript types
│   ├── ui/               # Shared UI components
│   ├── utils/            # Shared utilities
│   └── validation/       # Shared validation schemas
├── scripts/              # Development and build scripts
├── docs/                 # Project documentation
├── infrastructure/       # Docker, deployment, CI/CD
├── package.json
├── tsconfig.base.json
└── .editorconfig
```

## Applications

### `apps/api`

REST API server handling authentication, data persistence, and business logic.

### `apps/web`

React single-page application powered by Vite. Provides the end-user interface.

### `apps/worker`

Background job processor for scheduled tasks, notifications, and async workloads.

## Shared Packages

| Package                   | Description                              |
| ------------------------- | ---------------------------------------- |
| `@practice365/config`     | Environment and runtime configuration    |
| `@practice365/types`      | Shared TypeScript type definitions       |
| `@practice365/ui`         | Reusable UI components                   |
| `@practice365/utils`      | Common utility functions                 |
| `@practice365/validation` | Shared validation schemas and utilities  |

## Documentation

Project documentation lives in the `docs/` directory:

| Directory             | Description                                              |
| --------------------- | -------------------------------------------------------- |
| `00-foundation`       | Engineering principles, conventions, standards           |
| `01-architecture`     | System, repository, and deployment architecture          |
| `02-specifications`   | Engineering Specifications (ES) for features/modules     |
| `03-database`         | Database architecture, schemas, indexing strategy        |
| `04-api`              | API standards, endpoints, integration contracts          |
| `05-decisions`        | Architecture Decision Records (ADR)                      |
| `06-diagrams`         | System diagrams, workflows, visual documentation         |

## Getting Started

### Prerequisites

- Node.js ≥ 20
- MongoDB running locally or a connection string

### Installation

```sh
npm install
```

### Environment Setup

```sh
cp .env.example .env
# Fill in the required values
```

### Running the Backend

```sh
npm run dev:api
```

### Running the Frontend

```sh
npm run dev:web
```

### Running the Worker

```sh
npm run dev:worker
```

## Scripts

| Command              | Description                        |
| -------------------- | ---------------------------------- |
| `npm run dev:api`    | Start the API server in dev mode   |
| `npm run dev:web`    | Start the web app in dev mode      |
| `npm run dev:worker` | Start the worker in dev mode       |
| `npm run build`      | Build all workspaces               |
| `npm run clean`      | Remove all build artifacts         |
| `npm run lint`       | Lint all workspaces                |
| `npm run typecheck`  | Type-check all workspaces          |

## License

Private — All rights reserved.
