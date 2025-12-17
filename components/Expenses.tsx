import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, FileText, User } from 'lucide-react';
import { getExpenses, addExpense, formatCurrency } from '../services/mockData';
import { Expense } from '../types';

const Expenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showModal, setShowModal] = useState(false);
  
  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [executor, setExecutor] = useState('');

  useEffect(() => {
    setExpenses(getExpenses());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category || !description) return;

    const newExpense: Expense = {
      id: `EXP-${Date.now()}`,
      date,
      category,
      description,
      amount: Number(amount),
      executor: executor || 'Admin',
    };

    addExpense(newExpense);
    setExpenses(getExpenses()); // Refresh
    setShowModal(false);
    
    // Reset form
    setCategory('');
    setDescription('');
    setAmount('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Data Pengeluaran</h2>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 flex items-center gap-2 shadow-sm"
        >
          <Plus size={20} /> Tambah Pengeluaran
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-sm uppercase">
              <tr>
                <th className="px-6 py-3 font-semibold">Tanggal</th>
                <th className="px-6 py-3 font-semibold">ID</th>
                <th className="px-6 py-3 font-semibold">Kategori</th>
                <th className="px-6 py-3 font-semibold">Keterangan</th>
                <th className="px-6 py-3 font-semibold">Petugas</th>
                <th className="px-6 py-3 font-semibold text-right">Nominal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    Belum ada data pengeluaran.
                  </td>
                </tr>
              ) : (
                expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-600">{exp.date}</td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">{exp.id}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs font-medium">
                        {exp.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-800">{exp.description}</td>
                    <td className="px-6 py-4 text-slate-600">{exp.executor}</td>
                    <td className="px-6 py-4 text-right font-medium text-amber-600">
                      {formatCurrency(exp.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Catat Pengeluaran Baru</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <Plus size={24} className="rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Tanggal</label>
                <div className="relative">
                  <Calendar size={18} className="absolute left-3 top-3 text-slate-400" />
                  <input 
                    type="date" 
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Kategori</label>
                <select 
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none bg-white"
                >
                  <option value="">Pilih Kategori...</option>
                  <option value="Operasional">Operasional</option>
                  <option value="ATK">ATK</option>
                  <option value="Honor Guru">Honor Guru</option>
                  <option value="Pemeliharaan">Pemeliharaan</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Keterangan</label>
                <div className="relative">
                  <FileText size={18} className="absolute left-3 top-3 text-slate-400" />
                  <input 
                    type="text" 
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Contoh: Beli Kertas A4"
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Nominal (Rp)</label>
                <input 
                  type="number" 
                  required
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Eksekutor (Opsional)</label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-3 text-slate-400" />
                  <input 
                    type="text" 
                    value={executor}
                    onChange={(e) => setExecutor(e.target.value)}
                    placeholder="Nama Petugas"
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button type="submit" className="w-full bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700 font-semibold shadow-md">
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
