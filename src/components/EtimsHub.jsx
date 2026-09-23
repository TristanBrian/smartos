import React, { useState } from 'react';
import { ShieldCheck, RefreshCw, QrCode, AlertCircle, CheckCircle2, Clock, FileText, ExternalLink } from 'lucide-react';

export default function EtimsHub({ etimsQueue, sales, onRetryEtims, activeTenant }) {
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const acceptedCount = etimsQueue.filter(e => e.kraStatus === 'ACCEPTED').length;
  const pendingCount = etimsQueue.filter(e => e.kraStatus === 'RETRY_QUEUED' || e.kraStatus === 'PENDING').length;
  const successRate = etimsQueue.length > 0 ? Math.round((acceptedCount / etimsQueue.length) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-emerald-500/20">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 font-display">
            <ShieldCheck className="w-6 h-6 text-emerald-400" /> KRA eTIMS Tax Compliance & OSCU Gateway
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Electronic Tax Invoice Management System for VAT compliance (KRA PIN: {activeTenant.kraPin || 'Not Registered'}).
          </p>
        </div>

        <div className="flex items-center gap-4 bg-[#121824] px-4 py-2 rounded-xl border border-[#2A364F]">
          <div>
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Submission Success Rate</div>
            <div className="text-lg font-bold text-emerald-400 font-display">{successRate}%</div>
          </div>
          <div className="w-px h-8 bg-slate-700" />
          <div>
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Device Serial</div>
            <div className="text-xs font-mono text-slate-200">{activeTenant.etimsDevice || 'OSCU-DEMO-01'}</div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-emerald-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Accepted eTIMS Invoices</span>
            <div className="text-2xl font-bold text-emerald-400 font-display mt-1">{acceptedCount}</div>
          </div>
          <CheckCircle2 className="w-8 h-8 text-emerald-500/40" />
        </div>

        <div className="glass-panel p-4 rounded-xl border border-amber-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Retry Queue (OSCU Offload)</span>
            <div className="text-2xl font-bold text-amber-400 font-display mt-1">{pendingCount}</div>
          </div>
          <Clock className="w-8 h-8 text-amber-500/40" />
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-700 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">VAT Mode</span>
            <div className="text-sm font-bold text-slate-200 mt-1">
              {activeTenant.isVatRegistered ? 'OSCU Live Signing (Mandatory)' : 'Non-VAT Exempt'}
            </div>
          </div>
          <FileText className="w-8 h-8 text-slate-600" />
        </div>
      </div>

      {/* eTIMS Queue Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-[#2A364F]">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#121824] text-slate-400 font-semibold border-b border-[#2A364F]">
            <tr>
              <th className="p-3.5">SALE RECEIPT</th>
              <th className="p-3.5">SUBMISSION TIMESTAMP</th>
              <th className="p-3.5">KRA INVOICE NUMBER</th>
              <th className="p-3.5 text-center">ATTEMPTS</th>
              <th className="p-3.5">LAST OSCU RESPONSE</th>
              <th className="p-3.5 text-center">STATUS</th>
              <th className="p-3.5 text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-200">
            {etimsQueue.map(item => (
              <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="p-3.5 font-mono text-emerald-400 font-bold">{item.saleReceipt}</td>
                <td className="p-3.5 font-mono text-slate-400">{new Date(item.timestamp).toLocaleString()}</td>
                <td className="p-3.5 font-mono text-slate-300">{item.invoiceNo}</td>
                <td className="p-3.5 text-center font-mono font-semibold">{item.attempts}</td>
                <td className="p-3.5 text-slate-400 font-mono text-[11px] truncate max-w-xs">{item.lastResponse}</td>
                <td className="p-3.5 text-center">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                    item.kraStatus === 'ACCEPTED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {item.kraStatus === 'ACCEPTED' ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Clock className="w-3 h-3 text-amber-400" />}
                    {item.kraStatus}
                  </span>
                </td>
                <td className="p-3.5 text-right">
                  {item.kraStatus !== 'ACCEPTED' ? (
                    <button
                      onClick={() => onRetryEtims(item.id)}
                      className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] rounded-lg border border-amber-500/40 flex items-center gap-1 ml-auto"
                    >
                      <RefreshCw className="w-3 h-3" /> Retry Submission
                    </button>
                  ) : (
                    <button
                      onClick={() => setSelectedInvoice(item)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 text-[11px] rounded-lg border border-slate-700 flex items-center gap-1 ml-auto"
                    >
                      <QrCode className="w-3 h-3" /> View Signature
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* KRA Invoice Signature Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-sm w-full p-6 rounded-2xl border border-emerald-500/30 text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base">KRA eTIMS Signed Invoice</h3>
              <p className="text-xs text-slate-400 mt-1 font-mono">Invoice #: {selectedInvoice.invoiceNo}</p>
            </div>

            <div className="bg-white p-4 rounded-xl w-40 h-40 mx-auto flex items-center justify-center border-4 border-emerald-500">
              {/* Simulated QR Representation */}
              <div className="text-slate-900 font-mono text-[8px] font-bold leading-tight break-all">
                KRA-OSCU-SIGNATURE-{selectedInvoice.invoiceNo}-VERIFIED-OK
              </div>
            </div>

            <div className="text-[11px] text-slate-400 font-mono bg-[#121824] p-3 rounded-xl border border-[#2A364F] text-left space-y-1">
              <div>Device: <span className="text-slate-200">{activeTenant.etimsDevice}</span></div>
              <div>Signature: <span className="text-emerald-400 text-[10px]">{selectedInvoice.qrSignature}</span></div>
              <div>KRA PIN: <span className="text-slate-200">{activeTenant.kraPin}</span></div>
            </div>

            <button
              onClick={() => setSelectedInvoice(null)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl"
            >
              Close Diagnostics
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
