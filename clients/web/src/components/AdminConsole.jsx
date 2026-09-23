import React, { useState } from 'react';
import { ShieldAlert, Server, Users, CreditCard, Activity, Lock, Eye, CheckCircle, RefreshCw } from 'lucide-react';
import { SUBSCRIPTION_TIERS } from '../data/mockData';

export default function AdminConsole({ tenants, activeTenant, onSwitchTenant, onUpdateTenantTier }) {
  const [impersonateModal, setImpersonateModal] = useState(false);
  const [selectedTargetTenant, setSelectedTargetTenant] = useState(null);
  const [consentApproved, setConsentApproved] = useState(false);

  const handleExecuteImpersonation = () => {
    if (!consentApproved || !selectedTargetTenant) return;
    onSwitchTenant(selectedTargetTenant.id);
    setImpersonateModal(false);
    setConsentApproved(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Admin Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-rose-500/30">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 font-display">
            <ShieldAlert className="w-6 h-6 text-rose-400" /> BiasharaOS Platform Admin & Support Console
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Cross-tenant observability, tenant health telemetry, support impersonation, and subscription management.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#121824] px-3 py-1.5 rounded-xl border border-[#2A364F] text-xs">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-300">Platform Health: <strong>100% Operational</strong></span>
        </div>
      </div>

      {/* Subscription Tier Entitlement Table */}
      <div className="glass-panel p-5 rounded-2xl border border-[#2A364F] space-y-4">
        <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-emerald-400" /> Monitored Tenant Accounts & Tier Entitlements
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#121824] text-slate-400 font-semibold border-b border-[#2A364F]">
              <tr>
                <th className="p-3">TENANT NAME</th>
                <th className="p-3">COUNTY</th>
                <th className="p-3">CURRENT TIER</th>
                <th className="p-3 text-right">MONTHLY FEE</th>
                <th className="p-3 text-center">VAT / eTIMS</th>
                <th className="p-3 text-center">STATUS</th>
                <th className="p-3 text-right">SUPPORT ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {tenants.map(t => (
                <tr key={t.id} className="hover:bg-slate-800/30">
                  <td className="p-3 font-bold text-slate-100">{t.name}</td>
                  <td className="p-3 text-slate-400">{t.county}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {t.tier}
                    </span>
                  </td>
                  <td className="p-3 text-right font-bold text-emerald-400">
                    KSh {SUBSCRIPTION_TIERS[t.tier].priceMonthlyKSh}/mo
                  </td>
                  <td className="p-3 text-center">
                    {t.isVatRegistered ? <span className="text-emerald-400 font-bold">VAT (OSCU)</span> : <span className="text-slate-500">Exempt</span>}
                  </td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                      {t.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => { setSelectedTargetTenant(t); setImpersonateModal(true); }}
                      className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[11px] rounded-lg border border-rose-500/30 flex items-center gap-1 ml-auto font-medium"
                    >
                      <Eye className="w-3 h-3" /> Impersonate (Audited)
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Subscription Tier Change Selector */}
      <div className="glass-panel p-5 rounded-2xl border border-[#2A364F] space-y-3">
        <h3 className="font-bold text-slate-100 text-sm">Active Workspace Tier Management ({activeTenant.name})</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {Object.entries(SUBSCRIPTION_TIERS).map(([tierKey, tierInfo]) => (
            <div
              key={tierKey}
              className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all ${
                activeTenant.tier === tierKey
                  ? 'bg-emerald-500/10 border-emerald-500'
                  : 'bg-[#121824] border-[#2A364F]'
              }`}
            >
              <div>
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-bold text-slate-100 text-sm">{tierInfo.name}</h4>
                  {activeTenant.tier === tierKey && (
                    <span className="text-[10px] bg-emerald-500 text-white font-bold px-2 py-0.5 rounded">Active</span>
                  )}
                </div>
                <div className="text-lg font-bold text-emerald-400 font-display">KSh {tierInfo.priceMonthlyKSh} <span className="text-xs text-slate-400 font-normal">/mo</span></div>
                <div className="text-[11px] text-slate-400 mt-2 space-y-1">
                  <div>Max Locations: <strong className="text-slate-200">{tierInfo.maxLocations}</strong></div>
                  <div>Max Products: <strong className="text-slate-200">{tierInfo.maxProducts}</strong></div>
                  <div>Staff Limit: <strong className="text-slate-200">{tierInfo.maxStaff}</strong></div>
                  <div>eTIMS Support: <strong className="text-slate-200">{tierInfo.eTimsIncluded ? 'Included' : 'None'}</strong></div>
                </div>
              </div>

              {activeTenant.tier !== tierKey && (
                <button
                  onClick={() => onUpdateTenantTier(tierKey)}
                  className="w-full mt-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700"
                >
                  Switch Tier
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Consent-Gated Impersonation Modal */}
      {impersonateModal && selectedTargetTenant && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full p-6 rounded-2xl border border-rose-500/40 space-y-4">
            <div className="w-12 h-12 bg-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-slate-100 text-base">Audited Support Impersonation</h3>
              <p className="text-xs text-slate-400 mt-1">
                You are requesting temporary support access to <strong className="text-slate-200">{selectedTargetTenant.name}</strong>.
              </p>
            </div>

            <div className="bg-rose-950/30 border border-rose-500/30 p-3 rounded-xl text-xs text-rose-300 space-y-1">
              <strong className="block text-rose-200">Legal Audit Notice (FR-ADM-04)</strong>
              <p>This action will be logged in `platform.platform_audit_log` with your agent ID, timestamp, and IP address.</p>
            </div>

            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={consentApproved}
                onChange={(e) => setConsentApproved(e.target.checked)}
                className="rounded border-[#2A364F] bg-[#121824] text-emerald-500 focus:ring-0"
              />
              <span>I confirm tenant explicit consent was received via WhatsApp/Phone</span>
            </label>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setImpersonateModal(false)}
                className="py-2.5 bg-slate-800 text-slate-300 text-xs font-medium rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteImpersonation}
                disabled={!consentApproved}
                className="py-2.5 bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs rounded-xl disabled:opacity-50"
              >
                Switch Workspace Context
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
