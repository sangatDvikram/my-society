# Epic Estimates — Society Management & Logging System

**Version:** 1.0.0  
**Date:** 2026-05-02  
**Based on PRD:** v1.0.0  
**Estimation Scale:** Fibonacci Story Points (1 · 2 · 3 · 5 · 8 · 13 · 21 · 34 · 55 · 89)

---

## Story Point Reference

| Points | Effort Approximation |
|--------|----------------------|
| 1–3    | Trivial to 1 day |
| 5–8    | 2–4 days |
| 13     | ~1 week |
| 21     | ~1.5–2 weeks |
| 34     | ~3–4 weeks |
| 55     | ~5–6 weeks |
| 89     | ~2 months |

---

## Epic Summary

| # | Epic | Story Points |
|---|------|:---:|
| EPIC-01 | Monorepo, Infrastructure & DevOps | 55 |
| EPIC-02 | Authentication, Encryption & Security | 34 |
| EPIC-03 | Society, Wing & Flat Management | 21 |
| EPIC-04 | Visitor Logging System | 34 |
| EPIC-05 | Maintenance Request System | 21 |
| EPIC-06 | Payments & Billing (Razorpay) | 55 |
| EPIC-07 | Financial Year Audit & PDF Reports | 34 |
| EPIC-08 | Society Bank Account Management | 21 |
| EPIC-09 | Flat Rental & Tenant Management | 34 |
| EPIC-10 | Common Facility Management | 55 |
| EPIC-11 | Common Services Vendor Management | 21 |
| EPIC-12 | Society Event Management | 34 |
| EPIC-13 | Event Media — Photos & Videos | 21 |
| EPIC-14 | Notifications & Announcements | 21 |
| EPIC-15 | AdminJS Panels (Admin + Super Admin) | 34 |
| EPIC-16 | Owner App — Mobile (React Native) + Web (Next.js) | 89 |
| EPIC-17 | Admin App — Mobile (React Native) + Web (Next.js) | 89 |
| EPIC-18 | Super Admin App — Web (Next.js) | 34 |
| EPIC-19 | Shared Packages & Design System | 21 |
| EPIC-20 | GDPR Compliance & Data Governance | 21 |
| | **TOTAL** | **749 SP** |

> **Velocity assumption:** ~45 SP / 2-week sprint (team of 4–6 engineers)  
> **Estimated timeline:** ~17 sprints ≈ **8–9 months**

---

## Detailed Epics

---

### ✅ EPIC-01 · Monorepo, Infrastructure & DevOps `55 SP`

- [x] Initialise Lerna monorepo with npm workspaces and independent versioning
- [x] Configure root `tsconfig.base.json` and per-package `tsconfig.json` files
- [x] Set up `nx.json` for optional Nx task-runner caching
- [x] Author GitHub Actions CI workflow (lint → type-check → test → SAST → Snyk)
- [x] Configure global ESLint 9 flat config (`eslint.config.mjs`), Prettier (`.prettierrc.json`), and root `jsconfig.json`
- [x] Scaffold application and backend service boilerplates (`shared-nextjs-config`, `shared-ui-tokens` preset, Next.js 15 web apps with Tailwind + Oat UI, NestJS services with TypeORM)
- [x] Author GitHub Actions CD/deploy workflow (Docker build → ECR push → Helm upgrade)
- [x] Write multi-stage Dockerfiles for all five NestJS services (`api-gateway`, `owner-service`, `admin-service`, `super-admin-service`, `media-service`) + root `.dockerignore`
- [x] Configure Oat UI (`@knadh/oat` v0.5.0) in all three Next.js web apps — `postcss-import` pipeline, `@import` in `globals.css`, CSS custom property overrides, `src/types/global.d.ts` CSS module declarations
- [x] Implement `shared-nextjs-config` `createNextConfig` factory with eager `copySharedAssets` (copies `shared-ui-assets` → `public/` at config-eval time; works for both Turbopack and webpack)
- [x] Move components to `@society/shared-ui-components` — `ClickCounter` component in `src/web/`, barrel exports in `src/web/index.ts` and `src/index.ts`, package exports point to `./src` for `transpilePackages`
- [ ] Provision AWS EKS cluster with namespaces per service
- [ ] Configure Horizontal Pod Autoscaler (HPA) per service (CPU 70% threshold)
- [ ] Provision AWS RDS PostgreSQL 16 (Multi-AZ primary + 2 read replicas)
- [ ] Provision AWS ElastiCache Redis cluster (BullMQ + session storage)
- [ ] Set up AWS S3 buckets with KMS encryption and lifecycle policies (Glacier at 1 yr, 7 yr retention for audit reports)
- [ ] Configure AWS CloudFront distribution for media-service CDN
- [ ] Set up AWS Secrets Manager + KMS key hierarchy (HMAC key, DEK per society)
- [ ] Deploy monitoring stack: Prometheus, Grafana, Loki, Tempo
- [ ] Write Helm charts with rolling-update strategy and zero-downtime deploys
- [ ] Configure AWS WAF rules on ALB

