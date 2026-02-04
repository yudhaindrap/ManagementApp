import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useNotify } from '../context/NotificationContext';
import { 
  Truck, 
  Plus, 
  MapPin, 
  Hash, 
  X, 
  ChevronDown, 
  LayoutGrid, 
  CheckCircle2, 
  Settings2,
  Search,
  Wrench,
  Building2
} from 'lucide-react';

export default function AlatBerat() {
  const { notify } = useNotify();
  const [tools, setTools] = useState([]);
  const [filteredTools, setFilteredTools] = useState([]); 
  const [activeFilter, setActiveFilter] = useState('Semua');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // --- LOGIKA ROLE (BARU) ---
  const user = JSON.parse(localStorage.getItem('user'));
  const isSuperAdmin = user?.role === 'super_admin';
  const canManageStatus = user?.role === 'super_admin' || user?.role === 'admin_lapangan';
  const isViewer = user?.role === 'viewer';

  const [formData, setFormData] = useState({
    id: null,
    nama_alat: '',
    merk: '',
    kode_unit: '',
    status: 'Tersedia',
    project_id: ''
  });

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    let result = tools;
    if (activeFilter !== 'Semua') {
      result = result.filter(t => t.status === activeFilter);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(t => 
        t.nama_alat.toLowerCase().includes(term) || 
        t.kode_unit.toLowerCase().includes(term) ||
        t.merk.toLowerCase().includes(term)
      );
    }
    setFilteredTools(result);
  }, [activeFilter, searchTerm, tools]);

  const fetchData = async () => {
    try {
      const [toolRes, projRes] = await Promise.all([
        api.get('/alat-berats'),
        api.get('/projects')
      ]);
      setTools(toolRes.data);
      setProjects(projRes.data);
    } catch (err) {
      notify("Gagal mengambil data inventori", "error");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    if (!canManageStatus) {
      notify("Anda tidak memiliki izin mengubah status unit", "error");
      return;
    }
    try {
      await api.put(`/alat-berats/${id}`, { status: newStatus });
      notify(`Unit berhasil diatur ke status: ${newStatus}`, "success");
      fetchData();
    } catch (err) {
      notify("Gagal memperbarui status unit", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Hanya Super Admin yang bisa menambah/edit data fundamental alat
    if (!isSuperAdmin) {
      notify("Hanya Super Admin yang dapat menambah atau mengedit aset", "error");
      return;
    }

    try {
      if (formData.id) {
        await api.put(`/alat-berats/${formData.id}`, formData);
        notify("Data aset berhasil diperbarui", "success");
      } else {
        await api.post('/alat-berats', formData);
        notify("Unit baru telah terdaftar di inventori", "success");
      }
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (err) {
      notify("Gagal menyimpan data ke server", "error");
    }
  };

  const resetForm = () => {
    setFormData({ id: null, nama_alat: '', merk: '', kode_unit: '', status: 'Tersedia', project_id: '' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Tersedia': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'Digunakan': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'Maintenance': return 'bg-rose-50 text-rose-600 border-rose-200';
      default: return 'bg-slate-50 text-slate-500 border-slate-200';
    }
  };

  const FilterTab = ({ label, icon: Icon, count }) => (
    <button
      onClick={() => setActiveFilter(label)}
      className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-200 shrink-0 ${
        activeFilter === label 
          ? 'bg-slate-900 text-white shadow-lg scale-105' 
          : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'
      }`}
    >
      <Icon size={14} />
      {label}
      <span className={`ml-1 px-2 py-0.5 rounded-md text-[10px] ${
        activeFilter === label ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-400'
      }`}>
        {count}
      </span>
    </button>
  );

  if (loading) return <div className="p-10 text-center animate-pulse uppercase font-black text-slate-400 tracking-widest">Memuat Inventori Alat...</div>;

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">Inventori Alat Berat</h2>
          <p className="text-slate-500 text-sm font-medium">Monitoring status dan distribusi aset mesin.</p>
        </div>
        {/* Tombol Tambah: Hanya Super Admin */}
        {isSuperAdmin && (
          <button 
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase flex items-center gap-2 shadow-xl hover:bg-slate-900 transition-all active:scale-95"
          >
            <Plus size={16} /> Tambah Unit
          </button>
        )}
      </div>

      {/* SEARCH & FILTER SECTION */}
      <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between">
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar w-full xl:w-auto">
          <FilterTab label="Semua" icon={LayoutGrid} count={tools.length} />
          <FilterTab label="Tersedia" icon={CheckCircle2} count={tools.filter(t => t.status === 'Tersedia').length} />
          <FilterTab label="Digunakan" icon={Truck} count={tools.filter(t => t.status === 'Digunakan').length} />
          <FilterTab label="Maintenance" icon={Settings2} count={tools.filter(t => t.status === 'Maintenance').length} />
        </div>

        <div className="relative w-full xl:w-80">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-400" />
          </div>
          <input 
            type="text"
            placeholder="Cari Nama, Kode Unit, atau Merk..."
            className="w-full pl-12 pr-10 py-3.5 bg-white border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all uppercase"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute inset-y-0 right-4 flex items-center text-slate-300 hover:text-slate-500">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* GRID LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTools.map((tool) => (
          <div key={tool.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-7 relative group hover:shadow-md transition-all">
            <div className="absolute top-7 right-7">
              <div className="relative">
                <select 
                  value={tool.status}
                  disabled={!canManageStatus}
                  onChange={(e) => updateStatus(tool.id, e.target.value)}
                  className={`appearance-none pl-4 pr-10 py-2.5 rounded-2xl text-[10px] font-black uppercase border-2 transition-all shadow-sm 
                    ${getStatusColor(tool.status)} 
                    ${canManageStatus ? 'cursor-pointer' : 'cursor-not-allowed opacity-80'}`}
                >
                  <option value="Tersedia" className="bg-white text-emerald-600 font-bold">Tersedia</option>
                  <option value="Digunakan" className="bg-white text-blue-600 font-bold">Digunakan</option>
                  <option value="Maintenance" className="bg-white text-rose-600 font-bold">Maintenance</option>
                </select>
                {canManageStatus && <ChevronDown size={14} className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-70`} />}
              </div>
            </div>

            <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Truck size={32} />
            </div>

            <h3 className="text-xl font-black text-slate-800 leading-tight">{tool.nama_alat}</h3>
            <div className="flex items-center gap-2 text-slate-400 mt-1 uppercase font-bold text-[10px] tracking-widest">
              <Hash size={12} /> {tool.kode_unit} • {tool.merk}
            </div>

            <hr className="my-6 border-slate-50" />

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                <MapPin size={18} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Lokasi Proyek</p>
                <p className="text-sm font-bold text-slate-700">{tool.project ? tool.project.nama : 'Gudang Utama'}</p>
              </div>
            </div>

            {/* Tombol Edit: Hanya Super Admin */}
            {isSuperAdmin && (
              <div className="mt-8 flex gap-2">
                <button 
                  onClick={() => { setFormData(tool); setIsModalOpen(true); }}
                  className="flex-1 py-4 bg-slate-50 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition active:scale-95"
                >
                  Edit Detail
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* MODAL (CREATE & UPDATE) */}
      {isModalOpen && isSuperAdmin && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-8 shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900">
              <X size={24} />
            </button>
            
            <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter mb-8 flex items-center gap-3">
              {formData.id ? (
                <> <Wrench size={24} className="text-blue-600" /> Edit Alat </>
              ) : (
                <> <Building2 size={24} className="text-blue-600" /> Alat Baru </>
              )}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 ml-3 uppercase">Nama Alat</label>
                <input 
                  type="text" placeholder="ex: Bulldozer D65" required
                  className="w-full p-4 bg-slate-50 rounded-2xl outline-none border-2 border-transparent focus:border-blue-500 transition-all font-bold"
                  value={formData.nama_alat} onChange={e => setFormData({...formData, nama_alat: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 ml-3 uppercase">Merk</label>
                  <input 
                    type="text" placeholder="KOMATSU" required
                    className="w-full p-4 bg-slate-50 rounded-2xl outline-none border-2 border-transparent focus:border-blue-500 transition-all font-bold"
                    value={formData.merk} onChange={e => setFormData({...formData, merk: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 ml-3 uppercase">Kode Unit</label>
                  <input 
                    type="text" placeholder="UNIT-01" required
                    className="w-full p-4 bg-slate-50 rounded-2xl outline-none border-2 border-transparent focus:border-blue-500 transition-all font-bold"
                    value={formData.kode_unit} onChange={e => setFormData({...formData, kode_unit: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 ml-3 uppercase">Status</label>
                  <select 
                    className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold cursor-pointer"
                    value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="Tersedia">Tersedia</option>
                    <option value="Digunakan">Digunakan</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 ml-3 uppercase">Penempatan</label>
                  <select 
                    className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-blue-600 cursor-pointer"
                    value={formData.project_id || ''} onChange={e => setFormData({...formData, project_id: e.target.value})}
                  >
                    <option value="">Gudang Utama</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
                  </select>
                </div>
              </div>

              <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-slate-900 transition-all active:scale-95">
                {formData.id ? 'Perbarui Aset' : 'Simpan Inventori'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}