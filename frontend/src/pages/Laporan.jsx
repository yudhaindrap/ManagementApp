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
  AlertTriangle,
  Coins, // Icon Baru
  ArrowUpRight
} from 'lucide-react';
import { Link } from "react-router-dom";

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
      const res = await api.get('/reports/get-download-url');
      window.open(res.data.url, '_blank');
      notify("Laporan PDF sedang diunduh", "success");
    } catch (err) {
      notify("Gagal mengunduh laporan.", "error");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return (
    <div className="p-20 text-center space-y-4">
      <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
      <p className="animate-pulse font-black uppercase text-slate-400 tracking-widest text-xs">Menyusun Laporan Konsolidasi...</p>
    </div>
  );

  const formatIDR = (val) => new Intl.NumberFormat('id-ID', { 
    style: 'currency', currency: 'IDR', maximumFractionDigits: 0 
  }).format(val || 0);

  // Kalkulasi Profit
  const estProfit = data.summary?.total_budget - data.summary?.total_pengeluaran;

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 rounded-[2.5rem] border shadow-sm gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-3">
            <FileText size={32} className="text-blue-600" /> Executive Report
          </h2>
          <p className="text-slate-500 font-medium italic">Status laba/rugi dan operasional terintegrasi.</p>
        </div>
        <button 
          onClick={handleDownloadPDF} 
          disabled={downloading}
          className={`px-8 py-4 rounded-2xl font-black transition flex items-center gap-3 shadow-xl active:scale-95 ${
            downloading ? 'bg-slate-400 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700'
          }`}
        >
          {downloading ? 'GENERATING...' : <><Download size={18} /> EXPORT PDF REPORT</>}
        </button>
      </div>

      {/* Stats Utama + Profit/Loss */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white shadow-lg shadow-blue-100">
          <p className="text-[10px] font-black uppercase opacity-70 tracking-widest">Revenue (Budget)</p>
          <h4 className="text-2xl font-black mt-1">{formatIDR(data.summary?.total_budget)}</h4>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Expenses</p>
          <h4 className="text-2xl font-black text-slate-800 tracking-tight">{formatIDR(data.summary?.total_pengeluaran)}</h4>
        </div>

        {/* NEW: PROFIT CARD */}
        <div className={`${estProfit >= 0 ? 'bg-emerald-500' : 'bg-rose-500'} p-8 rounded-[2.5rem] text-white shadow-lg`}>
          <p className="text-[10px] font-black uppercase opacity-70 tracking-widest">Gross Profit/Loss</p>
          <h4 className="text-2xl font-black mt-1">{formatIDR(estProfit)}</h4>
          <p className="text-[10px] mt-2 font-bold uppercase italic">
            {estProfit >= 0 ? 'Status: Efisien' : 'Status: Over Budget'}
          </p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 flex items-center gap-4">
          <div className="p-4 bg-amber-50 rounded-2xl text-amber-500">
            <HardHat size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Manpower</p>
            <h4 className="text-xl font-black text-slate-800">{data.summary?.total_pekerja} Orang</h4>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Progress & Profit/Loss per Project */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] shadow-sm border">
          <h3 className="text-lg font-black mb-6 uppercase tracking-tighter flex items-center gap-2">
            <ArrowUpRight size={20} className="text-blue-600" /> Penyerapan & Margin Proyek
          </h3>
          <div className="space-y-6">
            {data.financial_chart?.map((proj, idx) => {
                const profit = proj.budget - proj.realisasi;
                return (
                    <div key={idx} className="p-4 rounded-3xl border border-slate-50 hover:bg-slate-50 transition-colors">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-black text-slate-700 uppercase">{proj.nama}</span>
                            <span className={`text-xs font-bold ${profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                Margin: {formatIDR(profit)}
                            </span>
                        </div>
                        <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex">
                            <div 
                                className={`h-full transition-all duration-1000 ${proj.persentase > 90 ? 'bg-rose-500' : 'bg-blue-600'}`} 
                                style={{ width: `${Math.min(proj.persentase, 100)}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between mt-1">
                            <span className="text-[9px] font-bold text-slate-400 uppercase">Usage: {proj.persentase}%</span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase">Budget: {formatIDR(proj.budget)}</span>
                        </div>
                    </div>
                )
            })}
          </div>
        </div>

        {/* Manpower & Machine Summary */}
        <div className="space-y-6">
            <div className="bg-slate-900 p-8 rounded-[3rem] text-white relative overflow-hidden">
                <Coins className="absolute -right-4 -bottom-4 opacity-10 w-32 h-32" />
                <h4 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-4">Ringkasan Payroll</h4>
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-400 font-medium">Total Upah Terbayar</span>
                        <span className="font-bold">{formatIDR(data.summary?.total_upah)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-400 font-medium">Pekerja Aktif</span>
                        <span className="font-bold">{data.summary?.total_pekerja}</span>
                    </div>
                </div>
                <Link to="/absensi" className="block mt-8 text-center bg-blue-600 py-3 rounded-2xl font-black text-xs hover:bg-blue-700 transition">
                    DETAIL MANPOWER
                </Link>
            </div>

            <div className="bg-white p-8 rounded-[3rem] border border-slate-100">
                <div className="flex items-center gap-3 mb-6">
                    <Truck className="text-indigo-500" />
                    <h4 className="text-sm font-black uppercase">Aset Alat Berat</h4>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    {data.alat_status?.map((item, i) => (
                        <div key={i} className="text-center p-2 rounded-xl bg-slate-50 border">
                            <p className="text-lg font-black">{item.total}</p>
                            <p className="text-[8px] font-bold text-slate-400 uppercase">{item.status}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}