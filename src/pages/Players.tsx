import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Upload, User, LayoutGrid, List, Calendar, Trophy, Activity, ChevronRight, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Modal } from '../components/ui/Modal';
import { usePlayers, Player } from '../hooks/usePlayers';

export function Players() {
  const { players, addPlayer, updatePlayer, deletePlayer, addGameStat } = usePlayers();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
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

  const filteredPlayers = players.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.number.toString().includes(searchTerm) ||
    p.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.number) return;
    
    const playerData = {
      name: formData.name,
      position: formData.position,
      number: parseInt(formData.number),
      status: formData.status,
      photo: formData.photo
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

  const handleAddGameStat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayer) return;
    
    addGameStat(selectedPlayer.id, {
      ...gameStatForm,
      gol: Number(gameStatForm.gol),
      asi: Number(gameStatForm.asi),
      pas: Number(gameStatForm.pas),
      rating: Number(gameStatForm.rating)
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
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
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
                  <div className="absolute inset-[2px] bg-slate-950 overflow-hidden flex flex-col" style={{ clipPath: futCardClipPath }}>
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none">
                      <div className="absolute top-0 left-0 w-full h-full bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(217,70,239,0.1)_10px,rgba(217,70,239,0.1)_11px)]" />
                    </div>

                    {/* Top Info */}
                    <div className="relative z-10 pt-6 px-3 flex flex-col items-start">
                      <span className="text-2xl font-black text-white leading-none italic drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                        {player.number}
                      </span>
                      <span className="text-[10px] font-black text-fuchsia-400 uppercase tracking-tighter">
                        {player.position}
                      </span>
                      <div className="mt-1 w-5 h-3 overflow-hidden rounded-[1px] border border-white/30 bg-black/20">
                        <img 
                          src="https://flagcdn.com/w80/ve.png" 
                          alt="VZ" 
                          className="w-full h-full object-contain" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>

                    {/* Player Photo */}
                    <div className="absolute top-4 right-2 w-[70%] h-3/5 flex items-end justify-center">
                      {player.photo ? (
                        <img 
                          src={player.photo} 
                          alt={player.name} 
                          className="w-full h-full object-contain object-bottom drop-shadow-[0_10px_20px_rgba(0,0,0,0.9)] transition-transform duration-500 group-hover:scale-110"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-800">
                          <User size={64} strokeWidth={1} />
                        </div>
                      )}
                    </div>

                    {/* Quick Actions Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 z-20">
                      <button 
                        onClick={() => openDetailsModal(player)}
                        className="p-3 bg-white text-slate-950 hover:bg-fuchsia-100 rounded-xl shadow-lg transition-all hover:scale-110"
                        title="Ver Detalles"
                      >
                        <BarChart3 size={20} />
                      </button>
                      <button 
                        onClick={() => openEditModal(player)}
                        className="p-3 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-xl shadow-lg transition-all hover:scale-110"
                        title="Editar"
                      >
                        <Edit2 size={20} />
                      </button>
                      <button 
                        onClick={() => deletePlayer(player.id)}
                        className="p-3 bg-slate-800 hover:bg-red-600 text-white rounded-xl shadow-lg transition-all hover:scale-110"
                        title="Eliminar"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>

                    {/* Name Plate */}
                    <div className="relative z-10 mt-auto mb-14 bg-black/40 backdrop-blur-sm border-y border-fuchsia-500/30 py-1">
                      <h3 className="text-[11px] font-bold text-white uppercase tracking-tight text-center line-clamp-1 px-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                        {player.name}
                      </h3>
                    </div>

                    {/* Action Button Section */}
                    <div className="relative z-10 px-4 py-3 mb-4 bg-black/70 backdrop-blur-sm border-t border-fuchsia-500/30">
                      <button 
                        onClick={() => openDetailsModal(player)}
                        className="w-full py-2 bg-fuchsia-600/20 hover:bg-fuchsia-600/40 border border-fuchsia-500/30 rounded-lg text-[10px] font-black text-white uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2"
                      >
                        <BarChart3 size={12} />
                        Ver Estadísticas
                      </button>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className={`absolute top-3 right-3 w-2 h-2 rounded-full z-30 ${
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
                            onClick={() => deletePlayer(player.id)}
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
        title={`Estadísticas de ${selectedPlayer?.name}`}
      >
        {selectedPlayer && (
          <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-4 rounded-2xl border border-slate-800 text-center shadow-xl">
                <Trophy className="mx-auto text-amber-500 mb-2" size={20} />
                <div className="text-2xl font-black text-white leading-none">{selectedPlayer.stats.gol}</div>
                <div className="text-[10px] text-slate-500 uppercase font-black mt-1 tracking-widest">Goles</div>
              </div>
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-4 rounded-2xl border border-slate-800 text-center shadow-xl">
                <Activity className="mx-auto text-fuchsia-500 mb-2" size={20} />
                <div className="text-2xl font-black text-white leading-none">{selectedPlayer.stats.asi}</div>
                <div className="text-[10px] text-slate-500 uppercase font-black mt-1 tracking-widest">Asistencias</div>
              </div>
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-4 rounded-2xl border border-slate-800 text-center shadow-xl">
                <BarChart3 className="mx-auto text-blue-500 mb-2" size={20} />
                <div className="text-2xl font-black text-white leading-none">{selectedPlayer.stats.pas}%</div>
                <div className="text-[10px] text-slate-500 uppercase font-black mt-1 tracking-widest">Pases</div>
              </div>
            </div>

            {/* Add Game Stats Form */}
            <div className="bg-slate-900/40 p-5 rounded-3xl border border-fuchsia-500/20 backdrop-blur-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/5 blur-[50px] -mr-16 -mt-16 group-hover:bg-fuchsia-500/10 transition-colors" />
              
              <h4 className="text-sm font-black text-white mb-5 flex items-center gap-2 uppercase tracking-wider">
                <Plus size={18} className="text-fuchsia-500" />
                Registrar Nuevo Partido
              </h4>
              <form onSubmit={handleAddGameStat} className="grid grid-cols-2 gap-5 relative z-10">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5 tracking-tighter">Fecha del Encuentro</label>
                  <input 
                    type="date" 
                    value={gameStatForm.date}
                    onChange={(e) => setGameStatForm({...gameStatForm, date: e.target.value})}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500/30 transition-all"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5 tracking-tighter">Equipo Rival</label>
                  <input 
                    type="text" 
                    placeholder="Nombre del rival..."
                    value={gameStatForm.opponent}
                    onChange={(e) => setGameStatForm({...gameStatForm, opponent: e.target.value})}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500/30 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5 tracking-tighter">Goles</label>
                  <input 
                    type="number" 
                    min="0"
                    value={gameStatForm.gol}
                    onChange={(e) => setGameStatForm({...gameStatForm, gol: parseInt(e.target.value) || 0})}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-fuchsia-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5 tracking-tighter">Asistencias</label>
                  <input 
                    type="number" 
                    min="0"
                    value={gameStatForm.asi}
                    onChange={(e) => setGameStatForm({...gameStatForm, asi: parseInt(e.target.value) || 0})}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-fuchsia-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5 tracking-tighter">Efectividad Pases (%)</label>
                  <input 
                    type="number" 
                    min="0"
                    max="100"
                    value={gameStatForm.pas}
                    onChange={(e) => setGameStatForm({...gameStatForm, pas: parseInt(e.target.value) || 0})}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-fuchsia-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5 tracking-tighter">Calificación (1-10)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    min="1"
                    max="10"
                    value={gameStatForm.rating}
                    onChange={(e) => setGameStatForm({...gameStatForm, rating: parseFloat(e.target.value) || 0})}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-fuchsia-500 transition-all"
                  />
                </div>
                <button 
                  type="submit"
                  className="col-span-2 py-3 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-fuchsia-600/20"
                >
                  Confirmar y Guardar
                </button>
              </form>
            </div>

            {/* History List */}
            <div className="space-y-4">
              <h4 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-wider">
                <Calendar size={18} className="text-slate-500" />
                Historial de Partidos
              </h4>
              <div className="space-y-3">
                {selectedPlayer.gameHistory && selectedPlayer.gameHistory.length > 0 ? (
                  selectedPlayer.gameHistory.map((game) => (
                    <div key={game.id} className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl flex items-center justify-between group hover:border-fuchsia-500/30 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-fuchsia-500 font-black text-xs">
                          {new Date(game.date).getDate()}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-white group-hover:text-fuchsia-400 transition-colors">vs {game.opponent}</span>
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                            {new Date(game.date).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="hidden sm:flex items-center gap-4">
                          <div className="flex flex-col items-center">
                            <span className="text-xs font-black text-white">{game.gol}</span>
                            <span className="text-[8px] text-slate-600 uppercase font-bold">GOL</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-xs font-black text-white">{game.asi}</span>
                            <span className="text-[8px] text-slate-600 uppercase font-bold">ASI</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-xs font-black text-white">{game.pas}%</span>
                            <span className="text-[8px] text-slate-600 uppercase font-bold">PAS</span>
                          </div>
                        </div>
                        <div className="bg-fuchsia-500/10 border border-fuchsia-500/30 px-3 py-1.5 rounded-xl">
                          <span className="text-sm font-black text-fuchsia-400">{game.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-slate-900/20 rounded-3xl border border-dashed border-slate-800">
                    <BarChart3 className="mx-auto text-slate-700 mb-3" size={32} />
                    <p className="text-xs text-slate-500 font-medium">No hay partidos registrados aún.</p>
                    <p className="text-[10px] text-slate-600 mt-1">Comienza registrando el primer encuentro arriba.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
