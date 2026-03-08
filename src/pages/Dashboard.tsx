import { Users, DollarSign, AlertTriangle, Trophy, ArrowUpRight, ArrowDownRight, Calendar, MapPin, Clock, Sparkles, BrainCircuit, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { usePlayers } from '../hooks/usePlayers';
import { useMatches } from '../hooks/useMatches';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import Markdown from 'react-markdown';

export function Dashboard() {
  const { players } = usePlayers();
  const { matches } = useMatches();
  const [isBriefingLoading, setIsBriefingLoading] = useState(false);
  const [briefing, setBriefing] = useState<string | null>(null);

  const generateBriefing = async () => {
    setIsBriefingLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const teamStats = {
        totalPlayers: players.length,
        activePlayers: players.filter(p => p.status === 'Activo').length,
        totalGoals: players.reduce((acc, p) => acc + p.stats.gol, 0),
        recentMatches: matches.filter(m => m.status === 'completed').slice(0, 3),
        upcomingMatches: matches.filter(m => m.status === 'upcoming').slice(0, 2)
      };

      const prompt = `Eres el Director Deportivo de un club de fútbol profesional. 
      Genera un "Briefing del Entrenador" semanal basado en los siguientes datos del club "Deportivo Z":
      ${JSON.stringify(teamStats)}
      
      El reporte debe ser conciso, motivador y profesional. 
      Incluye:
      1. Resumen de rendimiento reciente.
      2. Foco para los próximos entrenamientos.
      3. Una frase de liderazgo para el equipo.
      
      Formato: Markdown corto con emojis.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ parts: [{ text: prompt }] }],
      });

      setBriefing(response.text || "No se pudo generar el briefing.");
    } catch (error) {
      console.error("Briefing Error:", error);
      setBriefing("Error al conectar con la central de inteligencia.");
    } finally {
      setIsBriefingLoading(false);
    }
  };

  const activePlayers = players.filter(p => p.status === 'Activo').length;
  const totalGoals = players.reduce((acc, p) => acc + p.stats.gol, 0);
  
  const upcomingMatch = matches
    .filter(m => m.status === 'upcoming')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
    
  const lastMatch = matches
    .filter(m => m.status === 'completed')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  const stats = [
    {
      name: 'Jugadores Activos',
      value: activePlayers.toString(),
      change: '+2',
      trend: 'up',
      icon: Users,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      name: 'Ingresos Mensuales',
      value: '$1,250',
      change: '+15%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    {
      name: 'Goles Totales',
      value: totalGoals.toString(),
      change: '+4',
      trend: 'up',
      icon: Trophy,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
    {
      name: 'Partidos Jugados',
      value: matches.filter(m => m.status === 'completed').length.toString(),
      change: '+1',
      trend: 'up',
      icon: Calendar,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
    },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-slate-400 mt-2">Resumen general del Deportivo Z</p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Estado del Club</p>
          <p className="text-emerald-500 font-bold flex items-center gap-2 justify-start sm:justify-end">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Temporada Activa
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            key={stat.name} 
            className="bg-slate-950 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${
                stat.trend === 'up' ? 'text-emerald-500' : 'text-red-500'
              }`}>
                {stat.trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                {stat.change}
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-slate-400 text-sm font-medium">{stat.name}</h3>
              <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* AI Briefing Section */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-indigo-900/20 via-slate-950 to-fuchsia-900/20 border border-indigo-500/20 rounded-3xl p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <BrainCircuit size={120} className="text-indigo-500" />
        </div>
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
                <Sparkles className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Briefing del Entrenador</h2>
                <p className="text-indigo-300/60 text-sm">Inteligencia Artificial aplicada al rendimiento</p>
              </div>
            </div>
            <button
              onClick={generateBriefing}
              disabled={isBriefingLoading}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2 active:scale-95"
            >
              {isBriefingLoading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
              {briefing ? 'Actualizar Briefing' : 'Generar Briefing Semanal'}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {briefing ? (
              <motion.div
                key="briefing-content"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-slate-900/40 border border-slate-800/50 rounded-2xl p-6 backdrop-blur-sm"
              >
                <div className="markdown-body prose prose-invert max-w-none">
                  <Markdown>{briefing}</Markdown>
                </div>
              </motion.div>
            ) : !isBriefingLoading && (
              <div className="text-center py-10 border border-dashed border-slate-800 rounded-2xl">
                <p className="text-slate-500 italic">Haz clic en el botón para generar el análisis estratégico de la semana.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Próximo Partido */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 blur-[100px] -mr-32 -mt-32 group-hover:bg-red-600/10 transition-colors" />
          
          <div className="flex items-center justify-between mb-8 relative z-10">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Calendar className="text-red-500" size={20} />
              Próximo Encuentro
            </h2>
            <Link to="/matches" className="text-sm text-red-400 hover:text-red-300 font-medium">Ver calendario</Link>
          </div>

          {upcomingMatch ? (
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-2 shadow-xl">
                    <span className="text-3xl font-black text-white italic">DZ</span>
                  </div>
                  <span className="text-xs font-bold text-slate-500 uppercase">Deportivo Z</span>
                </div>
                <div className="text-2xl font-black text-slate-800 italic">VS</div>
                <div className="text-center">
                  <div className="w-20 h-20 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-2 shadow-xl">
                    <span className="text-3xl font-black text-slate-400 italic">{upcomingMatch.opponent.charAt(0)}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-500 uppercase">{upcomingMatch.opponent}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3 w-full md:w-auto">
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 flex items-center gap-3">
                  <Clock className="text-red-500" size={18} />
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase">Fecha y Hora</p>
                    <p className="text-sm font-bold text-white">
                      {new Date(upcomingMatch.date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })} • {upcomingMatch.time}
                    </p>
                  </div>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 flex items-center gap-3">
                  <MapPin className="text-red-500" size={18} />
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase">Ubicación</p>
                    <p className="text-sm font-bold text-white">{upcomingMatch.location}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-slate-500 italic">No hay partidos programados próximamente.</div>
          )}
        </motion.div>

        {/* Último Resultado */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col"
        >
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Trophy className="text-amber-500" size={20} />
            Último Resultado
          </h2>
          
          {lastMatch ? (
            <div className="flex-1 flex flex-col justify-center">
              <div className="flex items-center justify-center gap-6 mb-6">
                <div className="text-center">
                  <div className="text-4xl font-black text-white mb-1">{lastMatch.score?.home}</div>
                  <div className="text-[10px] font-black text-slate-500 uppercase">DZ</div>
                </div>
                <div className="text-xl font-black text-slate-800">-</div>
                <div className="text-center">
                  <div className="text-4xl font-black text-white mb-1">{lastMatch.score?.away}</div>
                  <div className="text-[10px] font-black text-slate-500 uppercase">Rival</div>
                </div>
              </div>
              <div className={`text-center py-2 rounded-xl font-black uppercase tracking-widest text-xs ${
                lastMatch.score!.home > lastMatch.score!.away ? 'bg-emerald-500/10 text-emerald-500' : 
                lastMatch.score!.home < lastMatch.score!.away ? 'bg-red-500/10 text-red-500' : 'bg-slate-500/10 text-slate-500'
              }`}>
                {lastMatch.score!.home > lastMatch.score!.away ? 'Victoria' : 
                 lastMatch.score!.home < lastMatch.score!.away ? 'Derrota' : 'Empate'}
              </div>
              <p className="text-center text-xs text-slate-500 mt-4">vs {lastMatch.opponent}</p>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500 italic">No hay resultados registrados.</div>
          )}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximos Pagos */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-slate-950 border border-slate-800 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Próximos Pagos</h2>
            <Link to="/finances" className="text-sm text-red-400 hover:text-red-300 font-medium">Ver todos</Link>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-900/50 border border-slate-800/50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-medium">
                    J{i}
                  </div>
                  <div>
                    <p className="text-white font-medium">Jugador {i}</p>
                    <p className="text-xs text-slate-500">Cuota de Arbitraje</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium">$15.00</p>
                  <p className="text-xs text-amber-500">Pendiente</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Últimas Incidencias */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-slate-950 border border-slate-800 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Últimas Incidencias</h2>
            <Link to="/discipline" className="text-sm text-red-400 hover:text-red-300 font-medium">Ver todas</Link>
          </div>
          <div className="space-y-4">
            {[
              { id: 1, type: 'yellow', player: 'Carlos M.', date: '12 Oct' },
              { id: 2, type: 'red', player: 'Luis G.', date: '05 Oct' },
              { id: 3, type: 'yellow', player: 'Andrés P.', date: '28 Sep' },
            ].map((incident) => (
              <div key={incident.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-900/50 border border-slate-800/50">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-8 rounded-full ${
                    incident.type === 'yellow' ? 'bg-amber-400' : 'bg-red-500'
                  }`} />
                  <div>
                    <p className="text-white font-medium">{incident.player}</p>
                    <p className="text-xs text-slate-500">Falta táctica</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-400">{incident.date}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
