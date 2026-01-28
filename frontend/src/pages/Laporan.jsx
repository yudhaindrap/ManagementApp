import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Laporan() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reports')
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // 🔽 DOWNLOAD PDF DARI SERVER
  const handleDownloadPDF = () => {
    window.open('http://127.0.0.1:8000/api/reports/export-pdf', '_blank');
  };

  if (loading) {
    return (
      <div className="p-10 text-center animate-pulse">
        Menyusun Laporan...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Laporan */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">
            Laporan Ringkas
          </h2>
          <p className="text-slate-500 font-medium">
            Data terupdate per hari ini, {new Date().toLocaleDateString('id-ID')}
          </p>
        </div>

        {/* 🔴 TOMBOL EXPORT PDF */}
        <button
          onClick={handleDownloadPDF}
          className="bg-red-600 text-white px-6 py-3 rounded-2xl font-black
                     hover:bg-red-700 transition shadow-lg shadow-red-100
                     flex items-center gap-2"
        >
          <span>📄</span>
          EXPORT PDF RESMI
        </button>
      </div>

      {/* Grid Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Proyek" value={data.summary.total_proyek} color="bg-blue-500" />
        <StatCard title="Proyek Berjalan" value={data.summary.proyek_proses} color="bg-amber-500" />
        <StatCard title="Proyek Selesai" value={data.summary.proyek_selesai} color="bg-emerald-500" />
        <StatCard
          title="Stok Kritis"
          value={data.summary.stok_kritis}
          color="bg-rose-500"
          pulse={data.summary.stok_kritis > 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Stok Kritis */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-black mb-6 flex items-center gap-2">
            <span className="text-rose-500">⚠️</span> Material Harus Dibeli
          </h3>

          <div className="space-y-4">
            {data.critical_stocks.length > 0 ? (
              data.critical_stocks.map(stock => (
                <div
                  key={stock.id}
                  className="flex justify-between items-center p-4
                             bg-rose-50 rounded-2xl border border-rose-100"
                >
                  <div>
                    <p className="font-black text-slate-800">{stock.nama_barang}</p>
                    <p className="text-xs text-rose-600 font-bold uppercase">
                      Tersisa: {stock.qty} {stock.unit}
                    </p>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">
                    Batas Min: {stock.min_qty}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-slate-400 italic text-sm">
                Semua stok aman terkendali.
              </p>
            )}
          </div>
        </div>

        {/* Proyek Terbaru */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-black mb-6">🏗️ Update Proyek Terkini</h3>

          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
                <th className="pb-4">Nama Proyek</th>
                <th className="pb-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.latest_projects.map(p => (
                <tr key={p.id}>
                  <td className="py-4 font-bold text-slate-700">{p.nama}</td>
                  <td className="py-4 text-right text-xs">
                    <span
                      className={`px-3 py-1 rounded-full font-black uppercase ${
                        p.status === 'Selesai'
                          ? 'bg-emerald-100 text-emerald-600'
                          : 'bg-blue-100 text-blue-600'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 🔹 Card Statistik
function StatCard({ title, value, color, pulse }) {
  return (
    <div
      className={`p-6 rounded-3xl text-white shadow-xl ${color}
                  ${pulse ? 'animate-bounce-short' : ''}`}
    >
      <p className="text-xs font-black uppercase opacity-80 mb-1">{title}</p>
      <p className="text-4xl font-black tracking-tighter">{value}</p>
    </div>
  );
}
