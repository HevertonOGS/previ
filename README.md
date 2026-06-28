# Previ

Personal finance management application built to replace a manual Notion-based workflow. Previ centralizes income tracking, expense management, weekly budget analysis, and savings goals into a single web application with automated calculations and data import capabilities.

## Tech Stack

| Layer | Technology |
|---|---|
| Monorepo | NX 23 |
| Backend | NestJS 11 |
| ORM | Prisma 7 (PostgreSQL adapter) |
| Database | PostgreSQL 17 |
| Frontend | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| API | REST |

## Project Structure

```
previ/
├── apps/
│   ├── api/          # NestJS REST API + Prisma
│   └── web/          # Next.js frontend
├── libs/
│   ├── shared-types/ # Shared TypeScript interfaces and DTOs
│   └── ui/           # Reusable React components
├── prisma.config.ts  # Prisma CLI configuration
├── docker-compose.yml
└── nx.json
```

## Prerequisites

- **Node.js** >= 24
- **Docker** (for PostgreSQL)
- **npm**

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start the database

```bash
npm run db:up
```

This starts a PostgreSQL container on port `5432` with database `previ`.

### 3. Run migrations

```bash
npm run prisma:migrate
```

### 4. Generate Prisma Client

```bash
npm run prisma:generate
```

### 5. Start the applications

In separate terminals:

```bash
# API (http://localhost:3000)
npx nx serve api

# Web (http://localhost:4200)
npx nx dev web
```

## Available Scripts

| Script | Description |
|---|---|
| `npm run db:up` | Start PostgreSQL via Docker Compose |
| `npm run db:down` | Stop PostgreSQL |
| `npm run prisma:migrate` | Create and apply database migrations |
| `npm run prisma:generate` | Regenerate Prisma Client |
| `npm run prisma:studio` | Open Prisma Studio (database GUI) |
| `npx nx serve api` | Start the NestJS API in dev mode |
| `npx nx dev web` | Start the Next.js frontend in dev mode |
| `npx nx build api` | Build the API for production |
| `npx nx build web` | Build the frontend for production |
| `npx nx graph` | Visualize the project dependency graph |

## Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://previ:previ@localhost:5432/previ?schema=public"
```

The API app also has its own `.env` at `apps/api/.env` for runtime configuration.
