import { useEffect, useState } from 'react';
import api from '../api/axios';
import Modal from '../components/Modal';

export default function Pekerja() {
  const [workers, setWorkers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: null, nama: '', keahlian: '', kontak: '', upah_harian: '', status: 'Aktif' });

  useEffect(() => { fetchWorkers(); }, []);

  const fetchWorkers = async () => {
    const res = await api.get('/pekerjas');
    setWorkers(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.id) await api.put(`/pekerjas/${formData.id}`, formData);
    else await api.post('/pekerjas', formData);
    setIsModalOpen(false);
    fetchWorkers();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Tenaga Kerja</h2>
          <p className="text-slate-500 text-sm font-medium">Database tim lapangan dan upah harian</p>
        </div>
        <button 
          onClick={() => { setFormData({id:null, nama:'', keahlian:'', kontak:'', upah_harian:'', status:'Aktif'}); setIsModalOpen(true); }}
          className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase hover:bg-blue-600 transition-all shadow-lg"
        >
          + Tambah Personel
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workers.map(w => (
          <div key={w.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-xl">👷</div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${w.status === 'Aktif' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {w.status}
              </span>
            </div>
            <h3 className="font-bold text-slate-800">{w.nama}</h3>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">{w.keahlian}</p>
            
            <hr className="my-4 border-slate-50" />
            
            <div className="flex justify-between text-xs text-slate-500 font-medium">
              <span>Upah Harian:</span>
              <span className="text-slate-900 font-bold">Rp {parseInt(w.upah_harian).toLocaleString('id-ID')}</span>
            </div>
            
            <div className="mt-4 flex gap-2">
              <button onClick={() => { setFormData(w); setIsModalOpen(true); }} className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-[10px] font-black uppercase text-slate-600 transition">Edit</button>
              <a href={`https://wa.me/${w.kontak}`} target="_blank" className="flex-1 py-2 bg-green-50 hover:bg-green-100 rounded-xl text-[10px] font-black uppercase text-green-600 text-center transition">WhatsApp</a>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Form */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Data Tenaga Kerja">
        <form onSubmit={handleSubmit} className="space-y-4">
          <input placeholder="Nama Lengkap" className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} required />
          <select className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" value={formData.keahlian} onChange={e => setFormData({...formData, keahlian: e.target.value})} required>
            <option value="">Pilih Keahlian</option>
            <option value="Mandor">Mandor</option>
            <option value="Tukang Bangunan">Tukang Bangunan</option>
            <option value="Tukang Kayu">Tukang Kayu</option>
            <option value="Tukang Listrik/Plumbing">Tukang Listrik/Plumbing</option>
            <option value="Kenek">Kenek</option>
          </select>
          <input placeholder="No. WhatsApp (Contoh: 62812...)" className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" value={formData.kontak} onChange={e => setFormData({...formData, kontak: e.target.value})} required />
          <input type="number" placeholder="Upah Harian (Rp)" className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" value={formData.upah_harian} onChange={e => setFormData({...formData, upah_harian: e.target.value})} required />
          <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition shadow-lg">Simpan Personel</button>
        </form>
      </Modal>
    </div>
  );
}