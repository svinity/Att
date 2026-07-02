import { useState, useEffect } from 'react';
import { Worker, Attendance, Transaction, Expense, AttendanceStatus, Contractor, ContractorPayment } from './types';
import {
  getWorkers,
  saveWorkers,
  getAttendance,
  saveAttendance,
  getTransactions,
  saveTransactions,
  getExpenses,
  saveExpenses,
  getContractors,
  saveContractors,
  getContractorPayments,
  saveContractorPayments,
  SEED_WORKERS,
  SEED_ATTENDANCE,
  SEED_TRANSACTIONS,
  SEED_EXPENSES,
  SEED_CONTRACTORS,
  SEED_CONTRACTOR_PAYMENTS,
} from './utils/storage';
import {
  seedFirestoreIfEmpty,
  fetchFromFirestore,
  saveWorkerToFirestore,
  deleteWorkerFromFirestore,
  saveAttendanceToFirestore,
  saveTransactionToFirestore,
  deleteTransactionFromFirestore,
  saveExpenseToFirestore,
  deleteExpenseFromFirestore,
  saveContractorToFirestore,
  deleteContractorFromFirestore,
  saveContractorPaymentToFirestore,
  deleteContractorPaymentFromFirestore,
} from './lib/firebase';

import Dashboard from './components/Dashboard';
import AttendanceScreen from './components/AttendanceScreen';
import WorkersScreen from './components/WorkersScreen';
import MoneyGivenScreen from './components/MoneyGivenScreen';
import ExpenseSettlementScreen from './components/ExpenseSettlementScreen';
import WorkerLedgerScreen from './components/WorkerLedgerScreen';
import LoadingSpinner from './components/LoadingSpinner';
import LoginScreen from './components/LoginScreen';
import ContractorsScreen from './components/ContractorsScreen';
import SettingsScreen from './components/SettingsScreen';

import {
  Home as HomeIcon,
  Users as WorkersIcon,
  CalendarCheck as AttendanceIcon,
  Banknote as MoneyIcon,
  BookOpen as LedgerIcon,
  HardHat,
  Calendar,
  Settings as SettingsIcon,
  Briefcase as ContractorsIcon,
} from 'lucide-react';

