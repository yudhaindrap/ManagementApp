import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useNotify } from '../context/NotificationContext';
import { 
  Box, 
  ArrowUpRight, 
  History, 
  Calendar, 
  ClipboardList, 
  Package 
} from 'lucide-react';

export default function AmbilBarang() {
  const { notify } = useNotify();
  const [projects, setProjects] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [usages, setUsages] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Mendapatkan data user untuk tracking (opsional jika backend membutuhkan)
  const user = JSON.parse(localStorage.getItem('user'));
  const isViewer = user?.role === 'viewer';

  const [formData, setFormData] = useState({ 
    project_id: '', 
    stock_id: '', 
    qty: '', 
    usage_date: new Date().toISOString().split('T')[0], 
    description: '' 
  });

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [projRes, stockRes] = await Promise.all([
          api.get('/projects'),
          api.get('/stocks')
        ]);
        setProjects(projRes.data);
        setStocks(stockRes.data);
        await fetchUsages();
      } catch (err) {
        notify("Gagal sinkronisasi data logistik", "error");
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  const fetchUsages = async () => {
    try {
      const res = await api.get('/material-usages');
      setUsages(res.data);
    } catch (err) {
      notify("Gagal memuat riwayat pengeluaran", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isViewer) {
      notify("Akun viewer tidak diizinkan melakukan transaksi", "error");
      return;
    }

    // Validasi Sederhana Client-Side
    const selectedStock = stocks.find(s => s.id === parseInt(formData.stock_id));
    if (selectedStock && formData.qty > selectedStock.qty) {
      notify(`Stok tidak cukup! Tersedia: ${selectedStock.qty}`, "error");
      return;
    }

    try {
      await api.post('/material-usages', formData);
      notify("Material berhasil dialokasikan ke proyek!", "success");
      
      // Reset parsial untuk efisiensi input berulang
      setFormData(prev => ({
        ...prev,
        stock_id: '',
        qty: '',
        description: ''
      }));
      
      // Sinkronisasi ulang data stok dan history
      await Promise.all([fetchUsages(), refreshStocks()]);
    } catch (err) {
      notify(err.response?.data?.message || "Gagal memproses pengeluaran", "error");
    }
  };

  const refreshStocks = async () => {
    const stockRes = await api.get('/stocks');
    setStocks(stockRes.data);
  };

  if (loading) return (
    <div className="p-10 text-center animate-pulse font-black uppercase text-slate-400 tracking-widest">
      Menyiapkan Logistik...
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl">
          <ArrowUpRight size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-800">Keluar Barang</h2>
          <p className="text-xs text-slate-500 font-medium italic">Logistik & Distribusi Material Proyek</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Ambil Barang */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm h-fit lg:sticky lg:top-6">
          <div className="flex items-center gap-2 mb-6">
            <Package size={18} className="text-rose-500" />
            <h3 className="font-black text-xs uppercase tracking-widest text-slate-700">Form Pengeluaran</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Proyek Tujuan</label>
              <select 
                className="w-full p-4 bg-slate-50 rounded-2xl mt-1 outline-none border-2 border-transparent focus:border-rose-500 transition-all font-bold text-sm" 
                value={formData.project_id}
                onChange={e => setFormData({...formData, project_id: e.target.value})} 
                required
                disabled={isViewer}
              >
                <option value="">-- Pilih Proyek --</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Material</label>
              <select 
                className="w-full p-4 bg-slate-50 rounded-2xl mt-1 outline-none border-2 border-transparent focus:border-rose-500 transition-all font-bold text-sm" 
                value={formData.stock_id}
                onChange={e => setFormData({...formData, stock_id: e.target.value})} 
                required
                disabled={isViewer}
              >
                <option value="">-- Pilih Material --</option>
                {stocks.map(s => (
                  <option key={s.id} value={s.id} disabled={s.qty <= 0}>
                    {s.nama_barang} ({s.qty} {s.unit} tersedia)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Qty Keluar</label>
                <input 
                  type="number" 
                  className="w-full p-4 bg-slate-50 rounded-2xl mt-1 outline-none border-2 border-transparent focus:border-rose-500 font-black" 
                  value={formData.qty} 
                  onChange={e => setFormData({...formData, qty: e.target.value})} 
                  required 
                  min="1"
                  disabled={isViewer} 
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Tanggal</label>
                <input 
                  type="date" 
                  className="w-full p-4 bg-slate-50 rounded-2xl mt-1 outline-none border-2 border-transparent focus:border-rose-500 font-bold text-xs" 
                  value={formData.usage_date} 
                  onChange={e => setFormData({...formData, usage_date: e.target.value})}
                  disabled={isViewer} 
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Catatan/Keterangan</label>
              <textarea 
                placeholder="Contoh: Untuk pengecoran dak lantai 2" 
                className="w-full p-4 bg-slate-50 rounded-2xl mt-1 text-sm outline-none border-2 border-transparent focus:border-rose-500 min-h-[100px]"
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})}
                disabled={isViewer}
              />
            </div>

            <button 
              disabled={isViewer}
              className={`w-full py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-[0.2em] transition-all shadow-xl active:scale-95
                ${isViewer ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-rose-600 text-white hover:bg-slate-900 shadow-rose-100'}`}
            >
              Konfirmasi Pengeluaran
            </button>
          </form>
        </div>

        {/* Tabel History Pengeluaran */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <History size={18} className="text-slate-400" />
              <h3 className="font-black text-xs uppercase tracking-widest text-slate-500">Log Aktivitas Gudang</h3>
            </div>
            <span className="text-[10px] font-bold bg-slate-100 px-3 py-1 rounded-full text-slate-500 uppercase">
              Total Record: {usages.length}
            </span>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    <th className="p-5">Waktu</th>
                    <th className="p-5">Destinasi Proyek</th>
                    <th className="p-5">Material</th>
                    <th className="p-5">Volume</th>
                    <th className="p-5">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {usages.map(u => (
                    <tr key={u.id} className="border-b border-slate-50 hover:bg-rose-50/30 transition-colors group">
                      <td className="p-5">
                        <div className="flex items-center gap-2">
                          <Calendar size={12} className="text-slate-300" />
                          <span className="text-slate-500 font-medium">{u.usage_date}</span>
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="font-black text-slate-700 uppercase tracking-tight">{u.project?.nama}</div>
                        <div className="text-[9px] text-slate-400 font-bold uppercase">{u.project?.lokasi}</div>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-2">
                          <Box size={14} className="text-slate-400" />
                          <span className="font-bold text-slate-600">{u.stock?.nama_barang}</span>
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="bg-rose-50 text-rose-600 font-black px-3 py-1 rounded-lg inline-block">
                          -{u.qty} {u.stock?.unit}
                        </div>
                      </td>
                      <td className="p-5">
                        <p className="text-slate-400 italic line-clamp-1 group-hover:line-clamp-none max-w-[150px]">
                          {u.description || 'Tidak ada catatan'}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {usages.length === 0 && (
              <div className="p-20 text-center">
                <ClipboardList size={40} className="mx-auto text-slate-200 mb-4" />
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Belum ada log pengeluaran</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}