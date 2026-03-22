import { LayoutDashboard, History, Settings, HelpCircle, Bell, MapPin } from 'lucide-react';
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
      <aside className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 bg-background py-8 gap-4 z-40 border-r border-outline-variant/10">
        <div className="px-8 mb-8">
          <h1 className="text-xl font-black text-primary">Aether</h1>
          <p className="font-label uppercase tracking-[0.05em] text-[0.6875rem] text-on-surface-variant">Global Forecast</p>
        </div>

        <nav className="flex flex-col gap-2">
          {/* Dashboard Tab */}
          <button 
            onClick={() => onPageChange('dashboard')}
            className={twMerge(
              "rounded-full px-4 py-3 mx-2 flex items-center gap-3 transition-colors duration-200",
              currentPage === 'dashboard' 
                ? "bg-surface-container-high text-primary" 
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
            )}
          >
            <LayoutDashboard size={20} />
            <span className="font-label uppercase tracking-[0.05em] text-[0.6875rem]">Dashboard</span>
          </button>
          
          {/* Historical Data Tab */}
          <button 
            onClick={() => onPageChange('historical')}
            className={twMerge(
              "rounded-full px-4 py-3 mx-2 flex items-center gap-3 transition-colors duration-200",
              currentPage === 'historical' 
                ? "bg-surface-container-high text-primary" 
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
            )}
          >
            <History size={20} />
            <span className="font-label uppercase tracking-[0.05em] text-[0.6875rem]">Historical Data</span>
          </button>
        </nav>

        <div className="mt-auto px-4 flex flex-col gap-2">
          
          <button className="text-on-surface-variant px-4 py-3 flex items-center gap-3 hover:text-on-surface hover:bg-surface-container rounded-full transition-colors duration-200">
            <Settings size={20} />
            <span className="font-label uppercase tracking-[0.05em] text-[0.6875rem]">Settings</span>
          </button>
          <button className="text-on-surface-variant px-4 py-3 flex items-center gap-3 hover:text-on-surface hover:bg-surface-container rounded-full transition-colors duration-200">
            <HelpCircle size={20} />
            <span className="font-label uppercase tracking-[0.05em] text-[0.6875rem]">Support</span>
          </button>
        </div>
      </aside>

      {/* Main Content Shell */}
      <main className="md:ml-64 min-h-screen relative flex flex-col pb-24 md:pb-0">
        {/* TopAppBar */}
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl shadow-[0_40px_60px_-15px_rgba(126,81,255,0.1)] border-b border-outline-variant/5">
          <div className="flex items-center justify-between px-4 md:px-8 py-4">
            {/* Automated Location Spacer */}
            <div className="md:hidden flex items-center flex-1">
              <h1 className="text-xl font-black text-primary">Aether</h1>
            </div>
            <div className="hidden md:block flex-1 flex items-center gap-2">
               <span className="material-symbols-outlined text-success text-sm relative top-[1px]">my_location</span>
               <span className="text-[10px] uppercase tracking-widest font-black text-success">GPS Active</span>
            </div>

            {/* Date/Time Display */}
            <div className="hidden lg:flex flex-col items-end mr-8">
              <span className="text-on-surface font-semibold text-sm">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </span>
              <span className="text-on-surface-variant text-xs">
                {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} local time
              </span>
            </div>

            {/* Actions */}
            <div className="flex flex-shrink-0 items-center gap-2 md:gap-4">
              <button className="hidden sm:block p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-all duration-300 active:scale-95">
                <Bell size={20} />
              </button>
              <button className="hidden sm:block p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-all duration-300 active:scale-95">
                <MapPin size={20} />
              </button>
              <div className="w-10 h-10 rounded-full bg-surface-container-high overflow-hidden border border-outline-variant/20 flex items-center justify-center">
                 <div className="w-full h-full bg-gradient-to-tr from-primary to-primary-dim opacity-80" />
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Canvas */}
        <div className="p-4 md:p-8 space-y-8 max-w-[1400px] mx-auto w-full flex-1">
          {children}
        </div>

        {/* Footer Credits */}
        <footer className="mt-auto p-4 md:p-8 border-t border-outline-variant/10 text-center md:text-left">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[0.6875rem] font-medium text-on-surface-variant uppercase tracking-widest">
            <p>© {new Date().getFullYear()} Aether Atmospheric Technologies</p>
            <div className="flex gap-8">
              <button className="hover:text-primary transition-colors">Privacy</button>
              <button className="hover:text-primary transition-colors">Terms</button>
            </div>
          </div>
        </footer>
      </main>

      {/* Mobile Bottom Navigation (Visible ONLY on small screens) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-outline-variant/10 flex items-center justify-around py-4 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <button 
          onClick={() => onPageChange('dashboard')}
          className={`flex flex-col items-center gap-1 transition-colors ${currentPage === 'dashboard' ? 'text-primary' : 'text-on-surface-variant'}`}
        >
          <LayoutDashboard size={20} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Dashboard</span>
        </button>
        <button 
          onClick={() => onPageChange('historical')}
          className={`flex flex-col items-center gap-1 transition-colors ${currentPage === 'historical' ? 'text-primary' : 'text-on-surface-variant'}`}
        >
          <History size={20} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Historical</span>
        </button>
      </nav>
    </div>
  );
};

