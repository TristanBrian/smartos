class SaleEnvelope {
  final String clientUuid;
  final String receiptNumber;
  final int grandTotalCents;
  final DateTime timestamp;
  final String paymentMethod;
  final String status;

  SaleEnvelope({
    required this.clientUuid,
    required this.receiptNumber,
    required this.grandTotalCents,
    required this.timestamp,
    required this.paymentMethod,
    this.status = 'PENDING_SYNC',
  });

  Map<String, dynamic> toJson() {
    return {
      'clientUuid': clientUuid,
      'receiptNumber': receiptNumber,
      'grandTotalCents': grandTotalCents,
      'timestamp': timestamp.toIso8601String(),
      'paymentMethod': paymentMethod,
      'status': status,
    };
  }
}