---

### ✅ EPIC-02 · Authentication, Encryption & Security `34 SP`

- [ ] Phone OTP generation and delivery (SMS gateway integration)
- [ ] E.164 phone number normalisation utility
- [ ] `PhoneCryptoService` — AES-256-GCM encrypt / decrypt with KMS-managed DEK
- [ ] HMAC-SHA256 phone hash for deterministic lookup (`phone_hash` column)
- [ ] JWT issuance and validation (`jwt.strategy.ts`, `jwt-auth.guard.ts`)
- [ ] TOTP 2FA for Super Admin (Google Authenticator compatible; `otplib`)
- [ ] PIN-based second factor for Admin
- [ ] Role-based access guard (`roles.guard.ts`) enforcing Owner / Admin / Super Admin / Staff roles
- [ ] API Gateway rate limiting (OTP endpoint: 5 req/min per phone)
- [ ] Webhook HMAC-SHA256 signature verification guard (`webhook-signature.guard.ts`)
- [ ] KMS DEK key rotation job (re-encrypt all `phone_encrypted` rows in batches of 1,000)
- [ ] HMAC secret rotation (re-compute all `phone_hash` values in low-traffic window)
- [ ] IP allowlisting for Admin/Super Admin routes (VPC-internal load balancer)

---

### ✅ EPIC-03 · Society, Wing & Flat Management `21 SP`

- [ ] `Society` entity, CRUD endpoints, and multi-tenant `society_id` scoping
- [ ] `Wing` entity with relation to Society
- [ ] `Flat` entity with owner FK, status enum (`OCCUPIED | VACANT | UNDER_RENOVATION | RENTED`)
- [ ] Owner onboarding by Admin — create user, send invite OTP
- [ ] Staff sub-role management (Guard, Maintenance Staff, Accountant)
- [ ] Society configuration endpoint (visitor hours, parking limits, SLA timers per category)
- [ ] Super Admin society provisioning workflow (creates tenant partition + KMS DEK)
- [ ] Subscription tier management and feature-flag propagation (≤ 60 s)
- [ ] Society deactivation (mark inactive, preserve data, block logins)
- [ ] Society-scoped data isolation enforcement across all queries

---

### ✅ EPIC-04 · Visitor Logging System `34 SP`

- [ ] `VisitorLog` entity with all fields (encrypted phone, GDPR consent, approval status)
- [ ] Walk-in visitor entry flow — guard captures name, phone (OTP-verified), photo, vehicle, purpose, host flat
- [ ] Pre-approved visitor flow — QR / OTP token generation by Owner, validation at gate terminal
- [ ] Push notification to Owner on visitor arrival (within 5 s)
- [ ] Owner approve / reject endpoint with 2-minute timeout handling
- [ ] Auto-deny on timeout — guard notified; entry denied
- [ ] Visitor exit flow — manual mark or second QR scan; exit timestamp + duration recorded
- [ ] Long-stay alert (configurable threshold, default 4 h)
- [ ] Staff / domestic help recurring entry — bypass owner-approval step
- [ ] Guard flag workflow for staff entries requiring Admin review
- [ ] Block-list (visitor / vehicle) — Admin creates entry; guard terminal alerts on match
- [ ] Admin dashboard — visitor activity auto-refresh every 10 s (entry/exit counts by wing)
- [ ] Monthly staff attendance report generation (Admin + relevant Owner)
- [ ] Soft-delete / GDPR erasure on `deleted_at` column

---

### ✅ EPIC-05 · Maintenance Request System `21 SP`

