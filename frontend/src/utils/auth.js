// src/utils/auth.js

export const getUser = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};

export const canAccess = (allowedRoles) => {
    const user = getUser();
    // Jika user tidak ada atau role tidak terdaftar, tolak akses
    return user && allowedRoles.includes(user.role);
};