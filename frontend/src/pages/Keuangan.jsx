import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Keuangan() {
  const [projects, setProjects] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [suppliers, setSuppliers] = useState([]); // Data Supplier
  const [stocks, setStocks] = useState([]);       // Data Stok/Barang
  
  const [formData, setFormData] = useState({ 
    project_id: '', 
    item_name: '', 
    amount: '', 
    category: 'Material', 
    date: new Date().toISOString().split('T')[0],
    supplier_id: '',
    stock_id: '',
    qty: ''
  });
  const [file, setFile] = useState(null);

  // Load semua data yang diperlukan
  useEffect(() => {
    Promise.all([
      api.get('/projects'),
      api.get('/expenditures'),
      api.get('/suppliers'),
      api.get('/stocks')
    ]).then(([proj, exp, supp, st]) => {
      setProjects(proj.data);
      setExpenses(exp.data);
      setSuppliers(supp.data);
      setStocks(st.data);
    });
  }, []);

  const totalExpense = expenses.reduce((sum, item) => sum + parseFloat(item.amount), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const data = new FormData();
    data.append('project_id', formData.project_id);
    data.append('item_name', formData.item_name);
    data.append('amount', formData.amount);
    data.append('category', formData.category);
    data.append('date', formData.date);
    
    // Kirim data integrasi jika kategori material
    if (formData.category === 'Material') {
        data.append('supplier_id', formData.supplier_id);
        data.append('stock_id', formData.stock_id);
        data.append('qty', formData.qty);
    }
    
    if (file) data.append('receipt', file);

    try {
      await api.post('/expenditures', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert("Transaksi & Stok berhasil diperbarui!");
      
      // Refresh data pengeluaran dan stok setelah simpan
      const resExp = await api.get('/expenditures');
      setExpenses(resExp.data);
      const resStock = await api.get('/stocks');
      setStocks(resStock.data);
      
      // Reset Form
      setFormData({ ...formData, item_name: '', amount: '', qty: '', supplier_id: '', stock_id: '' });
      setFile(null);
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan transaksi");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Stat */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-4">
        {/* Sisi Kiri: Judul */}
        <div className="pb-2">
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Keuangan</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
            Integrasi Logistik & Pengeluaran Proyek
          </p>
        </div>

        {/* Sisi Kanan: Total Pengeluaran */}
        <div className="bg-slate-900 px-10 py-7 rounded-[2.5rem] text-right shadow-xl shadow-slate-200 border-r-8 border-blue-600">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">
            Total Pengeluaran Kas
          </p>
          <h3 className="text-3xl font-black text-white tracking-tighter">
            <span className="text-blue-500 text-sm mr-2 font-bold">IDR</span>
            {totalExpense.toLocaleString('id-ID')}
          </h3>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Input Terintegrasi (Span 4) */}
        <div className="lg:col-span-4 bg-white p-8 rounded-[2.5rem] border border-slate-300 shadow-sm">
          <h3 className="font-black text-slate-800 uppercase text-xs mb-6 tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-600 rounded-full"></span> Catat Transaksi
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <select 
                className="w-full p-4 bg-slate-50 rounded-2xl outline-none text-sm font-bold" 
                value={formData.project_id} 
                onChange={e => setFormData({...formData, project_id: e.target.value})} 
                required
            >
              <option value="">Pilih Proyek</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
            </select>

            <select 
                className="w-full p-4 bg-slate-50 rounded-2xl outline-none text-sm font-bold border-2 border-blue-50" 
                value={formData.category} 
                onChange={e => setFormData({...formData, category: e.target.value})}
            >
              <option value="Material">Material (Update Stok)</option>
              <option value="Upah">Upah Pekerja</option>
              <option value="Sewa Alat">Sewa Alat Berat</option>
              <option value="Lain-lain">Lain-lain</option>
            </select>

            {/* INTEGRASI SUPPLIER & STOK (Hanya muncul jika kategori Material) */}
            {formData.category === 'Material' && (
              <div className="space-y-4 p-4 bg-blue-50/50 rounded-3xl border border-blue-100 animate-in fade-in zoom-in duration-300">
                <p className="text-[10px] font-black text-blue-600 uppercase ml-2">Logistik & Supplier</p>
                <select 
                    className="w-full p-3 bg-white rounded-xl text-xs font-bold shadow-sm outline-none"
                    value={formData.supplier_id}
                    onChange={e => setFormData({...formData, supplier_id: e.target.value})}
                >
                    <option value="">Pilih Supplier/Toko</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.nama_toko}</option>)}
                </select>
                <select 
                    className="w-full p-3 bg-white rounded-xl text-xs font-bold shadow-sm outline-none"
                    value={formData.stock_id}
                    onChange={e => setFormData({...formData, stock_id: e.target.value})}
                >
                    <option value="">Pilih Barang Di Gudang</option>
                    {stocks.map(st => <option key={st.id} value={st.id}>{st.nama_barang} (Sisa: {st.qty})</option>)}
                </select>
                <input 
                    type="number" 
                    placeholder="Jumlah (Qty)" 
                    className="w-full p-3 bg-white rounded-xl text-xs font-bold shadow-sm outline-none"
                    value={formData.qty}
                    onChange={e => setFormData({...formData, qty: e.target.value})}
                />
              </div>
            )}

            <input placeholder="Nama Item (ex: Semen Tiga Roda)" className="w-full p-4 bg-slate-50 rounded-2xl outline-none text-sm" 
              value={formData.item_name} onChange={e => setFormData({...formData, item_name: e.target.value})} required />
            
            <input type="number" placeholder="Total Nominal (Rp)" className="w-full p-4 bg-slate-50 rounded-2xl outline-none text-sm font-black text-blue-600" 
              value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} required />

            <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-4">Bukti Nota</label>
                <input type="file" onChange={(e) => setFile(e.target.files[0])} className="w-full p-3 text-xs" accept="image/*" />
            </div>

            <button className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] hover:bg-blue-600 transition-all shadow-lg shadow-slate-200">
              Simpan & Sinkronkan
            </button>
          </form>
        </div>

        {/* Riwayat (Span 8) */}
        <div className="lg:col-span-8 bg-white rounded-[2.5rem] border border-slate-300 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center">
             <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">Riwayat Kas Keluar</h3>
             <button className="text-[10px] font-black text-blue-600 uppercase">Lihat Semua</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                <tr className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    <th className="p-6">Detail Transaksi</th>
                    <th className="p-6">Kategori</th>
                    <th className="p-6">Supplier</th>
                    <th className="p-6 text-right">Nominal</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                {expenses.map(exp => (
                    <tr key={exp.id} className="hover:bg-slate-50/50 transition">
                    <td className="p-6">
                        <p className="font-black text-slate-800">{exp.item_name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{exp.project?.nama} • {exp.date}</p>
                    </td>
                    <td className="p-6">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${exp.category === 'Material' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
                            {exp.category}
                        </span>
                    </td>
                    <td className="p-6 text-[11px] font-bold text-slate-500 italic">
                        {exp.supplier?.nama_toko || '-'}
                    </td>
                    <td className="p-6 text-right font-black text-slate-800">
                        Rp {parseInt(exp.amount).toLocaleString('id-ID')}
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}