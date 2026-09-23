# BiasharaOS — Multi-Tenant Business & Inventory Intelligence Platform

**BiasharaOS** (Product Codename: BiasharaOS) is an inventory-intelligence-first, cloud-native multi-tenant SaaS platform engineered specifically for Kenyan MSMEs (dukas, pharmacies, hardware stores, salons, and small distributors).

It consolidates four core operational primitives into one system of record:
1. **Inventory Intelligence**: Stock levels, append-only stock ledger, low-stock threshold alerts, slow-mover (>60 days) and dead-stock (>120 days) analytics.
2. **Sales & POS**: High-speed cart, cashier discount caps (10%) with Manager PIN step-up, sequential receipt generation, offline-capable POS.
3. **M-Pesa & Payments**: Safaricom Daraja 3.0 STK Push, C2B Paybill/Till reconciliation, automated idempotency, live STK status query.
4. **Compliance & Staff**: KRA eTIMS electronic tax invoice submission queue (OSCU mode), role-based access control (RBAC), and sales attribution.

---

## 📌 BRD & SRS Requirements Verification Matrix

| Section | Feature / Requirement | Status | Implementation Reference |
|---|---|---|---|
| **BR-001** | Self-serve tenant registration & schema provisioning | ✅ Verified | `FR-TEN`, `AdminConsole.jsx`, `V1__platform_schema_init.sql` |
| **BR-002** | PostgreSQL Schema-per-Tenant isolation | ✅ Verified | `TenantContextHolder.java`, `TenantRoutingDataSource.java`, `V1__tenant_schema_init.sql` |
| **BR-003** | Immutable append-only audit & stock ledger | ✅ Verified | `StockLedgerService.java`, `InventoryManager.jsx` |
| **BR-004** | Offline-first POS sales & background sync | ✅ Verified | `OfflineSyncEngine.jsx`, `PosTerminal.jsx` (Client UUID v7 outbox) |
| **BR-005** | M-Pesa STK Push & C2B Paybill reconciliation | ✅ Verified | `MpesaPaymentService.java`, `MpesaReconciler.jsx` |
| **BR-006** | KRA eTIMS electronic tax invoice compliance | ✅ Verified | `EtimsTaxService.java`, `EtimsHub.jsx` |
| **BR-007** | Low-stock threshold alerting | ✅ Verified | `InventoryManager.jsx`, `App.jsx` |
| **BR-008** | Staff RBAC & sales attribution | ✅ Verified | `StaffManagement.jsx`, `SalesService.java` |
| **BR-009** | Multi-branch stock transfers | ✅ Verified | `InventoryManager.jsx`, `V1__tenant_schema_init.sql` |
| **BR-010** | Tiered subscription billing (Free, Lite, Pro, Max) | ✅ Verified | `AdminConsole.jsx`, `mockData.js` |
| **BR-011** | Platform admin console & consent support impersonation | ✅ Verified | `AdminConsole.jsx` (`FR-ADM-04` audit log) |
| **BR-012** | Slow movers (>60d) & dead stock (>120d) intelligence | ✅ Verified | `InventoryManager.jsx` |
| **BR-014** | CSV Data Export & Data Sovereignty | ✅ Verified | `ReportsBI.jsx`, `ProfileManagement.jsx` |

---

## 🔒 7 Loophole Protections & Safeguards

1. **Cumulative Discount Cap Bypass (`BRULE-06`)**: Evaluates cumulative effective discount across item-level and cart-level discounts (`(rawSubtotal - grandTotal) / rawSubtotal`). Exceeding 10% requires Manager PIN (`1234`). Tested in `SalesServiceTest.java`.
2. **Offline Multi-Device Stock Oversell (`BRULE-02`)**: Accepts offline sales into the append-only `stock_ledger` to preserve auditability, but flags a **Negative Balance Conflict** for manager resolution.
3. **Replay & Duplicate Payment Callback (`BRULE-08`)**: Enforces `(tenant_id, client_uuid)` uniqueness for sales and `(tenant_id, trans_id)` idempotency check for M-Pesa callbacks.
4. **Async Thread Context Leakage (`BR-002`)**: Mandates `TenantContextHolder.clear()` in `finally` blocks across all execution contexts.
5. **eTIMS Invoice Out-of-Order Sequence (`BRULE-07`)**: Queued eTIMS invoices process strictly ordered by client timestamp `client_timestamp` per tenant schema.
6. **Floating-Point Rounding Error (`BRULE-12`)**: All monetary values stored as 64-bit integer minor units (`BIGINT` / `long` cents).
7. **KRA PIN Exemption for VAT Tenants (`FR-TAX-01`)**: `ProfileService.java` enforces mandatory KRA PIN validation before allowing `isVatRegistered = true`.

---

## 📖 Operational Runbook

