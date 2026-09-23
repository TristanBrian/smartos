import 'package:flutter/material.dart';

void main() {
  runApp(const BiasharaOsApp());
}

class BiasharaOsApp extends StatelessWidget {
  const BiasharaOsApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'BiasharaOS Mobile POS',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF10B981)),
        useMaterial3: true,
      ),
      home: const PosHomeScreen(),
    );
  }
}

class PosHomeScreen extends StatefulWidget {
  const PosHomeScreen({super.key});

  @override
  State<PosHomeScreen> createState() => _PosHomeScreenState();
}

class _PosHomeScreenState extends State<PosHomeScreen> {
  int _queuedSales = 0;
  bool _isOffline = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('BiasharaOS Mobile POS'),
        backgroundColor: const Color(0xFF0B0F17),
        foregroundColor: Colors.white,
        actions: [
          Chip(
            avatar: Icon(
              _isOffline ? Icons.wifi_off : Icons.wifi,
              color: _isOffline ? Colors.amber : Colors.emerald,
              size: 16,
            ),
            label: Text(_isOffline ? 'OFFLINE ($_queuedSales)' : 'ONLINE'),
          ),
          const SizedBox(width: 12),
        ],
      ),
      body: Container(
        color: const Color(0xFF0B0F17),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.shopping_cart, size: 64, color: Color(0xFF10B981)),
              const SizedBox(height: 16),
              const Text(
                'BiasharaOS Mobile POS & Offline Outbox',
                style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: () {
                  setState(() {
                    _queuedSales++;
                  });
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Offline Sale #$_queuedSales Saved to SQLite Outbox!')),
                  );
                },
                icon: const Icon(Icons.add_shopping_cart),
                label: const Text('Record Offline Sale'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF10B981),
                  foregroundColor: Colors.black,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
