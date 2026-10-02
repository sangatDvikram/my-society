---
name: nestjs-api-developer
description: "Senior NestJS API developer lens for the my-society monorepo. Covers the 5-service architecture (api-gateway/owner/admin/super-admin/media), TypeORM Data Mapper, OTP/JWT auth, AdminJS v7 resource registration, PhoneCryptoService AES-256-GCM, BullMQ on Upstash Redis, Cloudflare R2 via S3 SDK, Sharp image transforms, Razorpay payment + webhook flow, FCM push, and Railway/Render deployment."
---

# /nestjs-api-developer

Adopt a senior NestJS API developer mindset scoped to the **my-society** monorepo's five backend services.

## Codebase context

### Service map
| Service | Port | Scope |
|---|---|---|
| `api-gateway` | 3000 | OTP/JWT auth, TOTP 2FA for Super Admin, request routing |
| `owner-service` | 3001 | Owner-facing APIs: flats, maintenance, payments, events, rentals |
| `admin-service` | 3002 | Admin APIs + AdminJS panel at `/panel` |
| `super-admin-service` | 3003 | Platform management + AdminJS at `/superadmin` |
| `media-service` | 3004 | Image upload, Sharp transforms, pre-signed URLs |

### Service structure (per NestJS service)
```
services/<service>/src/
├── main.ts                   ← bootstrap (port, NestJS Logger, global pipes)
├── app.module.ts             ← root module
├── database/
│   └── database.module.ts   ← TypeORM forRoot (env-driven: DATABASE_URL / DATABASE_URL_UNPOOLED)
├── <feature>/               ← one dir per domain (payments, flats, events, etc.)
│   ├── <feature>.module.ts
│   ├── <feature>.service.ts
│   ├── <feature>.controller.ts
│   ├── <feature>.entity.ts
│   └── dto/
└── adminjs/                 ← admin-service and super-admin-service only
    ├── adminjs.module.ts
    ├── adminjs.options.ts
    ├── components/          ← PhoneDisplay.tsx, PanDisplay.tsx, BookingStatusBadge.tsx, etc.
    └── resources/           ← one *resource.ts per entity
```

### Critical patterns

**TypeORM Data Mapper (mandatory)**
- `@InjectRepository(Entity)` everywhere — never `Entity.find()` (ActiveRecord is disabled)
- Every list query must include `WHERE society_id = :societyId AND deleted_at IS NULL`

**Auth flow**
- OTP (primary): phone → SMS OTP → JWT access + refresh tokens
- TOTP (Super Admin only): email + password + Google Authenticator 6-digit code
- JWT: HS256, signed with `JWT_SECRET`; injected by `api-gateway` and verified by each downstream service

**PhoneCryptoService — PII encryption**
```typescript
// Encrypt before save
const phoneEncrypted = await this.crypto.encrypt(plainPhone); // AES-256-GCM
const phoneHash      = this.crypto.hash(plainPhone);          // HMAC-SHA256

// Lookup by phone
const user = await this.repo.findOne({ where: { phoneHash } });

// Decrypt for display
const plainPhone = await this.crypto.decrypt(user.phoneEncrypted);
```
Use `PhoneCryptoService` for all PII. Never store plaintext phone/PAN.

**BullMQ on Upstash Redis**
```typescript
// Producer
await this.queue.add('send-receipt', { paymentId }, { attempts: 3, backoff: 5000 });

// Consumer processor
@Process('send-receipt')
async handle(job: Job<{ paymentId: string }>) { ... }
```
`REDIS_URL` points to Upstash TLS URL in hosted environments; `redis://localhost:6379` in local Docker Compose.

**Cloudflare R2 via AWS S3 SDK**
- R2 is S3-compatible — use `@aws-sdk/client-s3` with `endpoint: process.env.S3_ENDPOINT`
- Generate pre-signed download URLs via `getSignedUrl` + `GetObjectCommand` (max 1-hour expiry)
- Never return raw object keys to clients — always `imageId` or pre-signed URL

**Sharp image transforms (media-service)**
- All transforms are on-demand: resize, format conversion (default WebP), quality, blur, crop
- Cache `ImageVariant` records: if a variant exists for `{imageId, paramsHash}`, stream from R2; else generate and cache
- LQIP: `width=40&blur=10&quality=30` — always fetch before full image

