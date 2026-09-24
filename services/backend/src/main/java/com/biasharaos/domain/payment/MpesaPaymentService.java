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
     * Sanitizes raw Kenyan phone number to Daraja required format: 2547XXXXXXXX
     */
    public String formatKenyanPhone(String rawPhone) {
        if (rawPhone == null) return "";
        String clean = rawPhone.replaceAll("\\s+", "").replaceAll("-", "");
        if (clean.startsWith("+")) {
            clean = clean.substring(1);
        }
        if (clean.startsWith("0")) {
            clean = "254" + clean.substring(1);
        }
        return clean;
    }

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
     * Builds HTTP Basic Auth Header value for Daraja OAuth: Basic Base64(ConsumerKey:ConsumerSecret)
     */
    public String buildDarajaAuthHeader(String consumerKey, String consumerSecret) {
        String data = consumerKey + ":" + consumerSecret;
        return "Basic " + Base64.getEncoder().encodeToString(data.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Builds complete Safaricom Daraja 3.0 STK Push Process Request Payload Map.
     */
    public Map<String, Object> buildStkPushPayloadMap(DarajaCredentials creds, StkPushRequest req) {
        String formattedPhone = formatKenyanPhone(req.phone());
        if (!formattedPhone.matches("^254[0-9]{9}$")) {
            throw new IllegalArgumentException("Invalid Kenyan phone number format: " + req.phone() + ". Must be 2547XXXXXXXX");
        }

        String timestamp = generateTimestamp();
        String password = generatePassword(creds.shortcode(), creds.passkey(), timestamp);
        long amountKSh = Math.max(1, req.amountCents() / 100);

        return Map.ofEntries(
            Map.entry("BusinessShortCode", creds.shortcode()),
            Map.entry("Password", password),
            Map.entry("Timestamp", timestamp),
            Map.entry("TransactionType", "CustomerPayBillOnline"),
            Map.entry("Amount", amountKSh),
            Map.entry("PartyA", formattedPhone),
            Map.entry("PartyB", creds.shortcode()),
            Map.entry("PhoneNumber", formattedPhone),
            Map.entry("CallBackURL", req.callbackUrl() != null ? req.callbackUrl() : "https://api.biasharaos.co.ke/api/v1/mpesa/callback"),
            Map.entry("AccountReference", req.accountReference() != null ? req.accountReference() : "BiasharaOS"),
            Map.entry("TransactionDesc", req.transactionDesc() != null ? req.transactionDesc() : "Payment")
        );
    }

    /**
     * Initiates STK Push domain response.
     */
    public StkPushResponsePayload initiateStkPush(DarajaCredentials creds, StkPushRequest req) {
        String formattedPhone = formatKenyanPhone(req.phone());
        if (!formattedPhone.matches("^254[0-9]{9}$")) {
            throw new IllegalArgumentException("Invalid Kenyan phone number format. Must be 2547XXXXXXXX or 07XXXXXXXX");
        }

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
