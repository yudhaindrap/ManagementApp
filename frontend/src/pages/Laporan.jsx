import { useEffect, useState } from 'react';
import api from '../api/axios';
import { FileText, TrendingDown, Package, HardHat, Truck, Users } from 'lucide-react';

export default function Laporan() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reports')
      .then(res => { setData(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

const handleDownloadPDF = async () => {
  try {
    // 1. Minta link sementara ke server
    const res = await api.get('/reports/get-download-url');
    
    // 2. Buka link tersebut (Sudah mengandung tanda tangan keamanan)
    window.open(res.data.url, '_blank');
  } catch (err) {
    alert("Gagal mengunduh laporan. Pastikan Anda sudah login.");
  }
};

  if (loading || !data) return <div className="p-10 text-center animate-pulse font-black uppercase">Menyusun Laporan Konsolidasi...</div>;

  const formatIDR = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] border shadow-sm">
        <div>
          <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-3">
            <FileText size={32} className="text-blue-600" /> Executive Summary
          </h2>
          <p className="text-slate-500 font-medium italic">Data konsolidasi seluruh departemen per hari ini.</p>
        </div>
        <button onClick={handleDownloadPDF} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black hover:bg-red-600 transition flex items-center gap-3 shadow-xl">
           EXPORT PDF
        </button>
      </div>

      {/* Baris 1: Statistik Utama */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white shadow-lg shadow-blue-100">
          <p className="text-[10px] font-black uppercase opacity-70 tracking-widest">Total Budget Proyek</p>
          <h4 className="text-2xl font-black">{formatIDR(data.summary.total_budget)}</h4>
          <div className="mt-4 pt-4 border-t border-white/20 flex justify-between items-center">
            <span className="text-[10px] font-bold">Total Pengeluaran:</span>
            <span className="font-black">{formatIDR(data.summary.total_pengeluaran)}</span>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 flex items-center gap-6">
          <div className="w-16 h-16 bg-amber-50 rounded-3xl flex items-center justify-center text-amber-500"><HardHat size={32} /></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sumber Daya Manusia</p>
            <h4 className="text-3xl font-black text-slate-800">{data.summary.total_pekerja} <span className="text-sm text-slate-400">Pekerja</span></h4>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 flex items-center gap-6">
          <div className="w-16 h-16 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-500"><Truck size={32} /></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aset Alat Berat</p>
            <h4 className="text-3xl font-black text-slate-800">{data.summary.total_alat} <span className="text-sm text-slate-400">Unit</span></h4>
          </div>
        </div>
      </div>

      {/* Baris 2: Finansial & Stok */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Kontrol Budget per Proyek */}
        <div className="bg-white p-8 rounded-[3rem] shadow-sm border">
          <h3 className="text-lg font-black mb-6 uppercase tracking-tighter italic">Analisis Penyerapan Budget</h3>
          <div className="space-y-6">
            {data.financial_chart.map((proj, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between text-xs font-black uppercase">
                  <span>{proj.nama}</span>
                  <span className={proj.persentase > 90 ? 'text-red-500' : 'text-blue-600'}>{proj.persentase}%</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-1000 ${proj.persentase > 90 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(proj.persentase, 100)}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stok & Supplier */}
        <div className="space-y-6">
          <div className="bg-rose-900 p-8 rounded-[3rem] text-white">
             <div className="flex justify-between items-start mb-4">
                <Package size={32} />
                <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Kritis</span>
             </div>
             <h4 className="text-xl font-black uppercase">Logistik Material</h4>
             <p className="text-rose-200 text-sm mb-6 font-medium">Ada {data.summary.stok_kritis} item di bawah batas minimum.</p>
             <div className="grid grid-cols-2 gap-2">
                {data.critical_stocks.slice(0, 4).map(s => (
                  <div key={s.id} className="bg-white/10 p-3 rounded-2xl text-[10px] font-bold border border-white/10 uppercase italic">
                    {s.nama_barang}: {s.qty} {s.unit}
                  </div>
                ))}
             </div>
          </div>

          <div className="bg-white p-8 rounded-[3rem] border flex items-center justify-between">
             <div className="flex items-center gap-4 text-slate-800">
                <Users className="text-blue-600" />
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase">Supplier Terdaftar</p>
                  <p className="font-black text-xl">{data.suppliers_count} Perusahaan/Toko</p>
                </div>
             </div>
             <button className="text-[10px] font-black uppercase text-blue-600 underline">Lihat Semua</button>
          </div>
        </div>
      </div>

      {/* Baris 3: Status Alat Berat */}
      <div className="bg-slate-50 p-10 rounded-[3rem]">
        <h3 className="text-lg font-black mb-8 text-center uppercase tracking-[0.2em] text-slate-400">Operational Machine Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {data.alat_status.map((item, idx) => (
              <div key={idx} className="bg-white p-6 rounded-3xl text-center shadow-sm border border-slate-100">
                <p className="text-3xl font-black text-slate-800">{item.total}</p>
                <p className={`text-[10px] font-black uppercase mt-1 ${item.status === 'Tersedia' ? 'text-emerald-500' : item.status === 'Maintenance' ? 'text-rose-500' : 'text-blue-500'}`}>
                  {item.status}
                </p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}