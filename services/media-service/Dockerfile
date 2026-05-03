# =============================================================================
# media-service — Multi-stage Dockerfile
# Stage 1 (deps):   Install production dependencies only
# Stage 2 (build):  Compile TypeScript to dist/
# Stage 3 (runner): Minimal Node.js image — copy dist + node_modules
#
# NOTE: If FFmpeg is required at runtime, switch the runner base image to:
#   FROM node:22-alpine AS runner
#   RUN apk add --no-cache ffmpeg
#
# Build:
#   docker build -t society/media-service:latest ./backend/media-service
# Run:
#   docker run -p 3004:3004 --env-file .env society/media-service:latest
# =============================================================================

# ── Stage 1: dependency installation ─────────────────────────────────────────
FROM node:22-alpine AS deps

WORKDIR /app

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn/ .yarn/

COPY backend/media-service/package.json ./backend/media-service/
COPY packages/ ./packages/

RUN yarn workspaces focus @society/media-service --production

# ── Stage 2: build ────────────────────────────────────────────────────────────
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn/ .yarn/

COPY backend/media-service/package.json ./backend/media-service/
COPY packages/ ./packages/

RUN yarn workspaces focus @society/media-service

COPY tsconfig.base.json ./
COPY backend/media-service/ ./backend/media-service/

WORKDIR /app/backend/media-service
RUN yarn build

# ── Stage 3: production runner ────────────────────────────────────────────────
FROM node:22-alpine AS runner

# Install FFmpeg for video frame extraction (BullMQ thumbnail jobs)
RUN apk add --no-cache ffmpeg

RUN addgroup -S society && adduser -S nestjs -G society

WORKDIR /app

ENV NODE_ENV=production

COPY --from=build  /app/backend/media-service/dist ./dist
COPY --from=deps   /app/node_modules ./node_modules
COPY --from=deps   /app/backend/media-service/node_modules ./backend/media-service/node_modules
COPY --from=build  /app/backend/media-service/package.json ./package.json

USER nestjs

EXPOSE 3004

CMD ["node", "dist/main"]
