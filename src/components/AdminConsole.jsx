import React, { useState } from 'react';
import { ShieldAlert, Server, Users, CreditCard, Activity, Lock, Eye, CheckCircle, RefreshCw, Plus, Building2, Phone, MapPin, Check } from 'lucide-react';
import { SUBSCRIPTION_TIERS } from '../data/mockData';

export default function AdminConsole({ tenants, activeTenant, onSwitchTenant, onUpdateTenantTier, onOnboardTenant }) {
  const [impersonateModal, setImpersonateModal] = useState(false);
  const [selectedTargetTenant, setSelectedTargetTenant] = useState(null);
  const [consentApproved, setConsentApproved] = useState(false);

  // Tenant Onboarding Modal State
  const [onboardModal, setOnboardModal] = useState(false);
  const [newShopName, setNewShopName] = useState('');
  const [newShopType, setNewShopType] = useState('GROCERY');
  const [newCounty, setNewCounty] = useState('Nairobi');
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newOwnerPhone, setNewOwnerPhone] = useState('');
  const [newTier, setNewTier] = useState('LITE');
  const [newIsVat, setNewIsVat] = useState(false);
  const [newKraPin, setNewKraPin] = useState('');
  const [newPaybill, setNewPaybill] = useState('');
  const [onboardError, setOnboardError] = useState('');

  // STK Push Subscription Renewal State
  const [stkModal, setStkModal] = useState(false);
  const [selectedTierForRenew, setSelectedTierForRenew] = useState('LITE');
  const [renewalMonths, setRenewalMonths] = useState(3); // 1, 3, 12
  const [stkPhone, setStkPhone] = useState('+254 722 000 111');
  const [stkStatus, setStkStatus] = useState('IDLE'); // IDLE, PUSHING, SUCCESS

  const handleExecuteImpersonation = () => {
    if (!consentApproved || !selectedTargetTenant) return;
    onSwitchTenant(selectedTargetTenant.id);
    setImpersonateModal(false);
    setConsentApproved(false);
  };

  const handleOpenStkRenewal = (tierKey) => {
    setSelectedTierForRenew(tierKey);
    setStkPhone(activeTenant.phone || '+254 722 000 111');
    setStkStatus('IDLE');
    setStkModal(true);
  };

  const handleTriggerStkPushRenewal = (e) => {
    e.preventDefault();
    setStkStatus('PUSHING');

    setTimeout(() => {
      setStkStatus('SUCCESS');
      setTimeout(() => {
        if (onUpdateTenantTier) {
          onUpdateTenantTier(selectedTierForRenew, renewalMonths, stkPhone);
        }
        setStkModal(false);
        setStkStatus('IDLE');
      }, 1200);
    }, 1500);
  };

  const handleExecuteImpersonation = () => {
    if (!consentApproved || !selectedTargetTenant) return;
    onSwitchTenant(selectedTargetTenant.id);
    setImpersonateModal(false);
    setConsentApproved(false);
  };

  const handleOnboardSubmit = (e) => {
    e.preventDefault();
    setOnboardError('');

    if (!newShopName.trim()) {
      setOnboardError('Shop Name is required for tenant onboarding.');
      return;
    }

    if (newIsVat) {
      const pinRegex = /^[A-Z0-9]{11}$/;
      if (!newKraPin || !pinRegex.test(newKraPin.trim().toUpperCase())) {
        setOnboardError('Valid 11-character KRA PIN (e.g. A012345678X) is required for VAT shops (FR-TAX-01).');
        return;
      }
    }

    if (onOnboardTenant) {
      onOnboardTenant({
        name: newShopName.trim(),
        type: newShopType,
        county: newCounty,
        ownerName: newOwnerName.trim() || 'Shop Admin',
        ownerPhone: newOwnerPhone.trim() || '0722000000',
        tier: newTier,
        isVatRegistered: newIsVat,
        kraPin: newIsVat ? newKraPin.trim().toUpperCase() : null,
        mpesaPaybill: newPaybill.trim() || '123456'
      });
    }

    setNewShopName('');
    setNewOwnerName('');
    setNewOwnerPhone('');
    setNewKraPin('');
    setNewPaybill('');
    setNewIsVat(false);
    setOnboardModal(false);
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
            Cross-tenant observability, multi-tenant shop provisioning, support impersonation, and subscription management.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setOnboardModal(true)}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" /> Onboard New Shop Tenant
          </button>
          <div className="flex items-center gap-2 bg-[#121824] px-3 py-2 rounded-xl border border-[#2A364F] text-xs">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-300">Platform: <strong>100% Operational</strong></span>
          </div>
        </div>
      </div>

      {/* Subscription Tier Entitlement Table */}
      <div className="glass-panel p-5 rounded-2xl border border-[#2A364F] space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-400" /> Provisioned Tenant Workspaces ({tenants.length})
          </h3>
          <span className="text-xs text-slate-400">Schema Isolation: <code>tenant_&lt;slug&gt;_&lt;uuid&gt;</code></span>
        </div>

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
                  <td className="p-3">
                    <div className="font-bold text-slate-100">{t.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{t.schemaName || `tenant_${t.id}`}</div>
                  </td>
                  <td className="p-3 text-slate-400">{t.county}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {t.tier}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Exp: <span className="text-emerald-400 font-mono">{t.licenseExpiryDate || '2026-12-31'}</span>
                    </div>
                  </td>
                  <td className="p-3 text-right font-bold text-emerald-400">
                    KSh {SUBSCRIPTION_TIERS[t.tier]?.priceMonthlyKSh || 0}/mo
                  </td>
                  <td className="p-3 text-center">
                    {t.isVatRegistered ? <span className="text-emerald-400 font-bold">VAT ({t.kraPin || 'OSCU'})</span> : <span className="text-slate-500">Exempt</span>}
                  </td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                      {t.status || 'ACTIVE'}
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
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-slate-100 text-sm">Active Workspace Tier & License Renewal ({activeTenant.name})</h3>
          <span className="text-xs text-slate-400 font-mono">License Token: <strong className="text-emerald-400">{activeTenant.licenseToken || 'LIC-LITE-ACTIVE'}</strong></span>
        </div>

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

              <button
                onClick={() => handleOpenStkRenewal(tierKey)}
                className="w-full mt-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-extrabold rounded-lg border border-emerald-500/30 flex items-center justify-center gap-1.5 transition-all"
              >
                <CreditCard className="w-3.5 h-3.5" /> Renew STK Push
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Onboard New Shop Tenant Modal */}
      {onboardModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-lg w-full p-6 rounded-2xl border border-emerald-500/40 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-[#2A364F] pb-3">
              <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-400" /> Onboard New Multi-Tenant Shop
              </h3>
              <button
                onClick={() => setOnboardModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {onboardError && (
              <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-xs text-rose-300 font-medium">
                {onboardError}
              </div>
            )}

            <form onSubmit={handleOnboardSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Shop Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mama Mboga Fresh Express"
                    value={newShopName}
                    onChange={(e) => setNewShopName(e.target.value)}
                    className="w-full bg-[#121824] border border-[#2A364F] rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Business Type</label>
                  <select
                    value={newShopType}
                    onChange={(e) => setNewShopType(e.target.value)}
                    className="w-full bg-[#121824] border border-[#2A364F] rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="GROCERY">Grocery / Kiosk</option>
                    <option value="SUPERMARKET">Supermarket</option>
                    <option value="WHOLESALE">Wholesale Merchant</option>
                    <option value="CHEMIST">Chemist / Pharmacy</option>
                    <option value="HARDWARE">Hardware Store</option>
                    <option value="PRODUCE">Fresh Produce Market</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">County / Region</label>
                  <select
                    value={newCounty}
                    onChange={(e) => setNewCounty(e.target.value)}
                    className="w-full bg-[#121824] border border-[#2A364F] rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Nairobi">Nairobi</option>
                    <option value="Nakuru">Nakuru</option>
                    <option value="Mombasa">Mombasa</option>
                    <option value="Kisumu">Kisumu</option>
                    <option value="Uasin Gishu">Uasin Gishu (Eldoret)</option>
                    <option value="Kiambu">Kiambu</option>
                    <option value="Machakos">Machakos</option>
                    <option value="Meru">Meru</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Subscription Tier</label>
                  <select
                    value={newTier}
                    onChange={(e) => setNewTier(e.target.value)}
                    className="w-full bg-[#121824] border border-[#2A364F] rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="LITE">Lite (KSh 1,500/mo)</option>
                    <option value="PRO">Pro (KSh 3,500/mo)</option>
                    <option value="SCALE">Scale (KSh 7,500/mo)</option>
                    <option value="ENTERPRISE">Enterprise (KSh 15,000/mo)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Owner / Seed Admin Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Mary Wanjiku"
                    value={newOwnerName}
                    onChange={(e) => setNewOwnerName(e.target.value)}
                    className="w-full bg-[#121824] border border-[#2A364F] rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Owner Phone Number</label>
                  <input
                    type="text"
                    placeholder="0722000111"
                    value={newOwnerPhone}
                    onChange={(e) => setNewOwnerPhone(e.target.value)}
                    className="w-full bg-[#121824] border border-[#2A364F] rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-[#121824] rounded-xl border border-[#2A364F] space-y-3">
                <label className="flex items-center gap-2 text-slate-200 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newIsVat}
                    onChange={(e) => setNewIsVat(e.target.checked)}
                    className="rounded border-[#2A364F] bg-[#0B0F17] text-emerald-500 focus:ring-0"
                  />
                  <span>VAT Registered Business (Requires KRA PIN)</span>
                </label>

                {newIsVat && (
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">KRA PIN (11 Chars, e.g. A012345678X) *</label>
                    <input
                      type="text"
                      maxLength={11}
                      placeholder="A012345678X"
                      value={newKraPin}
                      onChange={(e) => setNewKraPin(e.target.value)}
                      className="w-full bg-[#0B0F17] border border-[#2A364F] rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-emerald-500 uppercase"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">M-Pesa Paybill / Till Shortcode</label>
                <input
                  type="text"
                  placeholder="e.g. 123456"
                  value={newPaybill}
                  onChange={(e) => setNewPaybill(e.target.value)}
                  className="w-full bg-[#121824] border border-[#2A364F] rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOnboardModal(false)}
                  className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl shadow-lg shadow-emerald-500/20"
                >
                  Provision Shop Schema
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

      {/* M-Pesa STK Push Renewal & License Expiration Modal */}
      {stkModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full p-6 rounded-2xl border border-emerald-500/40 space-y-4">
            <div className="flex justify-between items-center border-b border-[#2A364F] pb-3">
              <h3 className="font-bold text-slate-100 text-base flex items-center gap-2 font-display">
                <CreditCard className="w-5 h-5 text-emerald-400" /> Safaricom M-Pesa STK Push Renewal
              </h3>
              <button
                onClick={() => setStkModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleTriggerStkPushRenewal} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Subscription Tier</label>
                <div className="p-3 bg-[#121824] rounded-xl border border-[#2A364F] text-slate-100 font-bold flex justify-between items-center">
                  <span>{SUBSCRIPTION_TIERS[selectedTierForRenew]?.name}</span>
                  <span className="text-emerald-400 font-display">KSh {SUBSCRIPTION_TIERS[selectedTierForRenew]?.priceMonthlyKSh}/mo</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Renewal Duration Period</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { months: 1, label: '1 Month' },
                    { months: 3, label: '3 Months' },
                    { months: 12, label: '12 Months' }
                  ].map(opt => (
                    <button
                      key={opt.months}
                      type="button"
                      onClick={() => setRenewalMonths(opt.months)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        renewalMonths === opt.months
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500 font-bold'
                          : 'bg-[#121824] text-slate-400 border-[#2A364F]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex justify-between items-center">
                <span className="text-slate-300 font-semibold">Total Payable Amount:</span>
                <span className="text-base font-extrabold text-emerald-400 font-display">
                  KSh {((SUBSCRIPTION_TIERS[selectedTierForRenew]?.priceMonthlyKSh || 0) * renewalMonths).toLocaleString()}
                </span>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">M-Pesa Express Phone Number *</label>
                <input
                  type="text"
                  required
                  value={stkPhone}
                  onChange={(e) => setStkPhone(e.target.value)}
                  placeholder="+254 722 000 111"
                  className="w-full bg-[#121824] border border-[#2A364F] rounded-xl px-3.5 py-2.5 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              {stkStatus === 'PUSHING' && (
                <div className="p-3 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-300 text-xs text-center font-medium animate-pulse flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" /> Prompting {stkPhone}... Check M-Pesa handset prompt!
                </div>
              )}

              {stkStatus === 'SUCCESS' && (
                <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs text-center font-medium flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" /> STK Payment Received! License token updated.
                </div>
              )}

              <button
                type="submit"
                disabled={stkStatus === 'PUSHING' || stkStatus === 'SUCCESS'}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                Trigger M-Pesa STK Push Renewal <CreditCard className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
