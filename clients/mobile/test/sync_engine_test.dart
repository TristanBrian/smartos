import 'package:flutter_test/flutter_test.dart';
import 'package:biashara_os_mobile/models/sale_envelope.dart';
import 'package:biashara_os_mobile/services/offline_sync_engine.dart';

void main() {
  group('OfflineSyncEngine Tests', () {
    test('Enqueue sale adds envelope to outbox', () {
      final engine = OfflineSyncEngine();
      final sale = SaleEnvelope(
        clientUuid: '018d9812-7391-7000-8000-123456789abc',
        receiptNumber: 'REC-10042',
        grandTotalCents: 15000,
        timestamp: DateTime.now(),
        paymentMethod: 'CASH',
      );

      engine.enqueueSale(sale);
      expect(engine.outbox.length, equals(1));
      expect(engine.outbox.first.receiptNumber, equals('REC-10042'));
    });

    test('Sync all flushes outbox queue', () {
      final engine = OfflineSyncEngine();
      engine.enqueueSale(SaleEnvelope(
        clientUuid: '018d9812-7391-7000-8000-123456789abc',
        receiptNumber: 'REC-10042',
        grandTotalCents: 15000,
        timestamp: DateTime.now(),
        paymentMethod: 'CASH',
      ));

      final syncedCount = engine.syncAll();
      expect(syncedCount, equals(1));
      expect(engine.outbox.isEmpty, isTrue);
    });
  });
}
