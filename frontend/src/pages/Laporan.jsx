import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useNotify } from '../context/NotificationContext';
import { 
  FileText, 
  TrendingDown, 
  Package, 
  HardHat, 
  Truck, 
  Users,
  Download,
  AlertTriangle 
} from 'lucide-react';

export default function Laporan() {
  const { notify } = useNotify();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      const res = await api.get('/reports');
      setData(res.data);
    } catch (err) {
      notify("Gagal menyusun data laporan terbaru", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      // 1. Minta link sementara ke server (Signed URL)
      const res = await api.get('/reports/get-download-url');
      
      // 2. Buka di tab baru untuk trigger download
      window.open(res.data.url, '_blank');
      notify("Laporan PDF sedang diunduh", "success");
    } catch (err) {
      notify("Gagal mengunduh laporan. Periksa koneksi atau izin akses.", "error");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return (
    <div className="p-20 text-center space-y-4">
      <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
      <p className="animate-pulse font-black uppercase text-slate-400 tracking-widest text-xs">
        Menyusun Laporan Konsolidasi...
      </p>
    </div>
  );

  if (!data) return (
    <div className="p-20 text-center">
      <AlertTriangle size={48} className="mx-auto text-slate-200 mb-4" />
      <p className="text-slate-400 font-black uppercase text-xs">Gagal memuat data laporan.</p>
    </div>
  );

  const formatIDR = (val) => new Intl.NumberFormat('id-ID', { 
    style: 'currency', 
    currency: 'IDR', 
    maximumFractionDigits: 0 
  }).format(val || 0);

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 rounded-[2.5rem] border shadow-sm gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-3">
            <FileText size={32} className="text-blue-600" /> Executive Summary
          </h2>
          <p className="text-slate-500 font-medium italic">Data konsolidasi seluruh departemen per hari ini.</p>
        </div>
        <button 
          onClick={handleDownloadPDF} 
          disabled={downloading}
          className={`px-8 py-4 rounded-2xl font-black transition flex items-center gap-3 shadow-xl active:scale-95 ${
            downloading ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-red-600'
          }`}
        >
          {downloading ? 'PROCESSING...' : (
            <><Download size={18} /> EXPORT PDF</>
          )}
        </button>
      </div>

      {/* Baris 1: Statistik Utama */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white shadow-lg shadow-blue-100 group">
          <p className="text-[10px] font-black uppercase opacity-70 tracking-widest">Total Budget Proyek</p>
          <h4 className="text-2xl font-black mt-1">{formatIDR(data.summary?.total_budget)}</h4>
          <div className="mt-4 pt-4 border-t border-white/20 flex justify-between items-center">
            <span className="text-[10px] font-bold opacity-80 uppercase">Realisasi:</span>
            <span className="font-black text-sm">{formatIDR(data.summary?.total_pengeluaran)}</span>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 flex items-center gap-6">
          <div className="w-16 h-16 bg-amber-50 rounded-3xl flex items-center justify-center text-amber-500 shadow-inner">
            <HardHat size={32} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Sumber Daya Manusia</p>
            <h4 className="text-3xl font-black text-slate-800 tracking-tight">
              {data.summary?.total_pekerja} <span className="text-xs text-slate-400 font-bold">ORANG</span>
            </h4>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 flex items-center gap-6">
          <div className="w-16 h-16 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-500 shadow-inner">
            <Truck size={32} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Aset Alat Berat</p>
            <h4 className="text-3xl font-black text-slate-800 tracking-tight">
              {data.summary?.total_alat} <span className="text-xs text-slate-400 font-bold">UNIT</span>
            </h4>
          </div>
        </div>
      </div>

      {/* Baris 2: Finansial & Stok */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Analisis Penyerapan Budget */}
        <div className="bg-white p-8 rounded-[3rem] shadow-sm border">
          <h3 className="text-lg font-black mb-6 uppercase tracking-tighter italic flex items-center gap-2">
            <TrendingDown size={20} className="text-blue-600" /> Analisis Penyerapan Budget
          </h3>
          <div className="space-y-6">
            {data.financial_chart?.map((proj, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase">
                  <span className="text-slate-600">{proj.nama}</span>
                  <span className={proj.persentase > 90 ? 'text-red-500' : 'text-blue-600'}>
                    {proj.persentase}%
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ease-out ${
                      proj.persentase > 90 ? 'bg-red-500' : 'bg-blue-600'
                    }`} 
                    style={{ width: `${Math.min(proj.persentase, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stok & Supplier */}
        <div className="space-y-6">
          <div className="bg-slate-900 p-8 rounded-[3rem] text-white relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
              <Package size={120} />
            </div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <Package size={32} className="text-rose-500" />
              <span className="bg-rose-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                STOK KRITIS
              </span>
            </div>
            <h4 className="text-xl font-black uppercase relative z-10">Logistik Material</h4>
            <p className="text-slate-400 text-sm mb-6 font-medium relative z-10">
              Ada {data.summary?.stok_kritis} item di bawah batas minimum.
            </p>
            <div className="grid grid-cols-2 gap-2 relative z-10">
              {data.critical_stocks?.slice(0, 4).map(s => (
                <div key={s.id} className="bg-white/5 p-3 rounded-2xl text-[9px] font-bold border border-white/10 uppercase italic">
                  {s.nama_barang}: <span className="text-rose-400">{s.qty} {s.unit}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-8 rounded-[3rem] border flex items-center justify-between group">
            <div className="flex items-center gap-4 text-slate-800">
              <div className="p-4 bg-blue-50 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Users size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Supplier Terdaftar</p>
                <p className="font-black text-xl leading-tight">{data.suppliers_count} MITRA BISNIS</p>
              </div>
            </div>
            <button className="text-[10px] font-black uppercase text-blue-600 hover:text-slate-900 underline transition-colors">
              Data Vendor
            </button>
          </div>
        </div>
      </div>

      {/* Baris 3: Status Alat Berat */}
      <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100">
        <h3 className="text-lg font-black mb-8 text-center uppercase tracking-[0.2em] text-slate-400">
          Operational Machine Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {data.alat_status?.map((item, idx) => (
            <div key={idx} className="bg-white p-8 rounded-[2rem] text-center shadow-sm border border-slate-200/50 hover:border-blue-200 transition-colors">
              <p className="text-4xl font-black text-slate-800 tracking-tighter">{item.total}</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <div className={`w-2 h-2 rounded-full ${
                  item.status === 'Tersedia' ? 'bg-emerald-500' : 
                  item.status === 'Maintenance' ? 'bg-rose-500' : 'bg-blue-500'
                }`}></div>
                <p className={`text-[10px] font-black uppercase ${
                  item.status === 'Tersedia' ? 'text-emerald-500' : 
                  item.status === 'Maintenance' ? 'text-rose-500' : 'text-blue-500'
                }`}>
                  {item.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}