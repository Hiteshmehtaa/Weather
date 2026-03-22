import { twMerge } from 'tailwind-merge';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: 'dashboard' | 'historical';
  onPageChange: (page: 'dashboard' | 'historical') => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentPage, onPageChange }) => {
  return (
    <div className="min-h-screen bg-background text-on-background selection:bg-primary-dim selection:text-white font-headline relative">
      {/* SideNavBar (Desktop) */}
      <aside className="fixed left-0 h-full w-64 z-40 flex-col pt-8 pb-8 px-4 bg-surface-container-low border-r border-outline-variant/10 hidden md:flex">
        <nav className="flex-1 space-y-2">
          <button 
            onClick={() => onPageChange('dashboard')}
            className={twMerge(
              "w-full flex items-center gap-4 px-4 py-3 transition-transform active:translate-x-1 outline-none",
              currentPage === 'dashboard'
                ? "text-primary border-r-2 border-primary bg-gradient-to-r from-primary/10 to-transparent"
                : "text-outline-variant hover:text-primary/70 hover:bg-surface-variant rounded-lg"
            )}
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-label text-[11px] uppercase tracking-[0.15em]">Dashboard</span>
          </button>
          
          <button 
            onClick={() => onPageChange('historical')}
            className={twMerge(
              "w-full flex items-center gap-4 px-4 py-3 transition-transform active:translate-x-1 outline-none",
              currentPage === 'historical'
                ? "text-primary border-r-2 border-primary bg-gradient-to-r from-primary/10 to-transparent"
                : "text-outline-variant hover:text-primary/70 hover:bg-surface-variant rounded-lg"
            )}
          >
            <span className="material-symbols-outlined">history</span>
            <span className="font-label text-[11px] uppercase tracking-[0.15em]">History</span>
          </button>
        </nav>
      </aside>

      {/* Main Content Shell */}
      <main className="md:ml-64 min-h-screen relative flex flex-col pt-8 pb-24 md:pb-0 z-0">
        {/* Dashboard Canvas */}
        <div className="p-4 md:p-8 space-y-8 max-w-[1400px] mx-auto w-full flex-1">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation (Visible ONLY on small screens) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-md border-t border-outline-variant/10 flex items-center justify-around py-4 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <button 
          onClick={() => onPageChange('dashboard')}
          className={`flex flex-col items-center gap-1 transition-colors active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-xl px-3 py-1 ${currentPage === 'dashboard' ? 'text-primary' : 'text-on-surface-variant'}`}
        >
          <span className="material-symbols-outlined">dashboard</span>
          <span className="text-[10px] font-bold uppercase tracking-widest">Dashboard</span>
        </button>
        <button 
          onClick={() => onPageChange('historical')}
          className={`flex flex-col items-center gap-1 transition-colors active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-xl px-3 py-1 ${currentPage === 'historical' ? 'text-primary' : 'text-on-surface-variant'}`}
        >
          <span className="material-symbols-outlined">history</span>
          <span className="text-[10px] font-bold uppercase tracking-widest">Historical</span>
        </button>
      </nav>
    </div>
  );
};
