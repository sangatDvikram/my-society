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

All six app packages share a design token system via `packages/shared-ui-tokens` (a single Tailwind config extended by every app). Web apps additionally use **Oat UI** (`@knadh/oat`) for semantic HTML styling; mobile apps use **NativeWind** to consume the same Tailwind tokens natively.

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
| `packages/shared-ui-components` | Cross-platform UI component library (`web/` for Oat UI + React, `mobile/` for NativeWind + React Native) |
| `packages/shared-i18n` | Translation strings for English, Hindi, and Marathi (i18next compatible) |

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Mobile | React Native (Expo) + NativeWind | RN 0.74 / NW 4.x |
| Web | Next.js + React + Tailwind CSS + Oat UI | Next.js 15.x / React 19.2.0 / TW 3.4 |
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
- npm ≥ 10.x
- Docker + Docker Compose
- AWS CLI (configured with appropriate credentials for S3, KMS, CloudFront)
- A Razorpay test account

### Install

```bash
# Install all workspace dependencies across every package and service
npm install

# Bootstrap Lerna (links cross-package dependencies)
npx lerna bootstrap
```

### Environment Variables

Each service reads its configuration from a `.env` file in its own directory. Copy the provided `.env.example` files and fill in your credentials:

```bash
cp backend/api-gateway/.env.example      backend/api-gateway/.env
cp backend/owner-service/.env.example    backend/owner-service/.env
cp backend/admin-service/.env.example    backend/admin-service/.env
cp backend/super-admin-service/.env.example backend/super-admin-service/.env
cp backend/media-service/.env.example    backend/media-service/.env
```

### Run in Development

```bash
# Start all backend services concurrently via Lerna
npx lerna run start:dev --stream

# Or start a single service
cd backend/api-gateway && npm run start:dev
```

### Build

```bash
# Build all packages and services
npx lerna run build

# Build a specific scope
npx lerna run build --scope=@society/owner-service
```

### Run Tests

```bash
# Run all tests across the monorepo
npx lerna run test

# Run tests for a specific service
npx lerna run test --scope=@society/admin-service
```

---

## Project Structure

```
alankapuri-my-society/                  ← git root
│
├── lerna.json                          ← Lerna config (version: independent)
├── package.json                        ← Root npm workspaces config
├── nx.json                             ← ★ Nx task-runner caching (build · test · lint · type-check)
├── tsconfig.base.json                  ← ★ Shared strict TS compiler options (all packages extend this)
├── sonar-project.properties            ← SonarCloud SAST configuration
│
├── .github/
│   └── workflows/
│       └── ci.yml                      ← ★ CI pipeline (lint → type-check → test → SonarCloud → Snyk)
│
├── applications/
│   ├── owner-app/
│   │   ├── mobile/                     ← React Native 0.74 (Expo) + NativeWind v4
│   │   │   └── tsconfig.json           ← extends base · module:esnext · moduleResolution:bundler · jsx:react-native
│   │   └── web/                        ← Next.js 15 + React 19 + Tailwind CSS + Oat UI
│   │       └── tsconfig.json           ← extends base · moduleResolution:bundler · jsx:preserve · noEmit · Next.js plugin
│   ├── admin-app/
│   │   ├── mobile/
│   │   │   └── tsconfig.json           ← extends base · jsx:react-native
│   │   └── web/
│   │       └── tsconfig.json           ← extends base · jsx:preserve · Next.js plugin
│   └── super-admin-app/
│       ├── mobile/
│       │   └── tsconfig.json           ← extends base · jsx:react-native
│       └── web/
│           └── tsconfig.json           ← extends base · jsx:preserve · Next.js plugin
│
├── backend/
│   ├── api-gateway/                    ← NestJS · Auth, routing, webhook guards
│   │   ├── tsconfig.json               ← extends base · module:commonjs · moduleResolution:node
│   │   └── tsconfig.build.json         ← extends tsconfig.json · excludes *.spec.ts (nest build)
│   ├── owner-service/                  ← NestJS · Owner-facing APIs
│   │   ├── tsconfig.json
│   │   └── tsconfig.build.json
│   ├── admin-service/                  ← NestJS · Admin-facing APIs + AdminJS panel
│   │   ├── tsconfig.json
│   │   └── tsconfig.build.json
│   ├── super-admin-service/            ← NestJS · Platform management + global AdminJS panel
│   │   ├── tsconfig.json
│   │   └── tsconfig.build.json
│   └── media-service/                  ← NestJS · Sharp image transforms, CloudFront CDN caching
│       ├── tsconfig.json
│       └── tsconfig.build.json
│
├── packages/
│   ├── shared-ui-assets/               ← Centralised static assets (favicons, icons, manifests)
│   │   ├── assets/                     ← All static files (moved from root /public/)
│   │   │   ├── favicon.ico / favicon-*.png
│   │   │   ├── apple-icon*.png  · android-icon*.png  · ms-icon*.png
│   │   │   ├── manifest.json  · browserconfig.xml
│   │   ├── index.js                    ← Exports assetsPath for consuming apps
│   │   ├── tsconfig.json               ← JS-only · allowJs · noEmit · checkJs:false
│   │   └── package.json               ← @society/shared-ui-assets
│   ├── shared-types/                   ← TypeScript interfaces & enums (FE + BE)
│   │   └── tsconfig.json               ← extends base · module:commonjs · outDir:dist
│   ├── shared-validators/              ← Zod schemas shared between frontend and backend
│   │   └── tsconfig.json               ← extends base · module:commonjs · outDir:dist
│   ├── shared-ui-tokens/               ← Canonical Tailwind config (colours, spacing, typography)
│   │   └── tsconfig.json               ← extends base · module:commonjs · includes tailwind.config.ts only
│   ├── shared-ui-components/           ← Cross-platform UI component library (web/ + mobile/ + shared/)
│   │   └── tsconfig.json               ← extends base · module:esnext · moduleResolution:bundler · jsx:react-jsx
│   └── shared-i18n/                    ← Translation strings (en, hi, mr) — i18next compatible
│       └── tsconfig.json               ← extends base · module:commonjs · outDir:dist
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
