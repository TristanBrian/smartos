import 'package:flutter/material.dart';
import 'package:uuid/uuid.dart';
import '../models/product.dart';
import '../models/sale_envelope.dart';
import '../models/test_user.dart';
import '../services/sqlite_outbox_service.dart';

class PosScreen extends StatefulWidget {
  final TestUser currentUser;
  final Function(String) showNotification;

  const PosScreen({
    super.key,
    required this.currentUser,
    required this.showNotification,
  });

  @override
  State<PosScreen> createState() => _PosScreenState();
}

class _PosScreenState extends State<PosScreen> {
  final List<Product> _catalog = [
    Product(
      id: 'prod_001',
      sku: 'BEV-MILK-500ML',
      name: 'Fresh Milk 500ml',
      category: 'Beverages',
      costPriceCents: 5000,
      sellPriceCents: 6500,
      stockOnHand: 42.0,
      uom: 'Pouch',
    ),
    Product(
      id: 'prod_002',
      sku: 'FOOD-UNGA-2KG',
      name: 'Maize Meal Unga 2kg',
      category: 'Food Stuffs',
      costPriceCents: 16000,
      sellPriceCents: 19000,
      stockOnHand: 18.0,
      uom: 'Bag',
    ),
    Product(
      id: 'prod_003',
      sku: 'HOME-SUGAR-1KG',
      name: 'White Sugar 1kg',
      category: 'Household',
      costPriceCents: 13000,
      sellPriceCents: 15500,
      stockOnHand: 25.0,
      uom: 'Pack',
    ),
    Product(
      id: 'prod_004',
      sku: 'PROD-ONION-RED-KG',
      name: 'Red Bulb Onions (Kg)',
      category: 'Produce',
      costPriceCents: 12000,
      sellPriceCents: 17500,
      stockOnHand: 10.0,
      uom: 'Kg',
      isWeighted: true,
    ),
  ];

  final Map<String, int> _cart = {};
  String _paymentMethod = 'MPESA_STK';

  int get _cartTotalCents {
    int total = 0;
    _cart.forEach((sku, qty) {
      final p = _catalog.firstWhere((prod) => prod.sku == sku);
      total += p.sellPriceCents * qty;
    });
    return total;
  }

  void _addToCart(Product product) {
    final currentQty = _cart[product.sku] ?? 0;
    if (currentQty + 1 > product.stockOnHand) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Cannot add more! Only ${product.stockOnHand.toInt()} ${product.uom} available in stock.'),
          backgroundColor: Colors.rose,
        ),
      );
      return;
    }
    setState(() {
      _cart[product.sku] = currentQty + 1;
    });
  }

  void _removeFromCart(String sku) {
    if (!_cart.containsKey(sku)) return;
    setState(() {
      if (_cart[sku]! > 1) {
        _cart[sku] = _cart[sku]! - 1;
      } else {
        _cart.remove(sku);
      }
    });
  }

  void _finalizeCheckout() {
    if (_cart.isEmpty) return;

    // Verify hard oversell prevention
    for (var entry in _cart.entries) {
      final prod = _catalog.firstWhere((p) => p.sku == entry.key);
      if (entry.value > prod.stockOnHand) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Stock error: ${prod.name} has only ${prod.stockOnHand.toInt()} available.'),
            backgroundColor: Colors.rose,
          ),
        );
        return;
      }
    }

    final uuid = const Uuid().v4();
    final receiptNo = 'REC-${10000 + DateTime.now().millisecond}';
    final envelope = SaleEnvelope(
      clientUuid: uuid,
      receiptNumber: receiptNo,
      timestamp: DateTime.now().toIso8601String(),
      grandTotalCents: _cartTotalCents,
      paymentMethod: _paymentMethod,
      itemCount: _cart.values.fold(0, (sum, count) => sum + count),
    );

    // Update catalog stock
    _cart.forEach((sku, qty) {
      final prod = _catalog.firstWhere((p) => p.sku == sku);
      prod.stockOnHand = (prod.stockOnHand - qty).clamp(0.0, 9999.0);
    });

    SqliteOutboxService.enqueueSale(envelope);
    widget.showNotification('Sale $receiptNo completed! Saved to SQLite Outbox.');

    setState(() {
      _cart.clear();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Product Grid List
        Expanded(
          flex: 3,
          child: Container(
            color: const Color(0xFF0B0F17),
            padding: const EdgeInsets.all(12),
            child: GridView.builder(
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                childAspectRatio: 1.3,
                crossAxisSpacing: 10,
                mainAxisSpacing: 10,
              ),
              itemCount: _catalog.length,
              itemBuilder: (context, index) {
                final product = _catalog[index];
                final inCartQty = _cart[product.sku] ?? 0;
                return GestureDetector(
                  onTap: () => _addToCart(product),
                  child: Container(
                    decoration: BoxDecoration(
                      color: const Color(0xFF121824),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: inCartQty > 0 ? const Color(0xFF10B981) : const Color(0xFF2A364F),
                        width: inCartQty > 0 ? 2 : 1,
                      ),
                    ),
                    padding: const EdgeInsets.all(12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.between,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: Colors.emerald.withOpacity(0.2),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                product.category,
                                style: const TextStyle(color: Color(0xFF10B981), fontSize: 9, fontWeight: FontWeight.bold),
                              ),
                            ),
                            Text(
                              'Stock: ${product.stockOnHand.toInt()} ${product.uom}',
                              style: const TextStyle(color: Colors.grey, fontSize: 10),
                            ),
                          ],
                        ),
                        Text(
                          product.name,
                          style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.between,
                          children: [
                            Text(
                              'KSh ${product.sellPriceKSh.toStringAsFixed(2)}',
                              style: const TextStyle(color: Color(0xFF10B981), fontSize: 13, fontWeight: FontWeight.extrabold),
                            ),
                            if (inCartQty > 0)
                              CircleAvatar(
                                radius: 11,
                                backgroundColor: const Color(0xFF10B981),
                                child: Text(
                                  '$inCartQty',
                                  style: const TextStyle(color: Colors.black, fontSize: 11, fontWeight: FontWeight.bold),
                                ),
                              ),
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ),

        // Cart Drawer & Checkout Bar
        Container(
          padding: const EdgeInsets.all(16),
          decoration: const BoxDecoration(
            color: Color(0xFF121824),
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
            border: Border(top: BorderSide(color: Color(0xFF2A364F))),
          ),
          child: SafeArea(
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.between,
                  children: [
                    const Text(
                      'Cart Summary',
                      style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                    ),
                    Text(
                      '${_cart.values.fold(0, (sum, q) => sum + q)} Items Selected',
                      style: const TextStyle(color: Colors.grey, fontSize: 12),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.between,
                  children: [
                    const Text(
                      'Grand Total',
                      style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                    Text(
                      'KSh ${(_cartTotalCents / 100.0).toStringAsFixed(2)}',
                      style: const TextStyle(color: Color(0xFF10B981), fontSize: 22, fontWeight: FontWeight.extrabold),
                    ),
                  ],
                ),
                const SizedBox(height: 14),
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton.icon(
                    onPressed: _cart.isEmpty ? null : _finalizeCheckout,
                    icon: const Icon(Icons.flash_on),
                    label: Text(
                      _cart.isEmpty ? 'Cart is Empty' : 'Checkout & Pay (M-Pesa / Cash)',
                      style: const TextStyle(fontWeight: FontWeight.extrabold, fontSize: 14),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF10B981),
                      foregroundColor: Colors.black,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
