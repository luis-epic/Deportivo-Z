import React, { useState, useMemo } from 'react';
import { Plus, Search, Edit2, Trash2, Upload, User, LayoutGrid, List, Calendar, Trophy, Activity, ChevronRight, BarChart3, AlertTriangle, ShieldCheck, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Modal } from '../components/ui/Modal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { usePlayers, Player } from '../hooks/usePlayers';
import { useDiscipline } from '../hooks/useDiscipline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

export function Players() {
  const { players, addPlayer, updatePlayer, deletePlayer, addGameStat } = usePlayers();
  const { cards } = useDiscipline();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [playerToDelete, setPlayerToDelete] = useState<string | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMetric, setActiveMetric] = useState<'rating' | 'gol' | 'asi' | 'pas'>('rating');
  const [formData, setFormData] = useState({ 
    name: '', 
    position: 'DEL', 
    number: '', 
    status: 'Activo',
    photo: null as string | null 
  });

  const [gameStatForm, setGameStatForm] = useState({
    date: new Date().toISOString().split('T')[0],
    opponent: '',
    gol: 0,
    asi: 0,
    pas: 70,
    rating: 6.0
  });

  const [leaderboardMetric, setLeaderboardMetric] = useState<'gol' | 'asi' | 'rating'>('gol');

  const playerDiscipline = useMemo(() => {
    if (!selectedPlayer) return [];
    return cards.filter(c => c.playerId === selectedPlayer.id);
  }, [selectedPlayer, cards]);

  const chartData = useMemo(() => {
    if (!selectedPlayer || !selectedPlayer.gameHistory) return [];
    
    // Calculate team averages for the same dates or overall
    const teamStatsByDate: Record<string, { rating: number[], gol: number[], asi: number[], pas: number[] }> = {};
    players.forEach(p => {
      p.gameHistory?.forEach(g => {
        const date = new Date(g.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
        if (!teamStatsByDate[date]) {
          teamStatsByDate[date] = { rating: [], gol: [], asi: [], pas: [] };
        }
        teamStatsByDate[date].rating.push(g.rating);
        teamStatsByDate[date].gol.push(g.gol);
        teamStatsByDate[date].asi.push(g.asi);
        teamStatsByDate[date].pas.push(g.pas);
      });
    });

    return [...selectedPlayer.gameHistory]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(game => {
        const date = new Date(game.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
        const teamDayStats = teamStatsByDate[date];
        
        return {
          date,
          rating: game.rating,
          gol: game.gol,
          asi: game.asi,
          pas: game.pas,
          teamAvg: teamDayStats ? (teamDayStats[activeMetric].reduce((a, b) => a + b, 0) / teamDayStats[activeMetric].length) : 0
        };
      });
  }, [selectedPlayer, players, activeMetric]);

  const leaderboardData = players.map(player => {
    const avgRating = player.gameHistory && player.gameHistory.length > 0
      ? player.gameHistory.reduce((acc, game) => acc + game.rating, 0) / player.gameHistory.length
      : 0;
    return {
      ...player,
      avgRating
    };
  }).sort((a, b) => {
    if (leaderboardMetric === 'rating') return b.avgRating - a.avgRating;
    return b.stats[leaderboardMetric] - a.stats[leaderboardMetric];
  }).slice(0, 5);

  const filteredPlayers = players.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.number.toString().includes(searchTerm) ||
    p.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.number) return;
    
    const number = parseInt(formData.number);
    if (isNaN(number) || number < 1 || number > 99) {
      alert('El dorsal debe ser un número entre 1 y 99');
      return;
    }

    const playerData = {
      name: formData.name,
      position: formData.position,
      number: number,
      status: formData.status,
      photo: formData.photo,
      pitchPosition: editingId !== null ? players.find(p => p.id === editingId)?.pitchPosition || null : null,
      tacticalRole: editingId !== null ? players.find(p => p.id === editingId)?.tacticalRole || null : null
    };

    if (editingId !== null) {
      updatePlayer(editingId, playerData);
    } else {
      addPlayer(playerData);
    }
    closeModal();
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photo: reader.result as string });
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: '', position: 'DEL', number: '', status: 'Activo', photo: null });
    setIsModalOpen(true);
  };

  const openEditModal = (player: any) => {
    setEditingId(player.id);
    setFormData({ 
      name: player.name, 
      position: player.position, 
      number: player.number.toString(), 
      status: player.status,
      photo: player.photo
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const openDetailsModal = (player: Player) => {
    setSelectedPlayer(player);
    setIsDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedPlayer(null);
  };

  const confirmDelete = (id: string) => {
    setPlayerToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = () => {
    if (playerToDelete) {
      deletePlayer(playerToDelete);
      setPlayerToDelete(null);
    }
  };

  const handleAddGameStat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayer) return;
    
    const gol = Number(gameStatForm.gol);
    const asi = Number(gameStatForm.asi);
    const pas = Number(gameStatForm.pas);
    const rating = Number(gameStatForm.rating);

    if (isNaN(gol) || gol < 0 || gol > 50) {
      alert('Los goles deben ser un número entre 0 y 50');
      return;
    }
    if (isNaN(asi) || asi < 0 || asi > 50) {
      alert('Las asistencias deben ser un número entre 0 y 50');
      return;
    }
    if (isNaN(pas) || pas < 0 || pas > 100) {
      alert('La efectividad de pases debe ser un número entre 0 y 100');
      return;
    }
    if (isNaN(rating) || rating < 1 || rating > 10) {
      alert('La calificación debe ser un número entre 1 y 10');
      return;
    }
    
    addGameStat(selectedPlayer.id, {
      ...gameStatForm,
      gol,
      asi,
      pas,
      rating
    });

    // Reset form
    setGameStatForm({
      date: new Date().toISOString().split('T')[0],
      opponent: '',
      gol: 0,
      asi: 0,
      pas: 70,
      rating: 6.0
    });

    // Update selected player to show new stats immediately
    const updatedPlayer = players.find(p => p.id === selectedPlayer.id);
    if (updatedPlayer) setSelectedPlayer(updatedPlayer);
  };

  const radarData = useMemo(() => {
    if (!selectedPlayer) return [];
    // Mocking some tactical attributes based on stats for the radar
    const stats = selectedPlayer.stats;
    const avgRating = selectedPlayer.gameHistory?.length 
      ? (selectedPlayer.gameHistory.reduce((acc, g) => acc + g.rating, 0) / selectedPlayer.gameHistory.length) * 10 
      : 60;

    return [
      { subject: 'Ataque', A: Math.min(100, (stats.gol * 15) + 40), fullMark: 100 },
      { subject: 'Visión', A: Math.min(100, (stats.asi * 20) + 30), fullMark: 100 },
      { subject: 'Físico', A: 75, fullMark: 100 },
      { subject: 'Táctica', A: Math.min(100, avgRating), fullMark: 100 },
      { subject: 'Defensa', A: selectedPlayer.position === 'DEF' ? 85 : 45, fullMark: 100 },
      { subject: 'Pases', A: selectedPlayer.gameHistory?.[0]?.pas || 70, fullMark: 100 },
    ];
  }, [selectedPlayer]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Jugadores</h1>
          <p className="text-zinc-400 mt-2">Gestiona la plantilla completa del equipo</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl font-medium transition-all hover:shadow-[0_0_20px_rgba(220,38,38,0.4)] active:scale-95"
        >
          <Plus size={20} />
          <span>Nuevo Jugador</span>
        </button>
      </div>

      {/* Leaderboard Section */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
              <Trophy size={20} />
            </div>
            <h2 className="text-xl font-bold text-white">Tabla de Líderes</h2>
          </div>
          <div className="flex gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            {[
              { id: 'gol', label: 'Goles', icon: Trophy },
              { id: 'asi', label: 'Asistencias', icon: Activity },
              { id: 'rating', label: 'Calificación', icon: BarChart3 }
            ].map((metric) => (
              <button
                key={metric.id}
                onClick={() => setLeaderboardMetric(metric.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  leaderboardMetric === metric.id
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <metric.icon size={14} />
                <span className="hidden sm:inline">{metric.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {leaderboardData.map((player, index) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex flex-col items-center text-center group hover:border-red-500/30 transition-all"
              >
                <div className="absolute -top-2 -left-2 w-8 h-8 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-xs font-black text-white shadow-xl z-10">
                  #{index + 1}
                </div>
                <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-700 overflow-hidden mb-3 group-hover:border-red-500/50 transition-colors">
                  {player.photo ? (
                    <img src={player.photo} alt={player.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500">
                      <User size={24} />
                    </div>
                  )}
                </div>
                <h3 className="font-bold text-white text-sm line-clamp-1">{player.name}</h3>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-tighter mb-2">{player.position} • #{player.number}</p>
                <div className="mt-auto w-full pt-3 border-t border-slate-800/50">
                  <span className="text-xl font-black text-red-500">
                    {leaderboardMetric === 'rating' 
                      ? player.avgRating.toFixed(1) 
                      : player.stats[leaderboardMetric]}
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase ml-1">
                    {leaderboardMetric === 'gol' ? 'Goles' : leaderboardMetric === 'asi' ? 'Asistencias' : 'Promedio'}
                  </span>
                </div>
              </motion.div>
            ))}
            {leaderboardData.length === 0 && (
              <div className="col-span-5 py-12 text-center text-slate-500 italic">
                No hay datos suficientes para mostrar la tabla de líderes.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
          <input 
            type="text"
            placeholder="Buscar por nombre, dorsal o posición..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
          />
        </div>
        
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            <LayoutGrid size={20} />
          </button>
          <button 
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            <List size={20} />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'grid' ? (
          <motion.div 
            key="grid"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6"
          >
            {filteredPlayers.map((player) => {
              const futCardClipPath = "polygon(0 15%, 10% 5%, 30% 8%, 50% 0, 70% 8%, 90% 5%, 100% 15%, 100% 85%, 50% 100%, 0 85%)";
              
              return (
                <motion.div
                  layout
                  key={player.id}
                  className="group relative aspect-[3/4] transition-all duration-300"
                  style={{ clipPath: futCardClipPath }}
                >
                  {/* Card Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-600 via-purple-900 to-slate-950" />
                  
                  {/* Inner Content */}
                  <div className="absolute inset-[1px] sm:inset-[2px] bg-slate-950 overflow-hidden flex flex-col" style={{ clipPath: futCardClipPath }}>
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none">
                      <div className="absolute top-0 left-0 w-full h-full bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(217,70,239,0.1)_10px,rgba(217,70,239,0.1)_11px)]" />
                    </div>

                    {/* Top Info */}
                    <div className="relative z-10 pt-3 sm:pt-6 px-1.5 sm:px-3 flex flex-col items-start">
                      <span className="text-lg sm:text-2xl font-black text-white leading-none italic drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                        {player.number}
                      </span>
                      <span className="text-[7px] sm:text-[10px] font-black text-fuchsia-400 uppercase tracking-tighter">
                        {player.position}
                      </span>
                      <div className="mt-0.5 sm:mt-1 w-3 h-2 sm:w-5 sm:h-3 overflow-hidden rounded-[1px] border border-white/30 bg-black/20">
                        <img 
                          src="https://flagcdn.com/w80/ve.png" 
                          alt="VZ" 
                          className="w-full h-full object-contain" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>

                    {/* Player Photo */}
                    <div className="absolute top-2 sm:top-4 right-1 sm:right-2 w-[75%] h-3/5 flex items-end justify-center">
                      {player.photo ? (
                        <img 
                          src={player.photo} 
                          alt={player.name} 
                          className="w-full h-full object-contain object-bottom drop-shadow-[0_10px_20px_rgba(0,0,0,0.9)] transition-transform duration-500 group-hover:scale-110"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-800">
                          <User className="w-10 h-10 sm:w-16 sm:h-16" strokeWidth={1} />
                        </div>
                      )}
                    </div>

                    {/* Quick Actions Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 sm:gap-4 z-20">
                      <button 
                        onClick={() => openDetailsModal(player)}
                        className="p-2 sm:p-3 bg-white text-slate-950 hover:bg-fuchsia-100 rounded-lg sm:rounded-xl shadow-lg transition-all hover:scale-110"
                        title="Ver Detalles"
                      >
                        <BarChart3 size={16} className="sm:w-5 sm:h-5" />
                      </button>
                      <button 
                        onClick={() => openEditModal(player)}
                        className="p-2 sm:p-3 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-lg sm:rounded-xl shadow-lg transition-all hover:scale-110"
                        title="Editar"
                      >
                        <Edit2 size={16} className="sm:w-5 sm:h-5" />
                      </button>
                      <button 
                        onClick={() => confirmDelete(player.id)}
                        className="p-2 sm:p-3 bg-slate-800 hover:bg-red-600 text-white rounded-lg sm:rounded-xl shadow-lg transition-all hover:scale-110"
                        title="Eliminar"
                      >
                        <Trash2 size={16} className="sm:w-5 sm:h-5" />
                      </button>
                    </div>

                    {/* Name Plate */}
                    <div className="relative z-10 mt-auto mb-8 sm:mb-14 bg-black/40 backdrop-blur-sm border-y border-fuchsia-500/30 py-0.5 sm:py-1">
                      <h3 className="text-[8px] sm:text-[11px] font-bold text-white uppercase tracking-tight text-center line-clamp-1 px-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                        {player.name}
                      </h3>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className={`absolute top-2 right-2 sm:top-3 sm:right-3 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full z-30 ${
                    player.status === 'Activo' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                  }`} />
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div 
            key="table"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/50 border-b border-slate-800">
                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Jugador</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Posición</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Dorsal</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredPlayers.map((player) => (
                    <tr key={player.id} className="hover:bg-slate-900/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {player.photo ? (
                            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 overflow-hidden">
                              <img src={player.photo} alt={player.name} className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-medium border border-slate-700">
                              {player.name.charAt(0)}
                            </div>
                          )}
                          <span className="font-medium text-white group-hover:text-red-400 transition-colors">{player.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-300">{player.position}</td>
                      <td className="px-6 py-4 text-slate-300">#{player.number}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          player.status === 'Activo' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {player.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => openDetailsModal(player)}
                            className="p-2 text-slate-400 hover:text-fuchsia-400 hover:bg-fuchsia-400/10 rounded-lg transition-colors"
                            title="Estadísticas"
                          >
                            <BarChart3 size={18} />
                          </button>
                          <button 
                            onClick={() => openEditModal(player)}
                            className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => confirmDelete(player.id)}
                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingId !== null ? "Editar Jugador" : "Añadir Nuevo Jugador"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-center mb-6">
            <div className="relative w-24 h-24 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center overflow-hidden group">
              {formData.photo ? (
                <img src={formData.photo} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <User size={32} className="text-slate-500" />
              )}
              <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                <Upload size={20} className="text-white mb-1" />
                <span className="text-[10px] text-white">Subir Foto</span>
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Nombre Completo</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
              placeholder="Ej. Lionel Messi"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Posición</label>
              <select
                value={formData.position}
                onChange={(e) => setFormData({...formData, position: e.target.value})}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
              >
                <option value="POR">Portero</option>
                <option value="DEF">Defensa</option>
                <option value="MED">Medio</option>
                <option value="DEL">Delantero</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Dorsal</label>
              <input
                type="number"
                required
                min="1"
                max="99"
                value={formData.number}
                onChange={(e) => setFormData({...formData, number: e.target.value})}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
                placeholder="Ej. 10"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Estado</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
            >
              <option value="Activo">Activo</option>
              <option value="Lesionado">Lesionado</option>
              <option value="Suspendido">Suspendido</option>
            </select>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 rounded-xl text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors shadow-[0_0_15px_rgba(220,38,38,0.3)]"
            >
              {editingId !== null ? "Guardar Cambios" : "Guardar Jugador"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Player Details & Stats Modal */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={closeDetailsModal}
        title={`Detalles de ${selectedPlayer?.name}`}
        maxWidth="max-w-4xl"
      >
        {selectedPlayer && (
          <div className="space-y-8 max-h-[85vh] overflow-y-auto pr-2 custom-scrollbar">
            {/* Player Header Info */}
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-center bg-slate-900/40 p-6 rounded-3xl border border-slate-800">
              <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-fuchsia-500/50 overflow-hidden shadow-[0_0_20px_rgba(217,70,239,0.2)] flex-shrink-0">
                {selectedPlayer.photo ? (
                  <img src={selectedPlayer.photo} alt={selectedPlayer.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-500">
                    <User size={40} />
                  </div>
                )}
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row items-center gap-3">
                  <h3 className="text-2xl font-black text-white">{selectedPlayer.name}</h3>
                  <span className="px-3 py-1 bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20 rounded-full text-xs font-black uppercase tracking-widest">
                    #{selectedPlayer.number}
                  </span>
                </div>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2">
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Activity size={16} className="text-slate-500" />
                    <span>{selectedPlayer.position}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <ShieldCheck size={16} className={selectedPlayer.status === 'Activo' ? 'text-emerald-500' : 'text-amber-500'} />
                    <span>{selectedPlayer.status}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Trophy size={16} className="text-amber-500" />
                    <span>{selectedPlayer.gameHistory?.length || 0} Partidos</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                <div className="flex-1 md:w-20 lg:w-24 bg-slate-950/50 border border-slate-800 p-2 sm:p-3 rounded-2xl text-center">
                  <div className="text-lg sm:text-xl font-black text-white">{selectedPlayer.stats.gol}</div>
                  <div className="text-[8px] sm:text-[10px] text-slate-500 font-black uppercase tracking-tighter">Goles</div>
                </div>
                <div className="flex-1 md:w-20 lg:w-24 bg-slate-950/50 border border-slate-800 p-2 sm:p-3 rounded-2xl text-center">
                  <div className="text-lg sm:text-xl font-black text-white">{selectedPlayer.stats.asi}</div>
                  <div className="text-[8px] sm:text-[10px] text-slate-500 font-black uppercase tracking-tighter">Asist.</div>
                </div>
                <div className="flex-1 md:w-20 lg:w-24 bg-slate-950/50 border border-slate-800 p-2 sm:p-3 rounded-2xl text-center">
                  <div className="text-lg sm:text-xl font-black text-white">{(selectedPlayer.gameHistory?.reduce((acc, g) => acc + g.rating, 0) / (selectedPlayer.gameHistory?.length || 1)).toFixed(1)}</div>
                  <div className="text-[8px] sm:text-[10px] text-slate-500 font-black uppercase tracking-tighter">Rating</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Charts & Discipline */}
              <div className="lg:col-span-2 space-y-8">
                {/* Performance & Radar Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Performance Chart */}
                  <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                      <h4 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-wider">
                        <TrendingUp size={18} className="text-fuchsia-500" />
                        Progresión
                      </h4>
                      <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                        {(['rating', 'gol', 'asi', 'pas'] as const).map((m) => (
                          <button
                            key={m}
                            onClick={() => setActiveMetric(m)}
                            className={`px-2 py-1 text-[10px] font-black uppercase tracking-tighter rounded-lg transition-all ${
                              activeMetric === m 
                                ? 'bg-fuchsia-600 text-white shadow-lg shadow-fuchsia-600/20' 
                                : 'text-slate-500 hover:text-slate-300'
                            }`}
                          >
                            {m === 'rating' ? 'RTG' : m === 'gol' ? 'GOL' : m === 'asi' ? 'ASI' : 'PAS'}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="h-64 w-full">
                      {chartData.length > 1 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData}>
                            <defs>
                              <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={activeMetric === 'rating' ? '#d946ef' : activeMetric === 'gol' ? '#22c55e' : activeMetric === 'asi' ? '#3b82f6' : '#f59e0b'} stopOpacity={0.3}/>
                                <stop offset="95%" stopColor={activeMetric === 'rating' ? '#d946ef' : activeMetric === 'gol' ? '#22c55e' : activeMetric === 'asi' ? '#3b82f6' : '#f59e0b'} stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            <XAxis 
                              dataKey="date" 
                              stroke="#64748b" 
                              fontSize={10} 
                              tickLine={false}
                              axisLine={false}
                            />
                            <YAxis 
                              stroke="#64748b" 
                              fontSize={10} 
                              tickLine={false} 
                              axisLine={false} 
                              domain={activeMetric === 'pas' ? [0, 100] : activeMetric === 'rating' ? [0, 10] : ([0, 'auto'] as any)}
                            />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '12px' }}
                              itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                              labelStyle={{ color: '#64748b', fontSize: '10px', marginBottom: '4px' }}
                            />
                            <Area 
                              type="monotone" 
                              dataKey={activeMetric} 
                              stroke={activeMetric === 'rating' ? '#d946ef' : activeMetric === 'gol' ? '#22c55e' : activeMetric === 'asi' ? '#3b82f6' : '#f59e0b'} 
                              strokeWidth={3}
                              fillOpacity={1} 
                              fill="url(#colorMetric)" 
                              animationDuration={1000}
                              name="Jugador"
                            />
                            <Line 
                              type="monotone" 
                              dataKey="teamAvg" 
                              stroke="#64748b" 
                              strokeDasharray="5 5" 
                              dot={false}
                              strokeWidth={1}
                              name="Promedio Equipo"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-600 border border-dashed border-slate-800 rounded-2xl">
                          <BarChart3 size={32} className="mb-2 opacity-20" />
                          <p className="text-xs">Se necesitan al menos 2 partidos.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Radar Chart */}
                  <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6">
                    <h4 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-wider mb-6">
                      <Activity size={18} className="text-indigo-500" />
                      Perfil Técnico
                    </h4>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                          <PolarGrid stroke="#1e293b" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                          <Radar
                            name={selectedPlayer.name}
                            dataKey="A"
                            stroke="#6366f1"
                            fill="#6366f1"
                            fillOpacity={0.5}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Disciplinary Record */}
                <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6">
                  <h4 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-wider mb-6">
                    <AlertTriangle size={18} className="text-amber-500" />
                    Historial Disciplinario
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {playerDiscipline.length > 0 ? (
                      playerDiscipline.map((card) => (
                        <div key={card.id} className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl flex items-center gap-4">
                          <div className={`w-6 h-9 rounded shadow-lg flex-shrink-0 ${
                            card.type === 'yellow' ? 'bg-amber-400' : 'bg-red-500'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-white truncate">{card.reason}</p>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-tighter">{card.match} • {card.league}</p>
                          </div>
                          <div className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                            card.isPaid ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                          }`}>
                            {card.isPaid ? 'Pagado' : 'Pendiente'}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 py-8 text-center bg-slate-900/20 rounded-2xl border border-dashed border-slate-800">
                        <ShieldCheck className="mx-auto text-emerald-500/30 mb-2" size={32} />
                        <p className="text-xs text-slate-500">Jugador con conducta ejemplar. Sin tarjetas.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Add Stats & History */}
              <div className="space-y-8">
                {/* Add Game Stats Form */}
                <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/5 blur-[50px] -mr-16 -mt-16 group-hover:bg-fuchsia-500/10 transition-colors" />
                  
                  <h4 className="text-sm font-black text-white mb-5 flex items-center gap-2 uppercase tracking-wider">
                    <Plus size={18} className="text-fuchsia-500" />
                    Registrar Partido
                  </h4>
                  <form onSubmit={handleAddGameStat} className="space-y-4 relative z-10">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5 tracking-tighter">Equipo Rival</label>
                        <input 
                          type="text" 
                          required
                          placeholder="Nombre del rival..."
                          value={gameStatForm.opponent}
                          onChange={(e) => setGameStatForm({...gameStatForm, opponent: e.target.value})}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-fuchsia-500 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5 tracking-tighter">Goles</label>
                        <input 
                          type="number" 
                          min="0"
                          value={gameStatForm.gol}
                          onChange={(e) => setGameStatForm({...gameStatForm, gol: parseInt(e.target.value) || 0})}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-fuchsia-500 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5 tracking-tighter">Asistencias</label>
                        <input 
                          type="number" 
                          min="0"
                          value={gameStatForm.asi}
                          onChange={(e) => setGameStatForm({...gameStatForm, asi: parseInt(e.target.value) || 0})}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-fuchsia-500 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5 tracking-tighter">Rating</label>
                        <input 
                          type="number" 
                          step="0.1"
                          min="1"
                          max="10"
                          value={gameStatForm.rating}
                          onChange={(e) => setGameStatForm({...gameStatForm, rating: parseFloat(e.target.value) || 0})}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-fuchsia-500 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5 tracking-tighter">Pases %</label>
                        <input 
                          type="number" 
                          min="0"
                          max="100"
                          value={gameStatForm.pas}
                          onChange={(e) => setGameStatForm({...gameStatForm, pas: parseInt(e.target.value) || 0})}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-fuchsia-500 transition-all"
                        />
                      </div>
                    </div>
                    <button 
                      type="submit"
                      className="w-full py-3 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-fuchsia-600/20"
                    >
                      Guardar Estadísticas
                    </button>
                  </form>
                </div>

                {/* History List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-wider">
                      <Calendar size={18} className="text-slate-500" />
                      Historial Completo
                    </h4>
                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                      {selectedPlayer.gameHistory?.length || 0} Partidos
                    </span>
                  </div>
                  <div className="space-y-3">
                    {selectedPlayer.gameHistory && selectedPlayer.gameHistory.length > 0 ? (
                      [...selectedPlayer.gameHistory]
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((game) => (
                        <div key={game.id} className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-fuchsia-500/30 transition-all">
                          <div className="flex items-center gap-4">
                            <div className="flex flex-col items-center justify-center w-12 h-12 bg-slate-950 rounded-xl border border-slate-800 flex-shrink-0">
                              <span className="text-xs font-black text-white leading-none">
                                {new Date(game.date).toLocaleDateString('es-ES', { day: '2-digit' })}
                              </span>
                              <span className="text-[8px] text-slate-500 font-black uppercase tracking-tighter mt-1">
                                {new Date(game.date).toLocaleDateString('es-ES', { month: 'short' })}
                              </span>
                            </div>
                            <div>
                              <p className="text-xs font-black text-white group-hover:text-fuchsia-400 transition-colors">vs {game.opponent}</p>
                              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                                {new Date(game.date).getFullYear()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6">
                            <div className="flex gap-4">
                              <div className="flex flex-col items-center">
                                <span className="text-xs font-black text-white">{game.gol}</span>
                                <span className="text-[8px] text-slate-600 uppercase font-black tracking-tighter">GOL</span>
                              </div>
                              <div className="flex flex-col items-center">
                                <span className="text-xs font-black text-white">{game.asi}</span>
                                <span className="text-[8px] text-slate-600 uppercase font-black tracking-tighter">ASI</span>
                              </div>
                              <div className="flex flex-col items-center">
                                <span className="text-xs font-black text-white">{game.pas}%</span>
                                <span className="text-[8px] text-slate-600 uppercase font-black tracking-tighter">PAS</span>
                              </div>
                            </div>
                            
                            <div className="bg-fuchsia-500/10 border border-fuchsia-500/30 px-3 py-1.5 rounded-xl flex flex-col items-center min-w-[48px]">
                              <span className="text-xs font-black text-fuchsia-400">{game.rating.toFixed(1)}</span>
                              <span className="text-[7px] text-fuchsia-500/60 uppercase font-black tracking-tighter">RATING</span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 bg-slate-900/20 rounded-2xl border border-dashed border-slate-800">
                        <Calendar className="mx-auto text-slate-700 mb-2" size={32} />
                        <p className="text-[10px] text-slate-600 uppercase font-black tracking-widest">Sin historial de partidos registrado.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="¿Eliminar Jugador?"
        message="Esta acción no se puede deshacer. Se eliminarán permanentemente todos los datos y estadísticas asociados a este jugador."
        confirmText="Eliminar Jugador"
      />
    </motion.div>
  );
}
