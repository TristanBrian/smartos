import 'package:flutter/material.dart';
import '../models/test_user.dart';

class InventoryScreen extends StatefulWidget {
  final TestUser currentUser;

  const InventoryScreen({super.key, required this.currentUser});

  @override
  State<InventoryScreen> createState() => _InventoryScreenState();
}

class _InventoryScreenState extends State<InventoryScreen> {
  final List<Map<String, dynamic>> _ledger = [
    {
      'id': 'ledg_101',
      'sku': 'BEV-MILK-500ML',
      'name': 'Fresh Milk 500ml',
      'delta': -8,
      'type': 'SALE',
      'timestamp': 'Today, 10:15 AM',
      'actor': 'test2user',
    },
    {
      'id': 'ledg_102',
      'sku': 'HOME-SOAP-500G',
      'name': 'Bar Soap Blue 500g',
      'delta': -2,
      'type': 'ADJUSTMENT',
      'timestamp': 'Today, 09:30 AM',
      'actor': 'test1user',
      'reason': 'Damaged in delivery',
    },
    {
      'id': 'ledg_103',
      'sku': 'FOOD-UNGA-2KG',
      'name': 'Maize Meal Unga 2kg',
      'delta': 50,
      'type': 'PURCHASE',
      'timestamp': 'Yesterday, 04:00 PM',
      'actor': 'test1user',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Container(
      color: const Color(0xFF0B0F17),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.between,
            children: [
              const Text(
                'Stock Ledger & Movements',
                style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
              ),
              Chip(
                backgroundColor: const Color(0xFF121824),
                label: Text(
                  '${_ledger.length} Ledger Records',
                  style: const TextStyle(color: Color(0xFF10B981), fontSize: 11, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Expanded(
            child: ListView.builder(
              itemCount: _ledger.length,
              itemBuilder: (context, index) {
                final item = _ledger[index];
                final isNegative = (item['delta'] as int) < 0;
                return Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFF121824),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: const Color(0xFF2A364F)),
                  ),
                  child: Row(
                    children: [
                      CircleAvatar(
                        radius: 18,
                        backgroundColor: isNegative ? Colors.rose.withOpacity(0.2) : Colors.emerald.withOpacity(0.2),
                        child: Icon(
                          isNegative ? Icons.remove : Icons.add,
                          color: isNegative ? Colors.rose : Colors.emerald,
                          size: 18,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              item['name'],
                              style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                            ),
                            Text(
                              '${item['sku']} • ${item['type']} (${item['actor']})',
                              style: const TextStyle(color: Colors.grey, fontSize: 10),
                            ),
                          ],
                        ),
                      ),
                      Text(
                        '${isNegative ? "" : "+"}${item['delta']}',
                        style: TextStyle(
                          color: isNegative ? Colors.rose : Colors.emerald,
                          fontSize: 14,
                          fontWeight: FontWeight.extrabold,
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
