# SplitNest 

The Ultimate Roommate Operating System. Financial harmony for shared living. Split expenses, manage chores, and track bills effortlessly.

## Architecture

SplitNest is a modern monorepo built with Turborepo:
- **Frontend (Web)**: Next.js 14, React, TailwindCSS, Framer Motion, shadcn/ui.
- **Backend (API)**: NestJS, Prisma ORM, PostgreSQL.
- **Authentication**: Clerk.
- **Billing**: Stripe.
- **AI**: Vercel AI SDK + OpenAI GPT-4o.

## Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm install -g pnpm
pnpm install
```

### 2. Environment Variables
Create `.env` files in both `apps/web` and `apps/api`.
- `apps/web/.env.local` needs `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, and `OPENAI_API_KEY`.
- `apps/api/.env` needs `DATABASE_URL` and `STRIPE_SECRET_KEY`.

### 3. Database Setup
```bash
cd apps/api
npx prisma generate
npx prisma db push
```

### 4. Run the Stack
```bash
npm run dev
```

## Production Deployment (Docker)
To run the entire stack in production mode using Docker Compose:
```bash
docker-compose up --build -d
```
The application will be available at `http://localhost:3000` and the API at `http://localhost:4000`. Swagger documentation is available at `http://localhost:4000/api/docs`.
