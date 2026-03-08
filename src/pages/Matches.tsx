import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  Trophy, 
  MapPin, 
  Clock, 
  Plus, 
  ChevronRight, 
  CheckCircle2, 
  XCircle,
  Users,
  BarChart3,
  Save
} from 'lucide-react';
import { useMatches, Match } from '../hooks/useMatches';
import { usePlayers } from '../hooks/usePlayers';
import { Modal } from '../components/ui/Modal';

export function Matches() {
  const { matches, addMatch, completeMatch, deleteMatch } = useMatches();
  const { players, addBulkGameStats } = usePlayers();
  
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  
  const [newMatch, setNewMatch] = useState({
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    opponent: '',
    location: '',
    isHome: true
  });

  const [matchResult, setMatchResult] = useState({
    homeScore: 0,
    awayScore: 0,
    playerStats: [] as { playerId: string; gol: number; asi: number; pas: number; rating: number }[]
  });

  const upcomingMatches = matches.filter(m => m.status === 'upcoming').sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const completedMatches = matches.filter(m => m.status === 'completed').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleAddMatch = (e: React.FormEvent) => {
    e.preventDefault();
    addMatch({
      ...newMatch,
      status: 'upcoming'
    });
    setIsAddModalOpen(false);
    setNewMatch({
      date: new Date().toISOString().split('T')[0],
      time: '10:00',
      opponent: '',
      location: '',
      isHome: true
    });
  };

  const openResultModal = (match: Match) => {
    setSelectedMatch(match);
    setMatchResult({
      homeScore: 0,
      awayScore: 0,
      playerStats: players.map(p => ({
        playerId: p.id,
        gol: 0,
        asi: 0,
        pas: 70,
        rating: 6.0
      }))
    });
    setIsResultModalOpen(true);
  };

  const handleSaveResult = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatch) return;

    // 1. Complete the match
    completeMatch(selectedMatch.id, {
      home: matchResult.homeScore,
      away: matchResult.awayScore
    });

    // 2. Add stats to players
    const bulkStats = matchResult.playerStats.map(stat => ({
      playerId: stat.playerId,
      gameStat: {
        date: selectedMatch.date,
        opponent: selectedMatch.opponent,
        gol: stat.gol,
        asi: stat.asi,
        pas: stat.pas,
        rating: stat.rating
      }
    }));

    addBulkGameStats(bulkStats);
    setIsResultModalOpen(false);
    setSelectedMatch(null);
    setActiveTab('completed');
  };

  const updatePlayerStat = (playerId: string, field: string, value: number) => {
    setMatchResult(prev => ({
      ...prev,
      playerStats: prev.playerStats.map(s => 
        s.playerId === playerId ? { ...s, [field]: value } : s
      )
    }));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Partidos</h1>
          <p className="text-zinc-400 mt-2">Gestiona el calendario y los resultados del equipo</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl font-medium transition-all hover:shadow-[0_0_20px_rgba(220,38,38,0.4)] active:scale-95"
        >
          <Plus size={20} />
          <span>Agendar Partido</span>
        </button>
      </div>

      <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 w-fit">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${
            activeTab === 'upcoming'
              ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Calendar size={18} />
          <span>Próximos</span>
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${
            activeTab === 'completed'
              ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Trophy size={18} />
          <span>Resultados</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: activeTab === 'upcoming' ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: activeTab === 'upcoming' ? 20 : -20 }}
          className="grid grid-cols-1 gap-4"
        >
          {(activeTab === 'upcoming' ? upcomingMatches : completedMatches).map((match) => (
            <div 
              key={match.id}
              className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-red-500/30 transition-all group"
            >
              <div className="flex items-center gap-4 sm:gap-6 w-full md:w-auto">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center text-white flex-shrink-0">
                  <span className="text-[8px] sm:text-xs font-black uppercase text-red-500">{new Date(match.date).toLocaleDateString('es-ES', { month: 'short' })}</span>
                  <span className="text-lg sm:text-2xl font-black">{new Date(match.date).getDate()}</span>
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`text-[8px] sm:text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${match.isHome ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                      {match.isHome ? 'Local' : 'Visitante'}
                    </span>
                    <span className="text-slate-500 text-[10px] sm:text-xs flex items-center gap-1">
                      <Clock size={12} /> {match.time}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white truncate">vs {match.opponent}</h3>
                  <div className="flex items-center gap-3 mt-1 text-slate-400 text-xs sm:text-sm">
                    <span className="flex items-center gap-1 truncate"><MapPin size={14} className="flex-shrink-0" /> {match.location}</span>
                  </div>
                </div>
              </div>

              {match.status === 'completed' ? (
                <div className="flex items-center justify-between md:justify-end gap-4 sm:gap-8 w-full md:w-auto">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="text-center">
                      <div className="text-[8px] sm:text-xs font-black text-slate-500 uppercase mb-1">DZ</div>
                      <div className={`text-2xl sm:text-4xl font-black ${match.score!.home > match.score!.away ? 'text-emerald-500' : 'text-white'}`}>
                        {match.score?.home}
                      </div>
                    </div>
                    <div className="text-xl font-black text-slate-700">-</div>
                    <div className="text-center">
                      <div className="text-[8px] sm:text-xs font-black text-slate-500 uppercase mb-1">Rival</div>
                      <div className={`text-2xl sm:text-4xl font-black ${match.score!.away > match.score!.home ? 'text-red-500' : 'text-white'}`}>
                        {match.score?.away}
                      </div>
                    </div>
                  </div>
                  <div className="hidden sm:block h-12 w-px bg-slate-800" />
                  <div className={`p-2 sm:p-3 rounded-xl ${match.score!.home > match.score!.away ? 'bg-emerald-500/10 text-emerald-500' : match.score!.home < match.score!.away ? 'bg-red-500/10 text-red-500' : 'bg-slate-500/10 text-slate-500'}`}>
                    {match.score!.home > match.score!.away ? <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8" /> : match.score!.home < match.score!.away ? <XCircle className="w-6 h-6 sm:w-8 sm:h-8" /> : <div className="text-lg sm:text-xl font-black">E</div>}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <button 
                    onClick={() => openResultModal(match)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm transition-all active:scale-95"
                  >
                    <Save size={18} />
                    <span>Finalizar</span>
                  </button>
                  <button 
                    onClick={() => deleteMatch(match.id)}
                    className="p-2.5 sm:p-3 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                  >
                    <XCircle size={20} />
                  </button>
                </div>
              )}
            </div>
          ))}

          {(activeTab === 'upcoming' ? upcomingMatches : completedMatches).length === 0 && (
            <div className="text-center py-20 bg-slate-950 border border-dashed border-slate-800 rounded-3xl">
              <Calendar className="mx-auto text-slate-800 mb-4" size={48} />
              <p className="text-slate-400 font-medium">No hay partidos {activeTab === 'upcoming' ? 'programados' : 'registrados'}.</p>
              {activeTab === 'upcoming' && (
                <button 
                  onClick={() => setIsAddModalOpen(true)}
                  className="mt-4 text-red-500 hover:text-red-400 font-bold text-sm uppercase tracking-widest"
                >
                  Agendar el primero ahora
                </button>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Add Match Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Agendar Nuevo Partido"
      >
        <form onSubmit={handleAddMatch} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Fecha</label>
              <input
                type="date"
                required
                value={newMatch.date}
                onChange={(e) => setNewMatch({...newMatch, date: e.target.value})}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Hora</label>
              <input
                type="time"
                required
                value={newMatch.time}
                onChange={(e) => setNewMatch({...newMatch, time: e.target.value})}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Rival</label>
            <input
              type="text"
              required
              placeholder="Nombre del equipo contrario"
              value={newMatch.opponent}
              onChange={(e) => setNewMatch({...newMatch, opponent: e.target.value})}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Lugar / Cancha</label>
            <input
              type="text"
              required
              placeholder="Ej. Cancha Principal, Polideportivo..."
              value={newMatch.location}
              onChange={(e) => setNewMatch({...newMatch, location: e.target.value})}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
            />
          </div>
          <div className="flex items-center gap-4 pt-2">
            <button
              type="button"
              onClick={() => setNewMatch({...newMatch, isHome: true})}
              className={`flex-1 py-3 rounded-xl border font-bold text-xs uppercase tracking-widest transition-all ${newMatch.isHome ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-500'}`}
            >
              Local
            </button>
            <button
              type="button"
              onClick={() => setNewMatch({...newMatch, isHome: false})}
              className={`flex-1 py-3 rounded-xl border font-bold text-xs uppercase tracking-widest transition-all ${!newMatch.isHome ? 'bg-amber-600 border-amber-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-500'}`}
            >
              Visitante
            </button>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-red-600/20"
            >
              Agendar Partido
            </button>
          </div>
        </form>
      </Modal>

      {/* Result & Stats Modal */}
      <Modal
        isOpen={isResultModalOpen}
        onClose={() => setIsResultModalOpen(false)}
        title={`Finalizar: vs ${selectedMatch?.opponent}`}
        maxWidth="max-w-4xl"
      >
        <form onSubmit={handleSaveResult} className="space-y-8">
          {/* Score Section */}
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 text-center">Marcador Final</h4>
            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <div className="text-sm font-bold text-white mb-2">Nosotros</div>
                <input 
                  type="number" 
                  min="0"
                  value={matchResult.homeScore}
                  onChange={(e) => setMatchResult({...matchResult, homeScore: parseInt(e.target.value) || 0})}
                  className="w-20 h-20 bg-slate-950 border-2 border-slate-800 rounded-2xl text-center text-3xl font-black text-white focus:border-red-500 outline-none transition-all"
                />
              </div>
              <div className="text-4xl font-black text-slate-800 mt-6">-</div>
              <div className="text-center">
                <div className="text-sm font-bold text-white mb-2">Rival</div>
                <input 
                  type="number" 
                  min="0"
                  value={matchResult.awayScore}
                  onChange={(e) => setMatchResult({...matchResult, awayScore: parseInt(e.target.value) || 0})}
                  className="w-20 h-20 bg-slate-950 border-2 border-slate-800 rounded-2xl text-center text-3xl font-black text-white focus:border-red-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Player Stats Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Users size={16} />
                Estadísticas Individuales
              </h4>
              <span className="text-[10px] text-slate-600 font-bold uppercase">Todos los jugadores activos</span>
            </div>
            
            <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar space-y-3">
              {players.filter(p => p.status === 'Activo').map((player) => {
                const stat = matchResult.playerStats.find(s => s.playerId === player.id);
                if (!stat) return null;

                return (
                  <div key={player.id} className="bg-slate-900/30 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex items-center gap-3 w-full sm:w-48">
                      <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex-shrink-0">
                        {player.photo ? (
                          <img src={player.photo} alt={player.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold">
                            {player.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-white truncate">{player.name}</div>
                        <div className="text-[10px] text-slate-500 font-black uppercase">{player.position} • #{player.number}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 flex-1 w-full">
                      <div>
                        <label className="block text-[8px] font-black text-slate-600 uppercase mb-1">Goles</label>
                        <input 
                          type="number" 
                          min="0"
                          value={stat.gol}
                          onChange={(e) => updatePlayerStat(player.id, 'gol', parseInt(e.target.value) || 0)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white focus:border-red-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] font-black text-slate-600 uppercase mb-1">Asist.</label>
                        <input 
                          type="number" 
                          min="0"
                          value={stat.asi}
                          onChange={(e) => updatePlayerStat(player.id, 'asi', parseInt(e.target.value) || 0)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white focus:border-red-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] font-black text-slate-600 uppercase mb-1">Pases %</label>
                        <input 
                          type="number" 
                          min="0"
                          max="100"
                          value={stat.pas}
                          onChange={(e) => updatePlayerStat(player.id, 'pas', parseInt(e.target.value) || 0)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white focus:border-red-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] font-black text-slate-600 uppercase mb-1">Nota</label>
                        <input 
                          type="number" 
                          step="0.1"
                          min="1"
                          max="10"
                          value={stat.rating}
                          onChange={(e) => updatePlayerStat(player.id, 'rating', parseFloat(e.target.value) || 0)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white focus:border-red-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsResultModalOpen(false)}
              className="px-6 py-3 rounded-xl text-slate-300 hover:bg-slate-800 transition-colors font-bold text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2"
            >
              <BarChart3 size={18} />
              Guardar Partido y Estadísticas
            </button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
