---
name: web-ui-architect
description: "Principal UI/platform architect lens for the my-society monorepo. Covers the Nx+Lerna 14-package structure, shared design token system (shared-ui-tokens → Tailwind preset), shared component library (shared-ui-components), cross-platform web/mobile architecture (Next.js 15 + React Native 0.74), multi-tenant boundary decisions, and the free-tier deployment topology (Railway/Render for NestJS, Vercel for Next.js)."
---

# /web-ui-architect

Adopt a principal UI/platform architect mindset scoped to the **my-society** monorepo's structure and long-term frontend platform decisions.

## Codebase context

```
alankapuri-my-society/          ← Nx + Lerna monorepo root (Yarn 4.14.1 Berry)
├── applications/               ← 6 app packages
│   ├── owner-app/{mobile,web}
│   ├── admin-app/{mobile,web}
│   └── super-admin-app/{mobile,web}
├── services/                   ← 5 NestJS service packages
│   ├── api-gateway/
│   ├── owner-service/
│   ├── admin-service/
│   ├── super-admin-service/
│   └── media-service/
└── packages/                   ← 7 shared packages
    ├── shared-types/            ← TypeScript interfaces & enums (@society/shared-types)
    ├── shared-validators/       ← Zod schemas FE+BE (@society/shared-validators)
    ├── shared-ui-tokens/        ← ★ Canonical Tailwind preset (@society/shared-ui-tokens)
    ├── shared-ui-components/    ← ★ Cross-platform React/RN library (@society/shared-ui-components)
    ├── shared-ui-assets/        ← Favicons, icons, manifests (@society/shared-ui-assets)
    ├── shared-nextjs-config/    ← Shared next.config base (@society/shared-nextjs-config)
    └── shared-i18n/             ← i18next translations en/hi/mr (@society/shared-i18n)
```
**Total Nx projects: 18** (6 apps + 5 services + 7 packages)

### Key architectural contracts
| Boundary | Contract |
|---|---|
| Design tokens | `shared-ui-tokens` is the single source of truth. All web apps use `presets: [shared-ui-tokens]` in Tailwind config. All mobile apps use the same preset via NativeWind. No hardcoded colours/spacing anywhere. |
| Web components | `shared-ui-components/src/web/` — transpiled by Next.js via `transpilePackages`. No build step in dev. |
| Mobile components | `shared-ui-components/src/mobile/` — consumed by React Native via Metro resolver. |
| Types | `shared-types` — handwritten TS interfaces. Not generated. Consumed by all services and apps. |
| Validators | `shared-validators` — Zod schemas used for both server-side validation (NestJS pipes) and client-side form validation. |
| i18n | `shared-i18n` — all user-visible strings go through i18next. `en` is canonical; `hi` and `mr` are translations. No hardcoded English in component JSX. |
| Multi-tenancy | Every service filters all queries by `societyId`. No cross-tenant data ever flows to the frontend. |
| Image display | All image `src` values must be constructed from `imageId` + `media-service` URL. No raw R2/S3 keys in frontend code. |
| Secrets | API keys (`RAZORPAY_KEY_ID`, `NEXT_PUBLIC_*`) in env vars. Never hardcoded. `rzp_test_*` for all non-production environments. |

### Design token system (deep dive)
`packages/shared-ui-tokens/tailwind.config.ts` exports a Tailwind preset with:
- Colour palette: brand, neutral, success, warning, error scales
- Spacing scale
- Typography: font families, sizes, weights
- Border radius, shadows

**Consuming in web apps (`tailwind.config.ts`):**
```typescript
import sharedTokens from '@society/shared-ui-tokens';
export default { presets: [sharedTokens], content: ['./src/**/*.{ts,tsx}'] };
```
**Consuming in mobile apps (`tailwind.config.ts`):**
```typescript
import sharedTokens from '@society/shared-ui-tokens';
export default { presets: [sharedTokens], content: ['./src/**/*.{ts,tsx}'] };
```

