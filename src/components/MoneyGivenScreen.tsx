import { useState, FormEvent } from 'react';
import { Worker, Transaction, TransactionType, Expense } from '../types';
import { Plus, X, Calendar, MessageSquare, ArrowDownRight, User, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import EmptyState from './EmptyState';

interface MoneyGivenScreenProps {
  workers: Worker[];
  transactions: Transaction[];
  expenses: Expense[];
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
}

export default function MoneyGivenScreen({
  workers,
  transactions,
  expenses,
  onAddTransaction,
}: MoneyGivenScreenProps) {
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('All');
  const [filterDate, setFilterDate] = useState<string>('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formWorkerId, setFormWorkerId] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formType, setFormType] = useState<TransactionType>('Salary Advance');
  const [formRemarks, setFormRemarks] = useState('');

  // Handle open add modal
  const handleOpenAdd = () => {
    // Default to first worker if available
    const activeWorkers = workers.filter(w => w.status === 'Active');
    setFormWorkerId(activeWorkers.length > 0 ? activeWorkers[0].id : '');
    
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    setFormDate(`${yyyy}-${mm}-${dd}`);
    
    setFormAmount('');
    setFormType('Salary Advance');
    setFormRemarks('');
    setIsModalOpen(true);
  };

  // Submit transaction
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formWorkerId || !formAmount || Number(formAmount) <= 0) {
      alert('Please choose a worker and enter a valid amount.');
      return;
    }

    onAddTransaction({
      workerId: formWorkerId,
      date: formDate,
      amount: Number(formAmount),
      type: formType,
      remarks: formRemarks.trim(),
    });

    setIsModalOpen(false);
  };

  // Filter transactions
  const filteredTransactions = transactions
    .filter(t => {
      const matchesWorker = selectedWorkerId === 'All' ? true : t.workerId === selectedWorkerId;
      const matchesDate = !filterDate ? true : t.date === filterDate;
      return matchesWorker && matchesDate;
    })
    .sort((a, b) => b.date.localeCompare(a.date)); // Sort latest first

  // Helper to format date
  const formatDateString = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getWorkerName = (id: string) => {
    const worker = workers.find(w => w.id === id);
    return worker ? worker.name : 'Unknown Worker';
  };

  // Calculate settlement stats for a Site Expense transaction
  const getSettlementDetails = (txId: string, totalAmount: number) => {
    const txExpenses = expenses.filter(e => e.transactionId === txId);
    const totalSpent = txExpenses.reduce((sum, e) => sum + e.amount, 0);
    const remaining = totalAmount - totalSpent;

    if (totalSpent === 0) {
      return {
        label: 'Unsettled',
        style: 'bg-red-50 text-[#dc2626] border-red-100',
        icon: <HelpCircle className="w-3 h-3 inline mr-1" />,
        text: `Rs. ${totalAmount} remaining`,
      };
    } else if (remaining <= 0) {
      return {
        label: 'Fully Settled',
        style: 'bg-emerald-50 text-[#047857] border-emerald-100',
        icon: <CheckCircle2 className="w-3 h-3 inline mr-1" />,
        text: 'All bills reported',
      };
    } else {
      return {
        label: 'Partially Settled',
        style: 'bg-amber-50 text-amber-700 border-amber-100',
        icon: <AlertCircle className="w-3 h-3 inline mr-1" />,
        text: `Rs. ${remaining} outstanding`,
      };
    }
  };

  return (
    <div className="space-y-4 pb-20 relative">
      {/* Filters Row: Worker & Date */}
      <div className="grid grid-cols-2 gap-3">
        {/* Filter by Worker */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Filter by Worker</label>
          <div className="relative">
            <select
              value={selectedWorkerId}
              onChange={(e) => setSelectedWorkerId(e.target.value)}
              className="w-full h-12 pl-3 pr-8 bg-white rounded-xl border border-gray-200 text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#1a56db] focus:ring-1 focus:ring-[#1a56db] shadow-xs appearance-none cursor-pointer"
            >
              <option value="All">All Workers</option>
              {workers.map(w => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-gray-500">
              <User className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Filter by Date */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Filter by Date</label>
          <div className="relative">
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full h-12 px-3 bg-white rounded-xl border border-gray-200 text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#1a56db] focus:ring-1 focus:ring-[#1a56db] shadow-xs cursor-pointer"
            />
            {filterDate && (
              <button
                type="button"
                onClick={() => setFilterDate('')}
                className="absolute right-2.5 top-3.5 p-0.5 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 cursor-pointer"
                title="Clear date filter"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Transaction list */}
      {filteredTransactions.length === 0 ? (
        <EmptyState
          title="No Transactions Registered"
          description="Click '+' below to log money given to workers (salary advances, site expenses, etc.)."
          actionLabel="Log First Advance"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="space-y-3">
          {filteredTransactions.map(tx => (
            <div
              key={tx.id}
              className="p-4 bg-white rounded-xl border border-gray-100 shadow-xs flex flex-col gap-2.5 hover:border-gray-200 transition-all active:scale-99 cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400">{formatDateString(tx.date)}</span>
                    <span className="text-xs text-gray-300">•</span>
                    <span className="text-xs font-bold text-gray-600">{getWorkerName(tx.workerId)}</span>
                  </div>
                  
                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border ${
                        tx.type === 'Salary Advance'
                          ? 'bg-blue-50 text-[#1a56db] border-blue-100'
                          : tx.type === 'Site Expense'
                          ? 'bg-amber-50 text-amber-700 border-amber-100'
                          : 'bg-gray-50 text-gray-500 border-gray-100'
                      }`}
                    >
                      {tx.type}
                    </span>
                    {tx.type === 'Site Expense' && (() => {
                      const settlement = getSettlementDetails(tx.id, tx.amount);
                      return (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border ${settlement.style}`}>
                          {settlement.icon}
                          {settlement.label} ({settlement.text})
                        </span>
                      );
                    })()}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-base font-extrabold text-[#dc2626] flex items-center justify-end gap-1">
                    <ArrowDownRight className="w-4 h-4" />
                    <span>Rs. {tx.amount}</span>
                  </span>
                </div>
              </div>

              {tx.remarks && (
                <div className="pt-2 border-t border-gray-50 flex items-start gap-1.5 text-xs text-gray-500 leading-relaxed">
                  <MessageSquare className="w-3.5 h-3.5 text-gray-300 mt-0.5 shrink-0" />
                  <span>{tx.remarks}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Floating Plus button */}
      <button
        onClick={handleOpenAdd}
        className="fixed bottom-20 right-4 w-14 h-14 bg-[#1a56db] hover:bg-[#1a56db]/90 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer z-40"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Add Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
          <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto shadow-xl flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <h3 className="text-base font-extrabold text-gray-900">Log Money Given</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-900 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-4 space-y-4 flex-1">
              {/* Select Worker */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Select Worker</label>
                <select
                  required
                  value={formWorkerId}
                  onChange={(e) => setFormWorkerId(e.target.value)}
                  className="w-full h-12 px-3 rounded-lg border border-gray-200 text-sm font-medium focus:outline-none focus:border-[#1a56db]"
                >
                  <option value="" disabled>-- Choose Worker --</option>
                  {workers
                    .filter(w => w.status === 'Active')
                    .map(w => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.designation})
                      </option>
                    ))}
                </select>
              </div>

              {/* Amount large number input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Amount Given</label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min={1}
                    placeholder="Enter amount given"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="w-full h-14 pl-12 pr-4 bg-gray-50/50 rounded-lg border border-gray-200 text-lg font-black focus:outline-none focus:bg-white focus:border-[#1a56db] text-[#dc2626]"
                  />
                  <span className="absolute left-4 top-4.5 text-sm font-black text-gray-400">Rs.</span>
                </div>
              </div>

              {/* Transaction Type - 3 Big Toggle Buttons */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Payment Type</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormType('Salary Advance')}
                    className={`h-12 rounded-lg font-bold text-[10px] border flex items-center justify-center text-center transition-all cursor-pointer ${
                      formType === 'Salary Advance'
                        ? 'bg-[#1a56db] border-[#1a56db] text-white shadow-xs'
                        : 'bg-white border-gray-200 text-[#1a56db] hover:bg-blue-50/30'
                    }`}
                  >
                    Salary Advance
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormType('Site Expense')}
                    className={`h-12 rounded-lg font-bold text-[10px] border flex items-center justify-center text-center transition-all cursor-pointer ${
                      formType === 'Site Expense'
                        ? 'bg-amber-500 border-amber-500 text-white shadow-xs'
                        : 'bg-white border-gray-200 text-amber-600 hover:bg-amber-50/30'
                    }`}
                  >
                    Site Expense
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormType('Other')}
                    className={`h-12 rounded-lg font-bold text-[10px] border flex items-center justify-center text-center transition-all cursor-pointer ${
                      formType === 'Other'
                        ? 'bg-gray-600 border-gray-600 text-white shadow-xs'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Other
                  </button>
                </div>
              </div>

              {/* Date selection */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Transaction Date</label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full h-12 pl-10 pr-4 rounded-lg border border-gray-200 text-sm font-medium focus:outline-none focus:border-[#1a56db]"
                  />
                  <Calendar className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Remarks */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Remarks / Purpose</label>
                <textarea
                  placeholder="e.g. Cement purchase, monthly advance, etc."
                  value={formRemarks}
                  onChange={(e) => setFormRemarks(e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-200 text-sm font-medium focus:outline-none focus:border-[#1a56db] h-20 resize-none"
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="w-full h-12 bg-[#1a56db] hover:bg-[#1a56db]/90 text-white font-bold text-sm rounded-lg shadow-sm transition-all active:scale-98 cursor-pointer flex items-center justify-center"
              >
                Log Payment
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
