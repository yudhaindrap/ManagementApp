import { useEffect, useState } from 'react';
import api from '../api/axios';
import Modal from '../components/Modal';

export default function Supplier() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: null, nama_toko: '', kontak: '', alamat: '' });

  useEffect(() => { fetchSuppliers(); }, []);

  const fetchSuppliers = async () => {
    try {
      const res = await api.get('/suppliers');
      setSuppliers(res.data);
    } catch (err) { alert("Gagal mengambil data"); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await api.put(`/suppliers/${formData.id}`, formData);
      } else {
        await api.post('/suppliers', formData);
      }
      fetchSuppliers();
      setIsModalOpen(false);
      setFormData({ id: null, nama_toko: '', kontak: '', alamat: '' });
    } catch (err) { alert("Gagal menyimpan data"); }
  };

  const handleEdit = (s) => {
    setFormData(s);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus supplier ini?")) return;
    try {
      await api.delete(`/suppliers/${id}`);
      fetchSuppliers();
    } catch (err) { alert("Gagal menghapus"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Daftar Supplier</h2>
          <p className="text-slate-500 text-sm">Kelola kontak vendor material proyek</p>
        </div>
        <button 
          onClick={() => { setFormData({id: null, nama_toko:'', kontak:'', alamat:''}); setIsModalOpen(true); }}
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase hover:bg-blue-700 transition shadow-lg shadow-blue-100"
        >
          + Supplier Baru
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-gray-100">
            <tr>
              <th className="p-5 text-[10px] font-black uppercase text-slate-400">Nama Toko</th>
              <th className="p-5 text-[10px] font-black uppercase text-slate-400">Kontak</th>
              <th className="p-5 text-[10px] font-black uppercase text-slate-400">Alamat</th>
              <th className="p-5 text-[10px] font-black uppercase text-slate-400 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {suppliers.map(s => (
              <tr key={s.id} className="hover:bg-slate-50/50 transition">
                <td className="p-5 font-bold text-slate-700">{s.nama_toko}</td>
                <td className="p-5 text-sm text-slate-600 font-medium">{s.kontak}</td>
                <td className="p-5 text-sm text-slate-500 max-w-xs truncate">{s.alamat || '-'}</td>
                <td className="p-5 text-right space-x-2">
                  <button onClick={() => handleEdit(s)} className="text-amber-500 hover:bg-amber-50 p-2 rounded-lg transition text-xs font-bold uppercase">Edit</button>
                  <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition text-xs font-bold uppercase">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {suppliers.length === 0 && !loading && <p className="p-10 text-center text-slate-400 italic text-sm">Belum ada data supplier.</p>}
      </div>

      {/* Modal Form */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={formData.id ? "Edit Supplier" : "Tambah Supplier"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            placeholder="Nama Toko" className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 outline-none font-medium"
            value={formData.nama_toko} onChange={e => setFormData({...formData, nama_toko: e.target.value})} required 
          />
          <input 
            placeholder="Kontak (WA/Telp)" className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 outline-none font-medium"
            value={formData.kontak} onChange={e => setFormData({...formData, kontak: e.target.value})} required 
          />
          <textarea 
            placeholder="Alamat Lengkap" className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 outline-none font-medium"
            value={formData.alamat} onChange={e => setFormData({...formData, alamat: e.target.value})} rows="3"
          />
          <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-black transition">
            Simpan Data
          </button>
        </form>
      </Modal>
    </div>
  );
}