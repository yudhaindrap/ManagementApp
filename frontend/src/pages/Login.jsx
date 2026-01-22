import { useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/login', { email, password });
            localStorage.setItem('token', res.data.access_token);
            navigate('/'); // Pindah ke Dashboard
        } catch (err) {
            alert("Login Gagal! Periksa email dan password.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
            <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md">
                <h2 className="text-3xl font-black text-slate-800 mb-2">Selamat Datang</h2>
                <p className="text-gray-400 mb-8 text-sm uppercase tracking-widest font-bold">PM App v1.0</p>
                <form onSubmit={handleLogin} className="space-y-4">
                    <input 
                        type="email" placeholder="Email Admin" 
                        className="w-full p-4 border-2 border-gray-100 rounded-2xl outline-none focus:border-blue-500 transition-all"
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input 
                        type="password" placeholder="Password" 
                        className="w-full p-4 border-2 border-gray-100 rounded-2xl outline-none focus:border-blue-500 transition-all"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-200">
                        Masuk Sistem
                    </button>
                </form>
            </div>
        </div>
    );
}