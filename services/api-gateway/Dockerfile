# =============================================================================
# api-gateway — Multi-stage Dockerfile
# Stage 1 (deps):   Install production dependencies only
# Stage 2 (build):  Compile TypeScript to dist/
# Stage 3 (runner): Minimal Node.js image — copy dist + node_modules
#
# Build:
#   docker build -t society/api-gateway:latest ./backend/api-gateway
# Run:
#   docker run -p 3000:3000 --env-file .env society/api-gateway:latest
# =============================================================================

# ── Stage 1: dependency installation ─────────────────────────────────────────
FROM node:22-alpine AS deps

WORKDIR /app

# Copy workspace manifests (Yarn Berry committed binary + config)
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn/ .yarn/

# Copy only the manifests needed for this service and its workspace deps
COPY backend/api-gateway/package.json ./backend/api-gateway/
COPY packages/ ./packages/

# Install production deps only (ci-style, respects lockfile)
RUN yarn workspaces focus @society/api-gateway --production

# ── Stage 2: build ────────────────────────────────────────────────────────────
FROM node:22-alpine AS build

WORKDIR /app

# Copy workspace tooling
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn/ .yarn/

# Copy all workspace manifests (needed so Yarn resolves the full graph)
COPY backend/api-gateway/package.json ./backend/api-gateway/
COPY packages/ ./packages/

# Install all deps (including devDependencies) for the build step
RUN yarn workspaces focus @society/api-gateway

# Copy source
COPY tsconfig.base.json ./
COPY backend/api-gateway/ ./backend/api-gateway/

# Compile TypeScript
WORKDIR /app/backend/api-gateway
RUN yarn build

# ── Stage 3: production runner ────────────────────────────────────────────────
FROM node:22-alpine AS runner

# Security: run as non-root
RUN addgroup -S society && adduser -S nestjs -G society

WORKDIR /app

ENV NODE_ENV=production

# Copy compiled output from build stage
COPY --from=build  /app/backend/api-gateway/dist ./dist

# Copy production node_modules from deps stage
COPY --from=deps   /app/node_modules ./node_modules
COPY --from=deps   /app/backend/api-gateway/node_modules ./backend/api-gateway/node_modules

# Copy package.json (needed by NestJS CLI for reflect-metadata & paths)
COPY --from=build  /app/backend/api-gateway/package.json ./package.json

USER nestjs

EXPOSE 3000

# Graceful shutdown: use exec form to forward signals correctly
CMD ["node", "dist/main"]
