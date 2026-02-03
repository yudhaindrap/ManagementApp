import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
  BarChart, Bar as ReBar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, 
  Legend as ReLegend, ResponsiveContainer, Cell 
} from 'recharts';
import ActivityLogList from '../components/ActivityLogList';

// Import Chart.js untuk Grafik Stok
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

// Registrasi komponen Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, ChartLegend);

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(res => setData(res.data))
      .catch(err => console.error("Gagal memuat dashboard", err));
  }, []);

  if (!data) return (
    <div className="flex h-96 items-center justify-center">
      <div className="text-center animate-pulse">
        <p className="uppercase tracking-[0.3em] font-black text-slate-400">Menyusun Data...</p>
      </div>
    </div>
  );

  const { summary, chart_data, at_risk, stock_chart_data } = data;

  // Konfigurasi Data Grafik Stok (Chart.js)
  const stockData = {
    labels: Object.keys(stock_chart_data || {}),
    datasets: [
      {
        label: 'Sisa Stok',
        data: Object.values(stock_chart_data || {}),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        hoverBackgroundColor: '#2563eb',
        borderRadius: 12,
        borderSkipped: false,
      },
    ],
  };

  const formatIDR = (val) => new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', maximumFractionDigits: 0
  }).format(val);

  return (
    <div className="space-y-10 pb-20">
      
      {/* --- SECTION 1: STATS CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Status Proyek */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Status Proyek</p>
            <h2 className="text-2xl font-black text-slate-800 mt-1">{summary.total_projects}</h2>
          </div>
          <div className="mt-1 pt-1 border-t border-slate-50 flex justify-between items-center">
            <span className="text-[10px] font-bold text-emerald-600 uppercase">Selesai: {summary.completed_projects}</span>
            <span className="text-[10px] font-bold text-amber-500 uppercase">Proses: {summary.total_projects - summary.completed_projects}</span>
          </div>
        </div>

        {/* Card 2: Total Budget (LEBIH LUAS) */}
        <div className="bg-slate-900 p-6 rounded-[2rem] shadow-xl shadow-slate-200">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Total Budget</p>
          <h2 className="text-xl font-black text-white break-all mt-3">
            {formatIDR(summary.total_budget)}
          </h2>
        </div>

        {/* Card 3: Realisasi Biaya */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Realisasi Biaya</p>
          <h2 className="text-2xl font-black text-blue-600 mt-3">
            {formatIDR(summary.total_realization)}
          </h2>
        </div>

        {/* Card 4: Stok Kritis */}
        <div className={`p-6 rounded-[2rem] border-2 ${summary.low_stock_count > 0 ? 'border-red-100 bg-red-50' : 'border-slate-100 bg-white'}`}>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Stok Kritis</p>
          <h2 className={`text-2xl font-black mt-3 ${summary.low_stock_count > 0 ? 'text-red-600 animate-pulse' : 'text-slate-800'}`}>
            {summary.low_stock_count} <span className="text-xs font-normal opacity-50">Item</span>
          </h2>
        </div>
      </div>

      {/* --- SECTION 2: INVENTORY CHART & LOG --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        
        {/* Kiri: Grafik Stok */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-black text-slate-800">Inventori Material</h3>
            <p className="text-xs text-slate-400 font-medium">Monitoring jumlah stok barang di gudang utama</p>
          </div>
          <div className="h-[350px]">
            <Bar 
              data={stockData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { grid: { display: false }, ticks: { font: { size: 10 } } },
                  x: { grid: { display: false }, ticks: { font: { size: 10, weight: 'bold' } } }
                }
              }} 
            />
          </div>
        </div>

        {/* Kanan: Log Aktivitas (Tanpa pembungkus ganda) */}
        <div className="lg:col-span-1 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col">
          <div className="mb-6">
            <h3 className="text-lg font-black text-slate-800">Aktivitas Terbaru</h3>
            <p className="text-xs text-slate-400 font-medium">Log sistem terakhir</p>
          </div>
          
          {/* Langsung masukkan list di sini dengan scroll */}
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar" style={{ maxHeight: '350px' }}>
            <ActivityLogList />
          </div>
        </div>
      </div>

      {/* --- SECTION 3: FINANCE CHART & INFO BONCOS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Grafik Analisis Anggaran */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-black text-slate-800">Analisis Anggaran</h3>
            <p className="text-xs text-slate-400">Budget vs Pengeluaran Lapangan</p>
          </div>
          <div className="h-[350px] w-full"> {/* Tinggi disamakan (350px) */}
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart_data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <ReTooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <ReBar name="Budget" dataKey="budget" fill="#e2e8f0" radius={[6, 6, 0, 0]} barSize={30} />
                <ReBar name="Realisasi" dataKey="realisasi" radius={[6, 6, 0, 0]} barSize={30}>
                  {chart_data.map((entry, index) => (
                    <Cell key={index} fill={entry.realisasi > entry.budget ? '#ef4444' : '#3b82f6'} />
                  ))}
                </ReBar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Info Boncos */}
        <div className="lg:col-span-1 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col">
          <div className="mb-6">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Proyek Over-Budget</h3>
            <p className="text-xs text-slate-400 mt-1">Daftar pembengkakan biaya</p>
          </div>
          <div className="space-y-4 overflow-y-auto pr-2 max-h-[350px] custom-scrollbar">
            {at_risk.length > 0 ? at_risk.map((proj, idx) => (
              <div key={idx} className="p-4 bg-red-50 rounded-2xl border border-red-100">
                <p className="text-xs font-bold text-slate-700 truncate">{proj.nama}</p>
                <p className="text-sm font-black text-red-600 mt-1">
                  -{formatIDR(proj.expenditures_sum_amount - proj.budget)}
                </p>
              </div>
            )) : (
              <div className="flex h-full items-center justify-center opacity-40">
                <p className="text-xs font-bold italic">Tidak ada budget bocor</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
    </div>
  );
}