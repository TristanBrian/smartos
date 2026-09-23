# BiasharaOS — Multi-Tenant Business & Inventory Intelligence Platform

**BiasharaOS** is an inventory-intelligence-first, cloud-native multi-tenant SaaS platform engineered specifically for Kenyan MSMEs (dukas, pharmacies, hardware stores, salons, and small distributors).

It unifies **inventory control (append-only stock ledger)**, **offline POS sales**, **Safaricom M-Pesa payments (STK Push & C2B Paybill reconciliation)**, **staff accountability (RBAC)**, and **KRA eTIMS electronic tax compliance**.

---

## 📌 BRD & SRS Requirements Verification Matrix

| Section | Feature / Requirement | Compliance Status | Implementation Reference |
|---|---|---|---|
| **BR-001** | Self-serve onboarding & OTP verification | ✅ **COMPLETE** | `FR-TEN`, `AdminConsole.jsx`, `V1__platform_schema_init.sql` |
| **BR-002** | Schema-per-tenant data isolation | ✅ **COMPLETE** | `TenantContextHolder.java`, `TenantRoutingDataSource.java`, `V1__tenant_schema_init.sql` |
| **BR-003** | Immutable append-only audit & ledger | ✅ **COMPLETE** | `StockLedgerService.java`, `InventoryManager.jsx` |
| **BR-004** | Offline-first POS sales & background sync | ✅ **COMPLETE** | `OfflineSyncEngine.jsx`, `PosTerminal.jsx` (Client UUID v7 outbox) |
| **BR-005** | M-Pesa STK Push & C2B Paybill reconciliation | ✅ **COMPLETE** | `MpesaPaymentService.java`, `MpesaReconciler.jsx` |
| **BR-006** | KRA eTIMS electronic tax invoice compliance | ✅ **COMPLETE** | `EtimsTaxService.java`, `EtimsHub.jsx` |
| **BR-007** | Low-stock threshold alerting | ✅ **COMPLETE** | `InventoryManager.jsx`, `App.jsx` |
| **BR-008** | Staff RBAC & sales attribution | ✅ **COMPLETE** | `StaffManagement.jsx`, `SalesService.java` |
| **BR-009** | Multi-branch stock transfers | ✅ **COMPLETE** | `InventoryManager.jsx`, `V1__tenant_schema_init.sql` |
| **BR-010** | Tiered subscription billing (Free, Lite, Pro, Max) | ✅ **COMPLETE** | `AdminConsole.jsx`, `mockData.js` |
| **BR-011** | Platform admin console & consent support impersonation | ✅ **COMPLETE** | `AdminConsole.jsx` (`FR-ADM-04` audit log) |
| **BR-012** | Slow movers (>60d) & dead stock (>120d) intelligence | ✅ **COMPLETE** | `InventoryManager.jsx` |
| **BR-014** | CSV Data Export & Data Sovereignty | ✅ **COMPLETE** | `ReportsBI.jsx` |

---

## 🐳 Running BiasharaOS with Docker Compose

### Prerequisites
- [Docker Engine](https://docs.docker.com/get-docker/) (v24.0+)
- [Docker Compose](https://docs.docker.com/compose/) (v2.20+)

### Step-by-Step Launch Instructions

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/biasharaos/biashara-os.git
   cd biashara-os
   ```

2. **Spin Up Full Containerized Stack**:
   Execute Docker Compose to build and start PostgreSQL, Redis, Kafka, Spring Boot backend, and React web dashboard:
   ```bash
   docker compose up --build -d
   ```

3. **Verify Container Health**:
   ```bash
   docker compose ps
   ```
   *Services Started:*
   - `biashara-web`: http://localhost:3000 (React Web & POS Dashboard)
   - `biashara-backend`: http://localhost:8080 (Java 21 Spring Boot REST APIs)
   - `biashara-postgres`: localhost:5432 (PostgreSQL database with schema-per-tenant isolation)
   - `biashara-redis`: localhost:6379 (Idempotency & session cache)
   - `biashara-kafka`: localhost:9092 (Kafka event backbone)

4. **Access the Platform**:
   - Open your browser at **http://localhost:3000**
   - Use the workspace switcher in the header to navigate between **Mama Grace Shop (Nakuru)** and **Aisha Chemist (Nairobi)**.
   - Toggle **Offline Simulator** to test offline POS transactions and background SQLite outbox syncing!

---

## 📱 Mobile App (Flutter) Integration Specification

The mobile client (Flutter Android/iOS) communicates with the backend via REST endpoints and uses a local SQLite (Drift) database for offline persistence.

### 1. Offline Sync Envelope Schema (`Drift` SQLite)
Every transaction completed offline is assigned a time-ordered **UUID v7** as its `client_uuid` and stored in the local `outbox` table:

```sql
CREATE TABLE sync_outbox (
    client_uuid TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    entity_type TEXT NOT NULL, -- SALE, STOCK_MUTATION
    payload_json TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sync_status TEXT DEFAULT 'PENDING' -- PENDING, APPLIED, CONFLICT
);
```

### 2. Client Push Sync API Endpoint
**`POST /api/v1/sync/push`**
- **Headers**:
  ```http
  Authorization: Bearer <JWT_TOKEN>
  X-Tenant-Id: tenant_duka_nakuru
  Content-Type: application/json
  ```
- **Request Body**:
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
- **Response**:
  ```json
  {
    "batchId": "batch_981273918",
    "results": [
      {
        "clientUuid": "018d9812-7391-7000-8000-123456789abc",
        "status": "APPLIED",
        "serverTimestamp": "2026-09-23T10:15:02Z"
      }
    ]
  }
  ```

---

## 🛠️ Local Development (Without Docker)

### Backend (Java 21 + Spring Boot 3)
```bash
# Requires JDK 21 and Maven
mvn clean package
java -jar target/biashara-os-platform-1.0.0-SNAPSHOT.jar
```

### Frontend (React + Vite)
```bash
npm install
npm run dev
```

---

## 📄 Architecture & License

- **Architecture Model**: 4+1 View Model (Context, Domain, Process, Development, Physical)
- **License**: Internal — Product & Engineering (BiasharaOS Phase 1 Kenya Rollout)
