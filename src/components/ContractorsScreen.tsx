import React, { useState } from 'react';
import { Contractor, ContractorPayment } from '../types';
import { Briefcase, Building, Coins, Trash2, Plus, Calendar, Edit, FileText, IndianRupee, ArrowLeft, PlusCircle, Trash, HelpCircle, X } from 'lucide-react';
import EmptyState from './EmptyState';

interface ContractorsScreenProps {
  contractors: Contractor[];
  payments: ContractorPayment[];
  onAddContractor: (newContractor: Omit<Contractor, 'id'>) => void;
  onEditContractor: (id: string, updatedFields: Partial<Contractor>) => void;
  onDeleteContractor: (id: string) => void;
  onAddPayment: (newPayment: Omit<ContractorPayment, 'id'>) => void;
  onDeletePayment: (id: string) => void;
  currentDate: string;
}

export default function ContractorsScreen({
  contractors,
  payments,
  onAddContractor,
  onEditContractor,
  onDeleteContractor,
  onAddPayment,
  onDeletePayment,
  currentDate,
}: ContractorsScreenProps) {
  // Navigation states
  const [selectedContractorId, setSelectedContractorId] = useState<string | null>(null);
  const [contractorSubTab, setContractorSubTab] = useState<'Overview' | 'Ledger' | 'Manage'>('Overview');
  
  // Modal states
  const [isAddContractorOpen, setIsAddContractorOpen] = useState(false);
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);

  // Form states for contractor
  const [newCName, setNewCName] = useState('');
  const [newCSite, setNewCSite] = useState('');
  const [newCFinalised, setNewCFinalised] = useState('');
  const [newCRemarks, setNewCRemarks] = useState('');

  // Form states for payment
  const [payAmount, setPayAmount] = useState('');
  const [payDate, setPayDate] = useState(currentDate);
  const [payRemarks, setPayRemarks] = useState('');

  // Editing state for contractor
  const [editCName, setEditCName] = useState('');
  const [editCSite, setEditCSite] = useState('');
  const [editCFinalised, setEditCFinalised] = useState('');
  const [editCRemarks, setEditCRemarks] = useState('');

  // Confirmation state for critical deletes (2-click protection)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmPaymentDeleteId, setConfirmPaymentDeleteId] = useState<string | null>(null);

  // Helpers
  const selectedContractor = contractors.find(c => c.id === selectedContractorId);
  const selectedPayments = payments.filter(p => p.contractorId === selectedContractorId);
  
  // Calculations
  const getContractorPaid = (cId: string) => {
    return payments
      .filter(p => p.contractorId === cId)
      .reduce((sum, p) => sum + p.amount, 0);
  };

  const getContractorDue = (c: Contractor) => {
    return c.amountFinalised - getContractorPaid(c.id);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const handleCreateContractor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCName.trim() || !newCSite.trim() || !newCFinalised) return;

    onAddContractor({
      name: newCName.trim(),
      site: newCSite.trim(),
      amountFinalised: Number(newCFinalised),
      remarks: newCRemarks.trim(),
    });

    // Reset Form
    setNewCName('');
    setNewCSite('');
    setNewCFinalised('');
    setNewCRemarks('');
    setIsAddContractorOpen(false);
  };

  const handleCreatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContractorId || !payAmount || !payDate || !payRemarks.trim()) return;

    onAddPayment({
      contractorId: selectedContractorId,
      amount: Number(payAmount),
      date: payDate,
      remarks: payRemarks.trim(),
    });

    // Reset Form
    setPayAmount('');
    setPayRemarks('');
    setIsAddPaymentOpen(false);
  };

  const handleSaveContractorEdits = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContractorId || !editCName.trim() || !editCSite.trim() || !editCFinalised) return;

    onEditContractor(selectedContractorId, {
      name: editCName.trim(),
      site: editCSite.trim(),
      amountFinalised: Number(editCFinalised),
      remarks: editCRemarks.trim(),
    });

    // Reset
    setContractorSubTab('Overview');
  };

  const handleStartEdit = () => {
    if (!selectedContractor) return;
    setEditCName(selectedContractor.name);
    setEditCSite(selectedContractor.site);
    setEditCFinalised(selectedContractor.amountFinalised.toString());
    setEditCRemarks(selectedContractor.remarks || '');
    setContractorSubTab('Manage');
  };

  return (
    <div className="space-y-4 pb-20 relative">
      {/* 1. CONTRACTORS LIST VIEW */}
      {!selectedContractorId ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-black text-gray-900 tracking-tight">Contractors Hub</h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Manage external project builders</p>
            </div>
            <button
              onClick={() => setIsAddContractorOpen(true)}
              className="flex items-center gap-1.5 h-10 px-4 rounded-full text-xs font-bold bg-[#1a56db] hover:bg-blue-700 text-white shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Contractor</span>
            </button>
          </div>

          {contractors.length === 0 ? (
            <EmptyState
              title="No contractors found"
              description="Register your first subcontractor to finalize milestones and record payments."
            />
          ) : (
            <div className="space-y-3">
              {contractors.map(c => {
                const paid = getContractorPaid(c.id);
                const due = getContractorDue(c);
                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedContractorId(c.id);
                      setContractorSubTab('Overview');
                    }}
                    className="p-4 bg-white hover:bg-gray-50/50 border border-gray-100 rounded-2xl shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer space-y-3 active:scale-[0.99]"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-extrabold text-sm text-gray-900">{c.name}</h4>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">
                          <Building className="w-3.5 h-3.5 text-gray-400" />
                          <span>{c.site}</span>
                        </div>
                      </div>
                      <div className="px-2.5 py-1 bg-blue-50 text-[#1a56db] rounded-lg text-[10px] font-bold uppercase">
                        Active
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-50">
                      <div className="text-center bg-gray-50/50 p-2 rounded-xl">
                        <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest">Finalised</span>
                        <span className="text-xs font-extrabold text-gray-800 mt-0.5 block">
                          {formatCurrency(c.amountFinalised)}
                        </span>
                      </div>
                      <div className="text-center bg-green-50/35 p-2 rounded-xl">
                        <span className="block text-[9px] font-bold text-green-600 uppercase tracking-widest">Paid</span>
                        <span className="text-xs font-extrabold text-green-700 mt-0.5 block">
                          {formatCurrency(paid)}
                        </span>
                      </div>
                      <div className="text-center bg-red-50/35 p-2 rounded-xl">
                        <span className="block text-[9px] font-bold text-red-500 uppercase tracking-widest">Due</span>
                        <span className="text-xs font-extrabold text-red-600 mt-0.5 block">
                          {formatCurrency(due)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* 2. DETAILED CONTRACTOR VIEW */
        selectedContractor && (
          <div className="space-y-4">
            {/* Top Back Action Bar */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedContractorId(null)}
                className="w-8 h-8 rounded-full border border-gray-100 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h3 className="font-black text-sm text-gray-900 leading-none">{selectedContractor.name}</h3>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 block">
                  Site: {selectedContractor.site}
                </span>
              </div>
            </div>

            {/* Segmented Contractor Sub Tabs */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {(['Overview', 'Ledger', 'Manage'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setContractorSubTab(tab)}
                  className={`flex-1 py-2 text-xs font-bold rounded-md transition-all cursor-pointer ${
                    contractorSubTab === tab
                      ? 'bg-white text-[#1a56db] shadow-xs'
                      : 'text-gray-500 hover:text-gray-950'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab: Overview */}
            {contractorSubTab === 'Overview' && (
              <div className="space-y-4">
                {/* Financial Summary Cards */}
                <div className="grid grid-cols-1 gap-3">
                  <div className="p-4 bg-white border border-gray-100 rounded-2xl flex items-center justify-between shadow-xs">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Total Finalised Amount</span>
                      <span className="text-xl font-black text-gray-900">
                        {formatCurrency(selectedContractor.amountFinalised)}
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#1a56db]">
                      <Briefcase className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="p-4 bg-white border border-gray-100 rounded-2xl flex items-center justify-between shadow-xs">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-green-600 uppercase tracking-widest block">Amount Paid So Far</span>
                      <span className="text-xl font-black text-green-700">
                        {formatCurrency(getContractorPaid(selectedContractor.id))}
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                      <Coins className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="p-4 bg-white border border-gray-100 rounded-2xl flex items-center justify-between shadow-xs">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-red-500 uppercase tracking-widest block">Remaining Amount Due</span>
                      <span className="text-xl font-black text-red-600">
                        {formatCurrency(getContractorDue(selectedContractor))}
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
                      <IndianRupee className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                {/* Info Card */}
                {selectedContractor.remarks && (
                  <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl space-y-1">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">Contract Details / Remarks</span>
                    <p className="text-xs text-gray-600 font-medium leading-relaxed">{selectedContractor.remarks}</p>
                  </div>
                )}

                {/* Primary Action Row */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsAddPaymentOpen(true)}
                    className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-95"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Record Payment</span>
                  </button>
                  <button
                    onClick={handleStartEdit}
                    className="px-5 h-12 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit Info</span>
                  </button>
                </div>
              </div>
            )}

            {/* Tab: Ledger (Payment History) */}
            {contractorSubTab === 'Ledger' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-extrabold text-sm text-gray-900">Payment History</h4>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Subcontractor balance ledger</p>
                  </div>
                  <button
                    onClick={() => setIsAddPaymentOpen(true)}
                    className="flex items-center gap-1.5 h-9 px-3 rounded-full text-[10px] font-bold bg-[#1a56db] text-white transition-all active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Record Payment</span>
                  </button>
                </div>

                {selectedPayments.length === 0 ? (
                  <EmptyState
                    title="No payments logged"
                    description="Payments recorded for Sharma Builders will show up in this ledger timeline."
                  />
                ) : (
                  <div className="space-y-2.5">
                    {selectedPayments.map(p => (
                      <div
                        key={p.id}
                        className="p-3 bg-white border border-gray-100 rounded-xl flex items-center justify-between"
                      >
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-md inline-block">
                            Paid {formatCurrency(p.amount)}
                          </span>
                          <p className="text-xs font-semibold text-gray-700">{p.remarks}</p>
                          <div className="flex items-center gap-1 text-[9px] font-bold text-gray-400">
                            <Calendar className="w-3 h-3" />
                            <span>{p.date}</span>
                          </div>
                        </div>

                        {/* 2-Click Payment deletion block */}
                        <div>
                          {confirmPaymentDeleteId === p.id ? (
                            <div className="flex gap-1 animate-fadeIn">
                              <button
                                onClick={() => {
                                  onDeletePayment(p.id);
                                  setConfirmPaymentDeleteId(null);
                                }}
                                className="px-2 py-1 bg-red-600 text-white rounded-md text-[9px] font-black uppercase tracking-wider cursor-pointer"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setConfirmPaymentDeleteId(null)}
                                className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-[9px] font-black uppercase tracking-wider cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmPaymentDeleteId(p.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete payment"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Manage (Edit / Delete Subcontractor) */}
            {contractorSubTab === 'Manage' && (
              <div className="space-y-5 bg-white border border-gray-100 p-5 rounded-2xl">
                <h4 className="font-extrabold text-sm text-gray-900 border-b border-gray-50 pb-2.5">Edit Subcontractor Profile</h4>
                
                <form onSubmit={handleSaveContractorEdits} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Contractor / Firm Name</label>
                    <input
                      type="text"
                      value={editCName}
                      onChange={(e) => setEditCName(e.target.value)}
                      required
                      className="w-full h-11 px-3 bg-gray-50/50 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-[#1a56db]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Site Location</label>
                    <input
                      type="text"
                      value={editCSite}
                      onChange={(e) => setEditCSite(e.target.value)}
                      required
                      className="w-full h-11 px-3 bg-gray-50/50 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-[#1a56db]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Finalised Contract Value (₹)</label>
                    <input
                      type="number"
                      value={editCFinalised}
                      onChange={(e) => setEditCFinalised(e.target.value)}
                      required
                      className="w-full h-11 px-3 bg-gray-50/50 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-[#1a56db]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Scope / Remarks</label>
                    <textarea
                      value={editCRemarks}
                      onChange={(e) => setEditCRemarks(e.target.value)}
                      rows={2}
                      className="w-full p-3 bg-gray-50/50 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-[#1a56db]"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      className="flex-1 h-11 bg-[#1a56db] hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setContractorSubTab('Overview')}
                      className="px-4 h-11 bg-gray-100 text-gray-600 font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>

                {/* 2-Click Delete Contractor */}
                <div className="pt-4 border-t border-red-50 space-y-3">
                  <h5 className="text-xs font-bold text-red-600">Danger Zone</h5>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    Removing this contractor will permanently delete their ledger balances and payment transactions. This action cannot be undone.
                  </p>

                  {confirmDeleteId === selectedContractor.id ? (
                    <div className="flex gap-2 animate-fadeIn">
                      <button
                        onClick={() => {
                          onDeleteContractor(selectedContractor.id);
                          setSelectedContractorId(null);
                          setConfirmDeleteId(null);
                        }}
                        className="flex-1 h-11 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        Yes, Permanently Delete
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-4 h-11 bg-gray-100 text-gray-600 font-bold text-xs rounded-xl cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(selectedContractor.id)}
                      className="w-full h-11 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      Delete Contractor
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      )}

      {/* MODAL: ADD CONTRACTOR */}
      {isAddContractorOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-extrabold text-sm text-gray-900">Add New Contractor</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Register milestone parameters</p>
              </div>
              <button
                onClick={() => setIsAddContractorOpen(false)}
                className="w-7 h-7 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-full flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateContractor} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Contractor / Agency Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sharma Civil Builders"
                  value={newCName}
                  onChange={(e) => setNewCName(e.target.value)}
                  required
                  className="w-full h-11 px-3 bg-gray-50/50 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-[#1a56db]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Site Location</label>
                <input
                  type="text"
                  placeholder="e.g. Sector 62 Office"
                  value={newCSite}
                  onChange={(e) => setNewCSite(e.target.value)}
                  required
                  className="w-full h-11 px-3 bg-gray-50/50 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-[#1a56db]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Finalised Budget (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 500000"
                  value={newCFinalised}
                  onChange={(e) => setNewCFinalised(e.target.value)}
                  required
                  className="w-full h-11 px-3 bg-gray-50/50 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-[#1a56db]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Contract Details / Scope</label>
                <textarea
                  placeholder="e.g. Framing, drywall installation, and plumbing milestone finalized budget."
                  value={newCRemarks}
                  onChange={(e) => setNewCRemarks(e.target.value)}
                  rows={2}
                  className="w-full p-3 bg-gray-50/50 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-[#1a56db]"
                />
              </div>

              <button
                type="submit"
                className="w-full h-11 bg-[#1a56db] text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
              >
                Register Subcontractor
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD PAYMENT */}
      {isAddPaymentOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-extrabold text-sm text-gray-900">Record Payment</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Submit transaction voucher</p>
              </div>
              <button
                onClick={() => setIsAddPaymentOpen(false)}
                className="w-7 h-7 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-full flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePayment} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Payment Amount (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 50000"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  required
                  className="w-full h-11 px-3 bg-gray-50/50 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-[#1a56db]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Payment Date</label>
                <input
                  type="date"
                  value={payDate}
                  onChange={(e) => setPayDate(e.target.value)}
                  required
                  className="w-full h-11 px-3 bg-gray-50/50 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-[#1a56db] cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Payment Details / Remark</label>
                <input
                  type="text"
                  placeholder="e.g. Milestone 1 foundation concrete poured"
                  value={payRemarks}
                  onChange={(e) => setPayRemarks(e.target.value)}
                  required
                  className="w-full h-11 px-3 bg-gray-50/50 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-[#1a56db]"
                />
              </div>

              <button
                type="submit"
                className="w-full h-11 bg-green-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
              >
                Log Payment Voucher
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
