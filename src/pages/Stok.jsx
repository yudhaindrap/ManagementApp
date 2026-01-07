export default function Stok() {
  const items = [
    { id: 1, nama: "Semen Portland 50kg", qty: 45, unit: "Sak", min: 10 },
    { id: 2, nama: "Cat Tembok Putih 20L", qty: 5, unit: "Pail", min: 10 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold">Manajemen Inventori</h3>
        <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition">
          + Tambah Barang
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
            {item.qty <= item.min && (
              <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] px-3 py-1 rounded-bl-lg font-bold">STOK RENDAH</div>
            )}
            <h4 className="font-bold text-gray-800 mb-1 group-hover:text-emerald-600 transition">{item.nama}</h4>
            <div className="flex items-end gap-2 mt-4">
              <span className="text-4xl font-black text-slate-700">{item.qty}</span>
              <span className="text-gray-400 font-medium mb-1">{item.unit}</span>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-50 flex justify-between items-center">
              <button className="text-xs font-bold text-gray-400 hover:text-gray-600">RIWAYAT</button>
              <button className="bg-gray-100 hover:bg-emerald-50 hover:text-emerald-600 text-gray-600 px-4 py-2 rounded-lg text-xs font-bold transition">
                UPDATE STOK
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}