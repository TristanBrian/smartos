import React, { useState } from 'react';
import { Package, Plus, AlertCircle, TrendingDown, ArrowRightLeft, FileSpreadsheet, ShieldAlert, History, Edit3, CheckCircle2 } from 'lucide-react';

export default function InventoryManager({ products, ledgerEntries, onAddProduct, onUpdateStock, activeTenant }) {
  const [activeTab, setActiveTab] = useState('CATALOG'); // CATALOG, LEDGER, INTELLIGENCE, TRANSFERS
  const [search, setSearch] = useState('');
  
  // Stock Adjustment Modal
  const [adjustmentModal, setAdjustmentModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deltaQty, setDeltaQty] = useState(0);
  const [adjustmentReason, setAdjustmentReason] = useState('Damaged stock');

  // New Product Modal
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
    reorderThreshold: 5
  });

  const lowStockItems = products.filter(p => p.stockOnHand <= p.reorderThreshold);
  const slowMovers = products.filter(p => p.daysNoSale >= 60 && p.daysNoSale < 120);
  const deadStock = products.filter(p => p.daysNoSale >= 120 && p.stockOnHand > 0);

  const handleSaveAdjustment = () => {
    if (!selectedProduct || deltaQty === 0) return;

    onUpdateStock({
      productId: selectedProduct.id,
      productSku: selectedProduct.sku,
      productName: selectedProduct.name,
      delta: deltaQty,
      type: 'ADJUSTMENT',
      reason: adjustmentReason,
      actorName: 'Grace Wanjiru (Owner)'
    });

    setAdjustmentModal(false);
    setSelectedProduct(null);
    setDeltaQty(0);
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
      daysNoSale: 0
    };

    onAddProduct(created);
    setNewProductModal(false);
    setNewProduct({
      sku: '', name: '', category: 'General', barcode: '', uom: 'Piece',
      costPriceKSh: '', sellPriceKSh: '', vatRate: 0, stockOnHand: 10, reorderThreshold: 5
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Navigation Sub-Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 font-display">
            <Package className="w-6 h-6 text-emerald-400" /> Inventory Intelligence & Ledger
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Append-only stock ledger, low-stock threshold alerts, and dead stock intelligence.
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
                            onClick={() => { setSelectedProduct(prod); setAdjustmentModal(true); }}
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
                Every inventory movement is appended as an unalterable transaction record. Running stock balances are derived from the ledger history.
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
                  <th className="p-3.5">REFERENCE DOC</th>
                  <th className="p-3.5">ACTOR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {ledgerEntries.map(entry => (
                  <tr key={entry.id} className="hover:bg-slate-800/30">
                    <td className="p-3.5 font-mono text-slate-400">{new Date(entry.timestamp).toLocaleString()}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        entry.type === 'SALE' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                        entry.type === 'PURCHASE' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
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
                    <td className="p-3.5 font-mono text-slate-400">{entry.refDocument}</td>
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

      {/* Manual Stock Adjustment Modal */}
      {adjustmentModal && selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full p-6 rounded-2xl border border-emerald-500/30 space-y-4">
            <h3 className="font-bold text-slate-100 text-base">Adjust Stock: {selectedProduct.name}</h3>
            <p className="text-xs text-slate-400">Current Stock: <strong className="text-emerald-400">{selectedProduct.stockOnHand} {selectedProduct.uom}</strong></p>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Quantity Delta (+/-):</label>
                <input
                  type="number"
                  value={deltaQty}
                  onChange={(e) => setDeltaQty(parseInt(e.target.value) || 0)}
                  className="w-full bg-[#121824] border border-[#2A364F] px-3 py-2 rounded-xl text-sm font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. +10 or -2"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Mandated Reason Code (BRULE-05):</label>
                <select
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  className="w-full bg-[#121824] border border-[#2A364F] px-3 py-2 rounded-xl text-xs text-slate-100 focus:outline-none"
                >
                  <option>Damaged stock</option>
                  <option>Expired product</option>
                  <option>Physical count variance</option>
                  <option>Supplier restock bonus</option>
                  <option>Internal usage</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setAdjustmentModal(false)}
                className="py-2.5 bg-slate-800 text-slate-300 text-xs font-medium rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAdjustment}
                className="py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl"
              >
                Record Ledger Mutation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {newProductModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateProduct} className="glass-panel max-w-lg w-full p-6 rounded-2xl border border-emerald-500/30 space-y-4">
            <h3 className="font-bold text-slate-100 text-base">Add New Product SKU</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">SKU Code *</label>
                <input
                  type="text" required placeholder="BEV-JUICE-1L"
                  value={newProduct.sku} onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                  className="w-full bg-[#121824] border border-[#2A364F] px-3 py-2 rounded-xl text-xs text-slate-100 font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">Product Name *</label>
                <input
                  type="text" required placeholder="Mango Juice 1L"
                  value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full bg-[#121824] border border-[#2A364F] px-3 py-2 rounded-xl text-xs text-slate-100"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">Cost Price (KSh)</label>
                <input
                  type="number" step="0.01" placeholder="120.00"
                  value={newProduct.costPriceKSh} onChange={(e) => setNewProduct({ ...newProduct, costPriceKSh: e.target.value })}
                  className="w-full bg-[#121824] border border-[#2A364F] px-3 py-2 rounded-xl text-xs text-slate-100"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">Sell Price (KSh)</label>
                <input
                  type="number" step="0.01" placeholder="150.00"
                  value={newProduct.sellPriceKSh} onChange={(e) => setNewProduct({ ...newProduct, sellPriceKSh: e.target.value })}
                  className="w-full bg-[#121824] border border-[#2A364F] px-3 py-2 rounded-xl text-xs text-slate-100"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">Initial Stock</label>
                <input
                  type="number" value={newProduct.stockOnHand} onChange={(e) => setNewProduct({ ...newProduct, stockOnHand: e.target.value })}
                  className="w-full bg-[#121824] border border-[#2A364F] px-3 py-2 rounded-xl text-xs text-slate-100"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">Reorder Threshold</label>
                <input
                  type="number" value={newProduct.reorderThreshold} onChange={(e) => setNewProduct({ ...newProduct, reorderThreshold: e.target.value })}
                  className="w-full bg-[#121824] border border-[#2A364F] px-3 py-2 rounded-xl text-xs text-slate-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button type="button" onClick={() => setNewProductModal(false)} className="py-2.5 bg-slate-800 text-slate-300 text-xs font-medium rounded-xl">
                Cancel
              </button>
              <button type="submit" className="py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl">
                Save & Seed Ledger
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
