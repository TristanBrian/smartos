// BiasharaOS Mock Data & Initial State for Kenya Phase 1 Tenants

export const INITIAL_TENANTS = [
  {
    id: "t_duka_nakuru",
    name: "Mama Grace Shop & General Merchants",
    type: "Retail Duka",
    county: "Nakuru",
    ownerName: "Grace Wanjiru",
    phone: "+254 722 123 456",
    tier: "LITE",
    isVatRegistered: false,
    kraPin: "A019827364Z",
    etimsDevice: "OSCU-NK01-089",
    mpesaPaybill: "748912",
    mpesaTill: "891234",
    allowOversell: false,
    reorderSmsEnabled: true,
    createdDate: "2026-01-15",
    currency: "KSh"
  },
  {
    id: "t_pharmacy_nrb",
    name: "Aisha Central Chemist & Health",
    type: "Pharmacy",
    county: "Nairobi",
    ownerName: "Aisha Mohamed",
    phone: "+254 733 987 654",
    tier: "MAX",
    isVatRegistered: true,
    kraPin: "P051884920K",
    etimsDevice: "OSCU-NRB-304",
    mpesaPaybill: "522522",
    mpesaTill: "900123",
    allowOversell: false,
    reorderSmsEnabled: true,
    createdDate: "2026-02-01",
    currency: "KSh"
  }
];

export const INITIAL_PRODUCTS = [
  {
    id: "prod_001",
    sku: "BEV-MILK-500ML",
    name: "Fresh Milk 500ml (Pouch)",
    category: "Beverages & Dairy",
    barcode: "616110001201",
    uom: "Pouch",
    costPriceCents: 5500, // KSh 55.00
    sellPriceCents: 6500, // KSh 65.00
    vatRate: 0, // Zero rated
    stockOnHand: 42,
    reorderThreshold: 15,
    lastRestockDate: "2026-09-20",
    daysNoSale: 0
  },
  {
    id: "prod_002",
    sku: "FOOD-UNGA-2KG",
    name: "Maize Meal Unga 2kg",
    category: "Grains & Flour",
    barcode: "616110003402",
    uom: "Packet",
    costPriceCents: 16000, // KSh 160.00
    sellPriceCents: 19000, // KSh 190.00
    vatRate: 16,
    stockOnHand: 8, // Low stock trigger!
    reorderThreshold: 20,
    lastRestockDate: "2026-09-18",
    daysNoSale: 1
  },
  {
    id: "prod_003",
    sku: "HOME-SUGAR-1KG",
    name: "White Refined Sugar 1kg",
    category: "Pantry Essentials",
    barcode: "616110005503",
    uom: "Kg",
    costPriceCents: 13500, // KSh 135.00
    sellPriceCents: 15500, // KSh 155.00
    vatRate: 16,
    stockOnHand: 65,
    reorderThreshold: 10,
    lastRestockDate: "2026-09-22",
    daysNoSale: 0
  },
  {
    id: "prod_004",
    sku: "MED-PANADOL-500MG",
    name: "Panadol Extra 500mg (Strip of 10)",
    category: "Pharmaceuticals",
    barcode: "616110007804",
    uom: "Strip",
    costPriceCents: 12000, // KSh 120.00
    sellPriceCents: 16000, // KSh 160.00
    vatRate: 0,
    stockOnHand: 120,
    reorderThreshold: 25,
    lastRestockDate: "2026-09-10",
    daysNoSale: 2
  },
  {
    id: "prod_005",
    sku: "HOME-SOAP-500G",
    name: "Bar Soap Blue 500g",
    category: "Household",
    barcode: "616110009905",
    uom: "Bar",
    costPriceCents: 9000,
    sellPriceCents: 11500,
    vatRate: 16,
    stockOnHand: 3, // Critical low stock
    reorderThreshold: 10,
    lastRestockDate: "2026-09-01",
    daysNoSale: 4
  },
  {
    id: "prod_006",
    sku: "SLOW-KETTLE-CABLE",
    name: "Electric Kettle Heating Cable (Spare)",
    category: "Electricals",
    barcode: "616110008811",
    uom: "Piece",
    costPriceCents: 35000,
    sellPriceCents: 50000,
    vatRate: 16,
    stockOnHand: 14,
    reorderThreshold: 2,
    lastRestockDate: "2026-05-10",
    daysNoSale: 68 // Slow mover! (>60 days)
  },
  {
    id: "prod_007",
    sku: "DEAD-CANDLE-VINTAGE",
    name: "Decorative Lantern Candle (Red)",
    category: "Decor",
    barcode: "616110007722",
    uom: "Piece",
    costPriceCents: 45000,
    sellPriceCents: 75000,
    vatRate: 16,
    stockOnHand: 9,
    reorderThreshold: 2,
    lastRestockDate: "2026-03-01",
    daysNoSale: 135 // Dead stock! (>120 days)
  },
  {
    id: "prod_008",
    sku: "VEG-RED-ONIONS-KG",
    name: "Fresh Red Onions (per Kg)",
    category: "Fresh Produce",
    barcode: "616110009008",
    uom: "Kg",
    costPriceCents: 9000, // KSh 90.00 / Kg
    sellPriceCents: 12000, // KSh 120.00 / Kg
    vatRate: 0,
    stockOnHand: 45.5, // Fractional stock
    reorderThreshold: 10,
    lastRestockDate: "2026-09-23",
    daysNoSale: 0
  },
  {
    id: "prod_009",
    sku: "VEG-FARM-TOMATOES-KG",
    name: "Ripe Farm Tomatoes (per Kg)",
    category: "Fresh Produce",
    barcode: "616110009009",
    uom: "Kg",
    costPriceCents: 10000, // KSh 100.00 / Kg
    sellPriceCents: 14000, // KSh 140.00 / Kg
    vatRate: 0,
    stockOnHand: 32.0,
    reorderThreshold: 8,
    lastRestockDate: "2026-09-24",
    daysNoSale: 0
  }
];

