import React, { useState } from 'react';
import {
  Search, Barcode, ShoppingCart, Trash2, Plus, Minus, CreditCard,
  DollarSign, Smartphone, Printer, CheckCircle, AlertTriangle,
  Wifi, WifiOff, Clock, Bluetooth, Check, RefreshCw
} from 'lucide-react';

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

  // Bluetooth ESC/POS Printer Connection State
  const [btConnected, setBtConnected] = useState(false);
  const [btDeviceName, setBtDeviceName] = useState('');
  const [btCharacteristic, setBtCharacteristic] = useState(null);
  const [btConnecting, setBtConnecting] = useState(false);

  const categories = ['ALL', ...new Set(products.map(p => p.category))];

  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesQuery = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (p.barcode && p.barcode.includes(searchQuery));
    return matchesCat && matchesQuery;
  });

  const getLatestStock = (productId, sku) => {
    const p = products.find(prod => prod.id === productId || prod.sku === sku);
    return p ? p.stockOnHand : 0;
  };

  const addToCart = (product) => {
    const currentAvailable = getLatestStock(product.id, product.sku);

    if (currentAvailable <= 0 && !activeTenant.allowOversell) {
      alert(`Oversell Blocked! ${product.name} is out of stock (Available: 0 ${product.uom}).`);
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        const nextQty = Math.round((existing.qty + 1) * 100) / 100;
        if (nextQty > currentAvailable && !activeTenant.allowOversell) {
          alert(`Oversell Blocked! Cannot add more ${product.name}. Stock available: ${currentAvailable} ${product.uom}.`);
          return prev;
        }
        return prev.map(item => item.id === product.id ? { ...item, qty: nextQty } : item);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const currentAvailable = getLatestStock(item.id, item.sku);
        const nextQty = Math.round((item.qty + delta) * 100) / 100;
        if (nextQty <= 0) return null;
        if (nextQty > currentAvailable && !activeTenant.allowOversell) {
          alert(`Oversell Blocked! Quantity for ${item.name} cannot exceed current stock (${currentAvailable} ${item.uom}).`);
          return { ...item, qty: currentAvailable };
        }
        return { ...item, qty: nextQty };
      }
      return item;
    }).filter(Boolean));
  };

  const setQtyDirect = (id, exactQty) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        if (exactQty <= 0) return null;
        const currentAvailable = getLatestStock(item.id, item.sku);
        if (exactQty > currentAvailable && !activeTenant.allowOversell) {
          alert(`Oversell Blocked! Requested ${exactQty} ${item.uom} for ${item.name}, but stock available is only ${currentAvailable} ${item.uom}. Capped to maximum available stock.`);
          return { ...item, qty: currentAvailable };
        }
        return { ...item, qty: Math.round(exactQty * 100) / 100 };
      }
      return item;
    }).filter(Boolean));
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  // Web Bluetooth ESC/POS Printer Connect Handler
  const handleConnectBluetoothPrinter = async () => {
    if (!navigator.bluetooth) {
      alert('Web Bluetooth is not supported in this browser. Please use Google Chrome, Edge, or Chrome for Android.');
      return;
    }

    setBtConnecting(true);
    try {
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          '000018f0-0000-1000-8000-00805f9b34fb', // Standard ESC/POS
          'e7810a71-73ae-499d-8c15-faa9aef0c3f2', // MPT-II thermal printer
          '49535343-fe7d-4ae5-8fa9-9fafd205e455'  // POS-58
        ]
      });

      const server = await device.gatt.connect();
      const services = await server.getPrimaryServices();

      let targetChar = null;
      for (const service of services) {
        const characteristics = await service.getCharacteristics();
        for (const char of characteristics) {
          if (char.properties.write || char.properties.writeWithoutResponse) {
            targetChar = char;
            break;
          }
        }
        if (targetChar) break;
      }

      if (targetChar) {
        setBtCharacteristic(targetChar);
        setBtConnected(true);
        setBtDeviceName(device.name || 'ESC/POS Thermal Printer');
        alert(`Successfully paired Bluetooth Thermal Printer: ${device.name || 'ESC/POS Printer'}!`);
      } else {
        alert('Connected to Bluetooth device, but no ESC/POS write service was found.');
      }
    } catch (err) {
      console.error('Bluetooth connection error:', err);
    } finally {
      setBtConnecting(false);
    }
  };

  const sendEscPosBytes = async (textStr) => {
    if (!btCharacteristic) {
      window.print();
      return;
    }

    try {
      const encoder = new TextEncoder();
      const initCmd = new Uint8Array([0x1B, 0x40]); // ESC @ Reset
      const textBytes = encoder.encode(textStr + '\n\n\n\n');
      const cutCmd = new Uint8Array([0x1D, 0x56, 0x41, 0x03]); // ESC/POS Paper Cut

      const fullBytes = new Uint8Array(initCmd.length + textBytes.length + cutCmd.length);
      fullBytes.set(initCmd, 0);
      fullBytes.set(textBytes, initCmd.length);
      fullBytes.set(cutCmd, initCmd.length + textBytes.length);

      // Send chunks of 512 bytes
      const chunkSize = 512;
      for (let i = 0; i < fullBytes.length; i += chunkSize) {
        const chunk = fullBytes.subarray(i, i + chunkSize);
        if (btCharacteristic.properties.writeWithoutResponse) {
          await btCharacteristic.writeValueWithoutResponse(chunk);
        } else {
          await btCharacteristic.writeValueWithResponse(chunk);
        }
      }
    } catch (err) {
      console.error('ESC/POS Bluetooth Print error:', err);
      window.print();
    }
  };

  // Calculations in Cents
  const rawSubtotalCents = cart.reduce((sum, item) => sum + Math.round(item.sellPriceCents * item.qty), 0);
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

    if (activeTenant?.status === 'EXPIRED' || activeTenant?.status === 'SUSPENDED') {
      alert(`Subscription Expired: Store workspace '${activeTenant.name}' subscription has expired. Please renew via M-Pesa STK Push in Settings / Platform Admin to resume sales.`);
      return;
    }

    // Hard Guard Check: Ensure no item exceeds current stock on hand
    for (const item of cart) {
      const available = getLatestStock(item.id, item.sku);
      if (item.qty > available && !activeTenant.allowOversell) {
        alert(`Oversell Prevented! Item "${item.name}" quantity (${item.qty} ${item.uom}) exceeds current stock on hand (${available} ${item.uom}). Please adjust cart quantity.`);
        return;
      }
    }

    setPaymentModalOpen(true);
    setStkPushStep('IDLE');
    setCashTenderedKSh((grandTotalCents / 100).toString());
  };

  const handleProcessPayment = () => {
    if (paymentMethod === 'MPESA_STK') {
      const cleanPhone = customerPhone.replace(/[^0-9+]/g, '');
      if (!cleanPhone || cleanPhone.length < 10) {
        alert('Invalid M-Pesa Mobile Number: Enter a valid 10-13 digit Kenyan Safaricom phone number (e.g. 0722000111 or +254722000111).');
        return;
      }

      setStkPushStep('SENDING');
      setTimeout(() => {
        setStkPushStep('WAITING_PIN');
        setTimeout(() => {
          setStkPushStep('SUCCESS');
          finalizeSaleRecord('MPESA_STK', 'COMPLETED');
        }, 2200);
      }, 1000);
    } else if (paymentMethod === 'CASH') {
      const tendered = parseFloat(cashTenderedKSh) || 0;
      const grandTotalKSh = grandTotalCents / 100;
      if (tendered < grandTotalKSh) {
        alert(`Insufficient Cash Tendered: Tendered KSh ${tendered.toFixed(2)} is less than total payable KSh ${grandTotalKSh.toFixed(2)}.`);
        return;
      }
      finalizeSaleRecord(paymentMethod, 'COMPLETED');
    } else {
      finalizeSaleRecord(paymentMethod, 'COMPLETED');
    }
  };

  const finalizeSaleRecord = (method, status) => {
    // Final Oversell Safety Guard
    for (const item of cart) {
      const available = getLatestStock(item.id, item.sku);
      if (item.qty > available && !activeTenant.allowOversell) {
        alert(`Sale Aborted! Stock for ${item.name} is insufficient (${available} available).`);
        return;
      }
    }

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
        uom: i.uom,
        unitPriceCents: i.sellPriceCents,
        lineTotalCents: Math.round(i.sellPriceCents * i.qty)
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
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center mb-4">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search products by SKU, name, or scan barcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#121824] border border-[#2A364F] rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-medium"
            />
          </div>

          {/* Bluetooth ESC/POS Printer Status Button */}
          <button
            onClick={handleConnectBluetoothPrinter}
            disabled={btConnecting}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all border ${
              btConnected
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-md shadow-emerald-500/10'
                : 'bg-[#121824] text-slate-300 border-[#2A364F] hover:border-slate-500'
            }`}
          >
            <Bluetooth className={`w-3.5 h-3.5 ${btConnected ? 'text-emerald-400' : 'text-slate-400'}`} />
            <span>{btConnected ? `Printer: ${btDeviceName}` : 'Connect BT Printer'}</span>
          </button>
        </div>

        {/* Categories Bar */}
        <div className="flex gap-1.5 overflow-x-auto pb-3 mb-2 border-b border-[#2A364F]">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-[#121824] text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Cards Grid */}
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

        {/* Cart Item Rows */}
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
              const available = getLatestStock(item.id, item.sku);

              return (
                <div key={item.id} className="p-3 rounded-xl bg-[#121824] border border-[#2A364F] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 pr-2">
                      <div className="font-medium text-sm text-slate-200 line-clamp-1">{item.name}</div>
                      <div className="text-xs text-emerald-400 font-medium">
                        KSh {(item.sellPriceCents / 100).toLocaleString()} / {item.uom}
                        <span className="text-slate-400 text-[10px] ml-2">(Max: {available} {item.uom})</span>
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

        {/* Totals & Charge Actions */}
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

      {/* Payment Selection & Calculator Modal */}
      {paymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full p-6 rounded-2xl border border-emerald-500/30 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#2A364F]">
              <h3 className="font-bold text-slate-100 text-base">Select Payment Rail</h3>
              <button onClick={() => setPaymentModalOpen(false)} className="text-slate-400 hover:text-white text-sm font-bold">✕</button>
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
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/25 transition-all"
            >
              Confirm Payment & Issue Thermal Receipt
            </button>
          </div>
        </div>
      )}

      {/* Completed Sale Thermal Receipt Modal */}
      {completedSaleReceipt && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="thermal-receipt max-w-xs w-full p-6 rounded-2xl border border-slate-300 space-y-3 bg-white text-slate-950 shadow-2xl font-mono">
            <div className="text-center space-y-1 text-slate-950">
              <h3 className="font-extrabold text-base tracking-tight uppercase text-slate-950">{activeTenant.name}</h3>
              <p className="text-xs text-slate-700 font-semibold">{activeTenant.county} Branch</p>
              <p className="text-xs text-slate-700">TEL: {activeTenant.phone}</p>
              {activeTenant.isVatRegistered && <p className="text-xs text-slate-700 font-mono">KRA PIN: {activeTenant.kraPin}</p>}
              <div className="border-b border-dashed border-slate-400 my-2.5" />
              <p className="text-xs font-mono text-slate-950 font-bold">RECEIPT #: {completedSaleReceipt.receiptNumber}</p>
              <p className="text-xs text-slate-700 font-mono">{new Date(completedSaleReceipt.timestamp).toLocaleString()}</p>
              <p className="text-xs text-slate-800 font-bold">CASHIER: {completedSaleReceipt.cashierName}</p>
            </div>

            <div className="border-b border-dashed border-slate-400 my-2.5" />

            <div className="space-y-1.5 text-xs font-mono text-slate-950">
              {completedSaleReceipt.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-slate-950 font-bold">
                  <span className="truncate max-w-[170px]">{item.qty} {item.uom || 'x'} {item.name}</span>
                  <span className="font-extrabold font-mono">KSh {(item.lineTotalCents / 100).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-b border-dashed border-slate-400 my-2.5" />

            <div className="space-y-1.5 text-xs font-mono text-slate-950">
              <div className="flex justify-between text-slate-800 font-semibold">
                <span>SUBTOTAL:</span>
                <span className="font-bold text-slate-950">KSh {(completedSaleReceipt.subtotalCents / 100).toFixed(2)}</span>
              </div>
              {completedSaleReceipt.discountCents > 0 && (
                <div className="flex justify-between text-rose-800 font-bold">
                  <span>DISCOUNT:</span>
                  <span>-KSh {(completedSaleReceipt.discountCents / 100).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-extrabold text-sm pt-1.5 border-t border-slate-300 text-slate-950">
                <span>TOTAL PAID:</span>
                <span className="text-emerald-800 font-black">KSh {(completedSaleReceipt.grandTotalCents / 100).toFixed(2)}</span>
              </div>

              {completedSaleReceipt.paymentMethod === 'CASH' && (
                <div className="my-2 p-2 bg-emerald-50 border border-emerald-300 rounded-xl space-y-1">
                  <div className="flex justify-between text-xs text-emerald-950 font-semibold">
                    <span>CASH TENDERED:</span>
                    <span className="font-bold font-mono">KSh {((completedSaleReceipt.cashTenderedCents || completedSaleReceipt.grandTotalCents) / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold text-emerald-900 border-t border-emerald-200 pt-1">
                    <span>CHANGE RETURNED:</span>
                    <span className="font-mono">KSh {((completedSaleReceipt.changeGivenCents || 0) / 100).toFixed(2)}</span>
                  </div>
                </div>
              )}

              <div className="flex justify-between text-xs pt-1 text-slate-900 font-bold">
                <span>PAYMENT METHOD:</span>
                <span className="uppercase font-extrabold text-emerald-800">{completedSaleReceipt.paymentMethod}</span>
              </div>
            </div>

            {completedSaleReceipt.etimsInvoiceNo && (
              <div className="text-center pt-2.5 border-t border-dashed border-slate-400 space-y-0.5 text-slate-950">
                <p className="text-xs font-extrabold text-emerald-800 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 inline" /> KRA eTIMS VERIFIED
                </p>
                <p className="text-[10px] font-mono text-slate-700">{completedSaleReceipt.etimsInvoiceNo}</p>
                {completedSaleReceipt.qrSignature && (
                  <p className="text-[8px] font-mono text-slate-500 truncate">{completedSaleReceipt.qrSignature}</p>
                )}
              </div>
            )}

            <div className="pt-3 flex gap-2 no-print">
              <button
                onClick={() => {
                  const thermalText = `${activeTenant.name}\nRECEIPT: ${completedSaleReceipt.receiptNumber}\nTOTAL: KSh ${(completedSaleReceipt.grandTotalCents/100).toFixed(2)}\nASANTE SANA!`;
                  sendEscPosBytes(thermalText);
                  window.print();
                }}
                className="flex-1 py-2.5 bg-slate-950 hover:bg-slate-900 text-white text-xs font-extrabold rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-slate-950/20 transition-all"
              >
                <Printer className="w-4 h-4 text-emerald-400" />
                {btConnected ? 'Print to BT Thermal Printer' : 'Print Receipt'}
              </button>
              <button
                onClick={() => setCompletedSaleReceipt(null)}
                className="py-2.5 px-4 bg-slate-200 hover:bg-slate-300 text-slate-950 text-xs font-extrabold rounded-xl transition-all"
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
