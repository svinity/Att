import { Worker, Attendance } from '../types';
import { getWorkerExpenseBalance } from '../utils/storage';
import { CheckCircle2, XCircle, AlertCircle, Users, ArrowRight, TrendingUp } from 'lucide-react';

interface DashboardProps {
  workers: Worker[];
  attendance: Attendance[];
  currentDate: string; // YYYY-MM-DD
  onNavigateToExpenseSettlement: (workerId: string) => void;
  onNavigateToTab: (tab: string) => void;
}

export default function Dashboard({
  workers,
  attendance,
  currentDate,
  onNavigateToExpenseSettlement,
  onNavigateToTab,
}: DashboardProps) {
  // Filter active workers
  const activeWorkers = workers.filter(w => w.status === 'Active');
  
  // Find today's attendance for active workers
  const todaysAttendance = attendance.filter(a => a.date === currentDate);
  
  const presentToday = activeWorkers.filter(w => 
    todaysAttendance.some(a => a.workerId === w.id && a.status === 'PRESENT')
  ).length;

  const absentToday = activeWorkers.filter(w => 
    todaysAttendance.some(a => a.workerId === w.id && a.status === 'ABSENT')
  ).length;

  const halfDayToday = activeWorkers.filter(w => 
    todaysAttendance.some(a => a.workerId === w.id && a.status === 'HALF_DAY')
  ).length;

  // Present Today also includes Half Day as working, or let's show exact Present Today (Present + 0.5 * Half Day? No, the card says "Present Today (green)" and "Absent (red)". Let's just say PRESENT + HALF_DAY count, or strictly PRESENT status). Let's count PRESENT strictly, or both. Let's do strictly status 'PRESENT' or 'HALF_DAY' as working, or just status === 'PRESENT'. Let's do status === 'PRESENT' for Green card, status === 'ABSENT' for Red card.
  // Not marked count = Active Workers - Marked workers
  const markedWorkerIds = todaysAttendance.map(a => a.workerId);
  const notMarkedToday = activeWorkers.filter(w => !markedWorkerIds.includes(w.id)).length;

  // Expense balances for all workers holding money
  const workersWithBalances = workers
    .map(worker => ({
      worker,
      balance: getWorkerExpenseBalance(worker.id),
    }))
    .filter(item => item.balance !== 0); // Include anyone holding or owed money!

  const formatDateString = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Welcome & Context banner */}
      <div className="p-4 bg-gradient-to-r from-[#1a56db]/10 to-teal-500/10 rounded-xl border border-[#1a56db]/20 flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-base font-bold text-gray-900">Good Morning, Supervisor!</h2>
          <p className="text-xs text-gray-500">Track and manage site workers effortlessly.</p>
        </div>
        <div className="p-2 bg-white rounded-lg shadow-xs text-xs font-semibold text-[#1a56db]">
          {formatDateString(currentDate)}
        </div>
      </div>

      {/* 2x2 Stats Grid */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Today's Overview</h3>
        <div className="grid grid-cols-2 gap-3">
          {/* Present Today Card */}
          <div 
            onClick={() => onNavigateToTab('Attendance')}
            className="p-4 bg-white rounded-xl border border-emerald-100 shadow-xs hover:border-emerald-200 transition-all cursor-pointer active:scale-98"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500">Present Today</span>
              <CheckCircle2 className="w-5 h-5 text-[#047857]" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-[#047857]">{presentToday}</span>
              {halfDayToday > 0 && (
                <span className="text-xs font-medium text-emerald-600">({halfDayToday} Half-Day)</span>
              )}
            </div>
          </div>

          {/* Absent Today Card */}
          <div 
            onClick={() => onNavigateToTab('Attendance')}
            className="p-4 bg-white rounded-xl border border-red-100 shadow-xs hover:border-red-200 transition-all cursor-pointer active:scale-98"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500">Absent</span>
              <XCircle className="w-5 h-5 text-[#dc2626]" />
            </div>
            <span className="text-2xl font-extrabold text-[#dc2626]">{absentToday}</span>
          </div>

          {/* Not Marked Card */}
          <div 
            onClick={() => onNavigateToTab('Attendance')}
            className="p-4 bg-white rounded-xl border border-gray-100 shadow-xs hover:border-gray-200 transition-all cursor-pointer active:scale-98"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500">Not Marked</span>
              <AlertCircle className="w-5 h-5 text-gray-400" />
            </div>
            <span className="text-2xl font-extrabold text-gray-500">{notMarkedToday}</span>
          </div>

          {/* Active Workers Card */}
          <div 
            onClick={() => onNavigateToTab('Workers')}
            className="p-4 bg-white rounded-xl border border-blue-100 shadow-xs hover:border-blue-200 transition-all cursor-pointer active:scale-98"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500">Active Workers</span>
              <Users className="w-5 h-5 text-[#1a56db]" />
            </div>
            <span className="text-2xl font-extrabold text-[#1a56db]">{activeWorkers.length}</span>
          </div>
        </div>
      </div>

      {/* Expense Balances Section */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Expense Balances</h3>
          <button 
            onClick={() => onNavigateToTab('Money')}
            className="text-xs font-semibold text-[#1a56db] hover:underline"
          >
            Manage Expenses
          </button>
        </div>

        {workersWithBalances.length === 0 ? (
          <div className="p-6 bg-white rounded-xl border border-dashed border-gray-200 text-center space-y-1">
            <TrendingUp className="w-8 h-8 text-gray-300 mx-auto" />
            <p className="text-sm font-semibold text-gray-800">All Expenses Settled</p>
            <p className="text-xs text-gray-400">No workers are currently holding site expense cash.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {workersWithBalances.map(({ worker, balance }) => (
              <div
                key={worker.id}
                onClick={() => onNavigateToExpenseSettlement(worker.id)}
                className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-xs hover:border-gray-200 hover:shadow-sm cursor-pointer transition-all active:scale-99"
              >
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-gray-900">{worker.name}</h4>
                  <p className="text-xs text-gray-400">{worker.designation}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="block text-xs font-medium text-gray-400">
                      {balance > 0 ? 'Holding' : 'Company owes'}
                    </span>
                    <span className={`text-sm font-extrabold ${balance > 0 ? 'text-[#047857]' : 'text-[#dc2626]'}`}>
                      Rs. {Math.abs(balance)}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dynamic site tip card */}
      <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
        <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">Supervisor Tip</h4>
        <p className="text-xs text-amber-700 leading-relaxed">
          Remember to verify all itemized bills (Nails, cement, transport) before clicking <strong>Settle</strong> under the Expense Settlement screen.
        </p>
      </div>
    </div>
  );
}
