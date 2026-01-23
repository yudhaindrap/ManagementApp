import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import Layout
import MainLayout from './layouts/MainLayout';

// Import Pages
import Dashboard from './pages/Dashboard';
import Proyek from './pages/Proyek';
import DetailProyek from './pages/DetailProyek';
import Stok from './pages/Stok';
import Login from './pages/Login';

function App() {
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <Router>
      <Routes>
        {/* LOGIN (PUBLIC) */}
        <Route path="/login" element={<Login />} />

        {/* PROTECTED ROUTES */}
        <Route
          element={
            isAuthenticated
              ? <MainLayout />
              : <Navigate to="/login" replace />
          }
        >
          {/* Dashboard */}
          <Route path="/" element={<Dashboard />} />

          {/* Proyek List */}
          <Route path="/proyek" element={<Proyek />} />

          {/* 🔥 Proyek Detail (DYNAMIC ID) */}
          <Route path="/proyek/:id" element={<DetailProyek />} />

          {/* Stok */}
          <Route path="/stok" element={<Stok />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
