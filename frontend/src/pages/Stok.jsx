import { useState, useEffect } from 'react';
import api from '../api/axios';
import Modal from '../components/Modal';

export default function Stok() {
  const [stokList, setStokList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State untuk form input barang baru
  const [formData, setFormData] = useState({
    nama_barang: '',
    qty: '',
    unit: 'Sak',
    min_qty: 10
  });

  // 1. Ambil Data dari Database
  const fetchStok = async () => {
    try {
      const response = await api.get('/stocks');
      setStokList(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Gagal mengambil data stok:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStok();
  }, []);

  // 2. Simpan Barang Baru
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/stocks', formData);
      setStokList([...stokList, response.data]);
      setIsModalOpen(false);
      setFormData({ nama_barang: '', qty: '', unit: 'Sak', min_qty: 10 });
    } catch (error) {
      alert("Gagal menyimpan data barang!");
    }
  };

  // 3. Fungsi Hapus
  const handleDelete = async (id) => {
    if (window.confirm("Hapus barang dari inventori?")) {
      try {
        await api.delete(`/stocks/${id}`);
        setStokList(stokList.filter(item => item.id !== id));
      } catch (error) {
        alert("Gagal menghapus!");
      }
    }
  };

  if (loading) return <div className="p-10 text-center font-bold text-gray-400 uppercase tracking-widest">Menghubungkan ke Gudang...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h3 className="text-xl font-black text-slate-800 uppercase italic">Inventori Barang</h3>
          <p className="text-xs text-gray-400">Total {stokList.length} jenis barang terdaftar</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-100 flex items-center gap-2"
        >
          <span>+</span> Tambah Barang
        </button>
      </div>

      {/* Grid Stok */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stokList.map((item) => (
          <div key={item.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative group transition-all hover:shadow-md">
            {/* Indikator Stok Rendah Otomatis */}
            {item.qty <= item.min_qty && (
              <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] px-3 py-1 rounded-bl-xl font-black animate-pulse">
                PERLU RE-STOCK
              </div>
            )}
            
            <h4 className="font-bold text-gray-500 text-xs uppercase tracking-widest mb-1 italic">Material</h4>
            <h2 className="text-xl font-black text-slate-800 truncate">{item.nama_barang}</h2>
            
            <div className="mt-4 flex items-baseline gap-2">
              <span className={`text-5xl font-black ${item.qty <= item.min_qty ? 'text-red-500' : 'text-slate-700'}`}>
                {item.qty}
              </span>
              <span className="text-gray-400 font-bold uppercase text-sm">{item.unit}</span>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-50 flex justify-between items-center">
              <button 
                onClick={() => handleDelete(item.id)}
                className="text-[10px] font-black text-gray-300 hover:text-red-500 transition-colors uppercase"
              >
                Hapus Permanen
              </button>
              <button className="bg-slate-100 text-slate-600 px-4 py-2 rounded-lg text-xs font-black hover:bg-emerald-600 hover:text-white transition-all">
                UPDATE QTY
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Form Tambah Barang */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Barang Baru">
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            className="w-full border-2 border-gray-100 p-3 rounded-xl focus:border-emerald-500 outline-none transition-all" 
            placeholder="Nama Barang (contoh: Besi Beton 12mm)" 
            onChange={e => setFormData({...formData, nama_barang: e.target.value})} 
            required 
          />
          <div className="grid grid-cols-2 gap-4">
            <input 
              type="number" 
              className="w-full border-2 border-gray-100 p-3 rounded-xl focus:border-emerald-500 outline-none" 
              placeholder="Jumlah" 
              onChange={e => setFormData({...formData, qty: e.target.value})} 
              required 
            />
            <select 
              className="w-full border-2 border-gray-100 p-3 rounded-xl focus:border-emerald-500 outline-none"
              onChange={e => setFormData({...formData, unit: e.target.value})}
            >
              <option value="Sak">Sak</option>
              <option value="Unit">Unit</option>
              <option value="Meter">Meter</option>
              <option value="Batang">Batang</option>
              <option value="Pail">Pail</option>
            </select>
          </div>
          <button className="w-full bg-emerald-600 text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100">
            Daftarkan Barang
          </button>
        </form>
      </Modal>
    </div>
  );
}