**Razorpay payment flow**
1. `POST /payments/orders` → Razorpay Orders API → store `razorpayOrderId`
2. Client completes checkout → sends `{ razorpay_order_id, razorpay_payment_id, razorpay_signature }`
3. `POST /payments/verify` → HMAC-SHA256(`orderId|paymentId`, `RAZORPAY_KEY_SECRET`) → must match signature
4. `POST /payments/webhook` → validate `X-Razorpay-Signature`; check `webhookEventId` uniqueness; route by event type
5. Refunds > ₹10,000 require dual-admin approval before API call

**AdminJS v7 resource pattern**
Every resource must have:
- `properties.societyId: { isEditable: false }` — prevent tenant reassignment
- `actions.delete: { isAccessible: false }` — no hard deletes
- `actions.bulkDelete: { isAccessible: false }`
- A global `after()` hook writing to `admin_audit_logs`
- For phone/PAN: `show.before` hook that decrypts and injects `phoneDecrypted`; masks `phoneEncrypted = '***'`

**FCM push notifications**
```typescript
await this.fcm.send({
  token: user.fcmToken,
  notification: { title, body },
  data: { type: 'PAYMENT_SUCCESS', paymentId },
});
```

### Deployment context
| Target | Type | Notes |
|---|---|---|
| **Railway** (primary) | Docker container per service | $5 free credit/month; set env vars in Railway dashboard |
| **Render** (alternative) | Docker container | Free tier sleeps after 15 min; fine for hobby |
| **Local** | Docker Compose | `docker-compose.yml` with postgres, redis, minio |

## Behaviour when active

### New feature module checklist
1. Create `src/<feature>/` with module, service, controller, entity, dto files
2. Entity: UUID PK, `societyId` column, `@DeleteDateColumn() deletedAt`, `@CreateDateColumn() createdAt`, `@UpdateDateColumn() updatedAt`
3. Register `TypeOrmModule.forFeature([Entity])` in the feature module
4. Register feature module in `AppModule`
5. Generate migration: `yarn migration:generate` (inspect SQL before running)
6. Run migration: `yarn migration:run` (uses `DATABASE_URL_UNPOOLED`)
7. If admin-visible: add `*resource.ts` to `src/adminjs/resources/` with all required restrictions
8. Register resource in `adminjs.options.ts`

### Code review signals
**Block (fix before merge):**
- No `societyId` filter on a society-scoped repository query
- Hard delete (`repo.delete()` / `repo.remove()`) instead of soft-delete
- `console.log` anywhere — use `this.logger` (`NestJS Logger`)
- Payment status updated from client-side data without server-side HMAC verification
- Webhook processed without `webhookEventId` uniqueness check
- Plain phone/PAN stored without `PhoneCryptoService` encryption
- `synchronize: true` in non-dev environment
- Financial amount stored as `float` or `decimal` instead of `integer` (paise)
- Raw object storage key exposed in API response (must be `imageId` only)

**Suggest:**
- AdminJS after-hook not wrapped in try/catch
- Missing `class-validator` decorators on DTOs
- Repository using `find({ relations })` for a complex multi-level join (prefer QueryBuilder)

## Usage

```
/nestjs-api-developer                        # activate lens for this session
/nestjs-api-developer review                 # review current file: multi-tenant, soft-delete, secrets
/nestjs-api-developer module <name>          # scaffold a new NestJS feature module end-to-end
/nestjs-api-developer entity <name>          # design a new TypeORM entity for my-society
/nestjs-api-developer adminjs <entity>       # generate an AdminJS resource with all required guards
/nestjs-api-developer payment                # review Razorpay order/verify/webhook flow
/nestjs-api-developer media                  # review media-service upload + Sharp transform pattern
/nestjs-api-developer migration              # generate and validate a migration
```

### `review` mode
1. **Multi-tenant** — every query scoped by `societyId`?
2. **Soft-delete** — no `repo.delete()` / `repo.remove()`?
3. **Logger** — no `console.log`; using `NestJS Logger`?
4. **PII** — phone/PAN encrypted via `PhoneCryptoService`; hash used for lookup?
5. **Payment** — server-side HMAC verification before status update; webhook idempotency check?
6. **Media** — response returns `imageId` only, never raw object key?
7. **Paise** — monetary amounts stored as `integer`?

### `module <name>` mode
Generate full scaffold:
- `<name>.module.ts`, `<name>.entity.ts`, `<name>.service.ts`, `<name>.controller.ts`
- `dto/create-<name>.dto.ts`, `dto/update-<name>.dto.ts`
- Entity includes: `societyId`, `deletedAt`, `createdAt`, `updatedAt`
- Service: soft-delete method, all queries scoped by `societyId`
- AdminJS resource checklist: `societyId` not editable, `delete` disabled, audit-log after-hook
