import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc, writeBatch, deleteDoc } from 'firebase/firestore';
import { Worker, Attendance, Transaction, Expense, Contractor, ContractorPayment } from '../types';

// Web App Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBzCFxFI_winqkDyE1uJxk0pPN8piIDKQk",
  authDomain: "gen-lang-client-0323352601.firebaseapp.com",
  projectId: "gen-lang-client-0323352601",
  storageBucket: "gen-lang-client-0323352601.firebasestorage.app",
  messagingSenderId: "477336362943",
  appId: "1:477336362943:web:7d04ee61d17758a4c68b0a"
};

const customDatabaseId = "ai-studio-prefabshalaworke-1cac41eb-34aa-4f36-9668-0b70a56c6fed";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, customDatabaseId);

// Collection References
const WORKERS_COL = 'workers';
const ATTENDANCE_COL = 'attendance';
const TRANSACTIONS_COL = 'transactions';
const EXPENSES_COL = 'expenses';
const CONTRACTORS_COL = 'contractors';
const CONTRACTOR_PAYMENTS_COL = 'contractor_payments';

// Error Handling Requirements from the firebase-integration skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
      tenantId: null,
      providerInfo: []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Seed data to Firestore if it is empty
export async function seedFirestoreIfEmpty(
  seedWorkers: Worker[],
  seedAttendance: Attendance[],
  seedTransactions: Transaction[],
  seedExpenses: Expense[],
  seedContractors: Contractor[],
  seedContractorPayments: ContractorPayment[]
) {
  try {
    let workersSnapshot;
    try {
      workersSnapshot = await getDocs(collection(db, WORKERS_COL));
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, WORKERS_COL);
    }

    if (workersSnapshot.empty) {
      console.log('Firestore is empty. Seeding database...');
      
      const batch = writeBatch(db);

      // Seed workers
      seedWorkers.forEach(w => {
        const dRef = doc(db, WORKERS_COL, w.id);
        batch.set(dRef, w);
      });

      // Seed attendance
      seedAttendance.forEach(a => {
        const dRef = doc(db, ATTENDANCE_COL, a.id);
        batch.set(dRef, a);
      });

      // Seed transactions
      seedTransactions.forEach(t => {
        const dRef = doc(db, TRANSACTIONS_COL, t.id);
        batch.set(dRef, t);
      });

      // Seed expenses
      seedExpenses.forEach(e => {
        const dRef = doc(db, EXPENSES_COL, e.id);
        batch.set(dRef, e);
      });

      // Seed contractors
      seedContractors.forEach(c => {
        const dRef = doc(db, CONTRACTORS_COL, c.id);
        batch.set(dRef, c);
      });

      // Seed contractor payments
      seedContractorPayments.forEach(cp => {
        const dRef = doc(db, CONTRACTOR_PAYMENTS_COL, cp.id);
        batch.set(dRef, cp);
      });

      try {
        await batch.commit();
        console.log('Firestore seeded successfully.');
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'batch-seed');
      }
    }
  } catch (err) {
    console.error('Error seeding Firestore:', err);
  }
}

