import React, { useState } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle, AlertTriangle, Layers, Database, ArrowUpRight } from 'lucide-react';

export default function OfflineSyncEngine({ offlineOutbox, isOffline, setIsOffline, onSyncNow, syncStatus }) {
  return (
    <div className="space-y-6">
      {/* Network Simulator Banner */}
      <div className={`glass-panel p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
        isOffline ? 'border-amber-500/40 bg-amber-500/5' : 'border-emerald-500/30 bg-emerald-500/5'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
            isOffline ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
          }`}>
            {isOffline ? <WifiOff className="w-6 h-6 animate-pulse" /> : <Wifi className="w-6 h-6" />}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2 font-display">
              Offline-First Sync Engine (SQLite Outbox)
            </h2>
            <p className="text-xs text-slate-400">
              {isOffline
                ? 'Device is currently OFFLINE. All POS sales & stock ledger entries are saved to local SQLite with v7 UUIDs.'
                : 'Device is ONLINE. Transactions sync automatically with server idempotency guarantees (BRULE-14).'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOffline(!isOffline)}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
              isOffline
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
            }`}
          >
            {isOffline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            {isOffline ? 'Simulate Reconnect' : 'Simulate Network Outage'}
          </button>

          {!isOffline && (
            <button
              onClick={onSyncNow}
              disabled={syncStatus === 'SYNCING' || offlineOutbox.length === 0}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${syncStatus === 'SYNCING' ? 'animate-spin' : ''}`} />
              {syncStatus === 'SYNCING' ? 'Syncing Outbox...' : 'Trigger Push Sync'}
            </button>
          )}
        </div>
      </div>

      {/* Outbox Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-amber-500/30">
          <div className="text-xs text-slate-400 font-medium">Pending Outbox Envelopes</div>
          <div className="text-2xl font-bold text-amber-400 font-display mt-1">{offlineOutbox.length}</div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-700">
          <div className="text-xs text-slate-400 font-medium">Idempotency Scheme</div>
          <div className="text-sm font-bold text-emerald-400 font-mono mt-1">UUID v7 (Time-Ordered)</div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-700">
          <div className="text-xs text-slate-400 font-medium">Conflict Resolution Policy</div>
          <div className="text-sm font-bold text-slate-200 mt-1">Server Ledger Authoritative</div>
        </div>
      </div>

      {/* Queued Outbox Envelope List */}
      <div className="glass-panel rounded-2xl p-5 border border-[#2A364F] space-y-4">
        <div className="flex items-center justify-between border-b border-[#2A364F] pb-3">
          <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" /> Queued Local Outbox Payloads ({offlineOutbox.length})
          </h3>
          <span className="text-xs text-slate-400 font-mono">SQLite Buffer Path: /data/user/0/com.biasharaos/databases/outbox.db</span>
        </div>

        {offlineOutbox.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs space-y-2">
            <CheckCircle className="w-10 h-10 mx-auto opacity-30 text-emerald-400" />
            <p>Outbox is empty. All local transactions are synced to the cloud primary server.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {offlineOutbox.map((envelope, idx) => (
              <div key={idx} className="p-4 bg-[#121824] rounded-xl border border-[#2A364F] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {envelope.type}
                    </span>
                    <span className="text-xs font-bold text-slate-100">{envelope.receiptNumber}</span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400">
                    Client UUID (v7): <span className="text-emerald-400">{envelope.clientUuid}</span>
                  </div>
                  <div className="text-[10px] text-slate-500">Captured: {new Date(envelope.timestamp).toLocaleString()}</div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-bold text-slate-200">KSh {(envelope.grandTotalCents / 100).toFixed(2)}</div>
                  <span className="text-[10px] text-amber-400 font-medium">Awaiting Cloud Ingestion</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
