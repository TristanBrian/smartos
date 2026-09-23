package com.biasharaos.domain.profile;

/**
 * Domain Service for Tenant Business Profile & User Security Profile Management (FR-TEN, FR-IAM, FR-TAX, FR-PAY).
 */
public class ProfileService {

    public record TenantProfile(
        String id,
        String name,
        String businessType,
        String county,
        String ownerName,
        String phone,
        boolean isVatRegistered,
        String kraPin,
        String etimsDevice,
        String mpesaPaybill,
        String mpesaTill,
        String receiptFooterNote
    ) {}

    public record UserProfile(
        String id,
        String fullName,
        String phone,
        String email,
        String role,
        boolean pinConfigured
    ) {}

    public record UpdateBusinessProfileCommand(
        String name,
        String businessType,
        String county,
        String ownerName,
        String phone,
        boolean isVatRegistered,
        String kraPin,
        String etimsDevice,
        String mpesaPaybill,
        String mpesaTill,
        String receiptFooterNote
    ) {}

    public TenantProfile updateTenantProfile(TenantProfile current, UpdateBusinessProfileCommand cmd) {
        if (cmd.name() == null || cmd.name().isBlank()) {
            throw new IllegalArgumentException("Business name cannot be empty");
        }

        if (cmd.isVatRegistered() && (cmd.kraPin() == null || cmd.kraPin().isBlank())) {
            throw new IllegalArgumentException("KRA PIN is required for VAT-registered businesses (FR-TAX-01)");
        }

        return new TenantProfile(
            current.id(),
            cmd.name(),
            cmd.businessType(),
            cmd.county(),
            cmd.ownerName(),
            cmd.phone(),
            cmd.isVatRegistered(),
            cmd.kraPin(),
            cmd.etimsDevice(),
            cmd.mpesaPaybill(),
            cmd.mpesaTill(),
            cmd.receiptFooterNote()
        );
    }
}
