package com.biasharaos.domain.sales;

import org.junit.jupiter.api.Test;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class SalesServiceTest {

    @Test
    public void testProcessSale_UnderDiscountCap_Success() {
        SalesService service = new SalesService();
        SalesService.SaleItem item = new SalesService.SaleItem("SKU-1", "Milk", 2, 6500, 0);
        SalesService.FinalizeSaleRequest req = new SalesService.FinalizeSaleRequest(
            List.of(item), 5, false, "CASH", "cashier_1", "Kevin", "loc_1", "uuid-1"
        );

        SalesService.SaleResult result = service.processSale(req);
        assertEquals("COMPLETED", result.status());
        assertEquals(13000, result.subtotalCents());
        assertEquals(12350, result.grandTotalCents());
        assertEquals(5.0, result.effectiveDiscountPercent());
    }

    @Test
    public void testProcessSale_ExceedsDiscountCapWithoutApproval_ThrowsException() {
        SalesService service = new SalesService();
        SalesService.SaleItem item = new SalesService.SaleItem("SKU-1", "Milk", 2, 6500, 0);
        SalesService.FinalizeSaleRequest req = new SalesService.FinalizeSaleRequest(
            List.of(item), 15, false, "CASH", "cashier_1", "Kevin", "loc_1", "uuid-2"
        );

        assertThrows(IllegalStateException.class, () -> service.processSale(req));
    }

    @Test
    public void testProcessSale_CumulativeDiscountBypassLoophole_ThrowsException() {
        SalesService service = new SalesService();
        // Item discount 6% + Cart discount 6% = 12% cumulative
        SalesService.SaleItem item = new SalesService.SaleItem("SKU-1", "Milk", 2, 10000, 1200); // 6% item disc
        SalesService.FinalizeSaleRequest req = new SalesService.FinalizeSaleRequest(
            List.of(item), 6, false, "CASH", "cashier_1", "Kevin", "loc_1", "uuid-3"
        );

        assertThrows(IllegalStateException.class, () -> service.processSale(req));
    }

    @Test
    public void testProcessSale_CumulativeDiscountWithManagerApproval_Success() {
        SalesService service = new SalesService();
        SalesService.SaleItem item = new SalesService.SaleItem("SKU-1", "Milk", 2, 10000, 1200);
        SalesService.FinalizeSaleRequest req = new SalesService.FinalizeSaleRequest(
            List.of(item), 6, true, "CASH", "cashier_1", "Kevin", "loc_1", "uuid-4"
        );

        SalesService.SaleResult result = service.processSale(req);
        assertEquals("COMPLETED", result.status());
        assertTrue(result.effectiveDiscountPercent() > 10.0);
    }
}
