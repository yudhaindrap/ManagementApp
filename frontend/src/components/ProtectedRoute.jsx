import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
    const userString = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    const user = userString ? JSON.parse(userString) : null;

    // 1. Jika belum login, tendang ke halaman login
    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    // 2. Jika role user tidak ada dalam daftar yang diizinkan, tendang ke dashboard/unauthorized
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    // 3. Jika oke, izinkan akses ke halaman tersebut
    return <Outlet />;
};

export default ProtectedRoute;