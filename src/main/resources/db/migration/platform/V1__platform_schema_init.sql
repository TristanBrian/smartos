-- Flyway migration for platform schema (BiasharaOS Platform)

CREATE SCHEMA IF NOT EXISTS platform;

CREATE TABLE IF NOT EXISTS platform.tenants (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    business_type VARCHAR(100) NOT NULL,
    county VARCHAR(100) NOT NULL,
    owner_name VARCHAR(255) NOT NULL,
    phone VARCHAR(32) NOT NULL UNIQUE,
    tier VARCHAR(32) NOT NULL DEFAULT 'FREE',
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    schema_name VARCHAR(64) NOT NULL UNIQUE,
    is_vat_registered BOOLEAN NOT NULL DEFAULT FALSE,
    kra_pin VARCHAR(32),
    etims_device VARCHAR(64),
    mpesa_paybill VARCHAR(32),
    mpesa_till VARCHAR(32),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS platform.subscriptions (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL REFERENCES platform.tenants(id),
    tier VARCHAR(32) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    billing_cycle VARCHAR(32) NOT NULL DEFAULT 'MONTHLY',
    amount_cents BIGINT NOT NULL,
    next_renewal_date TIMESTAMPTZ NOT NULL,
    grace_period_end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS platform.platform_audit_log (
    id VARCHAR(64) PRIMARY KEY,
    actor_id VARCHAR(64) NOT NULL,
    actor_name VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    tenant_id VARCHAR(64),
    details TEXT,
    ip_address VARCHAR(64),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
