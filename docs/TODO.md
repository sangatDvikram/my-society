# Implementation TODO — Society Management System

> Tracks what's built and what's next. Source of truth: `docs/PRD.md` + `docs/EPIC.md`.  
> Status: ✅ Done · 🔄 In Progress · ⬜ Not Started

---

## Phase 1 — Auth Foundation (EPIC-02) `34 SP`

### 02.1 + 02.2 ✅ Done
- `packages/shared-types` — UserRole, JwtPayload, PhoneFields, E164Phone
- `packages/shared-validators` — phoneSchema, sendOtpSchema, verifyOtpSchema, refreshTokenSchema, verifyTotpSchema
- `services/api-gateway/src/common/crypto/kms.service.ts` — KmsService
- `services/api-gateway/src/common/crypto/phone-crypto.service.ts` — PhoneCryptoService (AES-256-GCM)
- Unit tests: 15 passing

### 02.3 AuthModule — OTP · JWT · TOTP · RBAC ✅ Done

#### 02.3.A OTP Flow
- [x] Install: `@nestjs/jwt` `@nestjs/passport` `passport` `passport-jwt` `bcrypt` `ioredis` + types
- [x] `src/auth/otp/otp.service.ts` — generateOtp (6-digit crypto-random), storeOtp (Redis, bcrypt hash, 300s TTL), validateOtp
- [x] `src/auth/otp/sms.service.ts` — stub logs OTP in dev; prod calls SMS provider via env config
- [x] `POST /auth/otp/send` — SendOtpDto → hashPhone → storeOtp → sendOtp → `{ message }`

#### 02.3.B JWT
- [x] `src/auth/strategies/jwt.strategy.ts` — PassportStrategy(Strategy), HS256, validates JwtPayload
- [x] `src/auth/guards/jwt-auth.guard.ts` — AuthGuard('jwt'), throws UnauthorizedException
- [x] `POST /auth/otp/verify` — validate OTP, issue accessToken (15m) + refreshToken (30d bcrypt hash in Redis) → AuthTokenPair
- [x] `POST /auth/token/refresh` — validate refresh hash → re-issue accessToken (token rotation)
- [x] `POST /auth/token/revoke` — delete refresh hash (logout)

#### 02.3.C RBAC
- [x] `src/auth/decorators/roles.decorator.ts` — @Roles(...UserRole[]) via SetMetadata
- [x] `src/auth/guards/roles.guard.ts` — RolesGuard: checks role + blocks cross-society (user.societyId ≠ param)

#### 02.3.D TOTP 2FA (Super Admin)
- [x] Install: `otplib@^12.0.1`
- [x] `src/auth/totp/totp.service.ts` — generateSecret(), verifyToken()
- [x] `POST /auth/2fa/totp/setup` — @Roles(SUPER_ADMIN) → secret + QR URI
- [x] `POST /auth/2fa/totp/verify` — accepts VerifyTotpDto → verifies TOTP token
- [x] `src/auth/auth.module.ts` — wires CryptoModule, JwtModule, PassportModule

### 02.4 Security Guards ✅ Done
- [x] Install: `@nestjs/throttler`
- [x] ThrottlerModule global + @Throttle decorator on OTP endpoint (5 req / 600s)
- [x] OtpThrottlerGuard — IP-based tracker override
- [x] rawBody: true in NestFactory.create for WebhookSignatureGuard
- [x] `src/common/guards/webhook-signature.guard.ts` — HMAC-SHA256 timingSafeEqual vs X-Razorpay-Signature
- [ ] Unit tests: valid sig passes, tampered fails, missing header → 401

### 02.5 Key Rotation BullMQ (scaffold)
- [ ] Install: `bullmq` `@nestjs/bullmq`
- [ ] `DekRotationJob` — batch 1000, decrypt old → encrypt new DEK, single transaction
- [ ] `HmacRotationJob` — batch 1000, dual-write old+new hash during transition
- [ ] `POST /admin/crypto/rotate-dek` + `POST /admin/crypto/rotate-hmac` — @Roles(SUPER_ADMIN) → enqueue → `{ jobId, status }`

---

## Phase 2 — Core Entities & CRUD (EPIC-03) `21 SP` ✅ Done

