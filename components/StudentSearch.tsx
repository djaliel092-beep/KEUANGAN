import React, { useState } from 'react';
import { Search, User, CheckCircle, XCircle } from 'lucide-react';
import { getStudents, getTransactions, formatCurrency, getSettings } from '../services/mockData';
import { Student, Transaction, MONTHS } from '../types';

const StudentSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [student, setStudent] = useState<Student | null>(null);
  const [history, setHistory] = useState<Transaction[]>([]);
  const [monthlyStatus, setMonthlyStatus] = useState<{month: string, status: 'paid' | 'unpaid'}[]>([]);

  const settings = getSettings();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const students = getStudents();
    const found = students.find(s => 
      s.id === searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (found) {
      setStudent(found);
      const allTrx = getTransactions();
      const studentTrx = allTrx.filter(t => t.studentId === found.id);
      
      // Sort by date desc
      studentTrx.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setHistory(studentTrx);

      // Calculate SPP Status for current year
      const status = MONTHS.map(month => {
        const isPaid = studentTrx.some(t => 
          t.category.includes('SPP') && t.category.includes(month)
        );
        return { month, status: isPaid ? 'paid' : 'unpaid' as 'paid' | 'unpaid' };
      });
      setMonthlyStatus(status);

    } else {
      setStudent(null);
      alert('Siswa tidak ditemukan');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Cari Murid & Riwayat</h2>

      {/* Search Bar */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search size={20} className="absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Masukkan NIS atau Nama Siswa..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium">
            Cari Data
          </button>
        </form>
      </div>

      {student && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
          
          {/* Profile Card */}
          <div className="md:col-span-1 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-slate-800 h-24 relative">
              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                <div className="w-24 h-24 bg-white rounded-full p-1 shadow-lg">
                  {student.photoUrl ? (
                    <img src={student.photoUrl} alt={student.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <div className="w-full h-full rounded-full bg-slate-200 flex items-center justify-center text-slate-400">
                      <User size={40} />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="pt-14 pb-6 px-6 text-center">
              <h3 className="text-xl font-bold text-slate-800">{student.name}</h3>
              <p className="text-slate-500">{student.id}</p>
              <div className="mt-4 space-y-2 text-sm text-left border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-slate-500">Kelas</span>
                  <span className="font-medium">{student.class}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tagihan SPP</span>
                  <span className="font-medium">{formatCurrency(student.sppAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">No. HP</span>
                  <span className="font-medium">{student.phone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* SPP Status Grid */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
              <h3 className="font-semibold text-slate-800 mb-4">Status Pembayaran SPP (Tahun Ini)</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {monthlyStatus.map((item) => (
                  <div 
                    key={item.month} 
                    className={`p-3 rounded-lg border text-center text-sm font-medium flex flex-col items-center justify-center gap-1 ${
                      item.status === 'paid' 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                        : 'bg-rose-50 border-rose-200 text-rose-700'
                    }`}
                  >
                    <span>{item.month}</span>
                    {item.status === 'paid' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                  </div>
                ))}
              </div>
            </div>

            {/* Transaction History */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
              <h3 className="font-semibold text-slate-800 mb-4">Riwayat Transaksi Terakhir</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-4 py-2">Tanggal</th>
                      <th className="px-4 py-2">Kategori</th>
                      <th className="px-4 py-2 text-right">Nominal</th>
                      <th className="px-4 py-2 text-center">Petugas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {history.length > 0 ? (
                      history.slice(0, 5).map(trx => (
                        <tr key={trx.id}>
                          <td className="px-4 py-2">{new Date(trx.date).toLocaleDateString('id-ID')}</td>
                          <td className="px-4 py-2 font-medium text-blue-600">{trx.category}</td>
                          <td className="px-4 py-2 text-right">{formatCurrency(trx.amount)}</td>
                          <td className="px-4 py-2 text-center text-slate-500">{trx.pic}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-4 py-4 text-center text-slate-400">Belum ada transaksi.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentSearch;
