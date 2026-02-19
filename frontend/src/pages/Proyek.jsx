import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Modal from '../components/Modal';
import { useNotify } from '../context/NotificationContext';

export default function Proyek() {
  const { notify, askConfirm } = useNotify();
  const [proyekList, setProyekList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  // --- LOGIKA ROLE (BARU) ---
  const user = JSON.parse(localStorage.getItem('user'));
  const isSuperAdmin = user?.role === 'super_admin';
  const canManage = user?.role === 'super_admin' || user?.role === 'admin_lapangan';

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const [file, setFile] = useState(null);
  const [deadlineDate, setDeadlineDate] = useState('');
  const [deadlineTime, setDeadlineTime] = useState('');

  const [newProyek, setNewProyek] = useState({
    id: null, 
    nama: '',
    client: '',
    deadline: '',
    budget: '',
    status: 'Proses',
  });

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedTerm(searchTerm), 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchProyek = async () => {
    try {
      const response = await api.get('/projects');
      setProyekList(response.data);
    } catch (error) {
      notify("Gagal mengambil data proyek", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProyek();
  }, []);

  const resetForm = () => {
    setNewProyek({ id: null, nama: '', client: '', deadline: '', budget: '', status: 'Proses' });
    setFile(null);
    setPreviewUrl(null); // Reset preview
  };

  const filteredProyek = proyekList.filter((p) =>
    p.nama.toLowerCase().includes(debouncedTerm.toLowerCase()) ||
    p.client.toLowerCase().includes(debouncedTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canManage) return; // Proteksi fungsi

    const formData = new FormData();
    formData.append('nama', newProyek.nama);
    formData.append('client', newProyek.client);
    formData.append('deadline', newProyek.deadline);
    formData.append('budget', newProyek.budget);
    formData.append('status', newProyek.status);
    if (file) formData.append('attachment', file);

    try {
      if (newProyek.id) {
        const response = await api.post(`/projects/${newProyek.id}?_method=PUT`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setProyekList(proyekList.map(p => p.id === newProyek.id ? response.data : p));
        notify("Proyek berhasil diperbarui");
      } else {
        const response = await api.post('/projects', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setProyekList([...proyekList, response.data]);
        notify("Proyek baru berhasil disimpan");
      }
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      notify("Gagal menyimpan data", "error");
    }
  };

  const handleDelete = (id) => {
    if (!isSuperAdmin) {
      notify("Hanya Super Admin yang dapat menghapus proyek", "error");
      return;
    }

    askConfirm("Yakin ingin menghapus proyek ini? Data yang dihapus tidak bisa dikembalikan.", async () => {
      try {
        await api.delete(`/projects/${id}`);
        setProyekList(proyekList.filter((p) => p.id !== id));
        notify("Proyek berhasil dihapus");
      } catch {
        notify("Gagal menghapus proyek", "error");
      }
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-400 animate-pulse font-bold uppercase tracking-tighter">
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
            className="flex-1 md:w-64 border p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {/* TOMBOL TAMBAH HANYA UNTUK ADMIN */}
          {canManage && (
            <button
              onClick={() => { resetForm(); setIsModalOpen(true); }}
              className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-slate-900 transition-all"
            >
              + Proyek Baru
            </button>
          )}
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
              {/* KOLOM AKSI HANYA UNTUK SUPER ADMIN */}
              {isSuperAdmin && <th className="px-6 py-4 text-right">Aksi</th>}
            </tr>
          </thead>

          <tbody>
            {filteredProyek.map((p) => (
              <tr key={p.id}>
                <td className="px-6 py-4">
                  <div className="font-bold">{p.nama}</div>
                  <div className="text-xs text-gray-400">{p.client}</div>
                </td>

                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(p.deadline).toLocaleString('id-ID', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </td>

                <td className="px-6 py-4 text-center">
                  <Link
                    to={`/proyek/${p.id}`}
                    className="inline-block bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[10px] font-bold hover:bg-blue-600 hover:text-white transition"
                  >
                    DETAIL PROYEK
                  </Link>
                </td>

                {/* TOMBOL HAPUS HANYA UNTUK SUPER ADMIN */}
                {isSuperAdmin && (
                  <td className="px-6 py-4 text-right space-x-3">
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="text-red-500 font-bold text-xs hover:underline"
                    >
                      Hapus
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL HANYA UNTUK YANG BERWENANG */}
      {canManage && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={newProyek.id ? "Edit Proyek" : "Tambah Proyek Baru"}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              placeholder="Nama Proyek"
              className="w-full border p-3 rounded-xl outline-none focus:border-blue-500"
              value={newProyek.nama}
              onChange={(e) => setNewProyek({ ...newProyek, nama: e.target.value })}
              required
            />

            <input
              placeholder="Nama Client"
              className="w-full border p-3 rounded-xl outline-none focus:border-blue-500"
              value={newProyek.client}
              onChange={(e) => setNewProyek({ ...newProyek, client: e.target.value })}
              required
            />

            <div>
              <label className="text-xs font-bold text-gray-400 mb-1 block">Deadline</label>
              <input
                type="date"
                className="w-full border p-3 rounded-xl mb-2"
                value={deadlineDate}
                onChange={(e) => {
                  setDeadlineDate(e.target.value);
                  setNewProyek({ ...newProyek, deadline: `${e.target.value}T${deadlineTime || '00:00'}` });
                }}
                required
              />
              <input
                type="time"
                className="w-full border p-3 rounded-xl"
                value={deadlineTime}
                onChange={(e) => {
                  setDeadlineTime(e.target.value);
                  setNewProyek({ ...newProyek, deadline: `${deadlineDate || ''}T${e.target.value}` });
                }}
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 mb-1 block">Primary Blueprint</label>
              <input
                type="file"
                accept="image/*"
                className="w-full text-xs mb-3"
                onChange={(e) => {
                  const selectedFile = e.target.files[0];
                  setFile(selectedFile);
                  if (selectedFile) {
                    setPreviewUrl(URL.createObjectURL(selectedFile)); // Buat URL preview
                  }
                }}
              />
              
              {/* Tampilan Preview */}
              {previewUrl && (
                <div className="relative mt-2 rounded-xl overflow-hidden border-2 border-blue-100 aspect-video">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => { setFile(null); setPreviewUrl(null); }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full text-[10px] px-2 font-bold"
                  >
                    Hapus
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 mb-1 block">Anggaran Proyek (Budget)</label>
              <input
                type="number"
                placeholder="Contoh: 50000000"
                className="w-full border p-3 rounded-xl font-bold text-blue-600"
                value={newProyek.budget}
                onChange={(e) => setNewProyek({ ...newProyek, budget: e.target.value })}
                required
              />
            </div>

            <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-slate-900 transition-all">
              {newProyek.id ? "Simpan Perubahan" : "Simpan Proyek"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}