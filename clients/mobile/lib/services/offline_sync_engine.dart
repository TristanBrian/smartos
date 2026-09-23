import '../models/sale_envelope.dart';

class OfflineSyncEngine {
  final List<SaleEnvelope> _outbox = [];

  List<SaleEnvelope> get outbox => List.unmodifiable(_outbox);

  void enqueueSale(SaleEnvelope sale) {
    _outbox.add(sale);
  }

  int syncAll() {
    final count = _outbox.length;
    _outbox.clear();
    return count;
  }
}
