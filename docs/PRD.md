# Product Requirement Document (PRD)
# Society Management and Logging System

**Version:** 1.0.0
**Date:** 2026-05-02
**Status:** Draft
**Author:** Engineering Team

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Goals & Success Metrics](#2-goals--success-metrics)
3. [Stakeholders & User Roles](#3-stakeholders--user-roles)
4. [User Stories](#4-user-stories)
5. [Functional Requirements](#5-functional-requirements)
6. [Non-Functional Requirements](#6-non-functional-requirements)
7. [Data Schema Overview](#7-data-schema-overview)
8. [API Gateway Architecture](#8-api-gateway-architecture)
9. [Security & GDPR Compliance](#9-security--gdpr-compliance)
10. [Technical Architecture](#10-technical-architecture)
11. [Monorepo & Folder Structure](#11-monorepo--folder-structure)
12. [Deployment & Scalability](#12-deployment--scalability)
13. [Glossary](#13-glossary)
14. [Razorpay & UPI Payment Integration](#14-razorpay--upi-payment-integration)
15. [Financial Year Audit & PDF Generation](#15-financial-year-audit--pdf-generation)

---

## 1. Executive Summary

The **Society Management and Logging System** is a multi-tenant SaaS platform that digitises the end-to-end operations of residential housing societies. It replaces paper-based visitor registers, manual maintenance tracking, and fragmented communication channels with a unified, auditable, and GDPR-compliant digital system.

The platform is composed of **three client-facing applications**, each delivered as a **cross-platform mobile app (React Native)** and a **web dashboard (Next.js + React)**:

| Application | Primary Audience |
|---|---|
| **Owner App** | Flat residents / owners |
| **Admin App** | Society committee members |
| **Super Admin App** | Platform operators / onboarding team |

The backend is a **Node.js microservices** system built with **NestJS + TypeORM**, backed by **PostgreSQL**, and orchestrated inside a **Lerna monorepo**.

---

## 2. Goals & Success Metrics

### 2.1 Business Goals

- Reduce visitor-related security incidents by providing a verifiable, timestamped entry/exit log.
- Eliminate paper-based maintenance registers and give owners real-time visibility into their flat's status.
- Enable platform operators to onboard new societies in under **15 minutes** with zero code changes.
- Achieve full **GDPR compliance** to support societies in the EU and privacy-conscious markets.

### 2.2 Key Performance Indicators (KPIs)

| KPI | Target |
|---|---|
| Society onboarding time | ≤ 15 minutes |
| Visitor log entry latency | < 2 seconds end-to-end |
| Mobile app crash-free sessions | ≥ 99.5% |
| API gateway p99 latency | < 300 ms |
| Data breach incidents | 0 per year |
| GDPR data-erasure SLA | ≤ 30 days from request |

---

## 3. Stakeholders & User Roles

### 3.1 Role Hierarchy

```
Super Admin (Platform Operator)
    └── Admin (Society Committee Member)
            └── Owner (Flat Resident)
                    └── Guest / Visitor (unauthenticated)
```

### 3.2 Role Descriptions

| Role | Scope | Auth Method |
|---|---|---|
| **Super Admin** | Global – all societies | Phone OTP + TOTP 2FA |
| **Admin** | Single society | Phone OTP + PIN |
| **Owner** | Single flat / unit | Phone OTP |
| **Visitor** | No account; identified by phone + OTP at gate | OTP (ephemeral) |

### 3.3 Staff Sub-Roles (managed by Admin)

- **Security Guard** – operates the gate-level visitor logging terminal.
- **Maintenance Staff** – updates task status on work orders raised by owners.
- **Accountant** – views and exports financial statements.

---

## 4. User Stories

### 4.1 Owner Stories

| ID | As an Owner… | Acceptance Criteria |
|---|---|---|
| OWN-001 | I want to register using my phone number so that I can access my flat's information securely. | OTP delivered in < 30 s; account linked to flat record. |
| OWN-002 | I want to pre-approve a visitor so that they can enter without calling me. | QR/OTP token generated; guard terminal shows pre-approval. |
| OWN-003 | I want to receive a push notification when a visitor arrives at the gate. | Notification fires within 5 s of guard scanning the visitor. |
| OWN-004 | I want to view and pay my monthly maintenance bill in-app. | Payment processed via gateway; receipt emailed and stored. |
| OWN-005 | I want to raise a maintenance request (plumbing, electrical, etc.). | Request saved with timestamp; Admin notified; owner can track status. |
| OWN-006 | I want to view the maintenance log history of my flat. | Full audit log visible, paginated, with filter by date and category. |
| OWN-007 | I want to download my invoices as PDF for tax purposes. | PDF generated server-side; download link valid 24 h. |
| OWN-008 | I want to opt out of non-essential data processing (GDPR). | Preference stored; non-essential analytics suppressed within 24 h. |
| OWN-009 | I want to request deletion of my account and personal data. | Erasure workflow triggered; completed ≤ 30 days; confirmation sent. |
| OWN-010 | I want to register a domestic staff member (maid, driver) for recurring entry. | Staff profile created; recurring entry pass valid for specified period. |
| OWN-011 | I want to download a PDF statement of all payments I made to the society during a financial year, for my own tax records. | PDF generated on demand; covers April 1 – March 31; includes invoice number, date, amount, mode, and status; available within 60 s of request. |
| OWN-012 | I want to receive a notification when the society's annual financial audit report has been published so I can review it. | Push + in-app notification sent when Admin marks the FY report as published; link to read-only PDF included. |
| OWN-013 | I want to mark my flat as rented out and add my tenant's details (name, phone, email, address) so the society has an accurate occupancy record. | Tenant profile created; flat status updated to `RENTED`; society admin notified; tenant details encrypted at rest. |
| OWN-014 | I want to upload a copy of the rent agreement and tenant's PAN card so the society can maintain legal compliance records. | Documents uploaded (PDF/image ≤ 10 MB each); stored AES-256-GCM encrypted in a private S3 bucket; owner and admin can download via pre-signed URLs; documents never publicly accessible. |
| OWN-015 | I want to view the active tenancy details for my flat at any time, including the rent period and documents I have uploaded. | Shows tenant name (masked phone), rent start/end dates, monthly rent amount, agreement expiry, and upload status of each document; full phone only shown to admin. |
| OWN-016 | I want to end an active tenancy when my tenant vacates, so the flat is marked vacant and old tenant records are archived. | Tenancy marked `ENDED`; flat status reverted to `VACANT`; tenant profile soft-deleted (GDPR-compliant anonymisation after 90-day retention period); admin notified. |
| OWN-017 | I want to update my tenant's details or replace the rent agreement document if it is renewed. | New document version uploaded; previous version archived in S3 with original upload timestamp; history retained for audit. |
| OWN-018 | I want to browse all common facilities available in my society (clubhouse, gym, pool, etc.) so I know what I can book. | Facility list shows name, description, capacity, pricing type (fixed/hourly/variable), availability calendar, and photos; fetched from `admin-service`. |
| OWN-019 | I want to request a booking of the clubhouse (or any common facility) for a private event on a specific date and time. | Booking request created with `PENDING_APPROVAL` status; society admin notified immediately; owner receives confirmation of submission. |
| OWN-020 | I want to pay the facility booking fee online after my request is approved so the booking is confirmed. | Razorpay order created on approval; owner pays via app; on payment capture booking status moves to `CONFIRMED`; receipt sent. |
| OWN-021 | I want to view all my past and upcoming facility bookings, including their status and invoices. | List shows facility name, slot date/time, status (`PENDING_APPROVAL`, `APPROVED`, `CONFIRMED`, `REJECTED`, `CANCELLED`), amount paid, and payment receipt link. |
| OWN-022 | I want to cancel an upcoming confirmed booking and, if eligible, receive a refund as per the society's cancellation policy. | Cancellation triggers refund (full or partial) based on cancellation policy configured by admin; Razorpay refund initiated; owner notified. |
| OWN-023 | I want to view the directory of approved common-service vendors the society has empanelled so I can contact them directly. | Vendor list shows service category, business name, contact name, and phone (masked); full phone revealed only after owner explicitly requests it (single-click reveal with audit log). |
| OWN-024 | I want to create a society event (festival celebration, game tournament, movie night, etc.) so that all residents can discover and join it. | Event created with `UPCOMING` status; visible to all flat owners in the society; Admin notified; event appears in the society event feed. |
| OWN-025 | I want to optionally link my event to a common facility (e.g. hold a tournament in the clubhouse) so the booking and event are connected. | Event linked to an existing `CONFIRMED` `FacilityBooking`; availability validated; if the facility booking is cancelled the event is automatically updated to remove the venue link. |
| OWN-026 | I want to set a participant limit and allow other owners to RSVP to my event so I can manage headcount. | RSVP count tracked in real time; owners who RSVP receive a confirmation; further RSVPs blocked once `maxParticipants` is reached; waitlist not supported in v1. |
| OWN-027 | I want to upload photos and videos from my event so all society members can view them in the event gallery. | Photos (JPEG/PNG/WEBP, ≤ 20 MB each, max 50 per event) and videos (MP4/MOV, ≤ 500 MB each, max 5 per event) uploaded to S3; thumbnail auto-generated for each; visible to all owners in the society. |
| OWN-028 | I want to view a scrollable society event feed showing upcoming and past events from all owners so I stay connected with society activities. | Feed ordered by `startDatetime` descending for past events, ascending for upcoming; filterable by event type; each card shows banner image, title, organiser flat, date, RSVP count, and media preview. |
| OWN-029 | I want to edit or cancel my event if plans change. | Owner may edit any field or cancel (status → `CANCELLED`) before the event `startDatetime`; all RSVPed members notified of changes; cancellation removes the linked facility booking association (does not auto-cancel the booking). |
| OWN-030 | I want to mark my event as completed after it has taken place. | Owner or system (scheduled job) transitions status `ONGOING → COMPLETED` after `endDatetime` passes; event moves to the past section of the feed; media upload still allowed for 7 days post-completion. |

### 4.2 Admin Stories

| ID | As an Admin… | Acceptance Criteria |
|---|---|---|
| ADM-001 | I want to onboard a new flat owner so they can access the system. | Owner record created; invite OTP sent to their phone. |
| ADM-002 | I want to approve or reject an owner's maintenance request. | Status change reflected in owner's app within 5 s; notification sent. |
| ADM-003 | I want to assign maintenance tasks to specific staff members. | Task linked to staff ID; staff notified via push. |
| ADM-004 | I want to view a real-time dashboard of today's visitor activity. | Dashboard auto-refreshes every 10 s; shows entry/exit counts by wing. |
| ADM-005 | I want to generate a monthly financial report for the society. | Report downloadable as PDF/CSV; includes collected and outstanding dues. |
| ADM-006 | I want to broadcast announcements to all residents. | Notification delivered to all owners in the society; logged with timestamp. |
| ADM-007 | I want to configure society-specific rules (visitor hours, parking limits). | Rules persisted; enforced at gate terminal and owner app. |
| ADM-008 | I want to view a complete audit trail of all admin actions. | Every create/update/delete action logged with actor ID and timestamp. |
| ADM-009 | I want to block a specific visitor or vehicle permanently. | Block-list entry created; guard terminal alerts on match. |
| ADM-010 | I want to export all resident data in a machine-readable format (GDPR portability). | Export generated as JSON/CSV with decrypted fields only after dual-admin approval. |
| ADM-011 | I want to generate a full financial year audit PDF report covering all money received by and disbursed from the society account. | Report generated as a structured, paginated PDF; covers April 1 – March 31; breaks down inflows and outflows by category, flat, and month. |
| ADM-012 | I want to schedule the annual audit report to be auto-generated at year-close (April 1) so I do not have to trigger it manually. | BullMQ scheduled job fires at 00:01 IST on April 1; generates draft PDF; Admin receives notification to review and publish. |
| ADM-013 | I want to digitally sign and publish the annual audit PDF so owners can verify its authenticity. | SHA-256 checksum embedded in PDF metadata and stored in DB; published report marked immutable; any re-generation creates a new version record. |
| ADM-014 | I want to add my society's bank account details so that maintenance payments collected via Razorpay are settled into our designated account. | Bank account saved with AES-256-GCM encrypted account number; IFSC validated; Razorpay Contact + Fund Account created; account awaits penny-drop verification before being marked active. |
| ADM-015 | I want to verify the bank account via Razorpay's penny-drop/reverse-penny-drop so I can confirm the account is live and correct. | Penny-drop or Reverse Penny Drop initiated via Razorpay API; on success the account status transitions to `VERIFIED`; admin receives confirmation notification. |
| ADM-016 | I want to set one bank account as the primary settlement account for this society. | Only one account may be `PRIMARY` at a time; switching primary atomically deactivates the previous one; all future Razorpay settlements route to the new primary. |
| ADM-017 | I want to view all bank accounts added for the society, including their verification status and Razorpay linked-account reference, so the accounts team can audit them. | List view shows masked account number (last 4 digits), IFSC, account holder name, verification status, Razorpay Fund Account ID, and `isPrimary` flag; full account number never exposed in the UI. |
| ADM-018 | I want to register a common facility (e.g. clubhouse, gym, swimming pool, terrace garden) with its name, description, capacity, photos, and pricing so owners can discover and book it. | Facility saved with `ACTIVE` status; photos stored in S3; pricing model (fixed/hourly/variable) recorded; immediately visible to owners in their app. |
| ADM-019 | I want to configure pricing for each facility — either a flat booking fee, an hourly rate, or a variable rate that depends on the day/slot (weekday vs weekend, morning vs evening). | Pricing model stored per facility; system calculates booking fee at request time based on the selected slot duration and pricing schedule; displayed to owner before they submit a request. |
| ADM-020 | I want to define blackout dates for a facility (e.g. maintenance days, society events) during which no owner bookings are accepted. | Blackout dates stored; booking API returns `409 Conflict` for any slot overlapping a blackout date; owners see blocked dates highlighted on the availability calendar. |
| ADM-021 | I want to review pending facility booking requests and approve or reject them with an optional reason. | On approval, Razorpay order created; owner notified to complete payment. On rejection, owner notified with reason; no charge raised. |
| ADM-022 | I want to configure the cancellation and refund policy per facility (e.g. full refund if cancelled ≥ 48 h before slot, 50 % refund if ≥ 24 h, no refund otherwise). | Policy stored as a JSON schedule per facility; system calculates refund amount at cancellation time; Razorpay refund initiated automatically. |
| ADM-023 | I want to view a calendar of all facility bookings across the society so I can spot conflicts and plan maintenance. | Calendar view filterable by facility, date range, and status; shows owner name, flat number, and booking duration per slot. |
| ADM-024 | I want to register an empanelled common-service vendor (e.g. plumber, electrician, pest-control company) with their business details, service category, and supporting documents. | Vendor profile created in `ACTIVE` state; documents (GST certificate, trade licence, photo ID) uploaded to S3; vendor appears in owner-facing directory. |
| ADM-025 | I want to deactivate or re-activate a vendor so owners can only see currently approved vendors in their directory. | Status toggled between `ACTIVE` and `INACTIVE`; inactive vendors hidden from owner-facing directory immediately; historical booking references retained. |
| ADM-026 | I want to view all vendors registered in the society, filter by service category or status, and download the vendor list as a CSV for records. | List view with pagination; filterable by `serviceCategory`, `status`, `createdAt`; CSV export (admin-only, gated by feature flag as per Section 16.9). |
| ADM-027 | I want to view all society events created by owners so I have visibility over community activity. | Admin sees full event list with organiser, facility link, RSVP count, media count, and status; can filter by status, event type, or date range. |
| ADM-028 | I want to pin an event to the top of the society feed so all owners see it prominently. | Pinned events appear above regular events in the feed regardless of date; only one event may be pinned at a time; pinning another auto-unpins the previous one. |
| ADM-029 | I want to moderate (remove) inappropriate events or media items posted by owners. | Admin may change any event status to `REMOVED` with a reason; owner notified; removed events and their media hidden from all feeds but retained in DB for audit. Admins may also `REMOVE` individual media items without removing the entire event. |
| ADM-030 | I want to create official society events (e.g. AGM, maintenance shutdown notice) on behalf of the society committee so they appear authoritative in the feed. | Admin-created events display a "Society Official" badge; badge and creation source stored in `createdByRole` field; same media upload and RSVP features apply. |

### 4.3 Super Admin Stories

| ID | As a Super Admin… | Acceptance Criteria |
|---|---|---|
| SAD-001 | I want to onboard a new society with its details in one workflow. | Society record created; first Admin invited; society tenant isolated. |
| SAD-002 | I want to configure subscription tiers for each society. | Tier stored; feature flags toggled accordingly across all services. |
| SAD-003 | I want to view system-wide health metrics across all societies. | Dashboard shows per-society MAU, uptime, error rates. |
| SAD-004 | I want to deactivate a society account without data loss. | Society marked inactive; data retained; no logins allowed. |
| SAD-005 | I want to manage global feature flags without a deployment. | Flag changes propagate to all services within 60 s. |
| SAD-006 | I want to audit all cross-society payment transactions. | Unified ledger view with filter by society, date, and status. |
| SAD-007 | I want to rotate encryption keys for phone number fields. | Key rotation job runs; all ciphertext re-encrypted; zero downtime. |
| SAD-008 | I want to configure allowed countries/regions for each society. | Region config enforced at API gateway; blocked requests logged. |

---

## 5. Functional Requirements

### 5.1 Visitor Logging System

#### 5.1.1 Visitor Entry Flow

```
Visitor arrives at gate
    │
    ▼
Guard opens Gate Terminal (Admin App – Guard role)
    │
    ├─ [Pre-approved visitor] ──► Scan QR / enter OTP ──► System validates token
    │                                                           │
    │                                                     [Valid] ──► Auto-approve entry
    │                                                     [Invalid / expired] ──► Notify guard
    │
    └─ [Walk-in visitor] ──► Guard captures:
                                  • Visitor name
                                  • Phone number (OTP-verified, ephemeral)
                                  • Photo (optional, GDPR consent required)
                                  • Vehicle number (optional)
                                  • Purpose of visit
                                  • Host flat number
                              │
                              ▼
                         System sends push notification to Owner
                              │
                         Owner approves / rejects (within 2 min timeout)
                              │
                    [Approved] ──► Entry logged; guard opens gate
                    [Rejected / Timeout] ──► Guard denies entry; visitor notified
```

#### 5.1.2 Visitor Exit Flow

- Guard manually marks exit **or** exit is auto-detected via a second QR scan.
- Exit timestamp, duration, and guard ID recorded.
- Long-stay alert triggered if visitor remains beyond configured threshold (default 4 h).

#### 5.1.3 Visitor Log Record Fields

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `society_id` | UUID | Multi-tenant scope |
| `visitor_name` | VARCHAR(255) | Plaintext |
| `visitor_phone_encrypted` | BYTEA | AES-256-GCM encrypted |
| `visitor_phone_hash` | VARCHAR(64) | HMAC-SHA256; used for deduplication search |
| `host_flat_id` | UUID | FK → flats |
| `vehicle_number` | VARCHAR(20) | Nullable |
| `purpose` | VARCHAR(255) | |
| `entry_time` | TIMESTAMPTZ | |
| `exit_time` | TIMESTAMPTZ | Nullable |
| `entry_guard_id` | UUID | FK → staff |
| `exit_guard_id` | UUID | Nullable FK → staff |
| `approval_status` | ENUM | `PENDING`, `APPROVED`, `REJECTED`, `TIMEOUT` |
| `pre_approved_token` | VARCHAR(64) | Nullable; hashed OTP/QR token |
| `photo_url` | VARCHAR(512) | S3 presigned; GDPR-flagged |
| `gdpr_consent` | BOOLEAN | Required if photo captured |
| `created_at` | TIMESTAMPTZ | |
| `deleted_at` | TIMESTAMPTZ | Soft delete for GDPR erasure |

#### 5.1.4 Staff & Domestic Help Logs

| Requirement ID | Description |
|---|---|
| LOG-001 | Each staff entry/exit is recorded with the same fields as visitor logs. |
| LOG-002 | Recurring staff (registered by owner) bypass the owner-approval step. |
| LOG-003 | Guard can flag a staff member; flagged entries require Admin review. |
| LOG-004 | Monthly staff attendance reports are available to Admins and relevant Owners. |
| LOG-005 | Staff profiles store an encrypted phone number identical to the owner schema. |

### 5.2 Maintenance Request System

| Requirement ID | Description |
|---|---|
| MNT-001 | Owner raises a request with category, description, and optional photos. |
| MNT-002 | Admin triages and assigns the request to a maintenance staff member. |
| MNT-003 | Request progresses through states: `OPEN → IN_PROGRESS → RESOLVED → CLOSED`. |
| MNT-004 | Owner can reopen a resolved request within 48 h (adds to audit trail). |
| MNT-005 | SLA timers are configurable per category; breach triggers Admin alert. |
| MNT-006 | All status transitions are timestamped and attributed to the acting user. |

### 5.3 Payments & Billing

| Requirement ID | Description |
|---|---|
| PAY-001 | Monthly maintenance invoices are auto-generated on the 1st of each month. |
| PAY-002 | Owners pay via Razorpay checkout: UPI (collect & intent), credit/debit card, net banking, EMI, and wallets. |
| PAY-003 | Failed payments trigger reminders at +3 d, +7 d, +15 d via push notification and SMS. |
| PAY-004 | Late fees are configurable per society (flat amount or percentage). |
| PAY-005 | All transactions are logged with Razorpay `payment_id`, `order_id`, and `signature` for reconciliation. |
| PAY-006 | Admin can record offline payments (cash/cheque) with a manual entry. |
| PAY-007 | UPI Autopay (recurring mandate) is supported for owners who opt in to automatic monthly deduction. |
| PAY-008 | Razorpay webhook events are verified using HMAC-SHA256 signature before processing. |
| PAY-009 | Payment refunds initiated by Admin are processed via Razorpay Refund API; status tracked in the `payments` table. |
| PAY-010 | The system supports Razorpay Test Mode in non-production environments; test credentials are injected via environment variables, never hardcoded. |
| PAY-011 | All Razorpay API keys are stored in AWS KMS / Secrets Manager; rotated without redeployment. |
| PAY-012 | Payment receipt PDFs are generated server-side and stored in S3; download links pre-signed with 24 h expiry. |

### 5.5 Financial Year Audit & PDF Reports

The Indian financial year runs from **April 1 to March 31**. The system must produce a comprehensive, tamper-evident PDF audit report for every society at the close of each financial year.

#### 5.5.1 Transaction Classification

All monetary movements are classified into two directions:

| Direction | Transaction Types |
|---|---|
| **Inflow (Society ← Owner)** | Monthly maintenance collections, late-fee payments, one-time special levies, penalty payments, advance deposits |
| **Outflow (Society → Owner / Vendor)** | Maintenance refunds, security deposit refunds, vendor payment reimbursements recorded by Admin |

> **Note:** Outflows are Admin-recorded entries (no automated debit from society bank account is performed by the platform). They represent payments that have already occurred offline and are being logged for audit purposes.

#### 5.5.2 Functional Requirements

| Requirement ID | Description |
|---|---|
| PAY-013 | The system must auto-generate a **Society-Level Annual Audit Report** PDF at 00:01 IST on April 1 for the financial year that just closed (April 1 – March 31). |
| PAY-014 | The system must generate an **Owner-Level Annual Statement PDF** on demand for any owner covering all their inflow transactions in a selected financial year. |
| PAY-015 | The Society-Level Annual Audit PDF must include: (a) cover page with society name, financial year, and generation timestamp; (b) executive summary with total inflows, total outflows, and net balance; (c) month-wise inflow table; (d) month-wise outflow table; (e) flat-wise collection summary; (f) list of outstanding dues as at March 31; (g) list of all refunds issued; (h) transaction-level ledger appendix sorted by date. |
| PAY-016 | The Owner-Level Annual Statement PDF must include: (a) owner name and flat number; (b) society name and financial year; (c) itemised list of all payments with date, invoice number, amount, mode, and Razorpay reference; (d) total paid; (e) any outstanding dues as at March 31. |
| PAY-017 | Every generated PDF must embed a **SHA-256 content checksum** in its XMP metadata. The same checksum is stored in the `audit_reports` database table, enabling offline tamper verification. |
| PAY-018 | Admin must be able to trigger on-demand regeneration of the Society-Level Annual Audit Report at any time before publishing. Each regeneration creates a new version record; the previous version is archived (not deleted). |
| PAY-019 | Admin must **review and explicitly publish** the Society-Level Annual Audit Report before owners can access it. An unpublished draft is only visible to Admins and Accountants. |
| PAY-020 | All generated audit PDF files must be stored in **AWS S3** under the path `audit-reports/{societyId}/{financialYear}/{reportType}/{version}.pdf` and must be retained for a minimum of **7 years** (S3 Lifecycle policy: transition to Glacier after 1 year). |
| PAY-021 | Owner-Level Annual Statement PDFs are generated synchronously for financial years with ≤ 12 transactions and asynchronously (BullMQ job) for larger datasets; the client polls for completion. |
| PAY-022 | Download links for all audit PDFs must be **pre-signed S3 URLs** with a maximum 1-hour expiry. Direct public S3 access to the bucket must be blocked. |
| PAY-023 | The Society-Level Annual Audit Report PDF must be accessible to: Admins (draft + published), Accountants (draft + published), and Owners (published only). Super Admins can access reports for all societies. |

### 5.6 Society Bank Account Management

| Requirement ID | Description |
|---|---|
| PAY-024 | The system must allow Society Admins to add one or more bank accounts for their society. Only users with the `ADMIN` or `SUPER_ADMIN` role may create or modify bank account records. Owners and Staff have no access. |
| PAY-025 | The bank account number must be stored **AES-256-GCM encrypted** (same `PhoneCryptoService` pattern) using the society-specific KMS DEK. The field must never appear in plaintext in any API response; the UI must display only the last 4 digits (masked as `••••••••1234`). |
| PAY-026 | The IFSC code must be validated against the **Razorpay IFSC validation API** (`GET /v1/ifsc/{ifsc}`) before saving. Invalid or inactive IFSCs must be rejected with a `400` error. |
| PAY-027 | On successful bank account creation, the system must call the **Razorpay Contact API** (`POST /v1/contacts`) to create a Razorpay Contact for the society (if one does not already exist), then call the **Razorpay Fund Account API** (`POST /v1/fund_accounts`) to register the bank account under that contact. The Razorpay `fund_account_id` and `contact_id` must be stored in the `society_bank_accounts` table. |
| PAY-028 | After registration, the system must trigger a **Razorpay Fund Account Validation** (`POST /v1/fund_accounts/validations`) — specifically the **Reverse Penny Drop** flow — to verify the account is live and belongs to the society. The account status must remain `PENDING_VERIFICATION` until the validation webhook (`fund_account.validation.completed`) confirms success. |
| PAY-029 | Only accounts with status `VERIFIED` may be set as the **primary settlement account**. Setting a new primary must atomically set all other accounts for the same society to `isPrimary = false` within a single database transaction. |
| PAY-030 | Each society may have at most **one `PRIMARY`** bank account at any time. There is no limit on the number of additional (`SECONDARY`) accounts, but only `VERIFIED` accounts are eligible to be promoted to `PRIMARY`. |
| PAY-031 | The Razorpay Fund Account Validation result webhook (`fund_account.validation.completed`) must be processed idempotently using the same `webhookEventId` deduplication mechanism already in place for payment webhooks (Section 8). On success, the account status must be updated to `VERIFIED`; on failure, to `VERIFICATION_FAILED` with the failure reason stored. |
| PAY-032 | Admins may **soft-delete** a bank account (status → `INACTIVE`) but may not hard-delete it, preserving the audit trail. A `PRIMARY` account cannot be deactivated unless another `VERIFIED` account is promoted to `PRIMARY` first. |
| PAY-033 | All create, update, and status-change events on `society_bank_accounts` must be recorded in the `admin_audit_logs` table with `changedFields` including the masked account number (last 4 digits only), IFSC, and new status. |

### 5.7 Flat Rental Management

#### 5.7.1 Tenant Profile & Encrypted Storage

| Requirement ID | Description |
|---|---|
| RENT-001 | Flat owners may register a tenancy by providing tenant details: full name, phone number, email (optional), date of birth (optional), permanent address, and emergency contact. Only the authenticated flat owner (or an Admin) may create or modify a tenancy for a given flat. |
| RENT-002 | The tenant's **phone number** must follow the same dual-column encryption strategy as owner phone numbers: `tenantPhoneHash` (HMAC-SHA256, deterministic, for lookup) + `tenantPhoneEncrypted` (AES-256-GCM, reversible). The plaintext phone must never appear in any API response to non-admin callers. |
| RENT-003 | The tenant's **PAN number** must be stored **AES-256-GCM encrypted** using the society-specific KMS DEK. Only the last 4 characters may be stored unencrypted (`panLast4`) for masked display (e.g. `••••••••P123`). The full PAN must never be returned in any API response; admin-level decryption requires an explicit privileged endpoint with audit logging. |
| RENT-004 | A flat may have **at most one active tenancy** at any time (status `ACTIVE`). Attempting to create a second active tenancy on the same flat must return `409 Conflict`. |

#### 5.7.2 Document Upload & Storage

| Requirement ID | Description |
|---|---|
| RENT-005 | Owners may upload up to **two document types** per tenancy: (1) **Rent Agreement** (PDF/image, max 10 MB) and (2) **Tenant PAN Card copy** (PDF/image, max 5 MB). Both are stored in a dedicated **private S3 bucket** (`society-rental-documents`) using **server-side KMS encryption** (`aws:kms`) with the society-specific key. |
| RENT-006 | Documents must be uploaded via **pre-signed S3 PUT URLs** (max 15-minute expiry) issued by the `owner-service`. The service generates the PUT URL, the client uploads directly to S3, and then calls a confirmation endpoint to record the S3 key and metadata in the database. Direct S3 `GetObject` access is blocked; downloads are served exclusively via pre-signed GET URLs (max 1-hour expiry). |
| RENT-007 | Each document upload creates a new version record in the `rental_documents` table. Previous versions are **never deleted** from S3; they are flagged `SUPERSEDED` in the database. This preserves a full audit trail of agreement renewals. |
| RENT-008 | The S3 key convention for rental documents must be: `rental-documents/{societyId}/{flatId}/{rentalId}/{documentType}/{version}_{filename}` where `documentType` is `RENT_AGREEMENT` or `PAN_CARD`. |

#### 5.7.3 Rental Lifecycle & Admin Visibility

| Requirement ID | Description |
|---|---|
| RENT-009 | When a new tenancy is created, the system must send an **in-app + push notification** to the Society Admin: `"Flat {flatNumber} has been rented out by owner {ownerName}. Tenant: {tenantName}."` The flat's `status` in the `flats` table must be updated to `RENTED`. |
| RENT-010 | When a tenancy is ended (`status → ENDED`), the flat's `status` must revert to `VACANT`. The Admin must be notified. The tenancy record (including encrypted fields) must be retained for a minimum of **90 days** after `endDate` before GDPR anonymisation runs. |
| RENT-011 | Society Admins and Super Admins may **view all tenancies** across their society, including decrypted tenant phone (via privileged endpoint) and document download links. Owners may only view their own flat's tenancy. Staff and other owners have no access to tenancy data. |
| RENT-012 | If the rent agreement has an `agreementEndDate` and that date passes without the tenancy being marked `ENDED`, the system must send a **renewal reminder** notification to the owner 30 days before expiry and again 7 days before expiry. |

### 5.8 Common Facility Management

#### 5.8.1 Facility Registration & Configuration

| Requirement ID | Description |
|---|---|
| FAC-001 | Only users with the `ADMIN` or `SUPER_ADMIN` role may create, edit, or deactivate a `CommonFacility`. A facility belongs to exactly one society (`societyId`) and is not visible to owners of other societies. |
| FAC-002 | A `CommonFacility` record must capture: `name` (e.g. "Clubhouse", "Swimming Pool"), `description` (rich text), `capacity` (max occupants, integer), `location` (text, e.g. "Block A Ground Floor"), `status` (`ACTIVE` \| `INACTIVE` \| `UNDER_MAINTENANCE`), and up to **10 photos** stored in S3 (`society-facility-photos` bucket, KMS encrypted). |
| FAC-003 | Each facility supports exactly **one pricing model**, configured at creation and editable by Admin: (a) **Fixed** — a single flat fee regardless of duration; (b) **Hourly** — fee = `ratePerHour × durationHours`; (c) **Variable** — a JSON price schedule keyed by `{ dayType: WEEKDAY \| WEEKEND, slotType: MORNING \| AFTERNOON \| EVENING \| FULL_DAY }`, each mapping to an amount in paise. All amounts stored in **paise** (₹1 = 100 paise). |
| FAC-004 | Admins may define **blackout periods** per facility (e.g. annual maintenance, society AGM). A blackout period has a `startDatetime` and `endDatetime`; any booking slot that overlaps a blackout period must be rejected with `409 Conflict`. Blackout periods are shown as unavailable (greyed-out) on the owner-facing availability calendar. |
| FAC-005 | Each facility has a configurable **advance booking window**: owners may not book a slot more than `maxAdvanceDays` days in the future (default 60), and not less than `minAdvanceHours` hours before the slot start (default 24). Requests outside this window must be rejected with `400 Bad Request`. |
| FAC-006 | The system must enforce **no double-booking**: before creating a booking, the service must acquire a database row-level lock on the facility for the requested date-time range and reject overlapping `PENDING_APPROVAL`, `APPROVED`, or `CONFIRMED` bookings with `409 Conflict`. |

#### 5.8.2 Booking Lifecycle & Payment

| Requirement ID | Description |
|---|---|
| FAC-007 | A `FacilityBooking` follows this state machine: `PENDING_APPROVAL → APPROVED → CONFIRMED` (after payment) or `PENDING_APPROVAL → REJECTED`; a `CONFIRMED` booking may transition to `CANCELLED` (by owner or admin). Any `PENDING_APPROVAL` booking not acted on within `autoRejectHours` (default 48 h, configurable per facility) must be automatically rejected by a scheduled BullMQ job. |
| FAC-008 | When an Admin **approves** a booking: (1) the system calculates the booking fee using the facility's pricing model and the requested slot duration; (2) a Razorpay order is created for that amount; (3) the owner is notified via push + in-app with a deep link to the payment screen. The booking status becomes `APPROVED` and the payment deadline is `approvedAt + paymentDeadlineHours` (default 24 h). |
| FAC-009 | If the owner does not complete payment within the `paymentDeadlineHours` window, a BullMQ job must automatically cancel the booking (status → `CANCELLED`, reason: `PAYMENT_TIMEOUT`) and notify the owner. |
| FAC-010 | On successful Razorpay payment capture webhook (`payment.captured`): booking status → `CONFIRMED`; a `Payment` record linked to `bookingId` is created with `transactionType = FACILITY_BOOKING`; owner receives a booking confirmation with invoice PDF (generated via Puppeteer). |
| FAC-011 | **Cancellation policy:** Admins configure a per-facility JSON cancellation schedule: `[{ hoursBeforeSlot: 48, refundPercent: 100 }, { hoursBeforeSlot: 24, refundPercent: 50 }, { hoursBeforeSlot: 0, refundPercent: 0 }]`. On cancellation, the system calculates elapsed time to the slot start, picks the applicable tier, initiates a Razorpay refund for the computed amount, and notifies the owner. |
| FAC-012 | Admins may **cancel** any booking at any time (e.g. emergency maintenance). Admin-initiated cancellations must trigger a **full refund** regardless of the standard cancellation policy, and the owner must receive an apology notification with the cancellation reason. |
| FAC-013 | All facility booking payments must appear in the society's FY Audit Report under the inflow category `FACILITY_BOOKING`. Refunds appear as outflows under `FACILITY_BOOKING_REFUND`. |

#### 5.8.3 Owner-Facing Discovery & Visibility

| Requirement ID | Description |
|---|---|
| FAC-014 | The owner-facing facility list must show, for each facility: name, description, capacity, photos (pre-signed S3 GET URLs, 1-hour expiry), pricing summary (e.g. "₹2,000 fixed" or "From ₹500/hr"), and an availability calendar for the next `maxAdvanceDays` days. Dates fully booked or blacked out must be marked unavailable. |
| FAC-015 | Owners may view **only their own bookings**. Admins may view all bookings across the society, filterable by facility, date range, status, and owner. Super Admins may view cross-society. |
| FAC-016 | All admin actions on facilities (create, edit, blackout, approve booking, reject, cancel, modify pricing) must be written to the `AdminAuditLog` entity (Section 16.8) with `entityType = FACILITY` or `FACILITY_BOOKING`. |

### 5.9 Common Services Vendor Management

#### 5.9.1 Vendor Registration & Documents

| Requirement ID | Description |
|---|---|
| VND-001 | Only `ADMIN` or `SUPER_ADMIN` users may create, edit, or change the status of a `VendorProfile`. A vendor belongs to a single society (`societyId`). |
| VND-002 | A `VendorProfile` must capture: `businessName`, `ownerName`, `serviceCategory` (enum — see VND-003), `phone` (AES-256-GCM encrypted; `phoneHash` HMAC-SHA256 for lookup), `email` (optional, plaintext), `address` (plaintext), `description` (optional, rich text), `status` (`ACTIVE` \| `INACTIVE`), and `empanelledAt` (date). |
| VND-003 | `serviceCategory` must be an extensible enum stored as a `varchar` column, seeded with standard categories: `PLUMBER`, `ELECTRICIAN`, `CARPENTER`, `PAINTER`, `PEST_CONTROL`, `HOUSEKEEPING`, `SECURITY`, `LANDSCAPING`, `LIFT_AMC`, `GENERATOR_AMC`, `INTERNET_PROVIDER`, `OTHER`. New categories may be added by Super Admins without a schema migration (enum values not used as PostgreSQL `ENUM` type; stored as unconstrained `varchar` with application-level validation). |
| VND-004 | Admins may upload up to **5 supporting documents** per vendor (e.g. GST Certificate, Trade Licence, ID Proof, Insurance Certificate). Documents are stored in the `society-vendor-documents` private S3 bucket with AES-256-GCM KMS encryption. Key convention: `vendor-documents/{societyId}/{vendorId}/{documentType}/v{n}_{filename}`. |
| VND-005 | Vendor documents are served exclusively via **pre-signed S3 GET URLs** (1-hour expiry). Admin-only: Owners cannot access vendor documents. |

#### 5.9.2 Vendor Lifecycle & Owner-Facing Directory

| Requirement ID | Description |
|---|---|
| VND-006 | When a vendor's status is toggled to `INACTIVE`, they must be **immediately hidden** from the owner-facing directory. Re-activation (`ACTIVE`) makes them visible again within 60 seconds (cache TTL). |
| VND-007 | The **owner-facing vendor directory** shows: `businessName`, `serviceCategory`, `description`, `phoneMasked` (last 4 digits only by default). A single-tap "Reveal Phone" action logs the reveal event in `VendorPhoneRevealLog` (ownerId, vendorId, timestamp) for audit, then returns the full decrypted phone for 5 minutes (client-side timer). |
| VND-008 | The vendor directory must be filterable by `serviceCategory`. Owners may not filter by `status` (only `ACTIVE` vendors are returned). |
| VND-009 | Admins may **soft-delete** a vendor (status → `DELETED`). Soft-deleted vendors are invisible to owners and Admins in list views but retained in the database for audit. Hard-delete is prohibited. |
| VND-010 | All admin actions on vendors (create, edit, deactivate, document upload) must be written to the `AdminAuditLog` with `entityType = VENDOR`. Phone reveal events are logged separately in `VendorPhoneRevealLog` (not as admin actions, since owners trigger them). |

### 5.10 Society Event Management

#### 5.10.1 Event Creation & Configuration

| Requirement ID | Description |
|---|---|
| EVT-001 | Any authenticated flat owner (`OWNER` role) or admin (`ADMIN`, `SUPER_ADMIN`) may create a `SocietyEvent`. The event must belong to a `societyId` inferred from the creator's JWT — owners cannot create events for other societies. |
| EVT-002 | A `SocietyEvent` must capture: `title`, `description` (rich text, max 5,000 chars), `eventType` (extensible `varchar` enum — see EVT-003), `startDatetime`, `endDatetime` (optional), `venueName` (free text, optional), `linkedFacilityBookingId` (optional FK to `FacilityBooking`), `maxParticipants` (optional integer), `bannerImageS3Key` (optional), `isPinned` (boolean, admin-only), `status`, and `createdByRole` (`OWNER` \| `ADMIN`). |
| EVT-003 | `eventType` is an extensible enum stored as `varchar`, seeded with: `FESTIVAL`, `SPORTS_TOURNAMENT`, `MOVIE_NIGHT`, `CULTURAL_SHOW`, `KIDS_ACTIVITY`, `HEALTH_CAMP`, `AGM`, `MAINTENANCE_NOTICE`, `OTHER`. Super Admins may add new categories without a schema migration. |
| EVT-004 | An event may optionally be **linked to a `CommonFacility`** by referencing an existing `CONFIRMED` `FacilityBooking` owned by the same user. The system validates that: (a) the `FacilityBooking` belongs to the same society, (b) the booking status is `CONFIRMED`, and (c) the booking's `slotStart`–`slotEnd` overlaps the event's `startDatetime`–`endDatetime`. If the linked `FacilityBooking` is later cancelled, a background job must update the event's `linkedFacilityBookingId` to `NULL` and push a notification to the event organiser. |
| EVT-005 | **RSVP management:** If `maxParticipants` is set, owners may RSVP (`EventRsvp` record created). Once RSVP count reaches `maxParticipants`, further RSVP attempts must return `409 Conflict` with a message indicating the event is full. The organiser may increase `maxParticipants` at any time. RSVP cancellation by the attendee is allowed up to `startDatetime`. |

#### 5.10.2 Event Lifecycle & Feed

| Requirement ID | Description |
|---|---|
| EVT-006 | `EventStatus` lifecycle: `DRAFT` (not yet visible to other owners, saved by organiser) → `UPCOMING` (published, visible in feed) → `ONGOING` (auto-set by job when `startDatetime` is reached) → `COMPLETED` (auto-set after `endDatetime`; or manually by organiser) → `CANCELLED` (by organiser or Admin). Admin moderation adds: `REMOVED` (hidden from all feeds, retained for audit). |
| EVT-007 | A **scheduled BullMQ job** runs every 5 minutes and: (a) transitions events from `UPCOMING` → `ONGOING` when `startDatetime` ≤ `now`; (b) transitions `ONGOING` → `COMPLETED` when `endDatetime` < `now`. Post-`endDatetime` media uploads are allowed for 7 days (`completedAt + 7d`), after which the upload endpoint returns `403 Forbidden`. |
| EVT-008 | The **society event feed** (`GET /events`) returns events for the authenticated user's society, ordered by: (1) pinned events first, then (2) `UPCOMING` events ascending by `startDatetime`, then (3) `ONGOING` events, then (4) `COMPLETED` / `CANCELLED` descending by `startDatetime`. Owners see only `UPCOMING`, `ONGOING`, and `COMPLETED` events; `DRAFT` and `REMOVED` are excluded. |
| EVT-009 | Owners may filter the event feed by `eventType`, `status`, and date range. Pagination is cursor-based (using `createdAt` + `id` composite cursor) with a default page size of 20. |
| EVT-010 | **Admin-pinned events:** Only Admins and Super Admins may set `isPinned = true`. Setting a new pin must atomically unpin any currently pinned event for the same society (database transaction). Pinned events appear at the top of the feed for all owners. |
| EVT-011 | **Notifications:** (a) When an event is created/published (`UPCOMING`), all society owners receive a push + in-app notification. (b) 24 hours before `startDatetime`, all RSVPed owners receive a reminder. (c) When an event is cancelled, all RSVPed owners are notified with the cancellation reason. (d) When an event is removed by Admin, the organiser is notified privately. Notification jobs are managed via BullMQ delayed jobs. |
| EVT-012 | All admin actions on events (pin, remove, moderate media) must be written to the `AdminAuditLog` with `entityType = EVENT` or `EVENT_MEDIA`. Organiser edits and cancellations are recorded in the `event_change_log` table (lightweight immutable append-only log — `eventId`, `changedById`, `changeType`, `payload`, `changedAt`). |

### 5.11 Event Media (Photos & Videos)

#### 5.11.1 Upload & Storage

| Requirement ID | Description |
|---|---|
| MED-001 | The **event organiser** and society **Admins** may upload media to an event. Other owners may not upload media. Media upload is allowed while the event is in `UPCOMING`, `ONGOING`, or `COMPLETED` status (within the 7-day post-completion window per EVT-007). |
| MED-002 | **Supported media types and limits per event:** Photos (JPEG, PNG, WEBP) — max individual file size **20 MB**, max **50 photos** per event. Videos (MP4, MOV) — max individual file size **500 MB**, max **5 videos** per event. Exceeding either limit returns `422 Unprocessable Entity`. |
| MED-003 | Media is stored in the **`society-event-media`** private S3 bucket with **server-side KMS encryption** (`aws:kms`). S3 key convention: `event-media/{societyId}/{eventId}/{mediaType}/{mediaId}_{originalFilename}`. Direct public S3 access is blocked; all downloads served via pre-signed GET URLs (1-hour expiry). |
| MED-004 | The upload flow follows the same pre-signed PUT pattern used for rental documents: (1) caller requests a pre-signed PUT URL; (2) client uploads directly to S3; (3) caller calls a confirm endpoint; (4) system creates an `EventMedia` record. |
| MED-005 | **Thumbnail generation:** On confirmation of a photo upload, the system enqueues a BullMQ job that uses **Sharp** (Node.js image processing) to produce a 480×480-px WebP thumbnail stored at `event-media/{societyId}/{eventId}/thumbnails/{mediaId}_thumb.webp`. On video confirmation, a thumbnail frame is extracted using **FFmpeg** at the 1-second mark and stored at `event-media/{societyId}/{eventId}/thumbnails/{mediaId}_thumb.jpg`. Thumbnails are used in feed cards and gallery grids. |

#### 5.11.2 Viewing & Moderation

| Requirement ID | Description |
|---|---|
| MED-006 | Any authenticated owner within the same society may view event media (photos and videos). Media is **never publicly accessible**; all gallery requests return a list of media metadata and thumbnail pre-signed URLs (1-hour expiry); full-resolution download requires a separate call to the download-url endpoint. |
| MED-007 | **Admin moderation:** Admins may remove any individual `EventMedia` item (status → `REMOVED`). Removed items are hidden from all gallery views but retained in S3 and the database for audit. The organiser receives a push notification when their media item is removed. |
| MED-008 | **Soft-delete by organiser:** The event organiser may delete their own uploaded media items at any time while the event is not `COMPLETED`. Soft-deleted items set `deletedAt` and are hidden from galleries. The S3 object is **not** immediately deleted; a lifecycle rule transitions it to S3 Glacier after 90 days and expires it after 3 years. |

### 5.12 Common Image Media Service

The **Common Image Media Service** (`media-service`) is a dedicated microservice that acts as the single platform-wide entry point for all image uploads and deliveries. Every image displayed in the system — facility photos, event banners, event gallery media, announcement thumbnails, vendor logos, and society logos — must be routed through this service. The service assigns a globally unique **Image ID**, stores the original in S3, and serves transformed variants on demand via query parameters, caching each variant at the CDN edge.

> **Scope — Photos only (v1):** The media-service handles **images** (JPEG, PNG, WEBP, GIF) in v1. Videos continue to be handled by module-specific pre-signed S3 flows (see Section 5.11).

#### 5.12.1 Upload & Unique ID Generation

| Requirement ID | Description |
|---|---|
| IMG-001 | Every image upload must produce a **globally unique Image ID** — a `UUIDv4` string (e.g. `3f2a8c1d-e7b4-4f9a-b2d6-1a0c5e8f3b7d`). The Image ID is the stable public identifier for the asset; clients reference it in all transform URLs. The underlying S3 key and bucket must never be exposed to clients. |
| IMG-002 | The upload flow is a **two-step pre-signed PUT**: (1) caller requests an upload URL from `media-service` (providing `mimeType`, `fileSizeBytes`, `context` — see IMG-003); (2) client uploads directly to S3 using the pre-signed PUT URL; (3) caller calls a confirm endpoint; (4) `media-service` fetches image metadata (dimensions, format) from S3 using **Sharp** and creates a `MediaAsset` record. The `imageId` is returned in both step (1) and step (3) responses. |
| IMG-003 | The upload request must include a **context tag** (`contextType`: `FACILITY_PHOTO`, `EVENT_BANNER`, `EVENT_GALLERY`, `ANNOUNCEMENT`, `VENDOR_LOGO`, `SOCIETY_LOGO`, `PROFILE_AVATAR`) and optional `contextId` (e.g. `facilityId`, `eventId`). These are stored on the `MediaAsset` for filtering and audit; they do not affect the S3 key or transform pipeline. |
| IMG-004 | Accepted image formats: **JPEG, PNG, WEBP, GIF** (static only; animated GIF decoded to first frame). Maximum upload file size: **20 MB** for all context types except `SOCIETY_LOGO` and `PROFILE_AVATAR` (max 5 MB). Requests exceeding size limits must be rejected with `413 Payload Too Large` before a pre-signed URL is issued. |
| IMG-005 | Original images are stored in the **`society-media-assets`** private S3 bucket under the key `originals/{societyId}/{contextType}/{imageId}.{ext}`. Server-side KMS encryption (`aws:kms`) is applied. The bucket has **no public access**; all client delivery goes through CloudFront. |

#### 5.12.2 On-Demand Image Transformation Parameters

| Requirement ID | Description |
|---|---|
| IMG-006 | The `media-service` exposes a **transform endpoint**: `GET /media/images/:imageId` that accepts the following query parameters. All parameters are optional; omitting them returns the original at full resolution with no quality reduction. |
| IMG-007 | **Size presets (`size`)** — a named shorthand that maps to a fixed `width × height` bounding box. Preset values and their dimensions: `thumbnail` → 120×120, `small` → 320×240, `medium` → 640×480, `large` → 1280×960, `xlarge` → 1920×1440, `original` → no resize. When `size` is specified alongside explicit `width`/`height` parameters, explicit dimensions take precedence and `size` is ignored. |
| IMG-008 | **Explicit dimensions (`width`, `height`)** — integer values in pixels (range 1–4000 each). The image is resized to fit within the specified bounding box while **preserving aspect ratio** (Sharp `fit: 'inside'` mode) unless `crop=true` is also passed, in which case Sharp `fit: 'cover'` is used. Passing only `width` or only `height` resizes along that axis and scales the other proportionally. |
| IMG-009 | **Quality (`quality`)** — integer 1–100 controlling lossy compression. Default: **80** for JPEG/WEBP output, **lossless** for PNG output. Values outside 1–100 return `400 Bad Request`. |
| IMG-010 | **Output format (`format`)** — accepted values: `webp`, `jpeg`, `png`, `avif`. Default: **`webp`** (best compression-to-quality ratio for web and mobile). If the client does not support WebP, it should pass `format=jpeg`. AVIF is supported but CPU-intensive; it is rate-limited to 10 requests/s per service instance. |
| IMG-011 | **Crop mode (`crop`)** — boolean (`true`/`false`), default `false`. When `true`, the image is centre-cropped to exactly `width × height` (requires both dimensions to be specified; otherwise returns `400 Bad Request`). |
| IMG-012 | **Blur (`blur`)** — integer 1–100 (sigma value passed to Sharp's Gaussian blur). Default: no blur. Used for placeholder progressive loading (e.g. `blur=5` for a low-quality image placeholder, LQIP). |

#### 5.12.3 Variant Caching & CDN Delivery

| Requirement ID | Description |
|---|---|
| IMG-013 | Each unique combination of `(imageId, width, height, quality, format, crop, blur)` constitutes a **variant**. Variants are stored in S3 under `variants/{societyId}/{contextType}/{imageId}/{params_hash}.{format}` where `params_hash` is the SHA-256 of the canonical sorted query string. On the first request for a variant, the `media-service` fetches the original from S3, applies the Sharp transform, stores the variant back to S3, and streams the result to the client. Subsequent requests for the same variant are served directly from S3 / CloudFront cache. |
| IMG-014 | **AWS CloudFront** sits in front of the `society-media-assets` S3 bucket. All image delivery (`GET /media/images/:imageId`) is routed through CloudFront. The cache key is the full request URL including query parameters. CloudFront TTL: **7 days** for variant objects; originals are **never** served through CloudFront (they are only accessed internally by `media-service`). |
| IMG-015 | **Cache-Control headers** returned by the transform endpoint: `Cache-Control: public, max-age=604800, stale-while-revalidate=86400` (7-day browser/CDN cache, 1-day stale-while-revalidate). Images are **immutable once generated** — the same `imageId` + params always yield the same output; therefore `immutable` may be appended to the header for versioned variants. |
| IMG-016 | **Soft-delete and purge:** When a `MediaAsset` is deleted (soft-delete via `deletedAt`), all CloudFront cached paths for that `imageId` must be **invalidated** via the CloudFront Invalidations API (`/media/images/{imageId}*`). S3 originals are retained for 30 days after `deletedAt`, then permanently deleted by an S3 lifecycle rule. Variants are retained for 7 days before lifecycle expiry. |

### 5.4 Announcements & Notifications

| Requirement ID | Description |
|---|---|
| ANN-001 | Admin broadcasts announcements (text, image) to all or filtered residents. |
| ANN-002 | Notifications delivered via FCM (mobile) and in-app bell icon (web). |
| ANN-003 | Owners can set quiet hours; non-urgent notifications queued accordingly. |
| ANN-004 | Emergency alerts bypass quiet hours and quiet-push settings. |

---

## 6. Non-Functional Requirements

### 6.1 Performance

| Metric | Target |
|---|---|
| API p50 latency | < 80 ms |
| API p99 latency | < 300 ms |
| Mobile app Time-to-Interactive (cold start) | < 3 s on mid-range device |
| Visitor log write throughput | ≥ 500 concurrent gate terminals per society cluster |

### 6.2 Availability & Reliability

- **RTO (Recovery Time Objective):** ≤ 1 hour.
- **RPO (Recovery Point Objective):** ≤ 15 minutes (WAL-based streaming replication).
- Target **99.9% monthly uptime** per microservice.
- Circuit breakers and fallback responses configured on all inter-service calls.

### 6.3 Scalability

- Horizontal pod autoscaling (HPA) on all NestJS services triggered at 70% CPU/memory.
- PostgreSQL read replicas for analytics and report queries.
- Multi-tenant data isolation via `society_id` column-level tenant discriminator (not schema-per-tenant, for cost efficiency at scale).

### 6.4 Accessibility

- WCAG 2.1 Level AA compliance on all web dashboards.
- React Native apps follow platform accessibility guidelines (iOS VoiceOver, Android TalkBack).

### 6.5 Internationalisation

- All UI strings externalised via i18n keys (react-i18next).
- Date/time stored in UTC; displayed in society's configured timezone.
- Initial languages: **English**, **Hindi**, **Marathi** (extensible).

---

## 7. Data Schema Overview

### 7.1 Encrypted Phone Number Design

#### 7.1.1 Problem Statement

The phone number is the **primary user identifier** across all services. It must be:
1. **Unique** — enforced at the database level.
2. **Searchable** — system must locate a user by phone number.
3. **Encrypted at rest** — raw phone number must never appear in database storage.
4. **GDPR-erasable** — must be deletable without breaking referential integrity.

#### 7.1.2 Dual-Column Strategy

```
┌─────────────────────────────────────────────────────────┐
│  Application Layer                                       │
│  Input: +919876543210 (raw phone)                        │
│                                                          │
│  ┌──────────────┐    ┌──────────────────────────────┐   │
│  │ HMAC-SHA256  │    │ AES-256-GCM Encrypt           │   │
│  │ (HMAC Key)   │    │ (Encryption Key + random IV)  │   │
│  └──────┬───────┘    └──────────────┬────────────────┘   │
│         │                           │                    │
└─────────┼───────────────────────────┼────────────────────┘
          │                           │
          ▼                           ▼
  phone_hash (VARCHAR 64)    phone_encrypted (BYTEA)
  UNIQUE INDEX               No index
  Used for: lookup,          Used for: display, export,
  deduplication              GDPR portability
```

- **`phone_hash`**: `HMAC-SHA256(normalised_phone, HMAC_SECRET)` — deterministic, allows `WHERE phone_hash = ?` queries. The raw phone is never recoverable from this column alone (one-way with secret).
- **`phone_encrypted`**: `AES-256-GCM(normalised_phone, DEK, random_IV)` — reversible for display and GDPR export. IV stored prepended to ciphertext.
- Both keys (`HMAC_SECRET`, `DEK`) are stored in **AWS KMS / HashiCorp Vault**, never in application config or source code.

#### 7.1.3 Phone Number Normalisation

All phone numbers are normalised to **E.164 format** (`+[country code][number]`) before hashing or encryption. This ensures `+91 98765 43210`, `09876543210`, and `+919876543210` resolve to the same record.

#### 7.1.4 Key Rotation

1. Super Admin triggers rotation job via `super-admin-service`.
2. Job fetches all `phone_encrypted` rows in batches of 1,000.
3. Each batch: decrypt with old DEK → re-encrypt with new DEK → update row.
4. Old DEK retired in KMS after 100% of rows migrated.
5. `HMAC_SECRET` rotation requires re-computing all `phone_hash` values — scheduled during low-traffic window.

### 7.2 Core TypeORM Entities

#### 7.2.1 Society Entity

```typescript
@Entity('societies')
export class Society {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 10, unique: true })
  code: string; // e.g. "SKPL-001" — used in URLs & tenant routing

  @Column({ type: 'varchar', length: 100 })
  city: string;

  @Column({ type: 'varchar', length: 100 })
  state: string;

  @Column({ type: 'varchar', length: 10 })
  pincode: string;

  @Column({ type: 'varchar', length: 50, default: 'Asia/Kolkata' })
  timezone: string;

  @Column({ type: 'enum', enum: SocietyStatus, default: SocietyStatus.ACTIVE })
  status: SocietyStatus; // ACTIVE | INACTIVE | SUSPENDED

  @Column({ type: 'enum', enum: SubscriptionTier, default: SubscriptionTier.BASIC })
  subscriptionTier: SubscriptionTier;

  @OneToMany(() => Wing, (wing) => wing.society)
  wings: Wing[];

  @OneToMany(() => User, (user) => user.society)
  users: User[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date; // soft delete
}
```

#### 7.2.2 User Entity (Owner / Admin / Staff)

```typescript
@Entity('users')
@Index('IDX_users_phone_hash', ['phoneHash'], { unique: true })
@Index('IDX_users_society', ['societyId'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  societyId: string;

  @ManyToOne(() => Society, (society) => society.users)
  @JoinColumn({ name: 'society_id' })
  society: Society;

  @Column({ type: 'varchar', length: 255 })
  fullName: string;

  /**
   * Deterministic HMAC-SHA256 of E.164 phone number.
   * Used for all WHERE-clause lookups and unique constraint.
   * Raw phone is NEVER stored in this column.
   */
  @Column({ type: 'varchar', length: 64, unique: true })
  phoneHash: string;

  /**
   * AES-256-GCM ciphertext of E.164 phone number.
   * Prepended with 12-byte IV. Decrypted only for display/export.
   * Must NEVER be logged or sent to analytics pipelines.
   */
  @Column({ type: 'bytea' })
  phoneEncrypted: Buffer;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole; // OWNER | ADMIN | SUPER_ADMIN | GUARD | MAINTENANCE | ACCOUNTANT

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  gdprErasureRequested: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  gdprErasureRequestedAt: Date;

  @Column({ type: 'jsonb', default: {} })
  preferences: Record<string, unknown>; // quiet hours, notification opt-outs

  @OneToMany(() => Flat, (flat) => flat.owner)
  flats: Flat[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
```

#### 7.2.3 Flat Entity

```typescript
@Entity('flats')
@Index('IDX_flats_society_wing', ['societyId', 'wingId'])
export class Flat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  societyId: string;

  @Column({ type: 'uuid' })
  wingId: string;

  @ManyToOne(() => Wing, (wing) => wing.flats)
  @JoinColumn({ name: 'wing_id' })
  wing: Wing;

  @Column({ type: 'varchar', length: 20 })
  flatNumber: string; // e.g. "A-401"

  @Column({ type: 'int' })
  floor: number;

  @Column({ type: 'int', default: 1 })
  bedrooms: number;

  @Column({ type: 'uuid', nullable: true })
  ownerId: string;

  @ManyToOne(() => User, (user) => user.flats, { nullable: true })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @Column({ type: 'enum', enum: FlatStatus, default: FlatStatus.OCCUPIED })
  status: FlatStatus; // OCCUPIED | VACANT | UNDER_RENOVATION

  @OneToMany(() => MaintenanceRequest, (req) => req.flat)
  maintenanceRequests: MaintenanceRequest[];

  @OneToMany(() => VisitorLog, (log) => log.hostFlat)
  visitorLogs: VisitorLog[];

  @OneToMany(() => FlatRental, (rental) => rental.flat)
  rentals: FlatRental[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

> **`FlatStatus` enum update:** Add `RENTED` to the existing `FlatStatus` enum alongside `OCCUPIED`, `VACANT`, and `UNDER_RENOVATION`.

---

#### 7.2.3b TenantProfile Entity

Stores the personal details of a tenant. Phone and PAN are encrypted using the same society-specific KMS DEK as owner phone numbers. A `TenantProfile` record is shared across multiple rentals if the same person rents multiple times (identified by `tenantPhoneHash`).

```typescript
@Entity('tenant_profiles')
@Index('IDX_tenant_phone_hash_society', ['societyId', 'tenantPhoneHash'])
export class TenantProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ── Tenant discriminator ──────────────────────────────────────────────────
  @Column({ type: 'uuid' })
  societyId: string;

  // ── Personal details ──────────────────────────────────────────────────────
  @Column({ type: 'varchar', length: 255 })
  fullName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;                    // plaintext; optional

  @Column({ type: 'text', nullable: true })
  permanentAddress: string;         // plaintext; not a searchable field

  // ── Encrypted phone (same pattern as User entity) ─────────────────────────
  @Column({ type: 'varchar', length: 64 })
  tenantPhoneHash: string;          // HMAC-SHA256; deterministic; used for lookup/dedup

  @Column({ type: 'text' })
  tenantPhoneEncrypted: string;     // AES-256-GCM; reversible; never returned in API

  // ── Encrypted PAN ────────────────────────────────────────────────────────
  @Column({ type: 'text' })
  panEncrypted: string;             // AES-256-GCM; reversible; never returned in API

  @Column({ type: 'varchar', length: 4 })
  panLast4: string;                 // e.g. "P123" — for masked display "••••••••P123"

  // ── Emergency contact ────────────────────────────────────────────────────
  @Column({ type: 'varchar', length: 255, nullable: true })
  emergencyContactName: string;

  @Column({ type: 'text', nullable: true })
  emergencyContactPhoneEncrypted: string; // AES-256-GCM; optional

  // ── Soft-delete / GDPR ───────────────────────────────────────────────────
  @Column({ type: 'timestamptz', nullable: true })
  deletedAt: Date;                  // set on GDPR anonymisation run (90 days after tenancy ends)

  @OneToMany(() => FlatRental, (rental) => rental.tenantProfile)
  rentals: FlatRental[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

---

#### 7.2.3c FlatRental Entity

Links a `Flat` to a `TenantProfile` for a specific rental period.

```typescript
export enum RentalStatus {
  ACTIVE  = 'ACTIVE',   // Currently occupied by tenant
  ENDED   = 'ENDED',    // Tenant has vacated; flat reverted to VACANT
  EXPIRED = 'EXPIRED',  // Agreement end date passed; owner not yet confirmed end
}

@Entity('flat_rentals')
@Index('IDX_flat_rentals_flat', ['flatId'])
@Index('IDX_flat_rentals_society_status', ['societyId', 'status'])
export class FlatRental {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  societyId: string;

  @Column({ type: 'uuid' })
  flatId: string;

  @ManyToOne(() => Flat, (flat) => flat.rentals)
  @JoinColumn({ name: 'flat_id' })
  flat: Flat;

  @Column({ type: 'uuid' })
  tenantProfileId: string;

  @ManyToOne(() => TenantProfile, (tp) => tp.rentals)
  @JoinColumn({ name: 'tenant_profile_id' })
  tenantProfile: TenantProfile;

  @Column({ type: 'uuid' })
  ownerId: string;                  // FK to User (the flat owner who created the tenancy)

  // ── Rental terms ─────────────────────────────────────────────────────────
  @Column({ type: 'date' })
  startDate: string;                // ISO date: "YYYY-MM-DD"

  @Column({ type: 'date', nullable: true })
  endDate: string;                  // When tenancy was actually ended

  @Column({ type: 'date', nullable: true })
  agreementEndDate: string;         // Expiry date on the rent agreement document

  @Column({ type: 'int', nullable: true })
  monthlyRentPaise: number;         // Monthly rent in paise (₹1 = 100 paise)

  @Column({ type: 'int', nullable: true })
  securityDepositPaise: number;     // Security deposit in paise

  @Column({
    type: 'enum',
    enum: RentalStatus,
    default: RentalStatus.ACTIVE,
  })
  status: RentalStatus;

  // ── Audit metadata ────────────────────────────────────────────────────────
  @Column({ type: 'uuid' })
  createdById: string;              // ownerId (or adminId if admin created on owner's behalf)

  @Column({ type: 'uuid', nullable: true })
  endedById: string;

  @Column({ type: 'timestamptz', nullable: true })
  endedAt: Date;

  @Column({ type: 'text', nullable: true })
  endReason: string;                // "Tenant vacated", "Agreement not renewed", etc.

  @OneToMany(() => RentalDocument, (doc) => doc.rental)
  documents: RentalDocument[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

---

#### 7.2.3d RentalDocument Entity

Tracks every uploaded document version (rent agreement, PAN card copy) linked to a `FlatRental`.

```typescript
export enum RentalDocumentType {
  RENT_AGREEMENT = 'RENT_AGREEMENT',
  PAN_CARD       = 'PAN_CARD',
}

export enum RentalDocumentStatus {
  ACTIVE     = 'ACTIVE',      // The current version
  SUPERSEDED = 'SUPERSEDED',  // Replaced by a newer upload; retained for audit
}

@Entity('rental_documents')
@Index('IDX_rental_docs_rental_type', ['rentalId', 'documentType'])
export class RentalDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  rentalId: string;

  @ManyToOne(() => FlatRental, (rental) => rental.documents)
  @JoinColumn({ name: 'rental_id' })
  rental: FlatRental;

  @Column({ type: 'uuid' })
  societyId: string;

  @Column({ type: 'enum', enum: RentalDocumentType })
  documentType: RentalDocumentType;

  // ── S3 storage ────────────────────────────────────────────────────────────
  @Column({ type: 'text' })
  s3Key: string;                    // e.g. "rental-documents/{societyId}/{flatId}/{rentalId}/RENT_AGREEMENT/v2_agreement.pdf"

  @Column({ type: 'varchar', length: 255 })
  originalFilename: string;         // Original filename as uploaded by owner

  @Column({ type: 'varchar', length: 50 })
  mimeType: string;                 // "application/pdf" | "image/jpeg" | "image/png"

  @Column({ type: 'int' })
  fileSizeBytes: number;

  @Column({ type: 'int', default: 1 })
  version: number;                  // Increments on each re-upload of the same documentType

  @Column({ type: 'enum', enum: RentalDocumentStatus, default: RentalDocumentStatus.ACTIVE })
  status: RentalDocumentStatus;

  // ── Audit metadata ────────────────────────────────────────────────────────
  @Column({ type: 'uuid' })
  uploadedById: string;             // Owner or Admin who uploaded

  @Column({ type: 'timestamptz', nullable: true })
  supersededAt: Date;               // When this version was replaced

  @CreateDateColumn()
  createdAt: Date;
}
```

#### 7.2.4 VisitorLog Entity

```typescript
@Entity('visitor_logs')
@Index('IDX_visitor_logs_society_entry', ['societyId', 'entryTime'])
@Index('IDX_visitor_logs_phone_hash', ['visitorPhoneHash'])
export class VisitorLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  societyId: string;

  @Column({ type: 'varchar', length: 255 })
  visitorName: string;

  /** HMAC-SHA256 of visitor phone; used for frequency / block-list checks */
  @Column({ type: 'varchar', length: 64, nullable: true })
  visitorPhoneHash: string;

  /** AES-256-GCM ciphertext; decrypted only for authorised exports */
  @Column({ type: 'bytea', nullable: true })
  visitorPhoneEncrypted: Buffer;

  @Column({ type: 'uuid' })
  hostFlatId: string;

  @ManyToOne(() => Flat, (flat) => flat.visitorLogs)
  @JoinColumn({ name: 'host_flat_id' })
  hostFlat: Flat;

  @Column({ type: 'varchar', length: 20, nullable: true })
  vehicleNumber: string;

  @Column({ type: 'varchar', length: 255 })
  purpose: string;

  @Column({ type: 'timestamptz' })
  entryTime: Date;

  @Column({ type: 'timestamptz', nullable: true })
  exitTime: Date;

  @Column({ type: 'uuid' })
  entryGuardId: string;

  @Column({ type: 'uuid', nullable: true })
  exitGuardId: string;

  @Column({ type: 'enum', enum: ApprovalStatus, default: ApprovalStatus.PENDING })
  approvalStatus: ApprovalStatus;

  @Column({ type: 'varchar', length: 64, nullable: true })
  preApprovedTokenHash: string; // hashed; raw token never stored

  @Column({ type: 'varchar', length: 512, nullable: true })
  photoUrl: string; // S3 presigned URL; null if consent denied

  @Column({ type: 'boolean', default: false })
  gdprConsent: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date; // soft delete for GDPR erasure
}
```

#### 7.2.5 MaintenanceRequest Entity

```typescript
@Entity('maintenance_requests')
export class MaintenanceRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  societyId: string;

  @Column({ type: 'uuid' })
  flatId: string;

  @ManyToOne(() => Flat, (flat) => flat.maintenanceRequests)
  @JoinColumn({ name: 'flat_id' })
  flat: Flat;

  @Column({ type: 'uuid' })
  raisedById: string; // Owner user ID

  @Column({ type: 'uuid', nullable: true })
  assignedToId: string; // Maintenance staff user ID

  @Column({ type: 'enum', enum: MaintenanceCategory })
  category: MaintenanceCategory; // PLUMBING | ELECTRICAL | CARPENTRY | CLEANING | OTHER

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: MaintenanceStatus, default: MaintenanceStatus.OPEN })
  status: MaintenanceStatus; // OPEN | IN_PROGRESS | RESOLVED | CLOSED | REOPENED

  @Column({ type: 'jsonb', default: [] })
  photoUrls: string[];

  @Column({ type: 'timestamptz', nullable: true })
  slaDueAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  resolvedAt: Date;

  @OneToMany(() => MaintenanceAuditLog, (log) => log.request)
  auditLogs: MaintenanceAuditLog[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

#### 7.2.6 Payment Entity

```typescript
@Entity('payments')
@Index('IDX_payments_society_status', ['societyId', 'status'])
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  societyId: string;

  @Column({ type: 'uuid' })
  flatId: string;

  @ManyToOne(() => Flat)
  @JoinColumn({ name: 'flat_id' })
  flat: Flat;

  @Column({ type: 'uuid' })
  paidById: string; // Owner user ID

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 3, default: 'INR' })
  currency: string;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus; // PENDING | PROCESSING | SUCCESS | FAILED | REFUNDED

  @Column({ type: 'enum', enum: PaymentMode })
  mode: PaymentMode; // UPI | CARD | NET_BANKING | CASH | CHEQUE

  @Column({ type: 'varchar', length: 255, nullable: true })
  gatewayReference: string; // Payment gateway txn ID

  @Column({ type: 'varchar', length: 255, nullable: true })
  invoiceNumber: string;

  @Column({ type: 'date' })
  billingMonth: string; // e.g. "2026-05"

  @Column({ type: 'boolean', default: false })
  isOffline: boolean; // Cash/cheque recorded by Admin

  @Column({ type: 'uuid', nullable: true })
  recordedById: string; // Admin who recorded offline payment

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

#### 7.2.7 AuditReport Entity

Stores the metadata for every generated financial year audit PDF. The actual PDF binary lives in S3; this table is the audit trail for all report versions.

```typescript
@Entity('audit_reports')
@Index('IDX_audit_reports_society_fy', ['societyId', 'financialYear'])
export class AuditReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  societyId: string;

  @ManyToOne(() => Society)
  @JoinColumn({ name: 'society_id' })
  society: Society;

  /**
   * Indian financial year in "YYYY-YYYY" format.
   * e.g. "2025-2026" represents April 1 2025 – March 31 2026.
   */
  @Column({ type: 'varchar', length: 9 })
  financialYear: string;

  /** Period start — always April 1 of the opening year, stored as UTC date */
  @Column({ type: 'date' })
  periodStart: string; // e.g. "2025-04-01"

  /** Period end — always March 31 of the closing year */
  @Column({ type: 'date' })
  periodEnd: string;   // e.g. "2026-03-31"

  @Column({ type: 'enum', enum: AuditReportType })
  reportType: AuditReportType;
  // SOCIETY_ANNUAL    – full society-level audit (Admin/Accountant/SuperAdmin)
  // OWNER_STATEMENT   – per-owner payment statement (Owner self-service)

  /** Nullable for OWNER_STATEMENT when it covers the entire society */
  @Column({ type: 'uuid', nullable: true })
  ownerId: string;

  /** S3 object key: audit-reports/{societyId}/{financialYear}/{reportType}/{version}.pdf */
  @Column({ type: 'varchar', length: 512, nullable: true })
  s3Key: string;

  /** SHA-256 hex digest of the PDF binary; also embedded in PDF XMP metadata */
  @Column({ type: 'varchar', length: 64, nullable: true })
  checksum: string;

  @Column({ type: 'enum', enum: AuditReportStatus, default: AuditReportStatus.PENDING })
  status: AuditReportStatus;
  // PENDING      – generation job queued
  // GENERATING   – BullMQ worker is building the PDF
  // DRAFT        – PDF generated; awaiting Admin review
  // PUBLISHED    – Admin approved and published; owners can access
  // ARCHIVED     – superseded by a newer version; retained for legal hold
  // FAILED       – generation error; see errorMessage

  /** Monotonically increasing version number within a society+FY+type combination */
  @Column({ type: 'int', default: 1 })
  version: number;

  /** Summary financials cached for dashboard display without opening the PDF */
  @Column({ type: 'jsonb', nullable: true })
  summary: {
    totalInflows: number;
    totalOutflows: number;
    netBalance: number;
    outstandingDues: number;
    totalRefunds: number;
    transactionCount: number;
    currency: string;
  };

  @Column({ type: 'boolean', default: false })
  isAutoGenerated: boolean; // true when triggered by the April 1 scheduled job

  @Column({ type: 'uuid', nullable: true })
  generatedById: string; // Admin/system user who triggered generation

  @Column({ type: 'uuid', nullable: true })
  publishedById: string; // Admin who approved and published the report

  @Column({ type: 'timestamptz', nullable: true })
  publishedAt: Date;

  @Column({ type: 'text', nullable: true })
  errorMessage: string; // populated when status = FAILED

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

---

#### 7.2.8 SocietyBankAccount Entity

Stores the society's bank account(s) used for Razorpay settlement. The account number is encrypted at rest; all Razorpay identifiers are kept in plaintext for API reconciliation.

```typescript
export enum BankAccountStatus {
  PENDING_VERIFICATION = 'PENDING_VERIFICATION', // Saved; awaiting penny-drop result
  VERIFIED             = 'VERIFIED',             // Penny-drop confirmed live + correct
  VERIFICATION_FAILED  = 'VERIFICATION_FAILED',  // Penny-drop failed; needs correction
  INACTIVE             = 'INACTIVE',             // Soft-deleted by admin
}

@Entity('society_bank_accounts')
@Index('IDX_bank_accounts_society', ['societyId'])
@Index('IDX_bank_accounts_fund_account', ['razorpayFundAccountId'], { unique: true, where: '"razorpayFundAccountId" IS NOT NULL' })
export class SocietyBankAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ── Tenant discriminator ──────────────────────────────────────────────────
  @Column({ type: 'uuid' })
  societyId: string;

  // ── Encrypted bank credentials ────────────────────────────────────────────
  @Column({ type: 'text' })
  accountNumberEncrypted: string;   // AES-256-GCM; IV prepended; never returned in API

  @Column({ type: 'varchar', length: 4 })
  accountNumberLast4: string;       // Last 4 digits in plaintext for masked display

  @Column({ type: 'varchar', length: 11 })
  ifscCode: string;                 // Validated via Razorpay IFSC API before save

  @Column({ type: 'varchar', length: 255 })
  accountHolderName: string;        // Name on the bank account (society name / trust name)

  @Column({
    type: 'enum',
    enum: ['SAVINGS', 'CURRENT', 'OVERDRAFT'],
    default: 'CURRENT',
  })
  accountType: 'SAVINGS' | 'CURRENT' | 'OVERDRAFT';

  // ── Razorpay identifiers ──────────────────────────────────────────────────
  @Column({ type: 'varchar', length: 50, nullable: true })
  razorpayContactId: string;        // e.g. "cont_AbCdEfGhIjKlMn"

  @Column({ type: 'varchar', length: 50, nullable: true })
  razorpayFundAccountId: string;    // e.g. "fa_AbCdEfGhIjKlMn"

  @Column({ type: 'varchar', length: 50, nullable: true })
  razorpayValidationId: string;     // Fund Account Validation ID for penny-drop

  @Column({ type: 'text', nullable: true })
  razorpayValidationStatus: string; // Raw status from Razorpay webhook

  // ── Account status & routing ──────────────────────────────────────────────
  @Column({
    type: 'enum',
    enum: BankAccountStatus,
    default: BankAccountStatus.PENDING_VERIFICATION,
  })
  status: BankAccountStatus;

  @Column({ type: 'boolean', default: false })
  isPrimary: boolean;               // Only one record per societyId may be true

  @Column({ type: 'text', nullable: true })
  verificationFailureReason: string; // Populated when status = VERIFICATION_FAILED

  // ── Audit metadata ────────────────────────────────────────────────────────
  @Column({ type: 'uuid' })
  createdById: string;              // Admin who added the account

  @Column({ type: 'uuid', nullable: true })
  verifiedById: string;             // System (webhook) or Admin who triggered verification

  @Column({ type: 'timestamptz', nullable: true })
  verifiedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  deactivatedById: string;

  @Column({ type: 'timestamptz', nullable: true })
  deactivatedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

---

#### 7.2.9 CommonFacility Entity

Represents a bookable common area within a society (e.g. Clubhouse, Gym, Swimming Pool).

```typescript
export enum FacilityStatus {
  ACTIVE             = 'ACTIVE',
  INACTIVE           = 'INACTIVE',
  UNDER_MAINTENANCE  = 'UNDER_MAINTENANCE',
}

export enum FacilityPricingModel {
  FIXED    = 'FIXED',    // Single flat fee for any booking
  HOURLY   = 'HOURLY',   // fee = ratePerHourPaise × durationHours
  VARIABLE = 'VARIABLE', // JSON schedule keyed by dayType + slotType
}

@Entity('common_facilities')
@Index('IDX_facility_society', ['societyId'])
export class CommonFacility {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  societyId: string;

  // ── Core info ─────────────────────────────────────────────────────────────
  @Column({ type: 'varchar', length: 255 })
  name: string;                     // e.g. "Clubhouse – Hall A"

  @Column({ type: 'text', nullable: true })
  description: string;              // Rich text (Markdown or HTML)

  @Column({ type: 'varchar', length: 255, nullable: true })
  location: string;                 // Physical location within society

  @Column({ type: 'int', nullable: true })
  capacity: number;                 // Max simultaneous occupants

  @Column({ type: 'enum', enum: FacilityStatus, default: FacilityStatus.ACTIVE })
  status: FacilityStatus;

  // ── Pricing ───────────────────────────────────────────────────────────────
  @Column({ type: 'enum', enum: FacilityPricingModel })
  pricingModel: FacilityPricingModel;

  @Column({ type: 'int', nullable: true })
  fixedFeePaise: number;            // Used when pricingModel = FIXED

  @Column({ type: 'int', nullable: true })
  ratePerHourPaise: number;         // Used when pricingModel = HOURLY

  @Column({ type: 'jsonb', nullable: true })
  variablePriceSchedule: Record<string, number>; // Used when pricingModel = VARIABLE
                                    // key: "WEEKDAY_MORNING" → value in paise

  // ── Booking window ────────────────────────────────────────────────────────
  @Column({ type: 'int', default: 60 })
  maxAdvanceDays: number;           // Owner cannot book more than N days ahead

  @Column({ type: 'int', default: 24 })
  minAdvanceHours: number;          // Owner must book at least N hours before slot

  @Column({ type: 'int', default: 48 })
  autoRejectHours: number;          // PENDING_APPROVAL auto-rejected after N hours

  @Column({ type: 'int', default: 24 })
  paymentDeadlineHours: number;     // APPROVED → must pay within N hours

  // ── Cancellation policy ───────────────────────────────────────────────────
  @Column({ type: 'jsonb', nullable: true })
  cancellationPolicy: Array<{ hoursBeforeSlot: number; refundPercent: number }>;

  // ── Photos ────────────────────────────────────────────────────────────────
  @Column({ type: 'text', array: true, default: '{}' })
  photoS3Keys: string[];            // Up to 10; served as pre-signed GET URLs

  // ── Relations ─────────────────────────────────────────────────────────────
  @OneToMany(() => FacilityBooking, (b) => b.facility)
  bookings: FacilityBooking[];

  @OneToMany(() => FacilityBlackout, (bl) => bl.facility)
  blackouts: FacilityBlackout[];

  // ── Audit metadata ────────────────────────────────────────────────────────
  @Column({ type: 'uuid' })
  createdById: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// ── Blackout periods ───────────────────────────────────────────────────────
@Entity('facility_blackouts')
@Index('IDX_blackout_facility', ['facilityId'])
export class FacilityBlackout {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  facilityId: string;

  @ManyToOne(() => CommonFacility, (f) => f.blackouts)
  @JoinColumn({ name: 'facility_id' })
  facility: CommonFacility;

  @Column({ type: 'timestamptz' })
  startDatetime: Date;

  @Column({ type: 'timestamptz' })
  endDatetime: Date;

  @Column({ type: 'text', nullable: true })
  reason: string;                   // e.g. "Annual Maintenance", "Society AGM"

  @Column({ type: 'uuid' })
  createdById: string;

  @CreateDateColumn()
  createdAt: Date;
}
```

---

#### 7.2.10 FacilityBooking Entity

Records a single booking request from an owner for a facility slot.

```typescript
export enum BookingStatus {
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED         = 'APPROVED',         // Awaiting payment
  CONFIRMED        = 'CONFIRMED',        // Payment captured
  REJECTED         = 'REJECTED',
  CANCELLED        = 'CANCELLED',
}

@Entity('facility_bookings')
@Index('IDX_booking_facility_slot', ['facilityId', 'slotStart', 'slotEnd'])
@Index('IDX_booking_owner', ['ownerId'])
@Index('IDX_booking_society_status', ['societyId', 'status'])
export class FacilityBooking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  societyId: string;

  @Column({ type: 'uuid' })
  facilityId: string;

  @ManyToOne(() => CommonFacility, (f) => f.bookings)
  @JoinColumn({ name: 'facility_id' })
  facility: CommonFacility;

  @Column({ type: 'uuid' })
  ownerId: string;                  // FK to User (the booking owner)

  // ── Slot ──────────────────────────────────────────────────────────────────
  @Column({ type: 'timestamptz' })
  slotStart: Date;

  @Column({ type: 'timestamptz' })
  slotEnd: Date;

  @Column({ type: 'text', nullable: true })
  purposeNote: string;              // "Birthday party", "Corporate offsite", etc.

  // ── Pricing snapshot (frozen at approval time) ────────────────────────────
  @Column({ type: 'int', nullable: true })
  quotedAmountPaise: number;        // Amount presented to owner before payment

  @Column({ type: 'int', nullable: true })
  chargedAmountPaise: number;       // Actual Razorpay order amount

  @Column({ type: 'int', nullable: true })
  refundedAmountPaise: number;      // Populated on cancellation

  // ── Status & lifecycle ────────────────────────────────────────────────────
  @Column({ type: 'enum', enum: BookingStatus, default: BookingStatus.PENDING_APPROVAL })
  status: BookingStatus;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string;

  @Column({ type: 'text', nullable: true })
  cancellationReason: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  cancelledBy: string;              // 'OWNER' | 'ADMIN' | 'SYSTEM'

  // ── Payment linkage ───────────────────────────────────────────────────────
  @Column({ type: 'varchar', length: 100, nullable: true })
  razorpayOrderId: string;          // Created on approval

  @Column({ type: 'uuid', nullable: true })
  paymentId: string;                // FK to Payment entity once captured

  @Column({ type: 'timestamptz', nullable: true })
  paymentDeadline: Date;            // approvedAt + paymentDeadlineHours

  // ── Admin & system actors ─────────────────────────────────────────────────
  @Column({ type: 'uuid', nullable: true })
  approvedById: string;

  @Column({ type: 'timestamptz', nullable: true })
  approvedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  rejectedById: string;

  @Column({ type: 'timestamptz', nullable: true })
  rejectedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

---

#### 7.2.11 VendorProfile Entity

Stores information about an empanelled service vendor. Phone is encrypted at rest using the same pattern as user phones.

```typescript
export enum VendorStatus {
  ACTIVE   = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DELETED  = 'DELETED',   // Soft-deleted; invisible in all views
}

@Entity('vendor_profiles')
@Index('IDX_vendor_society_category', ['societyId', 'serviceCategory'])
@Index('IDX_vendor_phone_hash', ['societyId', 'phoneHash'])
export class VendorProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  societyId: string;

  // ── Business details ──────────────────────────────────────────────────────
  @Column({ type: 'varchar', length: 255 })
  businessName: string;

  @Column({ type: 'varchar', length: 255 })
  ownerName: string;

  @Column({ type: 'varchar', length: 100 })
  serviceCategory: string;          // VND-003 extensible enum stored as varchar

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;                    // Optional; plaintext

  // ── Encrypted phone (same pattern as User entity) ─────────────────────────
  @Column({ type: 'varchar', length: 64 })
  phoneHash: string;                // HMAC-SHA256; for lookup / dedup

  @Column({ type: 'text' })
  phoneEncrypted: string;           // AES-256-GCM; never returned in API by default

  // ── Status & empanelment ──────────────────────────────────────────────────
  @Column({ type: 'enum', enum: VendorStatus, default: VendorStatus.ACTIVE })
  status: VendorStatus;

  @Column({ type: 'date', nullable: true })
  empanelledAt: string;             // ISO date; when the vendor was approved

  // ── Relations ─────────────────────────────────────────────────────────────
  @OneToMany(() => VendorDocument, (d) => d.vendor)
  documents: VendorDocument[];

  // ── Audit metadata ────────────────────────────────────────────────────────
  @Column({ type: 'uuid' })
  createdById: string;

  @Column({ type: 'uuid', nullable: true })
  deactivatedById: string;

  @Column({ type: 'timestamptz', nullable: true })
  deactivatedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

---

#### 7.2.12 VendorDocument Entity

Tracks supporting documents uploaded against a vendor profile (GST, licence, ID, insurance).

```typescript
export enum VendorDocumentType {
  GST_CERTIFICATE  = 'GST_CERTIFICATE',
  TRADE_LICENCE    = 'TRADE_LICENCE',
  ID_PROOF         = 'ID_PROOF',
  INSURANCE        = 'INSURANCE',
  OTHER            = 'OTHER',
}

@Entity('vendor_documents')
@Index('IDX_vendor_doc_vendor', ['vendorId'])
export class VendorDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  vendorId: string;

  @ManyToOne(() => VendorProfile, (v) => v.documents)
  @JoinColumn({ name: 'vendor_id' })
  vendor: VendorProfile;

  @Column({ type: 'uuid' })
  societyId: string;

  @Column({ type: 'enum', enum: VendorDocumentType })
  documentType: VendorDocumentType;

  @Column({ type: 'text' })
  s3Key: string;                    // vendor-documents/{societyId}/{vendorId}/{type}/v{n}_{filename}

  @Column({ type: 'varchar', length: 255 })
  originalFilename: string;

  @Column({ type: 'varchar', length: 50 })
  mimeType: string;

  @Column({ type: 'int' })
  fileSizeBytes: number;

  @Column({ type: 'int', default: 1 })
  version: number;

  @Column({ type: 'uuid' })
  uploadedById: string;

  @CreateDateColumn()
  createdAt: Date;
}
```

---

#### 7.2.13 VendorPhoneRevealLog Entity

Audit trail recording every time an owner reveals a vendor's full phone number.

```typescript
@Entity('vendor_phone_reveal_logs')
@Index('IDX_phone_reveal_owner', ['ownerId'])
@Index('IDX_phone_reveal_vendor', ['vendorId'])
export class VendorPhoneRevealLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  vendorId: string;

  @Column({ type: 'uuid' })
  ownerId: string;

  @Column({ type: 'uuid' })
  societyId: string;

  @Column({ type: 'inet', nullable: true })
  ipAddress: string;                // For anomaly detection

  @CreateDateColumn()
  revealedAt: Date;
}
```

---

#### 7.2.14 SocietyEvent Entity

A community event created by an owner or admin. Optionally linked to a `FacilityBooking` for a venue.

```typescript
export enum EventStatus {
  DRAFT     = 'DRAFT',      // Saved but not yet visible to other owners
  UPCOMING  = 'UPCOMING',   // Published; visible in feed before startDatetime
  ONGOING   = 'ONGOING',    // Auto-set when startDatetime is reached
  COMPLETED = 'COMPLETED',  // Auto-set after endDatetime (or manually)
  CANCELLED = 'CANCELLED',  // By organiser or Admin
  REMOVED   = 'REMOVED',    // Admin moderation; hidden from all feeds
}

@Entity('society_events')
@Index('IDX_event_society_status', ['societyId', 'status'])
@Index('IDX_event_start', ['societyId', 'startDatetime'])
export class SocietyEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  societyId: string;

  // ── Core info ─────────────────────────────────────────────────────────────
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;              // Rich text / Markdown, max 5,000 chars

  @Column({ type: 'varchar', length: 100 })
  eventType: string;                // Extensible varchar enum (see EVT-003)

  @Column({ type: 'timestamptz' })
  startDatetime: Date;

  @Column({ type: 'timestamptz', nullable: true })
  endDatetime: Date;

  // ── Venue ─────────────────────────────────────────────────────────────────
  @Column({ type: 'varchar', length: 255, nullable: true })
  venueName: string;                // Free-text venue description

  @Column({ type: 'uuid', nullable: true })
  linkedFacilityBookingId: string;  // FK to FacilityBooking (nullable)

  // ── Participation ─────────────────────────────────────────────────────────
  @Column({ type: 'int', nullable: true })
  maxParticipants: number;          // NULL = unlimited

  @Column({ type: 'int', default: 0 })
  rsvpCount: number;                // Denormalised counter; updated on RSVP create/delete

  // ── Visuals ───────────────────────────────────────────────────────────────
  @Column({ type: 'text', nullable: true })
  bannerImageS3Key: string;         // Pre-signed GET URL served to clients

  // ── Status & feed control ─────────────────────────────────────────────────
  @Column({ type: 'enum', enum: EventStatus, default: EventStatus.DRAFT })
  status: EventStatus;

  @Column({ type: 'boolean', default: false })
  isPinned: boolean;                // Admin-only; only one pinned event per society

  @Column({ type: 'varchar', length: 20, default: 'OWNER' })
  createdByRole: string;            // 'OWNER' | 'ADMIN' — displayed as badge in UI

  // ── Moderation ────────────────────────────────────────────────────────────
  @Column({ type: 'text', nullable: true })
  removalReason: string;            // Populated when status = REMOVED

  @Column({ type: 'uuid', nullable: true })
  removedById: string;

  @Column({ type: 'timestamptz', nullable: true })
  removedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt: Date;                // Set when status transitions to COMPLETED

  // ── Relations ─────────────────────────────────────────────────────────────
  @OneToMany(() => EventRsvp, (r) => r.event)
  rsvps: EventRsvp[];

  @OneToMany(() => EventMedia, (m) => m.event)
  media: EventMedia[];

  // ── Audit ─────────────────────────────────────────────────────────────────
  @Column({ type: 'uuid' })
  createdById: string;              // Owner or Admin who created the event

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

---

#### 7.2.15 EventRsvp Entity

Tracks each owner's RSVP to a `SocietyEvent`. One record per (event, owner) pair.

```typescript
@Entity('event_rsvps')
@Unique(['eventId', 'ownerId'])
@Index('IDX_rsvp_event', ['eventId'])
@Index('IDX_rsvp_owner', ['ownerId'])
export class EventRsvp {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  eventId: string;

  @ManyToOne(() => SocietyEvent, (e) => e.rsvps)
  @JoinColumn({ name: 'event_id' })
  event: SocietyEvent;

  @Column({ type: 'uuid' })
  ownerId: string;                  // FK to User

  @Column({ type: 'uuid' })
  societyId: string;

  @Column({ type: 'timestamptz', nullable: true })
  cancelledAt: Date;                // NULL = active RSVP; set on cancellation

  @CreateDateColumn()
  createdAt: Date;
}
```

---

#### 7.2.16 EventMedia Entity

Tracks each photo or video uploaded to a `SocietyEvent`.

```typescript
export enum MediaType {
  PHOTO = 'PHOTO',
  VIDEO = 'VIDEO',
}

export enum MediaStatus {
  ACTIVE   = 'ACTIVE',
  REMOVED  = 'REMOVED',   // Admin moderation
  DELETED  = 'DELETED',   // Organiser soft-delete
}

@Entity('event_media')
@Index('IDX_media_event', ['eventId'])
@Index('IDX_media_uploader', ['uploadedById'])
export class EventMedia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  eventId: string;

  @ManyToOne(() => SocietyEvent, (e) => e.media)
  @JoinColumn({ name: 'event_id' })
  event: SocietyEvent;

  @Column({ type: 'uuid' })
  societyId: string;

  @Column({ type: 'enum', enum: MediaType })
  mediaType: MediaType;             // PHOTO | VIDEO

  // ── S3 storage ────────────────────────────────────────────────────────────
  @Column({ type: 'text' })
  s3Key: string;                    // event-media/{societyId}/{eventId}/{mediaType}/{id}_{filename}

  @Column({ type: 'text', nullable: true })
  thumbnailS3Key: string;           // Generated by Sharp (photo) or FFmpeg (video)

  @Column({ type: 'varchar', length: 255 })
  originalFilename: string;

  @Column({ type: 'varchar', length: 50 })
  mimeType: string;                 // e.g. "image/jpeg", "video/mp4"

  @Column({ type: 'int' })
  fileSizeBytes: number;

  // ── Status ────────────────────────────────────────────────────────────────
  @Column({ type: 'enum', enum: MediaStatus, default: MediaStatus.ACTIVE })
  status: MediaStatus;

  @Column({ type: 'text', nullable: true })
  moderationReason: string;         // Populated by Admin when status = REMOVED

  // ── Thumbnail processing ──────────────────────────────────────────────────
  @Column({ type: 'boolean', default: false })
  thumbnailReady: boolean;          // Set to true by BullMQ thumbnail job

  // ── Audit ─────────────────────────────────────────────────────────────────
  @Column({ type: 'uuid' })
  uploadedById: string;

  @Column({ type: 'timestamptz', nullable: true })
  deletedAt: Date;                  // Organiser soft-delete

  @Column({ type: 'uuid', nullable: true })
  removedById: string;              // Admin who moderated

  @Column({ type: 'timestamptz', nullable: true })
  removedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
```

---

#### 7.2.17 MediaAsset Entity

The central registry for every image uploaded through the Common Image Media Service. This entity is the **single source of truth** for all image assets across the platform — facility photos, event banners, event gallery photos, vendor logos, and society logos all resolve to a `MediaAsset` record.

```typescript
export enum MediaAssetContextType {
  FACILITY_PHOTO   = 'FACILITY_PHOTO',
  EVENT_BANNER     = 'EVENT_BANNER',
  EVENT_GALLERY    = 'EVENT_GALLERY',
  ANNOUNCEMENT     = 'ANNOUNCEMENT',
  VENDOR_LOGO      = 'VENDOR_LOGO',
  SOCIETY_LOGO     = 'SOCIETY_LOGO',
  PROFILE_AVATAR   = 'PROFILE_AVATAR',
}

export enum MediaAssetStatus {
  ACTIVE  = 'ACTIVE',
  DELETED = 'DELETED',   // Soft-delete; CloudFront invalidation triggered
}

@Entity('media_assets')
@Index('IDX_media_asset_society_context', ['societyId', 'contextType'])
@Index('IDX_media_asset_context_id', ['contextType', 'contextId'])
export class MediaAsset {
  /**
   * The public-facing unique Image ID (UUIDv4).
   * This is the only identifier exposed to clients.
   * All transform URLs are built as /media/images/:id?params
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;                        // = imageId exposed to clients

  @Column({ type: 'uuid', nullable: true })
  societyId: string;                 // NULL for global assets (e.g. default avatars)

  // ── Context tagging ───────────────────────────────────────────────────────
  @Column({ type: 'enum', enum: MediaAssetContextType })
  contextType: MediaAssetContextType;

  @Column({ type: 'uuid', nullable: true })
  contextId: string;                 // e.g. facilityId, eventId, vendorId (nullable for unlinked)

  // ── Original file metadata ─────────────────────────────────────────────
  @Column({ type: 'text' })
  originalS3Key: string;             // originals/{societyId}/{contextType}/{id}.{ext}
                                     // Never exposed to clients

  @Column({ type: 'varchar', length: 50 })
  mimeType: string;                  // Original MIME: "image/jpeg" | "image/png" | "image/webp" | "image/gif"

  @Column({ type: 'varchar', length: 10 })
  originalFormat: string;            // "jpeg" | "png" | "webp" | "gif"

  @Column({ type: 'int' })
  originalWidth: number;             // Pixels — extracted by Sharp on confirm

  @Column({ type: 'int' })
  originalHeight: number;            // Pixels

  @Column({ type: 'int' })
  fileSizeBytes: number;             // Original file size

  // ── Variant cache registry ─────────────────────────────────────────────
  /**
   * JSONB map: paramsHash → { s3Key, width, height, quality, format, fileSizeBytes, cachedAt }
   * Written by media-service on first transform request for each unique param set.
   * Serves as a local index for cache management and invalidation.
   */
  @Column({ type: 'jsonb', default: '{}' })
  variants: Record<string, {
    s3Key:          string;
    width:          number | null;
    height:         number | null;
    quality:        number;
    format:         string;
    fileSizeBytes:  number;
    cachedAt:       string;          // ISO timestamp
  }>;

  // ── Status & lifecycle ─────────────────────────────────────────────────
  @Column({ type: 'enum', enum: MediaAssetStatus, default: MediaAssetStatus.ACTIVE })
  status: MediaAssetStatus;

  @Column({ type: 'timestamptz', nullable: true })
  deletedAt: Date;                   // Soft-delete; triggers CloudFront invalidation

  // ── Audit ──────────────────────────────────────────────────────────────
  @Column({ type: 'uuid' })
  uploadedById: string;              // User ID of the uploader

  @Column({ type: 'varchar', length: 50, nullable: true })
  uploadedByRole: string;            // 'OWNER' | 'ADMIN' | 'SUPER_ADMIN'

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

> **Cross-module usage:** Other entities reference a `MediaAsset` by storing the `imageId` (`MediaAsset.id`) as a plain `varchar` column (e.g. `CommonFacility.photoImageIds: string[]`, `SocietyEvent.bannerImageId: string`). The `media-service` is the only service that reads/writes `MediaAsset` records directly; all other services call `media-service` via internal REST.

---

## 8. API Gateway Architecture

### 8.1 Overview

```
Client (Mobile / Web)
        │
        ▼
  ┌─────────────────────────────────────────────────────────┐
  │               API Gateway (NestJS)                       │
  │  Port: 3000                                              │
  │                                                          │
  │  Modules:                                                │
  │  ┌──────────┐  ┌────────────┐  ┌──────────────────────┐ │
  │  │  /auth   │  │ /payments  │  │      /common          │ │
  │  │  Module  │  │   Module   │  │      Module           │ │
  │  └────┬─────┘  └─────┬──────┘  └──────────┬───────────┘ │
  │       │              │                     │             │
  └───────┼──────────────┼─────────────────────┼─────────────┘
          │              │                     │
    JWT validation   Stripe/Razorpay       Rate limiting
    OTP dispatch     webhook handler       Health checks
    Token refresh    Invoice generation    Feature flags
          │              │                     │
  ┌───────▼──────────────▼─────────────────────▼─────────────┐
  │              Internal Service Mesh (gRPC / REST)          │
  │                                                           │
  │  ┌───────────────┐  ┌────────────────┐  ┌─────────────┐  │
  │  │ owner-service │  │ admin-service  │  │ superadmin  │  │
  │  │  Port: 3001   │  │  Port: 3002    │  │  service    │  │
  │  │               │  │                │  │ Port: 3003  │  │
  │  └───────────────┘  └────────────────┘  └─────────────┘  │
  └───────────────────────────────────────────────────────────┘
```

### 8.2 Auth Module (`/auth`)

#### Endpoints

| Method | Path | Description | Rate Limit |
|---|---|---|---|
| `POST` | `/auth/otp/send` | Send OTP to phone number | 5 req / 10 min / IP |
| `POST` | `/auth/otp/verify` | Verify OTP; returns JWT access + refresh tokens | 5 req / 10 min / IP |
| `POST` | `/auth/token/refresh` | Exchange refresh token for new access token | 20 req / min / user |
| `POST` | `/auth/token/revoke` | Revoke refresh token (logout) | — |
| `POST` | `/auth/2fa/totp/setup` | Initiate TOTP setup (Super Admin only) | — |
| `POST` | `/auth/2fa/totp/verify` | Verify TOTP code (Super Admin only) | 5 req / 5 min / user |

#### JWT Strategy

```
Access Token:  15-minute expiry; signed RS256; payload: { sub, role, societyId, flatId? }
Refresh Token: 30-day expiry; stored as hashed value in Redis with user ID binding
```

#### Routing Guard Logic

```typescript
// gateway/src/auth/guards/roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<UserRole[]>(ROLES_KEY, context.getHandler());
    const { user } = context.switchToHttp().getRequest();
    // Cross-society access blocked: user.societyId must match route societyId param
    // Super Admin bypasses this check
    if (user.role === UserRole.SUPER_ADMIN) return true;
    return requiredRoles.includes(user.role) && this.validateSocietyScope(user, context);
  }
}
```

### 8.3 Payments Module (`/payments`)

The Payments module integrates exclusively with **Razorpay** as the payment gateway, supporting standard checkout, UPI collect/intent flows, and UPI Autopay mandates.

#### Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/payments/invoices` | Owner JWT | List invoices for authenticated owner's flat |
| `GET` | `/payments/invoices/:id` | Owner JWT | Get invoice detail + PDF download URL |
| `POST` | `/payments/orders` | Owner JWT | Create a Razorpay Order; returns `order_id` + `key_id` |
| `POST` | `/payments/verify` | Owner JWT | Verify Razorpay payment signature after checkout |
| `POST` | `/payments/webhook` | Signature guard | Receive Razorpay webhook events (no JWT required) |
| `GET` | `/payments/transactions` | Admin JWT | List transactions for the admin's society |
| `POST` | `/payments/offline` | Admin JWT | Record an offline (cash/cheque) payment |
| `GET` | `/payments/reports/monthly` | Admin JWT | Monthly financial summary |
| `POST` | `/payments/refunds` | Admin JWT | Initiate a refund via Razorpay Refund API |
| `GET` | `/payments/refunds/:id` | Admin JWT | Poll refund status |
| `POST` | `/payments/upi/mandate` | Owner JWT | Create a UPI Autopay recurring mandate |
| `PATCH` | `/payments/upi/mandate/:id/cancel` | Owner JWT | Cancel an active UPI Autopay mandate |
| `GET` | `/payments/audit-reports` | Admin / Accountant JWT | List all audit reports for the society (filtered by FY, type, status) |
| `POST` | `/payments/audit-reports/generate` | Admin JWT | Trigger on-demand generation of a Society-Level Annual Audit PDF |
| `GET` | `/payments/audit-reports/:id` | Admin / Accountant / Owner JWT | Get report metadata + pre-signed PDF download URL (Owners: published only) |
| `GET` | `/payments/audit-reports/:id/status` | Admin JWT | Poll generation status (`PENDING` → `GENERATING` → `DRAFT` / `FAILED`) |
| `PATCH` | `/payments/audit-reports/:id/publish` | Admin JWT | Mark a draft report as published; notifies all owners |
| `GET` | `/payments/audit-reports/owner/statement` | Owner JWT | Generate / retrieve owner's own annual payment statement PDF for a given FY |

#### Razorpay Order → Verify → Webhook Flow

```
Owner taps "Pay Now" (mobile or web)
       │
       ▼
POST /payments/orders
  ├── Gateway calls Razorpay Orders API:
  │     POST https://api.razorpay.com/v1/orders
  │     body: { amount (paise), currency: "INR", receipt: invoiceNumber,
  │             notes: { societyId, flatId, billingMonth } }
  ├── Razorpay returns: { id: "order_XXXXX", ... }
  └── Gateway stores order in DB (status: CREATED); returns order_id + key_id to client

       │
       ▼
Client renders Razorpay Checkout SDK (web) or React Native SDK (mobile)
  ├── User selects payment method: UPI / Card / Net Banking / Wallet / EMI
  └── On success, Razorpay returns: { razorpay_order_id, razorpay_payment_id, razorpay_signature }

       │
       ▼
POST /payments/verify
  ├── Gateway verifies signature:
  │     HMAC-SHA256(razorpay_order_id + "|" + razorpay_payment_id, RAZORPAY_KEY_SECRET)
  │     == razorpay_signature  ?  VALID : REJECT (400)
  ├── Updates payment record: status = PROCESSING, gatewayReference = razorpay_payment_id
  └── Returns 200 OK to client (optimistic confirmation shown)

       │
       ▼
Razorpay fires webhook → POST /payments/webhook  (async, authoritative)
  ├── WebhookSignatureGuard verifies X-Razorpay-Signature header:
  │     HMAC-SHA256(raw request body, RAZORPAY_WEBHOOK_SECRET)
  ├── Handles events:
  │     payment.captured  → status = SUCCESS; enqueue receipt-generation job
  │     payment.failed    → status = FAILED; enqueue retry-reminder job
  │     refund.processed  → refund record updated; owner notified
  │     subscription.charged (UPI Autopay) → new payment record created
  └── Returns 200 OK to Razorpay immediately (processing is async via BullMQ)
```

#### Webhook Signature Guard Implementation

```typescript
// gateway/src/payments/guards/webhook-signature.guard.ts
@Injectable()
export class WebhookSignatureGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<RawBodyRequest<Request>>();
    const receivedSig = req.headers['x-razorpay-signature'] as string;
    const secret = this.configService.get<string>('RAZORPAY_WEBHOOK_SECRET');
    // rawBody preserved by NestJS bodyParser rawBody: true option
    const expectedSig = createHmac('sha256', secret)
      .update(req.rawBody)
      .digest('hex');
    if (!timingSafeEqual(Buffer.from(receivedSig), Buffer.from(expectedSig))) {
      throw new UnauthorizedException('Invalid Razorpay webhook signature');
    }
    return true;
  }
}
```

#### Razorpay Service Implementation

```typescript
// gateway/src/payments/razorpay.service.ts
@Injectable()
export class RazorpayService {
  private readonly client: Razorpay;

  constructor(private readonly configService: ConfigService) {
    this.client = new Razorpay({
      key_id: configService.get('RAZORPAY_KEY_ID'),
      key_secret: configService.get('RAZORPAY_KEY_SECRET'),
    });
  }

  async createOrder(amountInPaise: number, receipt: string,
                    notes: Record<string, string>): Promise<RazorpayOrder> {
    return this.client.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt,
      notes,
      payment_capture: true, // auto-capture on payment success
    });
  }

  verifyPaymentSignature(orderId: string, paymentId: string,
                         signature: string): boolean {
    const body = `${orderId}|${paymentId}`;
    const expected = createHmac('sha256', this.configService.get('RAZORPAY_KEY_SECRET'))
      .update(body).digest('hex');
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  }

  async createRefund(paymentId: string, amountInPaise?: number): Promise<RazorpayRefund> {
    return this.client.payments.refund(paymentId, {
      ...(amountInPaise && { amount: amountInPaise }), // partial refund if specified
      notes: { initiatedBy: 'admin' },
    });
  }

  async createUpiMandate(params: UpiMandateParams): Promise<RazorpaySubscription> {
    return this.client.subscriptions.create({
      plan_id: params.planId,           // pre-configured in Razorpay dashboard
      total_count: params.totalMonths,  // e.g. 12 for annual
      customer_notify: 1,
      notes: { societyId: params.societyId, flatId: params.flatId },
    });
  }
}
```

### 8.3.1 Bank Account Sub-Module (`/payments/bank-accounts`)

All endpoints require an `Admin` or `Super Admin` JWT. The `societyId` is inferred from the authenticated admin's JWT claim — it cannot be overridden in the request body.

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/payments/bank-accounts` | Admin | Add a new bank account; encrypts account number; calls Razorpay Contact + Fund Account APIs; returns account with masked number |
| `GET` | `/payments/bank-accounts` | Admin | List all bank accounts for the society (masked account numbers, verification statuses) |
| `GET` | `/payments/bank-accounts/:id` | Admin | Get a single account's details (masked); includes Razorpay `fund_account_id` and validation status |
| `POST` | `/payments/bank-accounts/:id/verify` | Admin | Trigger Razorpay Reverse Penny Drop / Fund Account Validation for the specified account |
| `PATCH` | `/payments/bank-accounts/:id/set-primary` | Admin | Promote a `VERIFIED` account to `PRIMARY`; atomically demotes existing primary |
| `PATCH` | `/payments/bank-accounts/:id/deactivate` | Admin | Soft-delete an account (`status → INACTIVE`); blocked if account is `PRIMARY` |
| `POST` | `/payments/webhooks/fund-account-validation` | Public (HMAC-verified) | Razorpay webhook for `fund_account.validation.completed`; updates account status |

#### Request / Response: `POST /payments/bank-accounts`

```typescript
// Request body (DTO)
interface CreateBankAccountDto {
  accountNumber:     string; // plaintext; encrypted server-side before persist
  ifscCode:          string; // e.g. "HDFC0001234" — validated via Razorpay IFSC API
  accountHolderName: string; // society or trust name on the account
  accountType:       'SAVINGS' | 'CURRENT' | 'OVERDRAFT'; // default: CURRENT
}

// Response (account number masked)
interface BankAccountResponse {
  id:                    string;
  accountNumberMasked:   string;           // e.g. "••••••••1234"
  ifscCode:              string;
  accountHolderName:     string;
  accountType:           string;
  status:                BankAccountStatus; // PENDING_VERIFICATION
  isPrimary:             boolean;
  razorpayContactId:     string;
  razorpayFundAccountId: string;
  createdAt:             string;
}
```

#### Fund Account Validation Webhook Flow

```
Admin calls POST /payments/bank-accounts/:id/verify
       │
       ▼
admin-service calls:
  POST /v1/fund_accounts/validations          ← Razorpay API (Reverse Penny Drop)
  { fund_account_id: "fa_xxx",
    account_number: "<decrypted>",
    ifsc: "HDFC0001234",
    amount: 100,                              ← ₹1 in paise (auto-refunded to user)
    currency: "INR",
    receipt: "val_{societyId}_{timestamp}" }
       │
       ▼
Razorpay sends ₹1 payment request to society's linked UPI/bank
       │
       ▼
Razorpay fires webhook: fund_account.validation.completed
  → POST /payments/webhooks/fund-account-validation
  → HMAC-SHA256 verified (same WebhookSignatureGuard as payment webhooks)
  → Idempotency: webhookEventId checked against admin_webhook_events table
       │
  ┌────┴────────────────────────────────────────┐
  │ status = "completed" (bank confirmed live)  │ status = "failed"
  ▼                                             ▼
UPDATE society_bank_accounts                UPDATE society_bank_accounts
  SET status = 'VERIFIED',                    SET status = 'VERIFICATION_FAILED',
      verifiedAt = NOW()                          verificationFailureReason = reason
Admin push notification:                     Admin push notification:
  "Bank account verified successfully."        "Bank account verification failed: <reason>."
```

### 8.3.2 Flat Rental Sub-Module (`/flats/:flatId/rentals` and `/rentals`)

Rental endpoints live in `owner-service`. Access is gated by ownership check (`flatId` must belong to the authenticated owner) or `ADMIN` / `SUPER_ADMIN` role.

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/flats/:flatId/rentals` | Owner (own flat) / Admin | Create new tenancy; encrypts phone + PAN; updates flat status to `RENTED`; notifies Admin |
| `GET` | `/flats/:flatId/rentals` | Owner (own flat) / Admin | List all tenancies for a flat (current + historical); phone/PAN masked for Owner callers |
| `GET` | `/rentals/:id` | Owner (own flat) / Admin | Get single tenancy details; includes document metadata (no S3 URL yet) |
| `PATCH` | `/rentals/:id` | Owner (own flat) / Admin | Update tenancy fields (dates, rent amount, tenant details); triggers re-encryption if phone/PAN changed |
| `PATCH` | `/rentals/:id/end` | Owner (own flat) / Admin | End active tenancy; flat → `VACANT`; tenant profile scheduled for GDPR anonymisation |
| `POST` | `/rentals/:id/documents/upload-url` | Owner (own flat) / Admin | Request pre-signed S3 PUT URL for a document (type: `RENT_AGREEMENT` \| `PAN_CARD`); returns `{ uploadUrl, s3Key, expiresIn: 900 }` |
| `POST` | `/rentals/:id/documents/confirm` | Owner (own flat) / Admin | Confirm successful S3 upload; creates `RentalDocument` record; supersedes previous version |
| `GET` | `/rentals/:id/documents/:docId/download-url` | Owner (own flat) / Admin | Issue pre-signed S3 GET URL (1-hour expiry) for a specific document version |
| `GET` | `/rentals/:id/documents` | Owner (own flat) / Admin | List all document versions with metadata (no download URLs; call `/download-url` separately) |

#### Request / Response: `POST /flats/:flatId/rentals`

```typescript
// Request body
interface CreateRentalDto {
  tenantFullName:      string;
  tenantPhone:         string;           // plaintext; encrypted server-side
  tenantEmail?:        string;
  tenantPan:           string;           // plaintext 10-char PAN; encrypted server-side
  tenantAddress?:      string;
  emergencyContact?:   { name: string; phone: string };
  startDate:           string;           // "YYYY-MM-DD"
  agreementEndDate?:   string;           // "YYYY-MM-DD" — rent agreement expiry
  monthlyRentPaise?:   number;           // e.g. 1500000 for ₹15,000
  securityDepositPaise?: number;
}

// Response (all sensitive fields masked for Owner callers)
interface RentalResponse {
  id:                  string;
  flatId:              string;
  flatNumber:          string;
  status:              RentalStatus;     // ACTIVE
  startDate:           string;
  agreementEndDate:    string | null;
  monthlyRentPaise:    number | null;
  tenant: {
    id:                string;
    fullName:          string;
    phoneMasked:       string;           // e.g. "+91 ••••••7890"
    panMasked:         string;           // e.g. "••••••••P123"
    email:             string | null;
  };
  documents: {
    RENT_AGREEMENT:    DocumentMeta | null;
    PAN_CARD:          DocumentMeta | null;
  };
  createdAt:           string;
}
```

#### Document Upload Flow

```
Owner taps "Upload Rent Agreement"
       │
       ▼
POST /rentals/:id/documents/upload-url
  { documentType: "RENT_AGREEMENT", filename: "agreement.pdf", mimeType: "application/pdf" }
       │
       ▼
owner-service:
  1. Validates rental ownership
  2. Generates s3Key = rental-documents/{societyId}/{flatId}/{rentalId}/RENT_AGREEMENT/v{n+1}_agreement.pdf
  3. Calls S3 createPresignedPost() → uploadUrl (15-min expiry)
  Returns: { uploadUrl, fields, s3Key, expiresIn: 900 }
       │
       ▼
Client uploads file directly to S3 via HTTP PUT to uploadUrl
       │
       ▼
POST /rentals/:id/documents/confirm
  { s3Key, documentType, originalFilename, mimeType, fileSizeBytes }
       │
       ▼
owner-service:
  1. Marks previous ACTIVE version of same documentType → SUPERSEDED
  2. Creates new RentalDocument { status: ACTIVE, version: n+1, ... }
  Returns: RentalDocument metadata
```

### 8.3.3 Facility Management Sub-Module (`/facilities`)

Facility management routes are split between two services:
- **Admin operations** (create, configure, approve, reject, cancel) → `admin-service`
- **Owner operations** (browse, request booking, pay, cancel) → `owner-service`

#### Admin Facility Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/admin/facilities` | Admin | Create a new facility; store photos to S3; set pricing model |
| `GET` | `/admin/facilities` | Admin | List all facilities for the society (all statuses) |
| `GET` | `/admin/facilities/:id` | Admin | Get full facility details including blackouts |
| `PATCH` | `/admin/facilities/:id` | Admin | Update facility details, pricing, or advance booking window |
| `PATCH` | `/admin/facilities/:id/status` | Admin | Set status to `ACTIVE`, `INACTIVE`, or `UNDER_MAINTENANCE` |
| `POST` | `/admin/facilities/:id/blackouts` | Admin | Add a blackout period |
| `DELETE` | `/admin/facilities/:id/blackouts/:blackoutId` | Admin | Remove a blackout period |
| `POST` | `/admin/facilities/:id/photos/upload-url` | Admin | Pre-signed S3 PUT URL for a facility photo |
| `POST` | `/admin/facilities/:id/photos/confirm` | Admin | Confirm photo upload; appends S3 key to `photoS3Keys` |
| `GET` | `/admin/bookings` | Admin | List all facility bookings; filter by facility, date range, status |
| `GET` | `/admin/bookings/:bookingId` | Admin | Get booking detail |
| `PATCH` | `/admin/bookings/:bookingId/approve` | Admin | Approve booking; creates Razorpay order; notifies owner |
| `PATCH` | `/admin/bookings/:bookingId/reject` | Admin | Reject booking with reason; notifies owner |
| `PATCH` | `/admin/bookings/:bookingId/cancel` | Admin | Admin-initiated cancel; triggers full refund regardless of policy |

#### Owner Facility Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/facilities` | Owner | Browse `ACTIVE` facilities; includes availability calendar for next `maxAdvanceDays` days |
| `GET` | `/facilities/:id` | Owner | Facility details with photo pre-signed URLs and pricing summary |
| `POST` | `/facilities/:id/bookings` | Owner | Submit booking request (`PENDING_APPROVAL`); validates blackout + advance window |
| `GET` | `/bookings` | Owner | List all own bookings (current + historical) |
| `GET` | `/bookings/:bookingId` | Owner | Booking detail including quoted amount and payment status |
| `POST` | `/bookings/:bookingId/pay` | Owner | Create Razorpay checkout session for an `APPROVED` booking; returns `orderId` |
| `POST` | `/bookings/:bookingId/cancel` | Owner | Cancel a `PENDING_APPROVAL` or `CONFIRMED` booking; triggers refund per policy |

#### Booking State Machine

```
Owner submits request
        │
        ▼
  PENDING_APPROVAL ──[Admin rejects]──────────────► REJECTED
        │                                            (owner notified)
        │[Admin approves]
        │  → Razorpay order created
        │  → paymentDeadline set
        ▼
    APPROVED ──[payment deadline passed]──────────► CANCELLED (PAYMENT_TIMEOUT)
        │                                            (BullMQ job)
        │[Owner pays → payment.captured webhook]
        ▼
   CONFIRMED ──[Owner cancels]──────────────────── CANCELLED (partial/full refund)
        │     [Admin cancels]──────────────────────CANCELLED (full refund)
        │     [autoReject job: PENDING too long]────CANCELLED (not yet APPROVED)
        ▼
    (Slot elapses — booking archived; no status change)
```

---

### 8.3.4 Vendor Management Sub-Module (`/vendors`)

#### Admin Vendor Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/admin/vendors` | Admin | Register a new vendor; phone encrypted server-side |
| `GET` | `/admin/vendors` | Admin | List all vendors (all statuses); filter by `serviceCategory`, `status` |
| `GET` | `/admin/vendors/:id` | Admin | Full vendor detail including document metadata |
| `PATCH` | `/admin/vendors/:id` | Admin | Update vendor details |
| `PATCH` | `/admin/vendors/:id/status` | Admin | Set status to `ACTIVE`, `INACTIVE`, or `DELETED` |
| `POST` | `/admin/vendors/:id/documents/upload-url` | Admin | Pre-signed S3 PUT URL for a vendor document |
| `POST` | `/admin/vendors/:id/documents/confirm` | Admin | Confirm document upload; creates `VendorDocument` record |
| `GET` | `/admin/vendors/:id/documents/:docId/download-url` | Admin | Pre-signed S3 GET URL (1-hour expiry) |
| `GET` | `/admin/vendors/:id/phone` | Admin | Return decrypted full phone; logged in `AdminAuditLog` |

#### Owner Vendor Endpoints (Directory)

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/vendors` | Owner | Browse `ACTIVE` vendors; filter by `serviceCategory`; phone masked |
| `GET` | `/vendors/:id` | Owner | Vendor detail (masked phone, no documents) |
| `POST` | `/vendors/:id/reveal-phone` | Owner | Decrypt + return full phone for 5 min; logged in `VendorPhoneRevealLog` |

---

### 8.3.5 Event Management Sub-Module (`/events`)

Event routes are served by **`owner-service`** for owner-facing operations, and **`admin-service`** for moderation and pinning.

#### Owner / Admin Event Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/events` | Owner \| Admin | Create an event; status defaults to `DRAFT`; `societyId` from JWT |
| `PATCH` | `/events/:id/publish` | Owner (own event) \| Admin | Transition `DRAFT → UPCOMING`; notifies all society owners |
| `GET` | `/events` | Owner \| Admin | Society event feed (ordered per EVT-008 rules); cursor-based pagination |
| `GET` | `/events/:id` | Owner \| Admin | Full event detail including RSVP count, media metadata, facility link |
| `PATCH` | `/events/:id` | Owner (own event) \| Admin | Update title, description, dates, venue, maxParticipants, eventType |
| `PATCH` | `/events/:id/cancel` | Owner (own event) \| Admin | Cancel event; notifies all RSVPed owners; `{ reason }` in body |
| `PATCH` | `/events/:id/complete` | Owner (own event) \| Admin | Manually mark as `COMPLETED` |
| `PATCH` | `/events/:id/pin` | Admin only | Pin event to top of feed; atomically unpins previous |
| `PATCH` | `/events/:id/remove` | Admin only | Remove event from feed (moderation); `{ reason }` stored |

#### RSVP Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/events/:id/rsvp` | Owner | RSVP to event; fails with `409` if full; fails if already RSVPed |
| `DELETE` | `/events/:id/rsvp` | Owner | Cancel own RSVP; only allowed before `startDatetime` |
| `GET` | `/events/:id/rsvps` | Owner (own event) \| Admin | List RSVPs; owners only see count; admins see full owner list |

#### Media Upload Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/events/:id/media/upload-url` | Owner (own event) \| Admin | Request pre-signed S3 PUT URL; validates file type, size, and per-event count limits |
| `POST` | `/events/:id/media/confirm` | Owner (own event) \| Admin | Confirm S3 upload; creates `EventMedia` record; enqueues thumbnail-generation BullMQ job |
| `GET` | `/events/:id/media` | Owner \| Admin | List all `ACTIVE` media items with thumbnail pre-signed URLs (1-hour expiry) |
| `GET` | `/events/:id/media/:mediaId/download-url` | Owner \| Admin | Full-resolution pre-signed S3 GET URL (1-hour expiry) |
| `DELETE` | `/events/:id/media/:mediaId` | Owner (own upload) \| Admin | Organiser soft-delete or Admin removal; body `{ reason }` required for Admin |

#### Event Feed & Status Lifecycle

```
Owner publishes event
       │
       ▼
   UPCOMING ──[BullMQ job: startDatetime reached]──────────► ONGOING
       │                                                         │
       │[Owner/Admin cancels]                                    │[BullMQ job: endDatetime passed]
       ▼                                                         ▼
  CANCELLED                                                 COMPLETED
  (all RSVPed owners notified)                    (media upload open for 7 more days)
       │
       │[Admin moderation at any status]
       ▼
   REMOVED (hidden from feed; retained in DB)
```

---

### 8.3.6 Common Image Media Service (`/media`)

The `media-service` is a **standalone NestJS microservice** exposed through the API Gateway at the `/media` prefix. It is the sole service authorised to read original S3 objects and write transform variants. All other services call it via internal REST for image metadata; they never access the S3 bucket directly.

#### Upload Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/media/images/upload-url` | Any authenticated user | Request a pre-signed S3 PUT URL; returns `{ imageId, uploadUrl, fields, expiresIn: 900 }`; validates `mimeType` and `fileSizeBytes` before issuing URL |
| `POST` | `/media/images/confirm` | Any authenticated user | Confirm upload completed; `media-service` reads image via Sharp to extract dimensions and format; creates `MediaAsset` record; returns full `MediaAssetDto` |
| `DELETE` | `/media/images/:imageId` | Uploader (own) \| Admin | Soft-delete asset; triggers CloudFront invalidation for `imageId`; S3 objects purged after 30-day lifecycle |
| `GET` | `/media/images/:imageId/meta` | Any authenticated user | Return asset metadata (dimensions, format, `contextType`, `contextId`, upload timestamp) without serving image bytes |

#### Image Transform (Serve) Endpoint

```
GET /media/images/:imageId
```

All parameters are query string; all are optional:

| Parameter | Type | Default | Constraints | Description |
|---|---|---|---|---|
| `size` | `string` | — | `thumbnail` \| `small` \| `medium` \| `large` \| `xlarge` \| `original` | Named preset (overridden by explicit `width`/`height`) |
| `width` | `integer` | — | 1–4000 | Output width in pixels; aspect ratio preserved unless `crop=true` |
| `height` | `integer` | — | 1–4000 | Output height in pixels; aspect ratio preserved unless `crop=true` |
| `quality` | `integer` | `80` | 1–100 | Compression quality for JPEG/WEBP; ignored for PNG (always lossless) |
| `format` | `string` | `webp` | `webp` \| `jpeg` \| `png` \| `avif` | Output image format |
| `crop` | `boolean` | `false` | — | Centre-crop to exact `width × height`; requires both dimensions |
| `blur` | `integer` | — | 1–100 | Gaussian blur sigma; useful for low-quality image placeholder (LQIP) |

**Preset size map:**

| `size` value | Bounding box (W × H) | Typical use |
|---|---|---|
| `thumbnail` | 120 × 120 px | Gallery grid cell, list row avatar |
| `small` | 320 × 240 px | Feed card on mobile |
| `medium` | 640 × 480 px | Feed card on tablet/web |
| `large` | 1280 × 960 px | Full-screen modal on mobile |
| `xlarge` | 1920 × 1440 px | Desktop hero / detail view |
| `original` | No resize | Full resolution download |

**Example URLs:**

```
# Feed card thumbnail in WebP (default)
GET /media/images/3f2a8c1d-e7b4-4f9a-b2d6-1a0c5e8f3b7d?size=small

# Exact 300×300 crop for a square avatar
GET /media/images/3f2a8c1d?width=300&height=300&crop=true&quality=85

# LQIP placeholder (2 KB blurred preview for progressive loading)
GET /media/images/3f2a8c1d?width=40&height=30&blur=10&quality=30&format=webp

# JPEG fallback for clients without WebP support
GET /media/images/3f2a8c1d?size=large&format=jpeg&quality=75
```

#### Transform & CDN Flow

```
Client (Mobile / Web)
        │
        │  GET /media/images/:imageId?size=small&format=webp
        ▼
  AWS CloudFront (CDN)
        │
        ├──[Cache HIT]──────────────────────────────────────────► Response (≤ 10 ms)
        │                                                          Cache-Control: public, max-age=604800
        │
        └──[Cache MISS]
                │
                ▼
        API Gateway → media-service
                │
                ├── 1. Look up MediaAsset by imageId (DB / Redis cache)
                │       └── 404 if not found or status = DELETED
                │
                ├── 2. Compute paramsHash = SHA-256(canonical sorted query)
                │
                ├── 3. Check variants[paramsHash] in MediaAsset record
                │       ├──[Variant exists in S3]──► stream from S3 → CloudFront → Client
                │       │
                │       └──[Variant not cached]
                │               │
                │               ├── 4. Fetch original from S3 (originals/…)
                │               ├── 5. Apply Sharp transform (resize → format → quality → blur)
                │               ├── 6. Upload variant to S3 (variants/…)
                │               ├── 7. Update MediaAsset.variants JSONB
                │               └── 8. Stream result → CloudFront → Client
                │
                └── Response headers:
                    Content-Type: image/webp (or requested format)
                    Cache-Control: public, max-age=604800, stale-while-revalidate=86400
                    X-Image-Id: 3f2a8c1d-…
                    X-Variant-Cache: HIT | MISS
```

#### Admin Cache Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/media/images/:imageId/invalidate` | Admin \| Super Admin | Purge all CloudFront cached paths for this image (`/media/images/{imageId}*`); also clears `variants` JSONB in DB |
| `GET` | `/media/admin/stats` | Super Admin | Returns aggregate storage stats: total `MediaAsset` count, total original size (GB), total variant size (GB), cache hit rate (from CloudFront metrics) |

---

### 8.4 Common Module (`/common`)

| Method | Path | Description |
|---|---|---|
| `GET` | `/common/health` | Liveness probe (all services) |
| `GET` | `/common/health/ready` | Readiness probe |
| `GET` | `/common/feature-flags` | Return active flags for caller's society |
| `GET` | `/common/societies/:code` | Public society info (for onboarding deep links) |
| `POST` | `/common/notifications/push` | Internal: enqueue push notification |
| `GET` | `/common/announcements` | Owner: list announcements for society |

### 8.5 Request Routing Logic

```
Incoming request: POST /owner/maintenance-requests
        │
        ├── 1. TLS termination (nginx / ALB)
        ├── 2. Rate limit check (Redis-backed)
        ├── 3. JWT validation (RS256 public key)
        ├── 4. Role extraction from token payload
        ├── 5. Society scope validation (societyId from token vs URL param)
        ├── 6. Route to microservice:
        │       /owner/*        → owner-service:3001
        │       /admin/*        → admin-service:3002
        │       /super-admin/*  → super-admin-service:3003
        │       /auth/*         → gateway auth module (internal)
        │       /payments/*     → gateway payments module (internal → payment provider)
        │       /common/*       → gateway common module (internal)
        └── 7. Response pass-through with correlation ID header
```

### 8.6 Inter-Service Communication

- **Synchronous:** REST over internal Kubernetes ClusterIP (or gRPC for high-frequency calls like OTP validation).
- **Asynchronous:** **BullMQ** (Redis-backed) for notifications, invoice generation, email dispatch, GDPR erasure jobs, and PDF audit report generation.
- **Event Bus:** All domain events (visitor entry, payment success, maintenance status change) published to BullMQ queues; consuming services subscribe to relevant queues.

#### BullMQ Queue Reference (Audit & PDF Jobs)

| Queue Name | Producer | Consumer | Trigger | Description |
|---|---|---|---|---|
| `audit-report:generate` | `admin-service` / Cron scheduler | `admin-service` (PDF worker) | On-demand or April 1 cron | Builds the Society-Level Annual Audit PDF using Puppeteer; uploads to S3; updates `audit_reports.status` |
| `audit-report:owner-statement` | `owner-service` | `owner-service` (PDF worker) | Owner API request | Builds the Owner Annual Payment Statement PDF; uploads to S3 |
| `audit-report:notify` | `admin-service` | `admin-service` (notification worker) | On publish | Sends push + in-app notification to all society owners with a link to the published report |
| `payment:receipt` | `api-gateway` (webhook handler) | `owner-service` | `payment.captured` webhook | Generates per-transaction receipt PDF; uploads to S3; updates `payments.receiptS3Key` |

All jobs are configured with:
- **Retry policy:** 3 attempts with exponential back-off (30 s, 2 min, 10 min).
- **Job TTL:** completed jobs retained in Redis for 24 h for status polling; failed jobs retained for 7 days for debugging.
- **Concurrency:** PDF generation workers capped at **2 concurrent jobs per service instance** to control Puppeteer memory usage.

---

## 9. Security & GDPR Compliance

### 9.1 Security Architecture

| Layer | Control |
|---|---|
| Transport | TLS 1.3 enforced; HSTS headers; certificate pinning in mobile apps |
| Authentication | Phone OTP (primary); TOTP 2FA (Super Admin); JWT RS256 |
| Authorisation | RBAC via `RolesGuard`; society-scope enforcement at gateway |
| Data at rest | Phone fields: AES-256-GCM; database volume: AES-256 (cloud provider) |
| Secrets | AWS KMS / HashiCorp Vault; no secrets in source code or env files in prod |
| Logging | PII fields (phone, name, address) redacted from all application logs |
| Dependency scanning | Snyk + `npm audit` in CI pipeline |
| SAST | SonarQube on every PR |
| Penetration testing | Annual third-party pentest + quarterly DAST scans |

### 9.2 GDPR Compliance Measures

| Requirement | Implementation |
|---|---|
| **Lawful basis** | Legitimate interest for security logging; consent for photos and marketing |
| **Data minimisation** | Visitor phone collected only when owner approval flow requires it |
| **Right of access** | Owner can download all data linked to their account (JSON export) |
| **Right to erasure** | GDPR erasure job: anonymises name, nullifies encrypted phone, deletes photo; `deleted_at` set; referential integrity preserved via UUID |
| **Right to portability** | Structured JSON export with decrypted fields; requires dual-admin approval for visitor logs |
| **Consent records** | Photo consent stored per visitor log entry; consent withdrawal disables retroactive photo display |
| **Data retention** | Visitor logs retained 90 days (configurable per society/region); financial records retained 7 years (legal obligation) |
| **Breach notification** | Incident response runbook; DPA notification within 72 h of discovery |
| **Privacy by design** | Phone number never logged; analytics pipeline receives only anonymised IDs |

### 9.3 Phone Number Encryption — Implementation Detail

```typescript
// backend/api-gateway/common/crypto/phone-crypto.service.ts
import { createCipheriv, createDecipheriv, randomBytes, createHmac } from 'crypto';

@Injectable()
export class PhoneCryptoService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly ivLength = 12; // 96-bit IV for GCM
  private readonly authTagLength = 16;

  constructor(private readonly kmsService: KmsService) {}

  /** Normalise → HMAC; used for DB lookup */
  async hashPhone(rawPhone: string): Promise<string> {
    const normalised = this.normaliseE164(rawPhone);
    const hmacKey = await this.kmsService.getHmacKey();
    return createHmac('sha256', hmacKey).update(normalised).digest('hex');
  }

  /** Normalise → Encrypt; stored in DB */
  async encryptPhone(rawPhone: string): Promise<Buffer> {
    const normalised = this.normaliseE164(rawPhone);
    const dek = await this.kmsService.getDek();
    const iv = randomBytes(this.ivLength);
    const cipher = createCipheriv(this.algorithm, dek, iv, { authTagLength: this.authTagLength });
    const encrypted = Buffer.concat([cipher.update(normalised, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();
    // Layout: [IV (12 bytes)] [AuthTag (16 bytes)] [Ciphertext]
    return Buffer.concat([iv, authTag, encrypted]);
  }

  /** Decrypt for display/export only */
  async decryptPhone(cipherBuffer: Buffer): Promise<string> {
    const dek = await this.kmsService.getDek();
    const iv = cipherBuffer.subarray(0, this.ivLength);
    const authTag = cipherBuffer.subarray(this.ivLength, this.ivLength + this.authTagLength);
    const ciphertext = cipherBuffer.subarray(this.ivLength + this.authTagLength);
    const decipher = createDecipheriv(this.algorithm, dek, iv, { authTagLength: this.authTagLength });
    decipher.setAuthTag(authTag);
    return decipher.update(ciphertext) + decipher.final('utf8');
  }

  private normaliseE164(phone: string): string {
    // Strip spaces, dashes, parentheses; ensure leading '+'
    const digits = phone.replace(/\D/g, '');
    return `+${digits}`;
  }
}
```

---

## 10. Technical Architecture

### 10.1 Technology Stack

| Layer | Technology | Version (minimum) |
|---|---|---|
| Mobile App | React Native (Expo) | 0.74 |
| Web Dashboard | Next.js + React | Next.js 15.x, React 19.2.0 |
| **Mobile Styling** | **NativeWind** (Tailwind CSS for React Native) | **4.x** |
| **Web Styling** | **Tailwind CSS** | **3.4** |
| **Web UI Library** | **Oat UI (`@knadh/oat`)** | **0.5.x** |
| State Management | Zustand (mobile) / TanStack Query (web) | — |
| **Node.js Runtime** | **Node.js** (minimum LTS for all backend services) | **22.x** |
| Backend Framework | NestJS | 10.x |
| ORM | TypeORM | 0.3.x |
| Database | PostgreSQL | 16 |
| Cache / Queue | Redis (via Upstash in dev) | 7.x |
| Job Queue | BullMQ | 5.x |
| **PDF Generation** | **Puppeteer** (headless Chromium, HTML→PDF) | **22.x** |
| **Admin Panel** | **AdminJS** (`adminjs`) — auto-generated React admin UI | **7.x** |
| **AdminJS NestJS** | `@adminjs/nestjs` — NestJS module adapter | **7.x** |
| **AdminJS TypeORM** | `@adminjs/typeorm` — TypeORM resource adapter | **7.x** |
| Monorepo | Lerna + Nx (optional plugins) | Lerna 8.x |
| Container Runtime | Docker | 25.x |
| Orchestration | Kubernetes (EKS / GKE) | 1.30+ |
| CI/CD | GitHub Actions | — |
| Secret Management | AWS KMS + Parameter Store | — |
| Object Storage | AWS S3 (photos, PDF invoices) | — |
| **Image Processing** | **Sharp** (Node.js libvips binding) — on-demand resize, quality, format conversion | **0.33.x** |
| **CDN / Image Delivery** | **AWS CloudFront** — caches transformed image variants at edge; fronts the `society-media-assets` S3 bucket | — |
| **Media Service** | Dedicated NestJS microservice (`media-service`) — handles upload, unique ID generation, on-demand transform, and variant caching for all image assets across the platform | — |
| Push Notifications | Firebase Cloud Messaging (FCM) | — |
| Monitoring | OpenTelemetry → Grafana / Loki / Tempo | — |

### 10.2 Cross-Platform App Architecture

Each of the three applications (Owner, Admin, Super Admin) is structured as two separate platform packages that share a common business logic layer:

```
┌──────────────────────────────────────────────────────────────────────┐
│                     Shared Packages (packages/)                       │
│  shared-types · shared-validators · shared-i18n · shared-ui-tokens   │
│  shared-ui-components  (web-focused Oat UI wrappers)                 │
└───────────────────────┬──────────────────────────┬───────────────────┘
                        │                          │
          ┌─────────────▼──────────┐  ┌────────────▼──────────────┐
          │   Mobile (React Native) │  │   Web (Next.js + React)   │
          │                        │  │                           │
          │  Styling: NativeWind   │  │  Styling: Tailwind CSS    │
          │  (Tailwind in RN via   │  │  UI Library: Oat UI       │
          │   CSS-in-JS transforms)│  │  (@knadh/oat CSS import)  │
          │                        │  │                           │
          │  Shared Tailwind config│  │  Shared Tailwind config   │
          │  ← tailwind.config.ts  │  │  ← tailwind.config.ts    │
          │  from shared-ui-tokens │  │  from shared-ui-tokens    │
          └────────────────────────┘  └───────────────────────────┘
```

- **Shared business logic** (`packages/shared-*`) contains API client hooks, validation schemas (Zod), and i18n strings — consumed identically on both platforms.
- **Shared Tailwind config** (`packages/shared-ui-tokens/tailwind.config.ts`) defines the single source of truth for the design token system: colours, spacing scale, typography, border-radius, and shadows. Both NativeWind (mobile) and Tailwind CSS (web) extend this config.
- **Platform-specific UI layer**: each platform uses the appropriate toolchain (see Section 10.3) rather than a single cross-platform component library, given the fundamental differences between browser DOM and React Native's layout engine.

### 10.3 Design System & Styling Architecture

#### 10.3.1 Web Applications — Tailwind CSS + Oat UI

All three **web dashboards** (Next.js + React) adopt a two-layer styling approach:

| Layer | Tool | Role |
|---|---|---|
| **Base component aesthetics** | **Oat UI (`@knadh/oat`)** | Styles semantic HTML elements (`<button>`, `<input>`, `<dialog>`, `<table>`, `<details>`, etc.) automatically via a single CSS import — no class annotations required |
| **Utility & layout styling** | **Tailwind CSS** | Handles spacing, responsive layout, custom colours, flex/grid, and any overrides beyond Oat UI's defaults |

**Installation per web app:**

```bash
# In each web package (e.g. applications/owner-app/web)
yarn workspace @society/owner-app-web add @knadh/oat
yarn workspace @society/owner-app-web add -D postcss-import
```

**PostCSS configuration (`postcss.config.js`):**

`postcss-import` **must be listed first** so that `@import` statements in `globals.css` are inlined before Tailwind's plugin runs. Without this, Tailwind v3 throws `CssSyntaxError: @layer base is used but no matching @tailwind base` when it encounters Oat UI's `@layer base` declarations in isolation.

```js
module.exports = {
  plugins: {
    'postcss-import': {},   // ← inlines @import before Tailwind processes @layer
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

**Single CSS entry-point (`src/app/globals.css`):**

```css
/* Oat UI base styles — inlined here by postcss-import before Tailwind runs */
@import '@knadh/oat/oat.min.css';

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --color-accent:   #2563eb;   /* primary-600 from shared-ui-tokens */
    --border-radius:  0.25rem;
    --font-family:    'Inter', system-ui, sans-serif;
  }
}
```

**Root layout (`src/app/layout.tsx`)** imports only `globals.css` — no separate Oat UI import needed:

```typescript
import './globals.css'; // Oat UI + Tailwind + token overrides — all in one entry-point

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Society — Owner Portal',
  description: 'Manage your flat, pay maintenance, log visitors.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

**Why this layering works:** `postcss-import` merges `oat.min.css` into the same PostCSS document as `globals.css` before any other plugin runs. Tailwind then sees its own `@tailwind base` directive before Oat UI's `@layer base` declarations, resolving the `@layer` ordering requirement. Oat UI styles bare semantic elements (`button`, `input`, `dialog`, `article`, `mark`, `progress`, etc.) which React renders as standard HTML. Tailwind utility classes win the cascade for any property they specify; no class conflicts arise because Oat UI does not use class-based selectors.

**Oat UI components available for web:**

| Component | HTML Element / Attribute | Usage Example in JSX |
|---|---|---|
| Button | `<button>` | `<button>Submit</button>` |
| Card | `<article>` | `<article className="p-4">…</article>` |
| Alert | `<div role="alert">` | `<div role="alert">…</div>` |
| Badge | `<mark>` | `<mark>New</mark>` |
| Dialog / Modal | `<dialog>` | `<dialog open>…</dialog>` |
| Form inputs | `<input>`, `<select>`, `<textarea>` | Native elements styled automatically |
| Table | `<table>` | Native `<table>` rendered with Oat UI styles |
| Tabs | `<oat-tabs>` WebComponent | `<oat-tabs>…</oat-tabs>` |
| Dropdown | `<oat-dropdown>` WebComponent | `<oat-dropdown>…</oat-dropdown>` |
| Progress | `<progress>` | `<progress value={70} max={100} />` |
| Spinner | `<span data-spinner>` | `<span data-spinner />` |
| Accordion | `<details>` / `<summary>` | `<details><summary>Title</summary>…</details>` |

> ⚠️ **Compatibility note:** Oat UI is currently **pre-v1 (`@knadh/oat` v0.5.x)** and may have breaking changes before its stable release. Pin the exact version in each web app's `package.json` and validate upgrades in a staging environment before promoting to production.

#### 10.3.2 Mobile Applications — NativeWind

All three **React Native (Expo) mobile apps** use **NativeWind v4** to bring Tailwind CSS utility classes into the React Native environment.

**How NativeWind works:** NativeWind's Babel/Metro plugin transforms Tailwind class strings at build time into React Native `StyleSheet` objects. There is no browser DOM or CSS file at runtime — the Tailwind config is the sole source of styling truth.

**Installation per mobile app:**

```bash
# In each mobile package (e.g. applications/owner-app/mobile)
npm install nativewind
npm install -D tailwindcss
```

**Configuration (`tailwind.config.ts`):**

```typescript
// applications/owner-app/mobile/tailwind.config.ts
import sharedConfig from '../../../packages/shared-ui-tokens/tailwind.config';
import type { Config } from 'tailwindcss';

const config: Config = {
  // Extend the shared token config — single source of truth for colours & spacing
  presets: [sharedConfig],
  content: ['./src/**/*.{ts,tsx}'],
  // Mobile-specific overrides (if any) go here
};

export default config;
```

**Usage in components:**

```typescript
// applications/owner-app/mobile/src/components/VisitorCard.tsx
import { View, Text, Pressable } from 'react-native';

export function VisitorCard({ name, time }: { name: string; time: string }) {
  return (
    <View className="bg-white rounded-2xl p-4 shadow-sm mb-3">
      <Text className="text-base font-semibold text-slate-800">{name}</Text>
      <Text className="text-sm text-slate-500 mt-1">{time}</Text>
      <Pressable className="mt-3 bg-primary-600 rounded-lg py-2 items-center active:opacity-80">
        <Text className="text-white font-medium text-sm">Approve Entry</Text>
      </Pressable>
    </View>
  );
}
```

> **Platform compatibility note:** Oat UI's CSS and WebComponents **cannot** be used in React Native because React Native does not render browser DOM elements or process CSS files. The design consistency between mobile and web is achieved entirely through the **shared Tailwind config** in `packages/shared-ui-tokens/`, which ensures both platforms use identical colour palettes, spacing scales, and typography scales.

#### 10.3.3 Shared Tailwind Configuration — The Design Token Bridge

`packages/shared-ui-tokens/tailwind.config.ts` is the **canonical design token file** consumed by all six application packages. It defines:

```typescript
// packages/shared-ui-tokens/tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [],
  theme: {
    extend: {
      colors: {
        // Mapped from Oat UI's CSS custom properties for web/mobile parity
        primary:   { 50:'#eff6ff', 100:'#dbeafe', 600:'#2563eb', 700:'#1d4ed8', 900:'#1e3a8a' },
        success:   { 50:'#f0fdf4', 500:'#22c55e', 700:'#15803d' },
        warning:   { 50:'#fffbeb', 500:'#f59e0b', 700:'#b45309' },
        danger:    { 50:'#fef2f2', 500:'#ef4444', 700:'#b91c1c' },
        neutral:   { 50:'#f8fafc', 100:'#f1f5f9', 500:'#64748b', 800:'#1e293b', 900:'#0f172a' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.5rem',
      },
      spacing: {
        // 4-point grid — consistent across web and mobile
        '18': '4.5rem',
        '22': '5.5rem',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
      },
    },
  },
};

export default config;
```

Oat UI's own CSS custom properties (`--color-accent`, `--border-radius`, etc.) are overridden in each web app's `index.css` to match the values defined above, ensuring the Oat UI base styles and Tailwind utilities render with an identical visual language.

```css
/* applications/owner-app/web/src/app/globals.css */
/* postcss-import inlines this @import before Tailwind processes @layer directives */
@import '@knadh/oat/oat.min.css';

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Override Oat UI CSS variables to match shared design tokens */
    --color-accent:   #2563eb;   /* theme('colors.primary.600') */
    --border-radius:  0.25rem;   /* theme('borderRadius.DEFAULT') */
    --font-family:    'Inter', system-ui, sans-serif;
  }
}
```

---

## 11. Monorepo & Folder Structure

### 11.1 Repository Layout

```
alankapuri-my-society/                  ← git root
│
├── lerna.json                          ← Lerna config (version: independent)
├── package.json                        ← Root workspace config (npm workspaces)
├── nx.json                             ← Nx task-runner caching (build · test · lint · type-check)
├── tsconfig.base.json                  ← ★ Shared strict TS compiler options
├── jsconfig.json                       ← IDE support for root-level JS files
├── eslint.config.mjs                   ← ★ ESLint 9 flat config (TS · React · RN · NestJS · Prettier)
├── .prettierrc.json                    ← Prettier rules (singleQuote · no semi · 100-col · lf)
├── sonar-project.properties            ← SonarCloud SAST configuration
├── .github/
│   └── workflows/
│       ├── ci.yml                      ← CI pipeline (lint → type-check → test → SonarCloud → Snyk)
│       └── deploy.yml                  ← Deploy on merge to main (CD — planned)
│
├── applications/
│   ├── owner-app/
│   │   ├── mobile/                     ← React Native (Expo) + NativeWind
│   │   │   ├── src/
│   │   │   │   ├── screens/
│   │   │   │   ├── navigation/
│   │   │   │   ├── components/
│   │   │   │   └── hooks/
│   │   │   ├── tailwind.config.ts      ← extends packages/shared-ui-tokens
│   │   │   ├── babel.config.js         ← NativeWind Babel plugin
│   │   │   └── package.json
│   │   └── web/                        ← Next.js + React + Tailwind CSS + Oat UI
│   │       ├── src/
│   │       │   ├── app/                ← Next.js App Router root
│   │       │   │   ├── layout.tsx      ← Root layout: single import of globals.css
│   │       │   │   ├── page.tsx        ← Landing page — renders <ClickCounter /> from shared-ui-components
│   │       │   │   └── globals.css     ← @import oat.min.css · @tailwind · Oat UI token overrides
│   │       │   └── types/
│   │       │       └── global.d.ts     ← declare module '*.css' (CSS side-effect type support)
│   │       ├── tailwind.config.ts      ← extends packages/shared-ui-tokens
│   │       ├── next.config.ts          ← createNextConfig(__dirname) from @society/shared-nextjs-config
│   │       ├── postcss.config.js       ← postcss-import (first) · tailwindcss · autoprefixer
│   │       └── package.json
│   │
│   ├── admin-app/
│   │   ├── mobile/                     ← React Native (Expo) + NativeWind
│   │   │   ├── tailwind.config.ts      ← extends packages/shared-ui-tokens
│   │   │   ├── babel.config.js
│   │   │   └── package.json
│   │   └── web/                        ← Next.js + React + Tailwind CSS + Oat UI
│   │       ├── tailwind.config.ts      ← extends packages/shared-ui-tokens
│   │       ├── next.config.ts          ← Next.js configuration
│   │       ├── postcss.config.js
│   │       └── package.json
│   │
│   └── super-admin-app/
│       ├── mobile/                     ← React Native (Expo) + NativeWind
│       │   ├── tailwind.config.ts      ← extends packages/shared-ui-tokens
│       │   ├── babel.config.js
│       │   └── package.json
│       └── web/                        ← Next.js + React + Tailwind CSS + Oat UI
│           ├── tailwind.config.ts      ← extends packages/shared-ui-tokens
│           ├── next.config.ts          ← Next.js configuration
│           ├── postcss.config.js
│           └── package.json
│
├── backend/
│   ├── owner-service/                  ← NestJS; handles owner-facing APIs
│   │   ├── src/
│   │   │   ├── flats/
│   │   │   ├── maintenance/
│   │   │   ├── visitor-logs/
│   │   │   ├── notifications/
│   │   │   ├── rentals/                ← Flat rental & tenant management
│   │   │   │   ├── rentals.module.ts
│   │   │   │   ├── rentals.controller.ts
│   │   │   │   ├── rentals.service.ts
│   │   │   │   ├── entities/
│   │   │   │   │   ├── tenant-profile.entity.ts
│   │   │   │   │   ├── flat-rental.entity.ts
│   │   │   │   │   └── rental-document.entity.ts
│   │   │   │   ├── dto/
│   │   │   │   │   ├── create-rental.dto.ts         ← Validates + strips PAN/phone before encrypt
│   │   │   │   │   └── confirm-document.dto.ts
│   │   │   │   ├── s3/
│   │   │   │   │   └── rental-s3.service.ts         ← Pre-signed PUT/GET URL generation
│   │   │   │   └── processors/
│   │   │   │       └── gdpr-anonymise.processor.ts  ← BullMQ: anonymise tenants after 90 days
│   │   │   ├── facilities/             ← Owner facility browsing & booking
│   │   │   │   ├── facilities.module.ts
│   │   │   │   ├── facilities.controller.ts  ← Browse, request booking, pay, cancel
│   │   │   │   ├── facilities.service.ts
│   │   │   │   ├── dto/
│   │   │   │   │   └── create-booking.dto.ts
│   │   │   │   └── processors/
│   │   │   │       └── payment-timeout.processor.ts ← BullMQ: cancel APPROVED bookings on deadline
│   │   │   ├── vendors/                ← Owner vendor directory
│   │   │   │   ├── vendors.module.ts
│   │   │   │   ├── vendors.controller.ts  ← Browse directory, reveal-phone
│   │   │   │   ├── vendors.service.ts
│   │   │   │   └── entities/
│   │   │   │       └── vendor-phone-reveal-log.entity.ts
│   │   │   ├── events/                 ← Society events: create, RSVP, media upload
│   │   │   │   ├── events.module.ts
│   │   │   │   ├── events.controller.ts  ← CRUD, publish, cancel, complete, RSVP, media
│   │   │   │   ├── events.service.ts
│   │   │   │   ├── entities/
│   │   │   │   │   ├── society-event.entity.ts
│   │   │   │   │   ├── event-rsvp.entity.ts
│   │   │   │   │   └── event-media.entity.ts
│   │   │   │   ├── dto/
│   │   │   │   │   ├── create-event.dto.ts
│   │   │   │   │   ├── update-event.dto.ts
│   │   │   │   │   └── confirm-media.dto.ts
│   │   │   │   ├── s3/
│   │   │   │   │   └── event-media-s3.service.ts  ← Pre-signed PUT/GET, key builder
│   │   │   │   └── processors/
│   │   │   │       ├── thumbnail.processor.ts     ← BullMQ: Sharp (photo) / FFmpeg (video)
│   │   │   │       ├── event-status.processor.ts  ← BullMQ: UPCOMING→ONGOING→COMPLETED
│   │   │   │       └── event-notify.processor.ts  ← BullMQ: publish notify, cancel notify, reminder
│   │   │   ├── reports/                ← Owner annual statement PDF generation
│   │   │   │   ├── reports.module.ts
│   │   │   │   ├── reports.controller.ts
│   │   │   │   ├── reports.service.ts
│   │   │   │   ├── pdf/
│   │   │   │   │   ├── owner-statement.template.html ← Puppeteer HTML template
│   │   │   │   │   └── pdf.service.ts               ← Puppeteer launch + render
│   │   │   │   └── processors/
│   │   │   │       └── owner-statement.processor.ts ← BullMQ worker
│   │   │   └── main.ts
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── admin-service/                  ← NestJS; handles admin-facing APIs
│   │   ├── src/
│   │   │   ├── societies/
│   │   │   ├── flats/
│   │   │   ├── maintenance/
│   │   │   ├── visitor-logs/
│   │   │   ├── staff/
│   │   │   ├── announcements/
│   │   │   ├── rentals/                ← Admin view of tenancies (read + decrypt endpoint)
│   │   │   │   ├── rentals.module.ts
│   │   │   │   ├── rentals.controller.ts  ← GET /admin/rentals, GET /admin/rentals/:id/decrypt
│   │   │   │   └── rentals.service.ts
│   │   │   ├── facilities/             ← Facility CRUD, blackout management, booking approval
│   │   │   │   ├── facilities.module.ts
│   │   │   │   ├── facilities.controller.ts  ← CRUD + blackout + photo endpoints
│   │   │   │   ├── facilities.service.ts
│   │   │   │   ├── bookings/
│   │   │   │   │   ├── bookings.controller.ts  ← Admin booking review/approve/reject/cancel
│   │   │   │   │   └── bookings.service.ts
│   │   │   │   ├── entities/
│   │   │   │   │   ├── common-facility.entity.ts
│   │   │   │   │   ├── facility-blackout.entity.ts
│   │   │   │   │   └── facility-booking.entity.ts
│   │   │   │   ├── dto/
│   │   │   │   │   ├── create-facility.dto.ts
│   │   │   │   │   ├── update-facility.dto.ts
│   │   │   │   │   └── approve-booking.dto.ts
│   │   │   │   ├── s3/
│   │   │   │   │   └── facility-s3.service.ts   ← Photo pre-signed PUT/GET URLs
│   │   │   │   └── processors/
│   │   │   │       └── auto-reject.processor.ts ← BullMQ: auto-reject stale PENDING bookings
│   │   │   ├── vendors/                ← Vendor registration, document management
│   │   │   │   ├── vendors.module.ts
│   │   │   │   ├── vendors.controller.ts  ← Admin CRUD + document upload + phone decrypt
│   │   │   │   ├── vendors.service.ts
│   │   │   │   ├── entities/
│   │   │   │   │   ├── vendor-profile.entity.ts
│   │   │   │   │   └── vendor-document.entity.ts
│   │   │   │   ├── dto/
│   │   │   │   │   └── create-vendor.dto.ts
│   │   │   │   └── s3/
│   │   │   │       └── vendor-s3.service.ts     ← Document pre-signed PUT/GET URLs
│   │   │   ├── events/                 ← Admin moderation, pin, official event creation
│   │   │   │   ├── events.module.ts
│   │   │   │   ├── events.controller.ts  ← GET all events, pin, remove, moderate media
│   │   │   │   └── events.service.ts
│   │   │   ├── audit/                  ← Society-level FY audit report management
│   │   │   │   ├── audit.module.ts
│   │   │   │   ├── audit.controller.ts
│   │   │   │   ├── audit.service.ts
│   │   │   │   ├── audit-report.entity.ts
│   │   │   │   ├── pdf/
│   │   │   │   │   ├── society-audit.template.html  ← Puppeteer HTML template
│   │   │   │   │   └── pdf.service.ts               ← Puppeteer launch + render
│   │   │   │   └── processors/
│   │   │   │       ├── audit-generate.processor.ts  ← BullMQ worker (PDF build)
│   │   │   │       └── audit-notify.processor.ts    ← BullMQ worker (owner notify)
│   │   │   ├── adminjs/                ← AdminJS panel for Society Admin
│   │   │   │   ├── adminjs.module.ts               ← AdminModule.createAdminAsync()
│   │   │   │   ├── adminjs.options.ts               ← resources[], auth, branding
│   │   │   │   ├── resources/
│   │   │   │   │   ├── society.resource.ts          ← Society resource definition
│   │   │   │   │   ├── flat.resource.ts             ← Flat resource definition
│   │   │   │   │   ├── user.resource.ts             ← User resource (phone decryption hook)
│   │   │   │   │   ├── payment.resource.ts          ← Payment resource (read-only)
│   │   │   │   │   ├── visitor-log.resource.ts      ← VisitorLog resource
│   │   │   │   │   ├── bank-account.resource.ts     ← SocietyBankAccount (masked + verify action)
│   │   │   │   │   ├── flat-rental.resource.ts      ← FlatRental (masked, doc download action)
│   │   │   │   │   ├── tenant-profile.resource.ts   ← TenantProfile (masked PAN + phone, read-only)
│   │   │   │   │   ├── common-facility.resource.ts  ← CommonFacility (edit pricing, blackouts)
│   │   │   │   │   ├── facility-booking.resource.ts ← FacilityBooking (approve/reject/cancel)
│   │   │   │   │   ├── vendor-profile.resource.ts   ← VendorProfile (status, doc download)
│   │   │   │   │   ├── society-event.resource.ts    ← SocietyEvent (pin, remove, moderate)
│   │   │   │   │   └── event-media.resource.ts      ← EventMedia (remove moderation action)
│   │   │   │   └── components/
│   │   │   │       ├── PhoneDisplay.tsx             ← Custom React component (decrypted phone)
│   │   │   │       ├── PanDisplay.tsx               ← Masked PAN display (panLast4 only)
│   │   │   │       ├── BookingStatusBadge.tsx        ← Colour-coded booking status chip
│   │   │   │       └── EventStatusBadge.tsx          ← Colour-coded event status chip
│   │   │   └── main.ts
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── super-admin-service/            ← NestJS; platform management APIs
│   │   ├── src/
│   │   │   ├── societies/
│   │   │   ├── subscriptions/
│   │   │   ├── feature-flags/
│   │   │   ├── key-rotation/
│   │   │   ├── adminjs/                ← AdminJS panel for Super Admin (global view)
│   │   │   │   ├── adminjs.module.ts               ← AdminModule.createAdminAsync()
│   │   │   │   ├── adminjs.options.ts               ← all-entity resources, branding
│   │   │   │   ├── resources/
│   │   │   │   │   ├── society.resource.ts          ← All societies (create/edit/delete)
│   │   │   │   │   ├── user.resource.ts             ← All users (phone decryption hook)
│   │   │   │   │   ├── payment.resource.ts          ← All payments (read-only + filter)
│   │   │   │   │   ├── audit-report.resource.ts     ← AuditReport management
│   │   │   │   │   ├── feature-flag.resource.ts     ← Feature flag toggles
│   │   │   │   │   ├── bank-account.resource.ts     ← SocietyBankAccount (all societies, verify action)
│   │   │   │   │   ├── flat-rental.resource.ts      ← FlatRental (masked phone/PAN)
│   │   │   │   │   ├── tenant-profile.resource.ts   ← TenantProfile (masked fields, read-only)
│   │   │   │   │   ├── common-facility.resource.ts  ← CommonFacility CRUD + blackout management
│   │   │   │   │   ├── facility-booking.resource.ts ← FacilityBooking (approve/reject/cancel actions)
│   │   │   │   │   ├── vendor-profile.resource.ts   ← VendorProfile (status toggle, doc view)
│   │   │   │   │   ├── society-event.resource.ts    ← SocietyEvent (pin, remove, create official)
│   │   │   │   │   └── event-media.resource.ts      ← EventMedia (remove moderation action)
│   │   │   │   ├── components/
│   │   │   │   │   ├── PhoneDisplay.tsx             ← Decrypted phone viewer component
│   │   │   │   │   ├── PanDisplay.tsx               ← Masked PAN display component
│   │   │   │   │   ├── BookingStatusBadge.tsx        ← Colour-coded booking status chip
│   │   │   │   │   ├── EventStatusBadge.tsx          ← Colour-coded event status chip
│   │   │   │   │   └── SystemHealthDashboard.tsx    ← Custom dashboard widget
│   │   │   │   └── dashboard/
│   │   │   │       └── dashboard.component.tsx      ← AdminJS custom dashboard page
│   │   │   └── main.ts
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── api-gateway/                    ← NestJS; single public entry point
│       ├── src/
│       │   ├── auth/                   ← OTP, JWT, TOTP
│       │   │   ├── auth.module.ts
│       │   │   ├── auth.controller.ts
│       │   │   ├── auth.service.ts
│       │   │   ├── strategies/
│       │   │   │   ├── jwt.strategy.ts
│       │   │   │   └── otp.strategy.ts
│       │   │   └── guards/
│       │   │       ├── jwt-auth.guard.ts
│       │   │       └── roles.guard.ts
│       │   │
│       │   ├── payments/               ← Invoice, payment initiation, webhooks
│       │   │   ├── payments.module.ts
│       │   │   ├── payments.controller.ts
│       │   │   ├── payments.service.ts
│       │   │   └── guards/
│       │   │       └── webhook-signature.guard.ts
│       │   │
│       │   ├── common/                 ← Health, feature flags, announcements
│       │   │   ├── common.module.ts
│       │   │   ├── health.controller.ts
│       │   │   ├── feature-flags.service.ts
│       │   │   └── crypto/
│       │   │       └── phone-crypto.service.ts
│       │   │
│       │   ├── proxy/                  ← HTTP proxy to downstream services
│       │   │   └── proxy.service.ts
│       │   │
│       │   └── main.ts
│       ├── Dockerfile
│       └── package.json
│
│   ── media-service/                   ← NestJS; Common Image Media Service
│       ├── src/
│       │   ├── upload/                 ← Pre-signed PUT URL generation + confirm flow
│       │   │   ├── upload.module.ts
│       │   │   ├── upload.controller.ts   ← POST /media/images/upload-url, /confirm
│       │   │   ├── upload.service.ts
│       │   │   └── dto/
│       │   │       ├── request-upload-url.dto.ts  ← contextType, mimeType, fileSizeBytes
│       │   │       └── confirm-upload.dto.ts
│       │   │
│       │   ├── transform/              ← On-demand image transform via Sharp
│       │   │   ├── transform.module.ts
│       │   │   ├── transform.controller.ts  ← GET /media/images/:imageId (with query params)
│       │   │   ├── transform.service.ts     ← Param parse → cache check → Sharp → S3 write
│       │   │   ├── presets.ts               ← Named size preset definitions (thumbnail/small/…)
│       │   │   └── params-hash.util.ts      ← SHA-256 of canonical sorted query string
│       │   │
│       │   ├── cache/                  ← Variant registry & CloudFront invalidation
│       │   │   ├── cache.module.ts
│       │   │   ├── cache.service.ts         ← Read/write MediaAsset.variants JSONB
│       │   │   └── cloudfront.service.ts    ← AWS SDK CloudFront invalidation calls
│       │   │
│       │   ├── entities/
│       │   │   └── media-asset.entity.ts    ← MediaAsset TypeORM entity (7.2.17)
│       │   │
│       │   ├── admin/                  ← Admin stats + manual invalidation
│       │   │   ├── admin.module.ts
│       │   │   ├── admin.controller.ts  ← POST /invalidate, GET /stats
│       │   │   └── admin.service.ts
│       │   │
│       │   ├── processors/
│       │   │   └── delete-purge.processor.ts  ← BullMQ: CloudFront invalidation on soft-delete
│       │   │
│       │   └── main.ts
│       ├── Dockerfile
│       └── package.json
│
└── packages/                           ← Shared internal libraries
    ├── shared-nextjs-config/           ← ★ Shared Next.js base config for all web dashboards
    │   ├── next.config.base.js         ← transpilePackages + security headers + image config
    │   ├── next.config.base.d.ts       ← TypeScript declaration (NextConfig type)
    │   ├── package.json                ← @society/shared-nextjs-config
    │   └── tsconfig.json
    ├── shared-ui-assets/               ← ★ Centralised static assets (favicons, icons, manifests)
    │   ├── assets/                     ← All static files relocated from root /public/
    │   │   ├── favicon.ico · favicon-16x16.png · favicon-32x32.png · favicon-96x96.png
    │   │   ├── apple-icon*.png · android-icon*.png · ms-icon*.png
    │   │   ├── manifest.json · browserconfig.xml
    │   ├── index.js                    ← Exports resolved assetsPath for consuming apps
    │   ├── tsconfig.json
    │   └── package.json                ← @society/shared-ui-assets
    ├── shared-types/                   ← TypeScript interfaces & enums (FE + BE)
    │   ├── package.json                ← @society/shared-types
    │   └── tsconfig.json
    ├── shared-validators/              ← Zod schemas shared between FE & BE
    │   ├── package.json                ← @society/shared-validators
    │   └── tsconfig.json
    ├── shared-ui-tokens/               ← ★ Single source of truth for the design token system
    │   ├── tailwind.config.ts          ← Canonical preset (colours, spacing, typography, radius, shadows)
    │   │                                  Extended by all 6 app packages via presets: [...]
    │   ├── package.json                ← @society/shared-ui-tokens
    │   └── tsconfig.json
    ├── shared-ui-components/           ← ★ Cross-platform UI component library
    │   ├── src/
    │   │   ├── web/
    │   │   │   ├── ClickCounter.tsx    ← Oat UI demo: article · button · mark · progress
    │   │   │   └── index.ts            ← Web component barrel export
    │   │   └── index.ts                ← Root barrel (re-exports web/)
    │   ├── package.json                ← @society/shared-ui-components · exports: ./src (no build step)
    │   └── tsconfig.json
    └── shared-i18n/                    ← Translation strings (en, hi, mr) — i18next compatible
        ├── package.json                ← @society/shared-i18n
        └── tsconfig.json
```

### 11.2 Lerna Configuration

```json
// lerna.json
{
  "$schema": "node_modules/lerna/schemas/lerna-schema.json",
  "version": "independent",
  "npmClient": "npm",
  "packages": [
    "applications/owner-app/mobile",
    "applications/owner-app/web",
    "applications/admin-app/mobile",
    "applications/admin-app/web",
    "applications/super-admin-app/mobile",
    "applications/super-admin-app/web",
    "backend/api-gateway",
    "backend/owner-service",
    "backend/admin-service",
    "backend/super-admin-service",
    "backend/media-service",
    "packages/*"                          // picks up shared-ui-assets, shared-ui-tokens, shared-ui-components, etc.
  ],
  "command": {
    "run": {
      "concurrency": 5,
      "stream": true
    },
    "publish": {
      "conventionalCommits": true,
      "message": "chore(release): publish"
    }
  }
}
```

### 11.3 Shared Package Dependency Graph

The diagram below shows how all shared packages relate to every application package:

```
packages/shared-ui-assets
  (assets/ — favicons, icons, manifest, browserconfig)
        │
        │  referenced via resolved assetsPath (workspace symlink)
        ├──► owner-app/web          (Next.js public/ copy or next.config.ts staticDir)
        ├──► admin-app/web          (Next.js public/ copy or next.config.ts staticDir)
        └──► super-admin-app/web    (Next.js public/ copy or next.config.ts staticDir)


packages/shared-ui-tokens
  (tailwind.config.ts + oat-overrides.css)
        │
        │  extended by
        ├──────────────────────────────────────────────────────────┐
        │                                                          │
        ▼  (web apps — tailwind.config.ts preset)                 ▼  (mobile apps — tailwind.config.ts preset)
  owner-app/web          admin-app/web      super-admin-app/web   owner-app/mobile   admin-app/mobile   super-admin-app/mobile
  (Next.js + Oat UI)     (Next.js + Oat UI) (Next.js + Oat UI)    (NativeWind)       (NativeWind)       (NativeWind)


packages/shared-ui-components
  (web/ + mobile/ + shared/)
        │
        │  imported as local workspace dep  "@society/shared-ui-components"
        ├──► owner-app/web          (imports from shared-ui-components/web)
        ├──► admin-app/web          (imports from shared-ui-components/web)
        ├──► super-admin-app/web    (imports from shared-ui-components/web)
        ├──► owner-app/mobile       (imports from shared-ui-components/mobile)
        ├──► admin-app/mobile       (imports from shared-ui-components/mobile)
        └──► super-admin-app/mobile (imports from shared-ui-components/mobile)
```

**Package naming convention** (in each app's `package.json` `dependencies`):

```json
{
  "dependencies": {
    "@society/shared-ui-assets":     "*",
    "@society/shared-ui-tokens":     "*",
    "@society/shared-ui-components": "*",
    "@society/shared-types":         "*",
    "@society/shared-validators":    "*",
    "@society/shared-i18n":          "*"
  }
}
```

Lerna resolves these local workspace references via npm workspaces symlinks — no publishing step is needed during local development.

---

### 11.4 TypeScript Configuration Strategy

All TypeScript configuration is organised in a two-level hierarchy:

| File | Role |
|---|---|
| `tsconfig.base.json` (repo root) | Single source of truth for strict compiler options shared by every package and service. Does **not** set `module`, `moduleResolution`, or `lib` — each package overrides those. |
| `<package>/tsconfig.json` | Package-level config; extends the base and adds runtime-specific overrides. |
| `<nestjs-service>/tsconfig.build.json` | Production build config; extends the service tsconfig and additionally excludes all `*.spec.ts` / `*.e2e-spec.ts` test files. Used by `nest build`. |

#### Base options (`tsconfig.base.json`)

```jsonc
{
  "compilerOptions": {
    "target": "ES2022",          // Node.js 22 LTS natively supports ES2022
    "strict": true,              // Enables all strict-* flags
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "skipLibCheck": true,
    "experimentalDecorators": true,   // Required by NestJS + TypeORM
    "emitDecoratorMetadata": true     // Required by NestJS + TypeORM
  }
}
```

#### Per-package overrides

| Package / Service type | `module` | `moduleResolution` | `jsx` | `noEmit` |
|---|---|---|---|---|
| **NestJS services** (`backend/*`) | `commonjs` | `node` | — | `false` |
| **Next.js web apps** (`applications/*/web`) | `esnext` | `bundler` | `preserve` | `true` |
| **React Native / Expo** (`applications/*/mobile`) | `esnext` | `bundler` | `react-native` | `true` |
| **Shared TS packages** (`packages/shared-types`, `shared-validators`, `shared-i18n`) | `commonjs` | `node` | — | `false` |
| **`shared-ui-components`** | `esnext` | `bundler` | `react-jsx` | `false` |
| **`shared-ui-tokens`** | `commonjs` | `node` | — | `false` |
| **`shared-ui-assets`** (JS-only) | `commonjs` | `node` | — | `true` |

#### TypeScript path aliases

All Next.js web apps and React Native mobile apps declare `paths` in their `tsconfig.json` pointing to the monorepo workspace packages. This gives IDEs full go-to-source navigation without requiring a separate build step:

```jsonc
// Example — applications/owner-app/web/tsconfig.json
"paths": {
  "@/*":                        ["./src/*"],
  "@society/shared-types":      ["../../../packages/shared-types/src"],
  "@society/shared-validators": ["../../../packages/shared-validators/src"],
  "@society/shared-ui-tokens":  ["../../../packages/shared-ui-tokens"],
  "@society/shared-ui-components": ["../../../packages/shared-ui-components/src"],
  "@society/shared-i18n":       ["../../../packages/shared-i18n/src"],
  "@society/shared-ui-assets":  ["../../../packages/shared-ui-assets/index.js"]
}
```

> **Note:** At runtime the path aliases are resolved by Metro (Expo) or webpack/SWC (Next.js) using the npm workspaces symlinks in `node_modules/@society/*`. The `paths` block in tsconfig serves only the TypeScript language server.

---

### 11.5 Nx Task-Runner Configuration

`nx.json` at the repository root enables **local computation caching** for all Lerna-managed tasks. Lerna 8.x delegates task orchestration to Nx automatically when `nx.json` is present — no separate Nx installation is required beyond adding `nx` as a root `devDependency`.

#### Global settings

| Key | Value | Rationale |
|---|---|---|
| `defaultBase` | `"develop"` | Branch used by `nx affected` to determine changed packages |
| `parallel` | `5` | Matches `lerna.json → command.run.concurrency`; controls concurrent task execution |
| `cacheDirectory` | `".nx/cache"` | Local disk cache; git-ignored via `.gitignore` |

#### Named inputs (`namedInputs`)

Named inputs are reusable file-set groups referenced in `targetDefaults`. They drive precise cache-key computation.

| Named input | Composition | Purpose |
|---|---|---|
| `globalConfig` | `tsconfig.base.json`, `package.json`, `lerna.json`, `nx.json` | Root-level files that affect every package — any change invalidates all caches |
| `projectFileSet` | All files under `{projectRoot}/` except `dist/`, `.next/`, `coverage/`, `.tsbuildinfo`, `node_modules/` | Per-project source files with generated artefacts excluded |
| `default` | `projectFileSet` + `globalConfig` | Full cache key for development-mode targets (`lint`, `type-check`, `test`) |
| `production` | `default` minus all `*.spec.ts`, `*.test.ts`, `test/**`, `__tests__/**` | Build cache is not invalidated by test-only changes |

The `^` prefix on an input name (e.g. `"^production"`) means _"include the matching inputs of every upstream workspace dependency"_, enabling correct transitive cache invalidation.

#### Target defaults (`targetDefaults`)

| Target | `cache` | `dependsOn` | `inputs` | `outputs` |
|---|---|---|---|---|
| `build` | ✅ | `["^build"]` | `production`, `^production` | `{projectRoot}/dist`, `{projectRoot}/.next` |
| `test` | ✅ | — | `default`, `^production` | `{projectRoot}/coverage` |
| `lint` | ✅ | — | `default` + root ESLint config files | _(none — exit-code cached)_ |
| `type-check` | ✅ | — | `default`, `^production` | _(none — exit-code cached)_ |
| `start:dev` | ❌ | — | — | — |

**Key design decisions:**

- **`build → dependsOn: ["^build"]`** — Ensures all workspace dependencies are compiled before a consumer package is built, maintaining correct build ordering across the dependency graph.
- **`build → inputs: production`** — Changing only a test file (e.g. adding a new `*.spec.ts`) does not bust the build cache for that package, saving CI time.
- **`build → outputs: [dist, .next]`** — Nx stores whichever of these directories exists after the task completes. NestJS services write to `dist/`; Next.js apps write to `.next/`. React Native and `shared-ui-assets` emit nothing (those packages use `noEmit: true`).
- **`test / lint / type-check → outputs: []`** — These targets produce no artefact files. Nx caches the terminal output and exit code, replaying them on a cache hit to report pass/fail instantly without re-running the process.
- **`lint → extra ESLint config inputs`** — Root-level `.eslintrc.*` / `eslint.config.*` files are listed explicitly so that tightening a lint rule invalidates every package's lint cache. Per-package ESLint overrides are already covered by `projectFileSet`.

#### Usage

```bash
# Run all targets, with Nx providing task ordering and cache
npx lerna run build --stream
npx lerna run test  --stream

# Nx affected (only packages changed since develop)
npx nx affected --target=build  --base=develop
npx nx affected --target=test   --base=develop

# Inspect cache hits/misses
npx nx show project @society/owner-service
```

---

### 11.6 Shared Next.js Configuration Strategy

All three web applications (`owner-app/web`, `admin-app/web`, `super-admin-app/web`) share a common
Next.js base configuration published as the internal package **`@society/shared-nextjs-config`**.

#### Package: `packages/shared-nextjs-config`

| File | Role |
|---|---|
| `next.config.base.js` | Base `NextConfig` object — `transpilePackages`, security headers, image patterns, `poweredByHeader: false` |
| `next.config.base.d.ts` | Hand-authored TypeScript declaration so consuming apps get full IntelliSense |
| `tsconfig.json` | Extends root base; `allowJs + checkJs: true, noEmit: true` — type-checks the JS config itself |

#### `transpilePackages` list

Next.js must transpile workspace packages that ship TypeScript source (as opposed to pre-compiled JS).
The shared config includes every `@society/*` internal package:

```
@society/shared-types · @society/shared-validators · @society/shared-ui-tokens
@society/shared-ui-components · @society/shared-i18n · @society/shared-ui-assets
@society/shared-nextjs-config
```

#### Security headers (applied to every route via `async headers()`)

| Header | Value |
|---|---|
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `X-XSS-Protection` | `1; mode=block` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |

#### `createNextConfig` factory

`next.config.base.js` exports a **`createNextConfig(appDir, overrides?)`** factory. Calling it does two things synchronously at config-evaluation time (before any bundler starts):

1. **Copies shared assets** — calls `copySharedAssets(appDir)` which uses `fs.cpSync` to copy all files from `@society/shared-ui-assets/assets/` into `<appDir>/public/`. This works for both **Turbopack** (`next dev --turbopack`) and **webpack** because it runs before either bundler initialises.
2. **Returns the merged config** — merges `transpilePackages`, security headers, image patterns, and any app-specific overrides.

#### Consuming an app's `next.config.ts`

```ts
import { createNextConfig } from '@society/shared-nextjs-config'

export default createNextConfig(__dirname, {
  // App-specific Next.js config overrides (optional)
})
```

#### Tailwind preset chain

```
packages/shared-ui-tokens/tailwind.config.ts   ← Canonical design-token preset
        │  presets: [societyPreset]
        ├──► applications/owner-app/web/tailwind.config.ts
        ├──► applications/admin-app/web/tailwind.config.ts
        └──► applications/super-admin-app/web/tailwind.config.ts
```

Each web app's `tailwind.config.ts` sets `content` paths covering its own `src/` tree plus
`packages/shared-ui-components/src/` so that classes used in shared components are never purged.

---

## 12. Deployment & Scalability

### 12.1 Infrastructure Overview

```
Internet
   │
   ▼
AWS Route 53 (DNS)
   │
   ▼
AWS Application Load Balancer (ALB)
   │  TLS 1.3 termination; WAF rules
   ▼
Kubernetes Cluster (EKS)
   │
   ├── Namespace: api-gateway       (HPA: 2–20 pods; target 70% CPU)
   ├── Namespace: owner-service     (HPA: 2–10 pods)
   ├── Namespace: admin-service     (HPA: 2–10 pods)
   ├── Namespace: super-admin-svc   (HPA: 1–3 pods)
   ├── Namespace: redis             (ElastiCache Redis cluster)
   └── Namespace: monitoring        (Prometheus, Grafana, Loki, Tempo)
        │
        ▼
AWS RDS PostgreSQL 16
   ├── Primary (Multi-AZ)
   └── Read Replica ×2 (analytics / report queries)
```

### 12.2 Kubernetes Manifests — Key Patterns

Each NestJS service is deployed as a Kubernetes `Deployment` with:

```yaml
# Example: api-gateway deployment snippet
spec:
  replicas: 2
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0          # Zero-downtime deploys
  template:
    spec:
      containers:
        - name: api-gateway
          image: <ECR_REPO>/api-gateway:$(IMAGE_TAG)
          ports:
            - containerPort: 3000
          envFrom:
            - secretRef:
                name: api-gateway-secrets   # AWS Secrets Manager sync
          livenessProbe:
            httpGet: { path: /common/health, port: 3000 }
            initialDelaySeconds: 10
          readinessProbe:
            httpGet: { path: /common/health/ready, port: 3000 }
            initialDelaySeconds: 5
          resources:
            requests: { cpu: "250m", memory: "256Mi" }
            limits:   { cpu: "1000m", memory: "512Mi" }
```

### 12.3 CI/CD Pipeline

```
PR opened / push to main|develop
  │
  ├── lint        (ESLint + Prettier)          — nx affected, parallel=5, Nx cache
  ├── type-check  (tsc --noEmit)               — nx affected, parallel=5, Nx cache
  ├── test        (Jest, with coverage)        — nx affected, parallel=5, Nx cache
  ├── sast        (SonarCloud)                 — runs after lint+type-check+test; consumes coverage artefacts
  └── snyk        (Snyk + npm audit)           — all workspace packages, severity-threshold=high

Merge to main
  │
  ├── Build Docker images (multi-stage; layer caching)
  ├── Push to AWS ECR (tagged with git SHA)
  ├── Helm upgrade --install (per service)
  └── Smoke tests (k6 script against staging)
```

#### CI workflow file — `.github/workflows/ci.yml`

| Job | Runner | Key actions | Cache |
|---|---|---|---|
| `lint` | `ubuntu-latest` | `nx affected --target=lint` | `.nx/cache` restored from `actions/cache` |
| `type-check` | `ubuntu-latest` | `nx affected --target=type-check` | `.nx/cache` restored from `actions/cache` |
| `test` | `ubuntu-latest` | `nx affected --target=test`; coverage uploaded as `coverage-reports` artefact | `.nx/cache` restored from `actions/cache` |
| `sast` | `ubuntu-latest` | `SonarSource/sonarcloud-github-action@v3`; downloads coverage artefact | — |
| `snyk` | `ubuntu-latest` | `snyk/actions/node@master --all-projects`; `npm audit --audit-level=high` | — |

**Affected-package base ref logic:**
- **PR events** → `origin/<base_ref>` (the PR target branch)
- **Push events** → `github.event.before` (the commit SHA before the push)

This ensures only the packages touched by each PR or commit are linted, type-checked, and tested — greatly reducing CI runtime as the monorepo grows.

#### Required GitHub repository secrets

| Secret | Used by | How to obtain |
|---|---|---|
| `GITHUB_TOKEN` | `sast` | Automatically provided by GitHub Actions — no setup needed |
| `SONAR_TOKEN` | `sast` | SonarCloud → My Account → Security → Generate token |
| `SNYK_TOKEN` | `snyk` | Snyk dashboard → Account Settings → API token |
| `SNYK_ORG_ID` | `snyk` | Snyk dashboard → Settings → Organisation ID |

#### SonarCloud configuration — `sonar-project.properties`

The root `sonar-project.properties` file configures the SonarCloud scan. Replace the placeholder values with your SonarCloud organisation slug and project key before the first CI run:

```properties
sonar.organization=<YOUR_SONAR_ORG>
sonar.projectKey=<YOUR_SONAR_PROJECT_KEY>
sonar.sources=applications,backend,packages
sonar.javascript.lcov.reportPaths=coverage-reports/**/lcov.info
sonar.typescript.tsconfigPaths=tsconfig.base.json
```

### 12.4 Multi-Tenancy & Data Isolation

- All tables include a **non-nullable `society_id` UUID column** with a database-level `NOT NULL` constraint and an index.
- The API gateway injects `society_id` from the validated JWT into every downstream request header (`X-Society-Id`).
- Each microservice has a **global NestJS interceptor** that extracts `X-Society-Id` and appends it as a mandatory `WHERE` clause via a TypeORM global subscriber — preventing cross-tenant data leakage even if a service-level bug omits the filter.

### 12.5 Disaster Recovery

| Scenario | RTO | RPO | Procedure |
|---|---|---|---|
| Single pod crash | < 30 s | 0 | Kubernetes self-healing |
| AZ failure | < 5 min | < 1 min | Multi-AZ RDS failover + pod rescheduling |
| Region failure | < 60 min | < 15 min | Cross-region RDS snapshot restore + DR cluster |
| Data corruption | < 120 min | < 15 min | Point-in-time restore (PITR) from RDS |
| Full ransomware | < 4 h | < 24 h | Air-gapped S3 backup restore |

### 12.6 Observability

- **Metrics:** OpenTelemetry SDK → Prometheus → Grafana dashboards (per-society request rate, error rate, p99 latency).
- **Logs:** Structured JSON → Fluent Bit → AWS CloudWatch / Loki. PII fields redacted at the logger interceptor before emission.
- **Traces:** OpenTelemetry distributed tracing → Tempo; spans carry `correlationId` and `societyId` (not `userId`).
- **Alerts:** PagerDuty integration; critical alerts for: p99 > 500 ms, error rate > 1%, pod restarts > 3 in 5 min, RDS replication lag > 30 s.

---

## 13. Glossary

| Term | Definition |
|---|---|
| **AES-256-GCM** | Advanced Encryption Standard with 256-bit key in Galois/Counter Mode — provides authenticated encryption |
| **AdminJS** | Open-source Node.js admin panel library (`adminjs` package) that auto-generates a React-based CRUD UI from ORM entity definitions; integrated into NestJS via `@adminjs/nestjs` and into TypeORM via `@adminjs/typeorm` |
| **AdminJS Action** | A named operation exposed in the AdminJS panel for a resource — built-in actions are `list`, `show`, `new`, `edit`, `delete`, `bulkDelete`; custom actions can be added with server-side handlers and optional React components |
| **AdminJS Custom Component** | A React component bundled via `AdminJS.bundle()` that overrides how a specific property or action is rendered in the admin panel; used in this system to display decrypted phone numbers |
| **AdminJS Resource** | An AdminJS abstraction over a TypeORM entity that defines which properties are visible/editable, which actions are allowed, and how filters and hooks behave for that entity |
| **AGM** | Annual General Meeting — the yearly meeting of all society members at which financial accounts and the audit report are presented |
| **Audit Report** | A tamper-evident, SHA-256-checksummed PDF document covering all financial inflows and outflows for a society during a financial year; published by the Admin after review |
| **AuditReportStatus** | Lifecycle enum for an audit report record: `PENDING → GENERATING → DRAFT → PUBLISHED → ARCHIVED` (or `FAILED`) |
| **AuditReportType** | Enum identifying the kind of audit PDF: `SOCIETY_ANNUAL` (full society ledger) or `OWNER_STATEMENT` (per-owner payment history) |
| **Admin Audit Log** | A database record written after every AdminJS panel action (create / edit / delete / custom); captures `adminId`, `action`, `resource`, `recordId`, `changedFields`, `ip`, `timestamp` for compliance traceability |
| **Autopay** | Razorpay's UPI recurring mandate product for automated monthly debits |
| **Blackout Period** | An admin-defined date-time range during which a `CommonFacility` is unavailable for booking (e.g. annual maintenance, society events); stored in `FacilityBlackout` entity; displayed as blocked slots on the owner-facing availability calendar |
| **BookingStatus** | Lifecycle enum for a `FacilityBooking` record: `PENDING_APPROVAL → APPROVED → CONFIRMED` (payment captured) or `REJECTED`; a `CONFIRMED` booking can transition to `CANCELLED` |
| **Collection Efficiency** | Ratio of maintenance actually collected to total maintenance billed in a period; expressed as a percentage in the audit report's executive summary |
| **CloudFront** | AWS Content Delivery Network (CDN) service; sits in front of the `society-media-assets` S3 bucket to cache transformed image variants at edge locations worldwide; reduces latency for image delivery, especially over mobile networks |
| **DEK** | Data Encryption Key — the symmetric key used to encrypt phone fields; itself encrypted by the KMS master key |
| **Design Token** | A named value (colour, spacing, radius, etc.) defined once in `shared-ui-tokens` and consumed by both Tailwind CSS (web) and NativeWind (mobile) |
| **E.164** | International telephone number format (e.g. `+919876543210`) |
| **EventMedia** | A photo or video uploaded to a `SocietyEvent`; stored in the `society-event-media` private S3 bucket with KMS encryption; served exclusively via pre-signed GET URLs; thumbnails auto-generated by Sharp (photos) or FFmpeg (videos) |
| **EventRsvp** | A record confirming that a flat owner intends to attend a `SocietyEvent`; enforces `maxParticipants` cap; cancellable before `startDatetime` |
| **EventStatus** | Lifecycle enum for a `SocietyEvent`: `DRAFT → UPCOMING → ONGOING → COMPLETED` (auto-transitioned by BullMQ jobs) or `CANCELLED` (organiser/admin) or `REMOVED` (admin moderation) |
| **Facility** | A bookable common amenity within a society — e.g. Clubhouse, Swimming Pool, Gym, Terrace Garden; registered by an Admin as a `CommonFacility` record with capacity, pricing model, and photos |
| **FacilityBooking** | A request by an owner to reserve a `CommonFacility` for a specific date-time slot; follows the `BookingStatus` lifecycle; payment is collected after Admin approval |
| **FacilityPricingModel** | The billing model for a facility: `FIXED` (flat fee per booking), `HOURLY` (fee = rate × hours), or `VARIABLE` (JSON schedule keyed by `dayType` + `slotType`) |
| **Financial Year (FY)** | The Indian government financial year, running from **April 1** to **March 31** of the following calendar year. Represented in the system as `"YYYY-YYYY"` (e.g. `"2025-2026"`) |
| **Fund Account** | A Razorpay object (prefix `fa_`) that represents a beneficiary's bank account or VPA registered under a Contact; used for payouts and account validation |
| **Fund Account Validation** | A Razorpay API call (`POST /v1/fund_accounts/validations`) that verifies whether a registered fund account (bank account or VPA) is live and correctly owned; can use Standard Penny Drop or Reverse Penny Drop |
| **GDPR** | General Data Protection Regulation — EU data privacy law |
| **HMAC-SHA256** | Hash-based Message Authentication Code using SHA-256 — used for deterministic phone hashing and Razorpay signature verification |
| **HPA** | Horizontal Pod Autoscaler — Kubernetes resource that scales pod replicas |
| **IFSC** | Indian Financial System Code — an 11-character alphanumeric code that uniquely identifies a bank branch in India; used to route NEFT/RTGS/IMPS transactions |
| **Image ID** | A globally unique `UUIDv4` string assigned by the `media-service` to every uploaded image; the only identifier exposed to client applications. All transform URLs are constructed as `/media/images/{imageId}?params`. The underlying S3 key is never shared externally |
| **ImageVariant** | A transformed, cached copy of an original image produced by applying a specific combination of `width`, `height`, `quality`, `format`, `crop`, and `blur` parameters via Sharp; stored in S3 under `variants/…/{paramsHash}.{format}` and served from CloudFront on subsequent requests |
| **Inflow** | Any money received into the society's account (maintenance, late fees, levies, deposits, penalties) — one of the two directions of a transaction in the audit ledger |
| **IV** | Initialisation Vector — random value used in AES-GCM to ensure ciphertext uniqueness |
| **Journal Entry** | An Admin-recorded offline financial event (e.g. a vendor payment or deposit refund) that is not processed through Razorpay but is logged in the platform for audit completeness |
| **KMS** | Key Management Service — cloud service (e.g. AWS KMS) for managing cryptographic keys |
| **Ledger** | The complete ordered record of all financial inflows and outflows for a society; forms the transaction-level appendix (Section E) of the Annual Audit Report PDF |
| **Lerna** | JavaScript/TypeScript monorepo management tool |
| **LQIP** | Low-Quality Image Placeholder — a tiny, heavily-blurred preview image (e.g. `width=40&blur=10&quality=30`) fetched before the full-resolution image loads; enables progressive loading on slow mobile networks |
| **MediaAsset** | A TypeORM entity (table `media_assets`) that is the authoritative registry for every image uploaded through the `media-service`; stores the original S3 key, dimensions, MIME type, context tag, society scope, and a JSONB map of all generated `ImageVariant` objects |
| **Multi-tenant** | Single deployment serving multiple distinct societies with data isolation |
| **NativeWind** | Library that brings Tailwind CSS utility classes to React Native via a Babel/Metro plugin that transforms class strings into React Native `StyleSheet` objects at build time |
| **Oat UI** | Ultra-lightweight, zero-dependency HTML/CSS/JS UI library (`@knadh/oat`, ~8 KB min+gz) that styles semantic HTML elements automatically; used in all Next.js + React web dashboards |
| **Object Lock** | AWS S3 feature that enforces WORM (Write Once Read Many) storage; used in COMPLIANCE mode on published audit PDFs to satisfy the 7-year legal retention requirement |
| **order_id** | Razorpay-generated identifier for a payment order; used to track the full payment lifecycle |
| **OTP** | One-Time Password — time-limited numeric code sent via SMS/WhatsApp |
| **Outflow** | Any money disbursed from the society's account to an owner or vendor (refunds, deposit returns, vendor payments) — recorded as a journal entry by Admin |
| **Paise** | Smallest unit of Indian Rupee (1 INR = 100 paise); Razorpay amounts are always in paise |
| **PAN** | Permanent Account Number — a 10-character alphanumeric identifier issued by the Indian Income Tax Department to every taxpayer; mandatory for rent agreements above ₹50,000/month. Stored AES-256-GCM encrypted; only the last 4 characters are kept in plaintext for masked display |
| **Penny Drop** | A bank account verification method in which ₹1 is credited to the target account; a successful credit confirms the account exists. See also: **Reverse Penny Drop** |
| **payment_id** | Razorpay-generated identifier for a completed payment transaction |
| **PDF Checksum** | The SHA-256 hex digest of a generated PDF binary, embedded in its XMP metadata and stored in the `audit_reports` table; enables offline tamper verification |
| **PITR** | Point-in-Time Recovery — ability to restore database to any past moment |
| **Puppeteer** | Node.js library that controls a headless Chromium browser; used server-side to render Handlebars HTML templates into PDF buffers for audit and receipt documents |
| **RBAC** | Role-Based Access Control |
| **Razorpay Contact** | A Razorpay object (prefix `cont_`) that represents a payee — in this system, each society has one Contact created when their first bank account is registered |
| **Razorpay** | Indian payment gateway supporting UPI, cards, net banking, EMI, and wallets |
| **Reverse Penny Drop** | A Razorpay account verification method in which the end user (society admin) makes a ₹1 UPI payment from their bank account; Razorpay retrieves and verifies the account holder name, account number, IFSC, and type directly from the bank. The ₹1 is auto-refunded |
| **Reconciliation** | The process of matching platform transaction records against Razorpay settlement statements to confirm that all captured payments and refunds are accurately reflected in the audit ledger |
| **RSVP** | Répondez s'il vous plaît — in this system, an explicit confirmation by a flat owner that they intend to attend a `SocietyEvent`; modelled as an `EventRsvp` record; capped by `maxParticipants` |
| **Rent Agreement** | A legally binding document signed between a flat owner and a tenant specifying rental terms; uploaded as a PDF/image to the `society-rental-documents` S3 bucket and stored with AES-256-GCM server-side KMS encryption; accessible only via pre-signed URLs |
| **RentalDocument** | A `TypeORM` entity and S3 object representing one version of a document (Rent Agreement or PAN Card copy) attached to a `FlatRental`; previous versions are archived as `SUPERSEDED` |
| **RentalStatus** | Lifecycle enum for a `FlatRental` record: `ACTIVE` (tenant in residence) → `ENDED` (tenant vacated, flat reverted to VACANT) or `EXPIRED` (agreement end date passed without owner action) |
| **RPO** | Recovery Point Objective — maximum acceptable data loss |
| **RPAY_KEY_ID** | Razorpay public key sent to the client to initialise the checkout SDK |
| **RPAY_KEY_SECRET** | Razorpay private key used server-side for order creation and signature verification — never exposed to clients |
| **RTO** | Recovery Time Objective — maximum acceptable downtime |
| **S3 Glacier** | AWS archival storage class used for audit PDFs older than 12 months; retrieval within minutes; significantly lower cost than S3 Standard |
| **SHA-256** | Secure Hash Algorithm producing a 256-bit digest; used to compute the tamper-detection checksum of every generated audit PDF |
| **Sharp** | High-performance Node.js image processing library (built on libvips); used by `media-service` to resize images, convert formats (JPEG → WebP, PNG → WebP, etc.), apply quality compression, centre-crop, and generate Gaussian blurs for LQIP placeholders — all on-demand without pre-generating variants |
| **SocietyEvent** | A community event created by a flat owner or Admin (e.g. festival, tournament, movie night); discoverable by all owners in the same society via the event feed; may be linked to a `FacilityBooking` for a venue; supports RSVP, media uploads, and Admin pinning |
| **Tailwind CSS** | Utility-first CSS framework; used directly in Next.js + React web dashboards and via NativeWind in React Native mobile apps |
| **TOTP** | Time-based One-Time Password (e.g. Google Authenticator) — used for Super Admin 2FA |
| **Tenancy** | A period during which a flat is rented out to a tenant; modelled as a `FlatRental` record linking a `Flat`, a `TenantProfile`, an owner, rental terms, and associated documents |
| **Thumbnail** | A reduced-resolution preview image generated from an uploaded photo (480×480 px WebP via Sharp) or video (frame at 1-second mark via FFmpeg); stored in S3 alongside the original; used in event feed cards and gallery grids |
| **Vendor** | A company or individual registered by the society committee as an empanelled service provider (e.g. plumber, electrician, pest-control firm); stored in `VendorProfile` with encrypted phone and optional supporting documents |
| **VendorDocument** | A supporting document uploaded against a `VendorProfile` (GST Certificate, Trade Licence, ID Proof, Insurance Certificate); stored AES-256-GCM encrypted in the `society-vendor-documents` private S3 bucket |
| **VendorPhoneRevealLog** | An audit record created each time an owner uses the "Reveal Phone" feature on a vendor listing; captures `ownerId`, `vendorId`, `ipAddress`, and `revealedAt` for security monitoring |
| **TenantProfile** | A `TypeORM` entity capturing a tenant's personal details (name, encrypted phone, encrypted PAN, address, emergency contact); reusable across multiple `FlatRental` records for the same individual |
| **TypeORM** | Object-Relational Mapper for TypeScript/Node.js |
| **UPI** | Unified Payments Interface — Indian real-time payment system; supports collect (push) and intent (pull) flows |
| **UPI Collect** | Flow where the payer receives a payment request on their UPI app and approves it |
| **UPI Intent** | Flow where the payer is deep-linked directly into a UPI app (GPay, PhonePe, Paytm, etc.) to approve payment |
| **VPA** | Virtual Payment Address — a UPI identifier (e.g. `owner@okicici`) that maps to a bank account |
| **WAL** | Write-Ahead Log — PostgreSQL mechanism enabling streaming replication |
| **WebP** | A modern image format developed by Google that provides superior lossy and lossless compression compared to JPEG and PNG at equivalent visual quality; the **default output format** for all `media-service` transform responses (overridable via `format=jpeg|png|avif`) |
| **Webhook Secret** | Separate Razorpay secret used only for HMAC-verifying incoming webhook payloads |
| **WORM** | Write Once Read Many — a storage policy that prevents modification or deletion of objects after they are written; enforced via S3 Object Lock on published audit PDFs |
| **XMP Metadata** | Extensible Metadata Platform — an ISO standard for embedding structured metadata (including the SHA-256 checksum) inside PDF files |

---

## 14. Razorpay & UPI Payment Integration

### 14.1 Overview

All financial transactions in the platform are processed through **Razorpay**, India's most widely adopted payment gateway. Razorpay acts as the single payment provider and supports every payment method relevant to Indian residential societies:

| Method | Razorpay Product | Use Case |
|---|---|---|
| UPI Collect | Payment Links / Orders API | Owner pays via any UPI app by approving a push request |
| UPI Intent | Orders API + SDK deep link | Owner deep-linked into GPay / PhonePe / Paytm / BHIM |
| UPI Autopay | Subscriptions API | Recurring monthly maintenance deduction via mandate |
| Credit / Debit Card | Orders API | Visa, Mastercard, RuPay |
| Net Banking | Orders API | 50+ Indian banks |
| EMI | Orders API | Cardless EMI for large advance payments |
| Wallets | Orders API | Paytm wallet, Amazon Pay, etc. |
| Cash / Cheque | Manual entry (offline) | Recorded by Admin; no gateway involved |

### 14.2 Environment Configuration

```
# .env (injected from AWS Secrets Manager — never committed to source control)

# Razorpay Credentials
RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXX          # Public; sent to client SDK
RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXXXXXXXX    # Private; server-side only
RAZORPAY_WEBHOOK_SECRET=XXXXXXXXXXXXXXXXXXXXXXX # For webhook HMAC verification

# Test mode (non-production environments)
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXX
RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXXXXXXXX
RAZORPAY_WEBHOOK_SECRET=XXXXXXXXXXXXXXXXXXXXXXX
```

- Credentials are fetched at service start-up from **AWS Secrets Manager** via the `@nestjs/config` + AWS SDK integration.
- The `RAZORPAY_KEY_SECRET` and `RAZORPAY_WEBHOOK_SECRET` are **never logged**, never included in error responses, and never sent to any frontend client.
- Separate credential sets are maintained per environment: `development`, `staging`, `production`.

### 14.3 Razorpay Standard Checkout Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 1: Create Order (Server-side)                                  │
│                                                                      │
│  Owner clicks "Pay ₹3,500"                                           │
│       │                                                              │
│       ▼                                                              │
│  POST /payments/orders                                               │
│  { invoiceId: "inv_...", flatId: "...", societyId: "..." }           │
│       │                                                              │
│       ▼                                                              │
│  Gateway → Razorpay Orders API                                       │
│  POST https://api.razorpay.com/v1/orders                             │
│  {                                                                   │
│    amount: 350000,        // ₹3,500 in paise                         │
│    currency: "INR",                                                  │
│    receipt: "INV-2026-05-A401",                                      │
│    notes: { societyId, flatId, billingMonth: "2026-05" }             │
│  }                                                                   │
│       │                                                              │
│       ▼                                                              │
│  Razorpay returns: { id: "order_XXXXXXXX", status: "created" }       │
│  Gateway stores order in DB; returns { orderId, keyId } to client    │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  STEP 2: Client-side Checkout                                        │
│                                                                      │
│  Web (Next.js + React):                                              │
│  const rzp = new window.Razorpay({                                   │
│    key: keyId,                                                       │
│    order_id: orderId,                                                │
│    amount: 350000,                                                   │
│    currency: 'INR',                                                  │
│    name: 'My Society',                                               │
│    description: 'Maintenance - May 2026',                            │
│    prefill: { name: owner.name, contact: owner.phoneDecrypted },     │
│    theme: { color: '#0066FF' },                                      │
│    handler: (response) => verifyPayment(response), // calls Step 3  │
│  });                                                                 │
│  rzp.open();                                                         │
│                                                                      │
│  React Native (mobile):                                              │
│  RazorpayCheckout.open(options)                                      │
│    .then((response) => verifyPayment(response))                      │
│    .catch((error) => handleFailure(error));                          │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  STEP 3: Server-side Signature Verification                          │
│                                                                      │
│  POST /payments/verify                                               │
│  { razorpay_order_id, razorpay_payment_id, razorpay_signature }      │
│       │                                                              │
│       ▼                                                              │
│  HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)               │
│  == razorpay_signature  ?                                            │
│       ├── YES → DB: status = PROCESSING; return 200                 │
│       └── NO  → DB: status = FRAUD_SUSPECTED; return 400            │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  STEP 4: Webhook (Authoritative Confirmation)                        │
│                                                                      │
│  Razorpay → POST /payments/webhook                                   │
│  Headers: X-Razorpay-Signature: <hmac>                               │
│  Body: { event: "payment.captured", payload: { payment: { ... } } } │
│       │                                                              │
│       ▼                                                              │
│  WebhookSignatureGuard validates HMAC                                │
│       │                                                              │
│       ▼                                                              │
│  Event Router:                                                       │
│  ├── payment.captured   → status=SUCCESS; enqueue receipt job        │
│  ├── payment.failed     → status=FAILED; enqueue reminder job        │
│  ├── refund.processed   → update refund record; notify owner         │
│  └── subscription.charged → create new payment record (Autopay)     │
└─────────────────────────────────────────────────────────────────────┘
```

### 14.4 UPI Payment Flows

#### 14.4.1 UPI Collect (Push-based)

In the **UPI Collect** flow, Razorpay sends a payment request to the owner's registered UPI VPA (Virtual Payment Address). The owner approves the request inside their UPI app.

```
Owner enters UPI ID (e.g. owner@okicici) in checkout
       │
       ▼
Razorpay sends collect request to owner's UPI app
       │
       ▼
Owner opens UPI app → reviews ₹3,500 request → enters UPI PIN
       │
       ▼
Payment rails (NPCI) process the debit
       │
       ├── Success → Razorpay fires payment.captured webhook
       └── Failure (timeout, wrong PIN, insufficient funds)
                  → Razorpay fires payment.failed webhook
```

- **Timeout:** UPI collect requests expire after **5 minutes**; the client polls `GET /payments/orders/:orderId/status` every 5 seconds and shows a countdown.
- **VPA Validation:** Before initiating collect, the gateway calls `POST https://api.razorpay.com/v1/payments/validate/vpa` to verify the UPI ID exists.

#### 14.4.2 UPI Intent (Deep-link / App switch)

The **UPI Intent** flow deep-links the owner directly into an installed UPI app, eliminating VPA entry. This is the preferred flow for mobile.

```typescript
// applications/owner-app/mobile/src/screens/PaymentScreen.tsx
const handleUpiIntent = async (upiApp: 'gpay' | 'phonepe' | 'paytm' | 'bhim') => {
  const { orderId, keyId, amount } = await createOrder(invoiceId);

  const options = {
    key: keyId,
    order_id: orderId,
    amount,
    currency: 'INR',
    method: {
      upi: {
        flow: 'intent',
        // Razorpay SDK resolves the correct intent URI per app:
        // gpay: tez://upi/pay?...
        // phonepe: phonepe://...
        // paytm: paytmmp://...
        // bhim: upi://pay?...
      },
    },
  };

  RazorpayCheckout.open(options)
    .then(verifyPayment)
    .catch(handlePaymentFailure);
};
```

**Supported UPI Intent apps:**

| App | Package (Android) | URL Scheme (iOS) |
|---|---|---|
| Google Pay | `com.google.android.apps.nbu.paisa.user` | `tez://` |
| PhonePe | `com.phonepe.app` | `phonepe://` |
| Paytm | `net.one97.paytm` | `paytmmp://` |
| BHIM | `in.org.npci.upiapp` | `upi://` |
| Amazon Pay | `in.amazon.mShop.android.shopping` | `amazonpay://` |

#### 14.4.3 UPI Autopay (Recurring Mandate)

UPI Autopay allows the platform to automatically debit the owner's bank account on the maintenance due date each month, with a one-time mandate approval.

```
Owner opts into "Auto-pay monthly maintenance"
       │
       ▼
POST /payments/upi/mandate
{ flatId, societyId, startDate, totalMonths: 12 }
       │
       ▼
Gateway → Razorpay Subscriptions API
POST https://api.razorpay.com/v1/subscriptions
{
  plan_id: "plan_XXXXXXXX",        // Pre-configured plan for society's maintenance amount
  total_count: 12,
  quantity: 1,
  start_at: <unix timestamp of next due date>,
  customer_notify: 1,              // Razorpay notifies owner before each charge
  notes: { societyId, flatId }
}
       │
       ▼
Razorpay returns subscription with hosted mandate-approval URL
       │
       ▼
Client opens mandate-approval URL (WebView / in-app browser)
Owner approves mandate in their UPI app (one-time)
       │
       ▼
Mandate active: Razorpay auto-debits on due date each month
       │
       ▼
Webhook: subscription.charged → new payment record created automatically
```

**Mandate Rules (NPCI / Razorpay compliance):**

| Rule | Detail |
|---|---|
| Pre-debit notification | Razorpay sends notification 24 h before each debit (NPCI mandated) |
| Maximum per-debit amount | Configurable up to ₹1,00,000 per transaction |
| Cancellation | Owner can cancel anytime via `PATCH /payments/upi/mandate/:id/cancel` |
| Pause / Resume | Admin can pause a mandate (e.g. flat vacated); resumes when new owner activates |
| Failed mandate debit | Retried once after 24 h; on second failure, owner notified to pay manually |

### 14.5 Payment Entity — Razorpay Fields

The existing `payments` table (Section 7.2.6) is extended with Razorpay-specific columns:

```typescript
@Entity('payments')
export class Payment {
  // ... existing fields ...

  /** Razorpay order_id; created before checkout; used for lifecycle tracking */
  @Column({ type: 'varchar', length: 100, nullable: true })
  razorpayOrderId: string;

  /** Razorpay payment_id; available after successful capture */
  @Column({ type: 'varchar', length: 100, nullable: true })
  razorpayPaymentId: string;

  /** Raw signature received from client; stored for audit / dispute resolution */
  @Column({ type: 'varchar', length: 255, nullable: true })
  razorpaySignature: string;

  /** Razorpay refund_id; populated when a refund is initiated */
  @Column({ type: 'varchar', length: 100, nullable: true })
  razorpayRefundId: string;

  /** Razorpay subscription_id; populated for UPI Autopay payments */
  @Column({ type: 'varchar', length: 100, nullable: true })
  razorpaySubscriptionId: string;

  /** UPI VPA used for collect flow; encrypted at rest */
  @Column({ type: 'varchar', length: 255, nullable: true })
  upiVpaEncrypted: string;

  /** Razorpay event that last updated this record; for idempotent webhook handling */
  @Column({ type: 'varchar', length: 100, nullable: true })
  lastWebhookEvent: string;

  /** Prevents duplicate webhook processing */
  @Column({ type: 'varchar', length: 64, nullable: true, unique: true })
  webhookEventId: string;
}
```

### 14.6 Idempotent Webhook Handling

Razorpay may deliver the same webhook event more than once (network retries). The gateway handles this safely:

```typescript
// gateway/src/payments/payments.service.ts
async processWebhookEvent(payload: RazorpayWebhookPayload): Promise<void> {
  const eventId = payload.id; // Razorpay-provided unique event ID

  // Idempotency check — ignore if already processed
  const existing = await this.paymentsRepo.findOne({ where: { webhookEventId: eventId } });
  if (existing) return; // duplicate delivery; silently acknowledge

  await this.dataSource.transaction(async (manager) => {
    switch (payload.event) {
      case 'payment.captured':
        await this.handlePaymentCaptured(manager, payload, eventId);
        break;
      case 'payment.failed':
        await this.handlePaymentFailed(manager, payload, eventId);
        break;
      case 'refund.processed':
        await this.handleRefundProcessed(manager, payload, eventId);
        break;
      case 'subscription.charged':
        await this.handleSubscriptionCharged(manager, payload, eventId);
        break;
      default:
        this.logger.warn(`Unhandled Razorpay event: ${payload.event}`);
    }
  });
}
```

### 14.7 Refund Flow

```
Admin opens transaction detail → clicks "Initiate Refund"
       │
       ▼
POST /payments/refunds
{ paymentId: "pay_XXXXXXXX", amount?: 350000, reason: "duplicate charge" }
       │
       ▼
Gateway → Razorpay Refund API
POST https://api.razorpay.com/v1/payments/{payment_id}/refund
{ amount: 350000, notes: { reason, initiatedBy: adminId } }
       │
       ▼
Razorpay returns refund object: { id: "rfnd_XXXXXXXX", status: "initiated" }
DB: payments.razorpayRefundId = "rfnd_XXXXXXXX"; status = REFUND_INITIATED
       │
       ▼
Webhook: refund.processed (async; typically 5–7 business days for bank refunds)
DB: status = REFUNDED; owner push notification sent
```

**Refund Rules:**

| Rule | Detail |
|---|---|
| Partial refunds | Supported; `amount` field is optional (omit for full refund) |
| Refund window | Razorpay allows refunds up to **180 days** from original payment |
| Instant refund | Available for UPI and eligible cards; credited within minutes |
| Standard refund | Cards / net banking: 5–7 business days |
| Admin authorisation | Refunds above ₹10,000 require dual-admin approval before API call |

### 14.8 Payment Dashboard — Admin View

The Admin web dashboard displays a real-time payments overview sourced from the `admin-service`:

| Widget | Data Source | Refresh |
|---|---|---|
| Monthly collection rate | `payments` table aggregation | On page load |
| Outstanding dues by flat | `invoices` JOIN `payments` | On page load |
| Recent transactions | `payments` ordered by `createdAt` DESC | Every 30 s |
| Failed payment list | `payments WHERE status = FAILED` | On page load |
| Refunds pending | `payments WHERE status = REFUND_INITIATED` | On page load |
| UPI Autopay mandates | `payments.razorpaySubscriptionId IS NOT NULL` | On page load |

### 14.9 Security Considerations for Payments

| Risk | Mitigation |
|---|---|
| Key secret exposure | `RAZORPAY_KEY_SECRET` stored in AWS Secrets Manager; injected as env var; never logged |
| Signature bypass | All client-reported payment successes validated server-side before status update |
| Webhook replay attack | `webhookEventId` uniqueness constraint prevents duplicate processing |
| Man-in-the-middle | TLS 1.3 enforced end-to-end; Razorpay API calls use HTTPS with cert pinning |
| UPI VPA storage | UPI VPA encrypted with AES-256-GCM (same `PhoneCryptoService` pattern) |
| Refund fraud | Refunds above ₹10,000 require dual-admin approval; all refund actions audit-logged |
| PCI-DSS scope | Card data never touches the platform servers; Razorpay's PCI-DSS L1 certified environment handles raw card data via the checkout SDK |

---

## 15. Financial Year Audit & PDF Generation

### 15.1 Overview & Business Context

Indian housing societies are legally required to maintain transparent financial accounts and present them to all members at the Annual General Meeting (AGM). The platform automates the production of two types of tamper-evident PDF documents at every financial year-close:

| Report Type | Audience | Trigger | Storage Path |
|---|---|---|---|
| **Society Annual Audit Report** | Admins, Accountants, Owners (read-only after publish) | Auto: April 1 cron; Manual: Admin on-demand | `audit-reports/{societyId}/{FY}/SOCIETY_ANNUAL/{version}.pdf` |
| **Owner Annual Payment Statement** | Individual Owner | On-demand via Owner App / Web | `audit-reports/{societyId}/{FY}/OWNER_STATEMENT/{ownerId}/{version}.pdf` |

**Indian Financial Year definition:** April 1 (Year N) to March 31 (Year N+1), represented as `"YYYY-YYYY"` (e.g. `"2025-2026"`).

---

### 15.2 Transaction Taxonomy for Audit

All monetary entries classified for audit must belong to one of the following categories:

#### 15.2.1 Inflows (Money received into society account)

| Category Code | Description | Source |
|---|---|---|
| `MAINTENANCE` | Regular monthly maintenance collection | Owner payment via Razorpay or offline |
| `LATE_FEE` | Penalty for late maintenance payment | System-calculated; collected with payment |
| `SPECIAL_LEVY` | One-time extraordinary charge (e.g. lift repair fund) | Admin-raised invoice |
| `ADVANCE_DEPOSIT` | Security or advance deposit on flat purchase/rent | Admin-recorded offline |
| `PENALTY` | Rule-violation penalty (e.g. illegal parking) | Admin-recorded |
| `OTHER_INFLOW` | Miscellaneous income (hall booking fees, etc.) | Admin-recorded |

#### 15.2.2 Outflows (Money disbursed from society account to owners/vendors)

| Category Code | Description | Source |
|---|---|---|
| `MAINTENANCE_REFUND` | Refund of over-collected maintenance | Admin-initiated via Razorpay Refund API |
| `DEPOSIT_REFUND` | Return of security/advance deposit | Admin-recorded offline |
| `VENDOR_PAYMENT` | Payment to external vendor (plumber, electrician, etc.) | Admin-recorded offline |
| `LEVY_REFUND` | Refund of a special levy if project cancelled | Admin-initiated |
| `OTHER_OUTFLOW` | Miscellaneous disbursement | Admin-recorded |

> Outflow entries do not result in a platform-initiated bank debit. They are **Admin-recorded journal entries** reflecting actual offline bank transactions, providing a complete double-entry-style ledger for the audit.

---

### 15.3 Society Annual Audit Report — PDF Document Structure

The PDF is rendered by Puppeteer from a Handlebars HTML template (`society-audit.template.html`) and must contain the following pages/sections in order:

```
┌─────────────────────────────────────────────────────────────────────┐
│  PAGE 1: Cover Page                                                  │
│  ● Society name, address, registration number                        │
│  ● Financial Year (e.g. "April 1, 2025 – March 31, 2026")           │
│  ● Report generated at: <ISO timestamp IST>                          │
│  ● Report version: v{n}   Status: PUBLISHED / DRAFT                 │
│  ● SHA-256 Checksum: {hex}  (for offline tamper verification)        │
│  ● Admin who published: {name}  Published at: {timestamp}            │
└─────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────┐
│  PAGE 2: Executive Financial Summary                                 │
│  ● Total Inflows:   ₹ X,XX,XXX.XX                                   │
│  ● Total Outflows:  ₹ X,XX,XXX.XX                                   │
│  ● Net Balance:     ₹ X,XX,XXX.XX                                   │
│  ● Outstanding Dues as at March 31: ₹ X,XX,XXX.XX                  │
│  ● Total Refunds Issued: ₹ X,XX,XXX.XX                              │
│  ● Collection Efficiency: XX% (collected / total billed)            │
└─────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────┐
│  SECTION A: Month-Wise Inflow Table (12 rows)                        │
│  Columns: Month | Billed | Collected | Late Fees | Other | Total    │
└─────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────┐
│  SECTION B: Month-Wise Outflow Table (12 rows)                       │
│  Columns: Month | Refunds | Vendor Payments | Other | Total         │
└─────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────┐
│  SECTION C: Flat-Wise Collection Summary                             │
│  Columns: Wing | Flat | Owner Name | Billed | Paid | Outstanding    │
│  Sorted by Wing → Flat number ascending                              │
│  Flats with outstanding > 0 highlighted in amber                    │
└─────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────┐
│  SECTION D: All Refunds Issued                                       │
│  Columns: Date | Flat | Owner | Amount | Mode | Razorpay Refund ID  │
└─────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────┐
│  SECTION E: Full Transaction Ledger (Appendix)                       │
│  Columns: Date | Flat | Type | Category | Mode | Amount | Direction │
│            | Reference ID | Recorded By                              │
│  Sorted by date ascending; paginated (max 50 rows/page)             │
│  Inflow rows: white background; Outflow rows: light-grey background  │
└─────────────────────────────────────────────────────────────────────┘
```

---

### 15.4 Owner Annual Payment Statement — PDF Document Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│  PAGE 1: Header                                                      │
│  ● Owner name, flat number, society name                             │
│  ● Financial Year                                                    │
│  ● Generated at: <ISO timestamp IST>                                 │
│  ● SHA-256 Checksum                                                  │
└─────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────┐
│  Summary: Total Paid | Total Outstanding | Total Refunds Received   │
└─────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────┐
│  Itemised Payment Table                                              │
│  Columns: Date | Invoice # | Category | Amount | Mode | Status      │
│            | Razorpay Payment ID / Offline Reference                 │
└─────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────┐
│  Refunds Received Table                                              │
│  Columns: Date | Amount | Mode | Razorpay Refund ID                 │
└─────────────────────────────────────────────────────────────────────┘
```

---

### 15.5 PDF Generation Workflow

#### 15.5.1 Society Annual Audit — Scheduled Auto-Generation (April 1)

```
00:01 IST, April 1
       │
       ▼
BullMQ Cron Scheduler (admin-service)
  Creates one  audit-report:generate  job per active society
       │
       ▼
audit-generate.processor.ts  (BullMQ worker; max 2 concurrent)
  │
  ├── 1. Create AuditReport DB record
  │         { societyId, financialYear, reportType: SOCIETY_ANNUAL,
  │           status: GENERATING, version: nextVersion,
  │           isAutoGenerated: true }
  │
  ├── 2. Aggregate transaction data from PostgreSQL
  │         SELECT all payments WHERE societyId AND
  │         createdAt BETWEEN periodStart AND periodEnd
  │         GROUP BY month, flat, category, direction
  │
  ├── 3. Render HTML template via Handlebars
  │         handlebars.compile(template)({ society, inflows, outflows,
  │                                        flatSummaries, ledger, ... })
  │
  ├── 4. Launch Puppeteer → generate PDF buffer
  │         const browser = await puppeteer.launch({ headless: true,
  │           args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  │         const page = await browser.newPage();
  │         await page.setContent(html, { waitUntil: 'networkidle0' });
  │         const pdfBuffer = await page.pdf({
  │           format: 'A4', printBackground: true,
  │           margin: { top:'20mm', bottom:'20mm',
  │                     left:'15mm', right:'15mm' } });
  │
  ├── 5. Compute SHA-256 checksum of pdfBuffer
  │         const checksum = createHash('sha256')
  │                            .update(pdfBuffer).digest('hex');
  │
  ├── 6. Upload to S3
  │         s3.putObject({
  │           Bucket: AUDIT_BUCKET,
  │           Key: s3Key,
  │           Body: pdfBuffer,
  │           ContentType: 'application/pdf',
  │           ServerSideEncryption: 'aws:kms',
  │           Metadata: { checksum, societyId, financialYear } })
  │
  └── 7. Update AuditReport record
           { status: DRAFT, s3Key, checksum, summary: { ... } }
       │
       ▼
Admin receives push notification:
  "FY 2025-2026 audit report draft is ready for review."
```

#### 15.5.2 Admin Review & Publish Flow

```
Admin opens audit report in Admin App / Web Dashboard
       │
       ▼
GET /payments/audit-reports/:id
  Returns: metadata + pre-signed S3 URL (1 h expiry) for PDF preview
       │
       ▼
Admin reviews PDF in browser / app PDF viewer
       │
       ├─ [Approved] ──► PATCH /payments/audit-reports/:id/publish
       │                   { status: PUBLISHED, publishedById, publishedAt }
       │                   Enqueues:  audit-report:notify  job
       │                       └──► Push notification to all owners:
       │                             "FY 2025-2026 annual report is available."
       │
       └─ [Needs correction] ──► POST /payments/audit-reports/generate
                                   (creates new version; old version → ARCHIVED)
```

#### 15.5.3 Owner On-Demand Statement Flow

```
Owner selects "Download FY 2025-2026 Statement" in Owner App
       │
       ▼
GET /payments/audit-reports/owner/statement?financialYear=2025-2026
       │
  ├── [≤ 12 transactions] ──► Synchronous: generate PDF inline
  │                            Return pre-signed URL in response body
  │
  └── [> 12 transactions] ──► Enqueue  audit-report:owner-statement  job
                               Return { jobId, status: "PENDING" }
                                       │
                               Client polls:
                               GET /payments/audit-reports/:id/status
                               until status = DRAFT → return download URL
```

---

### 15.6 NestJS Implementation Sketch

```typescript
// backend/admin-service/src/audit/audit.service.ts
@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditReport)
    private readonly auditRepo: Repository<AuditReport>,
    @InjectQueue('audit-report:generate')
    private readonly generateQueue: Queue,
    private readonly s3Service: S3Service,
  ) {}

  /** Called by cron scheduler every April 1 for all active societies */
  async scheduleAnnualGeneration(societyId: string, financialYear: string): Promise<AuditReport> {
    const version = await this.nextVersion(societyId, financialYear, AuditReportType.SOCIETY_ANNUAL);
    const report = await this.auditRepo.save({
      societyId,
      financialYear,
      periodStart: `${financialYear.split('-')[0]}-04-01`,
      periodEnd:   `${financialYear.split('-')[1]}-03-31`,
      reportType:  AuditReportType.SOCIETY_ANNUAL,
      status:      AuditReportStatus.PENDING,
      version,
      isAutoGenerated: true,
    });
    await this.generateQueue.add('generate', { reportId: report.id }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 30_000 },
    });
    return report;
  }

  /** Returns pre-signed URL; enforces role-based access */
  async getDownloadUrl(reportId: string, requestingUserId: string,
                        requestingRole: UserRole): Promise<string> {
    const report = await this.auditRepo.findOneOrFail({ where: { id: reportId } });
    if (report.status !== AuditReportStatus.PUBLISHED
        && requestingRole === UserRole.OWNER) {
      throw new ForbiddenException('Report not yet published');
    }
    return this.s3Service.getPresignedUrl(report.s3Key, 3600); // 1 h expiry
  }

  async publishReport(reportId: string, adminId: string): Promise<AuditReport> {
    const report = await this.auditRepo.findOneOrFail({ where: { id: reportId } });
    if (report.status !== AuditReportStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT reports can be published');
    }
    return this.auditRepo.save({
      ...report,
      status:      AuditReportStatus.PUBLISHED,
      publishedById: adminId,
      publishedAt: new Date(),
    });
  }

  private async nextVersion(societyId: string, financialYear: string,
                             reportType: AuditReportType): Promise<number> {
    const latest = await this.auditRepo.findOne({
      where: { societyId, financialYear, reportType },
      order: { version: 'DESC' },
    });
    return (latest?.version ?? 0) + 1;
  }
}
```

```typescript
// backend/admin-service/src/audit/processors/audit-generate.processor.ts
@Processor('audit-report:generate')
export class AuditGenerateProcessor {
  constructor(
    private readonly auditRepo:    Repository<AuditReport>,
    private readonly pdfService:   PdfService,
    private readonly s3Service:    S3Service,
    private readonly paymentsRepo: Repository<Payment>,
  ) {}

  @Process('generate')
  async handle(job: Job<{ reportId: string }>): Promise<void> {
    const report = await this.auditRepo.findOneOrFail(
      { where: { id: job.data.reportId } });

    await this.auditRepo.update(report.id, { status: AuditReportStatus.GENERATING });

    // 1. Aggregate inflows and outflows from the payments table
    const transactions = await this.paymentsRepo.find({
      where: {
        societyId: report.societyId,
        status:    PaymentStatus.SUCCESS,
        createdAt: Between(new Date(report.periodStart), new Date(report.periodEnd)),
      },
      relations: ['flat', 'flat.wing'],
      order: { createdAt: 'ASC' },
    });

    // 2. Build template data model (inflows, outflows, summaries)
    const templateData = this.pdfService.buildAuditTemplateData(report, transactions);

    // 3. Render PDF buffer via Puppeteer
    const pdfBuffer = await this.pdfService.renderPdf(
      'society-audit.template.html', templateData);

    // 4. SHA-256 checksum
    const checksum = createHash('sha256').update(pdfBuffer).digest('hex');

    // 5. Upload to S3 (server-side KMS encryption)
    const s3Key = `audit-reports/${report.societyId}/${report.financialYear}`
                + `/SOCIETY_ANNUAL/v${report.version}.pdf`;
    await this.s3Service.upload(s3Key, pdfBuffer, 'application/pdf', checksum);

    // 6. Persist metadata
    await this.auditRepo.update(report.id, {
      status:   AuditReportStatus.DRAFT,
      s3Key,
      checksum,
      summary:  templateData.summary,
    });
  }
}
```

---

### 15.7 PDF Storage & Retention Policy

| Aspect | Specification |
|---|---|
| **S3 Bucket** | Dedicated `society-audit-reports` bucket; public access blocked |
| **Encryption** | Server-side encryption with AWS KMS (`aws:kms`); society-specific KMS key |
| **Access** | Pre-signed URLs only (max 1 h expiry); bucket policy denies all `s3:GetObject` without pre-signed auth |
| **Lifecycle — Standard tier** | 0–12 months after `createdAt`: S3 Standard (fast retrieval for AGM season) |
| **Lifecycle — Archive tier** | 12 months+: auto-transition to S3 Glacier Instant Retrieval |
| **Minimum retention** | 7 years (mandatory for financial records under Indian company law) |
| **Immutability** | Published reports are write-protected via S3 Object Lock (COMPLIANCE mode, 7-year retention); `ARCHIVED` versions are retained but flagged read-only in DB |
| **Versioning** | S3 bucket versioning enabled; each regeneration writes a new object key (`v1.pdf`, `v2.pdf`, …) |

---

### 15.8 Access Control Matrix

| Action | Owner | Accountant | Admin | Super Admin |
|---|---|---|---|---|
| View own payment statement | ✅ Own FY only | ❌ | ✅ | ✅ |
| Download own payment statement PDF | ✅ | ❌ | ✅ | ✅ |
| View society audit report (draft) | ❌ | ✅ | ✅ | ✅ |
| View society audit report (published) | ✅ | ✅ | ✅ | ✅ |
| Trigger on-demand report generation | ❌ | ❌ | ✅ | ✅ |
| Publish a draft report | ❌ | ❌ | ✅ | ✅ |
| Archive / supersede a report | ❌ | ❌ | ✅ | ✅ |
| View reports for all societies | ❌ | ❌ | ❌ | ✅ |

---

### 15.9 Tamper Verification

Owners and external auditors can independently verify the integrity of a published PDF without accessing the system:

1. Download the PDF from the system (or receive it via email attachment).
2. Compute `SHA-256(file)` using any standard tool (e.g. `sha256sum report.pdf` on Linux/macOS, `Get-FileHash` on Windows, or any online SHA-256 calculator).
3. Compare the result against the `checksum` value printed on the cover page of the PDF **and** the value stored in the `audit_reports` table (queryable by Admins via `GET /payments/audit-reports/:id`).
4. A mismatch means the PDF was modified after generation and should be considered invalid.

---

## 16. Database Management with AdminJS

### 16.1 Overview

AdminJS (`adminjs` v7.x) is an open-source, auto-generated React admin panel for Node.js applications. It integrates directly with the existing NestJS + TypeORM stack via `@adminjs/nestjs` and `@adminjs/typeorm`, requiring no separate frontend application. The panel is served as a protected sub-route on each backend service.

| Panel Instance | Service | Route | Audience |
|---|---|---|---|
| **Super Admin Panel** | `super-admin-service` | `https://admin.yoursociety.app/superadmin` | Platform Super Admins only |
| **Society Admin Panel** | `admin-service` | `https://admin.yoursociety.app/panel` | Society Admins and Accountants |

Both panels share the same underlying pattern: `@adminjs/nestjs` wraps AdminJS into a NestJS `AdminModule`, and `@adminjs/typeorm` exposes TypeORM entities as AdminJS **Resources** (tables with full CRUD, filtering, sorting, and search).

---

### 16.2 Package Dependencies

```
# Added to super-admin-service/package.json and admin-service/package.json
adminjs                    # core admin panel engine
@adminjs/nestjs            # NestJS adapter (AdminModule)
@adminjs/typeorm           # TypeORM resource adapter
@adminjs/express           # Express/Connect plugin (used internally by @adminjs/nestjs)
```

---

### 16.3 Role-Based Resource Access

Each panel exposes a different scope of TypeORM entities, enforced via AdminJS's `canInvokeAction` hooks and NestJS authentication middleware.

#### 16.3.1 Super Admin Panel Resources

| Resource | Allowed Actions | Notes |
|---|---|---|
| **Society** | List, Show, Create, Edit, Delete | Full CRUD; can disable/suspend a society |
| **User** | List, Show, Edit | No Delete (GDPR soft-delete via custom action); `phone_encrypted` displayed via custom `PhoneDisplay` component |
| **Flat** | List, Show, Edit | Read + limited edit (e.g. flat type, wing) |
| **Payment** | List, Show | Read-only; filter by society, FY, status |
| **AuditReport** | List, Show, Edit (status only) | Can publish/archive cross-society reports |
| **FeatureFlag** | List, Show, Edit | Toggle feature flags per society |
| **SocietyBankAccount** | List, Show, Edit (status), Custom: Verify | Account number shown masked (last 4 digits); `accountNumberEncrypted` hidden; full Razorpay IDs visible; Super Admin can manually trigger verification |
| **FlatRental** | List, Show | All societies; filter by status, flat, society; phone + PAN masked via custom components |
| **TenantProfile** | List, Show | `panEncrypted` + `tenantPhoneEncrypted` hidden; masked last-4 shown; `new`/`edit`/`delete` disabled |
| **CommonFacility** | List, Show, Create, Edit | Full CRUD across all societies; pricing model editable; `photoS3Keys` hidden (view via pre-signed link); blackout management via embedded sub-table |
| **FacilityBooking** | List, Show, Custom: Approve, Custom: Reject, Custom: Cancel | Cross-society; filter by society, facility, status, date; `BookingStatusBadge` component; Admin-cancel triggers full refund |
| **VendorProfile** | List, Show, Edit (status) | Cross-society; masked phone by default; `phoneEncrypted` hidden; Custom: Reveal Phone (writes `AdminAuditLog`); document list shown with download links |
| **SocietyEvent** | List, Show, Create, Edit, Custom: Pin, Custom: Remove | Cross-society; filter by society, status, eventType, date; `EventStatusBadge` component; RSVP count shown; Pin action enforces single-pin-per-society; Remove requires reason |
| **EventMedia** | List, Show, Custom: Remove | Cross-society; thumbnail previewed inline; filter by event, mediaType, status; Remove action soft-deletes with moderationReason |
| **MediaAsset** | List, Show, Custom: Invalidate Cache | Cross-society; filter by `contextType`, society, `status`, upload date; shows `originalWidth × originalHeight`, file size, variant count; Custom: **Invalidate Cache** purges CloudFront paths + clears `variants` JSONB; `new`/`edit`/`delete` disabled (managed via module-specific upload flows); `GET /media/admin/stats` widget visible on Super Admin dashboard |

#### 16.3.2 Society Admin Panel Resources

| Resource | Allowed Actions | Notes |
|---|---|---|
| **Flat** | List, Show, Edit | Scoped to own `societyId` via `before` hook |
| **User** | List, Show | Read-only; `phone_encrypted` via `PhoneDisplay`; no Edit of phone |
| **VisitorLog** | List, Show | Filterable by date, flat, gate |
| **Payment** | List, Show | Read-only; own society only |
| **AuditReport** | List, Show, Edit (status) | Own society; can publish/archive |
| **Maintenance** | List, Show, Edit | Create/edit maintenance records |
| **SocietyBankAccount** | List, Show, Custom: Verify, Custom: Set Primary | Account number masked; `accountNumberEncrypted` property hidden; status badge coloured by verification state; `new` and `delete` actions disabled (use the main API); `edit` disabled — changes must go through the API to re-trigger verification |
| **FlatRental** | List, Show, Custom: Download Document | Scoped to own society; filter by flat, status, date; phone + PAN masked; document download link via custom action that calls `/rentals/:id/documents/:docId/download-url` |
| **TenantProfile** | List, Show | Scoped to own society; `panEncrypted`/`tenantPhoneEncrypted` hidden; `panLast4` + masked phone shown; `new`/`edit`/`delete` disabled |
| **CommonFacility** | List, Show, Create, Edit, Custom: Add Blackout | Scoped to own society; photo S3 keys shown as download links; pricing schedule editable; `delete` disabled — use status `INACTIVE` |
| **FacilityBooking** | List, Show, Custom: Approve, Custom: Reject, Custom: Cancel | Scoped to own society; `BookingStatusBadge` component; Approve action creates Razorpay order; Cancel action triggers refund per policy (or full refund if Admin-initiated) |
| **VendorProfile** | List, Show, Create, Edit, Custom: Toggle Status | Scoped to own society; masked phone; Custom: Reveal Phone (writes `AdminAuditLog`); document upload via pre-signed URL; `delete` action disabled — soft-delete only via Status toggle |
| **SocietyEvent** | List, Show, Create, Edit, Custom: Pin, Custom: Remove | Scoped to own society; `EventStatusBadge` component; Create supports `createdByRole = ADMIN` (Official badge); Pin is single-per-society; Remove requires reason and notifies organiser |
| **EventMedia** | List, Show, Custom: Remove | Scoped to own society; thumbnail previewed inline; Remove action sets `status = REMOVED` with `moderationReason`; organiser notified on removal |
| **MediaAsset** | List, Show, Custom: Invalidate Cache | Scoped to own society; filter by `contextType` and `status`; shows image preview (thumbnail via `/media/images/:id?size=thumbnail`), dimensions, file size, variant count; Custom: Invalidate Cache visible only to Admins; `new`/`edit`/`delete` disabled |

> **Multi-tenancy enforcement:** Every resource in the Society Admin Panel applies a `before('list')` and `before('search')` hook that appends `WHERE society_id = :societyId` using the authenticated admin's `societyId` claim from their JWT. This prevents cross-tenant data leakage at the AdminJS layer in addition to the TypeORM Subscriber guard already in place.

---

### 16.4 NestJS Integration Sketch

#### 16.4.1 Super Admin Panel (`super-admin-service`)

```typescript
// backend/super-admin-service/src/adminjs/adminjs.module.ts
import { AdminModule } from '@adminjs/nestjs';
import { Database, Resource } from '@adminjs/typeorm';
import AdminJS from 'adminjs';

AdminJS.registerAdapter({ Database, Resource });

@Module({
  imports: [
    AdminModule.createAdminAsync({
      useFactory: (configService: ConfigService) => ({
        adminJsOptions: {
          rootPath: '/superadmin',
          branding: {
            companyName: 'My Society — Super Admin',
            favicon: '/favicon.ico',
          },
          resources: [
            SocietyResource,
            UserResource,
            FlatResource,
            PaymentResource,
            AuditReportResource,
            FeatureFlagResource,
          ],
          dashboard: {
            component: AdminJS.bundle('./dashboard/dashboard.component'),
          },
        },
        auth: {
          authenticate: async (email, password) => {
            // Validate against super_admin table; require TOTP as second factor
            return superAdminAuthService.validateCredentials(email, password);
          },
          cookieName: 'adminjs-superadmin',
          cookiePassword: configService.get('ADMINJS_COOKIE_SECRET'),
        },
        sessionOptions: {
          resave: false,
          saveUninitialized: true,
          secret: configService.get('ADMINJS_SESSION_SECRET'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AdminJSModule {}
```

#### 16.4.2 Resource Definition with Tenant Scoping (`admin-service`)

```typescript
// backend/admin-service/src/adminjs/resources/payment.resource.ts
import { ResourceWithOptions } from 'adminjs';
import { Payment } from '../../payments/payment.entity';

export const PaymentResource: ResourceWithOptions = {
  resource: Payment,
  options: {
    actions: {
      new:    { isAccessible: false },   // Payments are never manually created
      delete: { isAccessible: false },   // No deletion allowed
      edit:   { isAccessible: false },   // Payments are immutable records
      list: {
        before: async (request, context) => {
          // Append societyId filter from authenticated admin's JWT
          const { currentAdmin } = context;
          request.query = {
            ...request.query,
            'filters.societyId': currentAdmin.societyId,
          };
          return request;
        },
      },
    },
    properties: {
      razorpaySignature: { isVisible: false },   // Never expose signature
      phoneEncrypted:    { isVisible: false },   // Never expose raw ciphertext
    },
    sort: { sortBy: 'createdAt', direction: 'desc' },
  },
};
```

---

### 16.5 Custom Component — Encrypted Phone Display

The `phone_encrypted` column must never be rendered as raw ciphertext in the admin panel. A custom React component decrypts the value on the **server side** via a before-hook, then renders the plaintext only in the authorised admin session.

```typescript
// backend/admin-service/src/adminjs/resources/user.resource.ts
import { ResourceWithOptions } from 'adminjs';
import AdminJS from 'adminjs';
import { User } from '../../users/user.entity';

export const UserResource: ResourceWithOptions = {
  resource: User,
  options: {
    properties: {
      phoneEncrypted: {
        isVisible: { list: true, show: true, edit: false, filter: false },
        // Replace raw ciphertext display with custom decrypted component
        components: {
          list: AdminJS.bundle('../components/PhoneDisplay'),
          show: AdminJS.bundle('../components/PhoneDisplay'),
        },
      },
      phoneHash: { isVisible: false },  // Never expose hash to UI
    },
    actions: {
      show: {
        before: async (request, context) => {
          // Server-side: decrypt phone before passing to React component
          const { record, currentAdmin } = context;
          if (record && record.params.phoneEncrypted) {
            const plain = await phoneCryptoService.decrypt(
              record.params.phoneEncrypted,
            );
            record.params.phoneDecrypted = plain; // injected for component
            record.params.phoneEncrypted = '***'; // masked in raw params
          }
          return request;
        },
      },
    },
  },
};
```

```tsx
// backend/admin-service/src/adminjs/components/PhoneDisplay.tsx
import React from 'react';
import { ShowPropertyProps } from 'adminjs';

const PhoneDisplay: React.FC<ShowPropertyProps> = ({ record }) => {
  const phone = record?.params?.phoneDecrypted ?? '••••••••••';
  return <span style={{ fontFamily: 'monospace' }}>{phone}</span>;
};

export default PhoneDisplay;
```

---

### 16.6 Super Admin Dashboard Widgets

The Super Admin Panel includes a custom dashboard page (`dashboard.component.tsx`) with the following real-time widgets, populated via AdminJS API calls to the service's own REST endpoints:

| Widget | Data Source | Refresh |
|---|---|---|
| **Total Societies** | `COUNT(*) FROM societies WHERE status = 'ACTIVE'` | On load |
| **Total Users** | `COUNT(*) FROM users WHERE deleted_at IS NULL` | On load |
| **Monthly Revenue** | `SUM(amount) FROM payments WHERE status = 'SUCCESS' AND month = current` | On load |
| **Pending Audit Reports** | `COUNT(*) FROM audit_reports WHERE status = 'DRAFT'` | On load |
| **Failed Jobs (BullMQ)** | BullMQ `getFailedCount()` across all queues | 30-second poll |
| **Active Feature Flags** | `COUNT(*) FROM feature_flags WHERE enabled = true` | On load |

---

### 16.7 Authentication & Security

| Concern | Specification |
|---|---|
| **Super Admin auth** | Email + password + TOTP (Google Authenticator). `authenticate()` callback verifies both factors before granting session |
| **Society Admin auth** | JWT issued by the main API Gateway; AdminJS session piggybacks on same JWT claims (validated in `authenticate()` callback) |
| **Session storage** | Express-session backed by Redis (same Redis instance as BullMQ); session TTL 8 hours |
| **Cookie** | `HttpOnly`, `Secure`, `SameSite=Strict`; cookie secret stored in AWS Secrets Manager |
| **Route protection** | The AdminJS route (`/superadmin`, `/panel`) is protected by NestJS `AdminModule` auth; no endpoint is reachable without a valid session |
| **IP allow-listing** | Admin routes are exposed only on an internal VPC Load Balancer in production; VPN required for access |
| **Audit logging** | Every AdminJS action (create, edit, delete, custom) is intercepted via a global `after()` hook that writes a structured log to the `admin_audit_logs` table: `{ adminId, action, resource, recordId, changedFields, ip, timestamp }` |

---

### 16.8 AdminJS Audit Log Entity

All admin panel actions are persisted to a dedicated table for compliance:

```typescript
// Shared entity used by both admin-service and super-admin-service
@Entity('admin_audit_logs')
export class AdminAuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  adminId: string;          // ID of the admin who performed the action

  @Column()
  adminEmail: string;

  @Column()
  action: string;           // 'new' | 'edit' | 'delete' | 'bulkDelete' | custom

  @Column()
  resource: string;         // Entity name (e.g. 'Society', 'Payment')

  @Column({ type: 'uuid', nullable: true })
  recordId: string;         // PK of the affected record

  @Column({ type: 'jsonb', nullable: true })
  changedFields: Record<string, { from: unknown; to: unknown }>;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  @CreateDateColumn()
  createdAt: Date;
}
```

---

### 16.9 Restricting Destructive Operations

AdminJS exposes powerful CRUD actions by default. The following restrictions are enforced globally across both panels:

| Operation | Rule |
|---|---|
| **Delete (any entity)** | Disabled entirely via `isAccessible: false`; use a custom `Soft-Delete` action that sets `deleted_at` instead |
| **Bulk Delete** | Disabled on all resources |
| **Edit `societyId`** | Property `isEditable: false` on all resources to prevent tenant reassignment |
| **Edit payment records** | `edit` and `new` actions disabled on `Payment` resource |
| **Export CSV** | Disabled by default; Super Admin may enable for specific resources via feature flag |
| **New Society** | Allowed only in Super Admin Panel; triggers provisioning workflow (creates schema partition, sets up KMS key) |


---

*End of Document — Society Management and Logging System PRD v1.0.0*
