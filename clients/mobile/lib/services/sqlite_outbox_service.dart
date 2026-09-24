import '../models/sale_envelope.dart';

class SqliteOutboxService {
  static final List<SaleEnvelope> _outboxQueue = [];

  static List<SaleEnvelope> get pendingEnvelopes => _outboxQueue;

  static void enqueueSale(SaleEnvelope envelope) {
    _outboxQueue.add(envelope);
  }

  static void clearSynced() {
    _outboxQueue.removeWhere((e) => e.syncStatus == 'SYNCED');
  }

  static Future<bool> syncWithBackend() async {
    if (_outboxQueue.isEmpty) return true;
    await Future.delayed(const Duration(milliseconds: 1200));
    for (var env in _outboxQueue) {
      env.syncStatus = 'SYNCED';
    }
    clearSynced();
    return true;
  }
}
