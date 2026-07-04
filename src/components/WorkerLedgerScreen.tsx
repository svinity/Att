import { useState } from 'react';
import { Worker, Attendance, Transaction, Expense } from '../types';
import { getWorkerLedgerBalance, getWorkerExpenseBalance } from '../utils/storage';
import { User, Coins, Receipt, ArrowRight, ArrowDownRight, History, Calendar, HelpCircle, X } from 'lucide-react';
import EmptyState from './EmptyState';

interface WorkerLedgerScreenProps {
  workers: Worker[];
  attendance: Attendance[];
  transactions: Transaction[];
  expenses: Expense[];
  selectedWorkerId: string;
  setSelectedWorkerId: (workerId: string) => void;
}

interface LedgerItem {
  id: string;
  date: string;
  type: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'TRANSACTION' | 'EXPENSE';
  title: string;
  subtitle?: string;
  amountText: string;
  amountColorClass: string;
}

const getDaysInMonth = (dateStr: string): number => {
  const parts = dateStr.split('-');
  if (parts.length < 2) return 30; // fallback
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  return new Date(year, month, 0).getDate();
};

export default function WorkerLedgerScreen({
  workers,
  attendance,
  transactions,
  expenses,
  selectedWorkerId,
  setSelectedWorkerId,
}: WorkerLedgerScreenProps) {
  const [filterMonth, setFilterMonth] = useState<string>('');

  // If no worker is chosen initially, choose the first active worker or first worker in the list
  const activeWorkers = workers.filter(w => w.status === 'Active');
  const chosenWorkerId = selectedWorkerId === 'All' || !selectedWorkerId
    ? (activeWorkers.length > 0 ? activeWorkers[0].id : '')
    : selectedWorkerId;

  const selectedWorker = workers.find(w => w.id === chosenWorkerId);

  const getLedgerItems = (): LedgerItem[] => {
    if (!selectedWorker) return [];

    const items: LedgerItem[] = [];

    // 1. Attendance Records
    const workerAttendance = attendance.filter(a => a.workerId === chosenWorkerId);
    workerAttendance.forEach(a => {
      let amountText = 'Rs. 0';
      let title = 'Absent';
      let amountColorClass = 'text-gray-400';

      const daysInMonth = getDaysInMonth(a.date);
      const calculatedDailyWage = Math.round(selectedWorker.monthlySalary / daysInMonth);

      if (a.status === 'PRESENT') {
        amountText = `+ Rs. ${calculatedDailyWage}`;
        title = 'Present';
        amountColorClass = 'text-[#047857] font-extrabold';
      } else if (a.status === 'HALF_DAY') {
        amountText = `+ Rs. ${Math.round(calculatedDailyWage * 0.5)}`;
        title = 'Half Day';
        amountColorClass = 'text-amber-600 font-extrabold';
      } else if (a.status === 'ABSENT') {
        amountText = 'Rs. 0';
        title = 'Absent';
        amountColorClass = 'text-[#dc2626]';
      }

      items.push({
        id: `att-item-${a.id}`,
        date: a.date,
        type: a.status,
        title,
        subtitle: 'Attendance logged',
        amountText,
        amountColorClass,
      });
    });

    // 2. Transactions (Money Given)
    const workerTxs = transactions.filter(t => t.workerId === chosenWorkerId);
    workerTxs.forEach(t => {
      items.push({
        id: `tx-item-${t.id}`,
        date: t.date,
        type: 'TRANSACTION',
        title: t.type,
        subtitle: t.remarks || 'Advance / Site Expense',
        amountText: `- Rs. ${t.amount}`,
        amountColorClass: 'text-[#dc2626] font-extrabold',
      });
    });

    // 3. Expenses (Reported site expenses)
    // First, find all site expense transaction IDs for this worker
    const siteTxIds = workerTxs.filter(t => t.type === 'Site Expense').map(t => t.id);
    const workerExpenses = expenses.filter(e => siteTxIds.includes(e.transactionId));
    workerExpenses.forEach(e => {
      items.push({
        id: `exp-item-${e.id}`,
        date: e.date,
        type: 'EXPENSE',
        title: `Site Expense (${e.name})`,
        subtitle: 'Reported expense bill',
        amountText: `Rs. ${e.amount}`,
        amountColorClass: 'text-gray-500 font-semibold',
      });
    });

    // Filter by month if specified
    let filtered = items;
    if (filterMonth) {
      filtered = items.filter(item => item.date.startsWith(filterMonth));
    }

    // Sort items chronologically descending
    return filtered.sort((a, b) => b.date.localeCompare(a.date));
  };

  const getPayrollBreakdown = () => {
    if (!selectedWorker) return { wagesEarned: 0, advancesTaken: 0, netBalance: 0 };

    let wagesEarned = 0;
    let workerAttendance = attendance.filter(a => a.workerId === chosenWorkerId);
    if (filterMonth) {
      workerAttendance = workerAttendance.filter(a => a.date.startsWith(filterMonth));
    }
    workerAttendance.forEach(a => {
      const daysInMonth = getDaysInMonth(a.date);
      const calculatedDailyWage = selectedWorker.monthlySalary / daysInMonth;

      if (a.status === 'PRESENT') {
        wagesEarned += calculatedDailyWage;
      } else if (a.status === 'HALF_DAY') {
        wagesEarned += calculatedDailyWage * 0.5;
      }
    });

    let advancesTaken = 0;
    let workerTxs = transactions.filter(t => t.workerId === chosenWorkerId);
    if (filterMonth) {
      workerTxs = workerTxs.filter(t => t.date.startsWith(filterMonth));
    }
    workerTxs.forEach(t => {
      if (t.type === 'Salary Advance' || t.type === 'Other') {
        advancesTaken += t.amount;
      }
    });

    return {
      wagesEarned: Math.round(wagesEarned),
      advancesTaken,
      netBalance: Math.round(wagesEarned) - advancesTaken,
    };
  };

  const getSiteExpensesBreakdown = () => {
    if (!selectedWorker) return { cashIssued: 0, billsReported: 0, cashHeld: 0 };

    let cashIssued = 0;
    let workerTxs = transactions.filter(t => t.workerId === chosenWorkerId);
    if (filterMonth) {
      workerTxs = workerTxs.filter(t => t.date.startsWith(filterMonth));
    }
    const siteTxs = workerTxs.filter(t => t.type === 'Site Expense');
    siteTxs.forEach(t => {
      cashIssued += t.amount;
    });

    let billsReported = 0;
    const siteTxIds = siteTxs.map(t => t.id);
    let workerExpenses = expenses.filter(e => siteTxIds.includes(e.transactionId));
    if (filterMonth) {
      workerExpenses = workerExpenses.filter(e => e.date.startsWith(filterMonth));
    }
    workerExpenses.forEach(e => {
      billsReported += e.amount;
    });

    return {
      cashIssued,
      billsReported,
      cashHeld: cashIssued - billsReported,
    };
  };

  const { wagesEarned, advancesTaken, netBalance } = getPayrollBreakdown();
  const { cashIssued, billsReported, cashHeld } = getSiteExpensesBreakdown();

  const ledgerItems = getLedgerItems();

  const ledgerBalance = chosenWorkerId ? getWorkerLedgerBalance(chosenWorkerId) : 0;
  const expenseBalance = chosenWorkerId ? getWorkerExpenseBalance(chosenWorkerId) : 0;

  // Helper to format date
  const formatDateString = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="space-y-5 pb-20 relative animate-fadeIn">
      {/* Header and Worker Selector */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Select Worker</label>
            <select
              value={chosenWorkerId}
              onChange={(e) => setSelectedWorkerId(e.target.value)}
              className="w-full h-12 px-3 bg-white rounded-xl border border-gray-200 text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#1a56db] focus:ring-1 focus:ring-[#1a56db] shadow-xs cursor-pointer"
            >
              {workers.map(w => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Filter by Month</label>
            <div className="relative">
              <input
                type="month"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="w-full h-12 px-3 bg-white rounded-xl border border-gray-200 text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#1a56db] focus:ring-1 focus:ring-[#1a56db] shadow-xs cursor-pointer"
              />
              {filterMonth && (
                <button
                  type="button"
                  onClick={() => setFilterMonth('')}
                  className="absolute right-2.5 top-3.5 p-0.5 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 cursor-pointer"
                  title="Clear month filter"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {selectedWorker && (
          <div className="space-y-3">
            {/* Card 1: Clear Personal Salary & Advance Ledger */}
            <div className="bg-white rounded-2xl border border-blue-100 shadow-xs overflow-hidden">
              <div className="p-3 bg-blue-50/50 border-b border-blue-100 flex justify-between items-center">
                <span className="text-xs font-black text-[#1a56db] uppercase tracking-wider">
                  Personal Salary & Advance Ledger
                </span>
                <span className="text-[10px] font-bold text-gray-400 bg-white px-2 py-0.5 rounded border">
                  Payroll Profile
                </span>
              </div>
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3 pb-3 border-b border-gray-50 text-xs">
                  <div>
                    <span className="text-gray-400 font-medium block">Monthly Base Salary</span>
                    <span className="font-extrabold text-gray-800">Rs. {selectedWorker.monthlySalary}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-medium block">Daily Wage Rate</span>
                    <span className="font-extrabold text-gray-800">Rs. {selectedWorker.dailyWage} / day</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-gray-600 font-medium">
                    <span>Wages Earned (from Attendance logs)</span>
                    <span className="font-bold text-[#047857]">+ Rs. {wagesEarned}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 font-medium">
                    <span>Personal Advances Given</span>
                    <span className="font-bold text-[#dc2626]">- Rs. {advancesTaken}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-900">Net Outstanding Balance</span>
                  <span className={`text-base font-black ${netBalance >= 0 ? 'text-[#047857]' : 'text-[#dc2626]'}`}>
                    {netBalance >= 0 ? `Company owes Rs. ${netBalance}` : `Worker holds Rs. ${Math.abs(netBalance)} advance`}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Dedicated Site Expense Cash Hub */}
            <div className="bg-white rounded-2xl border border-amber-100 shadow-xs overflow-hidden">
              <div className="p-3 bg-amber-50/40 border-b border-amber-100 flex justify-between items-center">
                <span className="text-xs font-black text-amber-800 uppercase tracking-wider">
                  Site Materials Expense Cash Balance
                </span>
                <span className="text-[10px] font-bold text-gray-400 bg-white px-2 py-0.5 rounded border">
                  Material Cash
                </span>
              </div>
              <div className="p-4 space-y-3">
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-gray-600 font-medium">
                    <span>Total Site Cash Given to Worker</span>
                    <span className="font-bold text-gray-700">Rs. {cashIssued}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 font-medium">
                    <span>Itemized Bills Reported (Settled)</span>
                    <span className="font-bold text-emerald-600">- Rs. {billsReported}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-900">Remaining Site Cash Held</span>
                  <span className={`text-base font-black ${cashHeld > 0 ? 'text-amber-600' : 'text-emerald-700'}`}>
                    {cashHeld > 0 ? `Rs. ${cashHeld} Held` : `Fully Settled (Rs. 0)`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Timeline Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Chronological vertical timeline</h3>
        
        {ledgerItems.length === 0 ? (
          <EmptyState
            title="No Ledger History"
            description="Attendance entries, payment advances, and site expenses will compile automatically here."
          />
        ) : (
          <div className="relative pl-[28px] space-y-4">
            {/* Vertical timeline line */}
            <div className="absolute left-[9px] top-4 bottom-4 w-[2px] bg-gray-200"></div>

            {ledgerItems.map(item => {
              // Decide dot styling / icon
              let dotElement = null;

              if (item.type === 'PRESENT') {
                dotElement = (
                  <div className="absolute left-[-28px] top-4 w-5 h-5 rounded-full bg-white border-2 border-emerald-500 flex items-center justify-center z-10">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#047857]"></div>
                  </div>
                );
              } else if (item.type === 'HALF_DAY') {
                dotElement = (
                  <div className="absolute left-[-28px] top-4 w-5 h-5 rounded-full bg-white border-2 border-amber-400 flex items-center justify-center z-10">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                  </div>
                );
              } else if (item.type === 'ABSENT') {
                dotElement = (
                  <div className="absolute left-[-28px] top-4 w-5 h-5 rounded-full bg-white border-2 border-red-500 flex items-center justify-center z-10">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#dc2626]"></div>
                  </div>
                );
              } else if (item.type === 'TRANSACTION') {
                dotElement = (
                  <div className="absolute left-[-28px] top-3.5 w-5 h-5 rounded-full bg-white border-2 border-blue-500 flex items-center justify-center z-10 text-blue-500">
                    <Coins className="w-3 h-3 stroke-[2.5]" />
                  </div>
                );
              } else if (item.type === 'EXPENSE') {
                dotElement = (
                  <div className="absolute left-[-28px] top-3.5 w-5 h-5 rounded-full bg-white border-2 border-orange-500 flex items-center justify-center z-10 text-orange-500">
                    <Receipt className="w-3 h-3 stroke-[2.5]" />
                  </div>
                );
              }

              return (
                <div key={item.id} className="relative flex flex-col gap-1 select-none">
                  {/* Left dot */}
                  {dotElement}

                  {/* Card container */}
                  <div className="flex items-center justify-between p-3.5 bg-white border border-gray-100 rounded-xl shadow-xs hover:border-gray-200 transition-all active:scale-99 cursor-pointer">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDateString(item.date)}</span>
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-gray-900 leading-tight">{item.title}</h4>
                      {item.subtitle && (
                        <p className="text-[10px] text-gray-400 font-medium">{item.subtitle}</p>
                      )}
                    </div>

                    <div className="text-right">
                      <span className={`text-xs ${item.amountColorClass}`}>
                        {item.amountText}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* End of ledger list indicator */}
            <div className="text-center pt-2 select-none">
              <span className="inline-block px-3 py-1 bg-gray-100 text-gray-400 rounded-full text-[10px] font-bold uppercase tracking-wider">
                End of history
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
