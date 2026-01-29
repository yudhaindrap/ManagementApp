import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate(); // Hook untuk redirect halaman

  /* NOTIFIKASI STATE
  */
  const [alerts, setAlerts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [showNotif, setShowNotif] = useState(false);

  // Fungsi Logout
  const handleLogout = async () => {
    const confirmLogout = window.confirm("Yakin ingin keluar dari aplikasi?");
    if (!confirmLogout) return;

    try {
      // Opsional: Panggil API Logout di Laravel untuk hapus token di database
      // await api.post('/logout'); 
    } catch (error) {
      console.error("Logout error", error);
    } finally {
      // Wajib: Hapus token dari penyimpanan lokal browser
      localStorage.removeItem('token');
      localStorage.removeItem('user'); // Jika kamu menyimpan data user
      
      // Redirect ke halaman login
      navigate('/login');
    }
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications');
        setAlerts(res.data.alerts || []);
        setLogs(res.data.logs || []);
      } catch (err) {
        // Silent error agar tidak mengganggu UI jika belum login
        setAlerts([]); 
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const totalNotif = alerts.length;

  /* MENU BERKELOMPOK (DITAMBAH FITUR BARU)
   */
  const menuGroups = [
    {
      title: 'Utama',
      items: [
        { name: 'Dashboard', path: '/', icon: '📊' },
      ],
    },
    {
      title: 'Manajemen Proyek',
      items: [
        { name: 'Daftar Proyek', path: '/proyek', icon: '🏗️' },
        { name: 'Supplier', path: '/supplier', icon: '🏪' },
        // FITUR BARU 1: Tenaga Kerja
        { name: 'Tenaga Kerja', path: '/pekerja', icon: '👷' }, 
      ],
    },
    {
      title: 'Inventori & Aset',
      items: [
        { name: 'Stok Barang', path: '/stok', icon: '📦', alert: true },
        { name: 'Alat Berat', path: '/alat', icon: '🚜' }, // FITUR BARU 2
      ],
    },
    {
      title: 'Keuangan', // GRUP BARU
      items: [
        { name: 'Pengeluaran', path: '/keuangan', icon: '💸' },
        { name: 'Laporan', path: '/laporan', icon: '📑' },
      ],
    },
  ];

  const getPageTitle = () => {
    for (const group of menuGroups) {
      const found = group.items.find(i => i.path === location.pathname);
      if (found) return found.name;
    }
    return 'Detail';
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#F8FAFC]">

      {/* SIDEBAR */}
      <aside className="hidden md:flex w-72 bg-slate-900 text-white flex-col sticky top-0 h-screen shadow-2xl z-50">
        
        {/* LOGO AREA */}
        <div className="p-8 border-b border-slate-800 mb-2">
          <h1 className="text-2xl font-black italic tracking-tighter">
            PM<span className="text-blue-500">PRO</span>
          </h1>
          <p className="text-[10px] text-slate-500 font-bold tracking-[0.3em] uppercase mt-1">
            Construction ERP
          </p>
        </div>

        {/* MENU NAVIGATION (Scrollable) */}
        <nav className="flex-1 overflow-y-auto px-4 space-y-8 pb-4 sidebar-scroll">
          {menuGroups.map(group => (
            <div key={group.title}>
              <p className="px-4 mb-3 text-[10px] font-black uppercase tracking-widest text-slate-600">
                {group.title}
              </p>

              <div className="space-y-1">
                {group.items.map(item => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all text-sm ${
                      location.pathname === item.path
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg opacity-80">{item.icon}</span>
                      <span>{item.name}</span>
                    </div>

                    {item.alert && alerts.length > 0 && (
                      <span className="bg-red-500 text-[9px] w-5 h-5 flex items-center justify-center rounded-full animate-pulse text-white">
                        !
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* USER PROFILE & LOGOUT (Bottom Sidebar) */}
        <div className="p-4 bg-slate-900 border-t border-slate-800">
           <div className="flex items-center gap-3 mb-4 px-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center font-bold text-lg">
                A
              </div>
              <div>
                <p className="text-sm font-bold text-white">Admin Utama</p>
                <p className="text-[10px] text-slate-500">Super Administrator</p>
              </div>
           </div>
           
           <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-red-600/90 text-slate-300 hover:text-white py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-colors"
           >
              <span>🚪</span> Logout System
           </button>
        </div>
      </aside>

      {/* TOP BAR & CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-40 px-8 py-4 flex justify-between items-center shadow-sm">
          <h2 className="text-lg font-black uppercase text-slate-800 tracking-tight">{getPageTitle()}</h2>

          <div className="flex items-center gap-6">
            
            {/* 🔔 LONCENG NOTIFIKASI */}
            <div className="relative">
              <button
                onClick={() => setShowNotif(!showNotif)}
                className="relative p-2 rounded-full hover:bg-slate-100 transition text-slate-600"
              >
                <span className="text-xl">🔔</span>
                {totalNotif > 0 && (
                  <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-white animate-pulse">
                    {totalNotif}
                  </span>
                )}
              </button>

              {/* DROPDOWN NOTIFIKASI */}
              {showNotif && (
                <div className="absolute right-0 mt-4 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[60] animate-fade-in-down">
                  <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
                    <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Pemberitahuan</h4>
                    <button onClick={() => setShowNotif(false)} className="text-xs text-blue-600 font-bold hover:underline">
                      Tutup
                    </button>
                  </div>

                  <div className="max-h-80 overflow-y-auto">
                    {/* STOK KRITIS */}
                    {alerts.length > 0 ? alerts.map(item => (
                      <div key={item.id} className="p-4 bg-red-50/50 border-b border-red-50 text-xs flex gap-3">
                         <span className="text-lg">🚨</span>
                         <div>
                            <p className="font-bold text-red-700">STOK KRITIS!</p>
                            <p className="text-red-600 mt-1">
                              <span className="font-bold">{item.nama_barang}</span> sisa {item.qty} {item.unit}.
                            </p>
                         </div>
                      </div>
                    )) : (
                      <div className="p-4 bg-green-50/50 text-xs font-bold text-green-700 text-center border-b border-green-50">
                        ✅ Semua Stok Aman
                      </div>
                    )}

                    {/* LOG AKTIVITAS */}
                    <div className="p-2 bg-slate-100 text-[9px] text-center text-slate-400 font-bold uppercase tracking-widest">
                      Aktivitas Terakhir
                    </div>

                    {logs.map(log => (
                      <div key={log.id} className="p-3 text-xs border-b border-gray-50 hover:bg-slate-50 transition flex gap-3 items-start">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0"></div>
                        <div>
                          <p className="text-slate-700 font-medium">{log.description}</p>
                          <p className="text-[10px] text-slate-400 mt-1">
                            {new Date(log.created_at).toLocaleString('id-ID')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar Mobile (Optional) */}
            <div className="md:hidden w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white text-xs font-bold">A</div>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="p-6 md:p-10 pb-28">
          <Outlet />
        </main>
      </div>
    </div>
  );
}