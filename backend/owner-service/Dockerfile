# =============================================================================
# owner-service — Multi-stage Dockerfile
# Stage 1 (deps):   Install production dependencies only
# Stage 2 (build):  Compile TypeScript to dist/
# Stage 3 (runner): Minimal Node.js image — copy dist + node_modules
#
# Build:
#   docker build -t society/owner-service:latest ./backend/owner-service
# Run:
#   docker run -p 3001:3001 --env-file .env society/owner-service:latest
# =============================================================================

# ── Stage 1: dependency installation ─────────────────────────────────────────
FROM node:22-alpine AS deps

WORKDIR /app

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn/ .yarn/

COPY backend/owner-service/package.json ./backend/owner-service/
COPY packages/ ./packages/

RUN yarn workspaces focus @society/owner-service --production

# ── Stage 2: build ────────────────────────────────────────────────────────────
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn/ .yarn/

COPY backend/owner-service/package.json ./backend/owner-service/
COPY packages/ ./packages/

RUN yarn workspaces focus @society/owner-service

COPY tsconfig.base.json ./
COPY backend/owner-service/ ./backend/owner-service/

WORKDIR /app/backend/owner-service
RUN yarn build

# ── Stage 3: production runner ────────────────────────────────────────────────
FROM node:22-alpine AS runner

RUN addgroup -S society && adduser -S nestjs -G society

WORKDIR /app

ENV NODE_ENV=production

COPY --from=build  /app/backend/owner-service/dist ./dist
COPY --from=deps   /app/node_modules ./node_modules
COPY --from=deps   /app/backend/owner-service/node_modules ./backend/owner-service/node_modules
COPY --from=build  /app/backend/owner-service/package.json ./package.json

USER nestjs

EXPOSE 3001

CMD ["node", "dist/main"]
