export interface Worker {
  id: string;
  name: string;
  mobile: string;
  designation: string;
  joiningDate: string;
  monthlySalary: number;
  dailyWage: number;
  status: 'Active' | 'Inactive';
  remarks: string;
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'HALF_DAY';

export interface Attendance {
  id: string;
  workerId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
}

export type TransactionType = 'Salary Advance' | 'Site Expense' | 'Other';

export interface Transaction {
  id: string;
  workerId: string;
  date: string; // YYYY-MM-DD
  amount: number;
  type: TransactionType;
  remarks: string;
}

export interface Expense {
  id: string;
  transactionId: string; // Links to a 'Site Expense' transaction
  name: string;
  amount: number;
  date: string; // YYYY-MM-DD
}