- [x] `Society` entity + CRUD endpoints in admin-service
- [x] `Wing` entity with FK to Society
- [x] `Flat` entity — owner FK, status enum (OCCUPIED | VACANT | UNDER_RENOVATION | RENTED)
- [x] Owner onboarding by Admin — create User (with phone encryption, INVITED status)
- [x] Staff sub-role management (Guard, Maintenance Staff, Accountant)
- [x] Society config endpoint (visitor hours, parking limits, SLA timers per category)
- [x] Society deactivation (INACTIVE, preserve data)
- [x] Society-scoped isolation enforcement on all queries
- [x] CryptoModule in admin-service (KmsService + PhoneCryptoService)
- [x] CommonModule: JwtGuard, RolesGuard, CryptoServices (global)
- [x] SocietyModule: Society, Wing, Flat, User CRUD wired together
- [x] ValidationPipe added to admin-service main.ts
- [ ] Super Admin society provisioning in super-admin-service (deferred to EPIC-15 AdminJS)

---

## Phase 3 — Visitor Logging (EPIC-04) `34 SP` ✅ Core Done

- [x] `VisitorLog` entity — AES-256-GCM phone (BYTEA), GDPR consent, VisitorStatus enum (PENDING/APPROVED/REJECTED/TIMEOUT/INSIDE/EXITED)
- [x] Walk-in entry flow — guard creates entry, real phone encryption via PhoneCryptoService
- [x] Pre-approved visitor flow — owner generates 6-digit OTP token (SHA-256 hashed, stored); guard enters at gate
- [x] Owner approve/reject endpoint
- [x] Exit marking — guard marks INSIDE→EXITED with exitTime + exitGuardId
- [x] CryptoModule added to owner-service (env-based KmsService without @nestjs/config)
- [x] api-gateway proxy: POST /visitors, /visitors/pre-approve, /visitors/pre-approved-entry, PATCH /:id/approve, /:id/reject, /:id/enter, /:id/exit
- [x] admin-service VisitorAdminModule: GET /visitor-logs (filtered by date/status/flat), GET /today-stats, GET /:id
- [ ] Push notification to Owner (≤ 5s) — EPIC-14 dependency, stubbed
- [ ] 2-min timeout auto-deny — BullMQ job (EPIC-02.5 dependency)
- [ ] Long-stay alert (configurable threshold) — BullMQ job
- [ ] Block-list check on visitor phone hash
- [ ] Staff / domestic help recurring entry bypass
- [ ] Guard flag workflow for staff

---

## Phase 4 — Maintenance Requests (EPIC-05) `21 SP`

- [ ] `MaintenanceRequest` entity — category, description, photos, status enum
- [ ] Owner raises request (photos optional via object storage)
- [ ] Admin triage + assign to Maintenance Staff
- [ ] State machine: `OPEN → IN_PROGRESS → RESOLVED → CLOSED`
- [ ] Owner reopen within 48h (audit trail entry)
- [ ] SLA timers per category; breach → Admin alert
- [ ] All transitions timestamped + attributed to acting user

---

## Phase 5 — Payments & Billing (EPIC-06 + 07 + 08) `110 SP`

### 06 Payments
- [ ] Monthly invoice auto-generation cron (1st of month)
- [ ] Razorpay Checkout — UPI collect/intent, card, net banking, EMI, wallets
- [ ] Payment failure reminders: +3d, +7d, +15d (push + SMS)
- [ ] Configurable late fees (flat amount or %)
- [ ] Transaction log with razorpay payment_id, order_id, signature
- [ ] Admin offline payment recording (cash/cheque)
- [ ] UPI Autopay recurring mandate
- [ ] Razorpay webhook endpoint + HMAC-SHA256 signature guard
- [ ] Webhook idempotency via webhookEventId dedup
- [ ] Admin refund via Razorpay Refund API (dual-admin approval if > ₹10,000)
- [ ] Payment receipt PDF (Puppeteer) → object storage → 24h pre-signed link

### 07 Financial Year Audit PDFs
- [ ] `AuditReport` entity (versioning, status enum, SHA-256 checksum, storage key)
- [ ] BullMQ scheduled job — auto-generate society audit at 00:01 IST April 1
- [ ] Owner statement PDF — sync (≤12 txn) + async BullMQ path
- [ ] Society audit PDF content (cover, exec summary, monthly tables, flat-wise, dues, refunds, ledger)
- [ ] Owner statement content (owner details, itemised payments, total, dues)
- [ ] SHA-256 checksum in PDF XMP metadata + DB
- [ ] Admin on-demand regeneration (new version, previous archived)
- [ ] Admin review + explicit publish workflow (DRAFT → PUBLISHED immutable)
- [ ] Object storage path convention
- [ ] Pre-signed download URLs (1h max); public bucket blocked
- [ ] RBAC: Admin/Accountant (draft+published), Owner (published only)

