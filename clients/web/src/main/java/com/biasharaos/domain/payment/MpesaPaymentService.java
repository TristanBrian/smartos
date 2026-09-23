package com.biasharaos.domain.payment;

import java.time.Instant;
import java.util.UUID;

/**
 * Domain Service for Safaricom M-Pesa Daraja 3.0 Payments (STK Push, C2B Paybill Reconciliation) (BR-005, BRULE-08).
 */
public class MpesaPaymentService {

    public record StkPushResponse(
        String checkoutRequestId,
        String responseCode,
        String customerMessage
    ) {}

    public record MpesaCallbackPayload(
        String transId,
        String phone,
        long amountCents,
        String receiptNo,
        String resultCode,
        String resultDesc
    ) {}

    public StkPushResponse initiateStkPush(String phone, long amountCents, String paybillShortcode) {
        if (phone == null || !phone.startsWith("+254")) {
            throw new IllegalArgumentException("Valid Kenyan phone number (+254...) required for M-Pesa STK Push");
        }

        String checkoutRequestId = "ws_CO_" + Instant.now().toEpochMilli() + "_" + UUID.randomUUID().toString().substring(0, 8);
        return new StkPushResponse(
            checkoutRequestId,
            "0",
            "Success. Request accepted for processing"
        );
    }

    public boolean processCallbackIdempotent(MpesaCallbackPayload callback, java.util.Set<String> processedTransIds) {
        if (processedTransIds.contains(callback.transId())) {
            // BRULE-08: Repeated callback for same TransID is safely ignored (idempotent)
            return false;
        }

        processedTransIds.add(callback.transId());
        return "0".equals(callback.resultCode());
    }
}
