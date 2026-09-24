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
    actorName: "Grace Wanjiru"
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
    actorName: "Kevin Omondi (Cashier)"
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
    actorName: "Grace Wanjiru",
    reason: "Damaged during delivery"
  }
];

export const INITIAL_SALES = [
  {
    id: "sale_10042",
    receiptNumber: "REC-10042",
    timestamp: "2026-09-23T10:15:00Z",
    cashierName: "Kevin Omondi",
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
    cashierName: "Kevin Omondi",
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
    name: "Grace Wanjiru",
    phone: "+254 722 123 456",
    role: "OWNER",
    location: "Main Branch (Nakuru)",
    status: "ACTIVE",
    salesTodayCents: 0,
    commissionEarnedCents: 0
  },
  {
    id: "stf_02",
    name: "Kevin Omondi",
    phone: "+254 712 345 678",
    role: "CASHIER",
    location: "Main Branch (Nakuru)",
    status: "ACTIVE",
    salesTodayCents: 47000,
    commissionEarnedCents: 940 // 2% commission
  },
  {
    id: "stf_03",
    name: "Samuel Kiptoo",
    phone: "+254 720 987 123",
    role: "STOCK_CLERK",
    location: "Warehouse Branch",
    status: "ACTIVE",
    salesTodayCents: 0,
    commissionEarnedCents: 0
  }
];

export const INITIAL_CASH_DEPOSITS = [
  {
    id: "cdep_001",
    refNumber: "DEP-20260923-01",
    timestamp: "2026-09-23T08:00:00Z",
    depositorName: "Grace Wanjiru",
    type: "TILL_FLOAT",
    amountCents: 500000, // KSh 5,000.00
    notes: "Morning Till Opening Float",
    status: "VERIFIED"
  },
  {
    id: "cdep_002",
    refNumber: "DEP-20260923-02",
    timestamp: "2026-09-23T14:30:00Z",
    depositorName: "Kevin Omondi",
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

