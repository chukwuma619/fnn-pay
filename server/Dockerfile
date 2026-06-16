FROM oven/bun:1.2-alpine AS base
WORKDIR /app
COPY package.json package-lock.json* bun.lock* ./
RUN bun install --frozen-lockfile 2>/dev/null || bun install
COPY . .

FROM base AS dev
ENV NODE_ENV=development
EXPOSE 3001
CMD ["bun", "run", "--hot", "src/index.ts"]

FROM base AS production
ENV NODE_ENV=production
EXPOSE 3001
CMD ["bun", "run", "src/index.ts"]
