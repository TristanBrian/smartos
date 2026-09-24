import 'package:flutter/material.dart';
import '../services/sqlite_outbox_service.dart';

class SyncScreen extends StatefulWidget {
  final Function(String) showNotification;

  const SyncScreen({super.key, required this.showNotification});

  @override
  State<SyncScreen> createState() => _SyncScreenState();
}

class _SyncScreenState extends State<SyncScreen> {
  bool _isSyncing = false;

  void _triggerSync() async {
    final pending = SqliteOutboxService.pendingEnvelopes;
    if (pending.isEmpty) {
      widget.showNotification('SQLite Outbox is empty. No pending envelopes to sync.');
      return;
    }

    setState(() {
      _isSyncing = true;
    });

    await SqliteOutboxService.syncWithBackend();

    setState(() {
      _isSyncing = false;
    });

    widget.showNotification('Successfully synced offline envelopes to backend REST API (/api/v1/sync/push)!');
  }

  @override
  Widget build(BuildContext context) {
    final pending = SqliteOutboxService.pendingEnvelopes;
    return Container(
      color: const Color(0xFF0B0F17),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF121824),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFF2A364F)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.between,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'SQLite Outbox Queue',
                      style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${pending.length} Pending Envelopes Queued',
                      style: const TextStyle(color: Colors.grey, fontSize: 12),
                    ),
                  ],
                ),
                ElevatedButton.icon(
                  onPressed: _isSyncing ? null : _triggerSync,
                  icon: _isSyncing
                      ? const SizedBox(
                          width: 14,
                          height: 14,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black),
                        )
                      : const Icon(Icons.sync),
                  label: Text(_isSyncing ? 'Syncing...' : 'Sync Now'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF10B981),
                    foregroundColor: Colors.black,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          const Text(
            'Outbox Envelopes',
            style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          Expanded(
            child: pending.isEmpty
                ? const Center(
                    child: Text(
                      'All offline transactions synced! SQLite outbox clean.',
                      style: TextStyle(color: Colors.grey, fontSize: 13),
                    ),
                  )
                : ListView.builder(
                    itemCount: pending.length,
                    itemBuilder: (context, index) {
                      final envelope = pending[index];
                      return Container(
                        margin: const EdgeInsets.only(bottom: 8),
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: const Color(0xFF121824),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: const Color(0xFF2A364F)),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.between,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Receipt ${envelope.receiptNumber}',
                                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                                ),
                                Text(
                                  'UUID: ${envelope.clientUuid.substring(0, 18)}...',
                                  style: const TextStyle(color: Colors.grey, fontSize: 10),
                                ),
                              ],
                            ),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Text(
                                  'KSh ${envelope.grandTotalKSh.toStringAsFixed(2)}',
                                  style: const TextStyle(color: Color(0xFF10B981), fontWeight: FontWeight.extrabold, fontSize: 13),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: Colors.amber.withOpacity(0.2),
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: Text(
                                    envelope.syncStatus,
                                    style: const TextStyle(color: Colors.amber, fontSize: 9, fontWeight: FontWeight.bold),
                                  ),
                                ),
                              ],
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
