import { useEffect, useState } from 'react';
import api from '../api/axios';
import { 
  PlusCircle, 
  Trash2, 
  FileEdit, 
  History, 
  Clock 
} from 'lucide-react';

export default function ActivityLogList() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    api.get('/logs').then(res => setLogs(res.data));
  }, []);

  // Fungsi untuk mendapatkan ikon dan warna berdasarkan tipe aksi
  const getActionConfig = (action) => {
    switch (action) {
      case 'CREATE':
        return {
          icon: <PlusCircle size={16} className="text-emerald-600" />,
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-100'
        };
      case 'DELETE':
        return {
          icon: <Trash2 size={16} className="text-red-600" />,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-100'
        };
      case 'UPDATE':
        return {
          icon: <FileEdit size={16} className="text-amber-600" />,
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-100'
        };
      default:
        return {
          icon: <History size={16} className="text-blue-600" />,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-100'
        };
    }
  };

  return (
    <div className="rounded-3xl">
      <div className="space-y-4">
        {logs.length > 0 ? (
          logs.map(log => {
            const config = getActionConfig(log.action);
            return (
              <div key={log.id} className="flex items-start gap-4 p-3 hover:bg-slate-50 rounded-2xl transition group">
                {/* Ikon Box dengan Warna Dinamis */}
                <div className={`shrink-0 p-2.5 rounded-xl border ${config.bgColor} ${config.borderColor} shadow-sm group-hover:scale-110 transition-transform`}>
                  {config.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-700 leading-tight break-words">
                    {log.description}
                  </p>
                  
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <Clock size={10} className="text-slate-400" />
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                      {new Date(log.created_at).toLocaleString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-10 opacity-40">
            <History size={32} className="text-slate-300 mb-2" />
            <p className="text-xs text-slate-400 font-bold italic">Belum ada aktivitas.</p>
          </div>
        )}
      </div>
    </div>
  );
}