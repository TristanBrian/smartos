-- Flyway migration template for tenant schema (applied to each tenant_<uuid>)

CREATE TABLE IF NOT EXISTS locations (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    is_main BOOLEAN NOT NULL DEFAULT FALSE,
    address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    phone VARCHAR(32) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL,
    location_id VARCHAR(64) REFERENCES locations(id),
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(64) PRIMARY KEY,
    sku VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    barcode VARCHAR(100),
    uom VARCHAR(32) NOT NULL DEFAULT 'Piece',
    cost_price_cents BIGINT NOT NULL DEFAULT 0,
    sell_price_cents BIGINT NOT NULL DEFAULT 0,
    vat_rate INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stock_balances (
    product_id VARCHAR(64) NOT NULL REFERENCES products(id),
    location_id VARCHAR(64) NOT NULL REFERENCES locations(id),
    stock_on_hand INT NOT NULL DEFAULT 0,
    reorder_threshold INT NOT NULL DEFAULT 10,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (product_id, location_id)
);

CREATE TABLE IF NOT EXISTS stock_ledger (
    id VARCHAR(64) PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    product_id VARCHAR(64) NOT NULL REFERENCES products(id),
    location_id VARCHAR(64) NOT NULL REFERENCES locations(id),
    movement_type VARCHAR(32) NOT NULL, -- SALE, PURCHASE, ADJUSTMENT, TRANSFER_IN, TRANSFER_OUT
    quantity_delta INT NOT NULL,
    running_balance INT NOT NULL,
    ref_document VARCHAR(100) NOT NULL,
    actor_id VARCHAR(64) NOT NULL,
    actor_name VARCHAR(255) NOT NULL,
    reason TEXT,
    client_uuid VARCHAR(64) UNIQUE
);

CREATE TABLE IF NOT EXISTS sales (
    id VARCHAR(64) PRIMARY KEY,
    receipt_number VARCHAR(64) NOT NULL UNIQUE,
    client_uuid VARCHAR(64) UNIQUE,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    cashier_id VARCHAR(64) NOT NULL,
    cashier_name VARCHAR(255) NOT NULL,
    location_id VARCHAR(64) NOT NULL,
    subtotal_cents BIGINT NOT NULL,
    discount_cents BIGINT NOT NULL DEFAULT 0,
    tax_cents BIGINT NOT NULL DEFAULT 0,
    grand_total_cents BIGINT NOT NULL,
    payment_method VARCHAR(32) NOT NULL,
    payment_status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    is_offline_captured BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS sale_lines (
    id VARCHAR(64) PRIMARY KEY,
    sale_id VARCHAR(64) NOT NULL REFERENCES sales(id),
    product_id VARCHAR(64) NOT NULL REFERENCES products(id),
    sku VARCHAR(100) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    unit_price_cents BIGINT NOT NULL,
    line_total_cents BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS mpesa_transactions (
    trans_id VARCHAR(64) PRIMARY KEY,
    sale_id VARCHAR(64) REFERENCES sales(id),
    phone VARCHAR(32) NOT NULL,
    amount_cents BIGINT NOT NULL,
    receipt_no VARCHAR(64),
    status VARCHAR(32) NOT NULL, -- MATCHED, UNMATCHED, PENDING
    type VARCHAR(32) NOT NULL, -- STK_PUSH, C2B_PAYBILL
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS etims_invoices (
    id VARCHAR(64) PRIMARY KEY,
    sale_id VARCHAR(64) NOT NULL REFERENCES sales(id),
    invoice_number VARCHAR(64),
    kra_status VARCHAR(32) NOT NULL DEFAULT 'PENDING', -- PENDING, ACCEPTED, REJECTED, RETRY_QUEUED
    attempts INT NOT NULL DEFAULT 0,
    last_response TEXT,
    qr_signature TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
