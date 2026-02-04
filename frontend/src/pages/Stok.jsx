import { useState, useEffect } from 'react';
import api from '../api/axios';
import Modal from '../components/Modal';
import { useNotify } from '../context/NotificationContext';

export default function Stok() {
  const { notify, askConfirm } = useNotify();
  const [stokList, setStokList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // --- LOGIKA ROLE (BARU) ---
  const user = JSON.parse(localStorage.getItem('user'));
  const isViewer = user?.role === 'viewer';
  const canManage = user?.role === 'super_admin' || user?.role === 'admin_lapangan';

  const [formData, setFormData] = useState({
    id: null,
    nama_barang: '',
    qty: '',
    unit: 'Sak',
    min_qty: 10
  });

  const fetchStok = async () => {
    try {
      const response = await api.get('/stocks');
      const dataDiambil = Array.isArray(response.data) 
        ? response.data 
        : (response.data.data || []);
      setStokList(dataDiambil);
    } catch (error) {
      notify("Gagal mengambil data stok dari server", "error");
      setStokList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStok();
  }, []);

  const resetForm = () => {
    setFormData({ id: null, nama_barang: '', qty: '', unit: 'Sak', min_qty: 10 });
  };

  const handleEdit = (item) => {
    if (!canManage) return;
    setFormData({
      id: item.id,
      nama_barang: item.nama_barang,
      qty: item.qty,
      unit: item.unit,
      min_qty: item.min_qty
    });
    setIsModalOpen(true);
  };

  const handleQuickUpdate = async (id, change) => {
    if (!canManage) return;
    try {
      const response = await api.patch(`/stocks/${id}/update-qty`, { change });
      setStokList(stokList.map(item => 
        item.id === id ? response.data : item
      ));
      if (change > 0) notify("Stok ditambahkan", "success");
    } catch (error) {
      if (error.response && error.response.status === 400) {
        notify("Stok tidak boleh kurang dari 0!", "error");
      } else {
        notify("Gagal memperbarui stok.", "error");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canManage) return;
    try {
      if (formData.id) {
        const response = await api.put(`/stocks/${formData.id}`, formData);
        setStokList(stokList.map(item => item.id === formData.id ? response.data : item));
        notify("Material berhasil diperbarui", "success");
      } else {
        const response = await api.post('/stocks', formData);
        setStokList([response.data, ...stokList]);
        notify("Material baru telah terdaftar", "success");
      }
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      notify("Gagal menyimpan data barang!", "error");
    }
  };

  const handleDelete = async (id) => {
    if (user?.role !== 'super_admin') {
      notify("Hanya Super Admin yang dapat menghapus data.", "error");
      return;
    }
    askConfirm("Hapus barang ini dari inventori? Tindakan ini tidak dapat dibatalkan.", async () => {
      try {
        await api.delete(`/stocks/${id}`);
        setStokList(stokList.filter(item => item.id !== id));
        notify("Barang berhasil dihapus", "success");
      } catch (error) {
        notify("Gagal menghapus barang.", "error");
      }
    });
  };

  const filteredStok = Array.isArray(stokList) 
  ? stokList.filter((item) =>
      item.nama_barang.toLowerCase().includes(searchTerm.toLowerCase())
    )
  : [];

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
          {/* TOMBOL TAMBAH HANYA UNTUK ADMIN */}
          {canManage && (
            <button 
              onClick={() => { resetForm(); setIsModalOpen(true); }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-bold transition shadow-lg shadow-emerald-100"
            >
              + Barang
            </button>
          )}
        </div>
      </div>

      {/* Grid Kartu Stok */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

                {/* QUICK UPDATE HANYA UNTUK ADMIN */}
                {canManage && (
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
                )}
              </div>

              <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
                <div className="flex gap-3">
                  {/* EDIT & HAPUS DENGAN PROTEKSI ROLE */}
                  {canManage && (
                    <button 
                      onClick={() => handleEdit(item)}
                      className="text-[10px] font-black text-blue-500 hover:text-blue-700 transition-colors uppercase tracking-widest"
                    >
                      Edit
                    </button>
                  )}
                  {user?.role === 'super_admin' && (
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="text-[10px] font-black text-gray-300 hover:text-red-500 transition-colors uppercase tracking-widest"
                    >
                      Hapus
                    </button>
                  )}
                </div>
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

      {/* Modal Form Proteksi */}
      {canManage && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={formData.id ? "Edit Material" : "Tambah Material"}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase mb-1">Nama Barang</label>
              <input 
                className="w-full border-2 border-gray-100 p-3.5 rounded-2xl outline-none focus:border-emerald-500 transition-all font-bold" 
                placeholder="Contoh: Semen Gresik" 
                value={formData.nama_barang}
                onChange={e => setFormData({...formData, nama_barang: e.target.value})} 
                required 
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase mb-1">Jumlah</label>
                <input 
                  type="number" 
                  className="w-full border-2 border-gray-100 p-3.5 rounded-2xl outline-none focus:border-emerald-500 font-bold" 
                  value={formData.qty}
                  onChange={e => setFormData({...formData, qty: e.target.value})} 
                  required 
                  min="0"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase mb-1">Satuan</label>
                <select 
                  className="w-full border-2 border-gray-100 p-3.5 rounded-2xl outline-none focus:border-emerald-500 bg-white font-bold"
                  value={formData.unit}
                  onChange={e => setFormData({...formData, unit: e.target.value})}
                >
                  <option value="Sak">Sak</option>
                  <option value="Unit">Unit</option>
                  <option value="Batang">Batang</option>
                  <option value="Kg">Kg</option>
                  <option value="M3">M3</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase mb-1">Minimal</label>
                <input 
                  type="number"
                  min="0"
                  className="w-full border-2 border-gray-100 p-3.5 rounded-2xl outline-none focus:border-emerald-500 font-bold"
                  value={formData.min_qty}
                  onChange={e => setFormData({...formData, min_qty: e.target.value})}
                  required
                />
              </div>  
            </div>

            <button className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-emerald-100 mt-4 hover:bg-emerald-700 transition-all active:scale-95">
              {formData.id ? "Simpan Perubahan" : "Simpan Material"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}