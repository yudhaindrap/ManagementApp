import { useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false); // Tambahkan loading state
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true); // Mulai loading
        
        try {
            const res = await api.post('/login', { email, password });
            
            localStorage.setItem('token', res.data.access_token);
            localStorage.setItem('user', JSON.stringify(res.data.user)); 
            
            navigate('/'); 
        } catch (err) {
            console.error(err);
            // Ambil pesan error dari backend jika ada
            const msg = err.response?.data?.message || "Login Gagal! Periksa koneksi atau kredensial.";
            alert(msg);
        } finally {
            setLoading(false); // Matikan loading apa pun hasilnya
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
            <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md border-8 border-slate-800/5">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-blue-200">
                        <span className="text-white text-2xl">🏗️</span>
                    </div>
                    <h2 className="text-3xl font-black text-slate-800">Manajemen Proyek</h2>
                    <p className="text-slate-400 text-[10px] uppercase tracking-[0.3em] font-bold mt-2">Core System Access</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-4">Email Address</label>
                        <input 
                            type="email" 
                            placeholder="admin@company.com" 
                            className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all text-sm font-medium"
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-4">Password</label>
                        <input 
                            type="password" 
                            placeholder="••••••••" 
                            className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all text-sm font-medium"
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    
                    <button 
                        disabled={loading}
                        className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-blue-100 ${
                            loading ? 'bg-slate-300 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
                        }`}
                    >
                        {loading ? 'Memverifikasi...' : 'Masuk Ke Sistem'}
                    </button>
                </form>
            </div>
        </div>
    );
}