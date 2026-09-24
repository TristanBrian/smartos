class SaleEnvelope {
  final String clientUuid;
  final String receiptNumber;
  final String timestamp;
  final int grandTotalCents;
  final String paymentMethod;
  final int itemCount;
  String syncStatus;

  SaleEnvelope({
    required this.clientUuid,
    required this.receiptNumber,
    required this.timestamp,
    required this.grandTotalCents,
    required this.paymentMethod,
    required this.itemCount,
    this.syncStatus = 'PENDING',
  });

  double get grandTotalKSh => grandTotalCents / 100.0;
}
