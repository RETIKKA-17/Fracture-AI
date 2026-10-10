import React, { useState } from 'react';
import {
  Users,
  Search,
  PlusCircle,
  UserCheck,
  UserX,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth, type UserRole, type UserSession } from '../../context/AuthContext';

export const UserManagementPage: React.FC = () => {
  const { registeredUsers, addUser, toggleUserStatus, updateUser } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'All' | 'doctor' | 'admin'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Deactivated'>('All');

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserSession | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('doctor');
  const [title, setTitle] = useState('Staff Radiologist');
  const [department, setDepartment] = useState('Radiology');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Filtered Users
  const filteredUsers = registeredUsers.filter((u) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.title.toLowerCase().includes(q);

    if (!matchesSearch) return false;
    if (roleFilter !== 'All' && u.role !== roleFilter) return false;
    if (statusFilter === 'Active' && !u.isActive) return false;
    if (statusFilter === 'Deactivated' && u.isActive) return false;

    return true;
  });

  const handleOpenAddModal = () => {
    setName('');
    setEmail('');
    setRole('doctor');
    setTitle('Staff Radiologist');
    setDepartment('Radiology');
    setFormError('');
    setFormSuccess('');
    setEditingUser(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (u: UserSession) => {
    setEditingUser(u);
    setName(u.name);
    setEmail(u.email);
    setRole(u.role);
    setTitle(u.title);
    setDepartment(u.department || 'Radiology');
    setFormError('');
    setFormSuccess('');
    setIsAddModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!name.trim()) {
      setFormError('Please enter user full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setFormError('Please enter a valid email address.');
      return;
    }

    if (editingUser) {
      updateUser({
        ...editingUser,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role,
        title: title.trim(),
        department: department.trim(),
      });
      setFormSuccess('User account updated successfully.');
    } else {
      // Check duplicate email
      const exists = registeredUsers.some((u) => u.email.toLowerCase() === email.trim().toLowerCase());
      if (exists) {
        setFormError('An account with this email address already exists.');
        return;
      }
      addUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role,
        title: title.trim(),
        department: department.trim(),
        isDemo: false,
        isActive: true,
      });
      setFormSuccess('New user account registered successfully.');
    }

    setTimeout(() => {
      setIsAddModalOpen(false);
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">User Account Management</h1>
            <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              ADMIN CONTROL
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Manage registered Doctor & Administrator accounts, role permissions, and access status.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider font-mono shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Add User Account</span>
        </button>
      </div>

      {/* 2. Filter & Search Control Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search user by name, email, or title..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Role & Status Filter Pills */}
          <div className="flex items-center gap-3 overflow-x-auto pb-1 md:pb-0">
            
            {/* Role Filter */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <span className="px-2 font-mono text-[10px] font-bold text-slate-400 uppercase">ROLE:</span>
              {(['All', 'doctor', 'admin'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer capitalize ${
                    roleFilter === r ? 'bg-blue-600 text-white shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <span className="px-2 font-mono text-[10px] font-bold text-slate-400 uppercase">STATUS:</span>
              {(['All', 'Active', 'Deactivated'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    statusFilter === s ? 'bg-blue-600 text-white shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

          </div>

        </div>
      </div>

      {/* 3. User Accounts Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 text-xs font-medium text-slate-500 flex justify-between items-center">
          <span>Displaying {filteredUsers.length} of {registeredUsers.length} total registered accounts</span>
          <span className="font-mono text-[10px] text-slate-400">WristAI RBAC Policy Enforced</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 font-mono">
                <th className="py-3.5 px-5">USER NAME</th>
                <th className="py-3.5 px-4">EMAIL ADDRESS</th>
                <th className="py-3.5 px-4">ASSIGNED ROLE</th>
                <th className="py-3.5 px-5">CLINICAL TITLE & DEPT</th>
                <th className="py-3.5 px-4">ACCOUNT STATUS</th>
                <th className="py-3.5 px-5 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  
                  {/* Name */}
                  <td className="py-4 px-5 font-bold text-slate-900">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center font-mono shrink-0">
                        {u.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <span className="block font-bold text-slate-900">{u.name}</span>
                        {u.isDemo && (
                          <span className="text-[9px] font-mono text-amber-700 bg-amber-50 px-1 py-0.2 rounded border border-amber-200">
                            Demo Account
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="py-4 px-4 font-mono text-slate-600 text-[11px]">
                    {u.email}
                  </td>

                  {/* Role */}
                  <td className="py-4 px-4">
                    <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                      u.role === 'admin'
                        ? 'bg-cyan-50 text-cyan-800 border-cyan-200'
                        : 'bg-blue-50 text-blue-800 border-blue-200'
                    }`}>
                      {u.role}
                    </span>
                  </td>

                  {/* Title & Dept */}
                  <td className="py-4 px-5">
                    <span className="font-semibold text-slate-800 block text-xs">{u.title}</span>
                    <span className="text-[10px] text-slate-400 font-medium block">{u.department || 'General'}</span>
                  </td>

                  {/* Account Status */}
                  <td className="py-4 px-4">
                    {u.isActive ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <UserCheck className="w-3 h-3 text-emerald-600" />
                        ACTIVE
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <UserX className="w-3 h-3 text-rose-600" />
                        DEACTIVATED
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-5 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEditModal(u)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => toggleUserStatus(u.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        u.isActive
                          ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                      }`}
                    >
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Users className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-medium">No user accounts found matching query "{searchQuery}".</p>
            </div>
          )}
        </div>
      </div>

      {/* 4. Add / Edit User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 border border-slate-200 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  {editingUser ? 'Edit User Account' : 'Register New User Account'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
              
              {/* Full Name */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Jane Smith"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. j.smith@wristai.org"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              {/* Role Selection */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Assigned Role</label>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setRole('doctor')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      role === 'doctor'
                        ? 'bg-blue-50 border-blue-500 text-blue-900 font-bold shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <span className="block font-bold text-xs">Doctor</span>
                    <span className="text-[10px] text-slate-500 font-normal">Clinical workspace & reviews</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      role === 'admin'
                        ? 'bg-cyan-50 border-cyan-500 text-cyan-900 font-bold shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <span className="block font-bold text-xs">Admin</span>
                    <span className="text-[10px] text-slate-500 font-normal">User & system administration</span>
                  </button>
                </div>
              </div>

              {/* Title */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Clinical / IT Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Attending Radiologist"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Department */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Radiology / IT Governance"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-semibold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer shadow-xs"
                >
                  {editingUser ? 'Save Changes' : 'Register Account'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
