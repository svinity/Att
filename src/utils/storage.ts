import { Worker, Attendance, Transaction, Expense, Contractor, ContractorPayment, AppUser } from '../types';

const STORAGE_KEYS = {
  WORKERS: 'prefabshala_workers',
  ATTENDANCE: 'prefabshala_attendance',
  TRANSACTIONS: 'prefabshala_transactions',
  EXPENSES: 'prefabshala_expenses',
  CONTRACTORS: 'prefabshala_contractors',
  CONTRACTOR_PAYMENTS: 'prefabshala_contractor_payments',
  USERS: 'prefabshala_users',
};

// Default admin account, kept so nobody gets locked out on first run
export const SEED_USERS: AppUser[] = [
  {
    id: 'user-1',
    username: 'Sahil',
    password: 'Log@in123',
    name: 'Sahil',
  },
];

export const SEED_CONTRACTORS: Contractor[] = [
  {
    id: 'contractor-1',
    name: 'Sharma Builders',
    site: 'Sector 62 Prefab Office',
    amountFinalised: 450000,
    remarks: 'Plumbing & Civil work package'
  },
  {
    id: 'contractor-2',
    name: 'Verma Electricals',
    site: 'Noida Hub Assembly',
    amountFinalised: 280000,
    remarks: 'Complete wiring and light fittings'
  }
];

export const SEED_CONTRACTOR_PAYMENTS: ContractorPayment[] = [
  {
    id: 'cp-1',
    contractorId: 'contractor-1',
    date: '2023-10-01',
    amount: 150000,
    remarks: 'Initial advance'
  },
  {
    id: 'cp-2',
    contractorId: 'contractor-1',
    date: '2023-10-10',
    amount: 100000,
    remarks: 'Second installment on foundation completion'
  },
  {
    id: 'cp-3',
    contractorId: 'contractor-2',
    date: '2023-10-05',
    amount: 80000,
    remarks: 'Material purchase advance'
  }
];

export const SEED_WORKERS: Worker[] = [
  {
    id: 'worker-1',
    name: 'Ramesh Kumar',
    mobile: '9876543210',
    designation: 'Site Supervisor',
    joiningDate: '2023-01-15',
    monthlySalary: 18000,
    dailyWage: 800,
    status: 'Active',
    remarks: 'Supervisor for Site B',
  },
  {
    id: 'worker-2',
    name: 'Suresh Singh',
    mobile: '9123456789',
    designation: 'Mason',
    joiningDate: '2023-03-10',
    monthlySalary: 25000,
    dailyWage: 950,
    status: 'Active',
    remarks: 'Experienced bricklayer',
  },
  {
    id: 'worker-3',
    name: 'Amit Patel',
    mobile: '9871122334',
    designation: 'Helper',
    joiningDate: '2023-05-01',
    monthlySalary: 15000,
    dailyWage: 500,
    status: 'Active',
    remarks: 'Assists with materials',
  },
  {
    id: 'worker-4',
    name: 'Rahul Kumar',
    mobile: '9812345678',
    designation: 'Mason',
    joiningDate: '2023-02-20',
    monthlySalary: 25000,
    dailyWage: 900,
    status: 'Active',
    remarks: 'Expert tiling worker',
  },
  {
    id: 'worker-5',
    name: 'Suresh Das',
    mobile: '9988776655',
    designation: 'Electrician',
    joiningDate: '2023-04-12',
    monthlySalary: 22000,
    dailyWage: 850,
    status: 'Active',
    remarks: 'Handles wiring and DBs',
  }
];

// 12 Oct 2023 is our standard display date
export const SEED_ATTENDANCE: Attendance[] = [
  // 12 Oct 2023 (Today in the screen layouts)
  { id: 'att-1', workerId: 'worker-1', date: '2023-10-12', status: 'PRESENT' },
  { id: 'att-2', workerId: 'worker-2', date: '2023-10-12', status: 'PRESENT' },
  { id: 'att-3', workerId: 'worker-3', date: '2023-10-12', status: 'ABSENT' }, // Amit is absent on 12 Oct
  // Let's leave worker-4 and worker-5 unmarked for 12 Oct to reflect "5 Not Marked" stat if 31 total active and some present/absent

  // 11 Oct 2023 (Yesterday)
  { id: 'att-4', workerId: 'worker-1', date: '2023-10-11', status: 'PRESENT' },
  { id: 'att-5', workerId: 'worker-2', date: '2023-10-11', status: 'PRESENT' },
  { id: 'att-6', workerId: 'worker-3', date: '2023-10-11', status: 'ABSENT' }, // Absent yesterday badge
  { id: 'att-7', workerId: 'worker-4', date: '2023-10-11', status: 'PRESENT' },
  { id: 'att-8', workerId: 'worker-5', date: '2023-10-11', status: 'HALF_DAY' },

  // 10 Oct 2023
  { id: 'att-9', workerId: 'worker-1', date: '2023-10-10', status: 'PRESENT' },
  { id: 'att-10', workerId: 'worker-2', date: '2023-10-10', status: 'HALF_DAY' },
  { id: 'att-11', workerId: 'worker-3', date: '2023-10-10', status: 'PRESENT' },
  
  // 09 Oct 2023
  { id: 'att-12', workerId: 'worker-1', date: '2023-10-09', status: 'ABSENT' },
  { id: 'att-13', workerId: 'worker-2', date: '2023-10-09', status: 'PRESENT' },
  { id: 'att-14', workerId: 'worker-3', date: '2023-10-09', status: 'PRESENT' }
];