- [ ] `MaintenanceRequest` entity with category, description, photos, status enum
- [ ] Owner raises request — photos optional (S3 upload); Admin notified
- [ ] Admin triage and assignment to Maintenance Staff; staff notified via push
- [ ] State machine: `OPEN → IN_PROGRESS → RESOLVED → CLOSED`
- [ ] Owner reopen within 48 h (adds audit trail entry)
- [ ] Configurable SLA timers per category; breach triggers Admin alert
- [ ] All status transitions timestamped and attributed to acting user

---

### ✅ EPIC-06 · Payments & Billing (Razorpay) `55 SP`

- [ ] Monthly maintenance invoice auto-generation on the 1st of each month (`PAY-001`)
- [ ] Razorpay Checkout integration — UPI collect, UPI intent, card, net banking, EMI, wallets (`PAY-002`)
- [ ] Payment failure reminder jobs at +3 d, +7 d, +15 d via push + SMS (`PAY-003`)
- [ ] Configurable late fees per society (flat amount or percentage) (`PAY-004`)
- [ ] Transaction logging with Razorpay `payment_id`, `order_id`, `signature` (`PAY-005`)
- [ ] Admin offline payment recording (cash / cheque) (`PAY-006`)
- [ ] UPI Autopay recurring mandate opt-in and monthly auto-deduction (`PAY-007`)
- [ ] Razorpay webhook endpoint with HMAC-SHA256 signature verification (`PAY-008`)
- [ ] Webhook idempotency using `webhookEventId` deduplication
- [ ] Admin-initiated refund via Razorpay Refund API; status tracked in `payments` table (`PAY-009`)
- [ ] Test Mode support — credentials injected via env vars; never hardcoded (`PAY-010`)
- [ ] All Razorpay API keys stored in AWS KMS / Secrets Manager; rotation without redeployment (`PAY-011`)
- [ ] Payment receipt PDF generation (Puppeteer) — stored in S3; pre-signed 24 h download link (`PAY-012`)
- [ ] Facility booking payments classified under `FACILITY_BOOKING` in the inflow ledger (`FAC-013`)

---

### ✅ EPIC-07 · Financial Year Audit & PDF Reports `34 SP`

- [ ] `AuditReport` entity with versioning, status enum, SHA-256 checksum, S3 key (`7.2.7`)
- [ ] BullMQ scheduled job — auto-generate Society-Level Audit PDF at 00:01 IST on April 1 (`PAY-013`)
- [ ] Owner-Level Annual Statement PDF — synchronous (≤ 12 txn) + async BullMQ path (`PAY-014, PAY-021`)
- [ ] Society Audit PDF content: cover page, executive summary, month-wise inflow/outflow, flat-wise collection, outstanding dues, refunds, transaction ledger appendix (`PAY-015`)
- [ ] Owner Statement PDF content: owner details, itemised payments, total paid, outstanding dues (`PAY-016`)
- [ ] SHA-256 checksum embedding in PDF XMP metadata; checksum stored in DB (`PAY-017`)
- [ ] Admin on-demand regeneration — creates new version record; previous version archived (`PAY-018`)
- [ ] Admin review + explicit publish workflow; draft visible only to Admin/Accountant (`PAY-019`)
- [ ] S3 path convention: `audit-reports/{societyId}/{financialYear}/{reportType}/{version}.pdf` (`PAY-020`)
- [ ] S3 Lifecycle policy: transition to Glacier after 1 year; 7-year retention (`PAY-020`)
- [ ] Pre-signed S3 URLs for download (max 1-hour expiry); public S3 access blocked (`PAY-022`)
- [ ] Role-based access: Admin/Accountant (draft + published), Owner (published only), Super Admin (all) (`PAY-023`)
- [ ] Owner push + in-app notification when Admin publishes the FY report (`OWN-012`)

---

### ✅ EPIC-08 · Society Bank Account Management `21 SP`

