import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const AbsensiManager = () => {
    // Data Master
    const [projects, setProjects] = useState([]);
    const [pekerjas, setPekerjas] = useState([]);
    
    // State Transaksi
    const [absensiHarian, setAbsensiHarian] = useState([]);
    const [formData, setFormData] = useState({
        pekerja_id: '',
        project_id: '',
        tanggal: new Date().toISOString().split('T')[0],
        status: 'Hadir',
        keterangan: ''
    });

    // State Rekap
    const [filterRekap, setFilterRekap] = useState({ project_id: '', start_date: '', end_date: '' });
    const [rekap, setRekap] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchMasterData();
        fetchAbsensiHariIni();
    }, []);

    const fetchMasterData = async () => {
        try {
            const [resProject, resPekerja] = await Promise.all([
                api.get('/projects'),
                api.get('/pekerjas')
            ]);
            setProjects(resProject.data);
            setPekerjas(resPekerja.data);
        } catch (err) {
            console.error("Gagal mengambil data master", err);
        }
    };

    const fetchAbsensiHariIni = async () => {
        try {
            const res = await api.get(`/absensi?tanggal=${formData.tanggal}`);
            setAbsensiHarian(res.data);
        } catch (err) {
            console.error("Gagal ambil absensi harian", err);
        }
    };

    const handleSubmitAbsen = async (e) => {
        e.preventDefault();
        try {
            await api.post('/absensi', formData);
            alert("Absensi berhasil dicatat!");
            fetchAbsensiHariIni();
            setFormData({ ...formData, pekerja_id: '', keterangan: '' }); // reset form input
        } catch (err) {
            alert("Gagal mencatat absen. Pastikan data lengkap.");
        }
    };

    const handleHitungRekap = async () => {
        setLoading(true);
        try {
            const res = await api.get('/absensi-rekap', { params: filterRekap });
            setRekap(res.data);
        } catch (err) {
            alert("Gagal menghitung rekap. Cek filter tanggal.");
        } finally {
            setLoading(false);
        }
    };

    const handlePostToFinance = async () => {
        if (!window.confirm("Posting total upah ini ke laporan keuangan proyek?")) return;
        try {
            await api.post('/absensi/post-to-finance', {
                project_id: rekap.project_id,
                total_amount: rekap.total_pengeluaran,
                periode: rekap.periode
            });
            alert("Berhasil! Saldo pengeluaran proyek diperbarui.");
        } catch (err) {
            alert("Gagal posting ke keuangan.");
        }
    };

    return (
        <div className="p-4 md:p-8 bg-gray-100 min-h-screen space-y-8">
            <h1 className="text-3xl font-extrabold text-gray-800">Manajemen Manpower & Payroll</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* FORM INPUT ABSEN */}
                <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-blue-500">
                    <h2 className="text-lg font-bold mb-4">Input Absen Harian</h2>
                    <form onSubmit={handleSubmitAbsen} className="space-y-4">
                        <div>
                            <label className="text-sm text-gray-600">Pilih Proyek</label>
                            <select className="w-full border p-2 rounded mt-1" required
                                value={formData.project_id}
                                onChange={(e) => setFormData({...formData, project_id: e.target.value})}>
                                <option value="">-- Pilih Proyek --</option>
                                {projects.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm text-gray-600">Nama Pekerja</label>
                            <select className="w-full border p-2 rounded mt-1" required
                                value={formData.pekerja_id}
                                onChange={(e) => setFormData({...formData, pekerja_id: e.target.value})}>
                                <option value="">-- Pilih Pekerja --</option>
                                {pekerjas.map(p => <option key={p.id} value={p.id}>{p.nama} ({p.keahlian})</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-gray-600">Tanggal</label>
                                <input type="date" className="w-full border p-2 rounded" 
                                    value={formData.tanggal}
                                    onChange={(e) => setFormData({...formData, tanggal: e.target.value})}/>
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Status</label>
                                <select className="w-full border p-2 rounded"
                                    onChange={(e) => setFormData({...formData, status: e.target.value})}>
                                    <option value="Hadir">Hadir</option>
                                    <option value="Lembur">Lembur</option>
                                    <option value="Izin">Izin</option>
                                    <option value="Sakit">Sakit</option>
                                    <option value="Alpa">Alpa</option>
                                </select>
                            </div>
                        </div>
                        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition">
                            Catat Kehadiran
                        </button>
                    </form>
                </div>

                {/* LOG HARIAN */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-lg font-bold mb-4">Absensi Hari Ini ({formData.tanggal})</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="p-2">Pekerja</th>
                                    <th className="p-2">Proyek</th>
                                    <th className="p-2">Status</th>
                                    <th className="p-2">Upah</th>
                                </tr>
                            </thead>
                            <tbody>
                                {absensiHarian.map(a => (
                                    <tr key={a.id} className="border-b">
                                        <td className="p-2">{a.pekerja?.nama}</td>
                                        <td className="p-2 text-gray-500">{a.project?.nama}</td>
                                        <td className="p-2">
                                            <span className={`px-2 py-1 rounded-full text-xs ${a.status === 'Hadir' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {a.status}
                                            </span>
                                        </td>
                                        <td className="p-2 font-bold text-gray-700">Rp {Number(a.upah_harian_saat_ini).toLocaleString()}</td>
                                    </tr>
                                ))}
                                {absensiHarian.length === 0 && <tr><td colSpan="4" className="p-4 text-center text-gray-400 italic">Belum ada data untuk tanggal ini.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* SECTION REKAP MINGGUAN / PAYROLL */}
            <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-green-500">
                <h2 className="text-xl font-black mb-6 flex items-center gap-2">
                    <span className="p-2 bg-green-100 rounded text-green-600">💰</span> Rekap Gaji & Posting Keuangan
                </h2>
                <div className="flex flex-wrap gap-4 items-end mb-8 bg-gray-50 p-4 rounded-lg">
                    <div className="w-64">
                        <label className="text-xs font-bold text-gray-500 uppercase">Pilih Proyek</label>
                        <select className="w-full border p-2 rounded mt-1"
                            onChange={(e) => setFilterRekap({...filterRekap, project_id: e.target.value})}>
                            <option value="">-- Semua Proyek --</option>
                            {projects.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Dari</label>
                        <input type="date" className="w-full border p-2 rounded mt-1"
                            onChange={(e) => setFilterRekap({...filterRekap, start_date: e.target.value})}/>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Sampai</label>
                        <input type="date" className="w-full border p-2 rounded mt-1"
                            onChange={(e) => setFilterRekap({...filterRekap, end_date: e.target.value})}/>
                    </div>
                    <button onClick={handleHitungRekap} disabled={loading}
                        className="bg-green-600 text-white px-8 py-2 rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-400">
                        {loading ? 'Menghitung...' : 'Tampilkan Rekap Gaji'}
                    </button>
                </div>

                {rekap && (
                    <div className="animate-fade-in">
                        <div className="flex justify-between items-center mb-4 bg-green-50 p-4 rounded-lg border border-green-200">
                            <div>
                                <p className="text-sm text-green-600 font-bold uppercase">Total Pembayaran Upah</p>
                                <h3 className="text-3xl font-black text-green-700">Rp {rekap.total_pengeluaran.toLocaleString()}</h3>
                            </div>
                            <button onClick={handlePostToFinance}
                                className="bg-orange-500 text-white px-6 py-3 rounded-full font-black shadow-lg hover:bg-orange-600 flex items-center gap-2">
                                🚀 POSTING KE KEUANGAN
                            </button>
                        </div>
                        <table className="w-full text-left rounded-lg overflow-hidden">
                            <thead className="bg-gray-800 text-white">
                                <tr>
                                    <th className="p-3">Nama Pekerja</th>
                                    <th className="p-3">Keahlian</th>
                                    <th className="p-3 text-center">Kehadiran</th>
                                    <th className="p-3 text-right">Subtotal Upah</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rekap.data_pekerja.map(p => (
                                    <tr key={p.pekerja_id} className="border-b hover:bg-gray-50">
                                        <td className="p-3 font-bold">{p.nama}</td>
                                        <td className="p-3 text-gray-500">{p.keahlian}</td>
                                        <td className="p-3 text-center">{p.total_hadir} Hari</td>
                                        <td className="p-3 text-right font-mono font-bold text-blue-600">Rp {p.total_upah.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AbsensiManager;