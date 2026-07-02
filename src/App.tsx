import { useState, useEffect } from 'react';
import { Worker, Attendance, Transaction, Expense, AttendanceStatus } from './types';
import {
  getWorkers,
  saveWorkers,
  getAttendance,
  saveAttendance,
  getTransactions,
  saveTransactions,
  getExpenses,
  saveExpenses,
  SEED_WORKERS,
  SEED_ATTENDANCE,
  SEED_TRANSACTIONS,
  SEED_EXPENSES,
} from './utils/storage';
import {
  seedFirestoreIfEmpty,
  fetchFromFirestore,
  saveWorkerToFirestore,
  saveAttendanceToFirestore,
  saveTransactionToFirestore,
  saveExpenseToFirestore,
} from './lib/firebase';

import Dashboard from './components/Dashboard';
import AttendanceScreen from './components/AttendanceScreen';
import WorkersScreen from './components/WorkersScreen';
import MoneyGivenScreen from './components/MoneyGivenScreen';
import ExpenseSettlementScreen from './components/ExpenseSettlementScreen';
import WorkerLedgerScreen from './components/WorkerLedgerScreen';
import LoadingSpinner from './components/LoadingSpinner';

import {
  Home as HomeIcon,
  Users as WorkersIcon,
  CalendarCheck as AttendanceIcon,
  Banknote as MoneyIcon,
  BookOpen as LedgerIcon,
  HardHat,
  Menu,
  Smartphone,
  Monitor,
} from 'lucide-react';

