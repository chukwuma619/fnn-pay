To install dependencies:
```sh
bun install
```

Set `DATABASE_URL` in your environment (see repo root `.env.example`). For local Docker Postgres:

```sh
export DATABASE_URL=postgresql://fnnpay:YOUR_PASSWORD@localhost:5432/fnnpay
```

For Neon, use the pooled connection string from your Neon project dashboard.

To run:
```sh
bun run dev
```

Database commands (requires `DATABASE_URL`):

```sh
bun run db:generate   # generate migrations from schema
bun run db:migrate    # apply migrations
bun run db:push       # push schema directly (dev)
bun run db:studio     # open Drizzle Studio
```

Add tables in `src/db/schema/index.ts`, then generate and apply migrations.

