import React, { useState, useEffect, useRef } from 'react';
import { Save, Building, User as UserIcon, Upload, Trash2, Plus } from 'lucide-react';
import { getSettings, saveSettings, fileToBase64, getUsers, saveUsers } from '../services/mockData';
import { SchoolSettings, User } from '../types';

const Settings = () => {
  const [settings, setSettings] = useState<SchoolSettings>(getSettings());
  const [users, setUsers] = useState<User[]>(getUsers());
  const fileInputRef = useRef<HTMLInputElement>(null);

  // User Management State
  const [newUser, setNewUser] = useState({ username: '', password: '', fullName: '', role: 'user' as 'user' | 'admin' });

  useEffect(() => {
    setSettings(getSettings());
    setUsers(getUsers());
  }, []);

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveSettings = () => {
    saveSettings(settings);
    alert('Pengaturan Lembaga berhasil disimpan!');
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500000) { // Limit 500kb
        alert('Ukuran file terlalu besar! Maksimal 500KB.');
        return;
      }
      try {
        const base64 = await fileToBase64(file);
        setSettings(prev => ({ ...prev, logoUrl: base64 }));
      } catch (error) {
        alert('Gagal mengupload gambar.');
      }
    }
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.username || !newUser.password) return;

    if (users.some(u => u.username === newUser.username)) {
      alert('Username sudah digunakan!');
      return;
    }

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    saveUsers(updatedUsers);
    setNewUser({ username: '', password: '', fullName: '', role: 'user' });
    alert('User berhasil ditambahkan.');
  };

  const handleDeleteUser = (username: string) => {
    if (username === 'admin') {
      alert('User admin utama tidak bisa dihapus!');
      return;
    }
    if (window.confirm('Hapus user ini?')) {
      const updated = users.filter(u => u.username !== username);
      setUsers(updated);
      saveUsers(updated);
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-slate-800">Pengaturan Sistem</h2>

      {/* Identity Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2 font-semibold text-slate-700">
          <Building size={20} /> Identitas Lembaga & Laporan
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lembaga</label>
              <input
                type="text"
                name="name"
                value={settings.name}
                onChange={handleSettingsChange}
                className="w-full border rounded-lg px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Alamat Lengkap</label>
              <textarea
                name="address"
                value={settings.address}
                onChange={handleSettingsChange}
                className="w-full border rounded-lg px-4 py-2 h-24"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Header Struk (Custom)</label>
              <input
                type="text"
                name="receiptHeader"
                value={settings.receiptHeader}
                onChange={handleSettingsChange}
                className="w-full border rounded-lg px-4 py-2"
                placeholder="Contoh: BUKTI PEMBAYARAN SAH"
              />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nama Kepala Sekolah</label>
              <input
                type="text"
                name="principalName"
                value={settings.principalName}
                onChange={handleSettingsChange}
                className="w-full border rounded-lg px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">No. HP Kepala Sekolah</label>
              <input
                type="text"
                name="principalPhone"
                value={settings.principalPhone}
                onChange={handleSettingsChange}
                className="w-full border rounded-lg px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Logo Lembaga</label>
              <div className="flex items-center gap-4">
                {settings.logoUrl && (
                  <img src={settings.logoUrl} alt="Logo" className="h-16 w-16 object-contain border rounded" />
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
                >
                  <Upload size={16} /> Upload Logo
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLogoUpload}
                  className="hidden"
                  accept="image/*"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">Format gambar (png/jpg). Maks 500KB.</p>
            </div>
          </div>
        </div>
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button 
            onClick={handleSaveSettings}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Save size={18} /> Simpan Pengaturan
          </button>
        </div>
      </div>

      {/* User Management Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2 font-semibold text-slate-700">
          <UserIcon size={20} /> Manajemen User (Admin & Staff)
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Add User Form */}
            <div className="lg:col-span-1 border-r pr-8">
              <h3 className="font-medium text-slate-800 mb-4">Tambah User Baru</h3>
              <form onSubmit={handleAddUser} className="space-y-3">
                <input
                  type="text"
                  placeholder="Username"
                  required
                  value={newUser.username}
                  onChange={e => setNewUser({...newUser, username: e.target.value})}
                  className="w-full border rounded-lg px-4 py-2"
                />
                <input
                  type="password"
                  placeholder="Password"
                  required
                  value={newUser.password}
                  onChange={e => setNewUser({...newUser, password: e.target.value})}
                  className="w-full border rounded-lg px-4 py-2"
                />
                <input
                  type="text"
                  placeholder="Nama Lengkap"
                  required
                  value={newUser.fullName}
                  onChange={e => setNewUser({...newUser, fullName: e.target.value})}
                  className="w-full border rounded-lg px-4 py-2"
                />
                <select
                  value={newUser.role}
                  onChange={e => setNewUser({...newUser, role: e.target.value as 'admin' | 'user'})}
                  className="w-full border rounded-lg px-4 py-2 bg-white"
                >
                  <option value="user">User (Hanya Transaksi)</option>
                  <option value="admin">Admin (Full Akses)</option>
                </select>
                <button type="submit" className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 flex justify-center items-center gap-2">
                  <Plus size={18} /> Tambah User
                </button>
              </form>
            </div>

            {/* User List */}
            <div className="lg:col-span-2">
              <h3 className="font-medium text-slate-800 mb-4">Daftar User Aktif</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b text-sm text-slate-500">
                      <th className="py-2">Username</th>
                      <th className="py-2">Nama</th>
                      <th className="py-2">Role</th>
                      <th className="py-2 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.username} className="border-b last:border-0 hover:bg-slate-50">
                        <td className="py-3 font-medium">{u.username}</td>
                        <td className="py-3">{u.fullName}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          {u.username !== 'admin' && (
                            <button onClick={() => handleDeleteUser(u.username)} className="text-rose-500 hover:text-rose-700">
                              <Trash2 size={18} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