export const INITIAL_LEDGER_ENTRIES = [
  {
    id: "ledg_101",
    timestamp: "2026-09-23T08:30:00Z",
    type: "OPENING_BALANCE",
    productSku: "BEV-MILK-500ML",
    productName: "Fresh Milk 500ml (Pouch)",
    delta: 50,
    runningBalance: 50,
    refDocument: "INV-REC-2026-001",
    actorName: "test1user"
  },
  {
    id: "ledg_102",
    timestamp: "2026-09-23T10:15:00Z",
    type: "SALE",
    productSku: "BEV-MILK-500ML",
    productName: "Fresh Milk 500ml (Pouch)",
    delta: -8,
    runningBalance: 42,
    refDocument: "REC-10042",
    actorName: "test2user (Cashier)"
  },
  {
    id: "ledg_103",
    timestamp: "2026-09-23T11:00:00Z",
    type: "ADJUSTMENT",
    productSku: "HOME-SOAP-500G",
    productName: "Bar Soap Blue 500g",
    delta: -2,
    runningBalance: 3,
    refDocument: "ADJ-REASON-DAMAGED",
    actorName: "test1user",
    reason: "Damaged during delivery"
  }
];

export const INITIAL_SALES = [
  {
    id: "sale_10042",
    receiptNumber: "REC-10042",
    timestamp: "2026-09-23T10:15:00Z",
    cashierName: "test2user",
    items: [
      { sku: "BEV-MILK-500ML", name: "Fresh Milk 500ml", qty: 2, unitPriceCents: 6500, lineTotalCents: 13000 },
      { sku: "FOOD-UNGA-2KG", name: "Maize Meal Unga 2kg", qty: 1, unitPriceCents: 19000, lineTotalCents: 19000 }
    ],
    subtotalCents: 32000,
    discountCents: 0,
    taxCents: 2621,
    grandTotalCents: 32000,
    paymentMethod: "MPESA_STK",
    paymentStatus: "COMPLETED",
    mpesaTransId: "QEH9182371",
    etimsStatus: "ACCEPTED",
    etimsInvoiceNo: "000000000000010042",
    etimsQrCode: "https://etims.kra.go.ke/qr/000000000000010042",
    isOfflineCaptured: false
  },
  {
    id: "sale_10041",
    receiptNumber: "REC-10041",
    timestamp: "2026-09-23T09:40:00Z",
    cashierName: "test2user",
    items: [
      { sku: "HOME-SUGAR-1KG", name: "White Refined Sugar 1kg", qty: 1, unitPriceCents: 15500, lineTotalCents: 15500 }
    ],
    subtotalCents: 15500,
    discountCents: 500,
    taxCents: 2068,
    grandTotalCents: 15000,
    paymentMethod: "CASH",
    paymentStatus: "COMPLETED",
    etimsStatus: "ACCEPTED",
    etimsInvoiceNo: "000000000000010041",
    isOfflineCaptured: true
  }
];