export const SEED_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    workerId: 'worker-1',
    date: '2023-10-11',
    amount: 3000,
    type: 'Site Expense',
    remarks: 'Site B materials',
  },
  {
    id: 'tx-2',
    workerId: 'worker-1',
    date: '2023-10-10',
    amount: 5000,
    type: 'Salary Advance',
    remarks: 'Family emergency',
  },
  {
    id: 'tx-3',
    workerId: 'worker-1',
    date: '2023-10-09',
    amount: 500,
    type: 'Site Expense',
    remarks: 'Site A quick purchases',
  },
  {
    id: 'tx-4',
    workerId: 'worker-2',
    date: '2023-10-11',
    amount: 1200,
    type: 'Site Expense',
    remarks: 'Plumbing fittings',
  }
];

export const SEED_EXPENSES: Expense[] = [
  // Expenses under tx-1 (Ramesh's Rs. 3,000 Site Expense)
  {
    id: 'exp-1',
    transactionId: 'tx-1',
    name: 'Nails',
    amount: 300,
    date: '2023-10-11',
  },
  {
    id: 'exp-2',
    transactionId: 'tx-1',
    name: 'Glue',
    amount: 200,
    date: '2023-10-11',
  },
  // Expenses under tx-3 (Ramesh's Rs. 500 Site Expense)
  {
    id: 'exp-3',
    transactionId: 'tx-3',
    name: 'Tape',
    amount: 150,
    date: '2023-10-09',
  },
  {
    id: 'exp-4',
    transactionId: 'tx-3',
    name: 'Screws',
    amount: 350,
    date: '2023-10-09',
  },
];

// Helper to load or initialize storage
const loadFromStorage = <T>(key: string, seed: T[]): T[] => {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(seed));
    return seed;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error(`Error parsing storage for ${key}`, e);
    return seed;
  }
};

const saveToStorage = <T>(key: string, data: T[]): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const getWorkers = (): Worker[] => loadFromStorage<Worker>(STORAGE_KEYS.WORKERS, SEED_WORKERS);
export const saveWorkers = (workers: Worker[]): void => saveToStorage<Worker>(STORAGE_KEYS.WORKERS, workers);

export const getAttendance = (): Attendance[] => loadFromStorage<Attendance>(STORAGE_KEYS.ATTENDANCE, SEED_ATTENDANCE);
export const saveAttendance = (attendance: Attendance[]): void => saveToStorage<Attendance>(STORAGE_KEYS.ATTENDANCE, attendance);

export const getTransactions = (): Transaction[] => loadFromStorage<Transaction>(STORAGE_KEYS.TRANSACTIONS, SEED_TRANSACTIONS);
export const saveTransactions = (transactions: Transaction[]): void => saveToStorage<Transaction>(STORAGE_KEYS.TRANSACTIONS, transactions);

export const getExpenses = (): Expense[] => loadFromStorage<Expense>(STORAGE_KEYS.EXPENSES, SEED_EXPENSES);
export const saveExpenses = (expenses: Expense[]): void => saveToStorage<Expense>(STORAGE_KEYS.EXPENSES, expenses);

export const getContractors = (): Contractor[] => loadFromStorage<Contractor>(STORAGE_KEYS.CONTRACTORS, SEED_CONTRACTORS);
export const saveContractors = (contractors: Contractor[]): void => saveToStorage<Contractor>(STORAGE_KEYS.CONTRACTORS, contractors);

export const getContractorPayments = (): ContractorPayment[] => loadFromStorage<ContractorPayment>(STORAGE_KEYS.CONTRACTOR_PAYMENTS, SEED_CONTRACTOR_PAYMENTS);
export const saveContractorPayments = (payments: ContractorPayment[]): void => saveToStorage<ContractorPayment>(STORAGE_KEYS.CONTRACTOR_PAYMENTS, payments);

export const getUsers = (): AppUser[] => loadFromStorage<AppUser>(STORAGE_KEYS.USERS, SEED_USERS);
export const saveUsers = (users: AppUser[]): void => saveToStorage<AppUser>(STORAGE_KEYS.USERS, users);

// Calculate specific worker site expense balance (Money Given of type 'Site Expense' - linked expenses)
export const getWorkerExpenseBalance = (workerId: string): number => {
  const txs = getTransactions().filter(t => t.workerId === workerId && t.type === 'Site Expense');
  const exps = getExpenses();
  
  let totalGiven = 0;
  let totalSpent = 0;

  txs.forEach(t => {
    totalGiven += t.amount;
    const linkedExps = exps.filter(e => e.transactionId === t.id);
    linkedExps.forEach(e => {
      totalSpent += e.amount;
    });
  });

  return totalGiven - totalSpent;
};

// Calculate complete worker ledger balance
// Sum of wages earned (Present = Daily Wage, Half Day = Daily Wage * 0.5)
// MINUS sum of all Money Given transactions (which reduce what company owes or increases advance)
export const getWorkerLedgerBalance = (workerId: string): number => {
  const worker = getWorkers().find(w => w.id === workerId);
  if (!worker) return 0;

  const attendance = getAttendance().filter(a => a.workerId === workerId);
  const transactions = getTransactions().filter(t => t.workerId === workerId);

  let earnings = 0;
  attendance.forEach(a => {
    if (a.status === 'PRESENT') {
      earnings += worker.dailyWage;
    } else if (a.status === 'HALF_DAY') {
      earnings += worker.dailyWage * 0.5;
    }
  });

  let moneyReceived = 0;
  transactions.forEach(t => {
    moneyReceived += t.amount;
  });

  // Balance = Earnings - MoneyReceived
  // e.g. if worker earned Rs. 2,000 and received Rs. 5,000, balance is -3000 (worker holds company's money)
  return earnings - moneyReceived;
};
