import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';
import { 
  BarChart, Bar as ReBar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, 
  ResponsiveContainer, Cell, AreaChart, Area, Legend
} from 'recharts';
import { 
  PlusCircle, 
  PackageMinus, 
  TrendingUp, 
  AlertCircle,
  ArrowUpRight,
  CircleDollarSign, // Icon baru
  Wallet // Icon baru
} from 'lucide-react';
import ActivityLogList from '../components/ActivityLogList';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, ChartLegend);

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem('user'));
  const isSuperAdmin = user?.role === 'super_admin';
  const isViewer = user?.role === 'viewer';

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        setData(res.data);
      } catch (err) {
        console.error("Gagal memuat dashboard", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading || !data) return (
    <div className="flex h-96 items-center justify-center">
      <div className="text-center animate-pulse">
        <p className="uppercase tracking-[0.3em] font-black text-slate-400">Menyusun Analisa Profit & Loss...</p>
      </div>
    </div>
  );

  const { summary, chart_data, at_risk, stock_chart_data, monthly_expenses } = data;

  const formatIDR = (val) => new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', maximumFractionDigits: 0
  }).format(val);

  // LOGIKA BARU: Kalkulasi Profit & Loss (P&L)
  const totalProfit = summary.total_budget - summary.total_realization;
  const profitPercentage = ((totalProfit / summary.total_budget) * 100).toFixed(1);

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700">
      
      {/* --- HEADER & QUICK ACTIONS --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800">Ringkasan Sistem</h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Update terakhir: {new Date().toLocaleDateString('id-ID')}</p>
        </div>
        
        {!isViewer && (
          <div className="flex flex-wrap gap-3">
            <Link to="/absensi" className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
              <PlusCircle size={16} className="text-green-500" /> Absensi & Gaji
            </Link>
            <Link to="/ambilbarang" className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
              <PackageMinus size={16} className="text-blue-500" /> Barang Keluar
            </Link>
            <Link to="/keuangan" className="flex items-center gap-2 bg-blue-600 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
              <Wallet size={16} /> Kas Keuangan
            </Link>
          </div>
        )}
      </div>

      {/* --- SECTION 1: STATS CARDS (DITAMBAHKAN PROFIT CARD) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        <div className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Proyek Aktif</p>
          <div className="flex items-end justify-between mt-2">
            <h2 className="text-3xl font-black text-slate-800">{summary.total_projects}</h2>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">+{summary.completed_projects} Done</span>
          </div>
        </div>

        {!isViewer ? (
          <>
            <div className="bg-slate-900 p-7 rounded-[2.5rem] shadow-xl shadow-slate-200 relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Total Anggaran</p>
                <h2 className="text-xl font-black text-white mt-3">{formatIDR(summary.total_budget)}</h2>
              </div>
              <TrendingUp className="absolute -right-4 -bottom-4 text-slate-800 w-24 h-24 opacity-50" />
            </div>

            <div className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Biaya Terpakai</p>
              <h2 className="text-2xl font-black text-blue-600 mt-3">{formatIDR(summary.total_realization)}</h2>
            </div>

            {/* CARD BARU: ESTIMASI PROFIT */}
            <div className="bg-emerald-600 p-7 rounded-[2.5rem] shadow-xl shadow-emerald-100 relative overflow-hidden">
              <div className="relative z-10 text-white">
                <p className="text-emerald-200 text-[10px] font-black uppercase tracking-widest">Estimasi Profit</p>
                <h2 className="text-xl font-black mt-3">{formatIDR(totalProfit)}</h2>
                <p className="text-[9px] font-bold mt-1 uppercase opacity-80">Margin: {profitPercentage}%</p>
              </div>
              <CircleDollarSign className="absolute -right-4 -bottom-4 text-emerald-500 w-24 h-24 opacity-30" />
            </div>
          </>
        ) : (
          <div className="lg:col-span-3 bg-slate-100/50 p-7 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex items-center justify-center">
             <p className="text-slate-400 text-[10px] font-bold uppercase tracking-tighter">🔒 Data Finansial Terbatas</p>
          </div>
        )}

        <div className={`p-7 rounded-[2.5rem] border-2 transition-all ${summary.low_stock_count > 0 ? 'border-red-100 bg-red-50/50' : 'border-slate-100 bg-white'}`}>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Stok Kritis</p>
          <div className="flex items-center gap-3 mt-3">
            <h2 className={`text-3xl font-black ${summary.low_stock_count > 0 ? 'text-red-600' : 'text-slate-800'}`}>
              {summary.low_stock_count}
            </h2>
            {summary.low_stock_count > 0 && <AlertCircle className="text-red-500 animate-bounce" size={20} />}
          </div>
        </div>
      </div>

      {/* --- SECTION 2: PROFIT & LOSS ANALYSIS (FITUR BARU) --- */}
      {!isViewer && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Analisa Laba / Rugi Per Proyek</h3>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Perbandingan Budget vs Realisasi (Material, Gaji, Alat)</p>
                    </div>
                </div>
                <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chart_data} barGap={8}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 'bold'}} />
                            <YAxis tickFormatter={(val) => `Rp${val/1000000}jt`} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                            <ReTooltip 
                                contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                formatter={(value) => formatIDR(value)}
                            />
                            <Legend wrapperStyle={{paddingTop: '20px'}} iconType="circle" />
                            <ReBar name="Budget Awal" dataKey="budget" fill="#cbd5e1" radius={[8, 8, 0, 0]} />
                            <ReBar name="Pengeluaran (Realisasi)" dataKey="realisasi" radius={[8, 8, 0, 0]}>
                                {chart_data.map((entry, index) => (
                                    <Cell key={index} fill={entry.realisasi > entry.budget ? '#ef4444' : '#10b981'} />
                                ))}
                            </ReBar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-slate-50 p-8 rounded-[3rem] flex flex-col justify-center items-center text-center">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-4 text-emerald-600">
                    <TrendingUp size={40} />
                </div>
                <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Efisiensi Rata-rata</h4>
                <h2 className="text-5xl font-black text-slate-800 my-2">{profitPercentage}%</h2>
                <p className="text-xs text-slate-500 px-6 font-medium">Sisa budget proyek dari total anggaran konstruksi saat ini.</p>
            </div>
        </div>
      )}

      {/* --- SECTION 3: TREN PENGELUARAN BULANAN --- */}
      {!isViewer && (
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-xl font-black text-slate-800">Tren Pengeluaran Proyek</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Arus Kas Keluar 12 Bulan Terakhir</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-2xl">
              <ArrowUpRight className="text-blue-600" size={20} />
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthly_expenses}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                <YAxis hide={true} />
                <ReTooltip 
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => formatIDR(value)}
                />
                <Area type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* --- SECTION 4: INVENTORY & LOG --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
          <h3 className="text-lg font-black text-slate-800 mb-6">Distribusi Stok Material</h3>
          <div className="h-[350px]">
            <Bar 
              data={{
                labels: Object.keys(stock_chart_data || {}),
                datasets: [{
                  data: Object.values(stock_chart_data || {}),
                  backgroundColor: '#3b82f6',
                  borderRadius: 15,
                }]
              }} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false, 
                plugins: { legend: { display: false } },
                scales: { x: { grid: { display: false } }, y: { grid: { color: '#f8fafc' } } }
              }} 
            />
          </div>
        </div>

        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col">
          <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
            Log Aktivitas <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></span>
          </h3>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-[350px]">
            <ActivityLogList />
          </div>
        </div>
      </div>

      {/* --- SECTION 5: BUDGET ALERT --- */}
      {!isViewer && (
        <div className="bg-slate-900 p-8 rounded-[3rem] text-white">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-6">Peringatan Budget Melebihi Batas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {at_risk.length > 0 ? at_risk.map((proj, idx) => (
                <div key={idx} className="flex items-center justify-between p-5 bg-slate-800 rounded-3xl border-l-4 border-red-500">
                    <div className="overflow-hidden mr-2">
                        <p className="text-[10px] font-black text-slate-500 uppercase">{proj.nama}</p>
                        <p className="text-sm font-bold truncate text-red-200">Over Budget</p>
                    </div>
                    <p className="text-red-400 font-black text-xs whitespace-nowrap bg-red-500/10 px-3 py-1 rounded-full">
                    -{formatIDR(proj.expenditures_sum_amount - proj.budget)}
                    </p>
                </div>
                )) : (
                <div className="col-span-full text-center py-6">
                    <p className="text-slate-500 text-xs italic">Semua proyek berjalan sesuai anggaran (Efisiensi Tinggi).</p>
                </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
}