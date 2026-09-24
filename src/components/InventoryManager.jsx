import React, { useState } from 'react';
import {
  Package, Plus, AlertCircle, TrendingDown, ArrowRightLeft,
  ShieldAlert, History, Edit3, CheckCircle2, Image, Upload,
  MinusCircle, PlusCircle, ArrowDown, ArrowUp
} from 'lucide-react';

export default function InventoryManager({ products, ledgerEntries, onAddProduct, onUpdateStock, activeTenant }) {
  const [activeTab, setActiveTab] = useState('CATALOG'); // CATALOG, LEDGER, INTELLIGENCE, TRANSFERS
  const [search, setSearch] = useState('');

  // Stock Adjustment Modal State
  const [adjustmentModal, setAdjustmentModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deltaQtyInput, setDeltaQtyInput] = useState(1);
  const [adjustmentDirection, setAdjustmentDirection] = useState('DECREASE'); // 'DECREASE' or 'INCREASE'
  const [adjustmentReason, setAdjustmentReason] = useState('Damaged stock');

  // New Product Modal State
  const [newProductModal, setNewProductModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    sku: '',
    name: '',
    category: 'General',
    barcode: '',
    uom: 'Piece',
    costPriceKSh: '',
    sellPriceKSh: '',
    vatRate: 0,
    stockOnHand: 10,
    reorderThreshold: 5,
    imageUrl: ''
  });

  const lowStockItems = products.filter(p => p.stockOnHand <= p.reorderThreshold);
  const slowMovers = products.filter(p => p.daysNoSale >= 60 && p.daysNoSale < 120);
  const deadStock = products.filter(p => p.daysNoSale >= 120 && p.stockOnHand > 0);

  // Handle reason change and auto-set adjustment direction
  const handleReasonChange = (reason) => {
    setAdjustmentReason(reason);

    // Auto-set direction based on reason code
    if (
      reason === 'Damaged stock' ||
      reason === 'Expired product' ||
      reason === 'Internal usage / Shrinkage' ||
      reason === 'Return to supplier'
    ) {
      setAdjustmentDirection('DECREASE');
    } else if (
      reason === 'Restock / Supplier bonus' ||
      reason === 'Physical count variance (Found stock)'
    ) {
      setAdjustmentDirection('INCREASE');
    }
  };

  const handleOpenAdjustment = (prod) => {
    setSelectedProduct(prod);
    setDeltaQtyInput(1);
    setAdjustmentReason('Damaged stock');
    setAdjustmentDirection('DECREASE');
    setAdjustmentModal(true);
  };

  const handleSaveAdjustment = () => {
    if (!selectedProduct || deltaQtyInput <= 0) return;

    // Calculate exact signed delta (Negative for Expired/Damaged, Positive for Restock)
    const qty = Math.abs(parseInt(deltaQtyInput) || 0);
    const signedDelta = adjustmentDirection === 'DECREASE' ? -qty : qty;

    onUpdateStock({
      productId: selectedProduct.id,
      productSku: selectedProduct.sku,
      productName: selectedProduct.name,
      delta: signedDelta,
      type: adjustmentDirection === 'DECREASE' ? 'LOSS_WRITE_OFF' : 'RESTOCK',
      reason: `${adjustmentReason} (${adjustmentDirection === 'DECREASE' ? '-' : '+'}${qty} ${selectedProduct.uom})`,
      actorName: 'Grace Wanjiru (Owner)'
    });

    setAdjustmentModal(false);
    setSelectedProduct(null);
    setDeltaQtyInput(1);
  };

  // Image Upload Handler
  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct(prev => ({ ...prev, imageUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateProduct = (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.sku) return;

    const created = {
      id: `prod_${Date.now()}`,
      sku: newProduct.sku,
      name: newProduct.name,
      category: newProduct.category,
      barcode: newProduct.barcode || `${Math.floor(616110000000 + Math.random() * 999999)}`,
      uom: newProduct.uom,
      costPriceCents: Math.round(parseFloat(newProduct.costPriceKSh || 0) * 100),
      sellPriceCents: Math.round(parseFloat(newProduct.sellPriceKSh || 0) * 100),
      vatRate: parseInt(newProduct.vatRate),
      stockOnHand: parseInt(newProduct.stockOnHand),
      reorderThreshold: parseInt(newProduct.reorderThreshold),
      lastRestockDate: new Date().toISOString().split('T')[0],
      daysNoSale: 0,
      imageUrl: newProduct.imageUrl || null
    };

    onAddProduct(created);
    setNewProductModal(false);
    setNewProduct({
      sku: '', name: '', category: 'General', barcode: '', uom: 'Piece',
      costPriceKSh: '', sellPriceKSh: '', vatRate: 0, stockOnHand: 10, reorderThreshold: 5, imageUrl: ''
    });
  };

  // Live adjustment calculations
  const rawQty = Math.abs(parseInt(deltaQtyInput) || 0);
  const signedDelta = adjustmentDirection === 'DECREASE' ? -rawQty : rawQty;
  const newStockPreview = selectedProduct ? Math.max(0, selectedProduct.stockOnHand + signedDelta) : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner & Sub-Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 font-display">
            <Package className="w-6 h-6 text-emerald-400" /> Inventory Intelligence & Ledger
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Append-only stock ledger, write-off controls for expired/damaged items, and product catalog.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setNewProductModal(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add New SKU
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex gap-2 border-b border-[#2A364F] pb-3">
        {[
          { id: 'CATALOG', label: 'Product Catalog', icon: Package, badge: products.length },
          { id: 'LEDGER', label: 'Stock Ledger (Audit)', icon: History, badge: ledgerEntries.length },
          { id: 'INTELLIGENCE', label: 'Slow & Dead Stock AI', icon: TrendingDown, badge: slowMovers.length + deadStock.length },
          { id: 'TRANSFERS', label: 'Inter-Branch Stock', icon: ArrowRightLeft }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#121824]'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.badge !== undefined && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                tab.id === 'INTELLIGENCE' && tab.badge > 0 ? 'bg-amber-500/30 text-amber-300' : 'bg-slate-800 text-slate-300'
              }`}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab 1: Catalog */}
      {activeTab === 'CATALOG' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <input
              type="text"
              placeholder="Search catalog by SKU, barcode, or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#121824] border border-[#2A364F] rounded-xl px-4 py-2 text-xs text-slate-100 placeholder-slate-400 w-72 focus:outline-none focus:border-emerald-500"
            />
            <div className="text-xs text-slate-400">
              Total SKUs: <strong className="text-slate-200">{products.length}</strong> | 
              Low Stock Alerts: <strong className="text-amber-400">{lowStockItems.length}</strong>
            </div>
          </div>

          <div className="glass-panel rounded-2xl overflow-hidden border border-[#2A364F]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#121824] text-slate-400 font-semibold border-b border-[#2A364F]">
                <tr>
                  <th className="p-3.5">PHOTO</th>
                  <th className="p-3.5">SKU / BARCODE</th>
                  <th className="p-3.5">PRODUCT NAME</th>
                  <th className="p-3.5">CATEGORY</th>
                  <th className="p-3.5 text-right">COST PRICE</th>
                  <th className="p-3.5 text-right">SELL PRICE</th>
                  <th className="p-3.5 text-center">STOCK ON HAND</th>
                  <th className="p-3.5 text-center">REORDER LEV</th>
                  <th className="p-3.5 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {products
                  .filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()))
                  .map(prod => {
                    const isLow = prod.stockOnHand <= prod.reorderThreshold;
                    return (
                      <tr key={prod.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-3.5">
                          {prod.imageUrl ? (
                            <img src={prod.imageUrl} alt={prod.name} className="w-9 h-9 rounded-lg object-cover border border-[#2A364F]" />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-[#121824] border border-[#2A364F] flex items-center justify-center text-slate-500">
                              <Image className="w-4 h-4" />
                            </div>
                          )}
                        </td>
                        <td className="p-3.5 font-mono text-emerald-400 font-medium">
                          {prod.sku}
                          <div className="text-[10px] text-slate-500">{prod.barcode}</div>
                        </td>
                        <td className="p-3.5 font-medium text-slate-100">{prod.name}</td>
                        <td className="p-3.5 text-slate-400">{prod.category}</td>
                        <td className="p-3.5 text-right text-slate-400">KSh {(prod.costPriceCents / 100).toFixed(2)}</td>
                        <td className="p-3.5 text-right font-semibold text-emerald-300">
                          KSh {(prod.sellPriceCents / 100).toFixed(2)}
                        </td>
                        <td className="p-3.5 text-center">
                          <span className={`px-2.5 py-1 rounded-full font-bold text-xs inline-flex items-center gap-1 ${
                            isLow ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-slate-200'
                          }`}>
                            {isLow && <AlertCircle className="w-3 h-3 text-amber-400" />}
                            {prod.stockOnHand} {prod.uom}
                          </span>
                        </td>
                        <td className="p-3.5 text-center text-slate-400">{prod.reorderThreshold}</td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => handleOpenAdjustment(prod)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] rounded-lg border border-slate-700"
                          >
                            Adjust Stock
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Append-Only Stock Ledger Audit */}
      {activeTab === 'LEDGER' && (
        <div className="space-y-4">
          <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-4 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 space-y-1">
              <strong className="text-emerald-300 block text-sm">Immutable Stock Ledger Guarantee (BR-003 & DR-05)</strong>
              <p>
                Every inventory movement is appended as an unalterable transaction record. Expired and damaged goods decrease stock balances automatically.
              </p>
            </div>
          </div>

          <div className="glass-panel rounded-2xl overflow-hidden border border-[#2A364F]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#121824] text-slate-400 font-semibold border-b border-[#2A364F]">
                <tr>
                  <th className="p-3.5">TIMESTAMP (UTC)</th>
                  <th className="p-3.5">MOVEMENT TYPE</th>
                  <th className="p-3.5">PRODUCT SKU</th>
                  <th className="p-3.5 text-center">QTY DELTA</th>
                  <th className="p-3.5 text-center">RUNNING BALANCE</th>
                  <th className="p-3.5">REFERENCE / REASON</th>
                  <th className="p-3.5">ACTOR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {ledgerEntries.map(entry => (
                  <tr key={entry.id} className="hover:bg-slate-800/30">
                    <td className="p-3.5 font-mono text-slate-400">{new Date(entry.timestamp).toLocaleString()}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        entry.type === 'SALE' || entry.type === 'LOSS_WRITE_OFF' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                        entry.type === 'PURCHASE' || entry.type === 'RESTOCK' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {entry.type}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-emerald-300">{entry.productSku}</td>
                    <td className={`p-3.5 text-center font-bold ${entry.delta < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {entry.delta > 0 ? `+${entry.delta}` : entry.delta}
                    </td>
                    <td className="p-3.5 text-center font-mono font-semibold text-slate-100">{entry.runningBalance}</td>
                    <td className="p-3.5 font-mono text-slate-400">{entry.reason || entry.refDocument}</td>
                    <td className="p-3.5 text-slate-300">{entry.actorName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Inventory Intelligence (Slow Movers & Dead Stock) */}
      {activeTab === 'INTELLIGENCE' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Slow Movers (>60 days) */}
          <div className="glass-panel p-5 rounded-2xl border border-amber-500/30 space-y-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-slate-100 text-sm">Slow-Moving SKUs (&gt;60 Days No Sale)</h3>
            </div>
            <p className="text-xs text-slate-400">
              Products tying up capital without generating velocity. Consider promotional discounts or bundle offers.
            </p>

            <div className="space-y-2">
              {slowMovers.map(item => (
                <div key={item.id} className="p-3 bg-[#121824] rounded-xl border border-[#2A364F] flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-xs text-slate-100">{item.name}</h4>
                    <span className="text-[10px] text-amber-400 font-mono">No sales for {item.daysNoSale} days</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold text-slate-200">{item.stockOnHand} {item.uom} left</div>
                    <div className="text-[10px] text-slate-400">Tied Value: KSh {((item.stockOnHand * item.costPriceCents) / 100).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dead Stock (>120 days) */}
          <div className="glass-panel p-5 rounded-2xl border border-rose-500/30 space-y-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-400" />
              <h3 className="font-bold text-slate-100 text-sm">Dead Stock (&gt;120 Days No Sale)</h3>
            </div>
            <p className="text-xs text-slate-400">
              Capital trapped in unsold inventory. Flagged for supplier return or clearance write-off.
            </p>

            <div className="space-y-2">
              {deadStock.map(item => (
                <div key={item.id} className="p-3 bg-[#121824] rounded-xl border border-[#2A364F] flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-xs text-slate-100">{item.name}</h4>
                    <span className="text-[10px] text-rose-400 font-mono">Dormant for {item.daysNoSale} days</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold text-slate-200">{item.stockOnHand} {item.uom} left</div>
                    <div className="text-[10px] text-rose-400">Trapped Capital: KSh {((item.stockOnHand * item.costPriceCents) / 100).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Manual Stock Adjustment Modal with Sound Decrease/Increase Logic */}
      {adjustmentModal && selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full p-6 rounded-2xl border border-emerald-500/40 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#2A364F] pb-3">
              <h3 className="font-bold text-slate-100 text-base">Adjust Stock: {selectedProduct.name}</h3>
              <button onClick={() => setAdjustmentModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="p-3 bg-[#121824] rounded-xl border border-[#2A364F] text-xs flex justify-between items-center">
              <span className="text-slate-400">Current Stock on Hand:</span>
              <strong className="text-emerald-400 font-mono text-sm">{selectedProduct.stockOnHand} {selectedProduct.uom}</strong>
            </div>

            <div className="space-y-3">
              {/* Reason Selection */}
              <div>
                <label className="text-xs text-slate-300 block mb-1 font-semibold">Reason Code:</label>
                <select
                  value={adjustmentReason}
                  onChange={(e) => handleReasonChange(e.target.value)}
                  className="w-full bg-[#121824] border border-[#2A364F] px-3.5 py-2.5 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="Damaged stock">Damaged stock (Deduct from inventory)</option>
                  <option value="Expired product">Expired product (Deduct from inventory)</option>
                  <option value="Internal usage / Shrinkage">Internal usage / Theft / Shrinkage (Deduct)</option>
                  <option value="Return to supplier">Return to supplier (Deduct from inventory)</option>
                  <option value="Restock / Supplier bonus">Restock / Supplier bonus (Add to inventory)</option>
                  <option value="Physical count variance (Found stock)">Physical count variance (Add found stock)</option>
                </select>
              </div>

              {/* Adjustment Direction Toggle */}
              <div>
                <label className="text-xs text-slate-300 block mb-1 font-semibold">Stock Action Direction:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustmentDirection('DECREASE')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      adjustmentDirection === 'DECREASE'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500 shadow-md ring-1 ring-rose-500/40'
                        : 'bg-[#121824] border-[#2A364F] text-slate-400'
                    }`}
                  >
                    <ArrowDown className="w-3.5 h-3.5 text-rose-400" /> Deduct / Remove (-)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustmentDirection('INCREASE')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      adjustmentDirection === 'INCREASE'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 shadow-md ring-1 ring-emerald-500/40'
                        : 'bg-[#121824] border-[#2A364F] text-slate-400'
                    }`}
                  >
                    <ArrowUp className="w-3.5 h-3.5 text-emerald-400" /> Add / Restock (+)
                  </button>
                </div>
              </div>

              {/* Quantity Input */}
              <div>
                <label className="text-xs text-slate-300 block mb-1 font-semibold">Quantity Count:</label>
                <input
                  type="number"
                  min="1"
                  value={deltaQtyInput}
                  onChange={(e) => setDeltaQtyInput(e.target.value)}
                  className="w-full bg-[#121824] border border-[#2A364F] px-3.5 py-2.5 rounded-xl text-sm font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
                  placeholder="Enter quantity (e.g. 5)"
                />
              </div>

              {/* Live Preview Card */}
              <div className={`p-3 rounded-xl border text-xs space-y-1 ${
                adjustmentDirection === 'DECREASE' ? 'bg-rose-950/30 border-rose-500/40 text-rose-300' : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
              }`}>
                <div className="flex justify-between">
                  <span>Current: <strong>{selectedProduct.stockOnHand}</strong></span>
                  <span>Adjustment: <strong>{signedDelta > 0 ? `+${signedDelta}` : signedDelta}</strong></span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-700/50 font-bold text-sm">
                  <span>New Balance:</span>
                  <span className="font-mono">{newStockPreview} {selectedProduct.uom}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#2A364F]">
              <button
                type="button"
                onClick={() => setAdjustmentModal(false)}
                className="py-2.5 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAdjustment}
                className="py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20"
              >
                Save Stock Adjustment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal with Optional Photo Upload */}
      {newProductModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateProduct} className="glass-panel max-w-lg w-full p-6 rounded-2xl border border-emerald-500/40 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#2A364F] pb-3">
              <h3 className="font-bold text-slate-100 text-base flex items-center gap-2 font-display">
                <Package className="w-5 h-5 text-emerald-400" /> Add New Product SKU
              </h3>
              <button type="button" onClick={() => setNewProductModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">SKU Code *</label>
                <input
                  type="text" required placeholder="BEV-JUICE-1L"
                  value={newProduct.sku} onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                  className="w-full bg-[#121824] border border-[#2A364F] px-3.5 py-2 rounded-xl text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Product Name *</label>
                <input
                  type="text" required placeholder="Mango Juice 1L"
                  value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full bg-[#121824] border border-[#2A364F] px-3.5 py-2 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Cost Price (KSh)</label>
                <input
                  type="number" step="0.01" placeholder="120.00"
                  value={newProduct.costPriceKSh} onChange={(e) => setNewProduct({ ...newProduct, costPriceKSh: e.target.value })}
                  className="w-full bg-[#121824] border border-[#2A364F] px-3.5 py-2 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Sell Price (KSh)</label>
                <input
                  type="number" step="0.01" placeholder="150.00"
                  value={newProduct.sellPriceKSh} onChange={(e) => setNewProduct({ ...newProduct, sellPriceKSh: e.target.value })}
                  className="w-full bg-[#121824] border border-[#2A364F] px-3.5 py-2 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Initial Stock</label>
                <input
                  type="number" value={newProduct.stockOnHand} onChange={(e) => setNewProduct({ ...newProduct, stockOnHand: e.target.value })}
                  className="w-full bg-[#121824] border border-[#2A364F] px-3.5 py-2 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Reorder Threshold</label>
                <input
                  type="number" value={newProduct.reorderThreshold} onChange={(e) => setNewProduct({ ...newProduct, reorderThreshold: e.target.value })}
                  className="w-full bg-[#121824] border border-[#2A364F] px-3.5 py-2 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Optional Product Photo Upload */}
            <div className="p-3 bg-[#121824] rounded-xl border border-[#2A364F] space-y-2">
              <label className="text-xs text-slate-200 font-semibold flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-emerald-400" /> Product Photo (Optional)
              </label>

              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-500/20 file:text-emerald-400 hover:file:bg-emerald-500/30 cursor-pointer"
                />

                {newProduct.imageUrl && (
                  <img src={newProduct.imageUrl} alt="Preview" className="w-10 h-10 rounded-lg object-cover border border-emerald-500/50 shrink-0" />
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#2A364F]">
              <button type="button" onClick={() => setNewProductModal(false)} className="py-2.5 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl">
                Cancel
              </button>
              <button type="submit" className="py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20">
                Save & Seed Ledger
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
