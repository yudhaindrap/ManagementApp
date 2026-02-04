import { useEffect, useState } from 'react';
import api from '../api/axios';
import Modal from '../components/Modal';
import { useNotify } from '../context/NotificationContext';
import { 
  ChevronDown, 
  User, 
  Phone, 
  Users, 
  UserCheck, 
  Clock,   
  UserMinus,
  Lock
} from 'lucide-react';

export default function Pekerja() {
  const { notify } = useNotify();
  const [workers, setWorkers] = useState([]);
  const [filteredWorkers, setFilteredWorkers] = useState([]);
  const [activeFilter, setActiveFilter] = useState('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // --- LOGIKA ROLE ---
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const isSuperAdmin = user.role === 'super_admin';
  const isAdminLapangan = user.role === 'admin_lapangan';
  const isViewer = user.role === 'viewer';
  
  // Izin khusus: Viewer tidak bisa tambah/edit.
  const canModify = isSuperAdmin || isAdminLapangan;
  // -------------------

  const [formData, setFormData] = useState({ 
    id: null, 
    nama: '', 
    keahlian: '', 
    kontak: '', 
    upah_harian: '', 
    status: 'Aktif' 
  });

  useEffect(() => { fetchWorkers(); }, []);

  useEffect(() => {
    if (activeFilter === 'Semua') {
      setFilteredWorkers(workers);
    } else {
      setFilteredWorkers(workers.filter(w => w.status === activeFilter));
    }
  }, [activeFilter, workers]);

  const fetchWorkers = async () => {
    try {
      const res = await api.get('/pekerjas');
      setWorkers(res.data);
    } catch (err) {
      notify("Gagal mengambil data pekerja", "error");
    }
  };

  const updateStatus = async (id, newStatus) => {
    if (!canModify) return;

    try {
      // Kirim string murni: "Aktif", "Standby", atau "Non-Aktif"
      await api.put(`/pekerjas/${id}`, { status: newStatus });
      
      // Update local state agar UI berubah tanpa reload full
      setWorkers(prev => prev.map(w => w.id === id ? { ...w, status: newStatus } : w));
      notify(`Status diperbarui ke ${newStatus}`, "success");
    } catch (err) {
      notify("Gagal memperbarui status", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canModify) return;

    try {
      if (formData.id) {
        await api.put(`/pekerjas/${formData.id}`, formData);
        notify("Data personel berhasil diperbarui", "success");
      } else {
        await api.post('/pekerjas', formData);
        notify("Personel baru berhasil ditambahkan", "success");
      }
      setIsModalOpen(false);
      fetchWorkers();
    } catch (err) {
      notify("Gagal menyimpan data", "error");
    }
  };

  const getStatusStyle = (status) => {
      switch (status) {
        case 'Aktif':
          return 'bg-emerald-100 text-emerald-700 border-emerald-200 focus:ring-emerald-500';
        case 'Standby':
          return 'bg-amber-100 text-amber-700 border-amber-200 focus:ring-amber-500';
        case 'Non-Aktif':
          return 'bg-red-100 text-red-700 border-red-200 focus:ring-red-500';
        default:
          return 'bg-slate-100 text-slate-600 border-slate-200';
      }
    };

  const FilterTab = ({ label, icon: Icon, count }) => (
    <button
      onClick={() => setActiveFilter(label)}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
        activeFilter === label 
          ? 'bg-slate-900 text-white shadow-xl shadow-slate-200 scale-105' 
          : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'
      }`}
    >
      <Icon size={14} />
      {label}
      <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[9px] ${
        activeFilter === label ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-400'
      }`}>
        {count}
      </span>
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Tenaga Kerja</h2>
          <p className="text-slate-500 text-sm font-medium">Database tim lapangan dan upah harian</p>
        </div>
        
        {/* Tombol Tambah disembunyikan jika Viewer */}
        {canModify && (
          <button 
            onClick={() => { 
              setFormData({id:null, nama:'', keahlian:'', kontak:'', upah_harian:'', status:'Aktif'}); 
              setIsModalOpen(true); 
            }}
            className="w-full md:w-auto bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase hover:bg-slate-900 transition-all shadow-xl shadow-blue-100 flex justify-center items-center gap-2"
          >
            <span>+ Tambah Personel</span>
          </button>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        <FilterTab label="Semua" icon={Users} count={workers.length} />
        <FilterTab label="Aktif" icon={UserCheck} count={workers.filter(w => w.status === 'Aktif').length} />
        <FilterTab label="Standby" icon={Clock} count={workers.filter(w => w.status === 'Standby').length} />
        <FilterTab label="Non-Aktif" icon={UserMinus} count={workers.filter(w => w.status === 'Non-Aktif').length} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredWorkers.map(w => (
          <div key={w.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition relative group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                <User size={24} className="text-slate-400 group-hover:text-blue-500" />
              </div>

              <div className="relative">
                <select 
                  value={w.status}
                  disabled={!canModify} // Select mati jika Viewer
                  onChange={(e) => updateStatus(w.id, e.target.value)}
                  className={`appearance-none pl-3 pr-8 py-1.5 rounded-full text-[10px] font-black uppercase border transition-all shadow-sm ${getStatusStyle(w.status)} ${!canModify ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                >
                  <option value="Aktif" className="bg-white text-emerald-600 font-bold">● Aktif</option>
                  <option value="Standby" className="bg-white text-amber-600 font-bold">● Standby</option>
                  <option value="Non-Aktif" className="bg-white text-red-600 font-bold">● Non-Aktif</option>
                </select>
                {canModify && <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-70" />}
              </div>
            </div>

            <h3 className="font-bold text-slate-800">{w.nama}</h3>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">{w.keahlian}</p>
            
            <hr className="my-4 border-slate-50" />
            
            <div className="flex justify-between text-xs text-slate-500 font-medium">
              <span>Upah Harian:</span>
              {/* Logika Super Admin: Hanya owner/pusat yang bisa lihat nominal upah jika diinginkan, 
                  namun di sini saya tetap tampilkan sesuai permintaan 'tanpa mengubah tampilan' */}
              <span className="text-slate-900 font-bold">Rp {parseInt(w.upah_harian).toLocaleString('id-ID')}</span>
            </div>
            
            <div className="mt-4 flex gap-2">
              {canModify ? (
                <button 
                  onClick={() => { setFormData(w); setIsModalOpen(true); }} 
                  className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-[10px] font-black uppercase text-slate-600 transition"
                >
                  Edit
                </button>
              ) : (
                <div className="flex-1 py-2.5 bg-slate-50 rounded-xl text-[10px] font-black uppercase text-slate-400 flex items-center justify-center gap-1">
                  <Lock size={10} /> Read Only
                </div>
              )}
              <a 
                href={`https://wa.me/${w.kontak}`} 
                target="_blank" 
                rel="noreferrer"
                className="flex-1 py-2.5 bg-emerald-50 hover:bg-emerald-100 rounded-xl text-[10px] font-black uppercase text-emerald-600 text-center transition flex items-center justify-center gap-1"
              >
                <Phone size={10} /> WhatsApp
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Modal hanya bisa diakses via state, tapi kita proteksi juga kontennya */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Data Tenaga Kerja">
        {canModify ? (
          <form onSubmit={handleSubmit} className="space-y-4 p-2">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Nama Lengkap</label>
              <input 
                placeholder="Nama Personel" 
                className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 border border-transparent transition-all font-medium" 
                value={formData.nama} 
                onChange={e => setFormData({...formData, nama: e.target.value})} 
                required 
              />
            </div>
            {/* ... Rest of the form ... */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Keahlian</label>
                <select 
                  className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer font-medium" 
                  value={formData.keahlian} 
                  onChange={e => setFormData({...formData, keahlian: e.target.value})} 
                  required
                >
                  <option value="">Pilih</option>
                  <option value="Mandor">Mandor</option>
                  <option value="Tukang Bangunan">Tukang Bangunan</option>
                  <option value="Kenek">Kenek</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Status</label>
                <select 
                  className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer font-medium" 
                  value={formData.status} 
                  onChange={e => setFormData({...formData, status: e.target.value})} 
                  required
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Standby">Standby</option>
                  <option value="Non-Aktif">Non-Aktif</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">No. WhatsApp</label>
              <input 
                placeholder="628..." 
                className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-medium" 
                value={formData.kontak} 
                onChange={e => setFormData({...formData, kontak: e.target.value})} 
                required 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Upah Harian (Rp)</label>
              <input 
                type="number" 
                className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-medium" 
                value={formData.upah_harian} 
                onChange={e => setFormData({...formData, upah_harian: e.target.value})} 
                required 
              />
            </div>
            <button 
              type="submit" 
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-blue-700 transition shadow-lg shadow-blue-200 mt-4 active:scale-95"
            >
              Simpan Personel
            </button>
          </form>
        ) : (
          <div className="p-10 text-center space-y-4">
             <Lock size={48} className="mx-auto text-slate-200" />
             <p className="font-black uppercase text-xs text-slate-400">Akses Terbatas</p>
          </div>
        )}
      </Modal>
    </div>
  );
}