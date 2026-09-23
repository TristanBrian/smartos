package com.biasharaos.domain.inventory;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class StockLedgerServiceTest {

    @Test
    void testStockLedgerMovement_PositiveDelta() {
        StockLedgerService service = new StockLedgerService();
        StockLedgerService.StockMovementCommand cmd = new StockLedgerService.StockMovementCommand(
            "prod_001", "loc_01", "PURCHASE", 20, "PO-1001", "actor_1", "Grace Wanjiru", "Restock", "uuid-v7-001"
        );

        StockLedgerService.LedgerRecord record = service.recordMovement(cmd, 10, false);
        assertEquals(30, record.runningBalance());
        assertEquals(20, record.quantityDelta());
    }

    @Test
    void testStockLedgerMovement_NegativeDelta_OversellForbidden() {
        StockLedgerService service = new StockLedgerService();
        StockLedgerService.StockMovementCommand cmd = new StockLedgerService.StockMovementCommand(
            "prod_001", "loc_01", "SALE", -15, "REC-101", "actor_1", "Kevin Omondi", "Sale", "uuid-v7-002"
        );

        assertThrows(IllegalStateException.class, () -> service.recordMovement(cmd, 5, false));
    }
}
