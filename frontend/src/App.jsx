import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import Context Provider & Components
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute'; 
import MainLayout from './layouts/MainLayout';

// --- LAZY LOADING PAGES ---
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Proyek = lazy(() => import('./pages/Proyek'));
const DetailProyek = lazy(() => import('./pages/DetailProyek'));
const Stok = lazy(() => import('./pages/Stok'));
const Login = lazy(() => import('./pages/Login'));
const Supplier = lazy(() => import('./pages/Supplier'));
const Laporan = lazy(() => import('./pages/Laporan'));
const Pekerja = lazy(() => import('./pages/Pekerja'));
const Keuangan = lazy(() => import('./pages/Keuangan'));
const AlatBerat = lazy(() => import('./pages/AlatBerat'));
const AmbilBarang = lazy(() => import('./pages/AmbilBarang'));
const UserManagement = lazy(() => import('./pages/UserManagement'));

// Komponen Loading yang estetik sesuai tema PM PRO
const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-[#F8FAFC]">
    <div className="flex flex-col items-center gap-4">
      <div className="h-12 w-12 animate-spin rounded-2xl border-4 border-slate-200 border-t-blue-600"></div>
      <div className="text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
          Memuat Sistem
        </p>
        <p className="text-[10px] font-bold text-blue-500/50 mt-1 uppercase">PM PRO v1.0</p>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <NotificationProvider>
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* PUBLIC ROUTE */}
            <Route path="/login" element={<Login />} />

            {/* --- AUTHENTICATED AREA --- */}
            <Route element={<MainLayout />}>
              
              {/* 1. Akses: UMUM (Semua Role) */}
              <Route element={<ProtectedRoute allowedRoles={['super_admin', 'admin_lapangan', 'viewer']} />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/proyek" element={<Proyek />} />
                <Route path="/proyek/:id" element={<DetailProyek />} />
                <Route path="/stok" element={<Stok />} />
                <Route path="/alatberat" element={<AlatBerat />} />
              </Route>

              {/* 2. Akses: OPERASIONAL (Input & Edit) */}
              <Route element={<ProtectedRoute allowedRoles={['super_admin', 'admin_lapangan']} />}>
                <Route path="/supplier" element={<Supplier />} />
                <Route path="/ambilbarang" element={<AmbilBarang />} />
                <Route path="/keuangan" element={<Keuangan />} />
              </Route>

              {/* 3. Akses: STRATEGIS (Super Admin & Viewer Laporan) */}
              <Route element={<ProtectedRoute allowedRoles={['super_admin', 'viewer']} />}>
                <Route path="/laporan" element={<Laporan />} />
              </Route>

              {/* 4. Akses: ADMINISTRATOR (Hanya Super Admin) */}
              <Route element={<ProtectedRoute allowedRoles={['super_admin']} />}>
                <Route path="/pekerja" element={<Pekerja />} />
                <Route path="/users" element={<UserManagement />} />
              </Route>

            </Route>

            {/* REDIRECT UNKNOWN ROUTES */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </NotificationProvider>
  );
}

export default App;