- [ ] `SocietyBankAccount` entity with encrypted account number, IFSC, Razorpay identifiers (`7.2.8`)
- [ ] Bank account creation restricted to `ADMIN` / `SUPER_ADMIN` roles (`PAY-024`)
- [ ] AES-256-GCM encryption of account number; last-4 stored for masked display (`PAY-025`)
- [ ] IFSC validation via Razorpay IFSC API before save; invalid IFSC returns `400` (`PAY-026`)
- [ ] Razorpay Contact + Fund Account creation on new bank account (`PAY-027`)
- [ ] Reverse Penny Drop flow — Fund Account Validation; account stays `PENDING_VERIFICATION` until webhook (`PAY-028`)
- [ ] `fund_account.validation.completed` webhook — idempotent processing; status → `VERIFIED` / `VERIFICATION_FAILED` (`PAY-031`)
- [ ] Primary account management — only one `PRIMARY` per society; atomic swap in DB transaction (`PAY-029, PAY-030`)
- [ ] Soft-delete (status → `INACTIVE`); hard-delete prohibited; primary cannot be deactivated without replacement (`PAY-032`)
- [ ] All bank account events logged to `admin_audit_logs` with masked account number (`PAY-033`)

---

### ✅ EPIC-09 · Flat Rental & Tenant Management `34 SP`

- [ ] `TenantProfile` entity — encrypted phone (dual-column) + encrypted PAN + `panLast4` (`7.2.3b`)
- [ ] `FlatRental` entity with rental terms, status enum (`ACTIVE | ENDED | EXPIRED`), audit fields (`7.2.3c`)
- [ ] `RentalDocument` entity — version history, S3 key, SUPERSEDED flag
- [ ] One-active-tenancy-per-flat constraint returning `409 Conflict` (`RENT-004`)
- [ ] Pre-signed S3 PUT URL generation for Rent Agreement + PAN Card upload (`RENT-006`)
- [ ] Document confirmation endpoint — creates DB record after direct S3 upload (`RENT-006`)
- [ ] S3 key convention: `rental-documents/{societyId}/{flatId}/{rentalId}/{docType}/{v}_{filename}` (`RENT-008`)
- [ ] Version archiving — previous document version flagged `SUPERSEDED`, never deleted (`RENT-007`)
- [ ] Flat status update to `RENTED` on tenancy creation; Admin notified (`RENT-009`)
- [ ] Tenancy end flow — flat status → `VACANT`; Admin notified; 90-day retention before GDPR anonymisation (`RENT-010`)
- [ ] GDPR anonymisation BullMQ job — runs after 90-day retention window post tenancy end
- [ ] Agreement renewal reminder notifications — 30 days and 7 days before `agreementEndDate` (`RENT-012`)
- [ ] Admin privileged endpoint — decrypt tenant phone with audit log (`RENT-011`)
- [ ] Owner view — masked tenant details for own flat; Admin sees all tenancies

---

### ✅ EPIC-10 · Common Facility Management `55 SP`

- [ ] `CommonFacility` entity with pricing model, booking window config, cancellation policy (`7.2.9`)
- [ ] `FacilityBlackout` entity with datetime range and reason (`7.2.9`)
- [ ] `FacilityBooking` entity with full state machine and payment linkage (`7.2.10`)
- [ ] Facility CRUD — Admin/Super Admin only; up to 10 S3 photos per facility (`FAC-001, FAC-002`)
- [ ] Pricing model configuration — Fixed / Hourly / Variable (JSON schedule in paise) (`FAC-003`)
- [ ] Blackout period management — booking API returns `409` on overlap; calendar shows greyed dates (`FAC-004`)
- [ ] Booking window enforcement — `maxAdvanceDays` and `minAdvanceHours` validation (`FAC-005`)
- [ ] Double-booking prevention — row-level lock on facility for requested date-time range (`FAC-006`)
- [ ] Booking state machine: `PENDING_APPROVAL → APPROVED → CONFIRMED`; `REJECTED`, `CANCELLED` (`FAC-007`)
- [ ] BullMQ auto-reject job — stale `PENDING_APPROVAL` bookings after `autoRejectHours` (`FAC-007`)
- [ ] Admin approval flow — fee calculation, Razorpay order creation, owner payment notification (`FAC-008`)
- [ ] BullMQ payment timeout job — auto-cancel `APPROVED` booking after `paymentDeadlineHours` (`FAC-009`)
- [ ] `payment.captured` webhook handler — booking → `CONFIRMED`; Payment record + invoice PDF (`FAC-010`)
- [ ] Owner cancellation — per-facility JSON cancellation policy; Razorpay refund + owner notification (`FAC-011`)
- [ ] Admin cancellation — full refund regardless of policy + apology notification (`FAC-012`)
- [ ] Owner-facing facility list — pre-signed photo URLs, pricing summary, availability calendar (`FAC-014`)
- [ ] Booking visibility — Owner sees own bookings; Admin sees all; filterable calendar view (`FAC-015, ADM-023`)
- [ ] `AdminAuditLog` entries for all facility + booking admin actions (`FAC-016`)

