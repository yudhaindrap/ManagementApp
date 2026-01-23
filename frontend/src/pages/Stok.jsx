import { useState, useEffect } from 'react';
import api from '../api/axios';
import Modal from '../components/Modal';

export default function Stok() {
  const [stokList, setStokList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    nama_barang: '',
    qty: '',
    unit: 'Sak',
    min_qty: 10
  });

  // 1. Ambil Data dari Database (GET)
  const fetchStok = async () => {
    try {
      const response = await api.get('/stocks');
      const dataDiambil = Array.isArray(response.data) 
        ? response.data 
        : (response.data.data || []);

      setStokList(dataDiambil);
      setLoading(false);
    } catch (error) {
      console.error("Gagal mengambil data stok:", error);
      setStokList([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStok();
  }, []);

  // 2. FUNGSI BARU: Update Qty Instan (+/-)
  const handleQuickUpdate = async (id, change) => {
    try {
      // Mengirim patch request ke Laravel
      const response = await api.patch(`/stocks/${id}/update-qty`, { change });
      
      // Update state lokal agar UI berubah seketika tanpa reload
      setStokList(stokList.map(item => 
        item.id === id ? response.data : item
      ));
    } catch (error) {
      if (error.response && error.response.status === 400) {
        alert("Stok tidak boleh kurang dari 0!");
      } else {
        alert("Gagal memperbarui stok.");
      }
    }
  };

  // 3. Logika Filter Pencarian
  const filteredStok = Array.isArray(stokList) 
  ? stokList.filter((item) =>
      item.nama_barang.toLowerCase().includes(searchTerm.toLowerCase())
    )
  : [];

  // 4. Simpan Barang Baru (POST)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/stocks', formData);
      setStokList([response.data, ...stokList]); 
      setIsModalOpen(false); 
      setFormData({ nama_barang: '', qty: '', unit: 'Sak', min_qty: 10 }); 
    } catch (error) {
      alert("Gagal menyimpan data barang!");
    }
  };

  // 5. Hapus Barang (DELETE)
  const handleDelete = async (id) => {
    if (window.confirm("Hapus barang ini dari inventori?")) {
      try {
        await api.delete(`/stocks/${id}`);
        setStokList(stokList.filter(item => item.id !== id));
      } catch (error) {
        alert("Gagal menghapus barang.");
      }
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="text-emerald-600 font-bold animate-bounce uppercase tracking-tighter">Membuka Pintu Gudang...</div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <h3 className="text-xl font-black text-slate-800 uppercase italic">Inventori Material</h3>
          <p className="text-xs text-gray-400 font-medium tracking-tight">Total {stokList.length} Material Terdaftar</p>
        </div>

        <div className="flex w-full md:w-auto gap-3">
          <input 
            type="text"
            placeholder="Cari nama barang..."
            className="flex-1 md:w-64 border border-gray-200 p-3 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-bold transition shadow-lg shadow-emerald-100"
          >
            + Barang
          </button>
        </div>
      </div>

      {/* Grid Kartu Stok */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStok.length > 0 ? (
          filteredStok.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative group overflow-hidden hover:shadow-xl transition-all duration-300">
              {item.qty <= item.min_qty && (
                <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] px-4 py-1.5 rounded-bl-2xl font-black animate-pulse z-10">
                  RE-STOCK SEGERA!
                </div>
              )}
              
              <div className="mb-4">
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md uppercase tracking-widest">Gudang Utama</span>
                <h2 className="text-xl font-black text-slate-800 mt-2 truncate">{item.nama_barang}</h2>
              </div>

              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-baseline gap-2">
                  <span className={`text-5xl font-black tracking-tighter ${item.qty <= item.min_qty ? 'text-red-500' : 'text-slate-800'}`}>
                    {item.qty}
                  </span>
                  <span className="text-gray-400 font-bold uppercase text-xs">{item.unit}</span>
                </div>

                {/* TOMBOL QUICK UPDATE */}
                <div className="flex flex-col gap-1">
                  <button 
                    onClick={() => handleQuickUpdate(item.id, 1)}
                    className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-black text-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm active:scale-90"
                  >
                    +
                  </button>
                  <button 
                    onClick={() => handleQuickUpdate(item.id, -1)}
                    className="w-10 h-10 bg-red-50 text-red-400 rounded-xl flex items-center justify-center font-black text-xl hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-90"
                  >
                    -
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="text-[10px] font-black text-gray-300 hover:text-red-500 transition-colors uppercase tracking-widest"
                >
                  Hapus
                </button>
                <div className="text-[10px] font-bold text-gray-400 uppercase">
                  Min: {item.min_qty} {item.unit}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
            <p className="text-gray-400 font-medium italic">Material tidak ditemukan...</p>
          </div>
        )}
      </div>

      {/* Modal Form */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tambah Material">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase mb-1">Nama Barang</label>
            <input 
              className="w-full border-2 border-gray-100 p-3.5 rounded-2xl outline-none focus:border-emerald-500 transition-all" 
              placeholder="Contoh: Semen Gresik" 
              value={formData.nama_barang}
              onChange={e => setFormData({...formData, nama_barang: e.target.value})} 
              required 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase mb-1">Jumlah</label>
              <input 
                type="number" 
                className="w-full border-2 border-gray-100 p-3.5 rounded-2xl outline-none focus:border-emerald-500" 
                value={formData.qty}
                onChange={e => setFormData({...formData, qty: e.target.value})} 
                required 
              />
            </div>
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase mb-1">Satuan</label>
              <select 
                className="w-full border-2 border-gray-100 p-3.5 rounded-2xl outline-none focus:border-emerald-500 bg-white"
                value={formData.unit}
                onChange={e => setFormData({...formData, unit: e.target.value})}
              >
                <option value="Sak">Sak</option>
                <option value="Unit">Unit</option>
                <option value="Batang">Batang</option>
                <option value="Kg">Kg</option>
              </select>
            </div>
          </div>

          <button className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-emerald-100 mt-4">
            Simpan Material
          </button>
        </form>
      </Modal>
    </div>
  );
}