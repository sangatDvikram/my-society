# Society Management and Logging System

[![CI](https://github.com/<ORG>/<REPO>/actions/workflows/ci.yml/badge.svg)](https://github.com/<ORG>/<REPO>/actions/workflows/ci.yml)

> A multi-tenant SaaS platform that digitises the end-to-end operations of residential housing societies — visitor logging, maintenance, payments, rentals, facilities, events, and annual financial audits.

**PRD Version:** 1.0.0 · **Status:** Draft · **Stack:** Lerna monorepo · NestJS · React Native · Next.js + React · PostgreSQL · AWS

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
  - [Client Applications](#client-applications)
  - [Backend Microservices](#backend-microservices)
  - [Shared Packages](#shared-packages)
- [Tech Stack](#tech-stack)
- [Core Modules](#core-modules)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [License](#license)

---

## Overview

The **Society Management and Logging System** replaces paper-based visitor registers, manual maintenance tracking, and fragmented communication channels with a unified, auditable, and GDPR-compliant digital platform.

Key design principles:

- **Multi-tenancy** — a single deployment serves multiple societies; data is isolated at the `society_id` level throughout the database and API layers.
- **GDPR compliance** — soft-delete with 90-day anonymisation, AES-256-GCM encryption for all PII (phone numbers, PAN, bank account numbers), and explicit data-erasure workflows.
- **Security-first** — phone numbers stored as dual columns (AES ciphertext + HMAC-SHA256 hash for lookups), AWS KMS for key management, and S3 pre-signed URLs for all document access.
- **Cross-platform** — every user-facing application ships as both a **React Native (Expo)** mobile app and a **Next.js + React** web dashboard.

---

## Architecture

### Client Applications

| Application | Audience | Platforms |
|---|---|---|
| **Owner App** | Flat residents / owners | React Native (Expo) + Next.js + React |
| **Admin App** | Society committee members | React Native (Expo) + Next.js + React |
| **Super Admin App** | Platform operators | React Native (Expo) + Next.js + React |

All six app packages share a design token system via `packages/shared-ui-tokens` (a single Tailwind config extended by every app). Web apps use **Tailwind CSS** for utility-first styling; mobile apps use **NativeWind** to consume the same Tailwind tokens natively.

### Backend Microservices

| Service | Responsibility |
|---|---|
| **`api-gateway`** | Single public entry point — OTP/JWT auth, TOTP 2FA, request routing via HTTP proxy |
| **`owner-service`** | Owner-facing APIs: flats, maintenance, visitor logs, payments, rentals, facility bookings, events, PDF statements |
| **`admin-service`** | Admin-facing APIs: societies, staff, announcements, facility management, vendor registry, audit PDF generation, AdminJS panel |
| **`super-admin-service`** | Platform management: society onboarding, subscriptions, feature flags, KMS key rotation, global AdminJS panel |
| **`media-service`** | Common Image Media Service — unique image ID generation, S3 upload, on-demand Sharp transforms (resize/WebP/quality), CloudFront variant caching |

All services are NestJS applications containerised with Docker and orchestrated via Kubernetes (EKS/GKE). Async jobs run on **BullMQ** backed by **Redis**.

### Shared Packages

| Package | Contents |
|---|---|
| `packages/shared-ui-assets` | Centralised static assets — favicons, app icons, PWA manifest, browser config; referenced by all apps via workspace symlink |
| `packages/shared-types` | TypeScript interfaces and enums consumed by all services and apps |
| `packages/shared-validators` | Zod schemas shared between frontend and backend |
| `packages/shared-ui-tokens` | Canonical Tailwind config — single source of truth for colours, spacing, and typography |
| `packages/shared-ui-components` | Cross-platform UI component library — `src/web/` ships Oat UI–based React components (e.g. `ClickCounter`), consumed via `@society/shared-ui-components`; `src/mobile/` for NativeWind + React Native (planned) |
| `packages/shared-i18n` | Translation strings for English, Hindi, and Marathi (i18next compatible) |

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Mobile | React Native (Expo) + NativeWind | RN 0.74 / NW 4.x |
| Web | Next.js + React + Tailwind CSS | Next.js 15.x / React 19.x / TW 3.4 |
| Backend | NestJS + TypeORM | NestJS 10.x / TypeORM 0.3.x |
| Node.js Runtime | Node.js (minimum LTS for all services) | 22.x |
| Database | PostgreSQL | 16 |
| Cache / Queues | Redis + BullMQ | Redis 7.x / BullMQ 5.x |
| Admin Panel | AdminJS (`@adminjs/nestjs`, `@adminjs/typeorm`) | 7.x |
| Monorepo | Lerna (+ optional Nx) | Lerna 8.x |
| PDF Generation | Puppeteer (headless Chromium) | 22.x |
| Image Processing | Sharp (libvips Node binding) | 0.33.x |
| Object Storage | AWS S3 | — |
| CDN | AWS CloudFront | — |
| Payments | Razorpay (UPI, cards, Autopay, Route) | — |
| Push Notifications | Firebase Cloud Messaging (FCM) | — |
| Containers | Docker + Kubernetes (EKS/GKE) | Docker 25.x / K8s 1.30+ |
| CI/CD | GitHub Actions | — |
| Monitoring | OpenTelemetry → Grafana / Loki / Tempo | — |
| Secret Management | AWS KMS + Parameter Store | — |

---

## Core Modules

| Module | Key Features |
|---|---|
| **Visitor Logging** | OTP-verified gate entry/exit, pre-approval QR codes, recurring staff passes |
| **Maintenance Requests** | Owner-raised tickets, status tracking, admin assignment |
| **Payments** | Razorpay UPI/card invoices, UPI Autopay mandates, Razorpay Route for society settlements |
| **Society Bank Accounts** | AES-encrypted bank details, Razorpay Reverse Penny Drop verification, primary account management |
| **Financial Year Audits** | Puppeteer-generated PDF reports (SHA-256 checksum, S3 Object Lock, 7-year retention) |
| **Flat Rentals** | Tenant profiles with encrypted PAN/phone, S3 rent agreement storage, GDPR anonymisation |
| **Facility Management** | Facility CRUD, fixed/hourly/variable pricing, booking approval workflow, blackout periods |
| **Vendor Management** | Empanelled vendor directory, encrypted phone reveal-log, document storage |
| **Society Events** | Owner-created events, facility linking, RSVP cap, photo/video gallery, admin moderation |
| **Common Image Media** | Unique Image ID (UUIDv4), on-demand Sharp transforms (`size`, `width`, `height`, `quality`, `format`, `blur`), CloudFront variant caching |
| **AdminJS Panels** | Auto-generated admin UIs for Society Admin and Super Admin with multi-tenancy hooks |

---

## Getting Started

### Prerequisites

- Node.js ≥ 22.x (LTS)
- Yarn ≥ 4.x — enabled via [Corepack](https://nodejs.org/api/corepack.html) (ships with Node 22)
- Docker + Docker Compose
- AWS CLI (configured with appropriate credentials for S3, KMS, CloudFront)
- A Razorpay test account

### Enable Yarn (first-time only)

This repo uses **Yarn 4 (Berry)** with the binary committed at `.yarn/releases/`. Corepack wires it up automatically on Node 22:

```bash
corepack enable
```

> **Windows PowerShell note:** If you see a script execution policy error, run:
> `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`

### Install

```bash
# Install all workspace dependencies and link cross-package symlinks
yarn install
```

Yarn workspaces handles package linking automatically — `lerna bootstrap` is no longer needed.

### Environment Variables

Each service reads its configuration from a `.env` file in its own directory. Copy the provided `.env.example` files and fill in your credentials:

```bash
cp backend/api-gateway/.env.example         backend/api-gateway/.env
cp backend/owner-service/.env.example       backend/owner-service/.env
cp backend/admin-service/.env.example       backend/admin-service/.env
cp backend/super-admin-service/.env.example backend/super-admin-service/.env
cp backend/media-service/.env.example       backend/media-service/.env
```

### Run in Development

```bash
# Start all backend services concurrently via Lerna + Yarn
yarn start:dev

# Or start a single service directly
cd backend/api-gateway && yarn start:dev

# Run a Lerna target across all packages
yarn lerna run start:dev --stream
```

### Build

```bash
# Build all packages and services
yarn build

# Build only affected packages (faster, uses Nx cache)
yarn nx affected --target=build

# Build a specific workspace package
yarn lerna run build --scope=@society/owner-service
```

### Run Tests

```bash
# Run all tests across the monorepo
yarn test

# Run tests for a specific service
yarn lerna run test --scope=@society/admin-service

# Run only affected tests (CI-style)
yarn nx affected --target=test
```

### Code Quality — Lint & Format

The repo ships a root **ESLint 9 flat config** (`eslint.config.mjs`) and a unified **Prettier** config (`.prettierrc.json`) that cover every package type automatically via file-glob scoping.

```bash
# Lint all packages via Lerna
yarn lint

# Auto-fix lint issues across the entire repo
yarn lint:fix

# Check formatting (CI-safe, exits non-zero if files differ)
yarn format:check

# Reformat all files in-place
yarn format
```

> **Nx cache:** Lint results are cached by Nx — unchanged packages are skipped instantly.
> Use `yarn nx affected --target=lint` to lint only what changed since `develop`.

---

## Project Structure

```
alankapuri-my-society/                  ← git root
│
├── lerna.json                          ← Lerna config (version: independent, npmClient: yarn)
├── package.json                        ← Root Yarn workspaces config (packageManager: yarn@4.14.1)
├── .yarnrc.yml                         ← ★ Yarn 4 Berry config (nodeLinker: node-modules)
├── yarn.lock                           ← Yarn lockfile — single source of truth for all deps
├── nx.json                             ← ★ Nx task-runner caching (build · test · lint · type-check)
├── tsconfig.base.json                  ← ★ Shared strict TS compiler options (all packages extend this)
├── jsconfig.json                       ← IDE support for root-level JS files + shared-ui-assets
├── eslint.config.mjs                   ← ★ ESLint 9 flat config (TS · React · RN · NestJS · Prettier)
├── .prettierrc.json                    ← Prettier rules (singleQuote · no semi · 100-col · lf)
├── .prettierignore                     ← Prettier ignore (dist · .next · coverage · assets · .yarn)
├── sonar-project.properties            ← SonarCloud SAST configuration
├── .dockerignore                       ← ★ Docker build context exclusions (node_modules, .env, dist, .git)
│
├── .yarn/
│   └── releases/
│       └── yarn-4.14.1.cjs             ← ★ Committed Yarn binary (zero-install CLI, no corepack required)
│
├── .github/
│   └── workflows/
│       ├── ci.yml                      ← ★ CI pipeline (lint → type-check → test → SonarCloud → Snyk)
│       └── cd.yml                      ← ★ CD pipeline (Docker build → ECR push → Helm upgrade on EKS)
│
├── applications/
│   ├── owner-app/
│   │   ├── mobile/                     ← React Native 0.74 (Expo) + NativeWind v4
│   │   │   └── tsconfig.json
│   │   └── web/                        ← ★ Next.js 15 + React 19 + Tailwind CSS + Oat UI
│   │       ├── src/
│   │       │   ├── app/
│   │       │   │   ├── layout.tsx      ← Root layout (metadata · imports globals.css only)
│   │       │   │   ├── page.tsx        ← Landing page — renders <ClickCounter /> from shared-ui-components
│   │       │   │   └── globals.css     ← @import '@knadh/oat/oat.min.css' · @tailwind · CSS var overrides
│   │       │   └── types/
│   │       │       └── global.d.ts     ← declare module '*.css' (CSS side-effect import support)
│   │       ├── next.config.ts          ← createNextConfig(__dirname) from @society/shared-nextjs-config
│   │       ├── tailwind.config.ts      ← presets: [shared-ui-tokens]
│   │       ├── postcss.config.js       ← postcss-import (first) · tailwindcss · autoprefixer
│   │       ├── package.json            ← @society/owner-app-web
│   │       └── tsconfig.json           ← extends base · moduleResolution:bundler · jsx:preserve
│   ├── admin-app/
│   │   ├── mobile/
│   │   │   └── tsconfig.json
│   │   └── web/                        ← ★ Next.js 15 + React 19 + Tailwind CSS + Oat UI
│   │       ├── src/
│   │       │   ├── app/
│   │       │   │   ├── layout.tsx · page.tsx · globals.css
│   │       │   └── types/global.d.ts
│   │       ├── next.config.ts · tailwind.config.ts
│   │       ├── postcss.config.js       ← postcss-import (first) · tailwindcss · autoprefixer
│   │       ├── package.json            ← @society/admin-app-web
│   │       └── tsconfig.json
│   └── super-admin-app/
│       ├── mobile/
│       │   └── tsconfig.json
│       └── web/                        ← ★ Next.js 15 + React 19 + Tailwind CSS + Oat UI
│           ├── src/
│           │   ├── app/
│           │   │   ├── layout.tsx · page.tsx · globals.css
│           │   └── types/global.d.ts
│           ├── next.config.ts · tailwind.config.ts
│           ├── postcss.config.js       ← postcss-import (first) · tailwindcss · autoprefixer
│           ├── package.json            ← @society/super-admin-app-web
│           └── tsconfig.json
│
├── backend/
│   ├── api-gateway/                    ← ★ NestJS · Auth, OTP/JWT/TOTP 2FA, rate-limiting, proxying
│   │   ├── src/
│   │   │   ├── main.ts                 ← Bootstrap (port 3000, globalPrefix api/v1)
│   │   │   ├── app.module.ts           ← Root module (imports DatabaseModule)
│   │   │   ├── app.controller.ts       ← GET /health endpoint
│   │   │   ├── app.service.ts          ← AppService (health check)
│   │   │   ├── app.controller.spec.ts  ← Unit test for health endpoint
│   │   │   └── database/
│   │   │       └── database.module.ts  ← TypeORM forRoot (env-driven PostgreSQL config)
│   │   ├── .env.example                ← Required env vars template
│   │   ├── package.json                ← @society/api-gateway
│   │   ├── tsconfig.json               ← extends base · module:commonjs
│   │   └── tsconfig.build.json         ← extends tsconfig.json · excludes *.spec.ts
│   ├── owner-service/                  ← ★ NestJS · Owner-facing APIs + TypeORM
│   │   ├── src/
│   │   │   ├── main.ts                 ← Bootstrap (port 3001)
│   │   │   ├── app.module.ts · app.controller.ts · app.service.ts · app.controller.spec.ts
│   │   │   └── database/database.module.ts
│   │   ├── .env.example
│   │   ├── package.json                ← @society/owner-service
│   │   ├── tsconfig.json
│   │   └── tsconfig.build.json
│   ├── admin-service/                  ← ★ NestJS · Admin-facing APIs + AdminJS panel (port 3002)
│   │   ├── src/
│   │   │   ├── main.ts                 ← Bootstrap (port 3002)
│   │   │   ├── app.module.ts · app.controller.ts · app.service.ts · app.controller.spec.ts
│   │   │   └── database/database.module.ts
│   │   ├── Dockerfile                  ← ★ Multi-stage: deps → build → runner (node:22-alpine)
│   │   ├── .env.example               ← DB · JWT · AdminJS session · Redis · AWS env vars
│   │   ├── package.json               ← @society/admin-service
│   │   ├── tsconfig.json
│   │   └── tsconfig.build.json
│   ├── super-admin-service/            ← ★ NestJS · Platform management + global AdminJS panel (port 3003)
│   │   ├── src/
│   │   │   ├── main.ts                 ← Bootstrap (port 3003)
│   │   │   ├── app.module.ts · app.controller.ts · app.service.ts · app.controller.spec.ts
│   │   │   └── database/database.module.ts
│   │   ├── Dockerfile                  ← ★ Multi-stage: deps → build → runner (node:22-alpine)
│   │   ├── .env.example               ← DB · JWT · TOTP · KMS · Secrets Manager env vars
│   │   ├── package.json               ← @society/super-admin-service
│   │   ├── tsconfig.json
│   │   └── tsconfig.build.json
│   └── media-service/                  ← ★ NestJS · S3 pre-signed URLs, Sharp, FFmpeg, CloudFront (port 3004)
│       ├── src/
│       │   ├── main.ts                 ← Bootstrap (port 3004)
│       │   ├── app.module.ts · app.controller.ts · app.service.ts · app.controller.spec.ts
│       │   └── database/database.module.ts
│       ├── Dockerfile                  ← ★ Multi-stage + apk add ffmpeg in runner stage
│       ├── .env.example               ← DB · S3 buckets · CloudFront · KMS · BullMQ env vars
│       ├── package.json               ← @society/media-service
│       ├── tsconfig.json
│       └── tsconfig.build.json
│
├── packages/
│   ├── shared-nextjs-config/           ← ★ Shared Next.js base config for all web dashboards
│   │   ├── next.config.base.js         ← transpilePackages + security headers + image config
│   │   ├── next.config.base.d.ts       ← TypeScript type declaration
│   │   ├── package.json                ← @society/shared-nextjs-config
│   │   └── tsconfig.json
│   ├── shared-ui-assets/               ← Centralised static assets (favicons, icons, manifests)
│   │   ├── assets/                     ← favicon · apple-icon · ms-icon · manifest.json
│   │   ├── index.js · tsconfig.json
│   │   └── package.json                ← @society/shared-ui-assets
│   ├── shared-types/                   ← TypeScript interfaces & enums (FE + BE)
│   │   ├── package.json                ← @society/shared-types
│   │   └── tsconfig.json
│   ├── shared-validators/              ← Zod schemas shared between frontend and backend
│   │   ├── package.json                ← @society/shared-validators
│   │   └── tsconfig.json
│   ├── shared-ui-tokens/               ← ★ Canonical Tailwind design-token preset
│   │   ├── tailwind.config.ts          ← Colors, spacing, typography, radius, shadows
│   │   ├── package.json                ← @society/shared-ui-tokens
│   │   └── tsconfig.json
│   ├── shared-ui-components/           ← ★ Cross-platform UI component library
│   │   ├── src/
│   │   │   ├── web/
│   │   │   │   ├── ClickCounter.tsx    ← Oat UI demo: article · button · mark · progress
│   │   │   │   └── index.ts            ← Web component barrel export
│   │   │   └── index.ts                ← Root barrel (re-exports web/)
│   │   ├── package.json                ← @society/shared-ui-components · exports: ./src (transpilePackages)
│   │   └── tsconfig.json
│   └── shared-i18n/                    ← Translation strings (en, hi, mr) — i18next compatible
│       ├── package.json                ← @society/shared-i18n
│       └── tsconfig.json
│
└── docs/
    ├── PRD.md                          ← Full Product Requirement Document
    └── EPIC.md                         ← Epic estimates & story-point breakdown
```

See [`docs/PRD.md`](./docs/PRD.md) for the complete specification including data schemas, API contracts, security architecture, and deployment guidelines.

---

## Contributors

| Contributor | Role |
| :--- | :--- |
| [<img src="https://github.com/sangatDvikram.png?size=100" width="100px;"/><br /><sub><b>Vikram Sangat</b></sub>](https://github.com/sangatDvikram/) | Lead Developer / Architect |

---

## License

Copyright © 2026 [Vikram Sangat](https://sangatdvikram.github.io/). Licensed under the [MIT License](./License.md).
