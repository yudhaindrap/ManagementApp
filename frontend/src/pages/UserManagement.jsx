import { useEffect, useState } from 'react';
import api from '../api/axios';
import { UserPlus, Shield, Trash2, Key, UserCheck, Mail } from 'lucide-react';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'admin_lapangan' });
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users', formData);
      alert("User berhasil ditambahkan!");
      setFormData({ name: '', email: '', password: '', role: 'admin_lapangan' });
      setIsAdding(false);
      fetchUsers();
    } catch (err) { alert(err.response?.data?.message || "Gagal menambah user"); }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Hapus akses user ini?")) return;
    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (err) { alert("Gagal menghapus user"); }
  };

  const getRoleBadge = (role) => {
    const styles = {
      super_admin: "bg-red-100 text-red-600 border-red-200",
      admin_lapangan: "bg-blue-100 text-blue-600 border-blue-200",
      viewer: "bg-slate-100 text-slate-600 border-slate-200"
    };
    return (
      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${styles[role]}`}>
        {role.replace('_', ' ')}
      </span>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Manajemen Tim</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Kelola hak akses & personil</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-200"
        >
          {isAdding ? 'Batal' : <><UserPlus size={16} /> Tambah Staff</>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Tambah User */}
        {isAdding && (
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm h-fit sticky top-24">
            <h3 className="font-black text-slate-800 uppercase text-xs mb-6 tracking-widest">Registrasi Akun Baru</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input 
                placeholder="Nama Lengkap" 
                className="w-full p-4 bg-slate-50 rounded-2xl outline-none text-sm font-bold border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all"
                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required 
              />
              <input 
                type="email" placeholder="Email Kerja" 
                className="w-full p-4 bg-slate-50 rounded-2xl outline-none text-sm font-bold border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all"
                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required 
              />
              <input 
                type="password" placeholder="Password Awal" 
                className="w-full p-4 bg-slate-50 rounded-2xl outline-none text-sm font-bold border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all"
                value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required 
              />
              <select 
                className="w-full p-4 bg-slate-50 rounded-2xl outline-none text-sm font-bold border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all"
                value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}
              >
                <option value="admin_lapangan">Admin Lapangan</option>
                <option value="super_admin">Super Admin</option>
                <option value="viewer">Viewer / Owner</option>
              </select>
              <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-lg shadow-blue-100">
                Simpan Akun
              </button>
            </form>
          </div>
        )}

        {/* Tabel Daftar User */}
        <div className={`${isAdding ? 'lg:col-span-2' : 'lg:col-span-3'} bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden`}>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                <th className="p-6">Personil</th>
                <th className="p-6">Role / Akses</th>
                <th className="p-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map(u => (
                <tr key={u.id} className="group hover:bg-slate-50/50 transition-all">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-slate-800 text-sm">{u.name}</p>
                        <p className="text-[11px] text-slate-400 font-bold flex items-center gap-1"><Mail size={10}/> {u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">{getRoleBadge(u.role)}</td>
                  <td className="p-6">
                    <div className="flex justify-end gap-2">
                      <button title="Reset Password" className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                        <Key size={16} />
                      </button>
                      <button 
                        onClick={() => deleteUser(u.id)}
                        title="Hapus Akses" 
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}