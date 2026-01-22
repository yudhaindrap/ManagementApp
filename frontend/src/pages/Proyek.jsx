import { useState, useEffect } from 'react';
import api from '../api/axios'; // Import config axios tadi
import Modal from '../components/Modal';

export default function Proyek() {
  const [proyekList, setProyekList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newProyek, setNewProyek] = useState({ nama: '', client: '', deadline: '', status: 'Proses' });

  // 1. Ambil Data dari Database (GET)
  const fetchProyek = async () => {
    try {
      const response = await api.get('/projects');
      setProyekList(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProyek();
  }, []);

  // 2. Simpan Data ke Database (POST)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/projects', newProyek);
      setProyekList([...proyekList, response.data]); // Update UI
      setIsModalOpen(false); // Tutup Modal
      setNewProyek({ nama: '', client: '', deadline: '', status: 'Proses' }); // Reset Form
    } catch (error) {
      alert("Gagal menyimpan data!");
    }
  };

  // 3. Hapus Data (DELETE)
  const handleDelete = async (id) => {
    if (window.confirm("Yakin ingin menghapus?")) {
      try {
        await api.delete(`/projects/${id}`);
        setProyekList(proyekList.filter(p => p.id !== id));
      } catch (error) {
        alert("Gagal menghapus!");
      }
    }
  };

  if (loading) return <div className="p-8 text-center font-bold">Memuat Data Proyek...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-slate-800">Manajemen Proyek</h3>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl font-bold transition shadow-lg shadow-blue-100"
        >
          + Proyek Baru
        </button>
      </div>

      {/* Tabel data dari database */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-400 text-[11px] uppercase font-bold">
            <tr>
              <th className="px-6 py-4">Nama Proyek</th>
              <th className="px-6 py-4">Deadline</th>
              <th className="px-6 py-4">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {proyekList.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 font-bold text-slate-700">{p.nama} <br/><span className="text-xs font-normal text-gray-400">{p.client}</span></td>
                <td className="px-6 py-4">{p.deadline}</td>
                <td className="px-6 py-4">
                  <button onClick={() => handleDelete(p.id)} className="text-red-500 font-bold hover:underline italic">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Form tetap sama, pastikan input value & onChange sinkron dengan state */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tambah Proyek">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input 
               className="w-full border p-3 rounded-lg" 
               placeholder="Nama Proyek" 
               value={newProyek.nama} 
               onChange={e => setNewProyek({...newProyek, nama: e.target.value})} 
               required 
            />
            <input 
               className="w-full border p-3 rounded-lg" 
               placeholder="Nama Client" 
               value={newProyek.client} 
               onChange={e => setNewProyek({...newProyek, client: e.target.value})} 
               required 
            />
            <input 
               type="date" 
               className="w-full border p-3 rounded-lg" 
               value={newProyek.deadline} 
               onChange={e => setNewProyek({...newProyek, deadline: e.target.value})} 
               required 
            />
            <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">Simpan ke Database</button>
          </form>
      </Modal>
    </div>
  );
}