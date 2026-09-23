package com.biasharaos.domain.profile;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class ProfileServiceTest {

    @Test
    public void testUpdateTenantProfile_Success() {
        ProfileService service = new ProfileService();
        ProfileService.TenantProfile current = new ProfileService.TenantProfile(
            "t_01", "Old Shop", "Retail", "Nakuru", "Grace", "+254722000111",
            false, null, null, "123456", "654321", "Thank you for shopping"
        );

        ProfileService.UpdateBusinessProfileCommand cmd = new ProfileService.UpdateBusinessProfileCommand(
            "Grace Super Duka", "Supermarket", "Nakuru", "Grace Wanjiru", "+254722000111",
            true, "A019827364Z", "OSCU-NK01-089", "748912", "891234", "Karibu Tena!"
        );

        ProfileService.TenantProfile updated = service.updateTenantProfile(current, cmd);
        assertEquals("Grace Super Duka", updated.name());
        assertEquals("A019827364Z", updated.kraPin());
        assertTrue(updated.isVatRegistered());
    }

    @Test
    public void testUpdateTenantProfile_VatWithoutKraPin_ThrowsException() {
        ProfileService service = new ProfileService();
        ProfileService.TenantProfile current = new ProfileService.TenantProfile(
            "t_01", "Old Shop", "Retail", "Nakuru", "Grace", "+254722000111",
            false, null, null, "123456", "654321", "Thank you"
        );

        ProfileService.UpdateBusinessProfileCommand invalidCmd = new ProfileService.UpdateBusinessProfileCommand(
            "Grace Super Duka", "Supermarket", "Nakuru", "Grace Wanjiru", "+254722000111",
            true, "", "OSCU-NK01-089", "748912", "891234", "Karibu Tena!"
        );

        assertThrows(IllegalArgumentException.class, () -> service.updateTenantProfile(current, invalidCmd));
    }
}
