export default function Proyek() {
  const proyekList = [
    { id: 1, nama: "Pembangunan Ruko Melati", client: "PT. Maju Jaya", status: "Proses", deadline: "20 Des 2024" },
    { id: 2, nama: "Renovasi Apartemen Gading", client: "Bpk. Budi", status: "Selesai", deadline: "15 Nov 2024" },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h3 className="text-lg font-bold">Daftar Proyek</h3>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition shadow-md shadow-blue-200">
          + Proyek Baru
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-400 text-[11px] uppercase tracking-wider font-bold">
            <tr>
              <th className="px-6 py-4">Nama Proyek / Client</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Deadline</th>
              <th className="px-6 py-4">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {proyekList.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50/80 transition">
                <td className="px-6 py-4">
                  <p className="font-bold text-gray-800">{p.nama}</p>
                  <p className="text-xs text-gray-400">{p.client}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${p.status === 'Selesai' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 font-medium">{p.deadline}</td>
                <td className="px-6 py-4 space-x-3">
                  <button className="text-blue-500 hover:text-blue-700 font-bold text-xs uppercase">Edit</button>
                  <button className="text-red-400 hover:text-red-600 font-bold text-xs uppercase">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}