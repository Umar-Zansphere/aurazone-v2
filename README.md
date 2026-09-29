# AuraZone V2

AuraZone V2 is a modern, high-performance, full-stack e-commerce platform built as a monorepo using **Turborepo** and **pnpm**.

## 🏗️ Architecture & Tech Stack

This project is structured as a monorepo containing multiple apps and shared packages.

### Apps

- `apps/api`: **Fastify** backend server (REST API, Redis, BullMQ).
- `apps/customer`: **Next.js** storefront for end-users.
- `apps/admin`: **Next.js** dashboard for store managers and super admins.

### Shared Packages (`packages/*`)

- `@aurazone/database`: **Prisma ORM** schema, migrations, seeds, and typed client.
- `@aurazone/ui`: Shared React component library (Tailwind, Radix UI).
- `@aurazone/validators`: **Zod** validation schemas shared between frontend and backend.
- `@aurazone/api-client`: Shared API fetching logic.
- `@aurazone/utils`: Shared utility functions.
- `@aurazone/config-tailwind`: Shared Tailwind CSS configuration.
- `@aurazone/config-eslint`: Shared ESLint configurations.
- `@aurazone/typescript-config`: Base `tsconfig.json` files.

---

## 🚀 Getting Started Locally

### 1. Prerequisites
- **Node.js** (v20 or higher)
- **pnpm** (v9+)
- **PostgreSQL** database
- **Redis** server

### 2. Installation

Clone the repository and install all dependencies from the root:

```sh
pnpm install
```

### 3. Environment Variables

You need to create a `.env` file in the root directory. You can copy the provided example:

```sh
cp .env.example .env
```

Make sure to update `.env` with your local PostgreSQL and Redis credentials.

You will also need `.env.local` files inside the frontend apps (`apps/admin` and `apps/customer`) containing:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

### 4. Database Setup

Run the following commands to generate the Prisma client, apply migrations, and seed the database with initial data:

```sh
pnpm run db:generate
pnpm run db:migrate:dev
pnpm run db:seed
```

### 5. Running the Development Servers

Use Turborepo to start the API, Admin, and Customer apps simultaneously:

```sh
pnpm run dev
```

- API Server: `http://localhost:4000`
- Customer App: `http://localhost:3000`
- Admin App: `http://localhost:3001`

---

## 📦 Deployment Guide

### Backend (Render - Web Service)

1. Connect your GitHub repository to Render and create a new **Web Service**.
2. **Environment**: Node
3. **Root Directory**: *(leave blank)*
4. **Build Command**:
   ```bash
   pnpm install --prod=false && pnpm --filter @aurazone/database db:generate && pnpm --filter @aurazone/database db:migrate && pnpm --filter @aurazone/database db:seed && pnpm run build
   ```
5. **Start Command**:
   ```bash
   pnpm --filter @aurazone/api start
   ```
6. **Environment Variables**:
   - Add all your production secrets (e.g., `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, etc.)
   - Set `NODE_ENV` to `production`
   - Set `PNPM_VERSION` to `9.12.0`
   - Set `CUSTOMER_URL` and `ADMIN_URL` to your Vercel frontend URLs for proper CORS handling.

### Frontends (Vercel)

Create two separate projects in Vercel, pointing to the same repository.

#### Customer App
- **Root Directory**: `apps/customer`
- **Framework Preset**: Next.js
- **Install Command**: `pnpm install`
- **Environment Variables**:
  - `NEXT_PUBLIC_API_URL`: `https://your-render-backend.onrender.com/api/v1`

#### Admin App
- **Root Directory**: `apps/admin`
- **Framework Preset**: Next.js
- **Install Command**: `pnpm install`
- **Environment Variables**:
  - `NEXT_PUBLIC_API_URL`: `https://your-render-backend.onrender.com/api/v1`

---

## 🛠️ Useful Commands

- `pnpm run build` - Builds all apps and packages.
- `pnpm run lint` - Lints the entire monorepo.
- `pnpm run check-types` - Runs TypeScript type checking across all packages.
- `pnpm run db:studio` - Opens Prisma Studio to view and edit your database visually.
