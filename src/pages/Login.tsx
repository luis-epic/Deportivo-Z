import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, AlertCircle, User, Upload } from 'lucide-react';
import { useLogo } from '../hooks/useLogo';
import { useAuth } from '../context/AuthContext';

export function Login() {
  const { login } = useAuth();
  const { logo, updateLogo } = useLogo();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('luis.7martinez.10@gmail.com');
  const [password, setPassword] = useState('123456789');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    // Simulate Supabase login/register
    setTimeout(() => {
      setIsLoading(false);
      
      if (isLoginMode) {
        // Login logic
        if (email.trim().toLowerCase() === 'luis.7martinez.10@gmail.com' && password.trim() === '123456789') {
          login();
        } else {
          setError('Credenciales incorrectas. Por favor, verifica tu correo y contraseña.');
        }
      } else {
        // Register logic
        if (email && password && name) {
          // Simulate successful registration and auto-login
          login();
        } else {
          setError('Por favor completa todos los campos para registrarte.');
        }
      }
    }, 1000);
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setError('');
    if (isLoginMode) {
      // Clear fields when switching to register
      setEmail('');
      setPassword('');
    } else {
      // Restore default credentials when switching back to login for demo purposes
      setEmail('luis.7martinez.10@gmail.com');
      setPassword('123456789');
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects based on logo colors: Blue and Red */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-blue-700/20 rounded-full blur-[120px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none translate-x-1/3 translate-y-1/3" />
      
      <div className="w-full max-w-md relative z-10">
        <div className="bg-slate-950/80 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            {/* Logo Container */}
            <div className="relative w-32 h-32 mb-4 flex items-center justify-center group cursor-pointer">
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                id="logo-upload" 
                onChange={(e) => e.target.files?.[0] && updateLogo(e.target.files[0])} 
              />
              <label 
                htmlFor="logo-upload" 
                className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm"
              >
                <Upload className="w-6 h-6 text-white mb-1" />
                <span className="text-xs text-white font-medium">Subir Logo</span>
              </label>
              
              {logo ? (
                <img 
                  src={logo} 
                  alt="Deportivo Z Logo" 
                  className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(220,38,38,0.3)] z-10 relative"
                />
              ) : (
                <div className="absolute inset-0 bg-slate-900 rounded-t-full rounded-b-3xl border-4 border-white flex flex-col items-center justify-center overflow-hidden shadow-[0_0_30px_rgba(220,38,38,0.4)]">
                  <div className="absolute inset-0 bg-gradient-to-b from-blue-700/30 to-red-600/30" />
                  <span className="relative font-black text-xl text-purple-400 tracking-widest mt-2">DEP</span>
                  <span className="relative font-black text-5xl italic text-red-600 drop-shadow-md leading-none">Z</span>
                </div>
              )}
            </div>
            
            <h1 className="text-3xl font-bold text-white tracking-tight">Deportivo Z</h1>
            <p className="text-slate-400 mt-2">
              {isLoginMode ? 'Panel de Administración' : 'Crear nueva cuenta'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-400 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            {!isLoginMode && (
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Nombre Completo</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all"
                    placeholder="Tu nombre"
                    required={!isLoginMode}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Correo Electrónico</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all"
                  placeholder="admin@deportivoz.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Contraseña</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed mt-8 shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_25px_rgba(220,38,38,0.5)]"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isLoginMode ? 'Iniciar Sesión' : 'Registrarse'}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-sm text-slate-400 hover:text-red-400 transition-colors"
            >
              {isLoginMode ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-xs text-slate-500">
              Protegido por Supabase Auth
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
