import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import Layout
import MainLayout from './layouts/MainLayout';

// Import Pages
import Dashboard from './pages/Dashboard';
import Proyek from './pages/Proyek';
import Stok from './pages/Stok';

function App() {
  return (
    <Router>
      <Routes>
        {/* Semua halaman di bawah ini akan dibungkus oleh MainLayout (Sidebar) */}
        <Route element={<MainLayout />}>
          {/* Default path ke Dashboard */}
          <Route path="/" element={<Dashboard />} />
          
          {/* Path Manajemen Proyek */}
          <Route path="/proyek" element={<Proyek />} />
          
          {/* Path Manajemen Stok */}
          <Route path="/stok" element={<Stok />} />
        </Route>

        {/* Jika user mengakses URL sembarang, arahkan kembali ke Dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;