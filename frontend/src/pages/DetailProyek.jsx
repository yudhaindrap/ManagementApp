import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function DetailProyek() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [proyek, setProyek] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openStatus, setOpenStatus] = useState(false);
  const [updating, setUpdating] = useState(false);

  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await api.get(`/projects/${id}`);
        setProyek(res.data);
      } catch (err) {
        alert('Proyek tidak ditemukan');
        navigate('/proyek');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id, navigate]);

  const updateStatus = async (status) => {
    if (status === proyek.status) return;

    setUpdating(true);
    try {
      await api.patch(`/projects/${id}`, { status });
      setProyek((prev) => ({ ...prev, status }));
      setOpenStatus(false);
    } catch (err) {
      alert('Gagal mengubah status proyek');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-10 text-center animate-pulse text-gray-500">
        Memuat Detail Proyek...
      </div>
    );
  }

  if (!proyek) return null;

  const statusStyle = {
    Proses: 'bg-yellow-500',
    Selesai: 'bg-green-600',
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Tombol Kembali */}
      <button
        onClick={() => navigate('/proyek')}
        className="text-gray-500 hover:text-blue-600 font-bold flex items-center gap-2 transition"
      >
        ← Kembali ke Daftar Proyek
      </button>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 p-8 text-white relative">
          {/* Dropdown Status */}
            <div className="relative inline-block">
              <button
                onClick={() => setOpenStatus(!openStatus)}
                className={`${statusStyle[proyek.status]} 
                  text-[11px] font-black uppercase 
                  px-4 py-1 rounded-full 
                  inline-flex items-center gap-2 
                  hover:opacity-90 transition`}
              >
                {proyek.status}
                <span className="text-xs">▾</span>
              </button>

              {openStatus && (
                <div className="absolute z-20 mt-2 w-full rounded-2xl shadow-xl border overflow-hidden bg-white">
                  {['Proses', 'Selesai'].map((status) => {
                    const isActive = proyek.status === status;

                    return (
                      <button
                        key={status}
                        disabled={updating}
                        onClick={() => updateStatus(status)}
                        className={`w-full text-[11px] font-black uppercase
                          px-4 py-1 flex items-center gap-2 transition
                          ${
                            status === 'Proses'
                              ? `hover:bg-yellow-300 ${
                                  isActive ? 'bg-yellow-500 text-white' : 'text-yellow-800'
                                }`
                              : `hover:bg-green-300 ${
                                  isActive ? 'bg-green-500 text-white' : 'text-green-800'
                                }`
                          }
                        `}
                      >
                        <span
                          className={`w-2 h-2 rounded-full
                            ${
                              status === 'Proses'
                                ? 'bg-yellow-700'
                                : 'bg-green-700'
                            }
                          `}
                        />
                        {status}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

          <h1 className="text-3xl font-black mt-4">{proyek.nama}</h1>
          <p className="text-slate-400 mt-1">Client: {proyek.client}</p>
        </div>

        {/* Konten */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Detail Info */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                Informasi Umum
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">Deadline</span>
                  <span className="font-bold text-slate-800">
                    {new Date(proyek.deadline).toLocaleDateString('id-ID')}
                  </span>
                </div>

                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">Tanggal Input</span>
                  <span className="font-bold text-slate-800">
                    {new Date(proyek.created_at).toLocaleDateString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
              <h3 className="text-blue-700 font-bold mb-1 italic">
                Catatan Proyek
              </h3>
              <p className="text-blue-600 text-sm">
                {proyek.catatan ||
                  'Belum ada catatan tambahan untuk proyek ini.'}
              </p>
            </div>
          </div>

          {/* Lampiran */}
          <div>
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">
              Galeri Lampiran
            </h3>

            {proyek.attachment ? (
              <div className="group relative rounded-2xl overflow-hidden border-4 border-gray-100 shadow-lg">
                <img
                  src={`${BACKEND_URL}/storage/${proyek.attachment}`}
                  alt="Lampiran Proyek"
                  className="w-full h-64 object-cover transition-transform group-hover:scale-110"
                />

                <a
                  href={`${BACKEND_URL}/storage/${proyek.attachment}`}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white font-bold"
                >
                  Buka Fullscreen
                </a>
              </div>
            ) : (
              <div className="h-64 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
                <span className="text-4xl mb-2">🖼️</span>
                <p className="text-xs italic">Tidak ada foto/lampiran</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