// Fetch all from Firestore
export async function fetchFromFirestore() {
  try {
    let workersSnap;
    try {
      workersSnap = await getDocs(collection(db, WORKERS_COL));
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, WORKERS_COL);
    }

    let attendanceSnap;
    try {
      attendanceSnap = await getDocs(collection(db, ATTENDANCE_COL));
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, ATTENDANCE_COL);
    }

    let txsSnap;
    try {
      txsSnap = await getDocs(collection(db, TRANSACTIONS_COL));
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, TRANSACTIONS_COL);
    }

    let expensesSnap;
    try {
      expensesSnap = await getDocs(collection(db, EXPENSES_COL));
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, EXPENSES_COL);
    }

    let contractorsSnap;
    try {
      contractorsSnap = await getDocs(collection(db, CONTRACTORS_COL));
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, CONTRACTORS_COL);
    }

    let contractorPaymentsSnap;
    try {
      contractorPaymentsSnap = await getDocs(collection(db, CONTRACTOR_PAYMENTS_COL));
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, CONTRACTOR_PAYMENTS_COL);
    }

    const workers: Worker[] = [];
    workersSnap.forEach(doc => workers.push(doc.data() as Worker));

    const attendance: Attendance[] = [];
    attendanceSnap.forEach(doc => attendance.push(doc.data() as Attendance));

    const transactions: Transaction[] = [];
    txsSnap.forEach(doc => transactions.push(doc.data() as Transaction));

    const expenses: Expense[] = [];
    expensesSnap.forEach(doc => expenses.push(doc.data() as Expense));

    const contractors: Contractor[] = [];
    contractorsSnap.forEach(doc => contractors.push(doc.data() as Contractor));

    const contractorPayments: ContractorPayment[] = [];
    contractorPaymentsSnap.forEach(doc => contractorPayments.push(doc.data() as ContractorPayment));

    return { 
      workers, 
      attendance, 
      transactions, 
      expenses, 
      contractors, 
      contractorPayments, 
      success: true 
    };
  } catch (error) {
    console.error('Error fetching from Firestore:', error);
    return { 
      workers: [], 
      attendance: [], 
      transactions: [], 
      expenses: [], 
      contractors: [], 
      contractorPayments: [], 
      success: false 
    };
  }
}

// Save single records to Firestore
export async function saveWorkerToFirestore(worker: Worker) {
  try {
    await setDoc(doc(db, WORKERS_COL, worker.id), worker);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${WORKERS_COL}/${worker.id}`);
  }
}

export async function deleteWorkerFromFirestore(workerId: string) {
  try {
    await deleteDoc(doc(db, WORKERS_COL, workerId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${WORKERS_COL}/${workerId}`);
  }
}

export async function saveAttendanceToFirestore(attendance: Attendance) {
  try {
    await setDoc(doc(db, ATTENDANCE_COL, attendance.id), attendance);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${ATTENDANCE_COL}/${attendance.id}`);
  }
}

export async function saveTransactionToFirestore(tx: Transaction) {
  try {
    await setDoc(doc(db, TRANSACTIONS_COL, tx.id), tx);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${TRANSACTIONS_COL}/${tx.id}`);
  }
}

export async function deleteTransactionFromFirestore(txId: string) {
  try {
    await deleteDoc(doc(db, TRANSACTIONS_COL, txId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${TRANSACTIONS_COL}/${txId}`);
  }
}

export async function saveExpenseToFirestore(expense: Expense) {
  try {
    await setDoc(doc(db, EXPENSES_COL, expense.id), expense);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${EXPENSES_COL}/${expense.id}`);
  }
}

export async function deleteExpenseFromFirestore(expenseId: string) {
  try {
    await deleteDoc(doc(db, EXPENSES_COL, expenseId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${EXPENSES_COL}/${expenseId}`);
  }
}

export async function saveContractorToFirestore(contractor: Contractor) {
  try {
    await setDoc(doc(db, CONTRACTORS_COL, contractor.id), contractor);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${CONTRACTORS_COL}/${contractor.id}`);
  }
}

export async function deleteContractorFromFirestore(contractorId: string) {
  try {
    await deleteDoc(doc(db, CONTRACTORS_COL, contractorId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${CONTRACTORS_COL}/${contractorId}`);
  }
}

export async function saveContractorPaymentToFirestore(payment: ContractorPayment) {
  try {
    await setDoc(doc(db, CONTRACTOR_PAYMENTS_COL, payment.id), payment);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${CONTRACTOR_PAYMENTS_COL}/${payment.id}`);
  }
}

export async function deleteContractorPaymentFromFirestore(paymentId: string) {
  try {
    await deleteDoc(doc(db, CONTRACTOR_PAYMENTS_COL, paymentId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${CONTRACTOR_PAYMENTS_COL}/${paymentId}`);
  }
}
