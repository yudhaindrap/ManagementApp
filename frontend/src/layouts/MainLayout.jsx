import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api/axios';

// Import Lucide Icons
import { 
  LayoutDashboard, 
  Construction, 
  Store, 
  HardHat, 
  Package, 
  Truck, 
  PackageMinus, 
  Wallet, 
  FileText, 
  Bell, 
  LogOut, 
  AlertTriangle,
  Menu,
  X
} from 'lucide-react';

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const [alerts, setAlerts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    const confirmLogout = window.confirm("Yakin ingin keluar dari aplikasi?");
    if (!confirmLogout) return;

    try {
      // await api.post('/logout'); 
    } catch (error) {
      console.error("Logout error", error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
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
        setAlerts([]); 
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Tutup menu mobile otomatis saat berpindah halaman
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const totalNotif = alerts.length;

  const menuGroups = [
    {
      title: 'Utama',
      items: [
        { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={18} /> },
      ],
    },
    {
      title: 'Manajemen Proyek',
      items: [
        { name: 'Daftar Proyek', path: '/proyek', icon: <Construction size={18} /> },
        { name: 'Supplier', path: '/supplier', icon: <Store size={18} /> },
        { name: 'Tenaga Kerja', path: '/pekerja', icon: <HardHat size={18} /> }, 
      ],
    },
    {
      title: 'Inventori & Aset',
      items: [
        { name: 'Stok Barang', path: '/stok', icon: <Package size={18} />, alert: true },
        { name: 'Alat Berat', path: '/alatberat', icon: <Truck size={18} /> },
        { name: 'Ambil Barang', path:'/ambilbarang', icon: <PackageMinus size={18} />},
      ],
    },
    {
      title: 'Keuangan',
      items: [
        { name: 'Pengeluaran', path: '/keuangan', icon: <Wallet size={18} /> },
        { name: 'Laporan', path: '/laporan', icon: <FileText size={18} /> },
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

      {/* --- SIDEBAR DESKTOP --- */}
      <aside className="hidden md:flex w-72 bg-slate-900 text-white flex-col sticky top-0 h-screen shadow-2xl z-50">
        <div className="p-8 border-b border-slate-800 mb-2">
          <h1 className="text-2xl font-black italic tracking-tighter">
            PM<span className="text-blue-500">PRO</span>
          </h1>
          <p className="text-[10px] text-slate-500 font-bold tracking-[0.3em] uppercase mt-1">Construction ERP</p>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 space-y-8 pb-4 sidebar-scroll">
          {menuGroups.map(group => (
            <div key={group.title}>
              <p className="px-4 mb-3 text-[10px] font-black uppercase tracking-widest text-slate-600">{group.title}</p>
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
                      <span className={`${location.pathname === item.path ? 'text-white' : 'text-slate-500'}`}>{item.icon}</span>
                      <span>{item.name}</span>
                    </div>
                    {item.alert && alerts.length > 0 && <span className="bg-red-500 w-2 h-2 rounded-full animate-ping"></span>}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 bg-slate-900 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-lg shadow-inner">A</div>
            <div>
              <p className="text-sm font-bold text-white">Admin Utama</p>
              <p className="text-[10px] text-slate-500">Super Administrator</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95">
            <LogOut size={14} /> Logout System
          </button>
        </div>
      </aside>

      {/* --- MOBILE HEADER & SIDEBAR OVERLAY --- */}
      <header className="md:hidden bg-white/90 backdrop-blur-md border-b px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <h1 className="text-xl font-black italic tracking-tighter text-slate-900">PM<span className="text-blue-500">PRO</span></h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowNotif(!showNotif)} className="p-2 text-slate-600 relative">
            <Bell size={22} />
            {totalNotif > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>}
          </button>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 bg-slate-900 text-white rounded-lg">
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div className={`md:hidden fixed inset-0 z-[60] transition-all ${isMobileMenuOpen ? 'visible' : 'invisible'}`}>
        <div className={`absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setIsMobileMenuOpen(false)} />
        <aside className={`absolute left-0 top-0 bottom-0 w-72 bg-slate-900 text-white flex flex-col transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-6 border-b border-slate-800"><h1 className="text-xl font-black italic">PM<span className="text-blue-500">PRO</span></h1></div>
          <nav className="flex-1 overflow-y-auto p-4 space-y-6">
            {menuGroups.map(group => (
              <div key={group.title}>
                <p className="px-4 mb-2 text-[10px] font-black uppercase text-slate-600">{group.title}</p>
                {group.items.map(item => (
                  <Link key={item.path} to={item.path} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm ${location.pathname === item.path ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>
                    {item.icon} {item.name}
                  </Link>
                ))}
              </div>
            ))}
          </nav>
          <div className="p-4 border-t border-slate-800">
            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-red-600/10 text-red-500 py-3 rounded-xl font-bold text-xs uppercase tracking-widest"><LogOut size={16} /> Logout</button>
          </div>
        </aside>
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="hidden md:flex bg-white/80 backdrop-blur-md border-b sticky top-0 z-40 px-8 py-4 justify-between items-center shadow-sm">
          <h2 className="text-lg font-black uppercase text-slate-800 tracking-tight">{getPageTitle()}</h2>
          <div className="flex items-center gap-6">
            <div className="relative">
              <button onClick={() => setShowNotif(!showNotif)} className={`p-2 rounded-full transition-colors ${showNotif ? 'bg-slate-100 text-blue-600' : 'hover:bg-slate-100 text-slate-600'}`}>
                <Bell size={20} />
                {totalNotif > 0 && <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-white">{totalNotif}</span>}
              </button>

              {showNotif && (
                <div className="absolute right-0 mt-4 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
                    <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Pemberitahuan</h4>
                    <button onClick={() => setShowNotif(false)} className="text-xs text-blue-600 font-bold hover:text-blue-800">Tutup</button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {alerts.length > 0 ? alerts.map(item => (
                      <div key={item.id} className="p-4 bg-red-50/50 border-b border-red-100 text-xs flex gap-3">
                         <AlertTriangle className="text-red-600 shrink-0" size={18} />
                         <div>
                            <p className="font-bold text-red-700 uppercase text-[10px]">Stok Kritis</p>
                            <p className="text-red-600 mt-0.5"><span className="font-bold">{item.nama_barang}</span> sisa {item.qty} {item.unit}.</p>
                         </div>
                      </div>
                    )) : (
                      <div className="p-6 text-center">
                        <div className="bg-green-100 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 text-green-600"><Package size={20} /></div>
                        <p className="text-xs font-bold text-green-700">Semua Stok Aman</p>
                      </div>
                    )}
                    <div className="p-2 bg-slate-100 text-[9px] text-center text-slate-400 font-bold uppercase tracking-widest">Aktivitas Terakhir</div>
                    {logs.map(log => (
                      <div key={log.id} className="p-4 text-xs border-b border-gray-50 hover:bg-slate-50 transition flex gap-3 items-start">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0"></div>
                        <div>
                          <p className="text-slate-700 font-medium leading-relaxed">{log.description}</p>
                          <p className="text-[10px] text-slate-400 mt-1">{new Date(log.created_at).toLocaleString('id-ID')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="p-6 md:p-10 pb-28 md:pb-10">
          <Outlet />
        </main>
      </div>

      {/* --- FLOATING BOTTOM NAV (MOBILE ONLY) --- */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-sm">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 p-2 rounded-[2.5rem] shadow-2xl flex justify-around items-center">
          <Link to="/" className={`p-4 rounded-full transition-colors ${location.pathname === '/' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>
            <LayoutDashboard size={20} />
          </Link>
          <Link to="/proyek" className={`p-4 rounded-full transition-colors ${location.pathname === '/proyek' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>
            <Construction size={20} />
          </Link>
          <Link to="/ambilbarang" className="bg-white text-slate-900 p-4 rounded-full shadow-lg scale-110 -translate-y-2 border-4 border-[#F8FAFC]">
            <PackageMinus size={22} />
          </Link>
          <Link to="/stok" className={`p-4 rounded-full transition-colors ${location.pathname === '/stok' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>
            <Package size={20} />
          </Link>
          <Link to="/keuangan" className={`p-4 rounded-full transition-colors ${location.pathname === '/keuangan' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>
            <Wallet size={20} />
          </Link>
        </div>
      </div>

    </div>
  );
}