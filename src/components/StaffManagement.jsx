import React, { useState } from 'react';
import { Users, UserPlus, Shield, Award, CheckCircle2, Lock, UserCheck } from 'lucide-react';

export default function StaffManagement({ staffList, onAddStaff, activeTenant }) {
  const [addModal, setAddModal] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: '', phone: '', role: 'CASHIER' });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newStaff.name || !newStaff.phone) return;

    onAddStaff({
      id: `stf_${Date.now()}`,
      name: newStaff.name,
      phone: newStaff.phone,
      role: newStaff.role,
      location: 'Main Branch (Nakuru)',
      status: 'ACTIVE',
      salesTodayCents: 0,
      commissionEarnedCents: 0
    });

    setAddModal(false);
    setNewStaff({ name: '', phone: '', role: 'CASHIER' });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 font-display">
            <Users className="w-6 h-6 text-emerald-400" /> Staff Management & Sales Attribution
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Role-Based Access Control (RBAC), commission tracking, and shift performance.
          </p>
        </div>

        <button
          onClick={() => setAddModal(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" /> Invite Staff Member
        </button>
      </div>

      {/* Staff List */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-[#2A364F]">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#121824] text-slate-400 font-semibold border-b border-[#2A364F]">
            <tr>
              <th className="p-3.5">STAFF MEMBER</th>
              <th className="p-3.5">PHONE NUMBER</th>
              <th className="p-3.5">ASSIGNED ROLE</th>
              <th className="p-3.5">LOCATION</th>
              <th className="p-3.5 text-right">SALES TODAY</th>
              <th className="p-3.5 text-right">COMMISSION (2%)</th>
              <th className="p-3.5 text-center">STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-200">
            {staffList.map(stf => (
              <tr key={stf.id} className="hover:bg-slate-800/30">
                <td className="p-3.5 font-bold text-slate-100 flex items-center gap-2">
                  <div className="w-7 h-7 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center font-bold text-xs">
                    {stf.name.charAt(0)}
                  </div>
                  {stf.name}
                </td>
                <td className="p-3.5 font-mono text-slate-400">{stf.phone}</td>
                <td className="p-3.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    stf.role === 'OWNER' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                    stf.role === 'MANAGER' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                    'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {stf.role}
                  </span>
                </td>
                <td className="p-3.5 text-slate-400">{stf.location}</td>
                <td className="p-3.5 text-right font-bold text-slate-100">KSh {(stf.salesTodayCents / 100).toFixed(2)}</td>
                <td className="p-3.5 text-right font-bold text-emerald-400">KSh {(stf.commissionEarnedCents / 100).toFixed(2)}</td>
                <td className="p-3.5 text-center">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                    {stf.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Role Permissions Reference Matrix */}
      <div className="glass-panel p-5 rounded-2xl border border-[#2A364F] space-y-3">
        <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" /> Tenant Role Permission Matrix
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-[#121824] rounded-xl border border-[#2A364F] space-y-1">
            <div className="font-bold text-amber-400">OWNER / MANAGER</div>
            <p className="text-slate-400 text-[11px]">Full access: Price edits, stock adjustments, discount overrides above 10%, report exports, staff management.</p>
          </div>
          <div className="p-3 bg-[#121824] rounded-xl border border-[#2A364F] space-y-1">
            <div className="font-bold text-emerald-400">CASHIER / ATTENDANT</div>
            <p className="text-slate-400 text-[11px]">POS ring-up, receipt generation, shift open/close, own sales visibility. Restricted from catalog edits.</p>
          </div>
          <div className="p-3 bg-[#121824] rounded-xl border border-[#2A364F] space-y-1">
            <div className="font-bold text-cyan-400">STOCK CLERK</div>
            <p className="text-slate-400 text-[11px]">Receiving purchase orders, stock ledger entries, physical stock count variance recording.</p>
          </div>
        </div>
      </div>

      {/* Add Staff Modal */}
      {addModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreate} className="glass-panel max-w-md w-full p-6 rounded-2xl border border-emerald-500/30 space-y-4">
            <h3 className="font-bold text-slate-100 text-base">Invite New Staff Member</h3>

            <div>
              <label className="text-xs text-slate-300 block mb-1">Full Name *</label>
              <input
                type="text" required placeholder="Jane Muthoni"
                value={newStaff.name} onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                className="w-full bg-[#121824] border border-[#2A364F] px-3 py-2 rounded-xl text-xs text-slate-100"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">Phone Number (M-Pesa registered) *</label>
              <input
                type="text" required placeholder="+254 712 000 999"
                value={newStaff.phone} onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                className="w-full bg-[#121824] border border-[#2A364F] px-3 py-2 rounded-xl text-xs font-mono text-slate-100"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">Assigned Role</label>
              <select
                value={newStaff.role} onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                className="w-full bg-[#121824] border border-[#2A364F] px-3 py-2 rounded-xl text-xs text-slate-100"
              >
                <option value="CASHIER">CASHIER (POS Only)</option>
                <option value="STOCK_CLERK">STOCK_CLERK (Inventory Only)</option>
                <option value="MANAGER">MANAGER (Full Operational)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button type="button" onClick={() => setAddModal(false)} className="py-2.5 bg-slate-800 text-slate-300 text-xs font-medium rounded-xl">
                Cancel
              </button>
              <button type="submit" className="py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl">
                Send Invitation SMS
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
