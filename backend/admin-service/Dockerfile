# =============================================================================
# admin-service — Multi-stage Dockerfile
# Stage 1 (deps):   Install production dependencies only
# Stage 2 (build):  Compile TypeScript to dist/
# Stage 3 (runner): Minimal Node.js image — copy dist + node_modules
#
# Build:
#   docker build -t society/admin-service:latest ./backend/admin-service
# Run:
#   docker run -p 3002:3002 --env-file .env society/admin-service:latest
# =============================================================================

# ── Stage 1: dependency installation ─────────────────────────────────────────
FROM node:22-alpine AS deps

WORKDIR /app

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn/ .yarn/

COPY backend/admin-service/package.json ./backend/admin-service/
COPY packages/ ./packages/

RUN yarn workspaces focus @society/admin-service --production

# ── Stage 2: build ────────────────────────────────────────────────────────────
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn/ .yarn/

COPY backend/admin-service/package.json ./backend/admin-service/
COPY packages/ ./packages/

RUN yarn workspaces focus @society/admin-service

COPY tsconfig.base.json ./
COPY backend/admin-service/ ./backend/admin-service/

WORKDIR /app/backend/admin-service
RUN yarn build

# ── Stage 3: production runner ────────────────────────────────────────────────
FROM node:22-alpine AS runner

RUN addgroup -S society && adduser -S nestjs -G society

WORKDIR /app

ENV NODE_ENV=production

COPY --from=build  /app/backend/admin-service/dist ./dist
COPY --from=deps   /app/node_modules ./node_modules
COPY --from=deps   /app/backend/admin-service/node_modules ./backend/admin-service/node_modules
COPY --from=build  /app/backend/admin-service/package.json ./package.json

USER nestjs

EXPOSE 3002

CMD ["node", "dist/main"]
