import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useNotify } from '../context/NotificationContext';
import { 
  Wallet, 
  Receipt, 
  PlusCircle, 
  ArrowUpRight, 
  ShoppingBag, 
  UserCircle2,
  Image as ImageIcon,
  HardHat,
  Construction,
  Layers,
  Calendar,
  Building2,
  Download,
  Lock
} from 'lucide-react';

export default function Keuangan() {
  const { notify } = useNotify();
  const [projects, setProjects] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [suppliers, setSuppliers] = useState([]); 
  const [stocks, setStocks] = useState([]);       
  const [loading, setLoading] = useState(true);
  
  // --- LOGIKA ROLE ---
  const user = JSON.parse(localStorage.getItem('user'));
  const isSuperAdmin = user?.role === 'super_admin';
  const isAdminLapangan = user?.role === 'admin_lapangan';
  const isViewer = user?.role === 'viewer';
  const canManage = isSuperAdmin || isAdminLapangan;
  
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [proj, exp, supp, st] = await Promise.all([
          api.get('/projects'),
          api.get('/expenditures'),
          api.get('/suppliers'),
          api.get('/stocks')
        ]);
        setProjects(proj.data);
        setExpenses(exp.data);
        setSuppliers(supp.data);
        setStocks(st.data);
      } catch (err) {
        notify("Gagal memuat data keuangan", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalExpense = expenses.reduce((sum, item) => sum + parseFloat(item.amount), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canManage) {
      notify("Anda tidak memiliki akses untuk mencatat transaksi", "error");
      return;
    }
    
    const data = new FormData();
    data.append('project_id', formData.project_id);
    data.append('item_name', formData.item_name);
    data.append('amount', formData.amount);
    data.append('category', formData.category);
    data.append('date', formData.date);
    
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
      
      notify("Transaksi Berhasil & Stok Diperbarui!", "success");
      
      const resExp = await api.get('/expenditures');
      setExpenses(resExp.data);
      const resStock = await api.get('/stocks');
      setStocks(resStock.data);
      
      setFormData({ ...formData, item_name: '', amount: '', qty: '', supplier_id: '', stock_id: '' });
      setFile(null);
    } catch (err) {
      notify("Gagal menyimpan transaksi kas", "error");
    }
  };

  if (loading) return <div className="p-10 text-center animate-pulse font-black uppercase text-slate-400">Menghitung Arus Kas...</div>;

  return (
    <div className="space-y-8">
      {/* Header Stat */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="pb-2">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-blue-600 rounded-lg text-white">
                <Wallet size={20} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Keuangan</h2>
          </div>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
            Integrasi Logistik & Pengeluaran Proyek
          </p>
        </div>

        <div className="bg-slate-900 px-10 py-7 rounded-[2.5rem] text-right shadow-xl shadow-slate-200 border-r-8 border-blue-600 group hover:scale-105 transition-transform duration-300">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1 flex items-center justify-end gap-2">
            <ArrowUpRight size={12} /> Total Pengeluaran Kas
          </p>
          <h3 className="text-3xl font-black text-white tracking-tighter">
            <span className="text-blue-500 text-sm mr-2 font-bold">IDR</span>
            {totalExpense.toLocaleString('id-ID')}
          </h3>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Input */}
        {canManage ? (
          <div className="lg:col-span-4 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm h-fit sticky top-6 animate-in slide-in-from-left duration-500">
            <div className="flex items-center gap-2 mb-6">
              <PlusCircle size={18} className="text-blue-600" />
              <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">Catat Transaksi</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Pilih Proyek</label>
                  <select 
                      className="w-full p-4 bg-slate-50 rounded-2xl outline-none text-sm font-bold border-2 border-transparent focus:border-blue-100 transition-all" 
                      value={formData.project_id} 
                      onChange={e => setFormData({...formData, project_id: e.target.value})} 
                      required
                  >
                  <option value="">-- Pilih Proyek --</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
                  </select>
              </div>

              <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Kategori Transaksi</label>
                  <select 
                      className="w-full p-4 bg-slate-50 rounded-2xl outline-none text-sm font-black text-blue-600 border-2 border-blue-50" 
                      value={formData.category} 
                      onChange={e => setFormData({...formData, category: e.target.value})}
                  >
                  <option value="Material">Material (Update Stok)</option>
                  <option value="Upah">Upah Pekerja</option>
                  <option value="Sewa Alat">Sewa Alat Berat</option>
                  <option value="Lain-lain">Lain-lain</option>
                  </select>
              </div>

              {formData.category === 'Material' && (
                <div className="space-y-4 p-5 bg-blue-50/50 rounded-3xl border border-blue-100 animate-in fade-in zoom-in duration-300">
                  <div className="flex items-center gap-2 mb-1">
                      <ShoppingBag size={14} className="text-blue-600" />
                      <p className="text-[10px] font-black text-blue-600 uppercase">Logistik & Supplier</p>
                  </div>
                  <select 
                      className="w-full p-3 bg-white rounded-xl text-xs font-bold shadow-sm outline-none border border-transparent focus:border-blue-300"
                      value={formData.supplier_id}
                      onChange={e => setFormData({...formData, supplier_id: e.target.value})}
                  >
                      <option value="">Pilih Supplier/Toko</option>
                      {suppliers.map(s => <option key={s.id} value={s.id}>{s.nama_toko}</option>)}
                  </select>
                  <select 
                      className="w-full p-3 bg-white rounded-xl text-xs font-bold shadow-sm outline-none border border-transparent focus:border-blue-300"
                      value={formData.stock_id}
                      onChange={e => setFormData({...formData, stock_id: e.target.value})}
                  >
                      <option value="">Pilih Barang Di Gudang</option>
                      {stocks.map(st => <option key={st.id} value={st.id}>{st.nama_barang} (Sisa: {st.qty})</option>)}
                  </select>
                  <input 
                      type="number" 
                      placeholder="Jumlah Masuk (Qty)" 
                      className="w-full p-3 bg-white rounded-xl text-xs font-black shadow-sm outline-none border border-transparent focus:border-blue-300"
                      value={formData.qty}
                      onChange={e => setFormData({...formData, qty: e.target.value})}
                  />
                </div>
              )}

              <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Keterangan Item</label>
                  <input placeholder="ex: Pembelian Semen Gresik 100 Sak" className="w-full p-4 bg-slate-50 rounded-2xl outline-none text-sm font-bold" 
                  value={formData.item_name} onChange={e => setFormData({...formData, item_name: e.target.value})} required />
              </div>
              
              <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Nominal Transaksi</label>
                  <input type="number" placeholder="Rp 0" className="w-full p-4 bg-slate-50 rounded-2xl outline-none text-lg font-black text-blue-600 placeholder:text-slate-300" 
                  value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} required />
              </div>

              <div className="flex flex-col gap-1 px-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-1 flex items-center gap-2">
                      <ImageIcon size={12} /> Bukti Nota/Invoice
                  </label>
                  <input type="file" onChange={(e) => setFile(e.target.files[0])} 
                         className="text-[10px] text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" 
                         accept="image/*" />
              </div>

              <button className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-[0.2em] hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 active:scale-95">
                Simpan & Sinkronkan
              </button>
            </form>
          </div>
        ) : (
          <div className="lg:col-span-4 bg-blue-600 p-8 rounded-[2.5rem] text-white shadow-xl h-fit sticky top-6">
            <div className="flex items-center gap-2 mb-4">
              <Lock size={18} />
              <h3 className="font-black uppercase text-sm tracking-widest">Mode View-Only</h3>
            </div>
            <p className="text-xs font-bold leading-relaxed opacity-80">
              Anda sedang masuk sebagai Viewer. Anda dapat melihat seluruh riwayat transaksi dan total pengeluaran, namun tidak diizinkan untuk menambah atau mengubah data keuangan.
            </p>
          </div>
        )}

        {/* Riwayat Kas */}
        <div className="lg:col-span-8 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white">
              <div className="flex items-center gap-2">
                <Receipt size={18} className="text-slate-400" />
                <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">Riwayat Kas Keluar</h3>
              </div>
              {(isSuperAdmin || isViewer) && (
                <button className="text-[10px] font-black text-blue-600 bg-blue-50 px-4 py-2 rounded-full uppercase hover:bg-blue-600 hover:text-white transition-colors flex items-center gap-2">
                  <Download size={12} /> Unduh Laporan
                </button>
              )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                <tr className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    <th className="p-6">Detail Transaksi</th>
                    <th className="p-6">Kategori</th>
                    <th className="p-6">Pihak Terkait</th>
                    <th className="p-6 text-right">Nominal</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                {expenses.map(exp => (
                    <tr key={exp.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-6">
                        <p className="font-black text-slate-800 group-hover:text-blue-600 transition-colors">{exp.item_name}</p>
                        <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold uppercase mt-1">
                            <span className="flex items-center gap-1"><Calendar size={10} /> {exp.date}</span>
                            <span className="flex items-center gap-1"><Building2 size={10} /> {exp.project?.nama}</span>
                        </div>
                    </td>
                    <td className="p-6">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase flex items-center gap-1 w-fit ${
                            exp.category === 'Material' ? 'bg-blue-100 text-blue-600' : 
                            exp.category === 'Upah' ? 'bg-emerald-100 text-emerald-600' :
                            exp.category === 'Sewa Alat' ? 'bg-amber-100 text-amber-600' :
                            'bg-slate-100 text-slate-600'}`}>
                            {exp.category === 'Material' && <ShoppingBag size={10} />}
                            {exp.category === 'Upah' && <HardHat size={10} />}
                            {exp.category === 'Sewa Alat' && <Construction size={10} />}
                            {exp.category === 'Lain-lain' && <Layers size={10} />}
                            {exp.category}
                        </span>
                    </td>
                    <td className="p-6">
                        <div className="flex items-center gap-2">
                            <UserCircle2 size={14} className="text-slate-300" />
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tighter italic">
                                {exp.supplier?.nama_toko || 'Internal/Pekerja'}
                            </span>
                        </div>
                    </td>
                    <td className="p-6 text-right font-black text-slate-900 text-base">
                        Rp {parseInt(exp.amount).toLocaleString('id-ID')}
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
          </div>
          
          {expenses.length === 0 && (
              <div className="py-20 text-center">
                  <Receipt size={48} className="mx-auto text-slate-200 mb-4" />
                  <p className="text-slate-400 font-black text-xs uppercase tracking-widest">Belum ada data transaksi</p>
              </div>
          )}
        </div>
      </div>
    </div>
  );
}