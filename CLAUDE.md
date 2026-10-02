# My Society — CLAUDE.md

> Primary configuration and instruction set for Claude Code CLI and Augment Agent.
> Source of truth: `docs/PRD.md` (v1.0.0). This file is a curated summary — always defer to the PRD for full specification.

---

## Project Overview

**Society Management and Logging System** — a multi-tenant SaaS platform that digitises end-to-end operations of Indian residential housing societies: visitor logging, maintenance, payments, rentals, facility booking, events, and financial year audits.

- **Multi-tenancy:** All data is scoped by `society_id`. Never return or modify cross-society data.
- **GDPR/DPDP-compliant:** Soft-deletes only (`deleted_at`). Hard deletes are **strictly forbidden** everywhere. DPDP = Digital Personal Data Protection Act, 2023 (India).
- **Security-first:** PII (phone, PAN, bank details) stored AES-256-GCM encrypted + HMAC-SHA256 hash for lookup. Never log or expose raw ciphertext, secrets, or signatures.

---

## Monorepo Layout

```
alankapuri-my-society/
├── applications/
│   ├── owner-app/{mobile,web}          # React Native (Expo) + Next.js 15
│   ├── admin-app/{mobile,web}
│   └── super-admin-app/{mobile,web}
├── services/
│   ├── api-gateway/       # Port 3000 — Auth (OTP/JWT/TOTP), routing
│   ├── owner-service/     # Port 3001 — Owner-facing APIs
│   ├── admin-service/     # Port 3002 — Admin APIs + AdminJS panel (/panel)
│   ├── super-admin-service/ # Port 3003 — Platform mgmt + AdminJS (/superadmin)
│   └── media-service/     # Port 3004 — Image/video upload, Cloudinary transforms, signed URLs
├── packages/
│   ├── shared-types/      # TypeScript interfaces & enums
│   ├── shared-validators/ # Zod schemas (FE + BE)
│   ├── shared-ui-tokens/  # Canonical Tailwind design-token preset
│   ├── shared-ui-components/ # Cross-platform React/RN component library
│   ├── shared-ui-assets/  # Favicons, icons, manifests
│   ├── shared-nextjs-config/ # Shared Next.js base config
│   └── shared-i18n/       # i18next translations (en, hi, mr)
└── docs/
    ├── PRD.md             # Full specification (5092 lines)
    └── EPIC.md            # Epic estimates & story points
```

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Language | TypeScript strict mode | 6.0.x |
| Runtime | Node.js LTS | 22.x |
| Mobile | React Native (Expo) + NativeWind | RN 0.74 / NW 4.x |
| Web | Next.js + React + Tailwind CSS + Oat UI (`@knadh/oat`) | Next 15 / React 19 |
| Backend | NestJS + TypeORM | NestJS 10 / TypeORM 0.3 |
| Database | PostgreSQL via **Neon** (free serverless, 0.5 GB, branching) | 16 |
| Cache/Queue | Redis + BullMQ via **Upstash** (free: 10K req/day, 256 MB) | Redis 7 / BullMQ 5 |
| Admin Panel | AdminJS v7 (`@adminjs/nestjs`, `@adminjs/typeorm`, `@adminjs/express`) | 7.x |
| Monorepo | Nx (task runner + build cache) + Lerna | Nx 21 / Lerna 8 |
| Package Mgr | Yarn 4.14.1 Berry (`nodeLinker: node-modules`) | ≥4.x |
| Linting | ESLint 9 flat config (`eslint.config.mjs`) + `typescript-eslint` + `import/order` | 9.x |
| PDF | Puppeteer (headless Chromium) | 22.x |
| Media Hosting | Cloudinary (upload, LQIP, responsive transforms, EXIF) — images + video | — |
| Storage | **Cloudflare R2** (10 GB + 1M ops/month free; S3-compatible, zero egress fees) | — |
| Local Dev Storage | MinIO via Docker Compose (free, self-hosted) | — |
| Payments | Razorpay **test mode** (free); production charges ~2% per txn | — |
| Push | Firebase Cloud Messaging (FCM) — **free** | — |
| Hosting (services) | **Railway** ($5 free credit/month) or **Render** (free tier, sleeps after 15 min) | — |
| Hosting (web apps) | **Vercel** (free hobby tier, unlimited Next.js deployments) | — |
| Containers (local) | Docker + Docker Compose | Docker 25 |
| CI/CD | GitHub Actions — free for public repos (2,000 min/month) | — |

