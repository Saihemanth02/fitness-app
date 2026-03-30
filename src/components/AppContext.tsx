import { useState, createContext, useContext, useCallback } from 'react';

interface ToastItem {
  id: number;
  message: string;
  type: 'success' | 'info' | 'warning';
}

interface AppContextType {
  toasts: ToastItem[];
  showToast: (message: string, type?: 'success' | 'info' | 'warning') => void;
  refreshKey: number;
  triggerRefresh: () => void;
}

const AppContext = createContext<AppContextType>({
  toasts: [], showToast: () => {}, refreshKey: 0, triggerRefresh: () => {}
});

export const useApp = () => useContext(AppContext);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 2800);
  }, []);

  const triggerRefresh = useCallback(() => setRefreshKey(k => k + 1), []);

  return (
    <AppContext.Provider value={{ toasts, showToast, refreshKey, triggerRefresh }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        {toasts.map(t => (
          <div key={t.id} className="toast-animate glass-card px-5 py-3 flex items-center gap-3 shadow-2xl min-w-[280px]">
            <span className="text-lg">{t.type === 'success' ? '✅' : t.type === 'warning' ? '⚠️' : 'ℹ️'}</span>
            <span className="text-sm font-body">{t.message}</span>
          </div>
        ))}
      </div>
    </AppContext.Provider>
  );
}
