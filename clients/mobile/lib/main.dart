import 'package:flutter/material.dart';
import 'models/test_user.dart';
import 'screens/pos_screen.dart';
import 'screens/inventory_screen.dart';
import 'screens/sync_screen.dart';
import 'screens/role_switcher_screen.dart';

void main() {
  runApp(const BiasharaOsMobileApp());
}

class BiasharaOsMobileApp extends StatelessWidget {
  const BiasharaOsMobileApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'BiasharaOS Mobile POS',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF0B0F17),
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF10B981),
          brightness: Brightness.dark,
        ),
        useMaterial3: true,
      ),
      home: const MainMobileDashboard(),
    );
  }
}

class MainMobileDashboard extends StatefulWidget {
  const MainMobileDashboard({super.key});

  @override
  State<MainMobileDashboard> createState() => _MainMobileDashboardState();
}

class _MainMobileDashboardState extends State<MainMobileDashboard> {
  int _activeTabIndex = 0;
  TestUser _currentUser = TestUser.testPersonas[0]; // test1admin

  void _showNotification(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: const Color(0xFF10B981),
        duration: const Duration(seconds: 3),
      ),
    );
  }

  void _handleSwitchUser(TestUser newUser) {
    setState(() {
      _currentUser = newUser;
      // Auto-route persona to their primary mobile view
      if (newUser.role == 'SUPER_ADMIN') {
        _activeTabIndex = 3; // Roles & Admin
      } else if (newUser.role == 'STOCK_CLERK') {
        _activeTabIndex = 1; // Inventory
      } else {
        _activeTabIndex = 0; // POS Terminal
      }
    });
    _showNotification('Switched active identity to ${newUser.name} (${newUser.roleLabel})');
  }

  @override
  Widget build(BuildContext context) {
    final screens = [
      PosScreen(currentUser: _currentUser, showNotification: _showNotification),
      InventoryScreen(currentUser: _currentUser),
      SyncScreen(showNotification: _showNotification),
      RoleSwitcherScreen(currentUser: _currentUser, onSwitchUser: _handleSwitchUser),
    ];

    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color(0xFF0B0F17),
        elevation: 0,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: const Color(0xFF10B981),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Text('B', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 14)),
            ),
            const SizedBox(width: 8),
            const Text(
              'BiasharaOS POS',
              style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
            ),
          ],
        ),
        actions: [
          GestureDetector(
            onTap: () {
              setState(() {
                _activeTabIndex = 3; // Switch tab to Roles
              });
            },
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              margin: const EdgeInsets.only(right: 12),
              decoration: BoxDecoration(
                color: const Color(0xFF121824),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFF2A364F)),
              ),
              child: Row(
                children: [
                  Text(_currentUser.avatar, style: const TextStyle(fontSize: 14)),
                  const SizedBox(width: 6),
                  Text(
                    _currentUser.name,
                    style: const TextStyle(color: Color(0xFF10B981), fontSize: 11, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
      body: IndexedStack(
        index: _activeTabIndex,
        children: screens,
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _activeTabIndex,
        onTap: (index) {
          setState(() {
            _activeTabIndex = index;
          });
        },
        backgroundColor: const Color(0xFF121824),
        selectedItemColor: const Color(0xFF10B981),
        unselectedItemColor: Colors.grey,
        type: BottomNavigationBarType.fixed,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.shopping_cart),
            label: 'POS',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.inventory_2),
            label: 'Stock Ledger',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.cloud_sync),
            label: 'Offline Sync',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.admin_panel_settings),
            label: 'Roles & Admin',
          ),
        ],
      ),
    );
  }
}
