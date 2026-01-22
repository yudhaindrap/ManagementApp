import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Registrasi komponen Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/dashboard-stats').then(res => setStats(res.data));
  }, []);

  if (!stats) return <div className="p-10 text-center uppercase tracking-widest animate-pulse">Menganalisis Data...</div>;

  // Konfigurasi Data Grafik
  const chartData = {
    labels: Object.keys(stats.chart_data),
    datasets: [
      {
        label: 'Jumlah Stok',
        data: Object.values(stats.chart_data),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderRadius: 8,
      },
    ],
  };

  return (
    <div className="space-y-8">
      {/* Kartu Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-gray-400 text-xs font-black uppercase italic">Total Proyek</p>
          <h2 className="text-4xl font-black text-blue-600">{stats.total_proyek}</h2>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-gray-400 text-xs font-black uppercase italic">Proyek Selesai</p>
          <h2 className="text-4xl font-black text-emerald-500">{stats.proyek_selesai}</h2>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm border-l-4 border-l-red-500">
          <p className="text-gray-400 text-xs font-black uppercase italic">Perlu Re-stock</p>
          <h2 className="text-4xl font-black text-red-500">{stats.stok_kritis} <span className="text-sm font-normal text-gray-400">Barang</span></h2>
        </div>
      </div>

      {/* Area Grafik */}
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div className="mb-6">
          <h3 className="text-lg font-black text-slate-800">Visualisasi Stok Material</h3>
          <p className="text-sm text-gray-400">Perbandingan jumlah ketersediaan barang saat ini di database.</p>
        </div>
        <div className="h-[400px] flex justify-center">
          <Bar 
            data={chartData} 
            options={{ 
              responsive: true, 
              maintainAspectRatio: false,
              plugins: { legend: { display: false } }
            }} 
          />
        </div>
      </div>
    </div>
  );
}