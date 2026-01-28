import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Modal from '../components/Modal'; // Pastikan komponen Modal sudah ada

export default function DetailProyek() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [proyek, setProyek] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openStatus, setOpenStatus] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // State untuk Modal Edit
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState({
    nama: '',
    client: '',
    deadline: '',
    catatan: '',
    status: '',
    attachment: null
  });

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

  const fetchDetail = async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      setProyek(res.data);
      // Sinkronkan data edit dengan data yang baru diambil
      setEditData({
        nama: res.data.nama,
        client: res.data.client,
        deadline: res.data.deadline,
        catatan: res.data.catatan || '',
        status: res.data.status,
        attachment: null
      });
    } catch (err) {
      alert('Proyek tidak ditemukan');
      navigate('/proyek');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  // Fungsi Update Cepat (Hanya Status)
  const updateStatus = async (status) => {
    if (status === proyek.status) return;
    setUpdating(true);
    try {
      await api.patch(`/projects/${id}`, { status });
      setProyek((prev) => ({ ...prev, status }));
      setOpenStatus(false);
    } catch (err) {
      alert('Gagal mengubah status');
    } finally {
      setUpdating(false);
    }
  };

  // FUNGSI BARU: Update Semua Informasi
  const handleUpdateProject = async (e) => {
    e.preventDefault();
    setUpdating(true);

    const formData = new FormData();
    formData.append('_method', 'PUT');
    formData.append('nama', editData.nama);
    formData.append('client', editData.client);
    formData.append('deadline', editData.deadline);
    formData.append('catatan', editData.catatan);

    if (editData.status) {
      formData.append('status', editData.status);
    }

    if (editData.attachment) {
      formData.append('attachment', editData.attachment);
    }

    try {
      const res = await api.post(`/projects/${id}`, formData);
      setProyek(res.data.data); // 🔥 FIX UTAMA
      setIsEditModalOpen(false);
      alert("Data proyek berhasil diperbarui!");
    } catch (err) {
      console.error(err.response?.data);
      alert("Gagal memperbarui data proyek.");
    } finally {
      setUpdating(false);
    }
  };

  const handleUploadImages = async (e) => {
    const files = e.target.files;
    if (!files.length) return;
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) { formData.append('images[]', files[i]); }
    setUploading(true);
    try {
      const res = await api.post(`/projects/${id}/images`, formData);
      setProyek({ ...proyek, images: [...proyek.images, ...res.data] });
    } catch (err) { alert("Gagal upload foto"); }
    finally { setUploading(false); }
  };

  const handleDeleteImage = async (imageId) => {
    if (!confirm("Hapus foto ini?")) return;
    try {
      await api.delete(`/projects/images/${imageId}`);
      setProyek({ ...proyek, images: proyek.images.filter(img => img.id !== imageId) });
    } catch (err) { alert("Gagal hapus foto"); }
  };

  if (loading || !proyek) return <div className="p-10 text-center animate-pulse text-gray-500">Memuat...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <button onClick={() => navigate('/proyek')} className="text-gray-500 hover:text-blue-600 font-bold flex items-center gap-2 transition">
          ← Kembali
        </button>
        <button 
          onClick={() => setIsEditModalOpen(true)}
          className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-amber-100 transition-all"
        >
          Edit Informasi
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header Section */}
        <div className="bg-slate-900 p-8 text-white">
            <button
                onClick={() => setOpenStatus(!openStatus)}
                className={`${proyek.status === 'Selesai' ? 'bg-green-600' : 'bg-yellow-500'} 
                text-[11px] font-black uppercase px-4 py-1 rounded-full inline-flex items-center gap-2 hover:opacity-90 transition`}
            >
                {proyek.status} <span className="text-xs">▾</span>
            </button>

            {openStatus && (
                <div className="absolute z-20 mt-2 w-32 rounded-2xl shadow-xl border overflow-hidden bg-white text-slate-800">
                    {['Proses', 'Selesai'].map((s) => (
                        <button key={s} onClick={() => updateStatus(s)} className="w-full text-left px-4 py-2 text-[11px] font-bold hover:bg-slate-50 uppercase">{s}</button>
                    ))}
                </div>
            )}

            <h1 className="text-3xl font-black mt-4">{proyek.nama}</h1>
            <p className="text-slate-400 mt-1 uppercase text-xs font-bold tracking-widest">Client: {proyek.client}</p>
        </div>

        {/* Info Grid */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-black text-gray-300 uppercase tracking-widest mb-4 border-b pb-2">Informasi Umum</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm"><span className="text-gray-400">Deadline</span><span className="font-bold">{new Date(proyek.deadline).toLocaleDateString('id-ID')}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-400">Dibuat</span><span className="font-bold">{new Date(proyek.created_at).toLocaleDateString('id-ID')}</span></div>
              </div>
            </div>
            <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
              <h4 className="text-slate-400 text-[10px] font-black uppercase mb-2">Catatan Proyek</h4>
              <p className="text-slate-600 text-sm leading-relaxed">{proyek.catatan || 'Tidak ada catatan.'}</p>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-black text-gray-300 uppercase tracking-widest mb-4 border-b pb-2">Lampiran Utama</h3>
            <div className="rounded-3xl overflow-hidden border-4 border-slate-50 shadow-sm aspect-video bg-slate-100 flex items-center justify-center">
              {proyek.attachment ? (
                <img src={`${BACKEND_URL}/storage/${proyek.attachment}`} className="w-full h-full object-cover" />
              ) : (
                <span className="text-slate-300 italic text-xs">No Attachment</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* GALERI FOTO (Tetap Sama) */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black uppercase italic">Dokumentasi Proyek</h3>
              <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-blue-700 transition">
                  {uploading ? '...' : '+ Foto'}
                  <input type="file" multiple accept="image/*" onChange={handleUploadImages} className="hidden" />
              </label>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {proyek.images?.map(img => (
                  <div key={img.id} className="relative group aspect-square rounded-2xl overflow-hidden border border-gray-100">
                      <img src={`${BACKEND_URL}/storage/${img.path}`} className="w-full h-full object-cover" />
                      <button onClick={() => handleDeleteImage(img.id)} className="absolute top-2 right-2 bg-red-600 text-white w-6 h-6 rounded-lg opacity-0 group-hover:opacity-100 transition">✕</button>
                  </div>
              ))}
          </div>
      </div>

      {/* MODAL EDIT SEMUA INFO */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Detail Proyek">
        <form onSubmit={handleUpdateProject} className="space-y-4">
          <div>
            <label className="text-[10px] font-black uppercase text-gray-400">Nama Proyek</label>
            <input 
              className="w-full border-2 border-gray-50 p-3 rounded-xl focus:border-blue-500 outline-none transition"
              value={editData.nama} 
              onChange={e => setEditData({...editData, nama: e.target.value})} 
              required
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-gray-400">Client</label>
            <input 
              className="w-full border-2 border-gray-50 p-3 rounded-xl focus:border-blue-500 outline-none transition"
              value={editData.client} 
              onChange={e => setEditData({...editData, client: e.target.value})} 
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400">Deadline</label>
              <input 
                type="date"
                className="w-full border-2 border-gray-50 p-3 rounded-xl focus:border-blue-500 outline-none transition"
                value={editData.deadline} 
                onChange={e => setEditData({...editData, deadline: e.target.value})} 
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400">Status</label>
              <select 
                className="w-full border-2 border-gray-50 p-3 rounded-xl focus:border-blue-500 outline-none transition bg-white"
                value={editData.status} 
                onChange={e => setEditData({...editData, status: e.target.value})}
              >
                <option value="Proses">Proses</option>
                <option value="Selesai">Selesai</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-gray-400">Catatan</label>
            <textarea 
              rows="3"
              className="w-full border-2 border-gray-50 p-3 rounded-xl focus:border-blue-500 outline-none transition"
              value={editData.catatan} 
              onChange={e => setEditData({...editData, catatan: e.target.value})}
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-gray-400">Ganti Lampiran Utama (Optional)</label>
            <input 
              type="file"
              className="w-full text-xs"
              onChange={e => setEditData({...editData, attachment: e.target.files[0]})}
            />
          </div>
          <button 
            type="submit" 
            disabled={updating}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-black transition disabled:bg-gray-400"
          >
            {updating ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </form>
      </Modal>
    </div>
  );
}