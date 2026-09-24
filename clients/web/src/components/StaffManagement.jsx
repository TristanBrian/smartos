import React, { useState } from 'react';
import { Users, UserPlus, Shield, Award, CheckCircle2, Lock, UserCheck, Key, ShieldAlert, Sparkles, Check, X } from 'lucide-react';
import { TEST_USERS, ROLE_PERMISSIONS_MATRIX } from '../data/mockData';

export default function StaffManagement({ staffList, onAddStaff, activeTenant, currentUser, onSwitchUser }) {
  const [addModal, setAddModal] = useState(false);
  const [activeTabSub, setActiveTabSub] = useState('STAFF'); // 'STAFF' | 'PERMISSIONS'
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

  const permissionsList = [
    { key: 'canProcessSales', label: 'POS Terminal Checkout & Sales' },
    { key: 'canOverrideDiscount', label: 'Discount Override (>10% Cap)' },
    { key: 'canAdjustStock', label: 'Stock Adjustments & Write-Offs' },
    { key: 'canManageStaff', label: 'Staff Invitation & Role Assignment' },
    { key: 'canEditStoreProfile', label: 'Store Profile & eTIMS Security Config' },
    { key: 'canAccessPlatformAdmin', label: 'Platform Admin & Impersonation' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Sub-Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-[#2A364F]">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 font-display">
            <Users className="w-6 h-6 text-emerald-400" /> Enterprise Staff & Role-Based Access Control (RBAC)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage store team members, switch test user personas, and enforce granular role permissions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-[#121824] p-1 rounded-xl border border-[#2A364F] flex gap-1">
            <button
              onClick={() => setActiveTabSub('STAFF')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTabSub === 'STAFF' ? 'bg-emerald-500 text-slate-950 font-extrabold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Team Roster ({staffList.length})
            </button>
            <button
              onClick={() => setActiveTabSub('PERMISSIONS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTabSub === 'PERMISSIONS' ? 'bg-emerald-500 text-slate-950 font-extrabold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Permissions Matrix
            </button>
          </div>

          <button
            onClick={() => setAddModal(true)}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" /> Invite Staff Member
          </button>
        </div>
      </div>

      {/* 6 Pre-configured Test Persona Switcher Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-emerald-500/30 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5 font-display">
            <Sparkles className="w-4 h-4 text-emerald-400" /> Instant Test User Identity Switcher (6 Pre-configured Personas)
          </h3>
          <span className="text-[11px] text-slate-400">Current Identity: <strong className="text-emerald-400">{currentUser?.name || 'Admin'} ({currentUser?.roleLabel || 'SUPER_ADMIN'})</strong></span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {TEST_USERS.map(user => {
            const isActive = currentUser?.id === user.id;
            return (
              <button
                key={user.id}
                onClick={() => onSwitchUser && onSwitchUser(user)}
                className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  isActive
                    ? 'bg-emerald-500/15 border-emerald-500 shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500'
                    : 'bg-[#121824] border-[#2A364F] hover:border-slate-600'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-base">{user.avatar}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold border ${user.badgeColor}`}>
                      {user.role}
                    </span>
                  </div>
                  <div className="font-bold text-slate-100 text-xs truncate">{user.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{user.roleLabel}</div>
                </div>

                <div className="mt-2 text-[10px] font-semibold text-emerald-400 flex items-center justify-between border-t border-slate-800/80 pt-1.5">
                  <span>{isActive ? '✓ Active Session' : 'Switch Identity'}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Subtab 1: Staff Roster */}
      {activeTabSub === 'STAFF' && (
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
                <th className="p-3.5 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {staffList.map(stf => (
                <tr key={stf.id} className="hover:bg-slate-800/30">
                  <td className="p-3.5 font-bold text-slate-100 flex items-center gap-2">
                    <div className="w-7 h-7 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center font-bold text-xs">
                      {stf.name.charAt(0)}
                    </div>
                    <div>
                      <div>{stf.name}</div>
                      <div className="text-[10px] text-slate-500 font-normal">{stf.email || `${stf.role.toLowerCase()}@nakurugrocery.co.ke`}</div>
                    </div>
                  </td>
                  <td className="p-3.5 font-mono text-slate-400">{stf.phone}</td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      stf.role === 'OWNER' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      stf.role === 'MANAGER' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                      stf.role === 'SUPER_ADMIN' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                      stf.role === 'STOCK_CLERK' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
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
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => {
                        const matchingTestUser = TEST_USERS.find(u => u.name === stf.name || u.role === stf.role);
                        if (matchingTestUser && onSwitchUser) {
                          onSwitchUser(matchingTestUser);
                        }
                      }}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] rounded-lg border border-slate-700 font-semibold"
                    >
                      Act As User
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Main Subtab 2: Role Permissions Matrix */}
      {activeTabSub === 'PERMISSIONS' && (
        <div className="glass-panel p-5 rounded-2xl border border-[#2A364F] space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" /> Granular RBAC Role Permission Matrix
            </h3>
            <span className="text-xs text-slate-400">Production-Grade Security Policies</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#121824] text-slate-400 font-semibold border-b border-[#2A364F]">
                <tr>
                  <th className="p-3">PERMISSION FEATURE</th>
                  <th className="p-3 text-center">SUPER_ADMIN</th>
                  <th className="p-3 text-center">OWNER</th>
                  <th className="p-3 text-center">MANAGER</th>
                  <th className="p-3 text-center">CASHIER</th>
                  <th className="p-3 text-center">STOCK_CLERK</th>
                  <th className="p-3 text-center">AUDITOR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {permissionsList.map(perm => (
                  <tr key={perm.key} className="hover:bg-slate-800/30">
                    <td className="p-3 font-semibold text-slate-100">{perm.label}</td>
                    {['SUPER_ADMIN', 'OWNER', 'MANAGER', 'CASHIER', 'STOCK_CLERK', 'AUDITOR'].map(roleKey => {
                      const isAllowed = ROLE_PERMISSIONS_MATRIX[roleKey]?.[perm.key];
                      return (
                        <td key={roleKey} className="p-3 text-center">
                          {isAllowed ? (
                            <span className="inline-flex items-center gap-1 text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 text-[10px]">
                              <Check className="w-3 h-3" /> Allowed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-slate-500 bg-slate-900 px-2 py-0.5 rounded text-[10px]">
                              <X className="w-3 h-3 text-rose-500" /> Denied
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
                <option value="CASHIER">CASHIER (POS Checkout & Receipts)</option>
                <option value="STOCK_CLERK">STOCK_CLERK (Inventory Ledger & Receive Goods)</option>
                <option value="MANAGER">MANAGER (Full Shop Operations & Approvals)</option>
                <option value="OWNER">OWNER (Full Shop Admin)</option>
                <option value="AUDITOR">AUDITOR (Read-Only Financial Auditing)</option>
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
