import React, { useState } from 'react';
import {
  Smartphone, CheckCircle, AlertTriangle, RefreshCw, Search,
  ShieldCheck, ArrowRight, Clock, DollarSign, Sparkles, XCircle,
  PlusCircle, Building, Wallet, FileText, Check, ChevronDown
} from 'lucide-react';

export default function MpesaReconciler({
  mpesaTransactions = [],
  sales = [],
  cashDeposits = [],
  onMatchPayment,
  onLogCashDeposit,
  activeTenant
}) {
  const [filter, setFilter] = useState('ALL'); // ALL, MPESA, CASH, UNMATCHED
  const [selectedUnmatched, setSelectedUnmatched] = useState(null);
  const [targetReceipt, setTargetReceipt] = useState('');
  const [receiptSearchTerm, setReceiptSearchTerm] = useState('');

  // Cash Deposit Modal State
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositType, setDepositType] = useState('TILL_FLOAT'); // TILL_FLOAT, BANK_DEPOSIT, SAFE_DEPOSIT
  const [depositAmount, setDepositAmount] = useState('');
  const [depositorName, setDepositorName] = useState('Grace Wanjiru');
  const [depositNotes, setDepositNotes] = useState('');

  // STK Query Modal State
  const [queryModalTx, setQueryModalTx] = useState(null);
  const [queryingState, setQueryingState] = useState(false);
  const [queryResult, setQueryResult] = useState(null);

  const filteredTrans = mpesaTransactions.filter(t => {
    if (filter === 'MATCHED') return t.status === 'MATCHED';
    if (filter === 'UNMATCHED') return t.status === 'UNMATCHED';
    if (filter === 'MPESA') return t.type !== 'CASH';
    if (filter === 'CASH') return t.type === 'CASH';
    return true;
  });

  const handleManualMatch = () => {
    if (!selectedUnmatched || !targetReceipt) return;

    onMatchPayment({
      transId: selectedUnmatched.transId,
      receiptNo: targetReceipt
    });

    setSelectedUnmatched(null);
    setTargetReceipt('');
    setReceiptSearchTerm('');
  };

  const handleCreateCashDeposit = (e) => {
    e.preventDefault();
    const amountVal = parseFloat(depositAmount);
    if (isNaN(amountVal) || amountVal <= 0) return;

    const newDeposit = {
      id: `cdep_${Date.now()}`,
      refNumber: `DEP-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(10 + Math.random() * 90)}`,
      timestamp: new Date().toISOString(),
      depositorName: depositorName || 'Cashier',
      type: depositType,
      amountCents: Math.round(amountVal * 100),
      notes: depositNotes || (depositType === 'TILL_FLOAT' ? 'Till Opening Float' : 'Bank Deposit'),
      status: 'VERIFIED'
    };

    if (onLogCashDeposit) {
      onLogCashDeposit(newDeposit);
    }

    setShowDepositModal(false);
    setDepositAmount('');
    setDepositNotes('');
  };

  const handleExecuteStkQuery = (tx) => {
    setQueryModalTx(tx);
    setQueryingState(true);
    setQueryResult(null);

    setTimeout(() => {
      setQueryingState(false);
      const isSuccess = tx.status === 'MATCHED' || Math.random() > 0.3;
      if (isSuccess) {
        setQueryResult({
          resultCode: "0",
          resultDesc: "The service request has been processed successfully.",
          merchantRequestId: "MR-91827391",
          checkoutRequestId: tx.transId,
          amountPaid: tx.amountCents,
          mpesaReceipt: tx.transId
        });
      } else {
        setQueryResult({
          resultCode: "1032",
          resultDesc: "[STK_QUERY] Request cancelled by user on phone (1032).",
          merchantRequestId: "MR-91827391",
          checkoutRequestId: tx.transId
        });
      }
    }, 1200);
  };

  // Candidate sales matching logic for reconciliation
  const candidateSales = selectedUnmatched
    ? sales.filter(s => {
        const matchesSearch = receiptSearchTerm === '' ||
          s.receiptNumber.toLowerCase().includes(receiptSearchTerm.toLowerCase()) ||
          s.cashierName.toLowerCase().includes(receiptSearchTerm.toLowerCase()) ||
          (s.grandTotalCents / 100).toString().includes(receiptSearchTerm);

        return matchesSearch;
      })
    : [];

  const exactMatches = selectedUnmatched
    ? candidateSales.filter(s => s.grandTotalCents === selectedUnmatched.amountCents)
    : [];

  // Cash Calculations
  const cashSalesTotalCents = sales.filter(s => s.paymentMethod === 'CASH').reduce((sum, s) => sum + s.grandTotalCents, 0);
  const cashFloatTotalCents = cashDeposits.filter(d => d.type === 'TILL_FLOAT').reduce((sum, d) => sum + d.amountCents, 0);
  const cashBankDepositsTotalCents = cashDeposits.filter(d => d.type === 'BANK_DEPOSIT' || d.type === 'SAFE_DEPOSIT').reduce((sum, d) => sum + d.amountCents, 0);
  const netDrawerCashCents = cashSalesTotalCents + cashFloatTotalCents - cashBankDepositsTotalCents;

  const selectedSaleObj = sales.find(s => s.receiptNumber === targetReceipt);

  return (
    <div className="space-y-6">
      {/* Top Info Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-emerald-500/20">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 font-display">
            <Smartphone className="w-6 h-6 text-emerald-400" /> Reconciliation & Cash Flow Center
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Reconcile M-Pesa Paybill deposits ({activeTenant.mpesaPaybill || '748912'}), log cash float & deposits, and query STK status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowDepositModal(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition-all"
          >
            <PlusCircle className="w-4 h-4" /> Log Cash Deposit / Float
          </button>
          <div className="hidden md:flex items-center gap-2 bg-[#121824] px-3 py-2 rounded-xl border border-[#2A364F] text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-300">Idempotent Keys Active</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-[#2A364F] pb-3 overflow-x-auto">
        {[
          { id: 'ALL', label: 'All Payments', count: mpesaTransactions.length, icon: Smartphone },
          { id: 'MPESA', label: 'M-Pesa STK & Paybill', count: mpesaTransactions.filter(t => t.type !== 'CASH').length, icon: Smartphone },
          { id: 'CASH', label: 'Cash Register & Deposits', count: sales.filter(s => s.paymentMethod === 'CASH').length + cashDeposits.length, icon: DollarSign },
          { id: 'UNMATCHED', label: 'Unmatched Paybill Queue', count: mpesaTransactions.filter(t => t.status === 'UNMATCHED').length, icon: AlertTriangle }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
              filter === tab.id
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-md shadow-emerald-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#121824]'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${
              tab.id === 'UNMATCHED' && tab.count > 0 ? 'bg-amber-500/30 text-amber-300 font-bold' : 'bg-slate-800 text-slate-300'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Cash Deposits & Register View */}
      {filter === 'CASH' ? (
        <div className="space-y-4">
          {/* Summary Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-panel p-4 rounded-2xl border border-emerald-500/30 bg-[#121824]/80">
              <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
                <span>Total Cash Sales</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xl font-bold text-slate-100 font-mono">
                KSh {(cashSalesTotalCents / 100).toFixed(2)}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">{sales.filter(s => s.paymentMethod === 'CASH').length} cash transactions completed</p>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-cyan-500/30 bg-[#121824]/80">
              <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
                <span>Till Float & Top-Ups</span>
                <Wallet className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-xl font-bold text-cyan-300 font-mono">
                KSh {(cashFloatTotalCents / 100).toFixed(2)}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">{cashDeposits.filter(d => d.type === 'TILL_FLOAT').length} float entries recorded</p>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-amber-500/30 bg-[#121824]/80">
              <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
                <span>Estimated Net Cash in Drawer</span>
                <Building className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-xl font-bold text-amber-300 font-mono">
                KSh {(netDrawerCashCents / 100).toFixed(2)}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Bank Deposits: KSh {(cashBankDepositsTotalCents / 100).toFixed(2)}</p>
            </div>
          </div>

          {/* Cash Deposits Table */}
          <div className="glass-panel rounded-2xl overflow-hidden border border-[#2A364F]">
            <div className="p-4 bg-[#121824] border-b border-[#2A364F] flex items-center justify-between">
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" /> Recorded Cash Deposits & Float Log
              </h3>
              <button
                onClick={() => setShowDepositModal(true)}
                className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
              >
                + New Cash Entry
              </button>
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-[#121824] text-slate-400 font-semibold border-b border-[#2A364F]">
                <tr>
                  <th className="p-3.5">REF NUMBER</th>
                  <th className="p-3.5">TIMESTAMP</th>
                  <th className="p-3.5">ENTRY TYPE</th>
                  <th className="p-3.5">DEPOSITOR / CASHIER</th>
                  <th className="p-3.5">NOTES / MEMO</th>
                  <th className="p-3.5 text-right">AMOUNT (KSh)</th>
                  <th className="p-3.5 text-center">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {cashDeposits.map(dep => (
                  <tr key={dep.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3.5 font-mono text-cyan-400 font-bold">{dep.refNumber}</td>
                    <td className="p-3.5 font-mono text-slate-400">{new Date(dep.timestamp).toLocaleString()}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        dep.type === 'TILL_FLOAT' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {dep.type === 'TILL_FLOAT' ? 'TILL FLOAT TOP-UP' : 'BANK CASH DEPOSIT'}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-200 font-medium">{dep.depositorName}</td>
                    <td className="p-3.5 text-slate-400 text-[11px]">{dep.notes}</td>
                    <td className="p-3.5 text-right font-mono font-bold text-emerald-300 text-sm">
                      KSh {(dep.amountCents / 100).toFixed(2)}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {dep.status}
                      </span>
                    </td>
                  </tr>
                ))}

                {sales.filter(s => s.paymentMethod === 'CASH').map(sale => (
                  <tr key={sale.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3.5 font-mono text-emerald-400 font-bold">{sale.receiptNumber}</td>
                    <td className="p-3.5 font-mono text-slate-400">{new Date(sale.timestamp).toLocaleString()}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        CASH SALE RECEIPT
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-200 font-medium">{sale.cashierName}</td>
                    <td className="p-3.5 text-slate-400 text-[11px]">
                      Cash Tendered: KSh {((sale.cashTenderedCents || sale.grandTotalCents) / 100).toFixed(2)} • Change: KSh {((sale.changeGivenCents || 0) / 100).toFixed(2)}
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-slate-100 text-sm">
                      KSh {(sale.grandTotalCents / 100).toFixed(2)}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        CASH VERIFIED
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* M-Pesa & Paybill Transactions Table */
        <div className="glass-panel rounded-2xl overflow-hidden border border-[#2A364F]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#121824] text-slate-400 font-semibold border-b border-[#2A364F]">
              <tr>
                <th className="p-3.5">M-PESA TRANS ID</th>
                <th className="p-3.5">TIMESTAMP</th>
                <th className="p-3.5">TYPE</th>
                <th className="p-3.5">CUSTOMER PHONE</th>
                <th className="p-3.5 text-right">AMOUNT PAID</th>
                <th className="p-3.5 text-center">MATCHED RECEIPT</th>
                <th className="p-3.5 text-center">STATUS</th>
                <th className="p-3.5 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filteredTrans.map(tx => (
                <tr key={tx.transId} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-3.5 font-mono text-emerald-400 font-bold">{tx.transId}</td>
                  <td className="p-3.5 font-mono text-slate-400">{new Date(tx.timestamp).toLocaleString()}</td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      tx.type === 'STK_PUSH' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-cyan-500/20 text-cyan-300'
                    }`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono text-slate-300">{tx.phone}</td>
                  <td className="p-3.5 text-right font-bold text-slate-100 text-sm">
                    KSh {(tx.amountCents / 100).toFixed(2)}
                  </td>
                  <td className="p-3.5 text-center font-mono text-slate-300">
                    {tx.receiptNo !== 'UNMATCHED' ? (
                      <span className="text-emerald-400 font-bold">{tx.receiptNo}</span>
                    ) : (
                      <span className="text-amber-400 font-bold">UNMATCHED</span>
                    )}
                  </td>
                  <td className="p-3.5 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                      tx.status === 'MATCHED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {tx.status === 'MATCHED' ? <CheckCircle className="w-3 h-3 text-emerald-400" /> : <Clock className="w-3 h-3 text-amber-400" />}
                      {tx.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => handleExecuteStkQuery(tx)}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] rounded border border-slate-700 flex items-center gap-1"
                      title="Query Daraja STK Status"
                    >
                      <RefreshCw className="w-3 h-3 text-cyan-400" /> Query Status
                    </button>

                    {tx.status === 'UNMATCHED' && (
                      <button
                        onClick={() => {
                          setSelectedUnmatched(tx);
                          setTargetReceipt('');
                          setReceiptSearchTerm('');
                        }}
                        className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] rounded-lg shadow-md shadow-amber-500/20 flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" /> Reconcile Sale
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* User-Friendly Smart Reconciliation Selector Modal */}
      {selectedUnmatched && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-lg w-full p-6 rounded-2xl border border-amber-500/40 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#2A364F] pb-3">
              <h3 className="font-bold text-slate-100 text-base flex items-center gap-2 font-display">
                <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" /> 1-Tap Target Sale Reconciliation
              </h3>
              <button
                onClick={() => setSelectedUnmatched(null)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Deposit Details Card */}
            <div className="p-3.5 bg-[#121824] rounded-xl border border-[#2A364F] text-xs space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Incoming M-Pesa Transaction ID:</span>
                <span className="font-mono text-emerald-400 font-bold text-sm">{selectedUnmatched.transId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Transaction Amount:</span>
                <span className="font-bold text-slate-100 text-base font-mono">
                  KSh {(selectedUnmatched.amountCents / 100).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Customer Mobile Phone:</span>
                <span className="font-mono text-slate-300">{selectedUnmatched.phone}</span>
              </div>
            </div>

            {/* Target Receipt Selector Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs text-slate-200 font-semibold flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-400" /> Select Target Sale Receipt Number:
                </label>
                <span className="text-[11px] text-emerald-400 font-medium">1-Tap Selectable</span>
              </div>

              {/* Quick Filter Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Filter receipt #, cashier name, amount..."
                  value={receiptSearchTerm}
                  onChange={(e) => setReceiptSearchTerm(e.target.value)}
                  className="w-full bg-[#121824] border border-[#2A364F] pl-9 pr-3 py-2 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Smart Suggested Receipt Cards */}
              {exactMatches.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] text-amber-400 font-bold tracking-wider uppercase block">
                    ⭐ Recommended Exact Amount Match ({exactMatches.length}):
                  </span>
                  {exactMatches.map(sale => {
                    const isSelected = targetReceipt === sale.receiptNumber;
                    return (
                      <button
                        key={sale.id}
                        type="button"
                        onClick={() => setTargetReceipt(sale.receiptNumber)}
                        className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md ring-2 ring-emerald-500/40'
                            : 'bg-amber-500/10 border-amber-500/40 text-slate-200 hover:border-amber-400'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs">{sale.receiptNumber}</span>
                            <span className="text-[10px] bg-emerald-500 text-slate-950 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Sparkles className="w-3 h-3" /> Exact Amount KSh {(sale.grandTotalCents / 100).toFixed(2)}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Cashier: {sale.cashierName} • {new Date(sale.timestamp).toLocaleTimeString()}
                          </div>
                        </div>

                        <div>
                          {isSelected ? (
                            <span className="text-xs bg-emerald-500 text-slate-950 font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> Selected
                            </span>
                          ) : (
                            <span className="text-xs bg-amber-500/20 text-amber-300 font-bold px-2.5 py-1 rounded-lg border border-amber-500/30">
                              Tap to Select
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* User-Friendly Dropdown Selector */}
              <div className="pt-1">
                <span className="text-[11px] text-slate-400 block mb-1">Or choose from full sales dropdown list:</span>
                <div className="relative">
                  <select
                    value={targetReceipt}
                    onChange={(e) => setTargetReceipt(e.target.value)}
                    className="w-full bg-[#121824] border border-[#2A364F] px-3.5 py-2.5 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500 cursor-pointer appearance-none pr-8 font-mono"
                  >
                    <option value="">-- Click to Select Target Sale Receipt --</option>
                    {candidateSales.map(s => (
                      <option key={s.id} value={s.receiptNumber}>
                        {s.receiptNumber} — KSh {(s.grandTotalCents / 100).toFixed(2)} ({s.cashierName} - {new Date(s.timestamp).toLocaleTimeString()})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Confirmation Preview Card */}
              {selectedSaleObj && (
                <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-500/40 text-xs text-emerald-300 flex items-center justify-between">
                  <div>
                    <span className="text-slate-300 block text-[10px]">Target Receipt Selected:</span>
                    <strong className="font-mono text-sm text-emerald-400">{selectedSaleObj.receiptNumber}</strong>
                    <span className="text-slate-400 text-[11px] block">Cashier: {selectedSaleObj.cashierName}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-sm text-slate-100">KSh {(selectedSaleObj.grandTotalCents / 100).toFixed(2)}</span>
                    <span className="text-[10px] text-emerald-400 block font-semibold">✓ Ready to Match</span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#2A364F]">
              <button
                type="button"
                onClick={() => setSelectedUnmatched(null)}
                className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleManualMatch}
                disabled={!targetReceipt}
                className="py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 transition-all"
              >
                <CheckCircle className="w-4 h-4" /> Confirm 1-Tap Reconciliation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log Cash Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateCashDeposit} className="glass-panel max-w-md w-full p-6 rounded-2xl border border-emerald-500/40 space-y-4">
            <div className="flex items-center justify-between border-b border-[#2A364F] pb-3">
              <h3 className="font-bold text-slate-100 text-base flex items-center gap-2 font-display">
                <DollarSign className="w-5 h-5 text-emerald-400" /> Log Cash Entry / Deposit
              </h3>
              <button type="button" onClick={() => setShowDepositModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Deposit Type:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDepositType('TILL_FLOAT')}
                    className={`py-2 px-3 rounded-xl border text-center font-semibold transition-all ${
                      depositType === 'TILL_FLOAT'
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500'
                        : 'bg-[#121824] border-[#2A364F] text-slate-400'
                    }`}
                  >
                    Till Float Top-Up
                  </button>
                  <button
                    type="button"
                    onClick={() => setDepositType('BANK_DEPOSIT')}
                    className={`py-2 px-3 rounded-xl border text-center font-semibold transition-all ${
                      depositType === 'BANK_DEPOSIT'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                        : 'bg-[#121824] border-[#2A364F] text-slate-400'
                    }`}
                  >
                    Bank Cash Banking
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Deposit Amount (KSh):</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 5000"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full bg-[#121824] border border-[#2A364F] px-3.5 py-2.5 rounded-xl text-sm font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Depositor / Cashier Name:</label>
                <input
                  type="text"
                  required
                  value={depositorName}
                  onChange={(e) => setDepositorName(e.target.value)}
                  className="w-full bg-[#121824] border border-[#2A364F] px-3.5 py-2 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Notes / Reference / Bank Branch:</label>
                <input
                  type="text"
                  placeholder="e.g. KCB Nakuru Branch cash deposit receipt #91823"
                  value={depositNotes}
                  onChange={(e) => setDepositNotes(e.target.value)}
                  className="w-full bg-[#121824] border border-[#2A364F] px-3.5 py-2 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#2A364F]">
              <button
                type="button"
                onClick={() => setShowDepositModal(false)}
                className="py-2.5 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20"
              >
                Save Cash Deposit
              </button>
            </div>
          </form>
        </div>
      )}

      {/* STK Push Query Result Modal */}
      {queryModalTx && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full p-6 rounded-2xl border border-cyan-500/30 space-y-4">
            <div className="flex items-center justify-between border-b border-[#2A364F] pb-2">
              <h3 className="font-bold text-slate-100 text-sm">Daraja STK Push Query (`/stkpushquery/v1/query`)</h3>
              <span className="text-xs font-mono text-cyan-400">{activeTenant.darajaEnv || 'SANDBOX'}</span>
            </div>

            <div className="p-3 bg-[#121824] rounded-xl border border-[#2A364F] text-xs font-mono space-y-1">
              <div>CheckoutRequestID: <span className="text-emerald-400">{queryModalTx.transId}</span></div>
              <div>Shortcode: <span className="text-slate-200">{activeTenant.mpesaPaybill || '748912'}</span></div>
            </div>

            {queryingState && (
              <div className="p-4 text-center space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin text-cyan-400 mx-auto" />
                <p className="text-xs text-slate-300">Sending Base64 password & querying Safaricom Daraja API...</p>
              </div>
            )}

            {queryResult && (
              <div className="space-y-3">
                <div className={`p-4 rounded-xl border space-y-2 text-xs font-mono ${
                  queryResult.resultCode === '0'
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                }`}>
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {queryResult.resultCode === '0' ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <XCircle className="w-5 h-5 text-rose-400" />}
                    ResultCode: {queryResult.resultCode}
                  </div>
                  <p>{queryResult.resultDesc}</p>
                </div>
              </div>
            )}

            <button
              onClick={() => setQueryModalTx(null)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl"
            >
              Close Query Window
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
