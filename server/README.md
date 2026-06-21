To install dependencies:
```sh
bun install
```

Copy and configure server env:

```sh
cp .env.example .env
```

Set `DATABASE_URL`, `BETTER_AUTH_SECRET`, and other values in `server/.env`. Bun loads it automatically when you run from this directory.

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

