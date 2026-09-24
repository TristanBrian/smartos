class Product {
  final String id;
  final String sku;
  final String name;
  final String category;
  final int costPriceCents;
  final int sellPriceCents;
  double stockOnHand;
  final String uom;
  final bool isWeighted;

  Product({
    required this.id,
    required this.sku,
    required this.name,
    required this.category,
    required this.costPriceCents,
    required this.sellPriceCents,
    required this.stockOnHand,
    required this.uom,
    this.isWeighted = false,
  });

  double get sellPriceKSh => sellPriceCents / 100.0;
}
