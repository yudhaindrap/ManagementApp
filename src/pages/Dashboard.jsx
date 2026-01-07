export default function Dashboard() {
  const stats = [
    { label: "Total Proyek", value: "12", color: "bg-blue-500", icon: "📁" },
    { label: "Barang Tersedia", value: "850", color: "bg-emerald-500", icon: "📦" },
    { label: "Proyek Berjalan", value: "5", color: "bg-amber-500", icon: "🚧" },
    { label: "Stok Menipis", value: "3", color: "bg-red-500", icon: "⚠️" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`${stat.color} w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-${stat.color.split('-')[1]}-200`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold mb-4">Aktivitas Terakhir</h3>
        <p className="text-gray-500 text-sm italic">Belum ada aktivitas terbaru hari ini.</p>
      </div>
    </div>
  );
}