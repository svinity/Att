import React, { useState } from 'react';
import { Worker, Transaction, Expense, AppUser } from '../types';
import { Settings, User, CreditCard, ShieldAlert, Trash, Edit2, HardHat, LogOut, CheckCircle, ChevronRight, X, Info, Plus, UserPlus, KeyRound } from 'lucide-react';

interface SettingsScreenProps {
  workers: Worker[];
  transactions: Transaction[];
  expenses: Expense[];
  users: AppUser[];
  onEditWorker: (id: string, updatedFields: Partial<Worker>) => void;
  onDeleteWorker: (id: string) => void;
  onEditTransaction: (id: string, updatedFields: Partial<Transaction>) => void;
  onDeleteTransaction: (id: string) => void;
  onEditExpense: (id: string, updatedFields: Partial<Expense>) => void;
  onDeleteExpense: (id: string) => void;
  onAddUser: (user: Omit<AppUser, 'id'>) => void;
  onEditUser: (id: string, updatedFields: Partial<AppUser>) => void;
  onDeleteUser: (id: string) => void;
  onLogout: () => void;
}

export default function SettingsScreen({
  workers,
  transactions,
  expenses,
  users,
  onEditWorker,
  onDeleteWorker,
  onEditTransaction,
  onDeleteTransaction,
  onEditExpense,
  onDeleteExpense,
  onAddUser,
  onEditUser,
  onDeleteUser,
  onLogout,
}: SettingsScreenProps) {
  // Navigation tabs inside Settings
  const [activeTab, setActiveTab] = useState<'Workers' | 'Transactions' | 'Users'>('Workers');

  // Add/Edit Login User states
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserPasswordConfirm, setNewUserPasswordConfirm] = useState('');
  const [addUserError, setAddUserError] = useState('');

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editUserPassword, setEditUserPassword] = useState('');
  const [editUserPasswordConfirm, setEditUserPasswordConfirm] = useState('');
  const [editUserError, setEditUserError] = useState('');

  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  // Modal and editing states
  const [editingWorkerId, setEditingWorkerId] = useState<string | null>(null);
  const [deletingWorkerId, setDeletingWorkerId] = useState<string | null>(null);

  const [editingTxId, setEditingTxId] = useState<string | null>(null);
  const [deletingTxId, setDeletingTxId] = useState<string | null>(null);

  // Form states for Worker editing
  const [wName, setWName] = useState('');
  const [wMobile, setWMobile] = useState('');
  const [wDesignation, setWDesignation] = useState('');
  const [wSalary, setWSalary] = useState(0);
  const [wWage, setWWage] = useState(0);
  const [wStatus, setWStatus] = useState<'Active' | 'Inactive'>('Active');
  const [wRemarks, setWRemarks] = useState('');

  // Form states for Transaction editing
  const [txAmount, setTxAmount] = useState(0);
  const [txRemarks, setTxRemarks] = useState('');
  const [txType, setTxType] = useState<any>('Site Expense');

  // Multi-step safety locks (2-click protection for editing/deleting)
  const [isEditUnlocked, setIsEditUnlocked] = useState(false);
  const [isDeleteUnlocked, setIsDeleteUnlocked] = useState(false);

  // Handlers for Worker
  const handleOpenEditWorker = (worker: Worker) => {
    setEditingWorkerId(worker.id);
    setWName(worker.name);
    setWMobile(worker.mobile);
    setWDesignation(worker.designation);
    setWSalary(worker.monthlySalary);
    setWWage(worker.dailyWage);
    setWStatus(worker.status);
    setWRemarks(worker.remarks || '');
  };

  const handleSaveWorker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWorkerId) return;

    onEditWorker(editingWorkerId, {
      name: wName.trim(),
      mobile: wMobile.trim(),
      designation: wDesignation.trim(),
      monthlySalary: Number(wSalary),
      dailyWage: Number(wWage),
      status: wStatus,
      remarks: wRemarks.trim(),
    });

    setEditingWorkerId(null);
  };

  const handleDeleteWorkerClick = (id: string) => {
    setDeletingWorkerId(id);
  };

  const handleConfirmDeleteWorker = () => {
    if (deletingWorkerId) {
      onDeleteWorker(deletingWorkerId);
      setDeletingWorkerId(null);
    }
  };

  // Handlers for Transactions (Money) with 2-click locking
  const handleOpenEditTx = (tx: Transaction) => {
    setEditingTxId(tx.id);
    setTxAmount(tx.amount);
    setTxRemarks(tx.remarks || '');
    setTxType(tx.type);
    setIsEditUnlocked(false); // Lock by default (requires unlock click)
  };

  const handleSaveTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTxId) return;

    if (!isEditUnlocked) {
      // Prompt 1st click
      setIsEditUnlocked(true);
      return;
    }

    // 2nd click: saves the transaction
    onEditTransaction(editingTxId, {
      amount: Number(txAmount),
      remarks: txRemarks.trim(),
      type: txType,
    });

    setEditingTxId(null);
    setIsEditUnlocked(false);
  };

  const handleDeleteTxClick = (txId: string) => {
    setDeletingTxId(txId);
    setIsDeleteUnlocked(false); // Lock by default
  };

  const handleConfirmDeleteTx = () => {
    if (!deletingTxId) return;

    if (!isDeleteUnlocked) {
      // Prompt 1st click
      setIsDeleteUnlocked(true);
      return;
    }

    // 2nd click: deletes the transaction
    onDeleteTransaction(deletingTxId);
    setDeletingTxId(null);
    setIsDeleteUnlocked(false);
  };

  // Handlers for Login Users
  const handleOpenAddUser = () => {
    setNewUsername('');
    setNewUserName('');
    setNewUserPassword('');
    setNewUserPasswordConfirm('');
    setAddUserError('');
    setIsAddUserOpen(true);
  };

  const handleSubmitAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    setAddUserError('');

    const trimmedUsername = newUsername.trim();
    if (!trimmedUsername || !newUserName.trim() || !newUserPassword) {
      setAddUserError('Please fill out all fields.');
      return;
    }
    if (newUserPassword !== newUserPasswordConfirm) {
      setAddUserError('Passwords do not match.');
      return;
    }
    if (users.some(u => u.username.toLowerCase() === trimmedUsername.toLowerCase())) {
      setAddUserError('That username is already taken.');
      return;
    }

    onAddUser({
      username: trimmedUsername,
      password: newUserPassword,
      name: newUserName.trim(),
    });

    setIsAddUserOpen(false);
  };

  const handleOpenEditUser = (user: AppUser) => {
    setEditingUserId(user.id);
    setEditUserPassword('');
    setEditUserPasswordConfirm('');
    setEditUserError('');
  };

  const handleSubmitEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    setEditUserError('');
    if (!editingUserId) return;

    if (!editUserPassword) {
      setEditUserError('Please enter a new password.');
      return;
    }
    if (editUserPassword !== editUserPasswordConfirm) {
      setEditUserError('Passwords do not match.');
      return;
    }

    onEditUser(editingUserId, { password: editUserPassword });
    setEditingUserId(null);
  };

  const handleConfirmDeleteUser = () => {
    if (deletingUserId) {
      onDeleteUser(deletingUserId);
      setDeletingUserId(null);
    }
  };

  return (
    <div className="space-y-4 pb-20 animate-fadeIn">
      {/* Settings Top Info Card */}
      <div id="settings-header" className="p-4 bg-white border border-gray-100 rounded-2xl flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500">
            <Settings className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h2 className="font-extrabold text-sm text-gray-900 leading-none">Administration Panel</h2>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1.5 block">
              Manage core resources & vouchers
            </span>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="p-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors cursor-pointer"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* App Version Tag */}
      <div className="bg-gradient-to-r from-[#1a56db]/5 to-indigo-500/5 border border-[#1a56db]/10 rounded-2xl p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-[#1a56db]" />
          <span className="text-xs font-semibold text-gray-700">App Version Code</span>
        </div>
        <span className="text-xs font-black text-[#1a56db] bg-[#1a56db]/10 px-3 py-1 rounded-full">
          v1.0.3-stable
        </span>
      </div>

      {/* Tab Selectors */}
      <div className="flex bg-gray-100 rounded-xl p-1">
        <button
          onClick={() => setActiveTab('Workers')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'Workers'
              ? 'bg-white text-[#1a56db] shadow-xs'
              : 'text-gray-500 hover:text-gray-950'
          }`}
        >
          Manage Workers ({workers.length})
        </button>
        <button
          onClick={() => setActiveTab('Transactions')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'Transactions'
              ? 'bg-white text-[#1a56db] shadow-xs'
              : 'text-gray-500 hover:text-gray-950'
          }`}
        >
          Manage Money & Expenses
        </button>
        <button
          onClick={() => setActiveTab('Users')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'Users'
              ? 'bg-white text-[#1a56db] shadow-xs'
              : 'text-gray-500 hover:text-gray-950'
          }`}
        >
          Login Users ({users.length})
        </button>
      </div>

      {/* TAB 1: WORKERS MANAGEMENT */}
      {activeTab === 'Workers' && (
        <div className="space-y-3">
          {workers.map(w => (
            <div
              key={w.id}
              className="p-3 bg-white border border-gray-100 rounded-2xl shadow-xs flex items-center justify-between"
            >
              <div>
                <h4 className="font-extrabold text-xs text-gray-900">{w.name}</h4>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                  {w.designation} • Wage: ₹{w.dailyWage}/day
                </p>
              </div>
              
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleOpenEditWorker(w)}
                  className="p-2 bg-gray-50 hover:bg-[#1a56db]/5 text-gray-600 hover:text-[#1a56db] rounded-xl transition-colors cursor-pointer"
                  title="Edit Worker Profile"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteWorkerClick(w.id)}
                  className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors cursor-pointer"
                  title="Remove Worker"
                >
                  <Trash className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: TRANSACTIONS & MONEY MANAGEMENT */}
      {activeTab === 'Transactions' && (
        <div className="space-y-3">
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3.5 flex gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="text-xs font-black text-amber-800 uppercase block tracking-wider">Safety Lock Active</span>
              <p className="text-[11px] text-amber-700 leading-relaxed font-medium">
                Modifying ledger amounts or deleting vouchers requires a **2-click lock confirmation** to protect financial records.
              </p>
            </div>
          </div>

          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-xs">No transactions logged yet.</div>
          ) : (
            <div className="space-y-3">
              {transactions.map(t => {
                const w = workers.find(work => work.id === t.workerId);
                return (
                  <div
                    key={t.id}
                    className="p-3.5 bg-white border border-gray-100 rounded-2xl shadow-xs flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                          t.type === 'Site Expense' ? 'bg-indigo-50 text-indigo-700' : 'bg-green-50 text-green-700'
                        }`}>
                          {t.type}
                        </span>
                        <span className="text-xs font-extrabold text-gray-800">
                          ₹{t.amount}
                        </span>
                      </div>
                      <p className="text-[11px] font-semibold text-gray-700">{t.remarks}</p>
                      <span className="text-[9px] font-bold text-gray-400 block">
                        Worker: {w?.name || 'Deleted Worker'} • Date: {t.date}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditTx(t)}
                        className="p-2 bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded-xl transition-colors cursor-pointer"
                        title="Edit voucher amount"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTxClick(t.id)}
                        className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors cursor-pointer"
                        title="Delete voucher"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: LOGIN USERS MANAGEMENT */}
      {activeTab === 'Users' && (
        <div className="space-y-3">
          <button
            onClick={handleOpenAddUser}
            className="w-full h-12 bg-[#1a56db] hover:bg-[#1a56db]/90 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New Login User</span>
          </button>

          {users.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-xs">No login users yet.</div>
          ) : (
            <div className="space-y-3">
              {users.map(u => (
                <div
                  key={u.id}
                  className="p-3.5 bg-white border border-gray-100 rounded-2xl shadow-xs flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#1a56db]/10 text-[#1a56db] flex items-center justify-center font-bold text-xs">
                      {u.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-gray-900">{u.name}</h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                        Username: {u.username}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditUser(u)}
                      className="p-2 bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-[#1a56db] rounded-xl transition-colors cursor-pointer"
                      title="Reset password"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingUserId(u.id)}
                      disabled={users.length <= 1}
                      className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      title={users.length <= 1 ? 'At least one login user is required' : 'Remove user'}
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: EDIT WORKER */}
      {editingWorkerId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-extrabold text-sm text-gray-900">Edit Worker Profile</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Modify payroll and designation</p>
              </div>
              <button
                onClick={() => setEditingWorkerId(null)}
                className="w-7 h-7 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-full flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveWorker} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  value={wName}
                  onChange={(e) => setWName(e.target.value)}
                  required
                  className="w-full h-11 px-3 bg-gray-50/50 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-[#1a56db]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Mobile Number</label>
                <input
                  type="tel"
                  value={wMobile}
                  onChange={(e) => setWMobile(e.target.value)}
                  required
                  className="w-full h-11 px-3 bg-gray-50/50 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-[#1a56db]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Designation</label>
                <input
                  type="text"
                  value={wDesignation}
                  onChange={(e) => setWDesignation(e.target.value)}
                  required
                  className="w-full h-11 px-3 bg-gray-50/50 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-[#1a56db]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Monthly Salary (₹)</label>
                  <input
                    type="number"
                    value={wSalary}
                    onChange={(e) => setWSalary(Number(e.target.value))}
                    required
                    className="w-full h-11 px-3 bg-gray-50/50 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-[#1a56db]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Daily Wage (₹)</label>
                  <input
                    type="number"
                    value={wWage}
                    onChange={(e) => setWWage(Number(e.target.value))}
                    required
                    className="w-full h-11 px-3 bg-gray-50/50 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-[#1a56db]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Status</label>
                <select
                  value={wStatus}
                  onChange={(e) => setWStatus(e.target.value as any)}
                  className="w-full h-11 px-3 bg-gray-50/50 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-[#1a56db]"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Remarks / Notes</label>
                <textarea
                  value={wRemarks}
                  onChange={(e) => setWRemarks(e.target.value)}
                  rows={2}
                  className="w-full p-3 bg-gray-50/50 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-[#1a56db]"
                />
              </div>

              <button
                type="submit"
                className="w-full h-11 bg-[#1a56db] hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Apply Profile Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CONFIRM DELETE WORKER */}
      {deletingWorkerId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-sm text-gray-900">Are you absolutely sure?</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Deleting this worker is permanent and will remove all their wages, payment history, and attendance records.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleConfirmDeleteWorker}
                className="flex-1 h-11 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl uppercase tracking-wider cursor-pointer"
              >
                Yes, Delete Worker
              </button>
              <button
                onClick={() => setDeletingWorkerId(null)}
                className="px-4 h-11 bg-gray-100 text-gray-600 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT TRANSACTION (with 2-click lock protection) */}
      {editingTxId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-extrabold text-sm text-gray-900">Edit Voucher Amount</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Modify ledger record parameters</p>
              </div>
              <button
                onClick={() => {
                  setEditingTxId(null);
                  setIsEditUnlocked(false);
                }}
                className="w-7 h-7 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-full flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTx} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Transaction Type</label>
                <select
                  value={txType}
                  onChange={(e) => setTxType(e.target.value as any)}
                  className="w-full h-11 px-3 bg-gray-50/50 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none"
                >
                  <option value="Site Expense">Site Expense</option>
                  <option value="Salary Advance">Salary Advance</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Adjust Amount (₹)</label>
                <input
                  type="number"
                  value={txAmount}
                  onChange={(e) => setTxAmount(Number(e.target.value))}
                  required
                  className="w-full h-11 px-3 bg-gray-50/50 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Remarks</label>
                <input
                  type="text"
                  value={txRemarks}
                  onChange={(e) => setTxRemarks(e.target.value)}
                  required
                  className="w-full h-11 px-3 bg-gray-50/50 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none"
                />
              </div>

              {/* TWO CLICK STEP FLOW */}
              {!isEditUnlocked ? (
                <button
                  type="button"
                  onClick={() => setIsEditUnlocked(true)}
                  className="w-full h-11 bg-indigo-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <span>1st Click: Unlock to Edit</span>
                </button>
              ) : (
                <div className="space-y-2 animate-fadeIn">
                  <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-xl text-center text-[10px] font-bold text-indigo-700 uppercase tracking-wide">
                    Locked Unlocked. Ready to apply.
                  </div>
                  <button
                    type="submit"
                    className="w-full h-11 bg-green-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                  >
                    <span>2nd Click: Confirm & Modify Voucher</span>
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: CONFIRM DELETE TRANSACTION (with 2-click lock protection) */}
      {deletingTxId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-sm text-gray-900">Are you sure you want to delete this payment?</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                This will delete the company cash record entry permanently from the worker ledger.
              </p>
            </div>

            {/* TWO CLICK STEP FLOW */}
            {!isDeleteUnlocked ? (
              <button
                type="button"
                onClick={() => setIsDeleteUnlocked(true)}
                className="w-full h-11 bg-indigo-600 text-white font-bold text-xs rounded-xl uppercase tracking-wider cursor-pointer active:scale-95 transition-all"
              >
                1st Click: Unlock Deletion
              </button>
            ) : (
              <div className="space-y-2 animate-fadeIn">
                <div className="p-2.5 bg-red-50 border border-red-100 rounded-xl text-center text-[10px] font-bold text-red-700 uppercase tracking-wide">
                  Deletion Unlocked. Confirmed dangerous.
                </div>
                <button
                  onClick={handleConfirmDeleteTx}
                  className="w-full h-11 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl uppercase tracking-wider cursor-pointer active:scale-95 transition-all"
                >
                  2nd Click: Yes, Permanently Delete
                </button>
              </div>
            )}
            
            <button
              onClick={() => {
                setDeletingTxId(null);
                setIsDeleteUnlocked(false);
              }}
              className="w-full h-11 bg-gray-100 text-gray-600 font-bold text-xs rounded-xl cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* MODAL 5: ADD LOGIN USER */}
      {isAddUserOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-extrabold text-sm text-gray-900">Add Login User</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Grant app access</p>
              </div>
              <button
                onClick={() => setIsAddUserOpen(false)}
                className="w-7 h-7 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-full flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitAddUser} className="space-y-4">
              {addUserError && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-semibold rounded-xl text-center">
                  {addUserError}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Display Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  required
                  className="w-full h-11 px-3 bg-gray-50/50 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-[#1a56db]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Username</label>
                <input
                  type="text"
                  placeholder="Login username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  required
                  className="w-full h-11 px-3 bg-gray-50/50 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-[#1a56db]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Password</label>
                <input
                  type="password"
                  placeholder="Set a password"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  required
                  className="w-full h-11 px-3 bg-gray-50/50 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-[#1a56db]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Confirm Password</label>
                <input
                  type="password"
                  placeholder="Re-enter password"
                  value={newUserPasswordConfirm}
                  onChange={(e) => setNewUserPasswordConfirm(e.target.value)}
                  required
                  className="w-full h-11 px-3 bg-gray-50/50 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-[#1a56db]"
                />
              </div>

              <button
                type="submit"
                className="w-full h-11 bg-[#1a56db] hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Create Login User
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: RESET USER PASSWORD */}
      {editingUserId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-extrabold text-sm text-gray-900">Reset Password</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                  {users.find(u => u.id === editingUserId)?.name}
                </p>
              </div>
              <button
                onClick={() => setEditingUserId(null)}
                className="w-7 h-7 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-full flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitEditUser} className="space-y-4">
              {editUserError && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-semibold rounded-xl text-center">
                  {editUserError}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">New Password</label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={editUserPassword}
                  onChange={(e) => setEditUserPassword(e.target.value)}
                  required
                  className="w-full h-11 px-3 bg-gray-50/50 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-[#1a56db]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Re-enter new password"
                  value={editUserPasswordConfirm}
                  onChange={(e) => setEditUserPasswordConfirm(e.target.value)}
                  required
                  className="w-full h-11 px-3 bg-gray-50/50 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-[#1a56db]"
                />
              </div>

              <button
                type="submit"
                className="w-full h-11 bg-[#1a56db] hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Save New Password
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 7: CONFIRM DELETE LOGIN USER */}
      {deletingUserId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-sm text-gray-900">Remove this login user?</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                {users.find(u => u.id === deletingUserId)?.name} will no longer be able to sign in to the app.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleConfirmDeleteUser}
                className="flex-1 h-11 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl uppercase tracking-wider cursor-pointer"
              >
                Yes, Remove User
              </button>
              <button
                onClick={() => setDeletingUserId(null)}
                className="px-4 h-11 bg-gray-100 text-gray-600 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
