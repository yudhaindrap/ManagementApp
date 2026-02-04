import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api/axios';

// Import Lucide Icons (Ditambah: Users)
import { 
  LayoutDashboard, Construction, Store, HardHat, Package, Truck, 
  PackageMinus, Wallet, FileText, Bell, LogOut, AlertTriangle,
  Menu, X, ChevronLeft, ChevronRight, Users 
} from 'lucide-react';

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const [alerts, setAlerts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  const canAccess = (allowedRoles) => {
    if (!allowedRoles) return true;
    return allowedRoles.includes(user?.role);
  };

  const handleLogout = async () => {
    const confirmLogout = window.confirm("Yakin ingin keluar dari aplikasi?");
    if (!confirmLogout) return;

    try {
      // Sekarang memanggil API logout agar token di database dihapus
      await api.post('/logout'); 
    } catch (error) {
      console.error("Logout server error", error);
    } finally {
      localStorage.clear(); // Hapus token & user data
      navigate('/login');
    }
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications');
        setAlerts(res.data.alerts || []);
        setLogs(res.data.logs || []);
      } catch (err) { setAlerts([]); }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { setIsMobileMenuOpen(false); }, [location.pathname]);

  const totalNotif = alerts.length;

  const menuGroups = [
    {
      title: 'Utama',
      items: [
        { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={18} />, roles: ['super_admin', 'admin_lapangan', 'viewer'] },
      ],
    },
    {
      title: 'Manajemen Proyek',
      items: [
        { name: 'Daftar Proyek', path: '/proyek', icon: <Construction size={18} />, roles: ['super_admin', 'admin_lapangan', 'viewer'] },
        { name: 'Supplier', path: '/supplier', icon: <Store size={18} />, roles: ['super_admin', 'admin_lapangan'] },
        { name: 'Tenaga Kerja', path: '/pekerja', icon: <HardHat size={18} />, roles: ['super_admin'] }, 
      ],
    },
    {
      title: 'Inventori & Aset',
      items: [
        { name: 'Stok Barang', path: '/stok', icon: <Package size={18} />, alert: true, roles: ['super_admin', 'admin_lapangan', 'viewer'] },
        { name: 'Alat Berat', path: '/alatberat', icon: <Truck size={18} />, roles: ['super_admin', 'admin_lapangan', 'viewer'] },
        { name: 'Keluar Barang', path:'/ambilbarang', icon: <PackageMinus size={18} />, roles: ['super_admin', 'admin_lapangan']},
      ],
    },
    {
      title: 'Keuangan & Sistem',
      items: [
        { name: 'Pengeluaran', path: '/keuangan', icon: <Wallet size={18} />, roles: ['super_admin', 'admin_lapangan'] },
        { name: 'Laporan', path: '/laporan', icon: <FileText size={18} />, roles: ['super_admin', 'viewer'] },
        // MENU BARU: Hanya Super Admin
        { name: 'Manajemen User', path: '/users', icon: <Users size={18} />, roles: ['super_admin'] },
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
      <aside className={`hidden md:flex bg-slate-900 text-white flex-col sticky top-0 h-screen shadow-2xl z-50 transition-all duration-300 ${isSidebarCollapsed ? 'w-24' : 'w-72'}`}>
        <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="absolute -right-3 top-20 bg-blue-600 text-white rounded-full p-1 shadow-lg hover:bg-blue-700 transition-all z-[60]">
          {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        <div className={`p-8 border-b border-slate-800 mb-2 transition-all ${isSidebarCollapsed ? 'px-4 flex justify-center' : ''}`}>
          <h1 className="text-2xl font-black italic tracking-tighter">PM<span className="text-blue-500">PRO</span></h1>
          {!isSidebarCollapsed && <p className="text-[10px] text-slate-500 font-bold tracking-[0.3em] uppercase mt-1">Construction ERP</p>}
        </div>

        <nav className="flex-1 overflow-y-auto px-4 space-y-8 pb-4 main-scroll-abu">
          {menuGroups.map(group => {
            const visibleItems = group.items.filter(item => canAccess(item.roles));
            if (visibleItems.length === 0) return null;
            return (
              <div key={group.title}>
                {!isSidebarCollapsed && <p className="px-4 mb-3 text-[10px] font-black uppercase tracking-widest text-slate-600 truncate">{group.title}</p>}
                <div className="space-y-1">
                  {visibleItems.map(item => (
                    <Link key={item.path} to={item.path} className={`flex items-center px-4 py-3 rounded-xl font-bold transition-all text-sm ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} ${location.pathname === item.path ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
                      <div className="flex items-center gap-3">
                        <span className={`${location.pathname === item.path ? 'text-white' : 'text-slate-500'}`}>{item.icon}</span>
                        {!isSidebarCollapsed && <span>{item.name}</span>}
                      </div>
                      {!isSidebarCollapsed && item.alert && alerts.length > 0 && <span className="bg-red-500 w-2 h-2 rounded-full animate-ping"></span>}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        {/* FOOTER SIDEBAR DENGAN ROLE BADGE */}
        <div className={`p-4 bg-slate-900 border-t border-slate-800 ${isSidebarCollapsed ? 'flex flex-col items-center' : ''}`}>
          <div className={`flex items-center gap-3 mb-4 px-2 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-lg shadow-inner shrink-0 text-white">
              {user?.name?.charAt(0) || 'A'}
            </div>
            {!isSidebarCollapsed && (
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-white truncate">{user?.name || 'User'}</p>
                <p className={`text-[9px] px-2 py-0.5 rounded-md inline-block font-black uppercase tracking-tighter mt-0.5 ${user?.role === 'super_admin' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                  {user?.role?.replace('_', ' ')}
                </p>
              </div>
            )}
          </div>
          <button onClick={handleLogout} className={`flex items-center justify-center gap-2 bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white py-3 rounded-xl text-xs font-black uppercase transition-all ${isSidebarCollapsed ? 'w-12 h-12' : 'w-full'}`}>
            <LogOut size={16} />
            {!isSidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* --- CONTENT AREA --- */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="hidden md:flex bg-white/80 backdrop-blur-md border-b sticky top-0 z-40 px-8 py-4 justify-between items-center shadow-sm">
          <h2 className="text-lg font-black uppercase text-slate-800 tracking-tight">{getPageTitle()}</h2>
          <div className="flex items-center gap-4">
             {/* Tombol Notifikasi tetap sama seperti kode Anda */}
             <div className="relative">
                <button onClick={() => setShowNotif(!showNotif)} className="p-2 bg-slate-100 rounded-full text-slate-600">
                   <Bell size={20} />
                   {totalNotif > 0 && <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-white">{totalNotif}</span>}
                </button>
                {/* Dropdown Notif Code... */}
             </div>
          </div>
        </header>

        <main className="p-6 md:p-10 pb-28 md:pb-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}