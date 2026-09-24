import React, { useState, useEffect } from 'react';
import {
  ShoppingCart, Package, Smartphone, ShieldCheck, Users, BarChart3,
  ShieldAlert, Wifi, WifiOff, Bell, ChevronDown, CheckCircle, RefreshCw, Layers, UserCheck, Lock, Sparkles, User, Check, X, LogOut, KeyRound, ArrowRight
} from 'lucide-react';

import {
  INITIAL_TENANTS, INITIAL_PRODUCTS, INITIAL_LEDGER_ENTRIES,
  INITIAL_SALES, INITIAL_MPESA_TRANSACTIONS, INITIAL_ETIMS_QUEUE, INITIAL_STAFF, INITIAL_CASH_DEPOSITS,
  TEST_USERS, ROLE_PERMISSIONS_MATRIX
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

  // RBAC Session & Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loginUsername, setLoginUsername] = useState('test1user');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [loginError, setLoginError] = useState('');
  const [forbidden403Modal, setForbidden403Modal] = useState(null);

  // Domain Data States
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [ledgerEntries, setLedgerEntries] = useState(INITIAL_LEDGER_ENTRIES);
  const [sales, setSales] = useState(INITIAL_SALES);
  const [mpesaTransactions, setMpesaTransactions] = useState(INITIAL_MPESA_TRANSACTIONS);
  const [cashDeposits, setCashDeposits] = useState(INITIAL_CASH_DEPOSITS);
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

  // Authentication & Dynamic Persona Dashboard Routing
  const handlePerformLogin = (specificUser) => {
    let targetUser = specificUser;
    if (!targetUser) {
      targetUser = TEST_USERS.find(u => u.username.toLowerCase() === loginUsername.trim().toLowerCase());
    }

    if (!targetUser) {
      setLoginError(`Invalid credentials for user '${loginUsername}'. Valid demo users: test1admin, test1user, test2user.`);
      return;
    }

    setCurrentUser(targetUser);
    setIsLoggedIn(true);
    setLoginError('');

    // Dynamic Persona Routing: Route directly to persona's primary dashboard view
    let primaryTab = 'POS';
    if (targetUser.role === 'SUPER_ADMIN') {
      primaryTab = 'ADMIN';
    } else if (targetUser.role === 'OWNER' || targetUser.role === 'MANAGER') {
      primaryTab = 'POS';
    } else if (targetUser.role === 'CASHIER') {
      primaryTab = 'POS';
    }

    setActiveTab(primaryTab);
    showToast(`Authenticated as ${targetUser.username} (${targetUser.roleLabel}). Routed to ${primaryTab} Dashboard!`, 'success');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setForbidden403Modal(null);
    showToast(`Logged out of BiasharaOS session.`, 'warning');
  };

  const handleTabClick = (tabId, tabLabel) => {
    if (!currentUser) return;
    const userPerms = ROLE_PERMISSIONS_MATRIX[currentUser.role] || ROLE_PERMISSIONS_MATRIX.SUPER_ADMIN;
    if (!userPerms.allowedTabs.includes(tabId)) {
      setForbidden403Modal({
        tabId,
        tabLabel,
        requiredRole: tabId === 'ADMIN' ? 'SUPER_ADMIN' : 'OWNER / MANAGER',
        reason: `Authenticated user '${currentUser.username}' (${currentUser.roleLabel}) does not hold RBAC permissions for '${tabLabel}'.`
      });
      return;
    }
    setActiveTab(tabId);
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
        actorName: saleRecord.cashierName || (currentUser ? currentUser.username : 'Cashier')
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
        invoiceNo: saleRecord.etimsInvoiceNo || `000000000000${Math.floor(100000 + Math.random() * 900000)}`,
        kraStatus: 'ACCEPTED',
        attempts: 1,
        lastResponse: 'ACCEPTED_BY_OSCU',
        qrSignature: `KRA-OSCU-VERIFIED-${Math.floor(100000000000 + Math.random() * 900000000000)}`
      };
      setEtimsQueue(prev => [etimsEntry, ...prev]);
    }
  };

  const handleTriggerSync = () => {
    if (offlineOutbox.length === 0) return;
    setSyncStatus('SYNCING');
    setTimeout(() => {
      offlineOutbox.forEach(env => {
        applySaleToDomain(env);
      });
      setOfflineOutbox([]);
      setSyncStatus('SUCCESS');
      showToast(`Successfully synced ${offlineOutbox.length} offline transactions!`, 'success');
    }, 1500);
  };

  const handleAddProduct = (newProd) => {
    setProducts(prev => [newProd, ...prev]);
    const ledgerEntry = {
      id: `ledg_${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'INITIAL_STOCK',
      productSku: newProd.sku,
      productName: newProd.name,
      delta: newProd.stockOnHand,
      runningBalance: newProd.stockOnHand,
      refDocument: 'MANUAL_ENTRY',
      actorName: currentUser ? currentUser.username : 'Admin'
    };
    setLedgerEntries(prev => [ledgerEntry, ...prev]);
    showToast(`Product ${newProd.name} added to catalog!`, 'success');
  };

  const handleUpdateStock = (sku, delta, type, reason) => {
    setProducts(prev => prev.map(p => {
      if (p.sku === sku) {
        return { ...p, stockOnHand: Math.max(0, p.stockOnHand + delta) };
      }
      return p;
    }));

    const targetProd = products.find(p => p.sku === sku);
    const ledgerEntry = {
      id: `ledg_${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: type,
      productSku: sku,
      productName: targetProd ? targetProd.name : sku,
      delta: delta,
      runningBalance: (targetProd ? targetProd.stockOnHand : 0) + delta,
      refDocument: `ADJ-${type}`,
      actorName: currentUser ? currentUser.username : 'Admin',
      reason: reason
    };
    setLedgerEntries(prev => [ledgerEntry, ...prev]);
    showToast(`Stock updated for ${sku} (${delta > 0 ? '+' : ''}${delta})`, 'success');
  };

  const handleMatchPayment = (transId, receiptNo) => {
    setMpesaTransactions(prev => prev.map(tx => {
      if (tx.transId === transId) {
        return { ...tx, status: 'MATCHED', receiptNo: receiptNo };
      }
      return tx;
    }));
    showToast(`M-Pesa payment ${transId} matched to receipt ${receiptNo}!`, 'success');
  };

  const handleLogCashDeposit = (newDeposit) => {
    setCashDeposits(prev => [newDeposit, ...prev]);
    showToast(`Cash deposit ${newDeposit.refNumber} recorded in register!`, 'success');
  };

  const handleRetryEtims = (id) => {
    setEtimsQueue(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          kraStatus: 'ACCEPTED',
          invoiceNo: `000000000000${Math.floor(100000 + Math.random() * 900000)}`,
          lastResponse: 'ACCEPTED_BY_OSCU',
          qrSignature: `KRA-OSCU-VERIFIED-${Math.floor(100000000000 + Math.random() * 900000000000)}`
        };
      }
      return item;
    }));
    showToast(`KRA eTIMS invoice signed & accepted by OSCU!`, 'success');
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

  const handleOnboardTenant = (newTenantData) => {
    const slug = newTenantData.name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');
    const tenantId = `t_${slug}_${Math.random().toString(36).substring(2, 8)}`;
    const schemaName = `tenant_${tenantId}`;

    const newTenant = {
      id: tenantId,
      schemaName: schemaName,
      name: newTenantData.name,
      type: newTenantData.type || 'GROCERY',
      county: newTenantData.county || 'Nairobi',
      ownerName: newTenantData.ownerName || 'Shop Admin',
      ownerPhone: newTenantData.ownerPhone || '0722000000',
      tier: newTenantData.tier || 'LITE',
      isVatRegistered: Boolean(newTenantData.isVatRegistered),
      kraPin: newTenantData.kraPin || null,
      mpesaPaybill: newTenantData.mpesaPaybill || '123456',
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    };

    setTenants(prev => [...prev, newTenant]);
    setActiveTenantId(tenantId);
    showToast(`Provisioned schema '${schemaName}' for ${newTenantData.name}!`, 'success');
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

  // Render Login Screen if not authenticated
  if (!isLoggedIn || !currentUser) {
    return (
      <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center p-4">
        <div className="glass-panel max-w-md w-full p-8 rounded-3xl border border-emerald-500/30 space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-extrabold text-slate-950 text-2xl shadow-lg shadow-emerald-500/20 mx-auto">
              B
            </div>
            <h1 className="font-display font-extrabold text-2xl text-slate-100 tracking-tight">
              Biashara<span className="text-emerald-400">OS</span>
            </h1>
            <p className="text-xs text-slate-400">
              Kenyan MSME Business & Inventory Intelligence Platform
            </p>
          </div>

          {loginError && (
            <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-xs text-rose-300 font-medium">
              {loginError}
            </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); handlePerformLogin(); }} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Username / Account ID</label>
              <input
                type="text"
                required
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder="test1user"
                className="w-full bg-[#121824] border border-[#2A364F] rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#121824] border border-[#2A364F] rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all"
            >
              Sign In to Store Workspace <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Account Selector */}
          <div className="pt-4 border-t border-[#2A364F] space-y-2">
            <div className="text-[11px] text-slate-400 font-semibold text-center">
              Or Sign In via 1-Click Demo Accounts:
            </div>
            <div className="space-y-2">
              {TEST_USERS.map(user => (
                <button
                  key={user.id}
                  onClick={() => handlePerformLogin(user)}
                  className="w-full p-2.5 bg-[#121824] hover:bg-slate-800 rounded-xl border border-[#2A364F] flex items-center justify-between text-xs transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{user.avatar}</span>
                    <div className="text-left">
                      <div className="font-bold text-slate-100">{user.username}</div>
                      <div className="text-[10px] text-slate-400">{user.description}</div>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${user.badgeColor}`}>
                    {user.role}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            {/* Logged In User Profile Pill */}
            <div className="flex items-center gap-2 bg-[#121824] border border-[#2A364F] px-3 py-1.5 rounded-xl text-xs">
              <span className="text-base">{currentUser.avatar}</span>
              <div className="text-left hidden sm:block">
                <div className="font-bold text-slate-100 flex items-center gap-1.5 leading-none">
                  {currentUser.username}
                  <span className={`px-1.5 py-0.2 text-[9px] font-bold rounded border ${currentUser.badgeColor}`}>
                    {currentUser.role}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">{currentUser.roleLabel}</div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold text-xs rounded-xl flex items-center gap-1 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" /> Log Out
            </button>

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
          ].map(tab => {
            const isAllowed = (ROLE_PERMISSIONS_MATRIX[currentUser.role]?.allowedTabs || []).includes(tab.id);
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id, tab.label)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-md shadow-emerald-500/10'
                    : isAllowed
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-[#1A2332]'
                    : 'text-slate-600 hover:text-rose-400 hover:bg-rose-950/20 opacity-70'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {!isAllowed && (
                  <Lock className="w-3 h-3 text-rose-400 shrink-0" />
                )}
                {tab.badge !== undefined && tab.badge > 0 && isAllowed && (
                  <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 font-bold rounded-full text-[10px]">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
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
            cashDeposits={cashDeposits}
            onMatchPayment={handleMatchPayment}
            onLogCashDeposit={handleLogCashDeposit}
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
            currentUser={currentUser}
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
            onOnboardTenant={handleOnboardTenant}
          />
        )}
      </main>

      {/* 403 Forbidden Access Denied Modal */}
      {forbidden403Modal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-panel max-w-md w-full p-6 rounded-2xl border border-rose-500/50 space-y-4 text-center">
            <div className="w-14 h-14 bg-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mx-auto border border-rose-500/30">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <div>
              <h3 className="font-bold text-slate-100 text-lg font-display">403 Access Denied — RBAC Restricted</h3>
              <p className="text-xs text-slate-400 mt-1">
                {forbidden403Modal.reason}
              </p>
            </div>

            <div className="bg-rose-950/40 border border-rose-500/30 p-3 rounded-xl text-xs text-left text-rose-300 space-y-1">
              <div className="font-bold text-rose-200">Required Role Authority:</div>
              <div>Tab <strong>'{forbidden403Modal.tabLabel}'</strong> requires role: <code>{forbidden403Modal.requiredRole}</code>. Your active session <strong>'{currentUser.username}'</strong> has role <code>{currentUser.role}</code>.</div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setForbidden403Modal(null)}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl"
              >
                Close Alert
              </button>
            </div>
          </div>
        </div>
      )}

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
