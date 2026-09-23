import React, { useState } from 'react';
import { Smartphone, CheckCircle, AlertTriangle, RefreshCw, Search, ShieldCheck, ArrowRight, Clock } from 'lucide-react';

export default function MpesaReconciler({ mpesaTransactions, sales, onMatchPayment, activeTenant }) {
  const [filter, setFilter] = useState('ALL'); // ALL, MATCHED, UNMATCHED
  const [selectedUnmatched, setSelectedUnmatched] = useState(null);
  const [targetReceipt, setTargetReceipt] = useState('');

  const filteredTrans = mpesaTransactions.filter(t => {
    if (filter === 'MATCHED') return t.status === 'MATCHED';
    if (filter === 'UNMATCHED') return t.status === 'UNMATCHED';
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
  };

  return (
    <div className="space-y-6">
      {/* Top Info Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-emerald-500/20">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 font-display">
            <Smartphone className="w-6 h-6 text-emerald-400" /> Safaricom M-Pesa Daraja 3.0 Reconciliation
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            STK Push correlation, C2B Paybill ({activeTenant.mpesaPaybill}) reconciliation, and idempotency guarantees.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#121824] px-3 py-1.5 rounded-xl border border-[#2A364F] text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-300">Idempotent Keys Enforced (TransID)</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-[#2A364F] pb-3">
        {[
          { id: 'ALL', label: 'All M-Pesa Callbacks', count: mpesaTransactions.length },
          { id: 'MATCHED', label: 'Reconciled / Matched', count: mpesaTransactions.filter(t => t.status === 'MATCHED').length },
          { id: 'UNMATCHED', label: 'Unmatched Paybill Queue', count: mpesaTransactions.filter(t => t.status === 'UNMATCHED').length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              filter === tab.id
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${
              tab.id === 'UNMATCHED' && tab.count > 0 ? 'bg-amber-500/30 text-amber-300 font-bold' : 'bg-slate-800 text-slate-300'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Transactions Table */}
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
                <td className="p-3.5 text-right font-bold text-slate-100">
                  KSh {(tx.amountCents / 100).toFixed(2)}
                </td>
                <td className="p-3.5 text-center font-mono text-slate-300">
                  {tx.receiptNo !== 'UNMATCHED' ? tx.receiptNo : <span className="text-amber-400">UNMATCHED</span>}
                </td>
                <td className="p-3.5 text-center">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                    tx.status === 'MATCHED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {tx.status === 'MATCHED' ? <CheckCircle className="w-3 h-3 text-emerald-400" /> : <Clock className="w-3 h-3 text-amber-400" />}
                    {tx.status}
                  </span>
                </td>
                <td className="p-3.5 text-right">
                  {tx.status === 'UNMATCHED' && (
                    <button
                      onClick={() => setSelectedUnmatched(tx)}
                      className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] rounded-lg border border-amber-500/40"
                    >
                      Reconcile Sale
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Manual Reconciliation Modal */}
      {selectedUnmatched && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full p-6 rounded-2xl border border-amber-500/30 space-y-4">
            <h3 className="font-bold text-slate-100 text-base">Reconcile Unmatched M-Pesa Payment</h3>
            <div className="p-3 bg-[#121824] rounded-xl border border-[#2A364F] text-xs space-y-1">
              <div>Trans ID: <strong className="text-emerald-400 font-mono">{selectedUnmatched.transId}</strong></div>
              <div>Amount: <strong className="text-slate-100">KSh {(selectedUnmatched.amountCents / 100).toFixed(2)}</strong></div>
              <div>Phone: <span className="font-mono text-slate-300">{selectedUnmatched.phone}</span></div>
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">Target Sale Receipt Number:</label>
              <input
                type="text"
                placeholder="e.g. REC-10041"
                value={targetReceipt}
                onChange={(e) => setTargetReceipt(e.target.value)}
                className="w-full bg-[#121824] border border-[#2A364F] px-3 py-2 rounded-xl text-sm font-mono text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setSelectedUnmatched(null)}
                className="py-2.5 bg-slate-800 text-slate-300 text-xs font-medium rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleManualMatch}
                className="py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl"
              >
                Attach Payment to Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