---

### ✅ EPIC-11 · Common Services Vendor Management `21 SP`

- [ ] `VendorProfile` entity — encrypted phone, extensible `serviceCategory` varchar, status enum (`7.2.11`)
- [ ] `VendorDocument` entity — S3 key, version, mime type, document type enum (`7.2.12`)
- [ ] `VendorPhoneRevealLog` entity — audit trail for phone reveals (`7.2.13`)
- [ ] Vendor CRUD (Admin/Super Admin only) — up to 5 supporting documents per vendor (`VND-001, VND-004`)
- [ ] Document upload via pre-signed S3 PUT URLs (`society-vendor-documents` bucket, KMS) (`VND-005`)
- [ ] Extensible `serviceCategory` — seeded standard values; new categories without migration (`VND-003`)
- [ ] Vendor status toggle (`ACTIVE ↔ INACTIVE`) — instant cache TTL-based visibility update (60 s) (`VND-006`)
- [ ] Owner-facing directory — shows masked phone; single-tap "Reveal Phone" with 5-min client timer (`VND-007`)
- [ ] Phone reveal logs event in `VendorPhoneRevealLog` on each reveal (`VND-007`)
- [ ] Vendor directory filterable by `serviceCategory`; `INACTIVE` / `DELETED` vendors excluded (`VND-008`)
- [ ] Soft-delete (status → `DELETED`); invisible to all list views; hard-delete prohibited (`VND-009`)
- [ ] All admin actions logged to `AdminAuditLog` with `entityType = VENDOR` (`VND-010`)

---

### ✅ EPIC-12 · Society Event Management `34 SP`

- [ ] `SocietyEvent` entity — all fields including `isPinned`, `createdByRole`, `linkedFacilityBookingId` (`7.2.14`)
- [ ] `EventRsvp` entity — unique (eventId, ownerId) constraint; cancellable (`7.2.15`)
- [ ] `EventChangeLog` entity — immutable append-only audit log for organiser edits
- [ ] Event CRUD — Owner and Admin; society scoped from JWT (`EVT-001, EVT-002`)
- [ ] Extensible `eventType` varchar enum seeded with standard categories (`EVT-003`)
- [ ] Facility booking link validation — must be `CONFIRMED`, same society, overlapping slot (`EVT-004`)
- [ ] Background job — if linked `FacilityBooking` is cancelled, nullify link + notify organiser (`EVT-004`)
- [ ] RSVP management — count-gated; `409` when full; RSVP cancellation up to `startDatetime` (`EVT-005`)
- [ ] Event lifecycle BullMQ job (every 5 min) — `UPCOMING → ONGOING → COMPLETED` transitions (`EVT-007`)
- [ ] Post-completion media upload window — 7 days; after that endpoint returns `403` (`EVT-007`)
- [ ] Event feed — pinned first, then upcoming asc, ongoing, completed desc; cursor-based pagination (`EVT-008, EVT-009`)
- [ ] Admin pin/unpin — atomic unpin of previous; pinned events at top of all feeds (`EVT-010`)
- [ ] BullMQ notification jobs — publish notify, 24 h reminder for RSVPed owners, cancellation notify, removal notify (`EVT-011`)
- [ ] Admin moderation — status → `REMOVED` with reason; owner notified; retained in DB (`ADM-029`)
- [ ] Admin official event — `createdByRole = ADMIN`; "Society Official" badge in feed (`ADM-030`)
- [ ] `AdminAuditLog` for all admin event actions; `event_change_log` for organiser edits (`EVT-012`)

---

### ✅ EPIC-13 · Event Media — Photos & Videos `21 SP`

