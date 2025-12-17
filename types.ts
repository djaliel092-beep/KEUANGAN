export interface Student {
  id: string; // NIS
  name: string;
  class: string;
  sppAmount: number;
  phone: string;
  photoUrl?: string; // Base64 string for photo
}

export interface Transaction {
  id: string;
  date: string;
  studentId: string;
  studentName: string;
  category: string; // e.g., "SPP - Januari", "Uang Gedung"
  amount: number;
  type: 'IN' | 'OUT'; // IN = Pemasukan, OUT = Pengeluaran
  notes?: string;
  pic: string; // Person In Charge (Admin/User)
}

export interface Expense {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  executor: string;
}

export interface FeeType {
  id: string;
  name: string;
  amount: number;
}

export interface SchoolSettings {
  name: string;
  address: string;
  principalName: string;
  principalPhone: string;
  logoUrl?: string; // Base64
  receiptHeader?: string; // Custom HTML or Text for receipt header
}

export interface User {
  username: string;
  password: string; // In real app, this should be hashed
  role: 'admin' | 'user';
  fullName: string;
}

export const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];
