import React, { useState, useEffect } from 'react';
import { Search, User, CreditCard, Send, CheckCircle, Printer, X } from 'lucide-react';
import { getStudents, getFees, addTransaction, formatCurrency, generateWhatsAppLink, getSettings } from '../services/mockData';
import { Student, FeeType, MONTHS, Transaction, SchoolSettings } from '../types';

const Payment = () => {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [students] = useState<Student[]>(getStudents());
  const [fees] = useState<FeeType[]>(getFees());
  
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedFeeType, setSelectedFeeType] = useState<string>('SPP');
  const [selectedMonth, setSelectedMonth] = useState<string>(MONTHS[new Date().getMonth()]);
  const [amount, setAmount] = useState<number>(0);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [settings, setSettings] = useState<SchoolSettings>(getSettings());

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  // Handlers
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    
    // Find by NIS or Name (case insensitive)
    const found = students.find(s => 
      s.id === searchQuery || 
      s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (found) {
      setSelectedStudent(found);
      setAmount(found.sppAmount); // Default to SPP amount
      setSearchQuery('');
    } else {
      alert('Siswa tidak ditemukan!');
      setSelectedStudent(null);
    }
  };

  const handleFeeTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value;
    setSelectedFeeType(type);
    
    if (type === 'SPP') {
      if (selectedStudent) setAmount(selectedStudent.sppAmount);
    } else {
      const fee = fees.find(f => f.name === type);
      if (fee) setAmount(fee.amount);
    }
  };

  const handleProcessPayment = () => {
    if (!selectedStudent || amount <= 0) return;

    const currentUser = JSON.parse(localStorage.getItem('edu_user_session') || '{}');

    const categoryName = selectedFeeType === 'SPP' 
      ? `SPP - ${selectedMonth}` 
      : selectedFeeType;

    const newTrx: Transaction = {
      id: `TRX-${Date.now()}`,
      date: new Date().toISOString(),
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      category: categoryName,
      amount: amount,
      type: 'IN',
      pic: currentUser.username || 'Admin', 
    };

    addTransaction(newTrx);
    setLastTransaction(newTrx);
    alert('Pembayaran Berhasil Disimpan!');
  };

  const handleWhatsApp = () => {
    if (!lastTransaction || !selectedStudent) return;
    
    const msg = `*${settings.receiptHeader}*\n${settings.name}\n\n` +
      `Terima Kasih.\n` +
      `Telah diterima pembayaran dari:\n` +
      `Nama: *${selectedStudent.name}*\n` +
      `Kelas: ${selectedStudent.class}\n` +
      `Untuk: ${lastTransaction.category}\n` +
      `Nominal: ${formatCurrency(lastTransaction.amount)}\n\n` +
      `Status: *LUNAS*\n` +
      `Ref: ${lastTransaction.id}`;

    const url = generateWhatsAppLink(selectedStudent.phone, msg);
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Pembayaran (Transaksi Masuk)</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Search & Student Info */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Search size={18} /> Cari Siswa
            </h3>
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Masukkan NIS atau Nama..."
                className="flex-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Cari
              </button>
            </form>
          </div>

          {selectedStudent && (
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center overflow-hidden">
                  {selectedStudent.photoUrl ? (
                     <img src={selectedStudent.photoUrl} alt="Student" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl font-bold">{selectedStudent.name.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{selectedStudent.name}</h3>
                  <p className="text-slate-400 text-sm">{selectedStudent.id}</p>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-slate-400">Kelas</span>
                  <span className="font-medium">{selectedStudent.class}</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-slate-400">Tagihan SPP</span>
                  <span className="font-medium">{formatCurrency(selectedStudent.sppAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">No. HP</span>
                  <span className="font-medium">{selectedStudent.phone}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Middle Column: Payment Form */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-full">
            <h3 className="font-semibold mb-6 flex items-center gap-2 text-lg border-b pb-4">
              <CreditCard size={20} className="text-blue-600" /> Form Pembayaran
            </h3>

            {!selectedStudent ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                <User size={48} className="mb-2 opacity-50" />
                <p>Silakan cari dan pilih siswa terlebih dahulu.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Jenis Tagihan</label>
                    <select 
                      value={selectedFeeType} 
                      onChange={handleFeeTypeChange}
                      className="w-full border rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="SPP">SPP Bulanan</option>
                      {fees.map(fee => (
                        <option key={fee.id} value={fee.name}>{fee.name}</option>
                      ))}
                    </select>
                  </div>

                  {selectedFeeType === 'SPP' && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Bulan</label>
                      <select 
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="w-full border rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        {MONTHS.map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Nominal Bayar (Rp)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full border rounded-lg px-4 py-3 text-xl font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="pt-4 flex gap-4">
                  <button 
                    onClick={handleProcessPayment}
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold flex justify-center items-center gap-2 transition-all active:scale-95"
                  >
                    <CheckCircle size={20} />
                    Simpan Pembayaran
                  </button>
                </div>

                {lastTransaction && lastTransaction.studentId === selectedStudent.id && (
                  <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2 text-green-700 font-medium">
                        <CheckCircle size={18} /> Transaksi Berhasil!
                      </div>
                      <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                        {lastTransaction.id}
                      </span>
                    </div>
                    <p className="text-sm text-green-800 mb-4">
                      Pembayaran {lastTransaction.category} sebesar <strong>{formatCurrency(lastTransaction.amount)}</strong> telah disimpan.
                    </p>
                    <div className="flex gap-3">
                      <button 
                        onClick={handleWhatsApp}
                        className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-700 flex items-center justify-center gap-2"
                      >
                        <Send size={16} /> Kirim WA
                      </button>
                      <button 
                        onClick={() => setShowReceipt(true)}
                        className="flex-1 bg-slate-700 text-white px-3 py-2 rounded-lg text-sm hover:bg-slate-800 flex items-center justify-center gap-2"
                      >
                        <Printer size={16} /> Cetak Struk
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Printable Receipt Modal */}
      {showReceipt && lastTransaction && selectedStudent && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden relative">
            <button 
              onClick={() => setShowReceipt(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 print:hidden"
            >
              <X size={24} />
            </button>
            
            <div id="receipt-area" className="p-8">
              {/* Header */}
              <div className="text-center border-b pb-6 mb-6">
                {settings.logoUrl && (
                  <img src={settings.logoUrl} alt="Logo" className="h-16 mx-auto mb-2" />
                )}
                <h2 className="text-xl font-bold uppercase tracking-wide text-slate-800">{settings.name}</h2>
                <p className="text-sm text-slate-500 px-8">{settings.address}</p>
                <div className="mt-4 inline-block px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded uppercase">
                  {settings.receiptHeader || "Bukti Pembayaran"}
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">No. Ref</span>
                  <span className="font-mono">{lastTransaction.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tanggal</span>
                  <span>{new Date(lastTransaction.date).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between border-b pb-2 mb-2">
                  <span className="text-slate-500">Petugas</span>
                  <span>{lastTransaction.pic}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Siswa</span>
                  <span className="font-semibold">{selectedStudent.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Kelas</span>
                  <span>{selectedStudent.class}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded border border-slate-100 mt-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-slate-700">{lastTransaction.category}</span>
                  </div>
                  <div className="flex justify-between items-center text-lg font-bold text-slate-800">
                    <span>Total Bayar</span>
                    <span>{formatCurrency(lastTransaction.amount)}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center mt-8 text-xs text-slate-400">
                <p>Terima kasih atas pembayaran Anda.</p>
                <p>Simpan struk ini sebagai bukti pembayaran yang sah.</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t flex gap-3 print:hidden">
              <button 
                onClick={() => window.print()}
                className="flex-1 bg-slate-800 text-white py-2 rounded-lg font-medium hover:bg-slate-900"
              >
                Print Sekarang
              </button>
            </div>
            
            {/* Print Styles */}
            <style>{`
              @media print {
                body * { visibility: hidden; }
                #receipt-area, #receipt-area * { visibility: visible; }
                #receipt-area { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; }
              }
            `}</style>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payment;
