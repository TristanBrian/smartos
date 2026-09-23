package com.biasharaos.domain.sales;

import java.util.List;

/**
 * Domain Service for POS Sale Finalization, Discount Cap Validation (BRULE-06), and Receipt Generation.
 */
public class SalesService {

    public record SaleItem(String sku, String name, int qty, long unitPriceCents) {}

    public record FinalizeSaleRequest(
        List<SaleItem> items,
        int discountPercent,
        boolean managerApproved,
        String paymentMethod,
        String cashierId,
        String cashierName,
        String locationId,
        String clientUuid
    ) {}

    public record SaleResult(
        String receiptNumber,
        long subtotalCents,
        long discountCents,
        long taxCents,
        long grandTotalCents,
        String status
    ) {}

    public SaleResult processSale(FinalizeSaleRequest request) {
        if (request.items() == null || request.items().isEmpty()) {
            throw new IllegalArgumentException("A sale cannot be completed with zero line items (BRULE-01)");
        }

        if (request.discountPercent() > 10 && !request.managerApproved()) {
            throw new IllegalStateException("Discounts above 10% require Manager PIN approval (BRULE-06)");
        }

        long subtotalCents = request.items().stream()
            .mapToLong(item -> item.qty() * item.unitPriceCents())
            .sum();

        long discountCents = Math.round((subtotalCents * request.discountPercent()) / 100.0);
        long grandTotalCents = subtotalCents - discountCents;

        if (grandTotalCents <= 0) {
            throw new IllegalArgumentException("A sale grand total must be > 0 (BRULE-01)");
        }

        String receiptNumber = "REC-" + (10000 + (int) (Math.random() * 90000));

        return new SaleResult(
            receiptNumber,
            subtotalCents,
            discountCents,
            0L, // Tax computed per item tax treatment
            grandTotalCents,
            "COMPLETED"
        );
    }
}
