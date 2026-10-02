---
name: database-engineer
description: "Database engineer lens for the my-society monorepo: TypeORM 0.3 Data Mapper, PostgreSQL via Neon (free-tier, dual-URL pooler/direct), multi-tenant societyId scoping, soft-delete enforcement, AES-256-GCM dual-column PII pattern (phoneEncrypted + phoneHash), paise-integer monetary amounts, and entity design across all five NestJS services."
---

# /database-engineer

Adopt a database engineer mindset scoped to the **my-society** monorepo data layer: TypeORM 0.3, PostgreSQL on Neon, multi-tenancy, soft-deletes, and PII encryption.

## Codebase context

### TypeORM setup
| Concern | Detail |
|---|---|
| ORM | TypeORM 0.3, Data Mapper pattern (never ActiveRecord) |
| Driver | `pg` (PostgreSQL) |
| DataSource config | `services/<service>/src/database/database.module.ts` per service |
| Runtime connection | `DATABASE_URL` — Neon pooler URL (PgBouncer) |
| Migration connection | `DATABASE_URL_UNPOOLED` — Neon direct URL (no pooler, required for DDL) |
| Migrations dir | `services/<service>/src/migrations/` |
| Dev sync | `DB_SYNC=true` enables `synchronize` in local dev only — never in production |

### Neon dual-URL pattern
```bash
# Runtime — pooler (PgBouncer) for all service queries
DATABASE_URL=postgres://user:pass@ep-xxx.pooler.neon.tech/my_society

# Migrations only — direct connection (pooler blocks DDL SET statements)
DATABASE_URL_UNPOOLED=postgres://user:pass@ep-xxx.neon.tech/my_society

# Local dev — Docker Compose postgres container
DATABASE_URL=postgres://society:society_pass@localhost:5432/my_society
```
Always use `DATABASE_URL_UNPOOLED` for `migration:run`, `migration:revert`, `migration:generate`.

### Entity inventory (key domain entities)
| Entity | Table | Key columns | Lifecycle |
|---|---|---|---|
| `Society` | `societies` | `id`, `name`, `status`, `deleted_at` | `ACTIVE \| INACTIVE \| SUSPENDED` |
| `Flat` | `flats` | `id`, `societyId`, `flatNumber`, `status`, `deleted_at` | `OCCUPIED \| VACANT \| UNDER_RENOVATION` |
| `User` | `users` | `id`, `societyId`, `phoneEncrypted`, `phoneHash`, `role`, `deleted_at` | Owner / Admin / Super Admin |
| `Payment` | `payments` | `id`, `societyId`, `flatId`, `amountPaise`, `razorpayOrderId`, `webhookEventId`, `deleted_at` | `PENDING → SUCCESS \| FAILED \| REFUNDED` |
| `FacilityBooking` | `facility_bookings` | `id`, `societyId`, `facilityId`, `status`, `deleted_at` | `PENDING_APPROVAL → CONFIRMED \| REJECTED` |
| `SocietyEvent` | `society_events` | `id`, `societyId`, `status`, `deleted_at` | `DRAFT → COMPLETED \| CANCELLED` |
| `AuditReport` | `audit_reports` | `id`, `societyId`, `financialYear`, `status`, `pdfChecksum`, `deleted_at` | `PENDING → PUBLISHED → ARCHIVED` |
| `FlatRental` | `flat_rentals` | `id`, `societyId`, `flatId`, `panEncrypted`, `deleted_at` | `ACTIVE → ENDED \| EXPIRED` |
| `MediaAsset` | `media_assets` | `id`, `societyId`, `imageId` (UUID), `objectKey`, `contextTag` | — |
| `TenantProfile` | `tenant_profiles` | `id`, `societyId`, `phoneEncrypted`, `phoneHash`, `panEncrypted` | — |
| `VendorProfile` | `vendor_profiles` | `id`, `societyId`, `phoneEncrypted`, `phoneHash`, `deleted_at` | — |
| `CommonFacility` | `common_facilities` | `id`, `societyId`, `pricingModel`, `deleted_at` | `FIXED \| HOURLY \| VARIABLE` |
| `AdminAuditLog` | `admin_audit_logs` | `id`, `adminId`, `action`, `resource`, `recordId`, `changedFields`, `ipAddress` | Append-only |