export default function App() {
  // Tabs: 'Home' | 'Workers' | 'Attendance' | 'Money' | 'Ledger'
  const [activeTab, setActiveTab] = useState<string>('Home');
  
  // Money sub-tab: 'Given' | 'Settlement'
  const [moneySubTab, setMoneySubTab] = useState<'Given' | 'Settlement'>('Given');

  // Load state from Storage
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // Simulation states
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  
  // App default date (Oct 12, 2023 matches the design mockups precisely)
  const [currentDate, setCurrentDate] = useState('2023-10-12');

  // Shared state for selected worker across screens
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('All');

  // Load data on init
  useEffect(() => {
    // 1. Load cached values first
    const cachedWorkers = getWorkers();
    const cachedAttendance = getAttendance();
    const cachedTransactions = getTransactions();
    const cachedExpenses = getExpenses();

    setWorkers(cachedWorkers);
    setAttendance(cachedAttendance);
    setTransactions(cachedTransactions);
    setExpenses(cachedExpenses);

    // 2. Sync with Firebase in the background
    const syncWithFirebase = async () => {
      // First, seed Firestore if completely empty
      await seedFirestoreIfEmpty(SEED_WORKERS, SEED_ATTENDANCE, SEED_TRANSACTIONS, SEED_EXPENSES);
      
      // Fetch fresh data from Firestore
      const result = await fetchFromFirestore();
      if (result.success) {
        setWorkers(result.workers);
        setAttendance(result.attendance);
        setTransactions(result.transactions);
        setExpenses(result.expenses);

        // Also update local storage cache
        saveWorkers(result.workers);
        saveAttendance(result.attendance);
        saveTransactions(result.transactions);
        saveExpenses(result.expenses);
      }
    };

    syncWithFirebase();
  }, []);

  // Helper to trigger simulated loading
  const triggerLoading = (message: string, callback: () => void) => {
    setIsLoading(true);
    setLoadingMessage(message);
    setTimeout(() => {
      callback();
      setIsLoading(false);
    }, 400); // Fast realistic response time
  };

  // Switch tab with visual loader
  const handleTabChange = (tab: string) => {
    if (tab === activeTab) return;
    triggerLoading(`Opening ${tab}...`, () => {
      setActiveTab(tab);
      // Reset selected worker for specific views if needed
      if (tab === 'Ledger' || tab === 'Money') {
        const activeWorkers = workers.filter(w => w.status === 'Active');
        if (activeWorkers.length > 0 && selectedWorkerId === 'All') {
          setSelectedWorkerId(activeWorkers[0].id);
        }
      }
    });
  };

  // WORKERS ACTIONS
  const handleAddWorker = (newWorker: Omit<Worker, 'id'>) => {
    triggerLoading('Registering worker...', () => {
      const id = `worker-${Date.now()}`;
      const createdWorker = { ...newWorker, id };
      const updatedWorkers = [...workers, createdWorker];
      setWorkers(updatedWorkers);
      saveWorkers(updatedWorkers);
      saveWorkerToFirestore(createdWorker);
    });
  };

  const handleEditWorker = (id: string, updatedFields: Partial<Worker>) => {
    triggerLoading('Updating worker profile...', () => {
      const targetWorker = workers.find(w => w.id === id);
      if (targetWorker) {
        const updatedWorker = { ...targetWorker, ...updatedFields };
        const updatedWorkers = workers.map(w => w.id === id ? updatedWorker : w);
        setWorkers(updatedWorkers);
        saveWorkers(updatedWorkers);
        saveWorkerToFirestore(updatedWorker);
      }
    });
  };

  // ATTENDANCE ACTIONS
  const handleUpdateAttendance = (workerId: string, status: AttendanceStatus) => {
    // No full-screen loading for simple single toggle to keep user flow snappy
    const existingIndex = attendance.findIndex(a => a.workerId === workerId && a.date === currentDate);
    let updatedAttendance = [...attendance];
    let record: Attendance;

    if (existingIndex > -1) {
      record = { ...updatedAttendance[existingIndex], status };
      updatedAttendance[existingIndex] = record;
    } else {
      record = {
        id: `att-${Date.now()}`,
        workerId,
        date: currentDate,
        status,
      };
      updatedAttendance.push(record);
    }

    setAttendance(updatedAttendance);
    saveAttendance(updatedAttendance);
    saveAttendanceToFirestore(record);
  };

  const handleMarkAllPresent = () => {
    triggerLoading('Marking all active workers present...', () => {
      const activeWorkers = workers.filter(w => w.status === 'Active');
      let updatedAttendance = [...attendance];

      activeWorkers.forEach(worker => {
        const existingIndex = updatedAttendance.findIndex(a => a.workerId === worker.id && a.date === currentDate);
        let record: Attendance;
        if (existingIndex > -1) {
          record = { ...updatedAttendance[existingIndex], status: 'PRESENT' };
          updatedAttendance[existingIndex] = record;
        } else {
          record = {
            id: `att-${Date.now()}-${worker.id}`,
            workerId: worker.id,
            date: currentDate,
            status: 'PRESENT',
          };
          updatedAttendance.push(record);
        }
        saveAttendanceToFirestore(record);
      });

      setAttendance(updatedAttendance);
      saveAttendance(updatedAttendance);
    });
  };

  // TRANSACTION (MONEY GIVEN) ACTIONS
  const handleAddTransaction = (newTx: Omit<Transaction, 'id'>) => {
    triggerLoading('Logging payment transaction...', () => {
      const id = `tx-${Date.now()}`;
      const createdTx = { ...newTx, id };
      const updatedTxs = [...transactions, createdTx];
      setTransactions(updatedTxs);
      saveTransactions(updatedTxs);
      saveTransactionToFirestore(createdTx);
    });
  };

  // EXPENSE ACTIONS
  const handleAddExpense = (newExp: Omit<Expense, 'id'>) => {
    triggerLoading('Saving itemized expense...', () => {
      const id = `exp-${Date.now()}`;
      const createdExp = { ...newExp, id };
      const updatedExps = [...expenses, createdExp];
      setExpenses(updatedExps);
      saveExpenses(updatedExps);
      saveExpenseToFirestore(createdExp);
    });
  };

  // Shortcut from Dashboard to Expense Settlement
  const handleNavigateToExpenseSettlement = (workerId: string) => {
    triggerLoading('Opening settlement records...', () => {
      setSelectedWorkerId(workerId);
      setActiveTab('Money');
      setMoneySubTab('Settlement');
    });
  };

  // Top bar logo & date formatting
  const formatDateStringFull = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Render current active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'Home':
        return (
          <Dashboard
            workers={workers}
            attendance={attendance}
            currentDate={currentDate}
            onNavigateToExpenseSettlement={handleNavigateToExpenseSettlement}
            onNavigateToTab={handleTabChange}
          />
        );
      case 'Attendance':
        return (
          <AttendanceScreen
            workers={workers}
            attendance={attendance}
            currentDate={currentDate}
            onSetCurrentDate={setCurrentDate}
            onUpdateAttendance={handleUpdateAttendance}
            onMarkAllPresent={handleMarkAllPresent}
          />
        );
      case 'Workers':
        return (
          <WorkersScreen
            workers={workers}
            onAddWorker={handleAddWorker}
            onEditWorker={handleEditWorker}
          />
        );
      case 'Money':
        return (
          <div className="space-y-4">
            {/* Money Screen sub-navigation tab (Money Given vs Expense Settlement) */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setMoneySubTab('Given')}
                className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${
                  moneySubTab === 'Given'
                    ? 'bg-white text-[#1a56db] shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Money Given
              </button>
              <button
                onClick={() => setMoneySubTab('Settlement')}
                className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${
                  moneySubTab === 'Settlement'
                    ? 'bg-white text-[#1a56db] shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Expense Settlement
              </button>
            </div>

            {moneySubTab === 'Given' ? (
              <MoneyGivenScreen
                workers={workers}
                transactions={transactions}
                expenses={expenses}
                onAddTransaction={handleAddTransaction}
              />
            ) : (
              <ExpenseSettlementScreen
                workers={workers}
                transactions={transactions}
                expenses={expenses}
                onAddExpense={handleAddExpense}
                selectedWorkerId={selectedWorkerId}
                setSelectedWorkerId={setSelectedWorkerId}
              />
            )}
          </div>
        );
      case 'Ledger':
        return (
          <WorkerLedgerScreen
            workers={workers}
            attendance={attendance}
            transactions={transactions}
            expenses={expenses}
            selectedWorkerId={selectedWorkerId}
            setSelectedWorkerId={setSelectedWorkerId}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-800 font-sans flex flex-col items-center">
      
      {/* Desktop view framing / container to support gorgeous target size layout */}
      <div className="w-full max-w-md min-h-screen bg-[#f8fafc] flex flex-col relative border-x border-gray-100 shadow-xl">
        
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-gray-100 px-4 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#1a56db] flex items-center justify-center text-white">
              <HardHat className="w-5 h-5 stroke-[2]" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black text-[#1a56db] leading-none">Prefabshala</span>
              <span className="text-[9px] font-bold text-[#047857] uppercase tracking-widest mt-0.5">Worker Manager</span>
            </div>
          </div>
          <div className="text-xs font-bold text-gray-400">
            {formatDateStringFull(currentDate)}
          </div>
        </header>

        {/* Main Content scroll window */}
        <main className="flex-1 p-4 overflow-y-auto pb-24">
          {renderTabContent()}
        </main>

        {/* Floating Simulated Loader */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/65 flex items-center justify-center z-50 animate-fadeIn">
            <LoadingSpinner message={loadingMessage} />
          </div>
        )}

        {/* Bottom Navigation Bar */}
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto h-16 bg-white border-t border-gray-100 grid grid-cols-5 items-center px-2 z-40 shadow-lg">
          {/* Home */}
          <button
            onClick={() => handleTabChange('Home')}
            className={`flex flex-col items-center justify-center gap-1 h-full rounded-xl transition-all cursor-pointer ${
              activeTab === 'Home' ? 'text-[#1a56db]' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <HomeIcon className="w-5 h-5" />
            <span className="text-[10px] font-bold">Home</span>
          </button>

          {/* Workers */}
          <button
            onClick={() => handleTabChange('Workers')}
            className={`flex flex-col items-center justify-center gap-1 h-full rounded-xl transition-all cursor-pointer ${
              activeTab === 'Workers' ? 'text-[#1a56db]' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <WorkersIcon className="w-5 h-5" />
            <span className="text-[10px] font-bold">Workers</span>
          </button>

          {/* Attendance */}
          <button
            onClick={() => handleTabChange('Attendance')}
            className={`flex flex-col items-center justify-center gap-1 h-full rounded-xl transition-all cursor-pointer ${
              activeTab === 'Attendance' ? 'text-[#1a56db]' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <AttendanceIcon className="w-5 h-5" />
            <span className="text-[10px] font-bold">Attendance</span>
          </button>

          {/* Money */}
          <button
            onClick={() => handleTabChange('Money')}
            className={`flex flex-col items-center justify-center gap-1 h-full rounded-xl transition-all cursor-pointer ${
              activeTab === 'Money' ? 'text-[#1a56db]' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <MoneyIcon className="w-5 h-5" />
            <span className="text-[10px] font-bold">Money</span>
          </button>

          {/* Ledger */}
          <button
            onClick={() => handleTabChange('Ledger')}
            className={`flex flex-col items-center justify-center gap-1 h-full rounded-xl transition-all cursor-pointer ${
              activeTab === 'Ledger' ? 'text-[#1a56db]' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <LedgerIcon className="w-5 h-5" />
            <span className="text-[10px] font-bold">Ledger</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
