import { useState, FormEvent } from 'react';
import { Worker, Transaction, Expense } from '../types';
import { ChevronDown, ChevronUp, Plus, X, Calendar, Wallet, CheckCircle2, FileText, Landmark } from 'lucide-react';
import EmptyState from './EmptyState';

interface ExpenseSettlementScreenProps {
  workers: Worker[];
  transactions: Transaction[];
  expenses: Expense[];
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  selectedWorkerId: string;
  setSelectedWorkerId: (workerId: string) => void;
}

export default function ExpenseSettlementScreen({
  workers,
  transactions,
  expenses,
  onAddExpense,
  selectedWorkerId,
  setSelectedWorkerId,
}: ExpenseSettlementScreenProps) {
  // Select state for active accordion cards
  const [expandedTxId, setExpandedTxId] = useState<string | null>(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetTxId, setTargetTxId] = useState<string>('');
  const [formExpenseName, setFormExpenseName] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formDate, setFormDate] = useState('');

  // Handle open add expense modal
  const handleOpenAddExpense = (txId: string) => {
    setTargetTxId(txId);
    setFormExpenseName('');
    setFormAmount('');
    
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    setFormDate(`${yyyy}-${mm}-${dd}`);
    
    setIsModalOpen(true);
  };

  const handleAddExpenseSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formExpenseName.trim() || !formAmount || Number(formAmount) <= 0) {
      alert('Please fill out a valid Expense Name and Amount.');
      return;
    }

    onAddExpense({
      transactionId: targetTxId,
      name: formExpenseName.trim(),
      amount: Number(formAmount),
      date: formDate,
    });

    setIsModalOpen(false);
  };

  // Switch expanded state
  const toggleExpanded = (txId: string) => {
    setExpandedTxId(expandedTxId === txId ? null : txId);
  };

  // If no worker is chosen initially, choose the first active worker or first worker in the list
  const activeWorkers = workers.filter(w => w.status === 'Active');
  const chosenWorkerId = selectedWorkerId === 'All' || !selectedWorkerId 
    ? (activeWorkers.length > 0 ? activeWorkers[0].id : '')
    : selectedWorkerId;

  // Selected worker details
  const selectedWorker = workers.find(w => w.id === chosenWorkerId);

  // Filter site expense transactions for the chosen worker
  const siteExpenseTransactions = transactions
    .filter(t => t.workerId === chosenWorkerId && t.type === 'Site Expense')
    .sort((a, b) => b.date.localeCompare(a.date));

  // Compute total running balance for this worker (Site Expense Cash - reported Expenses)
  const getWorkerStats = () => {
    if (!chosenWorkerId) return { totalGiven: 0, totalSpent: 0, runningBalance: 0 };
    
    const txs = transactions.filter(t => t.workerId === chosenWorkerId && t.type === 'Site Expense');
    let totalGiven = 0;
    let totalSpent = 0;

    txs.forEach(t => {
      totalGiven += t.amount;
      const txExpenses = expenses.filter(e => e.transactionId === t.id);
      txExpenses.forEach(e => {
        totalSpent += e.amount;
      });
    });

    return {
      totalGiven,
      totalSpent,
      runningBalance: totalGiven - totalSpent,
    };
  };

  const { totalGiven, totalSpent, runningBalance } = getWorkerStats();

  // Helper to format date
  const formatDateString = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Get expenses list for a specific transaction
  const getExpensesForTx = (txId: string) => {
    return expenses.filter(e => e.transactionId === txId);
  };

  // Get total spent for a specific transaction
  const getSpentForTx = (txId: string) => {
    const txExps = getExpensesForTx(txId);
    return txExps.reduce((acc, curr) => acc + curr.amount, 0);
  };

  return (
    <div className="space-y-4 pb-20 relative">
      {/* Contextual Selector & Heading */}
      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Select Worker</label>
          <select
            value={chosenWorkerId}
            onChange={(e) => {
              setSelectedWorkerId(e.target.value);
              setExpandedTxId(null); // Reset accordion
            }}
            className="w-full h-12 px-4 bg-white rounded-xl border border-gray-200 text-sm font-semibold text-gray-800 focus:outline-none focus:border-[#1a56db] focus:ring-1 focus:ring-[#1a56db] shadow-xs cursor-pointer"
          >
            {workers.map(w => (
              <option key={w.id} value={w.id}>
                {w.name} ({w.designation})
              </option>
            ))}
          </select>
        </div>

        {selectedWorker && (
          <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 shadow-xs">
            {/* Left side info */}
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-[#1a56db]/10 text-[#1a56db] flex items-center justify-center font-bold text-sm">
                {selectedWorker.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">{selectedWorker.name}</h4>
                <p className="text-[10px] text-gray-400 font-medium">
                  {selectedWorker.designation} • Joined {formatDateString(selectedWorker.joiningDate)}
                </p>
              </div>
            </div>

            {/* Running Balance Chip */}
            <div
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-bold shadow-xs ${
                runningBalance >= 0
                  ? 'bg-emerald-50 text-[#047857] border-emerald-100'
                  : 'bg-red-50 text-[#dc2626] border-red-100'
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>
                {runningBalance >= 0 
                  ? `Rs. ${runningBalance} Held`
                  : `Company owes Rs. ${Math.abs(runningBalance)}`
                }
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Accordion List of Site Expense Transactions */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Cash Given & Reported bills</h3>
        
        {siteExpenseTransactions.length === 0 ? (
          <div className="p-8 bg-white rounded-xl border border-dashed border-gray-200 text-center space-y-2">
            <Landmark className="w-10 h-10 text-gray-300 mx-auto" />
            <h4 className="text-sm font-bold text-gray-800">No Cash Given Yet</h4>
            <p className="text-xs text-gray-400 max-w-[220px] mx-auto">
              This worker has not been given any cash for site expenses yet. Log a <strong>Site Expense</strong> transaction in the <strong>Money</strong> tab.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {siteExpenseTransactions.map(tx => {
              const txExpenses = getExpensesForTx(tx.id);
              const spent = getSpentForTx(tx.id);
              const remaining = tx.amount - spent;
              const isSettled = remaining <= 0;
              const isExpanded = expandedTxId === tx.id;

              return (
                <div
                  key={tx.id}
                  className={`bg-white rounded-xl border overflow-hidden transition-all shadow-xs ${
                    isExpanded ? 'border-gray-200 shadow-sm' : 'border-gray-100'
                  }`}
                >
                  {/* Card Header (Clickable Summary) */}
                  <div
                    onClick={() => toggleExpanded(tx.id)}
                    className="p-4 flex justify-between items-start bg-gray-50/40 hover:bg-gray-50/80 cursor-pointer select-none transition-all"
                  >
                    <div className="space-y-1">
                      <span className="block text-xs font-bold text-gray-400">Cash Given</span>
                      <h4 className="text-base font-extrabold text-gray-900">Rs. {tx.amount}</h4>
                      <p className="text-[10px] text-gray-400 font-semibold">
                        {formatDateString(tx.date)} • {tx.remarks || 'Site Materials'}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {isSettled ? (
                        <span className="flex items-center gap-1 bg-emerald-50 text-[#047857] border border-emerald-100/50 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Settled</span>
                        </span>
                      ) : (
                        <span className="bg-amber-50 text-amber-700 border border-amber-100/50 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                          Partially Settled
                        </span>
                      )}

                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Content (Detailed Expenses) */}
                  {isExpanded && (
                    <div className="p-4 border-t border-gray-100 space-y-4 bg-white animate-fadeIn">
                      <div className="space-y-2">
                        <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          Reported Expenses ({txExpenses.length})
                        </h5>

                        {txExpenses.length === 0 ? (
                          <p className="text-xs text-gray-400 italic">No itemized expenses reported yet.</p>
                        ) : (
                          <div className="space-y-1.5">
                            {txExpenses.map(exp => (
                              <div
                                key={exp.id}
                                className="flex justify-between items-center py-2 px-3 bg-gray-50/50 rounded-lg text-xs"
                              >
                                <div className="space-y-0.5">
                                  <span className="font-bold text-gray-800">{exp.name}</span>
                                  <span className="block text-[9px] text-gray-400">
                                    {formatDateString(exp.date)}
                                  </span>
                                </div>
                                <span className="font-extrabold text-gray-900">Rs. {exp.amount}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Remaining section and Add button */}
                      <div className="pt-3 border-t border-gray-50 flex items-center justify-between gap-3 flex-wrap">
                        <div className="space-y-0.5">
                          <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            Remaining to settle
                          </span>
                          <span className={`text-sm font-extrabold ${remaining > 0 ? 'text-[#1a56db]' : 'text-[#047857]'}`}>
                            Rs. {remaining}
                          </span>
                        </div>

                        {!isSettled && (
                          <button
                            onClick={() => handleOpenAddExpense(tx.id)}
                            className="h-10 px-4 bg-white border border-[#1a56db] text-[#1a56db] hover:bg-blue-50 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Add Expense</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
          <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto shadow-xl flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <h3 className="text-base font-extrabold text-gray-900">Add Itemized Expense</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-900 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddExpenseSubmit} className="p-4 space-y-4 flex-1">
              {/* Expense name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Expense Item / Bill Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nails, Cement purchase, Glue, Transport"
                  value={formExpenseName}
                  onChange={(e) => setFormExpenseName(e.target.value)}
                  className="w-full h-12 px-4 rounded-lg border border-gray-200 text-sm font-medium focus:outline-none focus:border-[#1a56db]"
                />
              </div>

              {/* Amount */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Amount Spent</label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min={1}
                    placeholder="Enter amount"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="w-full h-12 pl-12 pr-4 rounded-lg border border-gray-200 text-sm font-semibold focus:outline-none focus:border-[#1a56db]"
                  />
                  <span className="absolute left-4 top-3.5 text-xs font-bold text-gray-400">Rs.</span>
                </div>
              </div>

              {/* Date */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Expense Date</label>
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

              {/* Submit */}
              <button
                type="submit"
                className="w-full h-12 bg-[#047857] hover:bg-[#047857]/90 text-white font-bold text-sm rounded-lg shadow-sm transition-all active:scale-98 cursor-pointer flex items-center justify-center"
              >
                Log Itemized Expense
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
