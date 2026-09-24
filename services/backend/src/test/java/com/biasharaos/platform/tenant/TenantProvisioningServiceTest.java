package com.biasharaos.platform.tenant;

import com.biasharaos.platform.tenant.TenantProvisioningService.OnboardTenantCommand;
import com.biasharaos.platform.tenant.TenantProvisioningService.ProvisionedTenantResult;

public class TenantProvisioningServiceTest {

    public void testOnboardNewShop_Success() {
        TenantProvisioningService service = new TenantProvisioningService();
        OnboardTenantCommand cmd = new OnboardTenantCommand(
            "Mama Mboga Express",
            "GROCERY",
            "Nairobi",
            "Mary Wanjiku",
            "0722000111",
            "PRO",
            false,
            null,
            "123456"
        );

        ProvisionedTenantResult result = service.onboardNewShop(cmd);

        if (!"ACTIVE".equals(result.status())) {
            throw new AssertionError("Expected status to be ACTIVE but was " + result.status());
        }
        if (!result.schemaName().startsWith("tenant_t_mama_mboga_express_")) {
            throw new AssertionError("Expected schema name to start with tenant_t_mama_mboga_express_ but got " + result.schemaName());
        }
        if (!"Nairobi".equals(result.county())) {
            throw new AssertionError("Expected county Nairobi but got " + result.county());
        }
    }

    public void testOnboardNewShop_MissingName_ThrowsException() {
        TenantProvisioningService service = new TenantProvisioningService();
        OnboardTenantCommand cmd = new OnboardTenantCommand(
            "",
            "GROCERY",
            "Nairobi",
            "Mary Wanjiku",
            "0722000111",
            "PRO",
            false,
            null,
            "123456"
        );

        try {
            service.onboardNewShop(cmd);
            throw new AssertionError("Expected IllegalArgumentException for blank shop name");
        } catch (IllegalArgumentException e) {
            // Expected
        }
    }

    public void testOnboardNewShop_VatRegisteredWithoutKraPin_ThrowsException() {
        TenantProvisioningService service = new TenantProvisioningService();
        OnboardTenantCommand cmd = new OnboardTenantCommand(
            "Quick Supermarket",
            "SUPERMARKET",
            "Mombasa",
            "John Kamau",
            "0711222333",
            "ENTERPRISE",
            true,
            "INVALID_PIN",
            "654321"
        );

        try {
            service.onboardNewShop(cmd);
            throw new AssertionError("Expected IllegalArgumentException for invalid KRA PIN on VAT shop");
        } catch (IllegalArgumentException e) {
            // Expected
        }
    }

    public void testOnboardNewShop_VatRegisteredWithValidKraPin_Success() {
        TenantProvisioningService service = new TenantProvisioningService();
        OnboardTenantCommand cmd = new OnboardTenantCommand(
            "Quick Supermarket",
            "SUPERMARKET",
            "Mombasa",
            "John Kamau",
            "0711222333",
            "ENTERPRISE",
            true,
            "A012345678X",
            "654321"
        );

        ProvisionedTenantResult result = service.onboardNewShop(cmd);
        if (!"ACTIVE".equals(result.status())) {
            throw new AssertionError("Expected ACTIVE status for valid VAT shop");
        }
    }
}
