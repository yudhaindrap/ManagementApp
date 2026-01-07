import { Outlet, Link, useLocation } from 'react-router-dom';

export default function MainLayout() {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: '📊' },
    { name: 'Proyek', path: '/proyek', icon: '📁' },
    { name: 'Stok Barang', path: '/stok', icon: '📦' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar Tetap */}
      <aside className="w-64 bg-slate-900 text-white p-6 hidden md:block">
        <h1 className="text-xl font-bold mb-10 text-blue-400">PM Management</h1>
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 p-3 rounded-lg transition ${
                location.pathname === item.path ? 'bg-blue-600' : 'hover:bg-slate-800'
              }`}
            >
              <span>{item.icon}</span> {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Konten Dinamis */}
      <main className="flex-1 p-8">
        <Outlet /> {/* Di sinilah isi dari Dashboard, Proyek, atau Stok akan muncul */}
      </main>
    </div>
  );
}