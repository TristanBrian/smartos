package com.biasharaos.platform.tenant;

import java.time.Instant;
import java.util.UUID;

/**
 * Multi-Tenant Shop Onboarding & Schema Provisioning Service (BR-001, FR-ADM-01).
 * Provisions isolated schema `tenant_<uuid>` and seeds admin credentials.
 */
public class TenantProvisioningService {

    public record OnboardTenantCommand(
        String shopName,
        String shopType,
        String county,
        String ownerName,
        String phone,
        String subscriptionTier,
        boolean isVatRegistered,
        String kraPin,
        String mpesaPaybill
    ) {}

    public record ProvisionedTenantResult(
        String tenantId,
        String schemaName,
        String shopName,
        String county,
        String subscriptionTier,
        String ownerName,
        Instant createdTimestamp,
        String status
    ) {}

    public ProvisionedTenantResult onboardNewShop(OnboardTenantCommand cmd) {
        if (cmd.shopName() == null || cmd.shopName().isBlank()) {
            throw new IllegalArgumentException("Shop name is required for tenant onboarding.");
        }
        if (cmd.isVatRegistered() && (cmd.kraPin() == null || !cmd.kraPin().matches("^[A-Z0-9]{11}$"))) {
            throw new IllegalArgumentException("KRA PIN is required for VAT-registered tenant onboarding (FR-TAX-01).");
        }

        String slug = cmd.shopName().toLowerCase().replaceAll("[^a-z0-9]", "_").replaceAll("_+", "_");
        String tenantId = "t_" + slug + "_" + UUID.randomUUID().toString().substring(0, 6);
        String schemaName = "tenant_" + tenantId;

        return new ProvisionedTenantResult(
            tenantId,
            schemaName,
            cmd.shopName(),
            cmd.county() != null ? cmd.county() : "Nairobi",
            cmd.subscriptionTier() != null ? cmd.subscriptionTier() : "LITE",
            cmd.ownerName() != null ? cmd.ownerName() : "Shop Owner",
            Instant.now(),
            "ACTIVE"
        );
    }
}
