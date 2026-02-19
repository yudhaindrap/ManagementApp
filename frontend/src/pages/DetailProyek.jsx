import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Modal from '../components/Modal';
import { useNotify } from '../context/NotificationContext';
import { Trash2, Camera, Plus, CheckCircle2, TrendingUp, Calendar, Filter, X } from 'lucide-react';

export default function DetailProyek() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notify, askConfirm } = useNotify();

  const [proyek, setProyek] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openStatus, setOpenStatus] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // State Progres
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [progressForm, setProgressForm] = useState({ 
    item_pekerjaan: '', 
    tambah_progres: '',
    tanggal_update: new Date().toISOString().split('T')[0], // Default hari ini
    catatan: ''
  });

  // State Filter Tanggal
  const [filterDates, setFilterDates] = useState({ start: '', end: '' });

  // State Zoom & Keterangan Foto
  const [selectedImage, setSelectedImage] = useState(null);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [tempNote, setTempNote] = useState('');
  
  const user = JSON.parse(localStorage.getItem('user'));
  const canEdit = user?.role === 'super_admin' || user?.role === 'admin_lapangan';

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState({
    nama: '', client: '', deadline: '', budget: '', catatan: '', status: '', attachment: null
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

  useEffect(() => { fetchDetail(); }, [id]);

  // --- LOGIKA FILTER TANGGAL (Frontend Filter untuk kecepatan) ---
  const filteredProgress = useMemo(() => {
    if (!proyek?.progress_reports) return [];
    return proyek.progress_reports.filter(item => {
      const itemDate = new Date(item.tanggal_update).getTime();
      const start = filterDates.start ? new Date(filterDates.start).getTime() : null;
      const end = filterDates.end ? new Date(filterDates.end).getTime() : null;

      if (start && itemDate < start) return false;
      if (end && itemDate > end) return false;
      return true;
    });
  }, [proyek?.progress_reports, filterDates]);

  // --- LOGIKA PROGRESS TRACKER ---
  const handleUpdateProgress = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
        // 1. Kirim data ke backend
        await api.post(`/projects/${id}/progress`, progressForm);
        
        notify("Progres lapangan berhasil diperbarui!", "success");
        setIsProgressModalOpen(false);
        
        // 2. Reset form
        setProgressForm({ 
            item_pekerjaan: '', 
            tambah_progres: '', 
            tanggal_update: new Date().toISOString().split('T')[0],
            catatan: ''
        });

        // 3. PANGGIL ULANG DATA (Sangat Penting)
        // Ini akan memicu setProyek() dengan data terbaru termasuk progres baru
        fetchDetail(); 
        
    } catch (err) {
        notify("Gagal memperbarui progres", "error");
    } finally {
        setUpdating(false);
    }
};

  // --- LOGIKA LAINNYA ---
  const updateStatus = async (status) => {
    if (!canEdit || status === proyek.status) return;
    setUpdating(true);
    try {
      await api.patch(`/projects/${id}`, { status });
      setProyek((prev) => ({ ...prev, status }));
      setOpenStatus(false);
      notify(`Status berhasil diubah ke ${status}`, 'success');
    } catch (err) { notify('Gagal mengubah status', 'error'); } 
    finally { setUpdating(false); }
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    setUpdating(true);
    const formData = new FormData();
    formData.append('_method', 'PUT');
    Object.keys(editData).forEach(key => {
        if (editData[key] !== null) formData.append(key, editData[key]);
    });
    try {
      const res = await api.post(`/projects/${id}`, formData);
      setProyek((prev) => ({ ...prev, ...res.data.data }));
      setIsEditModalOpen(false);
      notify("Data proyek berhasil diperbarui!", "success");
    } catch (err) { notify("Gagal memperbarui data.", "error"); } 
    finally { setUpdating(false); }
  };

  const handleUploadImages = async (e) => {
    const files = e.target.files;
    if (!files.length) return;
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) { formData.append('images[]', files[i]); }
    setUploading(true);
    try {
      const res = await api.post(`/projects/${id}/images`, formData);
      setProyek(prev => ({ ...prev, images: [...(prev.images || []), ...res.data] }));
      notify("Foto dokumentasi ditambahkan", "success");
    } catch (err) { notify("Gagal upload foto", "error"); } 
    finally { setUploading(false); }
  };

  const handleDeleteImage = async (imageId) => {
    askConfirm("Hapus foto dokumentasi ini?", async () => {
      try {
        await api.delete(`/projects/images/${imageId}`);
        setProyek({ ...proyek, images: proyek.images.filter(img => img.id !== imageId) });
        notify("Foto berhasil dihapus", "success");
      } catch (err) { notify("Gagal hapus foto", "error"); }
    });
  };

  const handleSaveNote = async () => {
    try {
      const res = await api.put(`/projects/images/${selectedImage.id}`, { keterangan: tempNote });
      setProyek(prev => ({
        ...prev,
        images: prev.images.map(img => img.id === selectedImage.id ? { ...img, keterangan: res.data.keterangan } : img)
      }));
      setSelectedImage({ ...selectedImage, keterangan: res.data.keterangan });
      setIsEditingNote(false);
      notify("Keterangan disimpan", "success");
    } catch (err) { notify("Gagal menyimpan keterangan", "error"); }
  };

  const formatIDR = (val) => new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', maximumFractionDigits: 0
  }).format(val);

  if (loading || !proyek) return <div className="p-10 text-center animate-pulse text-gray-500 uppercase font-black tracking-widest">Memuat Detail Proyek...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 px-4 md:px-0">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center">
        <button onClick={() => navigate('/proyek')} className="text-gray-500 hover:text-blue-600 font-bold flex items-center gap-2 transition uppercase text-xs tracking-widest">
          ← Back to Projects
        </button>
        {canEdit && (
          <button onClick={() => setIsEditModalOpen(true)} className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-100 transition-all">
            Edit Info & Budget
          </button>
        )}
      </div>

      {/* MAIN PROJECT CARD */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-slate-900 p-10 text-white relative">
            <button
                onClick={() => canEdit && setOpenStatus(!openStatus)}
                className={`${proyek.status === 'Selesai' ? 'bg-emerald-600' : 'bg-amber-500'} text-[10px] font-black uppercase px-4 py-1.5 rounded-full inline-flex items-center gap-2 ${canEdit ? 'hover:opacity-90' : 'cursor-default'} transition`}
            >
                {proyek.status} {canEdit && <span className="text-[10px]">▼</span>}
            </button>

            {openStatus && canEdit && (
                <div className="absolute z-20 mt-2 w-32 rounded-2xl shadow-2xl border overflow-hidden bg-white text-slate-800">
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
          </div>

          <div>
            <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-6 border-b pb-2">Primary Blueprint</h3>
            <div 
              onClick={() => proyek.attachment && setSelectedImage({ path: proyek.attachment, keterangan: 'Primary Blueprint Project' })}
              className={`rounded-[2rem] overflow-hidden border-4 border-slate-50 shadow-sm aspect-video bg-slate-100 flex items-center justify-center group relative ${proyek.attachment ? 'cursor-zoom-in' : ''}`}
            >
              {proyek.attachment ? (
                <img src={`${BACKEND_URL}/storage/${proyek.attachment}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <span className="text-slate-300 font-black uppercase text-[10px] tracking-widest">No Document</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- SECTION: LIVE FIELD PROGRESS WITH DATE FILTER --- */}
      <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h3 className="text-xl font-black uppercase tracking-tighter italic flex items-center gap-2 text-slate-800">
              <TrendingUp className="text-blue-600" /> Live Field Progress
            </h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Monitoring riwayat progres lapangan</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
              <Calendar size={14} className="text-slate-400 ml-1" />
              <input 
                type="date" 
                className="bg-transparent text-[10px] font-bold uppercase outline-none"
                value={filterDates.start}
                onChange={e => setFilterDates({...filterDates, start: e.target.value})}
              />
              <span className="text-slate-300">-</span>
              <input 
                type="date" 
                className="bg-transparent text-[10px] font-bold uppercase outline-none"
                value={filterDates.end}
                onChange={e => setFilterDates({...filterDates, end: e.target.value})}
              />
              {(filterDates.start || filterDates.end) && (
                <button onClick={() => setFilterDates({start: '', end: ''})} className="text-red-500 hover:bg-red-50 p-1 rounded-lg">
                  <X size={14} />
                </button>
              )}
            </div>
            
            {canEdit && (
              <button 
                onClick={() => setIsProgressModalOpen(true)}
                className="bg-blue-600 text-white p-4 rounded-2xl hover:bg-blue-700 transition shadow-lg shadow-blue-100"
              >
                <Plus size={20} />
              </button>
            )}
          </div>
        </div>

        <div className="space-y-10">
          {filteredProgress.length > 0 ? (
            filteredProgress.map((item, idx) => (
              <div key={idx} className="group relative pl-6 border-l-2 border-slate-100 hover:border-blue-500 transition-colors pb-2">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-4 border-slate-200 group-hover:border-blue-500 transition-colors"></div>
                
                <div className="flex justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md uppercase tracking-widest italic">
                        {new Date(item.tanggal_update).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-800">{item.item_pekerjaan}</h4>
                    {item.catatan && <p className="text-xs text-slate-500 italic mt-1 leading-relaxed">"{item.catatan}"</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Status</p>
                    <span className="font-black text-blue-600 text-lg">{item.current_progres}%</span>
                  </div>
                </div>
                
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden relative">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-1000"
                    style={{ width: `${item.current_progres}%` }}
                  ></div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-[2rem]">
              <Filter className="mx-auto text-slate-200 mb-3" size={32} />
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Tidak ada progres di periode ini.</p>
            </div>
          )}
        </div>
      </div>

      {/* DOCUMENTATION SECTION */}
      <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-8">
              <h3 className="text-sm font-black uppercase tracking-widest">Field Documentation</h3>
              {canEdit && (
                <label className="cursor-pointer bg-slate-900 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase hover:bg-blue-600 transition-all shadow-lg shadow-slate-200">
                    {uploading ? 'Processing...' : '+ Add Photo'}
                    <input type="file" multiple accept="image/*" onChange={handleUploadImages} className="hidden" />
                </label>
              )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {proyek.images?.map(img => (
                  <div key={img.id} className="relative group aspect-square rounded-[1.5rem] overflow-hidden border-2 border-slate-50 shadow-sm">
                    <img 
                      src={`${BACKEND_URL}/storage/${img.path}`} 
                      className="w-full h-full object-cover cursor-zoom-in" 
                      onClick={() => setSelectedImage(img)}
                      alt="dokumentasi"
                    />
                    {canEdit && (
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteImage(img.id); }} className="bg-white text-red-600 w-10 h-10 rounded-xl shadow-xl hover:bg-red-600 hover:text-white transition-all flex items-center justify-center">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
              ))}
          </div>
      </div>

      {/* MODAL: UPDATE PROGRESS FIELD */}
      <Modal isOpen={isProgressModalOpen} onClose={() => setIsProgressModalOpen(false)} title="Laporan Progres Baru">
        <form onSubmit={handleUpdateProgress} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Tanggal Lapangan</label>
              <input 
                type="date"
                className="w-full bg-slate-50 p-4 rounded-2xl outline-none border-2 border-transparent focus:border-blue-500 font-bold"
                value={progressForm.tanggal_update}
                onChange={e => setProgressForm({...progressForm, tanggal_update: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Total Progres (%)</label>
              <input 
                type="number" max="100" min="0"
                className="w-full bg-slate-50 p-4 rounded-2xl outline-none border-2 border-transparent focus:border-blue-500 font-black text-xl text-blue-600"
                placeholder="0"
                value={progressForm.tambah_progres}
                onChange={e => setProgressForm({...progressForm, tambah_progres: e.target.value})}
                required
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Item Pekerjaan</label>
            <input 
              className="w-full bg-slate-50 p-4 rounded-2xl outline-none border-2 border-transparent focus:border-blue-500 transition font-bold text-slate-700"
              placeholder="Contoh: Pasang keramik lantai 2"
              value={progressForm.item_pekerjaan}
              onChange={e => setProgressForm({...progressForm, item_pekerjaan: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Catatan Mandor (Opsional)</label>
            <textarea 
              rows="2"
              className="w-full bg-slate-50 p-4 rounded-2xl outline-none border-2 border-transparent focus:border-blue-500 transition text-sm italic"
              placeholder="Jelaskan kondisi di lapangan..."
              value={progressForm.catatan}
              onChange={e => setProgressForm({...progressForm, catatan: e.target.value})}
            />
          </div>
          <button type="submit" disabled={updating} className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest hover:bg-blue-700 transition shadow-xl shadow-blue-100 disabled:bg-slate-300">
            {updating ? 'Proses Simpan...' : 'Publish Laporan Harian'}
          </button>
        </form>
      </Modal>

      {/* MODAL: IMAGE ZOOM & NOTES */}
      <Modal isOpen={!!selectedImage} onClose={() => { setSelectedImage(null); setIsEditingNote(false); }} title="Detail Dokumentasi">
        <div className="space-y-4">
          <div className="w-full rounded-2xl overflow-hidden bg-slate-900 border-4 border-white shadow-2xl flex items-center justify-center">
            <img src={`${BACKEND_URL}/storage/${selectedImage?.path}`} className="max-w-full h-auto max-h-[60vh] object-contain" alt="zoom" />
          </div>
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
            <div className="flex justify-between items-center mb-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">Catatan Dokumentasi</label>
              {canEdit && selectedImage?.id && !isEditingNote && (
                <button onClick={() => { setIsEditingNote(true); setTempNote(selectedImage.keterangan || ''); }} className="text-blue-600 text-[10px] font-black uppercase hover:underline">Edit</button>
              )}
            </div>
            {isEditingNote ? (
              <div className="space-y-3">
                <textarea className="w-full p-4 rounded-xl border-2 border-blue-100 outline-none focus:border-blue-500 text-sm font-medium" rows="2" value={tempNote} onChange={(e) => setTempNote(e.target.value)} />
                <div className="flex gap-2">
                  <button onClick={handleSaveNote} className="flex-1 bg-blue-600 text-white py-2 rounded-xl text-[10px] font-bold uppercase">Simpan</button>
                  <button onClick={() => setIsEditingNote(false)} className="px-4 bg-slate-200 text-slate-600 py-2 rounded-xl text-[10px] font-bold uppercase">Batal</button>
                </div>
              </div>
            ) : (
              <p className="text-slate-700 text-sm font-medium italic">{selectedImage?.keterangan || "Tidak ada keterangan."}</p>
            )}
          </div>
        </div>
      </Modal>

      {/* MODAL: EDIT INFO PROYEK */}
      {canEdit && (
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Informasi Utama Proyek">
          <form onSubmit={handleUpdateProject} className="space-y-5">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Project Name</label>
              <input className="w-full bg-slate-50 p-4 rounded-2xl outline-none border-2 border-transparent focus:border-blue-500 transition" value={editData.nama} onChange={e => setEditData({...editData, nama: e.target.value})} required />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Client</label>
              <input className="w-full bg-slate-50 p-4 rounded-2xl outline-none border-2 border-transparent focus:border-blue-500 transition" value={editData.client} onChange={e => setEditData({...editData, client: e.target.value})} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Budget (IDR)</label>
                <input type="number" className="w-full bg-slate-50 p-4 rounded-2xl outline-none border-2 border-transparent focus:border-blue-500 transition font-bold" value={editData.budget} onChange={e => setEditData({...editData, budget: e.target.value})} required />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Deadline</label>
                <input type="date" className="w-full bg-slate-50 p-4 rounded-2xl outline-none border-2 border-transparent focus:border-blue-500 transition" value={editData.deadline} onChange={e => setEditData({...editData, deadline: e.target.value})} required />
              </div>
            </div>
            <button type="submit" disabled={updating} className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] hover:bg-blue-600 transition shadow-xl shadow-slate-200 disabled:bg-slate-300">
              {updating ? 'Menyimpan...' : 'Update Data Proyek'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}