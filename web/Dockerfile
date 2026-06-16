FROM oven/bun:1.2-alpine AS base
WORKDIR /app
COPY package.json package-lock.json* bun.lock* ./
RUN bun install --frozen-lockfile 2>/dev/null || bun install
COPY . .

FROM base AS dev
ENV NODE_ENV=development
EXPOSE 3000
CMD ["bun", "run", "dev", "--host", "0.0.0.0", "--port", "3000"]

FROM base AS production
ENV NODE_ENV=production
RUN bun run build
EXPOSE 3000
CMD ["bun", "run", "preview", "--host", "0.0.0.0", "--port", "3000"]