---

## Free-Tier Hobby Setup

All external services below have **zero cost** tiers sufficient for development and light production use.

### Database — Neon (Serverless PostgreSQL)
- Sign up at [neon.tech](https://neon.tech) — free tier: 0.5 GB storage, branching, auto-suspend.
- Create a project → copy the connection string → set `DATABASE_URL` in each service's `.env`.
- Use Neon **branches** for local dev (branch = disposable DB clone, free).

### Cache & Queues — Upstash Redis
- Sign up at [upstash.com](https://upstash.com) — free tier: 10,000 commands/day, 256 MB.
- Create a Redis database → copy the `UPSTASH_REDIS_REST_URL` / TLS connection string.
- Set `REDIS_URL` in each service `.env`. BullMQ works without any code changes.

### Object Storage — Cloudflare R2
- Sign up at [cloudflare.com](https://cloudflare.com) — free tier: 10 GB storage, 1M Class-A ops/month.
- Create a bucket → generate an **API token** with R2 read/write permissions.
- R2 exposes an S3-compatible endpoint — set `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET_*` in `.env`. Used for **non-media documents only** (audit reports, rental/vendor documents) — never for images or video. No code changes needed.
- **Local dev:** use MinIO via Docker Compose (see `docker-compose.yml`) as a drop-in for R2.

### Media Hosting — Cloudinary
- Sign up at [cloudinary.com](https://cloudinary.com) — free tier: 25 credits/month (storage + bandwidth + transforms).
- Create an account → copy the Cloud Name, API Key, API Secret → set `CLOUDINARY_URL` (or the three discrete vars) in `media-service/.env`.
- Handles upload, responsive transforms, LQIP, and EXIF extraction/orientation natively — no Sharp/FFmpeg processing or local variant caching needed.

### Service Hosting — Railway
- Sign up at [railway.app](https://railway.app) — free: $5 credit/month per workspace.
- Deploy each NestJS service as a separate Railway service from the monorepo.
- Set all env vars in the Railway dashboard (never commit `.env` files).
- **Render** is an alternative (free tier sleeps after 15 min of inactivity — fine for hobby).

### Web App Hosting — Vercel
- Sign up at [vercel.com](https://vercel.com) — free hobby tier, unlimited Next.js deployments.
- Deploy each `applications/*/web` app as a separate Vercel project.
- Set env vars in the Vercel dashboard per project.

### Payments — Razorpay Test Mode
- Sign up at [razorpay.com](https://razorpay.com) — **test mode is completely free**.
- Use `rzp_test_*` key ID and secret for all development and staging.
- Test UPI flows with Razorpay's provided test VPAs and card numbers.
- Production mode charges ~2% per transaction (unavoidable for live payments in India).

### Push Notifications — Firebase Cloud Messaging
- FCM is **permanently free** with no daily limits for standard notifications.
- Create a Firebase project → download `google-services.json` → set `FCM_SERVER_KEY` in `.env`.

### CI/CD — GitHub Actions
- Free for public repositories: 2,000 minutes/month.
- Workflow at `.github/workflows/ci.yml` runs lint → type-check → test on every push/PR.

---

## Build, Test & Lint Commands

```bash
# Install all workspace dependencies
yarn install

# Start all services in dev mode
yarn start:dev

# Build everything
yarn build

# Build only affected packages (uses Nx cache)
yarn nx affected --target=build

# Run all tests
yarn test

# Run tests for a specific service
yarn lerna run test --scope=@society/admin-service

# Lint all 14 projects (cached)
npx nx run-many --target=lint --all

# Type-check all 14 projects (cached)
npx nx run-many --target=type-check --all

# Lint/type-check only affected (CI-style)
npx nx affected --target=lint
npx nx affected --target=type-check

# Format check (CI-safe) / fix in-place
yarn format:check
yarn format

# Force clean run (skip Nx cache)
npx nx run-many --target=lint --all --skip-nx-cache
```

> **Nx cache:** `lint` and `type-check` results are cached. Unchanged projects are skipped automatically.

---

## Absolute Rules (Never Violate)

1. **No hard deletes.** Always set `deleted_at` (soft-delete). The AdminJS `delete` action is disabled globally; use a custom `Soft-Delete` action instead.
2. **No cross-tenant data leakage.** Every query must filter by `societyId`. Never expose another society's records.
3. **No secrets in code or logs.** `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `DEK` (AES-256 key), `HMAC_SECRET` are injected via env vars only; never logged, never sent to any client.
4. **All images/video route through `media-service`.** Never reference raw Cloudinary `public_id`s or delivery URLs externally — always use `imageId` and `/media/images/{imageId}?params`.
5. **Phone and PAN are dual-column.** Store `phoneEncrypted` (AES-256-GCM) + `phoneHash` (HMAC-SHA256) — never expose hash to UI, never expose raw ciphertext.
6. **Payment signatures must be server-side verified.** Client-reported payment success is never trusted without HMAC-SHA256 verification of `orderId|paymentId`.
7. **Webhook idempotency.** Always check `webhookEventId` uniqueness before processing a Razorpay webhook event.
8. **Published audit reports are immutable (WORM).** Once `status = PUBLISHED`, the PDF cannot be modified or deleted; `PUBLISHED → ARCHIVED` is the only allowed transition.
9. **AdminJS `societyId` is never editable.** Set `isEditable: false` to prevent tenant reassignment.
10. **Financial amounts are always in paise (integer).** Never use floats for monetary values.

---

## Coding Conventions

- **NestJS services:** Use `NestJS Logger` — `no-console` ESLint rule is enforced. Never use `console.log`.
- **TypeScript:** Strict mode enabled globally (`tsconfig.base.json`). No `any`, no loose null handling.
- **ESLint config:** Root flat config at `eslint.config.mjs`. Each package's `lint` script calls `npx eslint` (not globally installed binary).
- **Linting scripts:** Use `npx eslint "src/**/*.{ts,tsx}"` in each package's `package.json` — Nx resolves the binary correctly.
- **Import order:** Enforced via `import/order` ESLint plugin. External → internal → relative.
- **Prettier:** `.prettierrc.json` — singleQuote, no semi, 100-col, lf line endings.
- **Design tokens:** Consume `packages/shared-ui-tokens` via `presets: [shared-ui-tokens]` in each app's `tailwind.config.ts`. Never hardcode colours or spacing.
- **Web UI:** Oat UI (`@knadh/oat`) for semantic HTML styling. Import in `globals.css` before `@tailwind` directives.
- **Mobile UI:** NativeWind v4 for Tailwind utilities in React Native.
- **Encryption pattern:** Use `PhoneCryptoService` (AES-256-GCM) for any PII field; never roll custom crypto.
- **Indian Financial Year:** April 1 – March 31; represented as `"YYYY-YYYY"` (e.g. `"2025-2026"`).
- **Monetary unit:** Always paise (integer). `₹3,500 = 350000 paise`.

---

## Key Domain Entities & Enums

| Entity | Key States / Notes |
|---|---|
| `Society` | `ACTIVE \| INACTIVE \| SUSPENDED` — multi-tenant root |
| `Flat` | `OCCUPIED \| VACANT \| UNDER_RENOVATION` |
| `User` | Dual phone columns: `phoneEncrypted` + `phoneHash` |
| `VisitorLog` | `approval_status`: `PENDING → APPROVED \| REJECTED \| TIMEOUT` — pre-approved QR/OTP auto-approves; owner has a 2-min approval window on walk-ins |
| `Payment` | `PENDING → PROCESSING → SUCCESS \| FAILED \| REFUNDED` |
| `FacilityBooking` | `PENDING_APPROVAL → APPROVED → CONFIRMED \| REJECTED → CANCELLED` |
| `SocietyEvent` | `DRAFT → UPCOMING → ONGOING → COMPLETED \| CANCELLED \| REMOVED` |
| `AuditReport` | `PENDING → GENERATING → DRAFT → PUBLISHED → ARCHIVED \| FAILED` |
| `FlatRental` | `ACTIVE → ENDED \| EXPIRED` |
| `MediaAsset` | Registry for every uploaded image; `imageId` is the only external identifier |

---

## Skills

### Skill: Visitor Entry & Pre-Approval Flow

**When:** Implementing or debugging gate entry/exit, pre-approval QR/OTP, or owner approval timeouts.

**Steps:**
1. **Pre-approved visitor:** Guard scans QR or enters OTP at the gate terminal → system validates `pre_approved_token` (hashed) → valid → auto-approve entry; invalid/expired → notify guard, fall back to walk-in flow.
2. **Walk-in visitor:** Guard captures name, OTP-verified ephemeral phone, optional photo (`gdpr_consent` required if captured), vehicle number, purpose, host flat → push notification sent to Owner.
3. Owner approves/rejects within a **2-minute timeout window**; `approval_status` transitions `PENDING → APPROVED | REJECTED | TIMEOUT`.
4. On `APPROVED`, entry is logged (`entry_time`, `entry_guard_id`) and the guard opens the gate; on `REJECTED`/`TIMEOUT`, guard denies entry and the visitor is notified.
5. Exit: guard marks exit manually, or auto-detects via a second QR scan; `exit_time` + `exit_guard_id` recorded. Long-stay alert fires if the visitor overstays the configured threshold (default 4 h).
6. `visitor_phone` uses the standard dual-column pattern (`visitor_phone_encrypted` + `visitor_phone_hash`); `deleted_at` soft-delete applies for GDPR/DPDP erasure.

### Skill: Media Upload & Image Transform

**When:** Adding a new uploadable entity (e.g. event photos, vendor documents, facility images).

**Steps:**
1. Client requests a signed Cloudinary upload payload from `media-service` (providing `mimeType`, `fileSizeBytes`, `context`); `media-service` generates a UUIDv4 `imageId` and returns `{ imageId, cloudName, apiKey, timestamp, signature, folder }`.
2. Client uploads directly to Cloudinary using the signed payload, then calls `media-service`'s confirm endpoint with the returned Cloudinary `public_id`. `media-service` reads dimensions, format, and EXIF straight from Cloudinary's response and writes a `MediaAsset` record (`societyId`, `contextTag`, dimensions, MIME type, EXIF).
3. Return `imageId` to the client — **never return the raw Cloudinary `public_id` or secure URL**.
4. To display: construct `/media/images/{imageId}?width=480&format=webp&quality=80`. `media-service` maps params to a Cloudinary transformation string and redirects/streams to Cloudinary's CDN — Cloudinary generates and caches the derived variant itself; `media-service` keeps no local variant cache.
5. For LQIP (progressive loading): fetch `/media/images/{imageId}?width=40&blur=10&quality=30` first (maps to Cloudinary's `e_blur`).
6. Default output format: **WebP** (override with `format=jpeg|png|avif`, or omit entirely to let Cloudinary's `f_auto` pick the best format per browser).
7. Thumbnails for event media: Cloudinary eager transform generates a 480×480 px WebP crop (photos) or an auto-extracted poster frame (videos) at upload time — no BullMQ Sharp/FFmpeg job needed.
8. All media is served **exclusively via Cloudinary signed delivery URLs** (never raw/unsigned Cloudinary URLs).
9. GPS EXIF tags are stripped before persisting `MediaAsset.exif`, for GDPR/DPDP data minimisation.

---

### Skill: AdminJS Resource Registration

**When:** Adding a new TypeORM entity that needs an admin panel UI.

**Steps:**
1. Create `services/{admin,super-admin}-service/src/adminjs/resources/{entity}.resource.ts` exporting a `ResourceWithOptions`.
2. Required settings per resource:
   - `properties.societyId: { isEditable: false }` — prevent tenant reassignment.
   - Disable `delete` action: `actions: { delete: { isAccessible: false } }`.
   - Disable `bulkDelete`: `actions: { bulkDelete: { isAccessible: false } }`.
   - Add global `after()` hook to write to `admin_audit_logs` (captures `adminId`, `action`, `resource`, `recordId`, `changedFields`, `ip`, `timestamp`).
3. For encrypted fields (phone, PAN):
   - Hide raw ciphertext: `phoneEncrypted: { isVisible: { list: false, show: false } }`.
   - Add a `show.before` hook that decrypts server-side and injects `phoneDecrypted` into `record.params`.
   - Bundle a custom React component via `AdminJS.bundle('../components/PhoneDisplay')` to render the decrypted value.
   - Mask raw param: `record.params.phoneEncrypted = '***'` after decryption.
4. Register the resource in `adminjs.options.ts` under the `resources` array.
5. Never expose `phoneHash`, raw signatures, or private keys in any AdminJS property.

---

### Skill: Tenant Provisioning (New Society)

**When:** Onboarding a new society via Super Admin Panel.

**Steps:**
1. Super Admin creates a `Society` record in the Super Admin Panel (`/superadmin`).
2. `super-admin-service` creates the society record, provisions the first `Admin` user account, and sends onboarding credentials.
3. Admin logs in via `api-gateway` (email + password + TOTP for super-admin actions).
4. Admin registers the society's bank account: `POST /admin/bank-accounts` with IFSC + account number.
5. `admin-service` triggers **Razorpay Reverse Penny Drop** to verify the bank account (owner makes ₹1 UPI payment; auto-refunded).
6. Once verified, bank account status = `VERIFIED`; society is ready to collect maintenance payments.
7. All subsequent payment flows use Razorpay Orders API with `societyId` and `flatId` in `notes`.

---

### Skill: Razorpay Payment Flow

**When:** Implementing or debugging any payment feature.

**Flow summary:**
1. **Create order** (server): `POST /payments/orders` → Razorpay Orders API → store `razorpayOrderId` in DB.
2. **Checkout** (client): Web uses `new window.Razorpay({...}).open()`; Mobile uses `RazorpayCheckout.open(options)`.
3. **Verify** (server): `POST /payments/verify` — HMAC-SHA256(`orderId|paymentId`, `KEY_SECRET`) must equal `razorpaySignature`; mismatch → `FRAUD_SUSPECTED`.
4. **Webhook** (authoritative): `POST /payments/webhook` — validate `X-Razorpay-Signature` via `WebhookSignatureGuard`; check `webhookEventId` uniqueness for idempotency; route by event type.
5. **Refunds above ₹10,000** require dual-admin approval before the Razorpay Refund API call.
6. **UPI collect** timeout = 5 minutes; poll `GET /payments/orders/:orderId/status` every 5s.
7. **UPI Autopay**: create subscription via Razorpay Subscriptions API; handle `subscription.charged` webhook to auto-create payment records.

---

### Skill: Financial Year Audit PDF Generation

**When:** Generating or scheduling audit reports.

**Steps:**
1. Trigger: auto cron on April 1 (`PENDING → GENERATING`) or Admin on-demand.
2. `admin-service` collects all inflows/outflows for the FY, renders a Handlebars HTML template, and passes it to Puppeteer to produce a PDF buffer.
3. Compute SHA-256 checksum of the PDF binary and embed it in XMP metadata.
4. Store PDF in object storage: `audit-reports/{societyId}/{FY}/SOCIETY_ANNUAL/{version}.pdf`.
5. Store record in `audit_reports` table with checksum and status `DRAFT`.
6. Admin reviews and publishes: status transitions to `PUBLISHED` — **immutable after this point**.
7. Owner statements (`OWNER_STATEMENT`) are generated on-demand and stored under `audit-reports/{societyId}/{FY}/OWNER_STATEMENT/{ownerId}/{version}.pdf`.
8. Retention: 7 years minimum; application-level write-protection enforced on `PUBLISHED` records.

---

## Environment Variables Pattern

Each service reads from its own `.env` file (never committed). Copy `.env.example` to `.env` for each service:

```bash
cp services/api-gateway/.env.example         services/api-gateway/.env
cp services/owner-service/.env.example       services/owner-service/.env
cp services/admin-service/.env.example       services/admin-service/.env
cp services/super-admin-service/.env.example services/super-admin-service/.env
cp services/media-service/.env.example       services/media-service/.env
```

Key env vars (never hard-code, never log):
- `DATABASE_URL` — Neon PostgreSQL connection string
- `REDIS_URL` — Upstash Redis TLS connection string for BullMQ and session storage
- `JWT_SECRET` — API Gateway JWT signing key
- `DEK` — AES-256-GCM Data Encryption Key for PII fields
- `HMAC_SECRET` — HMAC-SHA256 secret for phone hash lookups
- `RAZORPAY_KEY_ID` — Public `rzp_test_*` key; sent to client SDK
- `RAZORPAY_KEY_SECRET` — Private; server-side only
- `RAZORPAY_WEBHOOK_SECRET` — Webhook HMAC verification
- `S3_ENDPOINT` — Cloudflare R2 endpoint (`https://<account>.r2.cloudflarestorage.com`)
- `S3_ACCESS_KEY_ID` — R2 API token access key
- `S3_SECRET_ACCESS_KEY` — R2 API token secret
- `S3_BUCKET_*` — R2 bucket names per context (non-media documents: audit-reports, rentals, vendor-documents, etc.)
- `CLOUDINARY_URL` (or `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET`) — Cloudinary credentials; `media-service` only, never logged
- `ADMINJS_COOKIE_SECRET` — AdminJS session cookie secret
- `FCM_SERVER_KEY` — Firebase Cloud Messaging server key

---

## Global Skills (Augment Agent)

The following skills are installed globally and available in all sessions:

| Skill | Trigger | Description |
|---|---|---|
| `caveman` | "caveman mode" / `/caveman` | Ultra-compressed ~75% token-saving communication |
| `caveman-commit` | "write a commit" / `/caveman-commit` | Conventional Commits format, ≤50 char subject |
| `caveman-review` | "code review" / `/caveman-review` | Compressed PR review comments |
| `caveman-compress` | `/caveman-compress FILEPATH` | Compress memory/notes files to caveman format |
| `caveman-help` | `/caveman-help` | Quick-reference card for all caveman commands |
| `caveman-stats` | `/caveman-stats` | Token usage and savings for current session |
| `cavecrew` | "delegate to subagent" | Spawn compressed subagents (investigator/builder/reviewer) |
| `graphify` | "codebase graph" / "architecture query" | Build and query a knowledge graph of the codebase |
| `react-developer` | Writing/reviewing React code | Senior React lens: hooks, Redux, MUI, Tailwind, testing |
| `web-ui-architect` | Frontend architecture decisions | Micro-frontend, design systems, build tooling guidance |

Skill files location: `C:\Users\vikra\.augment\skills\` and `C:\Users\vikra\.claude\skills\`

---

## Security Checklist (Before Every PR)

- [ ] No `console.log` calls in backend services (use `NestJS Logger`)
- [ ] No hard-coded secrets, API keys, or connection strings
- [ ] All new entities have `deleted_at` column and soft-delete guard
- [ ] New entity with `societyId` — query always filters by `societyId`
- [ ] Phone/PAN fields use dual-column pattern (`*Encrypted` + `*Hash`)
- [ ] AdminJS resources: `delete` action disabled, `societyId` not editable, audit-log hook present
- [ ] New media upload routes through `media-service`; returns `imageId` only
- [ ] Payment routes: server-side signature verification before any status update
- [ ] Razorpay webhook handler: idempotency check on `webhookEventId` before processing
- [ ] Financial amounts in paise (integer) — no floats

---

*Generated from `docs/PRD.md` v1.0.0 · Last updated: 2026-06-16*
