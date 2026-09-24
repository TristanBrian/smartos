package com.biasharaos.domain.payment;

import org.junit.jupiter.api.Test;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

public class MpesaPaymentServiceTest {

    @Test
    public void testGeneratePassword_Base64Encoding() {
        MpesaPaymentService service = new MpesaPaymentService();
        String shortcode = "174379";
        String passkey = "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";
        String timestamp = "20260923234800";

        String password = service.generatePassword(shortcode, passkey, timestamp);
        assertNotNull(password);
        assertFalse(password.isBlank());

        // Verify Base64 decode matches expected string
        byte[] decoded = java.util.Base64.getDecoder().decode(password);
        String decodedStr = new String(decoded);
        assertEquals(shortcode + passkey + timestamp, decodedStr);
    }

    @Test
    public void testInitiateStkPush_ValidPhone() {
        MpesaPaymentService service = new MpesaPaymentService();
        MpesaPaymentService.DarajaCredentials creds = new MpesaPaymentService.DarajaCredentials(
            "SANDBOX", "key123", "secret123", "174379", "passkey123"
        );
        MpesaPaymentService.StkPushRequest req = new MpesaPaymentService.StkPushRequest(
            "254722000111", 15000, "REC-10042", "Payment for Goods", "https://api.biasharaos.com/callback"
        );

        MpesaPaymentService.StkPushResponsePayload response = service.initiateStkPush(creds, req);
        assertEquals("0", response.responseCode());
        assertTrue(response.checkoutRequestId().startsWith("ws_CO_"));
    }

    @Test
    public void testInitiateStkPush_InvalidPhone_ThrowsException() {
        MpesaPaymentService service = new MpesaPaymentService();
        MpesaPaymentService.DarajaCredentials creds = new MpesaPaymentService.DarajaCredentials(
            "SANDBOX", "key123", "secret123", "174379", "passkey123"
        );
        MpesaPaymentService.StkPushRequest req = new MpesaPaymentService.StkPushRequest(
            "12345", 15000, "REC-10042", "Payment", "https://api.biasharaos.com/callback"
        );

        assertThrows(IllegalArgumentException.class, () -> service.initiateStkPush(creds, req));
    }

    @Test
    public void testBuildStkQueryPayload() {
        MpesaPaymentService service = new MpesaPaymentService();
        MpesaPaymentService.DarajaCredentials creds = new MpesaPaymentService.DarajaCredentials(
            "SANDBOX", "key123", "secret123", "174379", "passkey123"
        );

        Map<String, String> queryPayload = service.buildStkQueryPayload(creds, "ws_CO_12345");
        assertEquals("174379", queryPayload.get("BusinessShortCode"));
        assertEquals("ws_CO_12345", queryPayload.get("CheckoutRequestID"));
        assertNotNull(queryPayload.get("Password"));
    }

    @Test
    public void testResolveResultCodeMessage() {
        MpesaPaymentService service = new MpesaPaymentService();
        assertTrue(service.resolveResultCodeMessage("0").contains("Success"));
        assertTrue(service.resolveResultCodeMessage("1032").contains("cancelled by user"));
        assertTrue(service.resolveResultCodeMessage("1037").contains("Timeout"));
    }

    @Test
    public void testFormatKenyanPhone() {
        MpesaPaymentService service = new MpesaPaymentService();
        assertEquals("254712345678", service.formatKenyanPhone("0712345678"));
        assertEquals("254712345678", service.formatKenyanPhone("+254 712 345 678"));
        assertEquals("254712345678", service.formatKenyanPhone("254712345678"));
    }

    @Test
    public void testBuildDarajaAuthHeader() {
        MpesaPaymentService service = new MpesaPaymentService();
        String authHeader = service.buildDarajaAuthHeader("myKey", "mySecret");
        assertTrue(authHeader.startsWith("Basic "));
    }

    @Test
    public void testBuildStkPushPayloadMap() {
        MpesaPaymentService service = new MpesaPaymentService();
        MpesaPaymentService.DarajaCredentials creds = new MpesaPaymentService.DarajaCredentials(
            "SANDBOX", "key123", "secret123", "174379", "passkey123"
        );
        MpesaPaymentService.StkPushRequest req = new MpesaPaymentService.StkPushRequest(
            "0722000111", 15000, "REC-10042", "Payment for Goods", "https://api.biasharaos.com/callback"
        );

        Map<String, Object> payload = service.buildStkPushPayloadMap(creds, req);
        assertEquals("174379", payload.get("BusinessShortCode"));
        assertEquals("CustomerPayBillOnline", payload.get("TransactionType"));
        assertEquals(150L, payload.get("Amount"));
        assertEquals("254722000111", payload.get("PhoneNumber"));
        assertEquals("254722000111", payload.get("PartyA"));
    }
}
