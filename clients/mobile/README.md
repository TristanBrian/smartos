# BiasharaOS Flutter Mobile Client & Offline Outbox Engine

The **BiasharaOS Mobile Client** (`clients/mobile`) is a Flutter application designed for handheld Android/iOS POS terminals and smartphones used by Cashiers, Stock Clerks, and Store Owners.

---

## 📱 Mobile Application Features

1. **High-Speed Mobile POS Terminal (`PosScreen`)**:
   - Touch-friendly product grid & category filter.
   - Hard stock oversell prevention validation (`stockOnHand`).
   - Weighted produce (Kg/Litres) support.
   - M-Pesa STK Push payment trigger & cash checkout.
   - Automatic UUID v7 client envelope generation for offline operations.

2. **Handheld Inventory & Stock Ledger (`InventoryScreen`)**:
   - Real-time stock movement ledger logging (`SALE`, `ADJUSTMENT`, `PURCHASE`).
   - Damaged/expired stock write-offs with reason codes.
   - Low stock threshold visual alerts.

3. **Offline SQLite Outbox Engine (`SyncScreen`)**:
   - Zero data loss local SQLite persistence for offline transactions.
   - Background REST sync engine targeting `POST /api/v1/sync/push`.
   - 1-tap manual sync trigger with queue status counter.

4. **RBAC Persona Switcher (`RoleSwitcherScreen`)**:
   - 1-tap switching between pre-configured test personas (`test1admin`, `test1user`, `test2user`).
   - Dynamic tab routing based on active role permissions.

---

## 🛠️ Mobile Project Structure

```text
clients/mobile/
├── lib/
│   ├── models/
│   │   ├── product.dart               # Product domain model
│   │   ├── sale_envelope.dart         # Offline SQLite outbox envelope model
│   │   └── test_user.dart             # Pre-configured RBAC test personas
│   ├── services/
│   │   └── sqlite_outbox_service.dart # SQLite outbox queue & REST sync helper
│   ├── screens/
│   │   ├── pos_screen.dart            # Mobile POS cart & STK push UI
│   │   ├── inventory_screen.dart      # Stock ledger & adjustments screen
│   │   ├── sync_screen.dart           # Offline outbox sync dashboard
│   │   └── role_switcher_screen.dart  # Persona switcher & RBAC screen
│   └── main.dart                      # Flutter app entry point & navigation
├── pubspec.yaml                       # Flutter dependencies specification
└── README.md                          # Mobile documentation
```

---

## 🚀 Running the Mobile App

### Prerequisites
- Flutter SDK `>=3.0.0`
- Android Studio / Xcode / VS Code with Flutter extension

### Launch Commands
```bash
cd clients/mobile

# 1. Fetch dependencies
flutter pub get

# 2. Run on connected device or emulator
flutter run

# 3. Build release APK for Android terminals
flutter build apk --release
```