export default function App() {
  // Authentication status
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('prefab_is_logged_in') === 'true');

  // Tabs: 'Home' | 'Workers' | 'Attendance' | 'Money' | 'Ledger' | 'Contractors' | 'Settings'
  const [activeTab, setActiveTab] = useState<string>('Home');
  
  // Money sub-tab: 'Given' | 'Settlement'
  const [moneySubTab, setMoneySubTab] = useState<'Given' | 'Settlement'>('Given');

  // Load state from Storage
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [contractorPayments, setContractorPayments] = useState<ContractorPayment[]>([]);

  // Simulation states
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  
  // Default to today's date in local time (YYYY-MM-DD)
  const getTodayDateString = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const [currentDate, setCurrentDate] = useState(getTodayDateString());

  // Shared state for selected worker across screens
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('All');

  // Load data on init
  useEffect(() => {
    // 1. Load cached values first
    const cachedWorkers = getWorkers();
    const cachedAttendance = getAttendance();
    const cachedTransactions = getTransactions();
    const cachedExpenses = getExpenses();
    const cachedContractors = getContractors();
    const cachedContractorPayments = getContractorPayments();

    setWorkers(cachedWorkers);
    setAttendance(cachedAttendance);
    setTransactions(cachedTransactions);
    setExpenses(cachedExpenses);
    setContractors(cachedContractors);
    setContractorPayments(cachedContractorPayments);

    // 2. Sync with Firebase in the background
    const syncWithFirebase = async () => {
      // First, seed Firestore if completely empty
      await seedFirestoreIfEmpty(
        SEED_WORKERS, 
        SEED_ATTENDANCE, 
        SEED_TRANSACTIONS, 
        SEED_EXPENSES,
        SEED_CONTRACTORS,
        SEED_CONTRACTOR_PAYMENTS
      );
      
      // Fetch fresh data from Firestore
      const result = await fetchFromFirestore();
      if (result.success) {
        setWorkers(result.workers);
        setAttendance(result.attendance);
        setTransactions(result.transactions);
        setExpenses(result.expenses);
        setContractors(result.contractors || []);
        setContractorPayments(result.contractorPayments || []);

        // Also update local storage cache
        saveWorkers(result.workers);
        saveAttendance(result.attendance);
        saveTransactions(result.transactions);
        saveExpenses(result.expenses);
        saveContractors(result.contractors || []);
        saveContractorPayments(result.contractorPayments || []);
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

  const handleEditTransaction = (txId: string, fields: Partial<Transaction>) => {
    triggerLoading('Saving transaction adjustment...', () => {
      const target = transactions.find(t => t.id === txId);
      if (target) {
        const updatedTx = { ...target, ...fields };
        const updated = transactions.map(t => t.id === txId ? updatedTx : t);
        setTransactions(updated);
        saveTransactions(updated);
        saveTransactionToFirestore(updatedTx);
      }
    });
  };

  const handleDeleteTransaction = (txId: string) => {
    triggerLoading('Deleting transaction...', () => {
      const updated = transactions.filter(t => t.id !== txId);
      setTransactions(updated);
      saveTransactions(updated);
      deleteTransactionFromFirestore(txId);
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

  const handleEditExpense = (id: string, fields: Partial<Expense>) => {
    triggerLoading('Updating expense...', () => {
      const target = expenses.find(e => e.id === id);
      if (target) {
        const updatedExp = { ...target, ...fields };
        const updated = expenses.map(e => e.id === id ? updatedExp : e);
        setExpenses(updated);
        saveExpenses(updated);
        saveExpenseToFirestore(updatedExp);
      }
    });
  };

  const handleDeleteExpense = (id: string) => {
    triggerLoading('Removing expense...', () => {
      const updated = expenses.filter(e => e.id !== id);
      setExpenses(updated);
      saveExpenses(updated);
      deleteExpenseFromFirestore(id);
    });
  };

  const handleDeleteWorker = (workerId: string) => {
    triggerLoading('Removing worker...', () => {
      const updated = workers.filter(w => w.id !== workerId);
      setWorkers(updated);
      saveWorkers(updated);
      deleteWorkerFromFirestore(workerId);
    });
  };

  // CONTRACTOR ACTIONS
  const handleAddContractor = (newContractor: Omit<Contractor, 'id'>) => {
    triggerLoading('Registering contractor...', () => {
      const id = `contractor-${Date.now()}`;
      const created = { ...newContractor, id };
      const updated = [...contractors, created];
      setContractors(updated);
      saveContractors(updated);
      saveContractorToFirestore(created);
    });
  };

  const handleEditContractor = (id: string, fields: Partial<Contractor>) => {
    triggerLoading('Updating contractor info...', () => {
      const target = contractors.find(c => c.id === id);
      if (target) {
        const updated = { ...target, ...fields };
        const updatedList = contractors.map(c => c.id === id ? updated : c);
        setContractors(updatedList);
        saveContractors(updatedList);
        saveContractorToFirestore(updated);
      }
    });
  };

  const handleDeleteContractor = (id: string) => {
    triggerLoading('Removing contractor...', () => {
      const updated = contractors.filter(c => c.id !== id);
      setContractors(updated);
      saveContractors(updated);
      deleteContractorFromFirestore(id);
      
      // Also delete linked payments
      const remainingPayments = contractorPayments.filter(p => p.contractorId !== id);
      setContractorPayments(remainingPayments);
      saveContractorPayments(remainingPayments);
      
      const deletedPayments = contractorPayments.filter(p => p.contractorId === id);
      deletedPayments.forEach(p => deleteContractorPaymentFromFirestore(p.id));
    });
  };

  const handleAddContractorPayment = (newPayment: Omit<ContractorPayment, 'id'>) => {
    triggerLoading('Recording payment voucher...', () => {
      const id = `cp-${Date.now()}`;
      const created = { ...newPayment, id };
      const updated = [...contractorPayments, created];
      setContractorPayments(updated);
      saveContractorPayments(updated);
      saveContractorPaymentToFirestore(created);
    });
  };

  const handleDeleteContractorPayment = (id: string) => {
    triggerLoading('Deleting payment entry...', () => {
      const updated = contractorPayments.filter(p => p.id !== id);
      setContractorPayments(updated);
      saveContractorPayments(updated);
      deleteContractorPaymentFromFirestore(id);
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
                className={`flex-1 py-2 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  moneySubTab === 'Given'
                    ? 'bg-white text-[#1a56db] shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Money Given
              </button>
              <button
                onClick={() => setMoneySubTab('Settlement')}
                className={`flex-1 py-2 text-xs font-bold rounded-md transition-all cursor-pointer ${
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
                onEditTransaction={handleEditTransaction}
                onDeleteTransaction={handleDeleteTransaction}
              />
            ) : (
              <ExpenseSettlementScreen
                workers={workers}
                transactions={transactions}
                expenses={expenses}
                onAddExpense={handleAddExpense}
                onEditExpense={handleEditExpense}
                onDeleteExpense={handleDeleteExpense}
                onEditTransaction={handleEditTransaction}
                onDeleteTransaction={handleDeleteTransaction}
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
      case 'Contractors':
        return (
          <ContractorsScreen
            contractors={contractors}
            payments={contractorPayments}
            onAddContractor={handleAddContractor}
            onEditContractor={handleEditContractor}
            onDeleteContractor={handleDeleteContractor}
            onAddPayment={handleAddContractorPayment}
            onDeletePayment={handleDeleteContractorPayment}
            currentDate={currentDate}
          />
        );
      case 'Settings':
        return (
          <SettingsScreen
            workers={workers}
            transactions={transactions}
            expenses={expenses}
            onEditWorker={handleEditWorker}
            onDeleteWorker={handleDeleteWorker}
            onEditTransaction={handleEditTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            onEditExpense={handleEditExpense}
            onDeleteExpense={handleDeleteExpense}
            onLogout={() => {
              localStorage.removeItem('prefab_is_logged_in');
              setIsLoggedIn(false);
            }}
          />
        );
      default:
        return null;
    }
  };

  // 1. GATEWAY: If not logged in, render the login card layout exclusively
  if (!isLoggedIn) {
    return <LoginScreen onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-800 font-sans flex flex-col items-center">
      
      {/* Desktop view framing / container to support gorgeous target size layout */}
      <div className="w-full max-w-md min-h-screen bg-[#f8fafc] flex flex-col relative border-x border-gray-100 shadow-xl">
        
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-gray-100 px-4 flex items-center justify-between sticky top-0 z-40">
          <div onClick={() => handleTabChange('Home')} className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-[#1a56db] flex items-center justify-center text-white">
              <HardHat className="w-5 h-5 stroke-[2]" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black text-[#1a56db] leading-none">Prefabshala</span>
              <span className="text-[9px] font-bold text-[#047857] uppercase tracking-widest mt-0.5">Worker Manager</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-lg text-xs font-bold text-gray-600 transition-all cursor-pointer">
              <Calendar className="w-3.5 h-3.5 text-[#1a56db]" />
              <span>{formatDateStringFull(currentDate)}</span>
              <input
                type="date"
                value={currentDate}
                onChange={(e) => {
                  if (e.target.value) setCurrentDate(e.target.value);
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
            </div>

            <button
              onClick={() => handleTabChange('Settings')}
              className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                activeTab === 'Settings'
                  ? 'bg-blue-50 border-blue-200 text-[#1a56db]'
                  : 'bg-gray-50 hover:bg-gray-100 border-gray-100 text-gray-500'
              }`}
              title="Open Settings"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
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

        {/* Bottom Navigation Bar with 6 columns to perfectly fit Contractors */}
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto h-16 bg-white border-t border-gray-100 grid grid-cols-6 items-center px-1.5 z-40 shadow-lg">
          {/* Home */}
          <button
            onClick={() => handleTabChange('Home')}
            className={`flex flex-col items-center justify-center gap-1 h-full rounded-xl transition-all cursor-pointer ${
              activeTab === 'Home' ? 'text-[#1a56db]' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <HomeIcon className="w-5 h-5" />
            <span className="text-[9px] font-bold">Home</span>
          </button>

          {/* Workers */}
          <button
            onClick={() => handleTabChange('Workers')}
            className={`flex flex-col items-center justify-center gap-1 h-full rounded-xl transition-all cursor-pointer ${
              activeTab === 'Workers' ? 'text-[#1a56db]' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <WorkersIcon className="w-5 h-5" />
            <span className="text-[9px] font-bold">Workers</span>
          </button>

          {/* Attendance */}
          <button
            onClick={() => handleTabChange('Attendance')}
            className={`flex flex-col items-center justify-center gap-1 h-full rounded-xl transition-all cursor-pointer ${
              activeTab === 'Attendance' ? 'text-[#1a56db]' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <AttendanceIcon className="w-5 h-5" />
            <span className="text-[9px] font-bold">Attendance</span>
          </button>

          {/* Money */}
          <button
            onClick={() => handleTabChange('Money')}
            className={`flex flex-col items-center justify-center gap-1 h-full rounded-xl transition-all cursor-pointer ${
              activeTab === 'Money' ? 'text-[#1a56db]' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <MoneyIcon className="w-5 h-5" />
            <span className="text-[9px] font-bold">Money</span>
          </button>

          {/* Contractors */}
          <button
            onClick={() => handleTabChange('Contractors')}
            className={`flex flex-col items-center justify-center gap-1 h-full rounded-xl transition-all cursor-pointer ${
              activeTab === 'Contractors' ? 'text-[#1a56db]' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <ContractorsIcon className="w-5 h-5" />
            <span className="text-[9px] font-bold">Contractor</span>
          </button>

          {/* Ledger */}
          <button
            onClick={() => handleTabChange('Ledger')}
            className={`flex flex-col items-center justify-center gap-1 h-full rounded-xl transition-all cursor-pointer ${
              activeTab === 'Ledger' ? 'text-[#1a56db]' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <LedgerIcon className="w-5 h-5" />
            <span className="text-[9px] font-bold">Ledger</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