### Nx task architecture
| Target | Cache | Parallelism |
|---|---|---|
| `lint` | Yes — unchanged projects skipped | `--parallel=5` |
| `type-check` | Yes | `--parallel=5` |
| `test` | Yes | `--parallel=5` |
| `build` | Yes | — |

Run affected only: `npx nx affected --target=lint`. Force clean: `--skip-nx-cache`.

### Deployment topology (free tier)
```
Vercel (free hobby)
  └── applications/owner-app/web
  └── applications/admin-app/web
  └── applications/super-admin-app/web

Railway / Render (free tier)
  └── services/api-gateway      ($5 credit/month on Railway)
  └── services/owner-service
  └── services/admin-service
  └── services/super-admin-service
  └── services/media-service

External services (all free tier)
  └── Neon (PostgreSQL — DATABASE_URL)
  └── Upstash (Redis — REDIS_URL)
  └── Cloudflare R2 (Object storage — S3_ENDPOINT / S3_BUCKET_*)
  └── FCM (Push notifications — always free)
  └── Razorpay test mode (Payments — free)
```

## Behaviour when active

### Monorepo governance
- New shared code goes in `packages/` only if consumed by ≥2 workspaces; otherwise keep it in the consuming app or service.
- Circular workspace dependencies are forbidden. Dependency direction: `applications/* → packages/*` and `services/* → packages/*`, never the reverse.
- `shared-types` is handwritten — not generated. Add new types there when a domain concept is shared across services and apps.
- `shared-validators` Zod schemas are the contract between frontend forms and backend DTOs. When either changes, update both together.
- Root `eslint.config.mjs` is the single ESLint config. No workspace-local overrides unless documented.

### Design system governance
- Every new UI primitive shared across ≥2 apps belongs in `shared-ui-components`.
- Web components in `src/web/`, mobile in `src/mobile/`, shared logic in `src/common/`.
- No runtime dependencies in `shared-ui-components` — peer deps only (React, React Native).
- Breaking API changes to a shared component require updating all consumers before merge.

### Technology selection framework
1. Is there already something in the monorepo that solves this? (prefer reuse)
2. Does it work with both Next.js 15 (web) and React Native 0.74 (mobile)?
3. Does it respect the multi-tenant, soft-delete, and PII encryption rules?
4. Is it available on the free tier for hobby use?
5. What is the migration cost if this is the wrong choice?

## Usage

```
/web-ui-architect                    # activate lens for this session
/web-ui-architect review             # architecture review of current changes or the whole monorepo
/web-ui-architect dep <package>      # analyse impact of adding/removing a dependency
/web-ui-architect tokens             # audit design token usage and consistency
/web-ui-architect boundary           # identify where a new feature belongs (app, service, or package)
/web-ui-architect adr <decision>     # draft an Architecture Decision Record
/web-ui-architect ci                 # review or extend the GitHub Actions CI/CD pipeline
/web-ui-architect deploy             # review Railway/Vercel/Neon/Upstash deployment topology
```

### `review` mode
1. **Workspace boundaries** — circular deps? Misplaced shared code?
2. **Design token compliance** — any hardcoded colours/spacing not from `shared-ui-tokens`?
3. **Multi-tenant safety** — can any API response leak cross-society data to the frontend?
4. **Image pattern** — all `<img src>` values constructed from `imageId`, not raw storage keys?
5. **i18n coverage** — hardcoded English strings that should use `shared-i18n`?
6. **Recommendations** — up to 5 prioritised items with effort (S/M/L)

### `adr <decision>` mode
```
# ADR-NNN: <Title>

## Status
Proposed

## Context
<What is the problem? What constraints exist in this monorepo?>

## Decision
<What are we doing?>

## Consequences
**Positive:** ...
**Negative:** ...
**Risks:** ...

## Alternatives considered
| Option | Pros | Cons | Rejected because |
```
