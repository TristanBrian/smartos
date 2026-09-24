import React, { useState } from 'react';
import { UserCheck, Building, Smartphone, ShieldCheck, Key, Save, Download, CheckCircle, Lock, RefreshCw, CreditCard } from 'lucide-react';
import { SUBSCRIPTION_TIERS } from '../data/mockData';

export default function ProfileManagement({ activeTenant, onUpdateTenantProfile, onExportData }) {
  const [activeTab, setActiveTab] = useState('BUSINESS'); // BUSINESS, DARAJA, TAX, SECURITY, SUBSCRIPTION
  const [renewMonths, setRenewMonths] = useState(3);
  const [renewPhone, setRenewPhone] = useState(activeTenant.phone || '+254 722 123 456');
  const [stkState, setStkState] = useState('IDLE');

  const [formData, setFormData] = useState({
    name: activeTenant.name || '',
    businessType: activeTenant.type || 'Retail Duka',
    county: activeTenant.county || 'Nakuru',
    ownerName: activeTenant.ownerName || '',
    phone: activeTenant.phone || '',
    isVatRegistered: activeTenant.isVatRegistered || false,
    kraPin: activeTenant.kraPin || '',
    etimsDevice: activeTenant.etimsDevice || '',
    mpesaPaybill: activeTenant.mpesaPaybill || '174379',
    mpesaTill: activeTenant.mpesaTill || '891234',
    currency: activeTenant.currency || 'KSh',
    receiptFooterNote: activeTenant.receiptFooterNote || 'Asante kwa kununua! Karibu Tena.',
    // Safaricom Daraja 3.0 API Dev Settings
    darajaEnv: activeTenant.darajaEnv || 'SANDBOX',
    consumerKey: activeTenant.consumerKey || 'vK0A9sX...dK91a',
    consumerSecret: activeTenant.consumerSecret || 'qP921sK...zL001',
    passkey: activeTenant.passkey || 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919'
  });

  const [pinChangeModal, setPinChangeModal] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  // OAuth token test state
  const [tokenTesting, setTokenTesting] = useState(false);
  const [tokenResult, setTokenResult] = useState(null);

  const handleTriggerStkRenewal = (e) => {
    e.preventDefault();
    setStkState('PUSHING');
    setTimeout(() => {
      setStkState('SUCCESS');
      const today = new Date();
      const expiry = new Date(today.setMonth(today.getMonth() + Number(renewMonths))).toISOString().split('T')[0];
      const newToken = `LIC-${activeTenant.tier || 'LITE'}-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${expiry}`;

      onUpdateTenantProfile({
        ...activeTenant,
        licenseExpiryDate: expiry,
        licenseToken: newToken,
        subscriptionPeriodMonths: renewMonths,
        status: 'ACTIVE'
      });

      setTimeout(() => setStkState('IDLE'), 2000);
    }, 1500);
  };

  const handleSave = (e) => {
    e.preventDefault();

    if (formData.isVatRegistered && !formData.kraPin) {
      alert('KRA PIN is required for VAT-registered businesses (FR-TAX-01)');
      return;
    }

    onUpdateTenantProfile({
      ...activeTenant,
      name: formData.name,
      type: formData.businessType,
      county: formData.county,
      ownerName: formData.ownerName,
      phone: formData.phone,
      isVatRegistered: formData.isVatRegistered,
      kraPin: formData.kraPin,
      etimsDevice: formData.etimsDevice,
      mpesaPaybill: formData.mpesaPaybill,
      mpesaTill: formData.mpesaTill,
      currency: formData.currency,
      receiptFooterNote: formData.receiptFooterNote,
      darajaEnv: formData.darajaEnv,
      consumerKey: formData.consumerKey,
      consumerSecret: formData.consumerSecret,
      passkey: formData.passkey
    });
  };

  const handleTestDarajaConnection = () => {
    setTokenTesting(true);
    setTokenResult(null);

    setTimeout(() => {
      setTokenTesting(false);
      const mockToken = `OAuth2_Bearer_${Math.floor(100000000 + Math.random() * 900000000)}`;
      setTokenResult({
        status: 'SUCCESS',
        accessToken: mockToken,
        expiresIn: '3599 sec',
        env: formData.darajaEnv
      });
    }, 1200);
  };

  const handleSavePin = () => {
    if (newPin.length !== 4 || isNaN(newPin)) {
      alert('Security PIN must be a 4-digit numeric code');
      return;
    }
    if (newPin !== confirmPin) {
      alert('PIN confirmation does not match');
      return;
    }
    setPinChangeModal(false);
    setNewPin('');
    setConfirmPin('');
    alert('Security PIN updated successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-emerald-500/20">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 font-display">
            <UserCheck className="w-6 h-6 text-emerald-400" /> Business Profile & Safaricom Daraja 3.0 API Settings
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure tenant credentials, M-Pesa Consumer Key/Secret, STK Passkey, and KRA eTIMS settings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onExportData}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-emerald-400" /> Export Full Tenant Data (BR-014)
          </button>
        </div>
      </div>

      {/* Sub-Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#2A364F] pb-3">
        {[
          { id: 'BUSINESS', label: 'Business & Store Info', icon: Building },
          { id: 'DARAJA', label: 'Safaricom Daraja 3.0 Dev Config', icon: Smartphone },
          { id: 'TAX', label: 'KRA eTIMS Tax Profile', icon: ShieldCheck },
          { id: 'SECURITY', label: 'User Security & PIN', icon: Key },
          { id: 'SUBSCRIPTION', label: 'Subscription & License Renewal', icon: CreditCard },
          { id: 'PRIVACY', label: 'Data Privacy & Consent (KDPA 2019)', icon: Lock }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Profile Form */}
      <form onSubmit={handleSave} className="glass-panel p-6 rounded-2xl border border-[#2A364F] space-y-6">
        {/* Tab 1: Business Info */}
        {activeTab === 'BUSINESS' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-100 text-sm border-b border-[#2A364F] pb-2">Tenant Store Identity (FR-TEN)</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Business / Store Name *</label>
                <input
                  type="text" required
                  value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#121824] border border-[#2A364F] px-3.5 py-2.5 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Business Segment Type</label>
                <select
                  value={formData.businessType} onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                  className="w-full bg-[#121824] border border-[#2A364F] px-3.5 py-2.5 rounded-xl text-xs text-slate-100"
                >
                  <option>Retail Duka</option>
                  <option>Pharmacy</option>
                  <option>Hardware Store</option>
                  <option>Salon & Beauty</option>
                  <option>Distributor</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">County Location</label>
                <input
                  type="text"
                  value={formData.county} onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                  className="w-full bg-[#121824] border border-[#2A364F] px-3.5 py-2.5 rounded-xl text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Owner Full Name</label>
                <input
                  type="text"
                  value={formData.ownerName} onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  className="w-full bg-[#121824] border border-[#2A364F] px-3.5 py-2.5 rounded-xl text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Store Phone Contact</label>
                <input
                  type="text"
                  value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-[#121824] border border-[#2A364F] px-3.5 py-2.5 rounded-xl text-xs font-mono text-slate-100"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Receipt Footer Message</label>
                <input
                  type="text"
                  value={formData.receiptFooterNote} onChange={(e) => setFormData({ ...formData, receiptFooterNote: e.target.value })}
                  className="w-full bg-[#121824] border border-[#2A364F] px-3.5 py-2.5 rounded-xl text-xs text-slate-100"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Safaricom Daraja 3.0 Dev Config */}
        {activeTab === 'DARAJA' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#2A364F] pb-2">
              <h3 className="font-bold text-slate-100 text-sm">Safaricom Daraja 3.0 API Credentials & Passkey (IF-01)</h3>
              <span className="text-xs text-emerald-400 font-mono">https://developer.safaricom.co.ke</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Environment Mode</label>
                <select
                  value={formData.darajaEnv} onChange={(e) => setFormData({ ...formData, darajaEnv: e.target.value })}
                  className="w-full bg-[#121824] border border-[#2A364F] px-3.5 py-2.5 rounded-xl text-xs font-bold text-emerald-400"
                >
                  <option value="SANDBOX">SANDBOX (https://sandbox.safaricom.co.ke)</option>
                  <option value="PRODUCTION">PRODUCTION (https://api.safaricom.co.ke)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Business Shortcode (Paybill/Till)</label>
                <input
                  type="text" placeholder="174379"
                  value={formData.mpesaPaybill} onChange={(e) => setFormData({ ...formData, mpesaPaybill: e.target.value })}
                  className="w-full bg-[#121824] border border-[#2A364F] px-3.5 py-2.5 rounded-xl text-xs font-mono text-slate-100 font-bold"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Daraja Consumer Key</label>
                <input
                  type="password" placeholder="Consumer Key"
                  value={formData.consumerKey} onChange={(e) => setFormData({ ...formData, consumerKey: e.target.value })}
                  className="w-full bg-[#121824] border border-[#2A364F] px-3.5 py-2.5 rounded-xl text-xs font-mono text-slate-100"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Daraja Consumer Secret</label>
                <input
                  type="password" placeholder="Consumer Secret"
                  value={formData.consumerSecret} onChange={(e) => setFormData({ ...formData, consumerSecret: e.target.value })}
                  className="w-full bg-[#121824] border border-[#2A364F] px-3.5 py-2.5 rounded-xl text-xs font-mono text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">Lipa Na M-Pesa Online Passkey (STK Password Seed)</label>
              <input
                type="text"
                placeholder="bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919"
                value={formData.passkey} onChange={(e) => setFormData({ ...formData, passkey: e.target.value })}
                className="w-full bg-[#121824] border border-[#2A364F] px-3.5 py-2.5 rounded-xl text-xs font-mono text-amber-400"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Password is generated dynamically: <code className="text-emerald-400 font-mono">Base64(BusinessShortCode + Passkey + Timestamp)</code>
              </p>
            </div>

            {/* Test Connection Button & Result Box */}
            <div className="pt-2 border-t border-[#2A364F] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleTestDarajaConnection}
                disabled={tokenTesting}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${tokenTesting ? 'animate-spin' : ''}`} />
                {tokenTesting ? 'Fetching OAuth Token...' : 'Test Daraja OAuth Token Connection'}
              </button>

              {tokenResult && (
                <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs font-mono text-emerald-300 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Bearer Token Acquired: {tokenResult.accessToken.substring(0, 22)}... (Expires: {tokenResult.expiresIn})</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: KRA eTIMS Tax Config */}
        {activeTab === 'TAX' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-100 text-sm border-b border-[#2A364F] pb-2">KRA eTIMS Device & PIN Settings (FR-TAX-01)</h3>

            <div className="flex items-center gap-3 p-3 bg-[#121824] rounded-xl border border-[#2A364F]">
              <input
                type="checkbox" id="vatToggle"
                checked={formData.isVatRegistered}
                onChange={(e) => setFormData({ ...formData, isVatRegistered: e.target.checked })}
                className="rounded border-[#2A364F] bg-[#121824] text-emerald-500 focus:ring-0 w-4 h-4"
              />
              <label htmlFor="vatToggle" className="text-xs text-slate-200 font-semibold cursor-pointer">
                Tenant is KRA VAT-Registered (Mandatory eTIMS OSCU Invoicing)
              </label>
            </div>

            {formData.isVatRegistered && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">KRA PIN *</label>
                  <input
                    type="text" required placeholder="A019827364Z"
                    value={formData.kraPin} onChange={(e) => setFormData({ ...formData, kraPin: e.target.value })}
                    className="w-full bg-[#121824] border border-[#2A364F] px-3.5 py-2.5 rounded-xl text-xs font-mono text-emerald-400"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1">eTIMS OSCU Device Serial</label>
                  <input
                    type="text" placeholder="OSCU-NK01-089"
                    value={formData.etimsDevice} onChange={(e) => setFormData({ ...formData, etimsDevice: e.target.value })}
                    className="w-full bg-[#121824] border border-[#2A364F] px-3.5 py-2.5 rounded-xl text-xs font-mono text-slate-200"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Security & PIN */}
        {activeTab === 'SECURITY' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-100 text-sm border-b border-[#2A364F] pb-2">User Credentials & High-Privilege Action PIN (FR-IAM-12)</h3>

            <div className="flex items-center justify-between p-4 bg-[#121824] rounded-xl border border-[#2A364F]">
              <div>
                <div className="font-semibold text-xs text-slate-200">4-Digit Security PIN (Discounts / Adjustments)</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Required for approving discounts &gt;10% and manual stock adjustments (BRULE-05).</div>
              </div>
              <button
                type="button"
                onClick={() => setPinChangeModal(true)}
                className="px-3.5 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold rounded-xl border border-emerald-500/30"
              >
                Reset PIN
              </button>
            </div>
          </div>
        )}

        {/* Tab 5: Subscription & STK Push License Renewal */}
        {activeTab === 'SUBSCRIPTION' && (
          <div className="space-y-4 text-xs">
            <h3 className="font-bold text-slate-100 text-sm border-b border-[#2A364F] pb-2 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" /> Active License & M-Pesa Renewal
              </span>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full font-bold border border-emerald-500/30">
                {activeTenant.status || 'ACTIVE'}
              </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-[#121824] rounded-2xl border border-[#2A364F] space-y-1">
                <span className="text-[11px] text-slate-400 font-semibold block">Current Subscription Tier</span>
                <div className="text-base font-extrabold text-emerald-400 font-display">
                  {SUBSCRIPTION_TIERS[activeTenant.tier || 'LITE']?.name || 'Biashara Lite'}
                </div>
                <div className="text-[11px] text-slate-400">
                  KSh {SUBSCRIPTION_TIERS[activeTenant.tier || 'LITE']?.priceMonthlyKSh}/month
                </div>
              </div>

              <div className="p-4 bg-[#121824] rounded-2xl border border-[#2A364F] space-y-1">
                <span className="text-[11px] text-slate-400 font-semibold block">License Token Expiration</span>
                <div className="text-base font-extrabold text-slate-100 font-mono">
                  {activeTenant.licenseExpiryDate || '2026-12-24'}
                </div>
                <div className="text-[11px] text-emerald-400 font-semibold">
                  Valid Active License Token
                </div>
              </div>

              <div className="p-4 bg-[#121824] rounded-2xl border border-[#2A364F] space-y-1">
                <span className="text-[11px] text-slate-400 font-semibold block">Signed Token Key</span>
                <div className="text-xs font-mono text-slate-300 truncate">
                  {activeTenant.licenseToken || 'LIC-LITE-9812A-2026-12-24'}
                </div>
                <div className="text-[10px] text-slate-500">
                  Schema: {activeTenant.schemaName || 'tenant_duka'}
                </div>
              </div>
            </div>

            {/* M-Pesa STK Push Renewal Form */}
            <div className="p-5 bg-emerald-500/5 rounded-2xl border border-emerald-500/20 space-y-4">
              <h4 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400" /> Renew License via Safaricom M-Pesa STK Push
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Select Renewal Duration Period</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { months: 1, label: '1 Month' },
                      { months: 3, label: '3 Months' },
                      { months: 12, label: '12 Months' }
                    ].map(opt => (
                      <button
                        key={opt.months}
                        type="button"
                        onClick={() => setRenewMonths(opt.months)}
                        className={`p-2 rounded-xl border text-center transition-all ${
                          renewMonths === opt.months
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500 font-bold'
                            : 'bg-[#121824] text-slate-400 border-[#2A364F]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">M-Pesa Mobile Number *</label>
                  <input
                    type="text"
                    required
                    value={renewPhone}
                    onChange={(e) => setRenewPhone(e.target.value)}
                    placeholder="+254 722 000 111"
                    className="w-full bg-[#121824] border border-[#2A364F] rounded-xl px-3.5 py-2.5 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className="text-xs text-slate-300">
                  Total Payable Amount: <strong className="text-emerald-400 font-display text-base">KSh {((SUBSCRIPTION_TIERS[activeTenant.tier || 'LITE']?.priceMonthlyKSh || 299) * renewMonths).toLocaleString()}</strong>
                </div>

                <button
                  type="button"
                  onClick={handleTriggerStkRenewal}
                  disabled={stkState === 'PUSHING'}
                  className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {stkState === 'PUSHING' ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Pushing STK to Handset...
                    </>
                  ) : stkState === 'SUCCESS' ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-slate-950" /> License Renewed!
                    </>
                  ) : (
                    <>
                      <Smartphone className="w-4 h-4" /> Trigger M-Pesa STK Push
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Data Privacy, Governance & Consent */}
        {activeTab === 'PRIVACY' && (
          <div className="space-y-4 text-xs">
            <h3 className="font-bold text-slate-100 text-sm border-b border-[#2A364F] pb-2 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" /> Kenya Data Protection Act 2019 & Consent Governance
              </span>
              <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                KDPA 2019 Verified
              </span>
            </h3>

            <div className="p-4 bg-[#121824] rounded-2xl border border-[#2A364F] space-y-2">
              <h4 className="font-bold text-slate-100 text-xs">Data Controller & Sovereignty Specifications</h4>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                BiasharaOS operates strictly as a Data Processor under the Kenya Data Protection Act (KDPA) 2019. All transactional stock ledgers, customer phones, and sales receipts reside inside isolated database schemas (<code>{activeTenant.schemaName || 'tenant_schema'}</code>).
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-slate-200 text-xs">Opt-in Consent & Communications Policy</h4>

              <label className="flex items-start gap-3 p-3 bg-[#121824] rounded-xl border border-[#2A364F] cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="mt-0.5 rounded border-[#2A364F] bg-[#0B0F17] text-emerald-500 focus:ring-0"
                />
                <div>
                  <div className="font-semibold text-slate-200 text-xs">Automated Customer SMS & Digital Receipts</div>
                  <div className="text-slate-400 text-[11px]">Allow sending M-Pesa digital receipt links and stock reorder alerts via Safaricom SMS gateway.</div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-[#121824] rounded-xl border border-[#2A364F] cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="mt-0.5 rounded border-[#2A364F] bg-[#0B0F17] text-emerald-500 focus:ring-0"
                />
                <div>
                  <div className="font-semibold text-slate-200 text-xs">Audited Platform Support Impersonation Access</div>
                  <div className="text-slate-400 text-[11px]">Grant explicit consent for BiasharaOS Platform Support agents to temporarily access store context during active support tickets (Logged in <code>platform_audit_log</code>).</div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-[#121824] rounded-xl border border-[#2A364F] cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-0.5 rounded border-[#2A364F] bg-[#0B0F17] text-emerald-500 focus:ring-0"
                />
                <div>
                  <div className="font-semibold text-slate-200 text-xs">Anonymized Kenyan MSME Market Benchmarking</div>
                  <div className="text-slate-400 text-[11px]">Opt-in to contribute non-identifiable aggregated sales volume trends to help train local inventory forecasting models.</div>
                </div>
              </label>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-[#2A364F] flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Profile & Daraja Config
          </button>
        </div>
      </form>

      {/* Change PIN Modal */}
      {pinChangeModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-sm w-full p-6 rounded-2xl border border-emerald-500/30 text-center space-y-4">
            <h3 className="font-bold text-slate-100 text-base">Set 4-Digit Security PIN</h3>
            
            <input
              type="password" maxLength={4} placeholder="New 4-Digit PIN"
              value={newPin} onChange={(e) => setNewPin(e.target.value)}
              className="w-full text-center tracking-widest text-lg font-mono bg-[#121824] border border-[#2A364F] py-2.5 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500"
            />
            <input
              type="password" maxLength={4} placeholder="Confirm 4-Digit PIN"
              value={confirmPin} onChange={(e) => setConfirmPin(e.target.value)}
              className="w-full text-center tracking-widest text-lg font-mono bg-[#121824] border border-[#2A364F] py-2.5 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500"
            />

            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setPinChangeModal(false)} className="py-2.5 bg-slate-800 text-slate-300 text-xs font-medium rounded-xl">
                Cancel
              </button>
              <button type="button" onClick={handleSavePin} className="py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl">
                Update Security PIN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
