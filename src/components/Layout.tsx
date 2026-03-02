import { Link, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  DollarSign, 
  AlertTriangle, 
  Shield, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '../lib/utils';
import { useLogo } from '../hooks/useLogo';
import { useAuth } from '../context/AuthContext';

export function Layout() {
  const { logout } = useAuth();
  const { logo } = useLogo();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Jugadores', href: '/players', icon: Users },
    { name: 'Finanzas', href: '/finances', icon: DollarSign },
    { name: 'Disciplina', href: '/discipline', icon: AlertTriangle },
    { name: 'Alineación', href: '/lineup', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-black text-slate-100 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-950 border-b border-slate-800">
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
          <span className="font-bold text-lg tracking-tight">Deportivo Z</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-slate-400 hover:text-white"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-slate-950 border-r border-slate-800 transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 flex flex-col",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="hidden md:flex items-center gap-3 p-6 border-b border-slate-800">
          <div className="w-12 h-12 relative flex items-center justify-center">
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
          <span className="font-bold text-xl tracking-tight text-white">Deportivo Z</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                  isActive 
                    ? "bg-red-600/10 text-red-500 border border-red-500/20" 
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"
                )}
              >
                <item.icon size={20} className={cn(
                  "transition-colors",
                  isActive ? "text-red-500" : "text-slate-500 group-hover:text-slate-300"
                )} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-400 hover:bg-slate-900 hover:text-red-400 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-black">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
