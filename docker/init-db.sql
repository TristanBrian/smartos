-- Database bootstrap script for BiasharaOS PostgreSQL container

CREATE DATABASE biasharaos_db;
\c biasharaos_db;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create platform schema
CREATE SCHEMA IF NOT EXISTS platform;

-- Seed platform tenants
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
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO platform.tenants (id, name, business_type, county, owner_name, phone, tier, status, schema_name, is_vat_registered, kra_pin, etims_device, mpesa_paybill, mpesa_till)
VALUES 
('t_duka_nakuru', 'Mama Grace Shop & General Merchants', 'Retail Duka', 'Nakuru', 'Grace Wanjiru', '+254722123456', 'LITE', 'ACTIVE', 'tenant_t_duka_nakuru', false, 'A019827364Z', 'OSCU-NK01-089', '748912', '891234'),
('t_pharmacy_nrb', 'Aisha Central Chemist & Health', 'Pharmacy', 'Nairobi', 'Aisha Mohamed', '+254733987654', 'MAX', 'ACTIVE', 'tenant_t_pharmacy_nrb', true, 'P051884920K', 'OSCU-NRB-304', '522522', '900123')
ON CONFLICT (id) DO NOTHING;

-- Pre-create tenant schemas
CREATE SCHEMA IF NOT EXISTS tenant_t_duka_nakuru;
CREATE SCHEMA IF NOT EXISTS tenant_t_pharmacy_nrb;
