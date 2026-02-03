import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Modal from '../components/Modal';

export default function Proyek() {
  const [proyekList, setProyekList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [file, setFile] = useState(null);

  const [newProyek, setNewProyek] = useState({
    nama: '',
    client: '',
    deadline: '',
    budget: '',
    status: 'Proses',
  });

  const [deadlineDate, setDeadlineDate] = useState('');
  const [deadlineTime, setDeadlineTime] = useState('');

  // 🔹 Ambil Data Proyek
  const fetchProyek = async () => {
    try {
      const response = await api.get('/projects');
      setProyekList(response.data);
    } catch (error) {
      console.error('Gagal mengambil data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProyek();
  }, []);

  // 🔹 Filter Pencarian
  const filteredProyek = proyekList.filter((p) =>
    p.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.client.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 🔹 Simpan Proyek
const handleSubmit = async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append('nama', newProyek.nama);
  formData.append('client', newProyek.client);
  formData.append('deadline', newProyek.deadline);
  formData.append('budget', newProyek.budget); // Tambahkan ini
  formData.append('status', newProyek.status);
  if (file) formData.append('attachment', file);

  try {
    const response = await api.post('/projects', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    setProyekList([...proyekList, response.data]);
    setIsModalOpen(false);
    // Reset form
    setNewProyek({ nama: '', client: '', deadline: '', budget: '', status: 'Proses' }); 
    setDeadlineDate('');
    setDeadlineTime('');
    setFile(null);
  } catch (error) {
    console.error('Gagal menyimpan data:', error);
    alert('Gagal menyimpan proyek. Pastikan semua field terisi.');
  }
};

  // 🔹 Hapus Proyek
  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus proyek ini?')) return;

    try {
      await api.delete(`/projects/${id}`);
      setProyekList(proyekList.filter((p) => p.id !== id));
    } catch {
      alert('Gagal menghapus proyek');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-400 animate-pulse">
        Memuat Data Proyek...
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border">
        <h3 className="text-xl font-bold">Manajemen Proyek</h3>

        <div className="flex gap-3 w-full md:w-auto">
          <input
            type="text"
            placeholder="Cari proyek / client..."
            className="flex-1 md:w-64 border p-2.5 rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold"
          >
            + Proyek Baru
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-300">
        <table className="w-full">
          <thead className="bg-gray-50 text-gray-400 text-xs uppercase">
            <tr>
              <th className="px-6 py-4 text-left">Proyek</th>
              <th className="px-6 py-4 text-left">Deadline</th>
              <th className="px-6 py-4 text-center">Detail</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {filteredProyek.map((p) => (
              <tr key={p.id}>
                <td className="px-6 py-4">
                  <div className="font-bold">{p.nama}</div>
                  <div className="text-xs text-gray-400">{p.client}</div>
                </td>

                <td className="px-6 py-4">
                  {new Date(p.deadline).toLocaleString('id-ID', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </td>

                {/* 🔹 LINK KE DETAIL PROYEK */}
                <td className="px-6 py-4 text-center">
                  <Link
                    to={`/proyek/${p.id}`}
                    className="inline-block bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[10px] font-bold hover:bg-blue-600 hover:text-white transition"
                  >
                    DETAIL PROYEK
                  </Link>
                </td>

                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="text-red-500 font-bold text-xs hover:underline"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL TAMBAH PROYEK */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tambah Proyek Baru">
        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            placeholder="Nama Proyek"
            className="w-full border p-3 rounded-xl"
            value={newProyek.nama}
            onChange={(e) => setNewProyek({ ...newProyek, nama: e.target.value })}
            required
          />

          <input
            placeholder="Nama Client"
            className="w-full border p-3 rounded-xl"
            value={newProyek.client}
            onChange={(e) => setNewProyek({ ...newProyek, client: e.target.value })}
            required
          />

          {/* DEADLINE 2 BARIS */}
          <div>
            <label className="text-xs font-bold text-gray-400 mb-1 block">
              Deadline
            </label>

            <input
              type="date"
              className="w-full border p-3 rounded-xl mb-2"
              value={deadlineDate}
              onChange={(e) => {
                setDeadlineDate(e.target.value);
                if (deadlineTime) {
                  setNewProyek({ ...newProyek, deadline: `${e.target.value}T${deadlineTime}` });
                }
              }}
              required
            />

            <input
              type="time"
              className="w-full border p-3 rounded-xl"
              value={deadlineTime}
              onChange={(e) => {
                setDeadlineTime(e.target.value);
                if (deadlineDate) {
                  setNewProyek({ ...newProyek, deadline: `${deadlineDate}T${e.target.value}` });
                }
              }}
              required
            />
          </div>

          <input
            type="file"
            className="w-full text-xs"
            onChange={(e) => setFile(e.target.files[0])}
          />

          <div>
            <label className="text-xs font-bold text-gray-400 mb-1 block">
              Anggaran Proyek (Budget)
            </label>
            <input
              type="number"
              placeholder="Contoh: 50000000"
              className="w-full border p-3 rounded-xl font-bold text-blue-600 shadow-sm"
              value={newProyek.budget}
              onChange={(e) => setNewProyek({ ...newProyek, budget: e.target.value })}
              required
            />
          </div>

          <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold">
            Simpan Proyek
          </button>
        </form>
      </Modal>
    </div>
  );
}
