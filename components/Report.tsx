import React, { useState, useEffect } from 'react';
import { getTransactions, formatCurrency, getSettings, getExpenses } from '../services/mockData';
import { Transaction, MONTHS } from '../types';
import { Download, Search, Filter, FileBarChart, List } from 'lucide-react';
import * as XLSX from 'xlsx';

const Report = () => {
  const [activeTab, setActiveTab] = useState<'history' | 'principal'>('history');
  
  // History State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTrx, setFilteredTrx] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  // Principal Report State
  const [principalReport, setPrincipalReport] = useState<any[]>([]);
  const settings = getSettings();

  useEffect(() => {
    const data = getTransactions();
    setTransactions(data);
    setFilteredTrx(data);
    generatePrincipalReport();
  }, []);

  useEffect(() => {
    let result = transactions;

    if (filterType !== 'ALL') {
      result = result.filter(t => t.type === filterType);
    }

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(t => 
        t.studentName.toLowerCase().includes(lower) || 
        t.category.toLowerCase().includes(lower) ||
        t.id.toLowerCase().includes(lower)
      );
    }

    setFilteredTrx(result);
  }, [searchTerm, filterType, transactions]);

  const generatePrincipalReport = () => {
    const trx = getTransactions();
    const exp = getExpenses();
    const currentYear = new Date().getFullYear();

    const report = MONTHS.map((month, index) => {
      // Filter by month (simple check based on date string)
      // Note: In real app, check full date. Here assuming 2024 for mock data
      const monthIndex = index;
      
      const income = trx
        .filter(t => new Date(t.date).getMonth() === monthIndex && new Date(t.date).getFullYear() === currentYear)
        .reduce((sum, t) => sum + t.amount, 0);

      const expense = exp
        .filter(e => new Date(e.date).getMonth() === monthIndex && new Date(e.date).getFullYear() === currentYear)
        .reduce((sum, e) => sum + e.amount, 0);

      return {
        month,
        income,
        expense,
        balance: income - expense
      };
    });

    setPrincipalReport(report);
  };

  const handleExport = () => {
    if (activeTab === 'history') {
      const header = "ID,Tanggal,Nama Siswa,Kategori,Nominal,Petugas\n";
      const rows = filteredTrx.map(t => 
        `${t.id},${t.date},${t.studentName},${t.category},${t.amount},${t.pic}`
      ).join("\n");
      const blob = new Blob([header + rows], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Laporan_Transaksi.csv`;
      a.click();
    } else {
      const ws = XLSX.utils.json_to_sheet(principalReport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Laporan Bulanan");
      XLSX.writeFile(wb, "Laporan_Kepala_Sekolah.xlsx");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Laporan & Riwayat</h2>
        <div className="flex gap-2">
           <button 
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${activeTab === 'history' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border'}`}
          >
            <List size={16} /> Riwayat Transaksi
          </button>
           <button 
            onClick={() => setActiveTab('principal')}
            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${activeTab === 'principal' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border'}`}
          >
            <FileBarChart size={16} /> Laporan Kepala Sekolah
          </button>
        </div>
      </div>

      {activeTab === 'history' ? (
        <>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-3 text-slate-400" />
              <input 
                type="text" 
                placeholder="Cari ID, Nama Siswa, atau Kategori..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-slate-400" />
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border rounded-lg px-4 py-2 outline-none bg-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">Semua Transaksi</option>
                <option value="IN">Pemasukan (IN)</option>
              </select>
            </div>
             <button 
              onClick={handleExport}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 flex items-center gap-2 shadow-sm"
            >
              <Download size={18} /> CSV
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-sm uppercase">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Waktu</th>
                    <th className="px-6 py-3 font-semibold">ID Transaksi</th>
                    <th className="px-6 py-3 font-semibold">Siswa</th>
                    <th className="px-6 py-3 font-semibold">Kategori</th>
                    <th className="px-6 py-3 font-semibold">Admin</th>
                    <th className="px-6 py-3 font-semibold text-right">Nominal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTrx.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                        Tidak ada data transaksi ditemukan.
                      </td>
                    </tr>
                  ) : (
                    filteredTrx.map((trx) => (
                      <tr key={trx.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-slate-600 text-sm">
                          {new Date(trx.date).toLocaleDateString('id-ID')}
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-400">{trx.id}</td>
                        <td className="px-6 py-4 font-medium text-slate-800">{trx.studentName}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-medium border border-green-100">
                            {trx.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-sm">{trx.pic}</td>
                        <td className="px-6 py-4 text-right font-bold text-slate-700">
                          {formatCurrency(trx.amount)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 text-center">
             <h3 className="text-xl font-bold uppercase">{settings.name}</h3>
             <p className="text-slate-500">{settings.address}</p>
             <div className="mt-8 mb-4 border-b pb-4">
                <h2 className="text-2xl font-bold text-slate-800">Laporan Bulanan Kepala Sekolah</h2>
                <p className="text-slate-500">Tahun Anggaran {new Date().getFullYear()}</p>
             </div>
             
             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="bg-slate-100 border-y border-slate-200">
                     <th className="py-3 px-4 font-semibold text-slate-700">Bulan</th>
                     <th className="py-3 px-4 font-semibold text-slate-700 text-right">Pemasukan</th>
                     <th className="py-3 px-4 font-semibold text-slate-700 text-right">Pengeluaran</th>
                     <th className="py-3 px-4 font-semibold text-slate-700 text-right">Saldo</th>
                   </tr>
                 </thead>
                 <tbody>
                   {principalReport.map((row) => (
                     <tr key={row.month} className="border-b hover:bg-slate-50">
                       <td className="py-3 px-4 font-medium">{row.month}</td>
                       <td className="py-3 px-4 text-right text-emerald-600">{formatCurrency(row.income)}</td>
                       <td className="py-3 px-4 text-right text-rose-600">{formatCurrency(row.expense)}</td>
                       <td className="py-3 px-4 text-right font-bold text-blue-600">{formatCurrency(row.balance)}</td>
                     </tr>
                   ))}
                 </tbody>
                 <tfoot>
                   <tr className="bg-slate-50 font-bold border-t border-slate-300">
                     <td className="py-4 px-4">TOTAL TAHUNAN</td>
                     <td className="py-4 px-4 text-right text-emerald-700">
                       {formatCurrency(principalReport.reduce((acc, curr) => acc + curr.income, 0))}
                     </td>
                     <td className="py-4 px-4 text-right text-rose-700">
                       {formatCurrency(principalReport.reduce((acc, curr) => acc + curr.expense, 0))}
                     </td>
                     <td className="py-4 px-4 text-right text-blue-700">
                       {formatCurrency(principalReport.reduce((acc, curr) => acc + curr.balance, 0))}
                     </td>
                   </tr>
                 </tfoot>
               </table>
             </div>

             <div className="mt-12 flex justify-end">
               <div className="text-center w-64">
                 <p className="mb-20">Mengetahui,</p>
                 <p className="font-bold underline">{settings.principalName}</p>
                 <p className="text-sm text-slate-500">Kepala Sekolah</p>
               </div>
             </div>
          </div>
          <div className="flex justify-end">
            <button 
              onClick={handleExport}
              className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 flex items-center gap-2 shadow-sm"
            >
              <Download size={18} /> Download Excel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Report;
