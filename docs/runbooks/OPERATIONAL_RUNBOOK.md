# BiasharaOS — Operational & Production Runbook

**Document Version:** 1.0  
**Target Audience:** DevOps, System Administrators, Support Engineers, On-Call Site Reliability Engineers (SREs)  
**Classification:** Internal Operational Reference

---

## 1. SYSTEM ARCHITECTURE & TOPOLOGY OVERVIEW

BiasharaOS is a multi-tenant cloud SaaS platform. Tenant data is isolated using **PostgreSQL schema-per-tenant** (`tenant_<uuid>`), while platform administration, subscription billing, and audit logs reside in the `platform` schema.

```
+-------------------------------------------------------------------------+
|                            BIASHARAOS TOPOLOGY                          |
+-------------------------------------------------------------------------+
|  Flutter Mobile POS  /  React Web Dashboard (Nginx :3000)                |
+-------------------------------------------------------------------------+
                                    |
                                    v (HTTP / REST API)
+-------------------------------------------------------------------------+
|                  API Gateway & Tenant Context Router                   |
+-------------------------------------------------------------------------+
                                    |
            +-----------------------+-----------------------+
            |                                               |
            v                                               v
+-----------------------+                       +-----------------------+
|  Spring Boot Backend  | <---> Redis (:6379)   |     Kafka Backbone    |
|   Services (:8080)    | (Idempotency Locks)   |       (:9092)         |
+-----------------------+                       +-----------------------+
            |                                               |
            v                                               v
+-------------------------------------------------------------------------+
|               PostgreSQL 16 Multi-Tenant Database (:5432)                |
|  +-------------------+  +-------------------+  +---------------------+  |
|  |  platform schema  |  | tenant_A1 (Duka)  |  | tenant_B2 (Chemist) |  |
|  +-------------------+  +-------------------+  +---------------------+  |
+-------------------------------------------------------------------------+
```

---

## 2. DEPLOYMENT & CONTAINER MANAGEMENT

### 2.1 Starting & Stopping Services
- **Start All Services**:
  ```bash
  docker compose up --build -d
  ```
- **Check Container Health**:
  ```bash
  docker compose ps
  ```
- **Stop All Services (Preserving Volumes)**:
  ```bash
  docker compose down
  ```
- **Full Wipe & Re-initialization (WARNING: Erases all data)**:
  ```bash
  docker compose down -v
  docker compose up --build -d
  ```

### 2.2 Container Diagnostics & Log Inspection
- **View Spring Boot Backend Logs**:
  ```bash
  docker compose logs -f --tail=100 biashara-backend
  ```
- **View PostgreSQL Logs**:
  ```bash
  docker compose logs -f --tail=100 biashara-postgres
  ```
- **View Kafka Event Stream Logs**:
  ```bash
  docker compose logs -f --tail=100 biashara-kafka
  ```

---

## 3. MPESA DARAJA 3.0 RUNBOOK

### 3.1 Live STK Push Status Lookup (Query Fallback)
If an M-Pesa STK callback is delayed or dropped due to network latency, run the manual STK Query lookup against Safaricom Daraja API:

1. Connect to PostgreSQL container:
   ```bash
   docker compose exec biashara-postgres psql -U biashara_admin -d biasharaos_db
   ```
2. Query pending payment record:
   ```sql
   SELECT trans_id, receipt_no, phone, amount_cents, status 
   FROM tenant_t_duka_nakuru.mpesa_transactions 
   WHERE status = 'PENDING';
   ```
3. Execute `/mpesa/stkpushquery/v1/query` from the Web POS dashboard under **M-Pesa Reconciliation -> Query Status** or via API:
   ```bash
   curl -X POST http://localhost:8080/api/v1/payments/stkpush/query \
     -H "Content-Type: application/json" \
     -d '{"checkoutRequestId":"ws_CO_12345678"}'
   ```

### 3.2 Resolving Unmatched Paybill Deposits (C2B Queue)
When a customer pays via Paybill direct without entering a receipt number:
1. Navigate to **M-Pesa Reconciliation** -> **Unmatched Paybill Queue**.
2. Identify the transaction by customer phone and amount.
3. Click **Reconcile** and input the target receipt number (e.g. `REC-10041`).
4. The system binds `TransID` to the receipt and marks the sale as `COMPLETED`.

---

## 4. KRA eTIMS TAX COMPLIANCE RUNBOOK

### 4.1 Retrying Failed eTIMS Submissions
If KRA eTIMS OSCU gateway returns `503 Service Unavailable` or times out:
1. Invoices are queued in `etims_invoices` with status `RETRY_QUEUED`.
2. The Tax service automatically retries with exponential backoff (1m, 5m, 15m, 1h, 6h).
3. To trigger an **immediate manual retry**:
   - Go to **KRA eTIMS Tax Hub** -> Click **Retry Submission** on the failed invoice.
   - Or execute database trigger reset:
     ```sql
     UPDATE tenant_t_pharmacy_nrb.etims_invoices 
     SET kra_status = 'PENDING', attempts = 0 
     WHERE id = 'etims_002';
     ```

---

## 5. OFFLINE SYNC & LEDGER CONFLICT RUNBOOK

### 5.1 Resolving Negative Stock Balance Conflicts
When two cashiers sell the same last item on separate offline devices:
1. Both sales are accepted into the append-only `stock_ledger` using time-ordered UUID v7 keys to preserve revenue records.
2. The server recomputes `stock_on_hand` and detects a negative balance condition (e.g., `-1`).
3. **Remediation**:
   - Navigate to **Inventory Intelligence** -> **Product Catalog**.
   - Click **Adjust Stock** on the affected SKU.
   - Input a positive delta (e.g. `+1`) with mandated reason code `Physical count variance` or `Supplier restock bonus` (`BRULE-05`).
   - The ledger appends the corrective adjustment, restoring positive balance.

---

## 6. TENANT PROVISIONING & SUPPORT IMPERSONATION

### 6.1 Provisioning a New Tenant Workspace
Self-serve registration creates the isolated schema `tenant_<uuid>`:
```sql
-- Executed automatically by Tenant Service
CREATE SCHEMA IF NOT EXISTS tenant_a1b2c3d4;
```
Flyway migrations are then executed against `tenant_a1b2c3d4` to seed reference data (units of measure, categories, default roles, tax rates).

### 6.2 Executing Support Workspace Impersonation (FR-ADM-04)
Support agents must obtain recorded customer consent before inspecting a tenant workspace:
1. Navigate to **Platform Admin Console** -> **Tenant Accounts**.
2. Click **Impersonate (Audited)**.
3. Check **"I confirm tenant explicit consent was received via WhatsApp/Phone"**.
4. Click **Switch Workspace Context**.
5. The action is recorded in `platform.platform_audit_log`:
   ```sql
   SELECT actor_name, action, tenant_id, details, created_at 
   FROM platform.platform_audit_log 
   ORDER BY created_at DESC LIMIT 5;
   ```

---

## 7. BACKUP & DISASTER RECOVERY (DR)

### 7.1 Target Metrics
- **RPO (Recovery Point Objective)**: ≤ 5 minutes
- **RTO (Recovery Time Objective)**: ≤ 60 minutes

### 7.2 Database Backup Command
```bash
docker compose exec biashara-postgres pg_dump -U biashara_admin -F c biasharaos_db > /backups/biasharaos_dump_$(date +%Y%m%d_%H%M%S).dump
```

### 7.3 Database Restore Command
```bash
docker compose exec -T biashara-postgres pg_restore -U biashara_admin -d biasharaos_db --clean < /backups/biasharaos_dump_YYYYMMDD_HHMMSS.dump
```