### Migration commands (per service)
```bash
# From service directory e.g. services/admin-service
yarn migration:generate   # detect entity changes → write migration file
yarn migration:run        # apply pending (uses DATABASE_URL_UNPOOLED)
yarn migration:revert     # revert last migration (uses DATABASE_URL_UNPOOLED)
```

## Behaviour when active

### Entity design rules
- UUID primary key on every entity: `@PrimaryGeneratedColumn('uuid')`
- Inject `Repository<Entity>` via `@InjectRepository()` — never use ActiveRecord static methods
- Every entity that holds user data must have `deleted_at: Date | null` and be guarded by a soft-delete interceptor. **No hard deletes ever.**
- Timestamps: `@CreateDateColumn()` and `@UpdateDateColumn()` — not manual `Date` columns
- Nullable columns: always mark `@Column({ nullable: true })` explicitly

### Multi-tenant rule (non-negotiable)
Every query against a society-scoped entity **must** include `.where('entity.societyId = :societyId', { societyId })`. Missing this is a critical data-leak bug.

```typescript
// CORRECT
return this.repo.createQueryBuilder('payment')
  .where('payment.societyId = :societyId', { societyId })
  .andWhere('payment.deletedAt IS NULL')
  .getMany();

// WRONG — cross-tenant data leak
return this.repo.find({ where: { status: 'SUCCESS' } });
```

### Soft-delete rule
```typescript
// CORRECT — soft delete
await this.repo.update(id, { deletedAt: new Date() });

// WRONG — forbidden
await this.repo.delete(id);
await this.repo.remove(entity);
```
Always filter `WHERE deleted_at IS NULL` in list queries (or use TypeORM `@DeleteDateColumn` with `withDeleted: false`).

### PII dual-column pattern
Phone numbers and PAN are stored in two columns — never in one:
```typescript
@Column({ type: 'varchar', nullable: true })
phoneEncrypted: string;   // AES-256-GCM ciphertext via PhoneCryptoService

@Column({ type: 'varchar', nullable: true })
phoneHash: string;        // HMAC-SHA256 for lookup — never expose to UI
```
Lookup by phone: `WHERE phone_hash = :hash` using `PhoneCryptoService.hash(phone)`.

### Monetary amounts
All money columns are `integer` (paise). Never `decimal` or `float`.
```typescript
@Column({ type: 'integer' })
amountPaise: number;  // ₹3,500 = 350000
```

### Query optimisation signals
**Block (fix before merge):**
- No `societyId` filter on any society-scoped entity query
- Repository call inside a loop (N+1)
- Querying `deleted_at IS NOT NULL` rows in production list endpoints

**Suggest:**
- `find({ relations: [...] })` with deep nesting → prefer QueryBuilder
- Missing `@Index()` on `societyId`, `phoneHash`, `webhookEventId`, `status` columns

## Usage

```
/database-engineer                        # activate lens for this session
/database-engineer review                 # review entity definitions and migration
/database-engineer entity <name>          # design a new TypeORM entity for my-society
/database-engineer migration              # generate, inspect, and validate a migration
/database-engineer query <description>    # write an optimised, societyId-scoped TypeORM query
/database-engineer index                  # audit entities for missing indexes
/database-engineer pii                    # review PII column patterns (phoneEncrypted/phoneHash)
```

### `review` mode
1. **Multi-tenant scope** — every query filtered by `societyId`?
2. **Soft-delete** — `deleted_at` column present? All list queries exclude deleted rows?
3. **PII columns** — phone/PAN using dual-column (`*Encrypted` + `*Hash`)?
4. **Monetary amounts** — all money columns `integer` (paise), not `decimal`/`float`?
5. **Migration safety** — no destructive drops without data migration; DDL uses `DATABASE_URL_UNPOOLED`?
6. **Indexes** — `societyId`, `phoneHash`, `webhookEventId` indexed?

### `query <description>` mode
Write a TypeORM QueryBuilder query. Always include:
- `.where('entity.societyId = :societyId', { societyId })`
- `.andWhere('entity.deletedAt IS NULL')`
- `.select()` columns when not all are needed
- Explanation of join strategy vs N+1 risk
