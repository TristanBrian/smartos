import React, { useState, useEffect } from 'react';
import {
  ShoppingCart, Package, Smartphone, ShieldCheck, Users, BarChart3,
  ShieldAlert, Wifi, WifiOff, Bell, ChevronDown, CheckCircle, RefreshCw, Layers, UserCheck
} from 'lucide-react';

import {
  INITIAL_TENANTS, INITIAL_PRODUCTS, INITIAL_LEDGER_ENTRIES,
  INITIAL_SALES, INITIAL_MPESA_TRANSACTIONS, INITIAL_ETIMS_QUEUE, INITIAL_STAFF
} from './data/mockData';

import PosTerminal from './components/PosTerminal';
import InventoryManager from './components/InventoryManager';
import MpesaReconciler from './components/MpesaReconciler';
import EtimsHub from './components/EtimsHub';
import OfflineSyncEngine from './components/OfflineSyncEngine';
import StaffManagement from './components/StaffManagement';
import ReportsBI from './components/ReportsBI';
import AdminConsole from './components/AdminConsole';
import ProfileManagement from './components/ProfileManagement';

export default function App() {
  const [tenants, setTenants] = useState(INITIAL_TENANTS);
  const [activeTenantId, setActiveTenantId] = useState('t_duka_nakuru');
  const [activeTab, setActiveTab] = useState('POS');

  const activeTenant = tenants.find(t => t.id === activeTenantId) || tenants[0];

  // Domain Data States
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [ledgerEntries, setLedgerEntries] = useState(INITIAL_LEDGER_ENTRIES);
  const [sales, setSales] = useState(INITIAL_SALES);
  const [mpesaTransactions, setMpesaTransactions] = useState(INITIAL_MPESA_TRANSACTIONS);
  const [etimsQueue, setEtimsQueue] = useState(INITIAL_ETIMS_QUEUE);
  const [staffList, setStaffList] = useState(INITIAL_STAFF);

  // Network & Sync States
  const [isOffline, setIsOffline] = useState(false);
  const [offlineOutbox, setOfflineOutbox] = useState([]);
  const [syncStatus, setSyncStatus] = useState('IDLE');

  // Notifications
  const [toastNotification, setToastNotification] = useState(null);

  const showToast = (message, type = 'success') => {
    setToastNotification({ message, type });
    setTimeout(() => setToastNotification(null), 4000);
  };

  // Handlers for POS Sales Finalization
  const handleCompleteSale = (newSale) => {
    if (isOffline) {
      const clientUuid = `018d${Math.floor(100000 + Math.random() * 900000)}-${Math.floor(1000 + Math.random() * 9000)}-7000-8000-${Math.floor(100000000000 + Math.random() * 900000000000)}`;
      const envelope = { ...newSale, clientUuid, type: 'SALE' };
      setOfflineOutbox(prev => [...prev, envelope]);
      showToast(`Sale #${newSale.receiptNumber} saved to Offline SQLite Outbox!`, 'warning');
    } else {
      applySaleToDomain(newSale);
      showToast(`Sale #${newSale.receiptNumber} completed & stock updated!`, 'success');
    }
  };

  const applySaleToDomain = (saleRecord) => {
    setSales(prev => [saleRecord, ...prev]);

    saleRecord.items.forEach(item => {
      setProducts(prevProds => prevProds.map(p => {
        if (p.id === item.id || p.sku === item.sku) {
          const newQty = Math.max(0, p.stockOnHand - item.qty);
          return { ...p, stockOnHand: newQty };
        }
        return p;
      }));

      const ledgerEntry = {
        id: `ledg_${Date.now()}_${Math.random()}`,
        timestamp: new Date().toISOString(),
        type: 'SALE',
        productSku: item.sku,
        productName: item.name,
        delta: -item.qty,
        runningBalance: 0,
        refDocument: saleRecord.receiptNumber,
        actorName: saleRecord.cashierName
      };
      setLedgerEntries(prev => [ledgerEntry, ...prev]);
    });

    if (saleRecord.paymentMethod.startsWith('MPESA')) {
      const mpesaTx = {
        transId: saleRecord.mpesaTransId || `QEH${Math.floor(1000000 + Math.random() * 9000000)}`,
        receiptNo: saleRecord.receiptNumber,
        timestamp: new Date().toISOString(),
        phone: "+254 722 000 111",
        amountCents: saleRecord.grandTotalCents,
        status: 'MATCHED',
        type: saleRecord.paymentMethod
      };
      setMpesaTransactions(prev => [mpesaTx, ...prev]);
    }

    if (activeTenant.isVatRegistered) {
      const etimsEntry = {
        id: `etims_${Date.now()}`,
        saleReceipt: saleRecord.receiptNumber,
        timestamp: new Date().toISOString(),
        invoiceNo: saleRecord.etimsInvoiceNo || `0000000000000${Math.floor(10000 + Math.random() * 90000)}`,
        kraStatus: saleRecord.isOfflineCaptured ? 'RETRY_QUEUED' : 'ACCEPTED',
        attempts: 1,
        lastResponse: saleRecord.isOfflineCaptured ? '503 Queued offline' : 'ACCEPTED_BY_OSCU',
        qrSignature: `KRA-OSCU-SIGN-${Math.floor(10000000 + Math.random() * 90000000)}`
      };
      setEtimsQueue(prev => [etimsEntry, ...prev]);
    }
  };

  const handleTriggerSync = () => {
    if (offlineOutbox.length === 0) return;
    setSyncStatus('SYNCING');

    setTimeout(() => {
      offlineOutbox.forEach(envelope => {
        applySaleToDomain(envelope);
      });

      setOfflineOutbox([]);
      setSyncStatus('IDLE');
      showToast(`Successfully synced ${offlineOutbox.length} offline transactions to cloud server!`, 'success');
    }, 1500);
  };

  const handleUpdateStock = ({ productId, productSku, productName, delta, type, reason, actorName }) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        return { ...p, stockOnHand: p.stockOnHand + delta };
      }
      return p;
    }));

    const newLedger = {
      id: `ledg_${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: type,
      productSku: productSku,
      productName: productName,
      delta: delta,
      runningBalance: (products.find(p => p.id === productId)?.stockOnHand || 0) + delta,
      refDocument: `ADJ-${type}`,
      actorName: actorName,
      reason: reason
    };

    setLedgerEntries(prev => [newLedger, ...prev]);
    showToast(`Stock ledger updated for ${productSku} (${delta > 0 ? '+' : ''}${delta})`, 'success');
  };

  const handleAddProduct = (newProd) => {
    setProducts(prev => [newProd, ...prev]);
    showToast(`New SKU ${newProd.sku} created!`, 'success');
  };

  const handleMatchPayment = ({ transId, receiptNo }) => {
    setMpesaTransactions(prev => prev.map(t => {
      if (t.transId === transId) {
        return { ...t, status: 'MATCHED', receiptNo: receiptNo };
      }
      return t;
    }));
    showToast(`Payment ${transId} matched to Receipt ${receiptNo}`, 'success');
  };

  const handleRetryEtims = (etimsId) => {
    setEtimsQueue(prev => prev.map(e => {
      if (e.id === etimsId) {
        return { ...e, kraStatus: 'ACCEPTED', attempts: e.attempts + 1, lastResponse: 'ACCEPTED_BY_OSCU_RETRY' };
      }
      return e;
    }));
    showToast(`eTIMS invoice resubmitted and accepted by KRA!`, 'success');
  };

  const handleAddStaff = (newStaff) => {
    setStaffList(prev => [...prev, newStaff]);
    showToast(`Staff member ${newStaff.name} invited!`, 'success');
  };

  const handleUpdateTenantTier = (newTier) => {
    setTenants(prev => prev.map(t => {
      if (t.id === activeTenantId) {
        return { ...t, tier: newTier };
      }
      return t;
    }));
    showToast(`Tenant subscription upgraded to ${newTier}!`, 'success');
  };

  const handleUpdateTenantProfile = (updatedTenant) => {
    setTenants(prev => prev.map(t => t.id === updatedTenant.id ? updatedTenant : t));
    showToast(`Store profile & security configuration updated!`, 'success');
  };

  const handleExportData = () => {
    const fullData = {
      tenant: activeTenant,
      products: products,
      ledgerEntries: ledgerEntries,
      sales: sales,
      mpesaTransactions: mpesaTransactions,
      etimsQueue: etimsQueue,
      staff: staffList,
      exportedAt: new Date().toISOString()
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fullData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `BiasharaOS_Export_${activeTenant.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showToast(`Full tenant data export generated (BR-014)`, 'success');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F17]">
      {/* Top Header Navbar */}
      <header className="sticky top-0 z-40 bg-[#0B0F17]/90 backdrop-blur-md border-b border-[#2A364F] px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-extrabold text-slate-950 text-sm shadow-md shadow-emerald-500/20">
                B
              </div>
              <span className="font-display font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Biashara<span className="text-emerald-400">OS</span>
              </span>
            </div>

            <div className="h-5 w-px bg-slate-800 hidden sm:block" />

            {/* Active Workspace Selector */}
            <div className="relative group">
              <select
                value={activeTenantId}
                onChange={(e) => setActiveTenantId(e.target.value)}
                className="bg-[#121824] border border-[#2A364F] rounded-xl px-3 py-1.5 text-xs text-slate-200 font-semibold focus:outline-none focus:border-emerald-500 cursor-pointer appearance-none pr-8"
              >
                {tenants.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.county}) — {t.tier} Tier
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOffline(!isOffline)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                isOffline
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-lg shadow-amber-500/10'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              }`}
            >
              {isOffline ? <WifiOff className="w-3.5 h-3.5 animate-pulse" /> : <Wifi className="w-3.5 h-3.5" />}
              <span>{isOffline ? `OFFLINE (${offlineOutbox.length} Queued)` : 'ONLINE'}</span>
            </button>

            {offlineOutbox.length > 0 && !isOffline && (
              <button
                onClick={handleTriggerSync}
                className="px-3 py-1.5 bg-emerald-500 text-slate-950 font-bold text-xs rounded-full shadow-lg shadow-emerald-500/25 flex items-center gap-1 animate-pulse"
              >
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Sync ({offlineOutbox.length})
              </button>
            )}

            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-[11px] text-slate-300 border border-slate-700">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>eTIMS: <strong>{activeTenant.isVatRegistered ? 'OSCU Active' : 'Exempt'}</strong></span>
            </div>
          </div>
        </div>
      </header>

      {/* Main App Navigation Tabs Bar */}
      <nav className="bg-[#121824] border-b border-[#2A364F] px-4 overflow-x-auto">
        <div className="max-w-7xl mx-auto flex gap-1 py-1.5">
          {[
            { id: 'POS', label: 'POS Terminal', icon: ShoppingCart },
            { id: 'INVENTORY', label: 'Inventory Intelligence', icon: Package, badge: products.filter(p => p.stockOnHand <= p.reorderThreshold).length },
            { id: 'PAYMENTS', label: 'M-Pesa Reconciliation', icon: Smartphone, badge: mpesaTransactions.filter(t => t.status === 'UNMATCHED').length },
            { id: 'ETIMS', label: 'KRA eTIMS Tax', icon: ShieldCheck, badge: etimsQueue.filter(e => e.kraStatus === 'RETRY_QUEUED').length },
            { id: 'SYNC', label: 'Offline Outbox Engine', icon: Layers, badge: offlineOutbox.length },
            { id: 'STAFF', label: 'Staff & Roles', icon: Users },
            { id: 'PROFILE', label: 'Store & Profile Config', icon: UserCheck },
            { id: 'REPORTS', label: 'Reports & BI', icon: BarChart3 },
            { id: 'ADMIN', label: 'Platform Admin', icon: ShieldAlert }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-md shadow-emerald-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#1A2332]'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 font-bold rounded-full text-[10px]">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {activeTab === 'POS' && (
          <PosTerminal
            products={products}
            onCompleteSale={handleCompleteSale}
            isOffline={isOffline}
            activeTenant={activeTenant}
          />
        )}

        {activeTab === 'INVENTORY' && (
          <InventoryManager
            products={products}
            ledgerEntries={ledgerEntries}
            onAddProduct={handleAddProduct}
            onUpdateStock={handleUpdateStock}
            activeTenant={activeTenant}
          />
        )}

        {activeTab === 'PAYMENTS' && (
          <MpesaReconciler
            mpesaTransactions={mpesaTransactions}
            sales={sales}
            onMatchPayment={handleMatchPayment}
            activeTenant={activeTenant}
          />
        )}

        {activeTab === 'ETIMS' && (
          <EtimsHub
            etimsQueue={etimsQueue}
            sales={sales}
            onRetryEtims={handleRetryEtims}
            activeTenant={activeTenant}
          />
        )}

        {activeTab === 'SYNC' && (
          <OfflineSyncEngine
            offlineOutbox={offlineOutbox}
            isOffline={isOffline}
            setIsOffline={setIsOffline}
            onSyncNow={handleTriggerSync}
            syncStatus={syncStatus}
          />
        )}

        {activeTab === 'STAFF' && (
          <StaffManagement
            staffList={staffList}
            onAddStaff={handleAddStaff}
            activeTenant={activeTenant}
          />
        )}

        {activeTab === 'PROFILE' && (
          <ProfileManagement
            activeTenant={activeTenant}
            onUpdateTenantProfile={handleUpdateTenantProfile}
            onExportData={handleExportData}
          />
        )}

        {activeTab === 'REPORTS' && (
          <ReportsBI
            sales={sales}
            products={products}
            activeTenant={activeTenant}
          />
        )}

        {activeTab === 'ADMIN' && (
          <AdminConsole
            tenants={tenants}
            activeTenant={activeTenant}
            onSwitchTenant={setActiveTenantId}
            onUpdateTenantTier={handleUpdateTenantTier}
          />
        )}
      </main>

      {/* Floating Notification Toast */}
      {toastNotification && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce">
          <div className={`px-4 py-3 rounded-2xl glass-panel shadow-2xl flex items-center gap-3 border text-xs font-semibold text-slate-100 ${
            toastNotification.type === 'warning' ? 'border-amber-500/50 text-amber-300' : 'border-emerald-500/50 text-emerald-300'
          }`}>
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{toastNotification.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
