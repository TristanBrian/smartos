import React, { useState } from 'react';
import {
  Package, Plus, AlertCircle, TrendingDown, ArrowRightLeft,
  ShieldAlert, History, Edit3, CheckCircle2, Image, Upload,
  MinusCircle, PlusCircle, ArrowDown, ArrowUp, BarChart2,
  Sparkles, DollarSign, Scale, Info, Eye, X
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

  // Product Performance / BI Details Modal
  const [inspectProduct, setInspectProduct] = useState(null);

  // New Product Modal State
  const [newProductModal, setNewProductModal] = useState(false);
  const [manualSkuEdit, setManualSkuEdit] = useState(false);
  const [newProduct, setNewProduct] = useState({
    sku: '',
    name: '',
    category: 'Fresh Produce',
    barcode: '',
    uom: 'Kg',
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

  // Auto SKU Generator Algorithm
  const generateSkuFromName = (name, category) => {
    if (!name || name.trim() === '') return '';
    const prefix = (category || 'GEN').slice(0, 3).toUpperCase();
    const cleanName = name
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, '')
      .trim()
      .split(/\s+/)
      .slice(0, 3)
      .join('-');

    return `${prefix}-${cleanName}`;
  };

  const handleProductNameChange = (e) => {
    const val = e.target.value;
    setNewProduct(prev => {
      const autoSku = !manualSkuEdit ? generateSkuFromName(val, prev.category) : prev.sku;
      return { ...prev, name: val, sku: autoSku };
    });
  };

  const handleCategoryChange = (e) => {
    const val = e.target.value;
    setNewProduct(prev => {
      const autoSku = !manualSkuEdit ? generateSkuFromName(prev.name, val) : prev.sku;
      return { ...prev, category: val, sku: autoSku };
    });
  };

  const handleReasonChange = (reason) => {
    setAdjustmentReason(reason);
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

    const qty = parseFloat(deltaQtyInput) || 0;
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
      stockOnHand: parseFloat(newProduct.stockOnHand),
      reorderThreshold: parseFloat(newProduct.reorderThreshold),
      lastRestockDate: new Date().toISOString().split('T')[0],
      daysNoSale: 0,
      imageUrl: newProduct.imageUrl || null
    };

    onAddProduct(created);
    setNewProductModal(false);
    setManualSkuEdit(false);
    setNewProduct({
      sku: '', name: '', category: 'Fresh Produce', barcode: '', uom: 'Kg',
      costPriceKSh: '', sellPriceKSh: '', vatRate: 0, stockOnHand: 10, reorderThreshold: 5, imageUrl: ''
    });
  };

  // Live adjustment calculation
  const rawQty = Math.abs(parseFloat(deltaQtyInput) || 0);
  const signedDelta = adjustmentDirection === 'DECREASE' ? -rawQty : rawQty;
  const newStockPreview = selectedProduct ? Math.max(0, selectedProduct.stockOnHand + signedDelta) : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner & Sub-Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-emerald-500/20">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 font-display">
            <Package className="w-6 h-6 text-emerald-400" /> Inventory Intelligence & Ledger
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Auto-generated SKUs, weighted items (Kg/Litres), product yield calculations, and append-only stock ledger.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setNewProductModal(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" /> Add New Product SKU
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
                      <tr key={prod.id} className="hover:bg-slate-800/30 transition-colors cursor-pointer group" onClick={() => setInspectProduct(prod)}>
                        <td className="p-3.5">
                          {prod.imageUrl ? (
                            <img src={prod.imageUrl} alt={prod.name} className="w-9 h-9 rounded-lg object-cover border border-[#2A364F]" />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-[#121824] border border-[#2A364F] flex items-center justify-center text-slate-500">
                              <Image className="w-4 h-4" />
                            </div>
                          )}
                        </td>
                        <td className="p-3.5 font-mono text-emerald-400 font-medium group-hover:underline">
                          {prod.sku}
                          <div className="text-[10px] text-slate-500">{prod.barcode}</div>
                        </td>
                        <td className="p-3.5 font-medium text-slate-100 flex items-center gap-1.5">
                          {prod.name}
                          {prod.uom === 'Kg' && (
                            <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-bold px-1.5 py-0.5 rounded border border-cyan-500/30">
                              WEIGHTED (KG)
                            </span>
                          )}
                        </td>
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
                        <td className="p-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setInspectProduct(prod)}
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] rounded-lg border border-slate-700 flex items-center gap-1"
                              title="Inspect Product BI Yield"
                            >
                              <Eye className="w-3.5 h-3.5 text-cyan-400" />
                            </button>
                            <button
                              onClick={() => handleOpenAdjustment(prod)}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] rounded-lg border border-slate-700"
                            >
                              Adjust Stock
                            </button>
                          </div>
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

      {/* Product Details & BI Yield Performance Inspection Modal */}
      {inspectProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-lg w-full p-6 rounded-2xl border border-cyan-500/40 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#2A364F] pb-3">
              <div className="flex items-center gap-3">
                {inspectProduct.imageUrl ? (
                  <img src={inspectProduct.imageUrl} alt={inspectProduct.name} className="w-12 h-12 rounded-xl object-cover border border-cyan-500/50" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                    <Package className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-slate-100 text-base font-display">{inspectProduct.name}</h3>
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-emerald-400 font-bold">{inspectProduct.sku}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-300">{inspectProduct.category}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setInspectProduct(null)} className="text-slate-400 hover:text-white text-lg font-bold">✕</button>
            </div>

            {/* Financial Unit Economics */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-[#121824] rounded-xl border border-[#2A364F]">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Unit Cost Price</span>
                <span className="font-mono font-bold text-slate-200 text-sm">KSh {(inspectProduct.costPriceCents / 100).toFixed(2)}</span>
              </div>

              <div className="p-3 bg-[#121824] rounded-xl border border-[#2A364F]">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Unit Sell Price</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">KSh {(inspectProduct.sellPriceCents / 100).toFixed(2)}</span>
              </div>

              <div className="p-3 bg-emerald-950/30 rounded-xl border border-emerald-500/40">
                <span className="text-[10px] text-emerald-400 uppercase tracking-wider block font-bold">Profit Margin / Unit</span>
                <span className="font-mono font-bold text-emerald-300 text-sm">
                  KSh {((inspectProduct.sellPriceCents - inspectProduct.costPriceCents) / 100).toFixed(2)}
                </span>
                <span className="text-[10px] text-emerald-400 block font-semibold">
                  ({(((inspectProduct.sellPriceCents - inspectProduct.costPriceCents) / inspectProduct.sellPriceCents) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>

            {/* Total Stock Valuation & Financial Yield Intelligence */}
            <div className="p-4 bg-[#121824] rounded-2xl border border-[#2A364F] space-y-3 text-xs">
              <h4 className="font-bold text-slate-200 flex items-center gap-1.5 text-sm">
                <BarChart2 className="w-4 h-4 text-cyan-400" /> Total Stock Valuation & Yield Projection
              </h4>

              <div className="grid grid-cols-2 gap-3 font-mono">
                <div className="space-y-1">
                  <span className="text-slate-400 block text-[11px]">Current Stock Volume:</span>
                  <span className="text-slate-100 font-bold text-sm">{inspectProduct.stockOnHand} {inspectProduct.uom}</span>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 block text-[11px]">Capital Tied Up (Cost):</span>
                  <span className="text-slate-200 font-bold text-sm">
                    KSh {((inspectProduct.stockOnHand * inspectProduct.costPriceCents) / 100).toLocaleString()}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 block text-[11px]">Expected Total Revenue:</span>
                  <span className="text-emerald-400 font-bold text-sm">
                    KSh {((inspectProduct.stockOnHand * inspectProduct.sellPriceCents) / 100).toLocaleString()}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 block text-[11px]">Expected Total Net Yield:</span>
                  <span className="text-cyan-300 font-bold text-sm">
                    KSh {((inspectProduct.stockOnHand * (inspectProduct.sellPriceCents - inspectProduct.costPriceCents)) / 100).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span>VAT Tax Status: <strong className="text-slate-200">{inspectProduct.vatRate}%</strong></span>
              <span>Reorder Threshold: <strong className="text-amber-400">{inspectProduct.reorderThreshold} {inspectProduct.uom}</strong></span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#2A364F]">
              <button
                type="button"
                onClick={() => { setInspectProduct(null); handleOpenAdjustment(inspectProduct); }}
                className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5 text-emerald-400" /> Adjust Stock
              </button>
              <button
                type="button"
                onClick={() => setInspectProduct(null)}
                className="py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
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

              <div>
                <label className="text-xs text-slate-300 block mb-1 font-semibold">Quantity Count:</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={deltaQtyInput}
                  onChange={(e) => setDeltaQtyInput(e.target.value)}
                  className="w-full bg-[#121824] border border-[#2A364F] px-3.5 py-2.5 rounded-xl text-sm font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
                  placeholder="Enter quantity (e.g. 5 or 2.5)"
                />
              </div>

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

      {/* Add Product Modal with Live Auto-Generated SKU */}
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
                <label className="text-slate-300 block mb-1 font-semibold">Category *</label>
                <select
                  value={newProduct.category}
                  onChange={handleCategoryChange}
                  className="w-full bg-[#121824] border border-[#2A364F] px-3.5 py-2 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="Fresh Produce">Fresh Produce (Onions, Tomatoes, etc.)</option>
                  <option value="Grains & Flour">Grains & Flour (Unga, Rice)</option>
                  <option value="Beverages & Dairy">Beverages & Dairy (Milk, Juice)</option>
                  <option value="Pantry Essentials">Pantry Essentials (Sugar, Salt)</option>
                  <option value="Household">Household (Soap, Tissue)</option>
                  <option value="Pharmaceuticals">Pharmaceuticals</option>
                  <option value="General">General Merchandise</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Unit of Measure (UOM) *</label>
                <select
                  value={newProduct.uom}
                  onChange={(e) => setNewProduct({ ...newProduct, uom: e.target.value })}
                  className="w-full bg-[#121824] border border-[#2A364F] px-3.5 py-2 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500 cursor-pointer font-bold text-emerald-400"
                >
                  <option value="Kg">Kg (Kilograms — Onions, Tomatoes, Sugar)</option>
                  <option value="Gram">Gram (Grams)</option>
                  <option value="Litre">Litre (Liquids, Cooking Oil)</option>
                  <option value="Pouch">Pouch / Packet</option>
                  <option value="Piece">Piece / Unit</option>
                  <option value="Strip">Strip (Medicine)</option>
                  <option value="Box">Box / Carton</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Product Name *</label>
                <input
                  type="text" required placeholder="e.g. Fresh Red Onions"
                  value={newProduct.name} onChange={handleProductNameChange}
                  className="w-full bg-[#121824] border border-[#2A364F] px-3.5 py-2 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-slate-300 block font-semibold">SKU Code (Auto-Generated) *</label>
                  <span className="text-[10px] text-cyan-400 font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Auto
                  </span>
                </div>
                <input
                  type="text" required placeholder="Auto-generated from name"
                  value={newProduct.sku}
                  onChange={(e) => {
                    setManualSkuEdit(true);
                    setNewProduct({ ...newProduct, sku: e.target.value });
                  }}
                  className="w-full bg-[#121824] border border-[#2A364F] px-3.5 py-2 rounded-xl text-xs text-emerald-400 font-mono focus:outline-none focus:border-emerald-500 font-bold"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Cost Price (KSh / {newProduct.uom})</label>
                <input
                  type="number" step="0.01" placeholder="90.00"
                  value={newProduct.costPriceKSh} onChange={(e) => setNewProduct({ ...newProduct, costPriceKSh: e.target.value })}
                  className="w-full bg-[#121824] border border-[#2A364F] px-3.5 py-2 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Sell Price (KSh / {newProduct.uom})</label>
                <input
                  type="number" step="0.01" placeholder="120.00"
                  value={newProduct.sellPriceKSh} onChange={(e) => setNewProduct({ ...newProduct, sellPriceKSh: e.target.value })}
                  className="w-full bg-[#121824] border border-[#2A364F] px-3.5 py-2 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Initial Stock ({newProduct.uom})</label>
                <input
                  type="number" step="0.1" value={newProduct.stockOnHand} onChange={(e) => setNewProduct({ ...newProduct, stockOnHand: e.target.value })}
                  className="w-full bg-[#121824] border border-[#2A364F] px-3.5 py-2 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Reorder Threshold ({newProduct.uom})</label>
                <input
                  type="number" step="0.1" value={newProduct.reorderThreshold} onChange={(e) => setNewProduct({ ...newProduct, reorderThreshold: e.target.value })}
                  className="w-full bg-[#121824] border border-[#2A364F] px-3.5 py-2 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
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
