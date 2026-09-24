class TestUser {
  final String id;
  final String username;
  final String name;
  final String role;
  final String roleLabel;
  final String avatar;
  final List<String> allowedTabs;

  TestUser({
    required this.id,
    required this.username,
    required this.name,
    required this.role,
    required this.roleLabel,
    required this.avatar,
    required this.allowedTabs,
  });

  static final List<TestUser> testPersonas = [
    TestUser(
      id: 'usr_001',
      username: 'test1admin',
      name: 'test1admin',
      role: 'SUPER_ADMIN',
      roleLabel: 'Platform Admin',
      avatar: '👑',
      allowedTabs: ['POS', 'INVENTORY', 'SYNC', 'ADMIN'],
    ),
    TestUser(
      id: 'usr_002',
      username: 'test1user',
      name: 'test1user',
      role: 'OWNER',
      roleLabel: 'Shop Owner / Admin',
      avatar: '🏢',
      allowedTabs: ['POS', 'INVENTORY', 'SYNC'],
    ),
    TestUser(
      id: 'usr_003',
      username: 'test2user',
      name: 'test2user',
      role: 'CASHIER',
      roleLabel: 'Store Cashier',
      avatar: '💳',
      allowedTabs: ['POS', 'SYNC'],
    ),
  ];
}
