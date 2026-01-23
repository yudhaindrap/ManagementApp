import { Outlet, Link, useLocation } from 'react-router-dom';

export default function MainLayout() {
  const location = useLocation();

  // Daftar menu yang lebih kaya fitur
  const menuItems = [
    { name: 'Dashboard', path: '/', icon: '📊' },
    { name: 'Proyek', path: '/proyek', icon: '🏗️' },
    { name: 'Stok Barang', path: '/stok', icon: '📦' },
    { name: 'Laporan', path: '/laporan', icon: '📑' }, // Menu baru
  ];

  // Fungsi untuk mendapatkan Judul Halaman berdasarkan path
  const getPageTitle = () => {
    const current = menuItems.find(item => item.path === location.pathname);
    return current ? current.name : 'Detail Proyek';
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#F8FAFC]">
      
      {/* 1. SIDEBAR (Desktop) */}
      <aside className="hidden md:flex w-72 bg-slate-900 text-white p-6 flex-col sticky top-0 h-screen shadow-2xl">
        <div className="mb-10 px-2">
          <h1 className="text-2xl font-black text-white tracking-tighter italic">
            PM<span className="text-blue-500">PRO</span>
          </h1>
          <p className="text-[10px] text-slate-500 font-bold tracking-[0.2em] uppercase">Construction System</p>
        </div>

        <nav className="space-y-1.5 flex-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center justify-between group p-3.5 rounded-2xl transition-all font-bold ${
                location.pathname === item.path 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                  : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="text-xl">{item.icon}</span>
                <span className="tracking-tight">{item.name}</span>
              </div>
              {/* Badge kecil jika di Dashboard (Contoh fitur tambahan) */}
              {item.name === 'Stok Barang' && (
                <span className="bg-red-500 text-[10px] px-2 py-0.5 rounded-full text-white animate-pulse">!</span>
              )}
            </Link>
          ))}
        </nav>

        <div className="pt-6 border-t border-slate-800 space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-black text-xs">AD</div>
            <div>
              <p className="text-xs font-bold text-white">Administrator</p>
              <p className="text-[10px] text-slate-500">Online</p>
            </div>
          </div>
          <button className="w-full flex items-center gap-3 p-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all font-bold text-sm">
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* 2. TOP BAR (Mobile & Desktop) */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40 px-6 py-4 flex justify-between items-center">
          <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">
            {getPageTitle()}
          </h2>
          
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:text-blue-600 transition">
              <span className="text-xl">🔔</span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="md:hidden w-8 h-8 rounded-full bg-slate-900"></div>
          </div>
        </header>

        {/* 3. KONTEN DINAMIS */}
        <main className="p-4 md:p-10 pb-28 md:pb-10">
          <Outlet />
        </main>
      </div>

      {/* 4. BOTTOM NAVIGATION (Mobile) */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 bg-slate-900/95 backdrop-blur-lg text-white flex justify-around items-center p-3 z-50 rounded-3xl shadow-2xl border border-white/10">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center gap-1 transition-all ${
              location.pathname === item.path ? 'text-blue-400 scale-110' : 'text-slate-500'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-[9px] font-black uppercase tracking-tighter">{item.name}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}