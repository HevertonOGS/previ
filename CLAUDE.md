# Previ — Project Context

## What is Previ

Previ is a personal finance management web application. It replaces a manual workflow previously done in Notion, where income, expenses, weekly budgets, and savings goals were tracked across multiple database tables updated by hand.

The application aims to automate calculations (weekly balances, budget tracking), reduce manual data entry (via bank statement imports), and provide financial analysis and predictability through historical data.

## Tech Stack

- **Monorepo**: NX 23
- **Backend**: NestJS 11 (REST API)
- **ORM**: Prisma 7 with `@prisma/adapter-pg` (PostgreSQL)
- **Database**: PostgreSQL 17 (Docker Compose for local dev)
- **Frontend**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Config**: `prisma.config.ts` at root (loads `.env` via `dotenv`)

## Project Structure

- `apps/api/` — NestJS backend. Domain modules go in `src/modules/`. Prisma schema at `prisma/schema.prisma`.
- `apps/web/` — Next.js frontend. App Router with feature-based route groups.
- `libs/shared-types/` — Shared TypeScript interfaces and DTOs used by both api and web.
- `libs/ui/` — Reusable React component library (design system primitives).

## Domain Model

- **Period** — A monthly period grouping all financial data for that month.
- **Income** — Expected and actual income entries (salary, benefits, loans receivable).
- **GeneralExpense** — Predictable expenses planned before or during the month (rent, utilities, subscriptions).
- **CurrentExpense** — Day-to-day expenses that occur during the month (groceries, delivery, transport).
- **WeeklyBalance** — Automatically calculated weekly summaries, broken down by expense type and category.
- **Goal / GoalEntry** — Savings goals with monthly planned vs actual tracking.
- **ExpenseType** — Budget dimension: Fixed Costs, Financial Freedom, Comfort, Pleasures, Knowledge.
- **Category** — Thematic dimension: Housing, Food, Pet, Health, Transport, etc.

## Key Commands

```bash
npm run db:up              # Start PostgreSQL
npm run prisma:migrate     # Run database migrations
npm run prisma:generate    # Regenerate Prisma Client
npx nx serve api           # Start API (port 3000)
npx nx dev web             # Start frontend (port 4200)
```

## Conventions

- All code and comments in English.
- **TDD (Test-Driven Development)**: Write tests first, then implement. For each module: create DTOs → write service tests → implement service → write controller tests → implement controller.
- **Access modifiers**: Always declare explicit `public`, `private`, or `protected` on all class members and methods.
- **DTO properties**: Always use the definite assignment assertion (`!`) on DTO class properties (e.g., `name!: string`) to satisfy TypeScript strict mode without constructors.
- NestJS modules follow the pattern: module → controller → service → dto.
- Prisma schema is the single source of truth for the database.
- Shared types between api and web go in `libs/shared-types`.
- UI primitives go in `libs/ui`; feature-specific components go in `apps/web/src/components/features/`.
- **Responsive design**: All pages must be usable on smartphones. Use Tailwind responsive prefixes (`sm:`, `md:`, `lg:`) and avoid fixed widths that break on small screens. Test layouts at mobile width before considering a page complete.
- **Security and scalability**: Always design and implement features with security and scalability in mind. Validate and sanitize all inputs at API boundaries, avoid exposing sensitive data, follow least-privilege access patterns, and prefer queries/patterns that scale with data volume (pagination, indexing, avoiding N+1 queries) over shortcuts that only work for small datasets.
