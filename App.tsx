import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Wallet, Receipt, Users, LogOut, Menu, X, CreditCard, Settings as SettingsIcon, Search as SearchIcon } from 'lucide-react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Payment from './components/Payment';
import Expenses from './components/Expenses';
import Report from './components/Report';
import Students from './components/Students';
import Settings from './components/Settings';
import StudentSearch from './components/StudentSearch';

// --- Sidebar Component ---
const Sidebar = ({ isOpen, toggle, logout, role }: { isOpen: boolean; toggle: () => void; logout: () => void; role: string }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', roles: ['admin'] },
    { icon: SearchIcon, label: 'Cari Murid', path: '/student-search', roles: ['admin', 'user'] },
    { icon: Wallet, label: 'Pembayaran', path: '/payment', roles: ['admin', 'user'] },
    { icon: Users, label: 'Data Siswa', path: '/students', roles: ['admin'] },
    { icon: CreditCard, label: 'Pengeluaran', path: '/expenses', roles: ['admin'] },
    { icon: Receipt, label: 'Laporan', path: '/report', roles: ['admin', 'user'] },
    { icon: SettingsIcon, label: 'Pengaturan', path: '/settings', roles: ['admin'] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(role));

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={toggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white transform transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 flex flex-col
      `}>
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-blue-400">EduFinance</h1>
            <p className="text-xs text-slate-400">Role: {role.toUpperCase()}</p>
          </div>
          <button onClick={toggle} className="md:hidden text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {filteredMenu.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  if (window.innerWidth < 768) toggle();
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Keluar Aplikasi</span>
          </button>
        </div>
      </div>
    </>
  );
};

// --- Main Layout ---
const MainLayout = ({ children, logout, role }: { children?: React.ReactNode; logout: () => void; role: string }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar 
        isOpen={sidebarOpen} 
        toggle={() => setSidebarOpen(false)} 
        logout={logout} 
        role={role}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 md:hidden z-10">
          <button onClick={() => setSidebarOpen(true)} className="text-slate-600">
            <Menu size={24} />
          </button>
          <span className="font-semibold text-slate-800">EduFinance Pro</span>
          <button onClick={logout} className="text-rose-500 p-2 rounded-full hover:bg-rose-50">
            <LogOut size={20} />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

// --- App Component ---
const App = () => {
  const [userSession, setUserSession] = useState<any>(() => {
    const saved = localStorage.getItem('edu_user_session');
    return saved ? JSON.parse(saved) : null;
  });

  const isAuthenticated = !!userSession;
  const userRole = userSession?.role || 'user';

  const handleLogin = () => {
    const saved = localStorage.getItem('edu_user_session');
    setUserSession(saved ? JSON.parse(saved) : null);
  };

  const handleLogout = () => {
    if (window.confirm("Apakah Anda yakin ingin keluar?")) {
      localStorage.removeItem('edu_user_session');
      setUserSession(null);
    }
  };

  return (
    <HashRouter>
      <Routes>
        <Route 
          path="/login" 
          element={!isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to={userRole === 'admin' ? "/dashboard" : "/payment"} />} 
        />
        
        <Route path="/" element={isAuthenticated ? <Navigate to={userRole === 'admin' ? "/dashboard" : "/payment"} /> : <Navigate to="/login" />} />
        
        <Route 
          path="/*" 
          element={
            isAuthenticated ? (
              <MainLayout logout={handleLogout} role={userRole}>
                <Routes>
                  {userRole === 'admin' && <Route path="/dashboard" element={<Dashboard />} />}
                  <Route path="/student-search" element={<StudentSearch />} />
                  <Route path="/payment" element={<Payment />} />
                  {userRole === 'admin' && <Route path="/students" element={<Students />} />}
                  {userRole === 'admin' && <Route path="/expenses" element={<Expenses />} />}
                  <Route path="/report" element={<Report />} />
                  {userRole === 'admin' && <Route path="/settings" element={<Settings />} />}
                  <Route path="*" element={<Navigate to={userRole === 'admin' ? "/dashboard" : "/payment"} />} />
                </Routes>
              </MainLayout>
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
      </Routes>
    </HashRouter>
  );
};

export default App;