export const INITIAL_MPESA_TRANSACTIONS = [
  {
    transId: "QEH9182371",
    receiptNo: "REC-10042",
    timestamp: "2026-09-23T10:15:12Z",
    phone: "+254 722 000 111",
    amountCents: 32000,
    status: "MATCHED",
    type: "STK_PUSH"
  },
  {
    transId: "QEH9928104",
    receiptNo: "UNMATCHED",
    timestamp: "2026-09-23T11:05:00Z",
    phone: "+254 711 444 888",
    amountCents: 19000,
    status: "UNMATCHED",
    type: "C2B_PAYBILL"
  }
];

export const INITIAL_ETIMS_QUEUE = [
  {
    id: "etims_001",
    saleReceipt: "REC-10042",
    timestamp: "2026-09-23T10:15:20Z",
    invoiceNo: "000000000000010042",
    kraStatus: "ACCEPTED",
    attempts: 1,
    lastResponse: "ACCEPTED_BY_OSCU",
    qrSignature: "KRA-OSCU-VERIFIED-981273918237"
  },
  {
    id: "etims_002",
    saleReceipt: "REC-10040",
    timestamp: "2026-09-23T08:10:00Z",
    invoiceNo: "PENDING",
    kraStatus: "RETRY_QUEUED",
    attempts: 2,
    lastResponse: "503 OSCU Gateway Busy - Retrying in 5m",
    qrSignature: null
  }
];

export const INITIAL_STAFF = [
  {
    id: "stf_01",
    name: "test1user",
    phone: "+254 722 000 111",
    role: "OWNER",
    location: "Main Branch (Nakuru)",
    status: "ACTIVE",
    salesTodayCents: 0,
    commissionEarnedCents: 0
  },
  {
    id: "stf_02",
    name: "test2user",
    phone: "+254 712 000 222",
    role: "CASHIER",
    location: "Main Branch (Nakuru)",
    status: "ACTIVE",
    salesTodayCents: 47000,
    commissionEarnedCents: 940
  }
];

export const INITIAL_CASH_DEPOSITS = [
  {
    id: "cdep_001",
    refNumber: "DEP-20260923-01",
    timestamp: "2026-09-23T08:00:00Z",
    depositorName: "test1user",
    type: "TILL_FLOAT",
    amountCents: 500000, // KSh 5,000.00
    notes: "Morning Till Opening Float",
    status: "VERIFIED"
  },
  {
    id: "cdep_002",
    refNumber: "DEP-20260923-02",
    timestamp: "2026-09-23T14:30:00Z",
    depositorName: "test2user",
    type: "BANK_DEPOSIT",
    amountCents: 1500000, // KSh 15,000.00
    notes: "Midday Cash Drawer Banking (KCB Bank)",
    status: "VERIFIED"
  }
];

export const SUBSCRIPTION_TIERS = {
  FREE: { name: "Free", priceMonthlyKSh: 0, maxLocations: 1, maxProducts: 50, maxStaff: 1, eTimsIncluded: false },
  LITE: { name: "Biashara Lite", priceMonthlyKSh: 299, maxLocations: 1, maxProducts: 500, maxStaff: 2, eTimsIncluded: true },
  PRO: { name: "Biashara Pro", priceMonthlyKSh: 599, maxLocations: 3, maxProducts: "Unlimited", maxStaff: 10, eTimsIncluded: true },
  MAX: { name: "Biashara Max", priceMonthlyKSh: 1299, maxLocations: "Unlimited", maxProducts: "Unlimited", maxStaff: "Unlimited", eTimsIncluded: true }
};

