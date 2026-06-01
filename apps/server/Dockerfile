# syntax=docker/dockerfile:1.7

ARG NODE_VERSION=20.19.0
ARG PNPM_VERSION=9.0.0

FROM node:${NODE_VERSION}-bookworm-slim AS base
ARG PNPM_VERSION
ENV PNPM_HOME="/pnpm"
ENV PATH="${PNPM_HOME}:${PATH}"
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc* ./
COPY apps/server/package.json apps/server/package.json
COPY packages/typescript-config/package.json packages/typescript-config/package.json
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile --filter server...

FROM deps AS build
COPY apps/server/tsconfig.json apps/server/prisma.config.ts apps/server/
COPY apps/server/src apps/server/src
COPY apps/server/data apps/server/data
COPY apps/server/prisma apps/server/prisma
COPY packages/typescript-config packages/typescript-config
WORKDIR /app/apps/server
ENV DATABASE_URL="postgresql://quickvoice:quickvoice@localhost:5432/quickvoice"
RUN pnpm exec prisma generate
RUN pnpm run build

FROM node:${NODE_VERSION}-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app/apps/server

RUN apt-get update -y \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

RUN groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 --gid nodejs --home-dir /app server

COPY --from=build --chown=server:nodejs /app/package.json /app/package.json
COPY --from=build --chown=server:nodejs /app/node_modules /app/node_modules
COPY --from=build --chown=server:nodejs /app/apps/server/package.json ./package.json
COPY --from=build --chown=server:nodejs /app/apps/server/dist ./dist
COPY --from=build --chown=server:nodejs /app/apps/server/prisma ./prisma
COPY --from=build --chown=server:nodejs /app/apps/server/prisma.config.ts ./prisma.config.ts
RUN test -x /app/node_modules/.bin/prisma
RUN test -f /app/apps/server/dist/src/index.js

USER server
EXPOSE 8000
CMD ["sh", "-c", "../../node_modules/.bin/prisma migrate deploy && node dist/src/index.js"]
