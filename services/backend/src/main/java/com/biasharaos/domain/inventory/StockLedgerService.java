package com.biasharaos.domain.inventory;

import java.time.Instant;
import java.util.UUID;

public class StockLedgerService {

    public record StockMovementCommand(
        String productId,
        String locationId,
        String movementType,
        int quantityDelta,
        String refDocument,
        String actorId,
        String actorName,
        String reason,
        String clientUuid
    ) {}

    public record LedgerRecord(
        String id,
        Instant timestamp,
        String productId,
        String locationId,
        String movementType,
        int quantityDelta,
        int runningBalance,
        String refDocument,
        String actorId,
        String actorName,
        String reason,
        String clientUuid
    ) {}

    public LedgerRecord recordMovement(StockMovementCommand cmd, int currentBalance, boolean allowOversell) {
        int newBalance = currentBalance + cmd.quantityDelta();

        if (newBalance < 0 && !allowOversell) {
            throw new IllegalStateException("Stock cannot fall below zero for SKU. Current: " + currentBalance + ", Delta: " + cmd.quantityDelta());
        }

        String ledgerId = "ledg_" + UUID.randomUUID();
        return new LedgerRecord(
            ledgerId,
            Instant.now(),
            cmd.productId(),
            cmd.locationId(),
            cmd.movementType(),
            cmd.quantityDelta(),
            newBalance,
            cmd.refDocument(),
            cmd.actorId(),
            cmd.actorName(),
            cmd.reason(),
            cmd.clientUuid()
        );
    }
}