export const TEST_USERS = [
  {
    id: "usr_001",
    username: "test1admin",
    name: "test1admin",
    email: "test1admin@biasharaos.com",
    role: "SUPER_ADMIN",
    roleLabel: "Platform Admin",
    avatar: "👑",
    phone: "+254 700 000 001",
    shopId: "all",
    badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/40",
    description: "Platform Admin. Full access to cross-tenant observability, shop onboarding & support impersonation."
  },
  {
    id: "usr_002",
    username: "test1user",
    name: "test1user",
    email: "test1user@biasharaos.com",
    role: "OWNER",
    roleLabel: "Shop Owner / Admin",
    avatar: "🏢",
    phone: "+254 722 000 111",
    shopId: "t_duka_nakuru",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    description: "Shop Admin for Nakuru Fresh Duka. Full access to POS, Inventory, Payments, eTIMS, Staff, Profile & Reports."
  },
  {
    id: "usr_003",
    username: "test2user",
    name: "test2user",
    email: "test2user@biasharaos.com",
    role: "CASHIER",
    roleLabel: "Store Cashier",
    avatar: "💳",
    phone: "+254 712 000 222",
    shopId: "t_duka_nakuru",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    description: "Front-desk Till Operator. Operates POS checkout & M-Pesa receipt reconciliation. Restricted from stock write-offs & config."
  }
];

export const ROLE_PERMISSIONS_MATRIX = {
  SUPER_ADMIN: {
    allowedTabs: ['POS', 'INVENTORY', 'PAYMENTS', 'ETIMS', 'SYNC', 'STAFF', 'PROFILE', 'REPORTS', 'ADMIN'],
    canProcessSales: true,
    canOverrideDiscount: true,
    canAdjustStock: true,
    canManageStaff: true,
    canEditStoreProfile: true,
    canAccessPlatformAdmin: true,
    canAuditImpersonate: true,
    isReadOnly: false
  },
  OWNER: {
    allowedTabs: ['POS', 'INVENTORY', 'PAYMENTS', 'ETIMS', 'SYNC', 'STAFF', 'PROFILE', 'REPORTS'],
    canProcessSales: true,
    canOverrideDiscount: true,
    canAdjustStock: true,
    canManageStaff: true,
    canEditStoreProfile: true,
    canAccessPlatformAdmin: false,
    canAuditImpersonate: false,
    isReadOnly: false
  },
  MANAGER: {
    allowedTabs: ['POS', 'INVENTORY', 'PAYMENTS', 'ETIMS', 'SYNC', 'STAFF', 'REPORTS'],
    canProcessSales: true,
    canOverrideDiscount: true,
    canAdjustStock: true,
    canManageStaff: true,
    canEditStoreProfile: false,
    canAccessPlatformAdmin: false,
    canAuditImpersonate: false,
    isReadOnly: false
  },
  CASHIER: {
    allowedTabs: ['POS', 'PAYMENTS', 'SYNC'],
    canProcessSales: true,
    canOverrideDiscount: false,
    canAdjustStock: false,
    canManageStaff: false,
    canEditStoreProfile: false,
    canAccessPlatformAdmin: false,
    canAuditImpersonate: false,
    isReadOnly: false
  },
  STOCK_CLERK: {
    allowedTabs: ['INVENTORY', 'SYNC'],
    canProcessSales: false,
    canOverrideDiscount: false,
    canAdjustStock: true,
    canManageStaff: false,
    canEditStoreProfile: false,
    canAccessPlatformAdmin: false,
    canAuditImpersonate: false,
    isReadOnly: false
  },
  AUDITOR: {
    allowedTabs: ['PAYMENTS', 'ETIMS', 'REPORTS', 'SYNC'],
    canProcessSales: false,
    canOverrideDiscount: false,
    canAdjustStock: false,
    canManageStaff: false,
    canEditStoreProfile: false,
    canAccessPlatformAdmin: false,
    canAuditImpersonate: false,
    isReadOnly: true
  }
};