### 08 Bank Account Management
- [ ] `SocietyBankAccount` entity (encrypted account number, IFSC, Razorpay IDs)
- [ ] ADMIN/SUPER_ADMIN only create/modify
- [ ] AES-256-GCM encrypted account number; last-4 for display
- [ ] IFSC validation via Razorpay IFSC API before save
- [ ] Razorpay Contact + Fund Account creation on save
- [ ] Reverse Penny Drop flow — PENDING_VERIFICATION until webhook
- [ ] Webhook: fund_account.validation.completed → VERIFIED / VERIFICATION_FAILED
- [ ] Primary account: only one PRIMARY per society, atomic swap in transaction
- [ ] Soft-delete (INACTIVE); PRIMARY cannot be deactivated without replacement
- [ ] All events logged to admin_audit_logs (masked account number)

---

## Phase 6 — Flat Rental & Tenant Management (EPIC-09) `34 SP`

- [ ] `TenantProfile` entity — encrypted phone (dual-col) + encrypted PAN + panLast4
- [ ] `FlatRental` entity — rental terms, status enum (ACTIVE | ENDED | EXPIRED)
- [ ] `RentalDocument` entity — version history, storage key, SUPERSEDED flag
- [ ] One-active-tenancy-per-flat constraint → 409 Conflict
- [ ] Pre-signed upload URL for Rent Agreement + PAN Card (15-min expiry)
- [ ] Document confirmation endpoint → creates DB record after direct upload
- [ ] Object storage key: `rental-documents/{societyId}/{flatId}/{rentalId}/{docType}/{v}_{filename}`
- [ ] Version archiving — previous SUPERSEDED, never deleted
- [ ] Flat status → RENTED on tenancy creation; Admin notified
- [ ] Tenancy end flow — VACANT, Admin notified, 90-day retention before GDPR anonymisation
- [ ] GDPR anonymisation BullMQ job
- [ ] Agreement renewal reminders: 30d + 7d before agreementEndDate
- [ ] Admin privileged endpoint — decrypt tenant phone with audit log
- [ ] Owner view — masked tenant details; Admin sees all

---

## Phase 7 — Common Facility Management (EPIC-10) `55 SP`

- [ ] `CommonFacility` entity (pricing model, booking window, cancellation policy)
- [ ] `FacilityBlackout` entity (datetime range, reason)
- [ ] `FacilityBooking` entity (full state machine, payment link)
- [ ] Facility CRUD (Admin/Super Admin only); up to 10 photos per facility
- [ ] Pricing model: Fixed / Hourly / Variable (JSON schedule, paise)
- [ ] Blackout management — 409 on overlap, calendar shows greyed dates
- [ ] Booking window enforcement (maxAdvanceDays, minAdvanceHours)
- [ ] Double-booking prevention (row-level lock)
- [ ] Booking state machine: PENDING_APPROVAL → APPROVED → CONFIRMED; REJECTED/CANCELLED
- [ ] BullMQ auto-reject stale PENDING_APPROVAL after autoRejectHours
- [ ] Admin approval — fee calc, Razorpay order, owner payment notify
- [ ] BullMQ payment timeout — auto-cancel APPROVED after paymentDeadlineHours
- [ ] payment.captured webhook → CONFIRMED, Payment record, invoice PDF
- [ ] Owner cancellation — refund per cancellation policy, Razorpay refund
- [ ] Admin cancellation — full refund + apology notify
- [ ] Owner facility list — pre-signed photos, pricing, availability calendar
- [ ] Booking visibility by role; filterable calendar view
- [ ] AdminAuditLog for all facility + booking admin actions

---

## Phase 8 — Vendor Management (EPIC-11) `21 SP`