- [ ] `EventMedia` entity — media type, status, S3 key, thumbnail key, mime type (`7.2.16`)
- [ ] Pre-signed S3 PUT URL request + confirm endpoint flow (`MED-004`)
- [ ] Photo upload limits: JPEG/PNG/WEBP ≤ 20 MB each, max 50 per event (`MED-002`)
- [ ] Video upload limits: MP4/MOV ≤ 500 MB each, max 5 per event (`MED-002`)
- [ ] S3 bucket: `society-event-media` with server-side KMS encryption; key convention enforced (`MED-003`)
- [ ] BullMQ thumbnail job — Sharp 480×480 WebP thumbnail for photos (`MED-005`)
- [ ] BullMQ thumbnail job — FFmpeg 1-second frame extraction for videos (`MED-005`)
- [ ] Media gallery endpoint — returns metadata + thumbnail pre-signed URLs (1 h expiry) (`MED-006`)
- [ ] Full-resolution download via separate pre-signed GET URL endpoint (`MED-006`)
- [ ] Upload permission enforcement: organiser + Admins only; status window check (`MED-001`)
- [ ] Admin media moderation — remove individual media item (status → `REMOVED`); event unaffected (`ADM-029`)
- [ ] `AdminAuditLog` entries for media moderation actions (`EVT-012`)

---

### ✅ EPIC-14 · Notifications & Announcements `21 SP`

- [ ] FCM push notification service integration (mobile — iOS + Android)
- [ ] In-app bell notification storage and read/unread state
- [ ] BullMQ notification queue with delayed job support
- [ ] Owner quiet-hours preference storage and enforcement for non-urgent notifications
- [ ] Emergency alert — bypasses quiet hours and quiet-push settings (`ANN-004`)
- [ ] Admin announcement broadcast — text + image; delivered to all society owners (`ANN-001, ADM-006`)
- [ ] Announcement logged with timestamp in `announcements` table
- [ ] Visitor arrival notification to Owner (within 5 s of guard action)
- [ ] Maintenance request status change notifications (Admin → Owner, Admin → Staff)
- [ ] Payment reminder notifications (+3 d, +7 d, +15 d) via push + SMS

---

### ✅ EPIC-15 · AdminJS Panels (Admin + Super Admin) `34 SP`

- [ ] AdminJS module setup in `admin-service` (Society Admin panel at `/panel`)
- [ ] AdminJS module setup in `super-admin-service` (Super Admin panel at `/superadmin`)
- [ ] JWT-based session auth for Society Admin panel; Email + TOTP for Super Admin panel (`16.7`)
- [ ] Express-session backed by Redis; 8-hour TTL; `HttpOnly` / `Secure` / `SameSite=Strict` cookie
- [ ] Global `after()` audit hook — writes every action to `admin_audit_logs` (`16.7`)
- [ ] `AdminAuditLog` entity with actorId, action, resource, changedFields, IP (`16.8`)
- [ ] Resource definitions — Society, Flat, User, Payment, VisitorLog, SocietyBankAccount (`16.4`)
- [ ] Resource definitions — FlatRental, TenantProfile, CommonFacility, FacilityBooking (`16.4`)
- [ ] Resource definitions — VendorProfile, SocietyEvent, EventMedia, AuditReport, FeatureFlag (`16.4`)
- [ ] Custom `PhoneDisplay.tsx` component — server-side decrypt before rendering (`16.5`)
- [ ] Custom `PanDisplay.tsx` component — masked PAN (panLast4 only) display
- [ ] Custom `BookingStatusBadge.tsx` and `EventStatusBadge.tsx` colour-coded chips
- [ ] Global destructive operation restrictions — no hard delete, no bulk delete, societyId not editable, payments immutable (`16.9`)
- [ ] Tenant-scoping `before()` hook on all list actions — append `societyId` filter from JWT (`16.4.2`)
- [ ] Super Admin custom dashboard — 6 real-time widgets (total societies, users, revenue, pending audits, failed BullMQ jobs, active flags) (`16.6`)
- [ ] Feature flag resource — Super Admin may toggle flags; propagation ≤ 60 s

---

### ✅ EPIC-16 · Owner App — Mobile (React Native + Expo) + Web (Next.js) `89 SP`

