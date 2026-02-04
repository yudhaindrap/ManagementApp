import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Modal from '../components/Modal';
import { useNotify } from '../context/NotificationContext';

export default function DetailProyek() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notify, askConfirm } = useNotify();

  const [proyek, setProyek] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openStatus, setOpenStatus] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // --- LOGIKA ROLE (BARU) ---
  const user = JSON.parse(localStorage.getItem('user'));
  const canEdit = user?.role === 'super_admin' || user?.role === 'admin_lapangan';
  const isSuperAdmin = user?.role === 'super_admin';

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState({
    nama: '',
    client: '',
    deadline: '',
    budget: '', 
    catatan: '',
    status: '',
    attachment: null
  });

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

  const fetchDetail = async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      setProyek(res.data);
      setEditData({
        nama: res.data.nama,
        client: res.data.client,
        deadline: res.data.deadline,
        budget: res.data.budget || '', 
        catatan: res.data.catatan || '',
        status: res.data.status,
        attachment: null
      });
    } catch (err) {
      notify('Proyek tidak ditemukan', 'error');
      navigate('/proyek');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const updateStatus = async (status) => {
    if (!canEdit) {
      notify('Anda tidak memiliki izin mengubah status', 'error');
      return;
    }
    if (status === proyek.status) return;
    setUpdating(true);
    try {
      await api.patch(`/projects/${id}`, { status });
      setProyek((prev) => ({ ...prev, status }));
      setOpenStatus(false);
      notify(`Status berhasil diubah ke ${status}`, 'success');
    } catch (err) {
      notify('Gagal mengubah status', 'error');
    } finally {
      setUpdating(false);
    }
  };

const handleUpdateProject = async (e) => {
  e.preventDefault();
  if (!canEdit) return;
  setUpdating(true);

  const formData = new FormData();
  formData.append('_method', 'PUT');
  formData.append('nama', editData.nama);
  formData.append('client', editData.client);
  formData.append('deadline', editData.deadline);
  formData.append('budget', editData.budget);
  formData.append('catatan', editData.catatan);
  formData.append('status', editData.status);

  if (editData.attachment) {
    formData.append('attachment', editData.attachment);
  }

  try {
    const res = await api.post(`/projects/${id}`, formData);
    setProyek((prev) => ({ ...prev, ...res.data.data }));
    setIsEditModalOpen(false);
    notify("Data proyek & anggaran berhasil diperbarui!", "success");
  } catch (err) {
    notify("Gagal memperbarui data proyek.", "error");
  } finally {
    setUpdating(false);
  }
};

  const handleUploadImages = async (e) => {
    if (!canEdit) {
      notify('Anda tidak memiliki izin mengupload foto', 'error');
      return;
    }
    const files = e.target.files;
    if (!files.length) return;
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) { formData.append('images[]', files[i]); }
    setUploading(true);
    try {
      const res = await api.post(`/projects/${id}/images`, formData);
      setProyek({ ...proyek, images: [...proyek.images, ...res.data] });
      notify("Foto lapangan berhasil ditambahkan", "success");
    } catch (err) { 
      notify("Gagal upload foto", "error"); 
    }
    finally { setUploading(false); }
  };

  const handleDeleteImage = async (imageId) => {
    if (!canEdit) {
      notify('Hanya admin yang dapat menghapus dokumentasi', 'error');
      return;
    }
    askConfirm("Hapus foto dokumentasi ini?", async () => {
      try {
        await api.delete(`/projects/images/${imageId}`);
        setProyek({ ...proyek, images: proyek.images.filter(img => img.id !== imageId) });
        notify("Foto berhasil dihapus", "success");
      } catch (err) { 
        notify("Gagal hapus foto", "error"); 
      }
    });
  };

  const formatIDR = (val) => new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', maximumFractionDigits: 0
  }).format(val);

  if (loading || !proyek) return <div className="p-10 text-center animate-pulse text-gray-500 uppercase font-black tracking-widest">Memuat Detail Proyek...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <button onClick={() => navigate('/proyek')} className="text-gray-500 hover:text-blue-600 font-bold flex items-center gap-2 transition uppercase text-xs tracking-widest">
          ← Back to Projects
        </button>
        
        {/* EDIT BUTTON: Hanya untuk Admin */}
        {canEdit && (
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-100 transition-all"
          >
            Edit Info & Budget
          </button>
        )}
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-slate-900 p-10 text-white relative">
            <button
                onClick={() => canEdit && setOpenStatus(!openStatus)}
                className={`${proyek.status === 'Selesai' ? 'bg-emerald-600' : 'bg-amber-500'} 
                text-[10px] font-black uppercase px-4 py-1.5 rounded-full inline-flex items-center gap-2 ${canEdit ? 'hover:opacity-90' : 'cursor-default'} transition`}
            >
                {proyek.status} {canEdit && <span className="text-[10px]">▼</span>}
            </button>

            {openStatus && canEdit && (
                <div className="absolute z-20 mt-2 w-32 rounded-2xl shadow-2xl border overflow-hidden bg-white text-slate-800 animate-in slide-in-from-top-2">
                    {['Proses', 'Selesai'].map((s) => (
                        <button key={s} onClick={() => updateStatus(s)} className="w-full text-left px-5 py-3 text-[10px] font-black hover:bg-slate-50 uppercase tracking-tighter border-b last:border-0">{s}</button>
                    ))}
                </div>
            )}

            <h1 className="text-4xl font-black mt-6 tracking-tighter">{proyek.nama}</h1>
            <p className="text-slate-400 mt-2 uppercase text-[10px] font-bold tracking-[0.2em]">Client: {proyek.client}</p>
        </div>

        <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div>
              <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-6 border-b pb-2">Financial & Timeline</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                    <span className="text-slate-400 text-xs font-bold uppercase">Anggaran Proyek</span>
                    <span className="font-black text-xl text-blue-600">{formatIDR(proyek.budget)}</span>
                </div>
                <div className="flex justify-between text-sm"><span className="text-slate-400">Deadline</span><span className="font-bold">{new Date(proyek.deadline).toLocaleDateString('id-ID', { dateStyle: 'long' })}</span></div>
              </div>
            </div>
            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
              <h4 className="text-slate-400 text-[10px] font-black uppercase mb-3 tracking-widest italic">Project Note</h4>
              <p className="text-slate-600 text-sm leading-relaxed italic">{proyek.catatan || 'No specific instructions provided.'}</p>
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-6 border-b pb-2">Primary Blueprint</h3>
            <div className="rounded-[2rem] overflow-hidden border-4 border-slate-50 shadow-sm aspect-video bg-slate-100 flex items-center justify-center group relative">
              {proyek.attachment ? (
                <img src={`${BACKEND_URL}/storage/${proyek.attachment}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              ) : (
                <span className="text-slate-300 font-black uppercase text-[10px] tracking-widest">No Document Attached</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-8">
              <h3 className="text-sm font-black uppercase tracking-widest">Field Documentation</h3>
              {/* UPLOAD BUTTON: Hanya untuk Admin */}
              {canEdit && (
                <label className="cursor-pointer bg-slate-900 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase hover:bg-blue-600 transition-all shadow-lg shadow-slate-200">
                    {uploading ? 'Processing...' : '+ Add Photo'}
                    <input type="file" multiple accept="image/*" onChange={handleUploadImages} className="hidden" />
                </label>
              )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {proyek.images?.map(img => (
                  <div key={img.id} className="relative group aspect-square rounded-[1.5rem] overflow-hidden border-2 border-slate-50">
                      <img src={`${BACKEND_URL}/storage/${img.path}`} className="w-full h-full object-cover" />
                      {/* DELETE OVERLAY: Hanya untuk Admin */}
                      {canEdit && (
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                          <button onClick={() => handleDeleteImage(img.id)} className="bg-white text-red-600 w-10 h-10 rounded-xl font-bold shadow-lg hover:scale-110 transition active:scale-95">✕</button>
                        </div>
                      )}
                  </div>
              ))}
          </div>
      </div>

      {/* EDIT MODAL: Hanya dirender jika canEdit */}
      {canEdit && (
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Update Project Information">
          <form onSubmit={handleUpdateProject} className="space-y-5">
            {/* Form inputs tetap sama */}
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Project Name</label>
              <input 
                className="w-full bg-slate-50 p-4 rounded-2xl outline-none border-2 border-transparent focus:border-blue-500 transition"
                value={editData.nama} 
                onChange={e => setEditData({...editData, nama: e.target.value})} 
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Client Name</label>
              <input 
                className="w-full bg-slate-50 p-4 rounded-2xl outline-none border-2 border-transparent focus:border-blue-500 transition"
                value={editData.client} 
                onChange={e => setEditData({...editData, client: e.target.value})} 
                required
              />
            </div>
            
            <div>
              <label className="text-[10px] font-black uppercase text-blue-600 ml-2">Total Budget (Nominal IDR)</label>
              <input 
                type="number"
                className="w-full bg-blue-50/50 p-4 rounded-2xl outline-none border-2 border-blue-100 focus:border-blue-500 transition font-bold text-blue-700"
                value={editData.budget} 
                onChange={e => setEditData({...editData, budget: e.target.value})} 
                placeholder="0"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Deadline</label>
                <input 
                  type="date"
                  className="w-full bg-slate-50 p-4 rounded-2xl outline-none"
                  value={editData.deadline ? editData.deadline.split('T')[0] : ''} 
                  onChange={e => setEditData({...editData, deadline: e.target.value})} 
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Current Status</label>
                <select 
                  className="w-full bg-slate-50 p-4 rounded-2xl outline-none appearance-none font-bold"
                  value={editData.status} 
                  onChange={e => setEditData({...editData, status: e.target.value})}
                >
                  <option value="Proses">In Progress</option>
                  <option value="Selesai">Completed</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Notes</label>
              <textarea 
                rows="3"
                className="w-full bg-slate-50 p-4 rounded-2xl outline-none"
                value={editData.catatan} 
                onChange={e => setEditData({...editData, catatan: e.target.value})}
              />
            </div>
            <div className="pt-2">
              <button 
                type="submit" 
                disabled={updating}
                className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] hover:bg-blue-600 transition shadow-xl shadow-slate-200 disabled:bg-slate-300"
              >
                {updating ? 'Saving Changes...' : 'Confirm Update'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}