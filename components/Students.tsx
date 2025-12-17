import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Upload, Download, Edit, Trash2, X, Save, User, Camera } from 'lucide-react';
import { getStudents, saveStudents, formatCurrency, fileToBase64 } from '../services/mockData';
import { Student } from '../types';
import * as XLSX from 'xlsx';

const Students = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<Student>({
    id: '',
    name: '',
    class: '',
    phone: '',
    sppAmount: 0
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const lower = searchQuery.toLowerCase();
      setFilteredStudents(students.filter(s => 
        s.name.toLowerCase().includes(lower) || 
        s.id.toLowerCase().includes(lower) ||
        s.class.toLowerCase().includes(lower)
      ));
    } else {
      setFilteredStudents(students);
    }
  }, [searchQuery, students]);

  const loadStudents = () => {
    const data = getStudents();
    setStudents(data);
    setFilteredStudents(data);
  };

  // --- CRUD Operations ---

  const handleAdd = () => {
    setIsEditMode(false);
    setCurrentStudent({ id: '', name: '', class: '', phone: '', sppAmount: 0 });
    setIsModalOpen(true);
  };

  const handleEdit = (student: Student) => {
    setIsEditMode(true);
    setCurrentStudent({ ...student });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data siswa ini?')) {
      const updated = students.filter(s => s.id !== id);
      setStudents(updated);
      saveStudents(updated);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    let updatedList = [...students];
    
    if (isEditMode) {
      const index = updatedList.findIndex(s => s.id === currentStudent.id);
      if (index !== -1) {
        updatedList[index] = currentStudent;
      }
    } else {
      // Check duplicate ID
      if (updatedList.some(s => s.id === currentStudent.id)) {
        alert('NIS sudah terdaftar!');
        return;
      }
      updatedList.push(currentStudent);
    }

    setStudents(updatedList);
    saveStudents(updatedList);
    setIsModalOpen(false);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1000000) { // 1MB limit for student photo
        alert('Ukuran foto maksimal 1MB');
        return;
      }
      try {
        const base64 = await fileToBase64(file);
        setCurrentStudent(prev => ({ ...prev, photoUrl: base64 }));
      } catch (error) {
        alert('Gagal upload foto');
      }
    }
  };

  // --- Excel Import/Export ---

  const handleExport = () => {
    const dataToExport = students.map(s => ({
      'NIS': s.id,
      'Nama Siswa': s.name,
      'Kelas': s.class,
      'No HP': s.phone,
      'Tagihan SPP': s.sppAmount
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Siswa");
    XLSX.writeFile(wb, "Data_Siswa.xlsx");
  };

  const triggerImport = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);

      const newStudents: Student[] = [];
      let importedCount = 0;

      data.forEach((row: any) => {
        const id = row['NIS'] || row['nis'] || row['ID'];
        const name = row['Nama Siswa'] || row['Nama'] || row['nama'];
        
        if (id && name) {
            newStudents.push({
                id: String(id),
                name: String(name),
                class: String(row['Kelas'] || row['kelas'] || ''),
                phone: String(row['No HP'] || row['HP'] || row['hp'] || ''),
                sppAmount: Number(row['Tagihan SPP'] || row['SPP'] || row['spp'] || 0)
            });
            importedCount++;
        }
      });

      if (newStudents.length > 0) {
        const currentIds = new Set(students.map(s => s.id));
        const finalStudents = [...students];

        newStudents.forEach(ns => {
            if (currentIds.has(ns.id)) {
                const idx = finalStudents.findIndex(s => s.id === ns.id);
                finalStudents[idx] = { ...finalStudents[idx], ...ns }; // Merge to keep photos if re-importing info
            } else {
                finalStudents.push(ns);
            }
        });

        setStudents(finalStudents);
        saveStudents(finalStudents);
        alert(`Berhasil mengimport ${importedCount} data siswa.`);
      } else {
        alert('Gagal membaca data. Pastikan format Excel benar.');
      }
      
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Manajemen Data Siswa</h2>
        <div className="flex gap-2">
          <button 
            onClick={handleAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-sm"
          >
            <Plus size={18} /> Tambah Siswa
          </button>
          <button 
            onClick={triggerImport}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 flex items-center gap-2 shadow-sm"
          >
            <Upload size={18} /> Import Excel
          </button>
          <button 
            onClick={handleExport}
            className="bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-700 flex items-center gap-2 shadow-sm"
          >
            <Download size={18} /> Export
          </button>
          <input 
            type="file" 
            accept=".xlsx, .xls" 
            ref={fileInputRef} 
            onChange={handleImport} 
            className="hidden" 
          />
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-3 text-slate-400" />
          <input 
            type="text" 
            placeholder="Cari berdasarkan NIS, Nama, atau Kelas..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-sm uppercase">
              <tr>
                <th className="px-6 py-3 font-semibold">Foto</th>
                <th className="px-6 py-3 font-semibold">NIS</th>
                <th className="px-6 py-3 font-semibold">Nama Siswa</th>
                <th className="px-6 py-3 font-semibold">Kelas</th>
                <th className="px-6 py-3 font-semibold">No. HP</th>
                <th className="px-6 py-3 font-semibold">Tagihan SPP</th>
                <th className="px-6 py-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                    Tidak ada data siswa ditemukan.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden border">
                        {student.photoUrl ? (
                          <img src={student.photoUrl} alt={student.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <User size={20} />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-slate-500">{student.id}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">{student.name}</td>
                    <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-semibold">
                            {student.class}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{student.phone}</td>
                    <td className="px-6 py-4 text-emerald-600 font-medium">
                      {formatCurrency(student.sppAmount)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                            onClick={() => handleEdit(student)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                        >
                            <Edit size={18} />
                        </button>
                        <button 
                            onClick={() => handleDelete(student.id)}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Hapus"
                        >
                            <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">
                {isEditMode ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="flex gap-6">
                {/* Left: Photo Upload */}
                <div className="w-1/3 flex flex-col items-center gap-3">
                   <div className="w-32 h-32 rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden relative group cursor-pointer" onClick={() => photoInputRef.current?.click()}>
                     {currentStudent.photoUrl ? (
                       <img src={currentStudent.photoUrl} className="w-full h-full object-cover" />
                     ) : (
                       <div className="text-center text-slate-400">
                         <Camera size={32} className="mx-auto mb-1" />
                         <span className="text-xs">Upload Foto</span>
                       </div>
                     )}
                     <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                       <span className="text-xs">Ubah</span>
                     </div>
                   </div>
                   <input 
                     type="file" 
                     ref={photoInputRef}
                     onChange={handlePhotoUpload}
                     className="hidden"
                     accept="image/*"
                   />
                </div>

                {/* Right: Inputs */}
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700 block mb-1">NIS (ID)</label>
                      <input 
                        type="text" 
                        required
                        disabled={isEditMode}
                        value={currentStudent.id}
                        onChange={(e) => setCurrentStudent({...currentStudent, id: e.target.value})}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${isEditMode ? 'bg-slate-100 text-slate-500' : ''}`}
                        placeholder="Contoh: 2024001"
                      />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-700 block mb-1">Kelas</label>
                        <input 
                            type="text" 
                            required
                            value={currentStudent.class}
                            onChange={(e) => setCurrentStudent({...currentStudent, class: e.target.value})}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Contoh: X-A"
                        />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Nama Lengkap</label>
                    <input 
                        type="text" 
                        required
                        value={currentStudent.name}
                        onChange={(e) => setCurrentStudent({...currentStudent, name: e.target.value})}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Nama Siswa"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Nomor HP (WhatsApp)</label>
                    <input 
                      type="text" 
                      value={currentStudent.phone}
                      onChange={(e) => setCurrentStudent({...currentStudent, phone: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="628..."
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Nominal SPP (Rp)</label>
                    <input 
                      type="number" 
                      required
                      value={currentStudent.sppAmount}
                      onChange={(e) => setCurrentStudent({...currentStudent, sppAmount: Number(e.target.value)})}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3 border-t">
                <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                    Batal
                </button>
                <button 
                    type="submit" 
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex justify-center items-center gap-2"
                >
                    <Save size={18} />
                    {isEditMode ? 'Simpan Perubahan' : 'Tambah Siswa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
