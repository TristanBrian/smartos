package com.biasharaos.domain.tax;

import java.time.Instant;
import java.util.UUID;

/**
 * Domain Service for KRA eTIMS OSCU Invoice Payload Generation & Submission Queue (BR-006, FR-TAX).
 */
public class EtimsTaxService {

    public record EtimsInvoicePayload(
        String tenantKraPin,
        String deviceSerial,
        String receiptNumber,
        long subtotalCents,
        long vatTaxCents,
        long totalCents,
        Instant saleTimestamp
    ) {}

    public record EtimsSubmissionResult(
        String invoiceNumber,
        String kraStatus,
        String qrSignature,
        String responseMessage
    ) {}

    public EtimsSubmissionResult submitInvoiceToOscu(EtimsInvoicePayload payload, boolean isOscuReachable) {
        if (!isOscuReachable) {
            return new EtimsSubmissionResult(
                "PENDING",
                "RETRY_QUEUED",
                null,
                "503 OSCU Gateway Unavailable - Enqueued for retry"
            );
        }

        String invoiceNumber = "0000000000000" + (10000 + (int)(Math.random() * 90000));
        String qrSignature = "KRA-OSCU-SIGN-" + UUID.randomUUID().toString().toUpperCase();

        return new EtimsSubmissionResult(
            invoiceNumber,
            "ACCEPTED",
            qrSignature,
            "ACCEPTED_BY_OSCU"
        );
    }
}
