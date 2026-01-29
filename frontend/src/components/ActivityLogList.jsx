import { useEffect, useState } from 'react';
import api from '../api/axios';
import { formatDistanceToNow } from 'date-fns'; // Opsional: untuk format "2 mins ago"
import { id } from 'date-fns/locale';

export default function ActivityLogList() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    api.get('/logs').then(res => setLogs(res.data));
  }, []);

  const getIcon = (action) => {
    if (action === 'CREATE') return '✅';
    if (action === 'DELETE') return '🗑️';
    return '📝';
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
      <h3 className="text-sm font-black uppercase text-slate-800 mb-4 tracking-widest">Aktivitas Terbaru</h3>
      <div className="space-y-4">
        {logs.map(log => (
          <div key={log.id} className="flex items-start gap-4 p-3 hover:bg-slate-50 rounded-2xl transition">
            <span className="bg-white shadow-sm border border-gray-100 p-2 rounded-xl text-lg">
              {getIcon(log.action)}
            </span>
            <div>
              <p className="text-xs font-bold text-slate-700 leading-tight">{log.description}</p>
              <p className="text-[10px] text-slate-400 mt-1 font-medium italic">
                {new Date(log.created_at).toLocaleString('id-ID')}
              </p>
            </div>
          </div>
        ))}
        {logs.length === 0 && <p className="text-xs text-slate-400 text-center italic">Belum ada aktivitas.</p>}
      </div>
    </div>
  );
}