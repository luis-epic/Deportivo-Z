import { Link, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  DollarSign, 
  AlertTriangle, 
  Shield, 
  LogOut,
  Menu,
  X,
  Calendar,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import { useLogo } from '../hooks/useLogo';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

export function Layout() {
  const { logout } = useAuth();
  const { logo } = useLogo();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Jugadores', href: '/players', icon: Users },
    { name: 'Partidos', href: '/matches', icon: Calendar },
    { name: 'Finanzas', href: '/finances', icon: DollarSign },
    { name: 'Disciplina', href: '/discipline', icon: AlertTriangle },
    { name: 'Alineación', href: '/lineup', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-black text-slate-100 flex overflow-hidden">
      {/* Sidebar Overlay (Mobile) */}
      <AnimatePresence>
        {isMobile && isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ 
          width: isSidebarOpen ? (isMobile ? '100%' : '256px') : '0px',
          x: isSidebarOpen ? 0 : -256,
          opacity: isSidebarOpen ? 1 : 0
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={cn(
          "fixed md:relative z-50 h-full bg-slate-950 border-r border-slate-800 flex flex-col overflow-hidden",
          isMobile ? "max-w-[280px]" : ""
        )}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 relative flex items-center justify-center">
              {logo ? (
                <img 
                  src={logo} 
                  alt="DZ" 
                  className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(220,38,38,0.5)]"
                />
              ) : (
                <div className="absolute inset-0 bg-slate-900 rounded-full border-2 border-white flex items-center justify-center overflow-hidden shadow-[0_0_10px_rgba(220,38,38,0.4)]">
                  <span className="font-black text-xl italic text-red-600">Z</span>
                </div>
              )}
            </div>
            <span className="font-bold text-lg tracking-tight text-white whitespace-nowrap">Deportivo Z</span>
          </div>
          {isMobile && (
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => isMobile && setIsSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group whitespace-nowrap",
                  isActive 
                    ? "bg-red-600/10 text-red-500 border border-red-500/20" 
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"
                )}
              >
                <item.icon size={20} className={cn(
                  "transition-colors shrink-0",
                  isActive ? "text-red-500" : "text-slate-500 group-hover:text-slate-300"
                )} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 shrink-0">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-400 hover:bg-slate-900 hover:text-red-400 transition-colors whitespace-nowrap"
          >
            <LogOut size={20} className="shrink-0" />
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-black overflow-hidden">
        {/* Top Header (Hamburger) */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 bg-slate-950/50 backdrop-blur-md border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              title={isSidebarOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {isSidebarOpen ? (
                isMobile ? <Menu size={24} /> : <PanelLeftClose size={24} />
              ) : (
                isMobile ? <Menu size={24} /> : <PanelLeftOpen size={24} />
              )}
            </button>
            
            {(!isSidebarOpen || isMobile) && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 relative flex items-center justify-center">
                  {logo ? (
                    <img 
                      src={logo} 
                      alt="DZ" 
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-slate-900 rounded-full border border-white flex items-center justify-center overflow-hidden">
                      <span className="font-black text-xs italic text-red-600">Z</span>
                    </div>
                  )}
                </div>
                <span className="font-bold text-base tracking-tight hidden sm:block">Deportivo Z</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Add any top-right actions here if needed */}
          </div>
        </header>

        {/* Main Content Scroll Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
