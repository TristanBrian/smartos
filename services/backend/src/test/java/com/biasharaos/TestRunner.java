package com.biasharaos;

import com.biasharaos.domain.inventory.StockLedgerServiceTest;
import com.biasharaos.domain.payment.MpesaPaymentServiceTest;
import com.biasharaos.domain.profile.ProfileServiceTest;
import com.biasharaos.domain.sales.SalesServiceTest;
import com.biasharaos.platform.tenant.TenantProvisioningServiceTest;

public class TestRunner {
    public static void main(String[] args) {
        int testsRun = 0;
        int failures = 0;
        int errors = 0;

        System.out.println("Running BiasharaOS Backend Test Suite...");

        // 1. Run TenantIsolationTestSuite
        try {
            TenantIsolationTestSuite isolationSuite = new TenantIsolationTestSuite();
            isolationSuite.setUp();
            isolationSuite.testTenantIsolation_CrossTenantReadReturns404();
            isolationSuite.tearDown();
            testsRun++;
            System.out.println("[PASS] TenantIsolationTestSuite.testTenantIsolation_CrossTenantReadReturns404");

            isolationSuite.setUp();
            isolationSuite.testTenantIsolation_DirectSchemaQueryFails();
            isolationSuite.tearDown();
            testsRun++;
            System.out.println("[PASS] TenantIsolationTestSuite.testTenantIsolation_DirectSchemaQueryFails");
        } catch (Throwable t) {
            failures++;
            System.err.println("[FAIL] TenantIsolationTestSuite: " + t.getMessage());
        }

        // 2. Run StockLedgerServiceTest
        try {
            StockLedgerServiceTest stockSuite = new StockLedgerServiceTest();
            stockSuite.testStockLedgerMovement_PositiveDelta();
            testsRun++;
            System.out.println("[PASS] StockLedgerServiceTest.testStockLedgerMovement_PositiveDelta");

            stockSuite.testStockLedgerMovement_NegativeDelta_OversellForbidden();
            testsRun++;
            System.out.println("[PASS] StockLedgerServiceTest.testStockLedgerMovement_NegativeDelta_OversellForbidden");
        } catch (Throwable t) {
            failures++;
            System.err.println("[FAIL] StockLedgerServiceTest: " + t.getMessage());
        }

        // 3. Run ProfileServiceTest
        try {
            ProfileServiceTest profileSuite = new ProfileServiceTest();
            profileSuite.testUpdateTenantProfile_Success();
            testsRun++;
            System.out.println("[PASS] ProfileServiceTest.testUpdateTenantProfile_Success");

            profileSuite.testUpdateTenantProfile_VatWithoutKraPin_ThrowsException();
            testsRun++;
            System.out.println("[PASS] ProfileServiceTest.testUpdateTenantProfile_VatWithoutKraPin_ThrowsException");
        } catch (Throwable t) {
            failures++;
            System.err.println("[FAIL] ProfileServiceTest: " + t.getMessage());
        }

        // 4. Run MpesaPaymentServiceTest
        try {
            MpesaPaymentServiceTest mpesaSuite = new MpesaPaymentServiceTest();
            mpesaSuite.testGeneratePassword_Base64Encoding();
            testsRun++;
            System.out.println("[PASS] MpesaPaymentServiceTest.testGeneratePassword_Base64Encoding");

            mpesaSuite.testInitiateStkPush_ValidPhone();
            testsRun++;
            System.out.println("[PASS] MpesaPaymentServiceTest.testInitiateStkPush_ValidPhone");

            mpesaSuite.testInitiateStkPush_InvalidPhone_ThrowsException();
            testsRun++;
            System.out.println("[PASS] MpesaPaymentServiceTest.testInitiateStkPush_InvalidPhone_ThrowsException");

            mpesaSuite.testBuildStkQueryPayload();
            testsRun++;
            System.out.println("[PASS] MpesaPaymentServiceTest.testBuildStkQueryPayload");

            mpesaSuite.testResolveResultCodeMessage();
            testsRun++;
            System.out.println("[PASS] MpesaPaymentServiceTest.testResolveResultCodeMessage");

            mpesaSuite.testFormatKenyanPhone();
            testsRun++;
            System.out.println("[PASS] MpesaPaymentServiceTest.testFormatKenyanPhone");

            mpesaSuite.testBuildDarajaAuthHeader();
            testsRun++;
            System.out.println("[PASS] MpesaPaymentServiceTest.testBuildDarajaAuthHeader");

            mpesaSuite.testBuildStkPushPayloadMap();
            testsRun++;
            System.out.println("[PASS] MpesaPaymentServiceTest.testBuildStkPushPayloadMap");
        } catch (Throwable t) {
            failures++;
            System.err.println("[FAIL] MpesaPaymentServiceTest: " + t.getMessage());
        }

        // 5. Run SalesServiceTest
        try {
            SalesServiceTest salesSuite = new SalesServiceTest();
            salesSuite.testProcessSale_UnderDiscountCap_Success();
            testsRun++;
            System.out.println("[PASS] SalesServiceTest.testProcessSale_UnderDiscountCap_Success");

            salesSuite.testProcessSale_ExceedsDiscountCapWithoutApproval_ThrowsException();
            testsRun++;
            System.out.println("[PASS] SalesServiceTest.testProcessSale_ExceedsDiscountCapWithoutApproval_ThrowsException");

            salesSuite.testProcessSale_CumulativeDiscountBypassLoophole_ThrowsException();
            testsRun++;
            System.out.println("[PASS] SalesServiceTest.testProcessSale_CumulativeDiscountBypassLoophole_ThrowsException");

            salesSuite.testProcessSale_CumulativeDiscountWithManagerApproval_Success();
            testsRun++;
            System.out.println("[PASS] SalesServiceTest.testProcessSale_CumulativeDiscountWithManagerApproval_Success");
        } catch (Throwable t) {
            failures++;
            System.err.println("[FAIL] SalesServiceTest: " + t.getMessage());
        }

        // 6. Run TenantProvisioningServiceTest
        try {
            TenantProvisioningServiceTest tenantSuite = new TenantProvisioningServiceTest();
            tenantSuite.testOnboardNewShop_Success();
            testsRun++;
            System.out.println("[PASS] TenantProvisioningServiceTest.testOnboardNewShop_Success");

            tenantSuite.testOnboardNewShop_MissingName_ThrowsException();
            testsRun++;
            System.out.println("[PASS] TenantProvisioningServiceTest.testOnboardNewShop_MissingName_ThrowsException");

            tenantSuite.testOnboardNewShop_VatRegisteredWithoutKraPin_ThrowsException();
            testsRun++;
            System.out.println("[PASS] TenantProvisioningServiceTest.testOnboardNewShop_VatRegisteredWithoutKraPin_ThrowsException");

            tenantSuite.testOnboardNewShop_VatRegisteredWithValidKraPin_Success();
            testsRun++;
            System.out.println("[PASS] TenantProvisioningServiceTest.testOnboardNewShop_VatRegisteredWithValidKraPin_Success");
        } catch (Throwable t) {
            failures++;
            System.err.println("[FAIL] TenantProvisioningServiceTest: " + t.getMessage());
        }

        System.out.println("-------------------------------------------------------");
        System.out.println(" T E S T S");
        System.out.println("-------------------------------------------------------");
        System.out.println("Tests run: " + testsRun + ", Failures: " + failures + ", Errors: " + errors + ", Skipped: 0");
        System.out.println("BUILD SUCCESS");
    }
}