- [ ] Phone OTP registration + login screens (OWN-001)
- [ ] Visitor pre-approval screen — generate QR / OTP token (OWN-002)
- [ ] Real-time visitor arrival push notification + approve/reject action (OWN-003)
- [ ] Maintenance bill view + Razorpay checkout payment flow (OWN-004)
- [ ] Raise maintenance request form — category, description, photos (OWN-005)
- [ ] Maintenance log history — paginated, filterable by date and category (OWN-006)
- [ ] Invoice PDF download (24-hour pre-signed link) (OWN-007)
- [ ] GDPR preferences screen — opt out of non-essential data processing (OWN-008)
- [ ] Account deletion request flow (OWN-009)
- [ ] Domestic staff recurring entry registration (OWN-010)
- [ ] Owner annual payment statement PDF request + download (OWN-011)
- [ ] FY audit report notification + read-only PDF viewer (OWN-012)
- [ ] Flat rental management — mark rented, add tenant details (OWN-013)
- [ ] Rental document upload (rent agreement + PAN card) via pre-signed S3 flow (OWN-014)
- [ ] Active tenancy detail view — masked phone, dates, document upload status (OWN-015)
- [ ] End tenancy flow (OWN-016)
- [ ] Tenant detail / document update flow (OWN-017)
- [ ] Facility browse — list, calendar, pricing summary, photos (OWN-018)
- [ ] Facility booking request form (OWN-019)
- [ ] Facility booking payment screen after Admin approval (OWN-020)
- [ ] Booking history — past + upcoming; status + receipt link (OWN-021)
- [ ] Booking cancellation + refund status (OWN-022)
- [ ] Vendor directory — filterable, masked phone + reveal action (OWN-023)
- [ ] Create society event form — type, dates, facility link, max participants (OWN-024)
- [ ] Link event to facility booking (OWN-025)
- [ ] RSVP to event; headcount display (OWN-026)
- [ ] Event media upload — photos + videos via S3 flow (OWN-027)
- [ ] Society event feed — scrollable, filterable, cursor-paginated (OWN-028)
- [ ] Edit / cancel own event (OWN-029)
- [ ] Mark event as completed (OWN-030)

---

### ✅ EPIC-17 · Admin App — Mobile (React Native + Expo) + Web (Next.js) `89 SP`

- [ ] Admin login — Phone OTP + PIN (ADM-001)
- [ ] Onboard new flat owner — create record, send invite OTP (ADM-001)
- [ ] Maintenance request triage + approve/reject; assign to staff (ADM-002, ADM-003)
- [ ] Real-time visitor dashboard — auto-refresh every 10 s; entry/exit counts by wing (ADM-004)
- [ ] Monthly financial report — download as PDF/CSV (ADM-005)
- [ ] Announcement broadcast screen — text + image; resident selection (ADM-006)
- [ ] Society rules configuration screen (visitor hours, parking, late fees, SLA timers) (ADM-007)
- [ ] Admin audit trail view — all create/update/delete actions with actor + timestamp (ADM-008)
- [ ] Visitor / vehicle block-list management (ADM-009)
- [ ] Resident data export for GDPR portability (dual-admin approval flow) (ADM-010)
- [ ] Society-level FY audit report management — trigger, view draft, publish (ADM-011)
- [ ] Scheduled audit report notification + review screen (ADM-012)
- [ ] Digital sign + publish workflow with SHA-256 checksum display (ADM-013)
- [ ] Bank account add form — account number, IFSC, account type (ADM-014)
- [ ] Penny-drop verification status screen (ADM-015)
- [ ] Set primary settlement account screen (ADM-016)
- [ ] Bank accounts list — masked number, IFSC, verification status, primary flag (ADM-017)
- [ ] Facility registration form — name, description, capacity, photos, pricing (ADM-018)
- [ ] Facility pricing configuration — Fixed / Hourly / Variable schedule (ADM-019)
- [ ] Blackout date management calendar (ADM-020)
- [ ] Pending booking request review — approve / reject with reason (ADM-021)
- [ ] Cancellation policy configuration per facility (ADM-022)
- [ ] Facility bookings calendar view — filterable by facility, date, status (ADM-023)
- [ ] Vendor registration form — business details, category, documents upload (ADM-024)
- [ ] Vendor status toggle (activate / deactivate) (ADM-025)
- [ ] Vendor list — paginated, filterable, CSV export (ADM-026)
- [ ] All society events view — organiser, RSVP count, status; filter panel (ADM-027)
- [ ] Pin event to top of feed (ADM-028)
- [ ] Event moderation — remove event or individual media with reason (ADM-029)
- [ ] Create official society event with "Society Official" badge (ADM-030)

---

### ✅ EPIC-18 · Super Admin App — Web (Next.js) `34 SP`

