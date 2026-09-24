import React, { useState } from 'react';
import { Search, Barcode, ShoppingCart, Trash2, Plus, Minus, CreditCard, DollarSign, Smartphone, Printer, CheckCircle, AlertTriangle, Wifi, WifiOff, Clock } from 'lucide-react';

export default function PosTerminal({ products, onCompleteSale, isOffline, activeTenant }) {
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [managerPinModal, setManagerPinModal] = useState(false);
  const [pendingDiscount, setPendingDiscount] = useState(0);
  const [pinInput, setPinInput] = useState('');
  const [managerApproved, setManagerApproved] = useState(false);
  
  // Payment modal state
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('MPESA_STK');
  const [customerPhone, setCustomerPhone] = useState('0722000111');
  const [cashTenderedKSh, setCashTenderedKSh] = useState('');
  const [stkPushStep, setStkPushStep] = useState('IDLE');
  
  // Receipt view modal
  const [completedSaleReceipt, setCompletedSaleReceipt] = useState(null);

  const categories = ['ALL', ...new Set(products.map(p => p.category))];

  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesQuery = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (p.barcode && p.barcode.includes(searchQuery));
    return matchesCat && matchesQuery;
  });

  const addToCart = (product) => {
    if (product.stockOnHand <= 0 && !activeTenant.allowOversell) {
      alert(`Cannot sell ${product.name}: Out of stock (Current: 0) and oversell is disabled.`);
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.qty + 1 > product.stockOnHand && !activeTenant.allowOversell) {
          alert(`Quantity limit reached for ${product.name}. Stock available: ${product.stockOnHand}`);
          return prev;
        }
        return prev.map(item => item.id === product.id ? { ...item, qty: Math.round((item.qty + 1) * 100) / 100 } : item);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.round((item.qty + delta) * 100) / 100;
        if (newQty <= 0) return null;
        return { ...item, qty: newQty };
      }
      return item;
    }).filter(Boolean));
  };

  const setQtyDirect = (id, exactQty) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        if (exactQty <= 0) return null;
        if (exactQty > item.stockOnHand && !activeTenant.allowOversell) {
          alert(`Quantity limit reached for ${item.name}. Stock available: ${item.stockOnHand}`);
          return item;
        }
        return { ...item, qty: Math.round(exactQty * 100) / 100 };
      }
      return item;
    }).filter(Boolean));
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  // Calculations in Cents
  const rawSubtotalCents = cart.reduce((sum, item) => sum + (item.sellPriceCents * item.qty), 0);
  const discountCents = Math.round((rawSubtotalCents * discountPercent) / 100);
  const subtotalAfterDiscountCents = rawSubtotalCents - discountCents;
  
  const taxCents = cart.reduce((sum, item) => {
    if (item.vatRate > 0) {
      const itemSubtotal = (item.sellPriceCents * item.qty) * (1 - discountPercent / 100);
      return sum + Math.round(itemSubtotal * 0.16 / 1.16);
    }
    return sum;
  }, 0);

  const grandTotalCents = subtotalAfterDiscountCents;
  const cashTenderedCents = cashTenderedKSh ? Math.round(parseFloat(cashTenderedKSh) * 100) : grandTotalCents;
  const changeGivenCents = Math.max(0, cashTenderedCents - grandTotalCents);

  const handleApplyDiscount = (pct) => {
    if (pct > 10 && !managerApproved) {
      setPendingDiscount(pct);
      setManagerPinModal(true);
    } else {
      setDiscountPercent(pct);
    }
  };

  const handleVerifyManagerPin = () => {
    if (pinInput === '1234') {
      setManagerApproved(true);
      setDiscountPercent(pendingDiscount);
      setManagerPinModal(false);
      setPinInput('');
    } else {
      alert('Invalid Manager PIN! Try "1234"');
    }
  };

  const handleOpenPayment = () => {
    if (cart.length === 0) return;
    setPaymentModalOpen(true);
    setStkPushStep('IDLE');
    setCashTenderedKSh((grandTotalCents / 100).toString());
  };

  const handleProcessPayment = () => {
    if (paymentMethod === 'MPESA_STK') {
      setStkPushStep('SENDING');
      setTimeout(() => {
        setStkPushStep('WAITING_PIN');
        setTimeout(() => {
          setStkPushStep('SUCCESS');
          finalizeSaleRecord('MPESA_STK', 'COMPLETED');
        }, 2200);
      }, 1000);
    } else {
      finalizeSaleRecord(paymentMethod, 'COMPLETED');
    }
  };

  const finalizeSaleRecord = (method, status) => {
    const receiptNo = `REC-${Math.floor(10000 + Math.random() * 90000)}`;
    const newSale = {
      id: `sale_${Date.now()}`,
      receiptNumber: receiptNo,
      timestamp: new Date().toISOString(),
      cashierName: "Kevin Omondi",
      items: cart.map(i => ({
        id: i.id,
        sku: i.sku,
        name: i.name,
        qty: i.qty,
        unitPriceCents: i.sellPriceCents,
        lineTotalCents: i.sellPriceCents * i.qty
      })),
      subtotalCents: rawSubtotalCents,
      discountCents: discountCents,
      taxCents: taxCents,
      grandTotalCents: grandTotalCents,
      cashTenderedCents: method === 'CASH' ? cashTenderedCents : grandTotalCents,
      changeGivenCents: method === 'CASH' ? changeGivenCents : 0,
      paymentMethod: method,
      paymentStatus: status,
      mpesaTransId: method === 'MPESA_STK' ? `QEH${Math.floor(1000000 + Math.random() * 9000000)}` : null,
      etimsStatus: activeTenant.isVatRegistered ? (isOffline ? 'RETRY_QUEUED' : 'ACCEPTED') : 'NOT_APPLICABLE',
      etimsInvoiceNo: activeTenant.isVatRegistered ? `0000000000000${Math.floor(10000 + Math.random() * 90000)}` : null,
      isOfflineCaptured: isOffline
    };

    onCompleteSale(newSale);
    setCompletedSaleReceipt(newSale);
    setCart([]);
    setDiscountPercent(0);
    setPaymentModalOpen(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)]">
      {/* Product Catalog & Selector */}
      <div className="lg:col-span-7 flex flex-col glass-panel rounded-2xl p-5 overflow-hidden">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by SKU, Product Name or Barcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#121824] border border-[#2A364F] rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
            {categories.slice(0, 4).map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 text-xs font-medium rounded-xl whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                    : 'bg-[#121824] border border-[#2A364F] text-slate-300 hover:border-slate-500'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filteredProducts.map(product => {
            const isLow = product.stockOnHand <= product.reorderThreshold;
            const isOut = product.stockOnHand <= 0;
            return (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                disabled={isOut && !activeTenant.allowOversell}
                className={`flex flex-col justify-between p-3.5 rounded-xl text-left border transition-all ${
                  isOut
                    ? 'opacity-50 border-rose-500/30 bg-rose-500/5 cursor-not-allowed'
                    : 'glass-panel-interactive border-[#2A364F]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded">
                      {product.sku}
                    </span>
                    {isLow && (
                      <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded font-medium">
                        Low ({product.stockOnHand})
                      </span>
                    )}
                  </div>
                  <h4 className="font-medium text-sm text-slate-100 line-clamp-2 mb-1">
                    {product.name}
                  </h4>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-700/40 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Stock: <strong className="text-slate-200">{product.stockOnHand} {product.uom}</strong></span>
                  <span className="font-semibold text-sm text-emerald-400">
                    KSh {(product.sellPriceCents / 100).toLocaleString('en-KE')}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cart & Checkout Panel */}
      <div className="lg:col-span-5 flex flex-col glass-panel rounded-2xl p-5 border border-emerald-500/20 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-[#2A364F]">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-slate-100">Current Cart</h3>
          </div>
          <span className="text-xs bg-slate-800 px-2.5 py-1 rounded-full text-slate-300">
            {cart.reduce((s, i) => s + i.qty, 0)} Items
          </span>
        </div>

        <div className="flex-1 overflow-y-auto my-3 pr-1 space-y-2.5">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2 py-10">
              <ShoppingCart className="w-12 h-12 opacity-30 stroke-[1.5]" />
              <p className="text-sm">Cart is empty. Tap items on the left to add.</p>
            </div>
          ) : (
            cart.map(item => {
              const isWeighted = item.uom === 'Kg' || item.uom === 'Gram' || item.uom === 'Litre';
              const stepVal = isWeighted ? 0.25 : 1;
              return (
                <div key={item.id} className="p-3 rounded-xl bg-[#121824] border border-[#2A364F] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 pr-2">
                      <div className="font-medium text-sm text-slate-200 line-clamp-1">{item.name}</div>
                      <div className="text-xs text-emerald-400 font-medium">
                        KSh {(item.sellPriceCents / 100).toLocaleString()} / {item.uom}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 bg-[#1A2332] px-2 py-1 rounded-lg border border-[#2A364F]">
                      <button onClick={() => updateQty(item.id, -stepVal)} className="p-1 text-slate-400 hover:text-white">
                        <Minus className="w-3.5 h-3.5" />
                      </button>

                      <input
                        type="number"
                        step={isWeighted ? "0.01" : "1"}
                        min="0.01"
                        value={item.qty}
                        onChange={(e) => setQtyDirect(item.id, parseFloat(e.target.value) || 0)}
                        className="w-14 bg-[#121824] text-center text-xs font-mono font-bold border border-slate-700 rounded text-emerald-400 py-0.5 focus:outline-none focus:border-emerald-500"
                      />

                      <button onClick={() => updateQty(item.id, stepVal)} className="p-1 text-slate-400 hover:text-white">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right pl-3 min-w-[70px]">
                      <div className="text-sm font-semibold text-slate-100">
                        KSh {((item.sellPriceCents * item.qty) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-rose-400 hover:text-rose-300 text-[10px]">
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Quick Weight Adjust Pills for Kg items */}
                  {isWeighted && (
                    <div className="flex items-center gap-1.5 pt-1 border-t border-slate-800/80">
                      <span className="text-[10px] text-slate-500 font-mono">Quick Weight:</span>
                      {[0.25, 0.5, 1.0, 2.0, 5.0].map(wt => (
                        <button
                          key={wt}
                          onClick={() => setQtyDirect(item.id, wt)}
                          className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded border transition-all ${
                            item.qty === wt
                              ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                              : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500'
                          }`}
                        >
                          {wt} {item.uom}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="pt-3 border-t border-[#2A364F] space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Discount Cap:</span>
            <div className="flex gap-1">
              {[0, 5, 10, 15].map(pct => (
                <button
                  key={pct}
                  onClick={() => handleApplyDiscount(pct)}
                  className={`px-2 py-0.5 text-xs rounded border transition-colors ${
                    discountPercent === pct
                      ? 'bg-emerald-500 border-emerald-500 text-white font-semibold'
                      : 'border-[#2A364F] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {pct}% {pct > 10 && '🔒'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between text-slate-400 text-xs">
            <span>Subtotal:</span>
            <span>KSh {(rawSubtotalCents / 100).toLocaleString('en-KE')}</span>
          </div>

          {discountCents > 0 && (
            <div className="flex justify-between text-rose-400 text-xs">
              <span>Discount ({discountPercent}%):</span>
              <span>- KSh {(discountCents / 100).toLocaleString('en-KE')}</span>
            </div>
          )}

          <div className="flex justify-between items-center text-lg font-bold text-slate-100 pt-2 border-t border-slate-700/60">
            <span>Grand Total:</span>
            <span className="text-emerald-400 font-display">
              KSh {(grandTotalCents / 100).toLocaleString('en-KE')}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={() => setCart([])}
              disabled={cart.length === 0}
              className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl disabled:opacity-50 transition-colors"
            >
              Clear Cart
            </button>
            <button
              onClick={handleOpenPayment}
              disabled={cart.length === 0}
              className="py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/25 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
            >
              <CreditCard className="w-4 h-4" /> Charge KSh {(grandTotalCents / 100).toLocaleString()}
            </button>
          </div>
        </div>
      </div>

      {/* Payment Selection & Cash Deposit / Change Calculator Modal */}
      {paymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full p-6 rounded-2xl border border-emerald-500/30 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#2A364F]">
              <h3 className="font-bold text-slate-100 text-base">Select Payment Rail</h3>
              <button onClick={() => setPaymentModalOpen(false)} className="text-slate-400 hover:text-white text-sm">✕</button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setPaymentMethod('MPESA_STK')}
                className={`p-3 rounded-xl border text-center flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === 'MPESA_STK'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold'
                    : 'bg-[#121824] border-[#2A364F] text-slate-400 hover:border-slate-500'
                }`}
              >
                <Smartphone className="w-5 h-5" />
                <span className="text-xs">M-Pesa Express</span>
              </button>
              <button
                onClick={() => setPaymentMethod('CASH')}
                className={`p-3 rounded-xl border text-center flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === 'CASH'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold'
                    : 'bg-[#121824] border-[#2A364F] text-slate-400 hover:border-slate-500'
                }`}
              >
                <DollarSign className="w-5 h-5" />
                <span className="text-xs">Cash Deposit</span>
              </button>
              <button
                onClick={() => setPaymentMethod('MPESA_C2B')}
                className={`p-3 rounded-xl border text-center flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === 'MPESA_C2B'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold'
                    : 'bg-[#121824] border-[#2A364F] text-slate-400 hover:border-slate-500'
                }`}
              >
                <Barcode className="w-5 h-5" />
                <span className="text-xs">Paybill Direct</span>
              </button>
            </div>

            {/* Cash Deposit Calculator */}
            {paymentMethod === 'CASH' && (
              <div className="space-y-3 bg-[#121824] p-4 rounded-xl border border-[#2A364F]">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Cash Tendered by Customer (KSh):</label>
                  <input
                    type="number" step="10"
                    value={cashTenderedKSh}
                    onChange={(e) => setCashTenderedKSh(e.target.value)}
                    className="w-full bg-[#1A2332] border border-[#2A364F] px-3 py-2 rounded-xl text-lg font-bold font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex justify-between items-center text-xs p-2.5 bg-[#1A2332] rounded-lg border border-[#2A364F]">
                  <span className="text-slate-400">Change to Return:</span>
                  <span className="text-base font-bold text-amber-400 font-mono">
                    KSh {(changeGivenCents / 100).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {paymentMethod === 'MPESA_STK' && (
              <div className="space-y-3 bg-[#121824] p-4 rounded-xl border border-[#2A364F]">
                <label className="text-xs text-slate-300 block">Customer M-Pesa Phone Number:</label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-[#1A2332] border border-[#2A364F] px-3 py-2 rounded-xl text-sm font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}

            <div className="flex items-center justify-between text-sm pt-2">
              <span className="text-slate-400">Total Payable:</span>
              <span className="text-xl font-bold text-emerald-400 font-display">
                KSh {(grandTotalCents / 100).toLocaleString()}
              </span>
            </div>

            <button
              onClick={handleProcessPayment}
              disabled={stkPushStep === 'SENDING' || stkPushStep === 'WAITING_PIN'}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center gap-2"
            >
              {stkPushStep === 'IDLE' ? 'Confirm & Finalize Sale' : 'Processing...'}
            </button>
          </div>
        </div>
      )}

      {/* Thermal Receipt Preview Modal */}
      {completedSaleReceipt && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-xs w-full thermal-receipt p-5 rounded-sm space-y-3 text-slate-900 shadow-2xl">
            <div className="text-center space-y-1">
              <h3 className="font-bold text-base uppercase tracking-wider">{activeTenant.name}</h3>
              <p className="text-[11px]">{activeTenant.county} Branch</p>
              <p className="text-[10px]">TEL: {activeTenant.phone}</p>
              {activeTenant.isVatRegistered && <p className="text-[10px]">KRA PIN: {activeTenant.kraPin}</p>}
              <div className="border-b border-dashed border-slate-400 my-2" />
              <p className="text-[10px] font-mono">RECEIPT #: {completedSaleReceipt.receiptNumber}</p>
              <p className="text-[10px]">{new Date(completedSaleReceipt.timestamp).toLocaleString()}</p>
              <p className="text-[10px]">CASHIER: {completedSaleReceipt.cashierName}</p>
            </div>

            <div className="border-b border-dashed border-slate-400 my-2" />

            <div className="space-y-1 text-xs font-mono">
              {completedSaleReceipt.items.map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{item.qty}x {item.name.substring(0, 16)}</span>
                  <span>{(item.lineTotalCents / 100).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-b border-dashed border-slate-400 my-2" />

            <div className="space-y-1 text-xs font-mono">
              <div className="flex justify-between">
                <span>SUBTOTAL:</span>
                <span>KSh {(completedSaleReceipt.subtotalCents / 100).toFixed(2)}</span>
              </div>
              {completedSaleReceipt.discountCents > 0 && (
                <div className="flex justify-between">
                  <span>DISCOUNT:</span>
                  <span>-KSh {(completedSaleReceipt.discountCents / 100).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm pt-1">
                <span>TOTAL PAID:</span>
                <span>KSh {(completedSaleReceipt.grandTotalCents / 100).toFixed(2)}</span>
              </div>
              
              {completedSaleReceipt.paymentMethod === 'CASH' && (
                <>
                  <div className="flex justify-between text-[10px] pt-1">
                    <span>CASH TENDERED:</span>
                    <span>KSh {((completedSaleReceipt.cashTenderedCents || completedSaleReceipt.grandTotalCents) / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-amber-900">
                    <span>CHANGE RETURNED:</span>
                    <span>KSh {((completedSaleReceipt.changeGivenCents || 0) / 100).toFixed(2)}</span>
                  </div>
                </>
              )}

              <div className="flex justify-between text-[10px] pt-1">
                <span>METHOD:</span>
                <span>{completedSaleReceipt.paymentMethod}</span>
              </div>
            </div>

            {completedSaleReceipt.etimsInvoiceNo && (
              <div className="text-center pt-2 border-t border-dashed border-slate-400 space-y-1">
                <p className="text-[9px] font-bold">KRA eTIMS VERIFIED</p>
                <p className="text-[8px] font-mono">{completedSaleReceipt.etimsInvoiceNo}</p>
              </div>
            )}

            <div className="pt-3 flex gap-2 no-print">
              <button
                onClick={() => window.print()}
                className="flex-1 py-1.5 bg-slate-900 text-white text-xs font-bold rounded flex items-center justify-center gap-1"
              >
                <Printer className="w-3.5 h-3.5" /> Print
              </button>
              <button
                onClick={() => setCompletedSaleReceipt(null)}
                className="py-1.5 px-3 bg-slate-200 text-slate-900 text-xs font-semibold rounded"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
