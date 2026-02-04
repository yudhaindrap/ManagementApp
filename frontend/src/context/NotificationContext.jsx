import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, X, HelpCircle } from 'lucide-react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notif, setNotif] = useState(null);
  const [confirmData, setConfirmData] = useState(null);

  // 🔹 Fungsi untuk Toast Notification (Sukses/Error)
  const notify = useCallback((message, type = 'success') => {
    setNotif({ message, type });
    // Notifikasi hilang otomatis setelah 3 detik
    setTimeout(() => setNotif(null), 3000);
  }, []);

  // 🔹 Fungsi untuk Custom Confirm Dialog (Ganti window.confirm)
  const askConfirm = useCallback((message, onConfirm) => {
    setConfirmData({ message, onConfirm });
  }, []);

  const closeConfirm = () => setConfirmData(null);

  const handleConfirmAction = () => {
    if (confirmData?.onConfirm) {
      confirmData.onConfirm();
    }
    closeConfirm();
  };

  return (
    <NotificationContext.Provider value={{ notify, askConfirm }}>
      {children}
      
      {/* --- 1. TOAST NOTIFICATION --- */}
      <AnimatePresence>
        {notif && (
          <motion.div
            initial={{ y: 100, x: '-50%', opacity: 0 }}
            animate={{ y: 0, x: '-50%', opacity: 1 }}
            exit={{ y: 100, x: '-50%', opacity: 0 }}
            className="fixed bottom-10 left-1/2 z-[9999] min-w-[320px]"
          >
            <div className="bg-slate-900 border border-slate-800 shadow-2xl rounded-[2rem] p-2 pr-6 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                notif.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
              }`}>
                {notif.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
              </div>

              <div className="flex-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 leading-none mb-1">
                  System Status
                </p>
                <p className="text-xs font-bold text-white uppercase tracking-tight">
                  {notif.message}
                </p>
              </div>

              <button onClick={() => setNotif(null)} className="text-slate-600 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- 2. CUSTOM CONFIRM DIALOG --- */}
      <AnimatePresence>
        {confirmData && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            {/* Backdrop dengan Blur */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeConfirm}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            
            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-slate-100 text-center"
            >
              <div className="w-16 h-16 bg-slate-50 text-slate-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <HelpCircle size={32} />
              </div>
              
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">
                Konfirmasi Aksi
              </h4>
              <p className="text-lg font-bold text-slate-800 leading-tight mb-8">
                {confirmData.message}
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={closeConfirm}
                  className="py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest text-slate-400 hover:bg-slate-50 transition-all"
                >
                  Batal
                </button>
                <button 
                  onClick={handleConfirmAction}
                  className="py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest bg-red-500 text-white shadow-lg shadow-red-200 hover:bg-red-600 active:scale-95 transition-all"
                >
                  Ya, Hapus
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </NotificationContext.Provider>
  );
};

export const useNotify = () => useContext(NotificationContext);