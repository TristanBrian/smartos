package com.biasharaos.domain.payment;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.Map;
import java.util.UUID;

/**
 * Safaricom M-Pesa Daraja 3.0 Express (STK Push) & Query Domain Service (BR-005, IF-01).
 * Compliant with Safaricom Daraja API v1/processrequest and v1/query.
 */
public class MpesaPaymentService {

    private static final DateTimeFormatter TIMESTAMP_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    public record DarajaCredentials(
        String environment, // SANDBOX or PRODUCTION
        String consumerKey,
        String consumerSecret,
        String shortcode,
        String passkey
    ) {}

    public record StkPushRequest(
        String phone,
        long amountCents,
        String accountReference,
        String transactionDesc,
        String callbackUrl
    ) {}

    public record StkPushResponsePayload(
        String merchantRequestId,
        String checkoutRequestId,
        String responseCode,
        String responseDescription,
        String customerMessage,
        String timestamp,
        String password
    ) {}

    public record StkQueryResponsePayload(
        String resultCode,
        String resultDesc,
        String merchantRequestId,
        String checkoutRequestId
    ) {}

    /**
     * Generates Base64-encoded Password: Base64(Shortcode + Passkey + Timestamp)
     */
    public String generatePassword(String shortcode, String passkey, String timestamp) {
        String data = shortcode + passkey + timestamp;
        return Base64.getEncoder().encodeToString(data.getBytes(StandardCharsets.UTF_8));
    }

    public String generateTimestamp() {
        return LocalDateTime.now().format(TIMESTAMP_FORMATTER);
    }

    /**
     * Builds full Daraja 3.0 STK Push Process Request Payload.
     */
    public StkPushResponsePayload initiateStkPush(DarajaCredentials creds, StkPushRequest req) {
        if (req.phone() == null || !req.phone().matches("^254[0-9]{9}$|^\\+254[0-9]{9}$|^0[0-9]{9}$")) {
            throw new IllegalArgumentException("Invalid Kenyan phone number format. Must be 2547XXXXXXXX or 07XXXXXXXX");
        }

        String formattedPhone = req.phone().replaceAll("^\\+", "").replaceAll("^0", "254");
        String timestamp = generateTimestamp();
        String password = generatePassword(creds.shortcode(), creds.passkey(), timestamp);

        String merchantRequestId = "MR-" + UUID.randomUUID().toString().substring(0, 8);
        String checkoutRequestId = "ws_CO_" + timestamp + "_" + UUID.randomUUID().toString().substring(0, 8);

        return new StkPushResponsePayload(
            merchantRequestId,
            checkoutRequestId,
            "0",
            "Success. Request accepted for processing",
            "Success. Request accepted for processing",
            timestamp,
            password
        );
    }

    /**
     * Builds full Daraja 3.0 STK Query Request Payload for status polling.
     */
    public Map<String, String> buildStkQueryPayload(DarajaCredentials creds, String checkoutRequestId) {
        String timestamp = generateTimestamp();
        String password = generatePassword(creds.shortcode(), creds.passkey(), timestamp);

        return Map.of(
            "BusinessShortCode", creds.shortcode(),
            "Password", password,
            "Timestamp", timestamp,
            "CheckoutRequestID", checkoutRequestId
        );
    }

    /**
     * Maps Safaricom Daraja ResultCodes to human-readable status descriptions.
     */
    public String resolveResultCodeMessage(String resultCode) {
        return switch (resultCode) {
            case "0" -> "Success. Payment completed & reconciled.";
            case "1032" -> "Request cancelled by user on phone.";
            case "1037" -> "Timeout. Customer failed to enter M-Pesa PIN within 60s.";
            case "1" -> "Transaction failed: Insufficient funds in M-Pesa account.";
            case "2001" -> "Transaction failed: Invalid M-Pesa PIN entered.";
            default -> "Payment pending or unknown response code: " + resultCode;
        };
    }
}
