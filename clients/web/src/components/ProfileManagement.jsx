import React, { useState } from 'react';
import { UserCheck, Building, Smartphone, ShieldCheck, Key, Save, Download, CheckCircle, AlertTriangle } from 'lucide-react';

export default function ProfileManagement({ activeTenant, onUpdateTenantProfile, onExportData }) {
  const [activeTab, setActiveTab] = useState('BUSINESS'); // BUSINESS, PAYMENTS, TAX, SECURITY
  const [formData, setFormData] = useState({
    name: activeTenant.name || '',
    businessType: activeTenant.type || 'Retail Duka',
    county: activeTenant.county || 'Nakuru',
    ownerName: activeTenant.ownerName || '',
    phone: activeTenant.phone || '',
    isVatRegistered: activeTenant.isVatRegistered || false,
    kraPin: activeTenant.kraPin || '',
    etimsDevice: activeTenant.etimsDevice || '',
    mpesaPaybill: activeTenant.mpesaPaybill || '',
    mpesaTill: activeTenant.mpesaTill || '',
    currency: activeTenant.currency || 'KSh',
    receiptFooterNote: activeTenant.receiptFooterNote || 'Asante kwa kununua! Karibu Tena.'
  });

  const [pinChangeModal, setPinChangeModal] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

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
      receiptFooterNote: formData.receiptFooterNote
    });
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
            <UserCheck className="w-6 h-6 text-emerald-400" /> Business Profile & Security Management
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure tenant parameters, M-Pesa Paybill credentials, eTIMS OSCU device settings, and user security.
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

      {/* Profile Sub-Tabs */}
      <div className="flex gap-2 border-b border-[#2A364F] pb-3">
        {[
          { id: 'BUSINESS', label: 'Business & Store Info', icon: Building },
          { id: 'PAYMENTS', label: 'M-Pesa & Paybill Config', icon: Smartphone },
          { id: 'TAX', label: 'KRA eTIMS Tax Profile', icon: ShieldCheck },
          { id: 'SECURITY', label: 'User Security & PIN', icon: Key }
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

        {/* Tab 2: Payments & Paybill Config */}
        {activeTab === 'PAYMENTS' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-100 text-sm border-b border-[#2A364F] pb-2">M-Pesa Daraja Shortcode Credentials (FR-PAY-13)</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-300 block mb-1">M-Pesa Paybill Number</label>
                <input
                  type="text" placeholder="748912"
                  value={formData.mpesaPaybill} onChange={(e) => setFormData({ ...formData, mpesaPaybill: e.target.value })}
                  className="w-full bg-[#121824] border border-[#2A364F] px-3.5 py-2.5 rounded-xl text-xs font-mono text-emerald-400 font-bold"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">M-Pesa Buy Goods Till Number</label>
                <input
                  type="text" placeholder="891234"
                  value={formData.mpesaTill} onChange={(e) => setFormData({ ...formData, mpesaTill: e.target.value })}
                  className="w-full bg-[#121824] border border-[#2A364F] px-3.5 py-2.5 rounded-xl text-xs font-mono text-emerald-400 font-bold"
                />
              </div>
            </div>

            <div className="p-4 bg-[#121824] rounded-xl border border-[#2A364F] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-semibold">Safaricom Daraja 3.0 API OAuth Credentials:</span>
                <span className="text-emerald-400 font-mono text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
                  ENCRYPTED IN SECRETS MANAGER (IF-01)
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Shortcode credentials are stored encrypted with tenant-scoped keys. Consumer Key & Consumer Secret are never stored in tenant-accessible storage.
              </p>
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

        <div className="pt-4 border-t border-[#2A364F] flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Profile Configurations
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