- [ ] `VendorProfile` entity — encrypted phone, serviceCategory varchar, status enum
- [ ] `VendorDocument` entity — storage key, version, mime type, doc type enum
- [ ] `VendorPhoneRevealLog` entity — audit trail for reveals
- [ ] Vendor CRUD (Admin/Super Admin only); up to 5 documents
- [ ] Document upload via pre-signed URLs (society-vendor-documents bucket)
- [ ] Extensible serviceCategory — seeded standard values; new categories without migration
- [ ] Vendor status toggle ACTIVE ↔ INACTIVE (60s cache TTL)
- [ ] Owner-facing directory — masked phone; single-tap reveal + 5-min client timer
- [ ] Phone reveal logged in VendorPhoneRevealLog
- [ ] Directory filterable by serviceCategory; INACTIVE/DELETED excluded
- [ ] Soft-delete (DELETED); invisible to all list views
- [ ] All admin actions → AdminAuditLog (entityType = VENDOR)

---

## Phase 9 — Events + Media (EPIC-12 + 13) `55 SP`

### 12 Society Events
- [ ] `SocietyEvent` entity (isPinned, createdByRole, linkedFacilityBookingId)
- [ ] `EventRsvp` entity — unique(eventId, ownerId), cancellable
- [ ] `EventChangeLog` entity — immutable append-only audit log
- [ ] Event CRUD (Owner + Admin); society-scoped from JWT
- [ ] Extensible eventType varchar
- [ ] Facility booking link validation (CONFIRMED, same society, overlapping slot)
- [ ] Background job: if linked FacilityBooking cancelled → nullify link + notify organiser
- [ ] RSVP management — count-gated, 409 when full, cancel up to startDatetime
- [ ] Event lifecycle BullMQ job (every 5 min) — UPCOMING → ONGOING → COMPLETED
- [ ] Post-completion media upload window: 7 days; after → 403
- [ ] Event feed — pinned first, upcoming asc, ongoing, completed desc; cursor pagination
- [ ] Admin pin/unpin — atomic unpin of previous
- [ ] BullMQ notifications: publish, 24h reminder, cancellation, removal
- [ ] Admin moderation — REMOVED with reason; retained in DB
- [ ] Admin official event — createdByRole = ADMIN; "Society Official" badge
- [ ] AdminAuditLog for admin actions; event_change_log for organiser edits

### 13 Event Media
- [ ] `EventMedia` entity (media type, status, storage key, thumbnail key, mime type)
- [ ] Pre-signed upload URL request + confirm flow
- [ ] Photo limits: JPEG/PNG/WEBP ≤ 20 MB each, max 50 per event
- [ ] Video limits: MP4/MOV ≤ 500 MB each, max 5 per event
- [ ] Storage: society-event-media bucket, server-side encryption
- [ ] BullMQ thumbnail: Sharp 480×480 WebP for photos
- [ ] BullMQ thumbnail: FFmpeg 1-second frame for videos
- [ ] Media gallery endpoint — metadata + thumbnail pre-signed URLs (1h)
- [ ] Full-res download via separate pre-signed GET
- [ ] Upload permission: organiser + Admins only; status window check
- [ ] Admin media moderation — REMOVED; event unaffected
- [ ] AdminAuditLog for media moderation

---

## Phase 10 — Notifications & Announcements (EPIC-14) `21 SP`

- [ ] FCM push notification service (iOS + Android)
- [ ] In-app bell notification — storage + read/unread state
- [ ] BullMQ notification queue with delayed job support
- [ ] Owner quiet-hours preference storage + enforcement
- [ ] Emergency alert — bypasses quiet hours
- [ ] Admin announcement broadcast (text + image) → all society owners
- [ ] Announcement logged in announcements table
- [ ] Visitor arrival notification to Owner (≤ 5s)
- [ ] Maintenance request status change notifications
- [ ] Payment reminder notifications (+3d, +7d, +15d)

---

## Phase 11 — AdminJS Panels (EPIC-15) `34 SP`

