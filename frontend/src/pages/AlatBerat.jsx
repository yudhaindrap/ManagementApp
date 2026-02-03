import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Truck, PenTool, Plus, MapPin, Hash, Activity } from 'lucide-react';

export default function AlatBerat() {
  const [tools, setTools] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    nama_alat: '',
    merk: '',
    kode_unit: '',
    status: 'Tersedia',
    project_id: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [toolRes, projRes] = await Promise.all([
        api.get('/alat-berats'),
        api.get('/projects')
      ]);
      setTools(toolRes.data);
      setProjects(projRes.data);
    } catch (err) {
      console.error("Gagal mengambil data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/alat-berats', formData);
      setIsModalOpen(false);
      setFormData({ nama_alat: '', merk: '', kode_unit: '', status: 'Tersedia', project_id: '' });
      fetchData();
      alert("Alat berhasil didaftarkan!");
    } catch (err) {
      alert("Gagal menyimpan data. Pastikan Kode Unit unik.");
    }
  };

  if (loading) return <div className="p-10 text-center animate-pulse uppercase font-black">Memuat Inventori Alat...</div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">Manajemen Alat Berat</h2>
          <p className="text-slate-500 text-sm font-medium">Pantau lokasi dan kondisi aset mesin di lapangan.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase flex items-center gap-2 shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
        >
          <Plus size={16} /> Tambah Unit Alat
        </button>
      </div>

      {/* Grid Alat */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <div key={tool.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6 relative group hover:shadow-md transition-all">
            {/* Status Badge */}
            <div className={`absolute top-6 right-6 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
              tool.status === 'Tersedia' ? 'bg-emerald-100 text-emerald-600' : 
              tool.status === 'Digunakan' ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'
            }`}>
              {tool.status}
            </div>

            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Truck size={28} />
            </div>

            <h3 className="text-xl font-black text-slate-800 leading-tight">{tool.nama_alat}</h3>
            <div className="flex items-center gap-2 text-slate-400 mt-1 uppercase font-bold text-[10px] tracking-widest">
              <Hash size={12} /> {tool.kode_unit} • {tool.merk}
            </div>

            <hr className="my-5 border-slate-50" />

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                  <MapPin size={14} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase leading-none">Lokasi</p>
                  <p className="text-sm font-bold text-slate-700">{tool.project ? tool.project.nama : 'Gudang Utama'}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition">Update Status</button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL TAMBAH ALAT */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter mb-6">Registrasi Alat Baru</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input 
                type="text" placeholder="Nama Alat (ex: Excavator PC200)" required
                className="w-full p-4 bg-slate-50 rounded-2xl outline-none border-2 border-transparent focus:border-blue-500 transition"
                value={formData.nama_alat} onChange={e => setFormData({...formData, nama_alat: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="text" placeholder="Merk" required
                  className="w-full p-4 bg-slate-50 rounded-2xl outline-none"
                  value={formData.merk} onChange={e => setFormData({...formData, merk: e.target.value})}
                />
                <input 
                  type="text" placeholder="Kode Unit" required
                  className="w-full p-4 bg-slate-50 rounded-2xl outline-none"
                  value={formData.kode_unit} onChange={e => setFormData({...formData, kode_unit: e.target.value})}
                />
              </div>
              <select 
                className="w-full p-4 bg-slate-50 rounded-2xl outline-none"
                value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}
              >
                <option value="Tersedia">Tersedia (Di Gudang)</option>
                <option value="Digunakan">Digunakan (Di Proyek)</option>
                <option value="Maintenance">Maintenance (Servis)</option>
              </select>
              
              <select 
                className="w-full p-4 bg-slate-50 rounded-2xl outline-none"
                value={formData.project_id} onChange={e => setFormData({...formData, project_id: e.target.value})}
              >
                <option value="">Pilih Proyek (Jika Digunakan)</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
              </select>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="py-4 text-[10px] font-black uppercase text-slate-400 hover:text-slate-600 transition">Batal</button>
                <button type="submit" className="py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-200">Simpan Aset</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}