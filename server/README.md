To install dependencies:
```sh
bun install
```

Set `DATABASE_URL` and auth env vars in your environment (see repo root `.env.example`). For local Docker Postgres:

```sh
export DATABASE_URL=postgresql://fnnpay:YOUR_PASSWORD@localhost:5432/fnnpay
export BETTER_AUTH_SECRET=$(openssl rand -hex 32)
export BETTER_AUTH_URL=http://localhost:3001
export BETTER_AUTH_TRUSTED_ORIGINS=http://localhost:3000
```

For Neon, use the pooled connection string from your Neon project dashboard.

To run:
```sh
bun run dev
```

Auth endpoints are served at `/api/auth/*` (Better Auth with email/password).

Database commands (requires `DATABASE_URL`):

```sh
bun run db:generate   # generate migrations from schema
bun run db:migrate    # apply migrations
bun run db:push       # push schema directly (dev)
bun run db:studio     # open Drizzle Studio
```

Add tables in `src/db/schema/index.ts`, then generate and apply migrations.