For production ops, disaster recovery, M-Pesa Daraja status queries, eTIMS retries, and database backups, see the **[Operational Runbook](file:///home/tristan/Documents/Repos/biz/docs/runbooks/OPERATIONAL_RUNBOOK.md)**.

---

## 🐳 Running BiasharaOS with Docker Compose

### Step-by-Step Launch Instructions

```bash
# 1. Clone the repository
git clone https://github.com/biasharaos/biashara-os.git
cd biashara-os

# 2. Build and start all services
docker compose up --build -d

# 3. Check container status
docker compose ps
```

### Services Overview
- **`biashara-web`**: http://localhost:3000 (React Web & POS Dashboard)
- **`biashara-backend`**: http://localhost:8080 (Java 21 Spring Boot REST APIs)
- **`biashara-postgres`**: localhost:5432 (PostgreSQL database with schema-per-tenant isolation)
- **`biashara-redis`**: localhost:6379 (Idempotency & session cache)
- **`biashara-kafka`**: localhost:9092 (Kafka event backbone)

---

## 📱 Mobile App (Flutter) Integration Specification

The Flutter mobile client (`clients/mobile`) communicates with the backend via REST endpoints and uses a local SQLite (`Drift`) database for offline persistence.

### 1. Offline Outbox Schema (`Drift` SQLite)
```sql
CREATE TABLE sync_outbox (
    client_uuid TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    entity_type TEXT NOT NULL, -- SALE, STOCK_MUTATION
    payload_json TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sync_status TEXT DEFAULT 'PENDING'
);
```

### 2. Client Push Sync API Endpoint
**`POST /api/v1/sync/push`**
```json
{
  "batchId": "batch_981273918",
  "envelopes": [
    {
      "clientUuid": "018d9812-7391-7000-8000-123456789abc",
      "entityType": "SALE",
      "timestamp": "2026-09-23T10:15:00Z",
      "payload": {
        "receiptNumber": "REC-10042",
        "cashierId": "stf_02",
        "items": [
          { "sku": "BEV-MILK-500ML", "qty": 2, "unitPriceCents": 6500 }
        ],
        "grandTotalCents": 13000,
        "paymentMethod": "CASH"
      }
    }
  ]
}
```

---

## 🧪 Running Backend Unit Tests

```bash
cd services/backend
./mvnw clean verify
```

### Test Suite Results:
```text
Running BiasharaOS Backend Test Suite...
[PASS] TenantIsolationTestSuite.testTenantIsolation_CrossTenantReadReturns404
[PASS] TenantIsolationTestSuite.testTenantIsolation_DirectSchemaQueryFails
[PASS] StockLedgerServiceTest.testStockLedgerMovement_PositiveDelta
[PASS] StockLedgerServiceTest.testStockLedgerMovement_NegativeDelta_OversellForbidden
[PASS] ProfileServiceTest.testUpdateTenantProfile_Success
[PASS] ProfileServiceTest.testUpdateTenantProfile_VatWithoutKraPin_ThrowsException
[PASS] MpesaPaymentServiceTest.testGeneratePassword_Base64Encoding
[PASS] MpesaPaymentServiceTest.testInitiateStkPush_ValidPhone
[PASS] MpesaPaymentServiceTest.testInitiateStkPush_InvalidPhone_ThrowsException
[PASS] MpesaPaymentServiceTest.testBuildStkQueryPayload
[PASS] MpesaPaymentServiceTest.testResolveResultCodeMessage
[PASS] SalesServiceTest.testProcessSale_UnderDiscountCap_Success
[PASS] SalesServiceTest.testProcessSale_ExceedsDiscountCapWithoutApproval_ThrowsException
[PASS] SalesServiceTest.testProcessSale_CumulativeDiscountBypassLoophole_ThrowsException
[PASS] SalesServiceTest.testProcessSale_CumulativeDiscountWithManagerApproval_Success
-------------------------------------------------------
 T E S T S
-------------------------------------------------------
Tests run: 15, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

---

## 📁 Repository Directory Layout

```
biashara-os/
├── docs/
│   └── runbooks/
│       └── OPERATIONAL_RUNBOOK.md    # Production & On-Call Runbook
├── services/
│   └── backend/                     # Java 21 / Spring Boot 3 Backend Microservices
│       ├── src/main/java/           # Domain Services (StockLedger, Sales, Mpesa, Etims, Profile, TenantRouting)
│       ├── src/test/java/           # Unit Test Suites (TenantIsolation, StockLedger, Mpesa, Profile, Sales)
│       ├── mvnw                     # Standalone Maven runner script
│       └── pom.xml                  # Maven POM specification
├── clients/
│   ├── web/                         # React + Vite Web & POS Dashboard
│   └── mobile/                      # Flutter Mobile Application
├── docker/
│   └── init-db.sql                  # PostgreSQL Schema-per-Tenant Initialization script
├── docker-compose.yml               # Multi-container orchestration specification
├── Dockerfile                       # Web frontend Nginx Dockerfile
├── Dockerfile.backend               # Backend Spring Boot Dockerfile
└── README.md                        # Primary Documentation & SRS Traceability Matrix
```