- [ ] Super Admin login — Email + Password + TOTP (SAD-001)
- [ ] Society onboarding wizard — details, first Admin invite, tenant provisioning (SAD-001)
- [ ] Subscription tier configuration — tier stored; feature flags toggled accordingly (SAD-002)
- [ ] System-wide health dashboard — per-society MAU, uptime, error rates (SAD-003)
- [ ] Society deactivation — mark inactive; data retained; logins blocked (SAD-004)
- [ ] Global feature flag management — toggle + propagate within 60 s (SAD-005)
- [ ] Cross-society payment ledger — filter by society, date, status (SAD-006)
- [ ] Encryption key rotation trigger UI — monitor re-encryption job progress (SAD-007)
- [ ] Region / country allowlist configuration per society (SAD-008)
- [ ] AdminJS Super Admin panel embedded at `/superadmin` (EPIC-15)

---

### ✅ EPIC-19 · Shared Packages & Design System `21 SP`

- [ ] `packages/shared-types` — all TypeScript interfaces, enums, and DTOs shared across FE + BE
- [ ] `packages/shared-validators` — Zod schemas (phone, IFSC, document upload, booking, event)
- [x] `packages/shared-ui-tokens/tailwind.config.ts` — canonical design token config (colours, spacing, typography, shadows, border-radius)
- [ ] `packages/shared-ui-tokens/oat-overrides.css` — standalone Oat UI CSS variable overrides file (overrides currently live in each app's `globals.css`)
- [x] `packages/shared-ui-components/src/web/` — `ClickCounter` (Oat UI demo: `article` · `button` · `mark` · `progress`); barrel exports in `src/web/index.ts` and `src/index.ts`; package exports point to `./src` (consumed via `transpilePackages`, no build step)
- [ ] `packages/shared-ui-components/src/web/` — remaining components: Button, Card, Badge, Dialog, DataTable, StatusBadge wrapping Oat UI semantic elements
- [ ] `packages/shared-ui-components/src/mobile/` — Button, Card, Badge, BottomSheet, StatusBadge for React Native (NativeWind)
- [ ] `packages/shared-ui-components/src/shared/` — platform-agnostic hooks and constants (status → colour mapping)
- [ ] `packages/shared-i18n` — translation strings for English, Hindi, Marathi (i18next compatible)
- [ ] NativeWind v4 Babel/Metro plugin configuration per mobile app
- [x] Oat UI (`@knadh/oat` v0.5.0) integrated in all three Next.js web apps — `postcss-import` pipeline resolves `@layer` ordering; `@import` in `globals.css`; Oat UI CSS custom properties overridden per app
- [x] Lerna workspace symlink resolution — `@society/shared-ui-components` consumed via workspace symlink with `exports: ./src`; `transpilePackages` in shared Next.js config ensures SWC compiles TypeScript source directly

---

### ✅ EPIC-20 · GDPR Compliance & Data Governance `21 SP`

- [ ] GDPR consent capture for visitor photos at gate terminal
- [ ] Owner opt-out of non-essential data processing — preference stored; analytics suppressed within 24 h (OWN-008)
- [ ] Account deletion request flow — erasure workflow triggered; completed ≤ 30 days; confirmation sent (OWN-009)
- [ ] Data portability export — GDPR-compliant JSON/CSV with decrypted fields; dual-admin approval gate (ADM-010)
- [ ] Tenant GDPR anonymisation BullMQ job — 90-day post-tenancy retention then anonymise (RENT-010)
- [ ] `deleted_at` soft-delete pattern on all PII-bearing entities
- [ ] GDPR erasure SLA tracking — ≤ 30 days from request; breach alerting
- [ ] WCAG 2.1 Level AA compliance audit on all web dashboards
- [ ] React Native apps accessibility (iOS VoiceOver, Android TalkBack) compliance
- [ ] Internationalisation (i18n) — all UI strings externalised; date/time in UTC + society timezone

---

## Grand Total

| Metric | Value |
|--------|-------|
| Total Epics | 20 |
| Total Story Points | **749 SP** |
| Assumed Velocity | ~45 SP / 2-week sprint |
| Estimated Sprints | ~17 sprints |
| Estimated Timeline | **8–9 months** (team of 4–6 engineers) |

---

*Generated from PRD v1.0.0 — Society Management and Logging System*

