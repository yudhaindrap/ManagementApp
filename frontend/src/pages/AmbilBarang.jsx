import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function AmbilBarang() {
  const [projects, setProjects] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [usages, setUsages] = useState([]);
  const [formData, setFormData] = useState({ project_id: '', stock_id: '', qty: '', usage_date: new Date().toISOString().split('T')[0], description: '' });

  useEffect(() => {
    api.get('/projects').then(res => setProjects(res.data));
    api.get('/stocks').then(res => setStocks(res.data));
    fetchUsages();
  }, []);

  const fetchUsages = () => api.get('/material-usages').then(res => setUsages(res.data));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/material-usages', formData);
      alert("Barang berhasil dikeluarkan dari gudang!");
      setFormData({...formData, qty: '', description: ''});
      fetchUsages(); // Refresh tabel
    } catch (err) {
      alert(err.response?.data?.message || "Terjadi kesalahan");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black uppercase tracking-tighter">Keluar Barang (Logistik Proyek)</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Ambil Barang */}
        <div className="bg-white p-6 rounded-3xl border border-gray-300 shadow-sm h-fit">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400">Pilih Proyek Tujuan</label>
              <select className="w-full p-3 bg-slate-50 rounded-xl mt-1 outline-none" 
                onChange={e => setFormData({...formData, project_id: e.target.value})} required>
                <option value="">-- Pilih Proyek --</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-400">Pilih Barang</label>
              <select className="w-full p-3 bg-slate-50 rounded-xl mt-1 outline-none font-bold" 
                onChange={e => setFormData({...formData, stock_id: e.target.value})} required>
                <option value="">-- Pilih Material --</option>
                {stocks.map(s => (
                  <option key={s.id} value={s.id} disabled={s.qty <= 0}>
                    {s.nama_barang} (Tersedia: {s.qty} {s.unit})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400">Jumlah Keluar</label>
                <input type="number" className="w-full p-3 bg-slate-50 rounded-xl mt-1" 
                  value={formData.qty} onChange={e => setFormData({...formData, qty: e.target.value})} required />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400">Tanggal</label>
                <input type="date" className="w-full p-3 bg-slate-50 rounded-xl mt-1" 
                  value={formData.usage_date} onChange={e => setFormData({...formData, usage_date: e.target.value})} />
              </div>
            </div>

            <textarea placeholder="Catatan (Misal: Untuk kebutuhan renovasi atap)" className="w-full p-3 bg-slate-50 rounded-xl text-sm"
              value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />

            <button className="w-full bg-rose-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-rose-700 transition shadow-lg shadow-rose-100">
              Konfirmasi Pengeluaran
            </button>
          </form>
        </div>

        {/* Tabel History Pengeluaran */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-300 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-500">
              <tr>
                <th className="p-4">Tanggal</th>
                <th className="p-4">Proyek</th>
                <th className="p-4">Barang</th>
                <th className="p-4">Qty</th>
                <th className="p-4">Petugas</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {usages.map(u => (
                <tr key={u.id} className="border-t hover:bg-slate-50 transition">
                  <td className="p-4 text-slate-400">{u.usage_date}</td>
                  <td className="p-4 font-bold">{u.project?.nama}</td>
                  <td className="p-4 font-medium">{u.stock?.nama_barang}</td>
                  <td className="p-4 text-rose-600 font-black">-{u.qty} {u.stock?.unit}</td>
                  <td className="p-4 text-slate-400 italic">Admin</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}