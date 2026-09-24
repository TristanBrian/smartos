import 'package:flutter/material.dart';
import 'models/test_user.dart';
import 'screens/pos_screen.dart';
import 'screens/inventory_screen.dart';
import 'screens/sync_screen.dart';

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
  bool _isLoggedIn = false;
  TestUser? _currentUser;
  final _usernameController = TextEditingController(text: 'test1user');

  void _showNotification(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: const Color(0xFF10B981),
        duration: const Duration(seconds: 3),
      ),
    );
  }

  void _handleLogin(TestUser targetUser) {
    setState(() {
      _currentUser = targetUser;
      _isLoggedIn = true;
      if (targetUser.role == 'SUPER_ADMIN') {
        _activeTabIndex = 2; // Sync / Admin
      } else if (targetUser.role == 'STOCK_CLERK') {
        _activeTabIndex = 1; // Inventory
      } else {
        _activeTabIndex = 0; // POS Terminal
      }
    });
    _showNotification('Authenticated as ${targetUser.username} (${targetUser.roleLabel})');
  }

  void _handleLogout() {
    setState(() {
      _isLoggedIn = false;
      _currentUser = null;
    });
    _showNotification('Logged out of mobile session.');
  }

  @override
  Widget build(BuildContext context) {
    if (!_isLoggedIn || _currentUser == null) {
      return Scaffold(
        body: Container(
          color: const Color(0xFF0B0F17),
          padding: const EdgeInsets.all(24),
          child: Center(
            child: SingleChildScrollView(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    width: 64,
                    height: 64,
                    decoration: BoxDecoration(
                      color: const Color(0xFF10B981),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Center(
                      child: Text(
                        'B',
                        style: TextStyle(color: Colors.black, fontSize: 32, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'BiasharaOS Mobile',
                    style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Handheld POS & Inventory Terminal',
                    style: TextStyle(color: Colors.grey, fontSize: 12),
                  ),
                  const SizedBox(height: 32),
                  TextField(
                    controller: _usernameController,
                    decoration: InputDecoration(
                      labelText: 'Username',
                      filled: true,
                      fillColor: const Color(0xFF121824),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton(
                      onPressed: () {
                        final matched = TestUser.testPersonas.firstWhere(
                          (u) => u.username.toLowerCase() == _usernameController.text.trim().toLowerCase(),
                          orElse: () => TestUser.testPersonas[1],
                        );
                        _handleLogin(matched);
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF10B981),
                        foregroundColor: Colors.black,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      child: const Text('Sign In to Mobile POS', style: TextStyle(fontWeight: FontWeight.bold)),
                    ),
                  ),
                  const SizedBox(height: 24),
                  const Text(
                    'Demo Accounts Quick-Fill:',
                    style: TextStyle(color: Colors.grey, fontSize: 11),
                  ),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    alignment: WrapAlignment.center,
                    children: TestUser.testPersonas.map((user) => ActionChip(
                      backgroundColor: const Color(0xFF121824),
                      side: const BorderSide(color: Color(0xFF2A364F)),
                      avatar: Text(user.avatar, style: const TextStyle(fontSize: 12)),
                      label: Text(
                        '${user.username} (${user.role})',
                        style: const TextStyle(color: Color(0xFF10B981), fontSize: 11, fontWeight: FontWeight.bold),
                      ),
                      onPressed: () => _handleLogin(user),
                    )).toList(),
                  ),
                ],
              ),
            ),
          ),
        ),
      );
    }

    final screens = [
      PosScreen(currentUser: _currentUser!, showNotification: _showNotification),
      InventoryScreen(currentUser: _currentUser!),
      SyncScreen(showNotification: _showNotification),
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
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: const Color(0xFF121824),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFF2A364F)),
            ),
            child: Row(
              children: [
                Text(_currentUser!.avatar, style: const TextStyle(fontSize: 14)),
                const SizedBox(width: 6),
                Text(
                  _currentUser!.username,
                  style: const TextStyle(color: Color(0xFF10B981), fontSize: 11, fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ),
          IconButton(
            onPressed: _handleLogout,
            icon: const Icon(Icons.logout, color: Colors.rose, size: 20),
            tooltip: 'Log Out',
          ),
          const SizedBox(width: 4),
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
        ],
      ),
    );
  }
}
