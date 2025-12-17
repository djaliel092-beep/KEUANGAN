import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Wallet } from 'lucide-react';
import { getDashboardStats, formatCurrency } from '../services/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const StatCard = ({ title, value, icon: Icon, colorClass, subText }: any) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 transition-transform hover:-translate-y-1">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
      </div>
      <div className={`p-3 rounded-full ${colorClass}`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
    {subText && <p className="text-xs text-slate-400 mt-4">{subText}</p>}
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    setStats(getDashboardStats());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!stats) return <div>Loading...</div>;

  const chartData = [
    { name: 'Target', value: stats.target, color: '#f59e0b' },
    { name: 'Masuk', value: stats.totalIncome, color: '#10b981' },
    { name: 'Keluar', value: stats.totalExpense, color: '#ef4444' },
    { name: 'Saldo', value: stats.balance, color: '#3b82f6' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Dashboard Keuangan</h2>
          <p className="text-slate-500">
            {currentTime.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border text-xl font-mono text-blue-600 font-bold">
          {currentTime.toLocaleTimeString('id-ID')}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Pemasukan" 
          value={formatCurrency(stats.totalIncome)} 
          icon={TrendingUp} 
          colorClass="bg-emerald-500" 
          subText="Akumulasi pembayaran diterima"
        />
        <StatCard 
          title="Tunggakan (Estimasi)" 
          value={formatCurrency(stats.totalArrears)} 
          icon={Wallet} 
          colorClass="bg-rose-500" 
          subText="Selisih Target vs Masuk"
        />
        <StatCard 
          title="Total Pengeluaran" 
          value={formatCurrency(stats.totalExpense)} 
          icon={TrendingDown} 
          colorClass="bg-amber-500" 
          subText="Biaya operasional sekolah"
        />
        <StatCard 
          title="Sisa Kas (Saldo)" 
          value={formatCurrency(stats.balance)} 
          icon={DollarSign} 
          colorClass="bg-blue-600" 
          subText="Dana tersedia saat ini"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">Analisa Keuangan</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tickFormatter={(val) => `Rp${val/1000}k`} 
              />
              <Tooltip 
                formatter={(val: number) => formatCurrency(val)}
                cursor={{ fill: 'transparent' }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
