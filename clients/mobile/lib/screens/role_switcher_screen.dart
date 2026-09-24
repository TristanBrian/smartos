import 'package:flutter/material.dart';
import '../models/test_user.dart';

class RoleSwitcherScreen extends StatelessWidget {
  final TestUser currentUser;
  final Function(TestUser) onSwitchUser;

  const RoleSwitcherScreen({
    super.key,
    required this.currentUser,
    required this.onSwitchUser,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      color: const Color(0xFF0B0F17),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Test User Identity Switcher (3 Personas)',
            style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 4),
          const Text(
            'Switch active identity live to verify role-based access control (RBAC) on mobile.',
            style: TextStyle(color: Colors.grey, fontSize: 11),
          ),
          const SizedBox(height: 16),
          Expanded(
            child: ListView.builder(
              itemCount: TestUser.testPersonas.length,
              itemBuilder: (context, index) {
                final user = TestUser.testPersonas[index];
                final isActive = user.id == currentUser.id;
                return Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: isActive ? const Color(0xFF10B981).withOpacity(0.15) : const Color(0xFF121824),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: isActive ? const Color(0xFF10B981) : const Color(0xFF2A364F),
                      width: isActive ? 2 : 1,
                    ),
                  ),
                  child: Row(
                    children: [
                      Text(user.avatar, style: const TextStyle(fontSize: 24)),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              user.name,
                              style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                            ),
                            Text(
                              '${user.roleLabel} (${user.role})',
                              style: const TextStyle(color: Color(0xFF10B981), fontSize: 11, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      ),
                      ElevatedButton(
                        onPressed: isActive ? null : () => onSwitchUser(user),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: isActive ? Colors.grey : const Color(0xFF10B981),
                          foregroundColor: Colors.black,
                        ),
                        child: Text(isActive ? 'Active' : 'Switch'),
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
