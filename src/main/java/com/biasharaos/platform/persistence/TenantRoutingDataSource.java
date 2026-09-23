package com.biasharaos.platform.persistence;

import com.biasharaos.platform.security.TenantContextHolder;
import org.springframework.jdbc.datasource.lookup.AbstractRoutingDataSource;

/**
 * Dynamic DataSource Router executing PostgreSQL schema selection (`tenant_<uuid>`) per request (DR-01).
 */
public class TenantRoutingDataSource extends AbstractRoutingDataSource {

    @Override
    protected Object determineCurrentLookupKey() {
        String tenantId = TenantContextHolder.getTenantId();
        if (tenantId == null) {
            return "platform"; // Default fallback to platform schema
        }
        return "tenant_" + tenantId;
    }
}
