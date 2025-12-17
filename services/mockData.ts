import { Student, Transaction, Expense, FeeType, SchoolSettings, User } from '../types';

// --- INITIAL DATA ---

const INITIAL_STUDENTS: Student[] = [
  { id: "2024001", name: "Ahmad Dahlan", class: "X-A", sppAmount: 150000, phone: "6281234567890" },
  { id: "2024002", name: "Siti Aminah", class: "X-B", sppAmount: 150000, phone: "6289876543210" },
  { id: "2024003", name: "Budi Santoso", class: "XI-IPA", sppAmount: 175000, phone: "6281122334455" },
];

const INITIAL_FEES: FeeType[] = [
  { id: "1", name: "Uang Gedung", amount: 1000000 },
  { id: "2", name: "Seragam", amount: 750000 },
  { id: "3", name: "Buku Paket", amount: 500000 },
];

const INITIAL_SETTINGS: SchoolSettings = {
  name: "SMA Teladan Bangsa",
  address: "Jl. Pendidikan No. 123, Jakarta Selatan",
  principalName: "Drs. H. Suwandi, M.Pd",
  principalPhone: "628111222333",
  receiptHeader: "BUKTI PEMBAYARAN SAH"
};

const INITIAL_USERS: User[] = [
  { username: 'admin', password: 'admin', role: 'admin', fullName: 'Administrator' },
  { username: 'kasir', password: 'kasir', role: 'user', fullName: 'Staff Tata Usaha' },
];

const STORAGE_KEYS = {
  STUDENTS: 'edu_students',
  TRANSACTIONS: 'edu_transactions',
  EXPENSES: 'edu_expenses',
  FEES: 'edu_fees',
  SETTINGS: 'edu_settings',
  USERS: 'edu_users'
};

// Helper to get from local storage
const getStorage = <T,>(key: string, initial: T): T => {
  const saved = localStorage.getItem(key);
  if (saved) return JSON.parse(saved);
  localStorage.setItem(key, JSON.stringify(initial));
  return initial;
};

// --- CORE SERVICES ---

// Students
export const getStudents = (): Student[] => getStorage(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
export const saveStudents = (students: Student[]): void => {
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
};

// Transactions
export const getTransactions = (): Transaction[] => getStorage(STORAGE_KEYS.TRANSACTIONS, []);
export const addTransaction = (trx: Transaction): void => {
  const current = getTransactions();
  const updated = [trx, ...current];
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updated));
};

// Expenses
export const getExpenses = (): Expense[] => getStorage(STORAGE_KEYS.EXPENSES, []);
export const addExpense = (exp: Expense): void => {
  const current = getExpenses();
  const updated = [exp, ...current];
  localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(updated));
};

// Fees
export const getFees = (): FeeType[] => getStorage(STORAGE_KEYS.FEES, INITIAL_FEES);

// Settings
export const getSettings = (): SchoolSettings => getStorage(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
export const saveSettings = (settings: SchoolSettings): void => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
};

// Users
export const getUsers = (): User[] => getStorage(STORAGE_KEYS.USERS, INITIAL_USERS);
export const saveUsers = (users: User[]): void => {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
};

// Auth
export const authenticateUser = (username: string, password: string): User | null => {
  const users = getUsers();
  const user = users.find(u => u.username === username && u.password === password);
  return user || null;
};

// Stats
export const getDashboardStats = () => {
  const transactions = getTransactions();
  const expenses = getExpenses();

  const totalIncome = transactions.reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  
  const students = getStudents();
  const estimatedTarget = students.reduce((acc, s) => acc + (s.sppAmount * 12), 0);
  const totalArrears = Math.max(0, estimatedTarget - totalIncome);

  return {
    totalIncome,
    totalExpense,
    totalArrears,
    balance: totalIncome - totalExpense,
    target: estimatedTarget
  };
};

// Utilities
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

export const generateWhatsAppLink = (phone: string, message: string) => {
  let cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '62' + cleanPhone.substring(1);
  }
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
};

// Helper to convert file to Base64
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};
