package com.biasharaos.domain.sales;

import java.util.List;

/**
 * Domain Service for POS Sale Finalization, Discount Cap Validation (BRULE-06),
 * and Multi-Item Cumulative Discount Loophole Prevention.
 */
public class SalesService {

    public record SaleItem(String sku, String name, int qty, long unitPriceCents, long itemDiscountCents) {}

    public record FinalizeSaleRequest(
        List<SaleItem> items,
        int cartDiscountPercent,
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
        String status,
        double effectiveDiscountPercent
    ) {}

    public SaleResult processSale(FinalizeSaleRequest request) {
        if (request.items() == null || request.items().isEmpty()) {
            throw new IllegalArgumentException("A sale cannot be completed with zero line items (BRULE-01)");
        }

        // Compute raw subtotal before any discounts
        long rawSubtotalCents = request.items().stream()
            .mapToLong(item -> (long) item.qty() * item.unitPriceCents())
            .sum();

        if (rawSubtotalCents <= 0) {
            throw new IllegalArgumentException("Sale subtotal must be greater than zero");
        }

        // Item-level discounts sum
        long totalItemDiscountsCents = request.items().stream()
            .mapToLong(SaleItem::itemDiscountCents)
            .sum();

        long subtotalAfterItemDiscounts = rawSubtotalCents - totalItemDiscountsCents;

        // Cart-level discount sum
        long cartDiscountCents = Math.round((subtotalAfterItemDiscounts * request.cartDiscountPercent()) / 100.0);

        // Cumulative discount across item + cart level
        long cumulativeDiscountCents = totalItemDiscountsCents + cartDiscountCents;
        double effectiveDiscountPercent = (cumulativeDiscountCents * 100.0) / rawSubtotalCents;

        // BRULE-06 Loophole Guard: Check CUMULATIVE effective discount, not just cart level!
        if (effectiveDiscountPercent > 10.0 && !request.managerApproved()) {
            throw new IllegalStateException(
                String.format("Cumulative discount (%.1f%%) exceeds cashier cap of 10.0%% and requires Manager PIN (BRULE-06)", effectiveDiscountPercent)
            );
        }

        long grandTotalCents = rawSubtotalCents - cumulativeDiscountCents;

        if (grandTotalCents <= 0) {
            throw new IllegalArgumentException("Sale grand total must be greater than zero (BRULE-01)");
        }

        String receiptNumber = "REC-" + (10000 + (int) (Math.random() * 90000));

        return new SaleResult(
            receiptNumber,
            rawSubtotalCents,
            cumulativeDiscountCents,
            0L,
            grandTotalCents,
            "COMPLETED",
            effectiveDiscountPercent
        );
    }
}
