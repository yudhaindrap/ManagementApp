import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Keuangan() {
  const [projects, setProjects] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [formData, setFormData] = useState({ project_id: '', item_name: '', amount: '', category: 'Material', date: new Date().toISOString().split('T')[0] });
  const [file, setFile] = useState(null);

  useEffect(() => {
    api.get('/projects').then(res => setProjects(res.data));
    api.get('/expenditures').then(res => setExpenses(res.data));
  }, []);

  const totalExpense = expenses.reduce((sum, item) => sum + parseFloat(item.amount), 0);

const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Gunakan FormData untuk pengiriman file
  const data = new FormData();
  data.append('project_id', formData.project_id);
  data.append('item_name', formData.item_name);
  data.append('amount', formData.amount);
  data.append('category', formData.category);
  data.append('date', formData.date);
  if (file) data.append('receipt', file);

  try {
    await api.post('/expenditures', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    alert("Data & Nota berhasil disimpan!");
    // Reset form & refresh data...
  } catch (err) {
    console.error(err);
  }
};

  const handleDownloadPDF = (projectId) => {
  if(!projectId) return alert("Pilih proyek terlebih dahulu");
  
  // Kita langsung buka URL API di tab baru
  const url = `${import.meta.env.VITE_API_URL}/projects/${projectId}/report`;
  window.open(url, '_blank');
  };

  return (
    <div className="space-y-8">
      {/* Ringkasan Dashboard Keuangan */}
      <div className="flex justify-between items-end">
        <div className="bg-slate-900 p-6 rounded-[2rem] text-white w-80">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Pengeluaran</p>
          <h3 className="text-2xl font-black mt-1">Rp {totalExpense.toLocaleString('id-ID')}</h3>
        </div>
        <button 
            onClick={() => handleDownloadPDF(formData.project_id)}
            className="flex items-center gap-2 bg-red-500 rounded-[2rem] text-white px-4 py-2 text-xs font-bold hover:bg-red-600 transition"
            >
            <span>📄</span> Cetak Laporan (PDF)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Input */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <h3 className="font-black text-slate-800 uppercase text-sm mb-6">Catat Pengeluaran</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Proyek</label>
              <select className="w-full p-4 bg-slate-50 rounded-2xl mt-1 outline-none" 
                value={formData.project_id} onChange={e => setFormData({...formData, project_id: e.target.value})} required>
                <option value="">Pilih Proyek</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
              </select>
            
            </div>
            <input placeholder="Nama Barang/Jasa" className="w-full p-4 bg-slate-50 rounded-2xl outline-none" 
              value={formData.item_name} onChange={e => setFormData({...formData, item_name: e.target.value})} required />
            <input type="number" placeholder="Nominal (Rp)" className="w-full p-4 bg-slate-50 rounded-2xl outline-none" 
              value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} required />
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Upload Nota (JPG/PNG)</label>
            <input 
                type="file" 
                onChange={(e) => setFile(e.target.files[0])}
                className="w-full p-3 bg-slate-50 text-slate-400rounded-2xl mt-1 text-xs" 
                accept="image/*"
            />
            <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition">
              Simpan Transaksi
            </button>
          </form>
        </div>

        {/* Tabel Riwayat */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black uppercase text-slate-500 tracking-widest">
                <th className="p-6">Tanggal</th>
                <th className="p-6">Proyek</th>
                <th className="p-6">Item</th>
                <th className="p-6 text-right">Nominal</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {expenses.map(exp => (
                <tr key={exp.id} className="border-t border-slate-50 hover:bg-slate-50/50">
                  <td className="p-6 text-slate-500 font-medium">{exp.date}</td>
                  <td className="p-6 font-bold text-slate-800">{exp.project?.nama}</td>
                  <td className="p-6 text-slate-600">{exp.item_name}</td>
                  <td className="p-6 text-right font-black text-blue-600">Rp {parseInt(exp.amount).toLocaleString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}