- [ ] AdminJS full setup in admin-service (/panel) — JWT-based session auth
- [ ] AdminJS full setup in super-admin-service (/superadmin) — Email + TOTP
- [ ] Express-session backed by Redis; 8h TTL; HttpOnly/Secure/SameSite=Strict
- [ ] Global after() audit hook — all actions → admin_audit_logs
- [ ] AdminAuditLog entity (actorId, action, resource, changedFields, IP)
- [ ] Full resource definitions (Society, Flat, User, Payment, VisitorLog, SocietyBankAccount, FlatRental, TenantProfile, CommonFacility, FacilityBooking, VendorProfile, SocietyEvent, EventMedia, AuditReport, FeatureFlag)
- [ ] Custom PhoneDisplay.tsx — server-side decrypt before render
- [ ] Custom PanDisplay.tsx — masked PAN (panLast4 only)
- [ ] Custom BookingStatusBadge.tsx + EventStatusBadge.tsx
- [ ] Global: no hard delete, no bulk delete, societyId not editable, payments immutable
- [ ] Tenant-scoping before() hook on list actions — append societyId from JWT
- [ ] Super Admin dashboard — 6 widgets (societies, users, revenue, pending audits, failed BullMQ jobs, active flags)
- [ ] Feature flag resource — toggle + propagate ≤ 60s

---

## Phase 12 — Frontend Apps (EPIC-16 + 17 + 18) `212 SP`

### 16 Owner App (Mobile + Web)
- [ ] OWN-001: Phone OTP login
- [ ] OWN-002: Visitor pre-approval (QR/OTP)
- [ ] OWN-003: Visitor arrival notification + approve/reject
- [ ] OWN-004: Maintenance bill + Razorpay checkout
- [ ] OWN-005: Raise maintenance request
- [ ] OWN-006: Maintenance log history
- [ ] OWN-007: Invoice PDF download
- [ ] OWN-008: GDPR opt-out screen
- [ ] OWN-009: Account deletion request
- [ ] OWN-010: Domestic staff recurring entry
- [ ] OWN-011: FY payment statement PDF
- [ ] OWN-012: FY audit report notification + viewer
- [ ] OWN-013 to OWN-017: Flat rental management
- [ ] OWN-018 to OWN-022: Facility booking flow
- [ ] OWN-023: Vendor directory
- [ ] OWN-024 to OWN-030: Events + RSVP + media

### 17 Admin App (Mobile + Web)
- [ ] ADM-001 to ADM-030 (see EPIC.md for full list)

### 18 Super Admin App (Web)
- [ ] SAD-001 to SAD-008 (see EPIC.md for full list)

---

## Phase 13 — Shared Packages + GDPR (EPIC-19 + 20) `42 SP`

### 19 Shared Packages
- [ ] shared-types — remaining interfaces (Society, Flat, User, Payment, etc.)
- [ ] shared-validators — IFSC, document upload, booking, event Zod schemas
- [ ] shared-ui-tokens/oat-overrides.css — standalone Oat UI CSS variable overrides
- [ ] shared-ui-components/src/web/ — Button, Card, Badge, Dialog, DataTable, StatusBadge
- [ ] shared-ui-components/src/mobile/ — Button, Card, Badge, BottomSheet, StatusBadge (NativeWind)
- [ ] shared-ui-components/src/shared/ — platform-agnostic hooks + constants
- [ ] shared-i18n — translations (en, hi, mr) for all UI strings
- [ ] NativeWind v4 Babel/Metro config per mobile app

### 20 GDPR Compliance
- [ ] GDPR consent capture for visitor photos
- [ ] Owner opt-out preference storage + analytics suppression (≤ 24h)
- [ ] Account deletion request → erasure workflow (≤ 30 days)
- [ ] Data portability export (JSON/CSV with dual-admin approval)
- [ ] Tenant GDPR anonymisation BullMQ job (90d post-tenancy)
- [ ] deleted_at soft-delete on all PII-bearing entities
- [ ] GDPR erasure SLA tracking (≤ 30d breach alerting)
- [ ] WCAG 2.1 Level AA audit on web dashboards
- [ ] React Native accessibility (VoiceOver + TalkBack)
- [ ] i18n — all UI strings externalised; dates in UTC + society timezone

---

## Implementation Order (priority)

```
Phase 1 (EPIC-02.3+) → Phase 2 (EPIC-03) → Phase 3 (EPIC-04) →
Phase 4 (EPIC-05) → Phase 5 (EPIC-06+07+08) → Phase 6 (EPIC-09) →
Phase 7 (EPIC-10) → Phase 8 (EPIC-11) → Phase 9 (EPIC-12+13) →
Phase 10 (EPIC-14) → Phase 11 (EPIC-15) → Phase 13 (EPIC-19) →
Phase 12 (EPIC-16+17+18) → Phase 13 (EPIC-20)
```

---

*Updated: 2026-06-16 · Based on PRD v1.0.0*
