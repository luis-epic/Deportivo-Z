import React, { useState } from 'react';
import { AlertTriangle, Plus, Search, CheckCircle2, Clock, Trash2, DollarSign, CreditCard, Filter, Edit2 } from 'lucide-react';
import { useDiscipline, Card } from '../hooks/useDiscipline';
import { usePlayers } from '../hooks/usePlayers';
import { Modal } from '../components/ui/Modal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { motion, AnimatePresence } from 'motion/react';

export function Discipline() {
  const { cards, addCard, updateCard, deleteCard, togglePaid } = useDiscipline();
  const { players } = usePlayers();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'yellow' | 'red'>('all');
  const [filterPaid, setFilterPaid] = useState<'all' | 'paid' | 'pending'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    playerId: '',
    type: 'yellow' as 'yellow' | 'red',
    date: new Date().toISOString().split('T')[0],
    reason: '',
    match: '',
    league: '',
    amount: '5.00'
  });

  const filteredCards = cards.filter(card => {
    const matchesSearch = card.playerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.league.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || card.type === filterType;
    const matchesPaid = filterPaid === 'all' || (filterPaid === 'paid' ? card.isPaid : !card.isPaid);
    
    return matchesSearch && matchesType && matchesPaid;
  });

  const yellowCardsCount = cards.filter(c => c.type === 'yellow').length;
  const redCardsCount = cards.filter(c => c.type === 'red').length;
  const pendingDebt = cards.filter(c => !c.isPaid).reduce((acc, c) => acc + c.amount, 0);
  const pendingCardsCount = cards.filter(c => !c.isPaid).length;

  const handleEdit = (card: Card) => {
    setEditingId(card.id);
    setFormData({
      playerId: card.playerId,
      type: card.type,
      date: card.date,
      reason: card.reason,
      match: card.match,
      league: card.league,
      amount: card.amount.toString()
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      playerId: '',
      type: 'yellow',
      date: new Date().toISOString().split('T')[0],
      reason: '',
      match: '',
      league: '',
      amount: '5.00'
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const player = players.find(p => p.id === formData.playerId);
    if (!player) return;

    const cardData = {
      playerId: player.id,
      playerName: player.name,
      type: formData.type,
      date: formData.date,
      reason: formData.reason,
      match: formData.match,
      league: formData.league,
      amount: parseFloat(formData.amount)
    };

    if (editingId) {
      updateCard(editingId, cardData);
    } else {
      addCard({
        ...cardData,
        isPaid: false
      });
    }

    handleCloseModal();
  };

  const confirmDelete = (id: string) => {
    setCardToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = () => {
    if (cardToDelete) {
      deleteCard(cardToDelete);
      setCardToDelete(null);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Control Disciplinario</h1>
          <p className="text-zinc-400 mt-2">Historial de tarjetas, sanciones y multas</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-[0_0_15px_rgba(217,119,6,0.3)]"
        >
          <Plus size={20} />
          <span>Registrar Tarjeta</span>
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/5 blur-3xl -mr-12 -mt-12" />
          <div className="flex items-center gap-4">
            <div className="w-12 h-16 rounded-lg bg-amber-400 flex items-center justify-center shadow-[0_0_20px_rgba(251,191,36,0.2)] border border-amber-300/30">
              <span className="text-amber-900 font-black text-xl">{yellowCardsCount}</span>
            </div>
            <div>
              <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Amarillas</p>
              <h3 className="text-xl font-bold text-white">Acumuladas</h3>
            </div>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 blur-3xl -mr-12 -mt-12" />
          <div className="flex items-center gap-4">
            <div className="w-12 h-16 rounded-lg bg-red-500 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.2)] border border-red-400/30">
              <span className="text-red-950 font-black text-xl">{redCardsCount}</span>
            </div>
            <div>
              <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Rojas</p>
              <h3 className="text-xl font-bold text-white">Directas</h3>
            </div>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-3xl -mr-12 -mt-12" />
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Deuda Total</p>
              <h3 className="text-xl font-bold text-white">${pendingDebt.toFixed(2)}</h3>
            </div>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-3xl -mr-12 -mt-12" />
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Pendientes</p>
              <h3 className="text-xl font-bold text-white">{pendingCardsCount} Multas</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
        {/* Filters & Search */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/20 space-y-4">
          <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between">
            <div className="relative w-full xl:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
              <input 
                type="text"
                placeholder="Buscar por jugador, liga o motivo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-1 w-full sm:w-auto">
                <button 
                  onClick={() => setFilterType('all')}
                  className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${filterType === 'all' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Todas
                </button>
                <button 
                  onClick={() => setFilterType('yellow')}
                  className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${filterType === 'yellow' ? 'bg-amber-500/20 text-amber-400' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Amarillas
                </button>
                <button 
                  onClick={() => setFilterType('red')}
                  className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${filterType === 'red' ? 'bg-red-500/20 text-red-400' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Rojas
                </button>
              </div>

              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-1 w-full sm:w-auto">
                <button 
                  onClick={() => setFilterPaid('all')}
                  className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${filterPaid === 'all' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Todos
                </button>
                <button 
                  onClick={() => setFilterPaid('pending')}
                  className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${filterPaid === 'pending' ? 'bg-amber-500/20 text-amber-400' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Pendientes
                </button>
                <button 
                  onClick={() => setFilterPaid('paid')}
                  className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${filterPaid === 'paid' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Pagados
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-800">
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Tarjeta</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Jugador / Liga</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Partido / Motivo</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Multa</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Estado de Pago</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              <AnimatePresence mode="popLayout">
                {filteredCards.length > 0 ? filteredCards.map((card) => (
                  <motion.tr 
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key={card.id} 
                    className="group hover:bg-slate-900/30 transition-colors"
                  >
                    <td className="px-6 py-6">
                      <div className={`w-8 h-11 rounded-md shadow-2xl relative group-hover:scale-110 transition-transform border-2 ${
                        card.type === 'yellow' 
                          ? 'bg-gradient-to-br from-amber-300 to-amber-500 shadow-amber-500/20 border-amber-200/30' 
                          : 'bg-gradient-to-br from-red-400 to-red-600 shadow-red-500/20 border-red-300/30'
                      }`}>
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-md" />
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <p className="font-bold text-white group-hover:text-red-400 transition-colors">{card.playerName}</p>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-0.5">{card.league}</p>
                    </td>
                    <td className="px-6 py-6">
                      <p className="text-white text-sm font-medium">{card.match}</p>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">{card.reason}</p>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-1.5">
                        <DollarSign size={14} className="text-slate-500" />
                        <p className="text-white font-black text-lg">{card.amount.toFixed(2)}</p>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center justify-end gap-4">
                        <button 
                          onClick={() => togglePaid(card.id)}
                          title={card.isPaid ? "Marcar como pendiente" : "Marcar como pagado"}
                          className={`group/btn relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${
                            card.isPaid 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                          }`}
                        >
                          {card.isPaid ? (
                            <>
                              <CheckCircle2 size={14} className="group-hover/btn:scale-110 transition-transform" />
                              <span>Pagado</span>
                            </>
                          ) : (
                            <>
                              <Clock size={14} className="animate-pulse" />
                              <span>Pendiente</span>
                            </>
                          )}
                        </button>
                        
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleEdit(card)}
                            className="p-2 text-slate-600 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all"
                            title="Editar registro"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => confirmDelete(card.id)}
                            className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                            title="Eliminar registro"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </td>
                  </motion.tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">
                      No se encontraron tarjetas con los filtros actuales.
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-slate-800">
          <AnimatePresence mode="popLayout">
            {filteredCards.length > 0 ? filteredCards.map((card) => (
              <motion.div
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                key={card.id}
                className="p-4 space-y-4"
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className={`w-8 h-11 rounded-md shadow-2xl border-2 flex-shrink-0 ${
                      card.type === 'yellow' 
                        ? 'bg-gradient-to-br from-amber-300 to-amber-500 border-amber-200/30' 
                        : 'bg-gradient-to-br from-red-400 to-red-600 border-red-300/30'
                    }`} />
                    <div>
                      <p className="font-bold text-white">{card.playerName}</p>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{card.league}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <DollarSign size={14} className="text-slate-500" />
                    <p className="text-white font-black text-lg">{card.amount.toFixed(2)}</p>
                  </div>
                </div>

                <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-800">
                  <p className="text-white text-xs font-medium">{card.match}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{card.reason}</p>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <button 
                    onClick={() => togglePaid(card.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                      card.isPaid 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                    }`}
                  >
                    {card.isPaid ? (
                      <><CheckCircle2 size={12} /><span>Pagado</span></>
                    ) : (
                      <><Clock size={12} className="animate-pulse" /><span>Pendiente</span></>
                    )}
                  </button>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEdit(card)}
                      className="p-2 bg-slate-900 border border-slate-800 text-slate-400 rounded-xl"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => confirmDelete(card.id)}
                      className="p-2 bg-slate-900 border border-slate-800 text-red-500/70 rounded-xl"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )) : (
              <div className="p-8 text-center text-slate-500 italic text-sm">
                No se encontraron tarjetas con los filtros actuales.
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingId ? "Editar Tarjeta" : "Registrar Nueva Tarjeta"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Jugador</label>
              <select
                required
                value={formData.playerId}
                onChange={(e) => setFormData({...formData, playerId: e.target.value})}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
              >
                <option value="">Seleccionar...</option>
                {players.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Liga / Torneo</label>
              <input
                type="text"
                required
                value={formData.league}
                onChange={(e) => setFormData({...formData, league: e.target.value})}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
                placeholder="Ej. Liga Central"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Tipo de Tarjeta</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, type: 'yellow'})}
                  className={`py-2.5 rounded-xl border font-bold text-xs transition-all ${
                    formData.type === 'yellow' 
                      ? 'bg-amber-400 text-amber-950 border-amber-400' 
                      : 'bg-slate-900 text-slate-500 border-slate-800'
                  }`}
                >
                  Amarilla
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, type: 'red'})}
                  className={`py-2.5 rounded-xl border font-bold text-xs transition-all ${
                    formData.type === 'red' 
                      ? 'bg-red-500 text-white border-red-500' 
                      : 'bg-slate-900 text-slate-500 border-slate-800'
                  }`}
                >
                  Roja
                </button>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Fecha</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Partido / Jornada</label>
              <input
                type="text"
                required
                value={formData.match}
                onChange={(e) => setFormData({...formData, match: e.target.value})}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
                placeholder="Ej. Jornada 5"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Monto Multa ($)</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Motivo de la Sanción</label>
            <textarea
              required
              rows={2}
              value={formData.reason}
              onChange={(e) => setFormData({...formData, reason: e.target.value})}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none"
              placeholder="Ej. Falta táctica cerca del área"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2 rounded-xl text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition-colors shadow-[0_0_15px_rgba(217,119,6,0.3)]"
            >
              {editingId ? "Guardar Cambios" : "Registrar Tarjeta"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="¿Eliminar Registro Disciplinario?"
        message="Esta acción no se puede deshacer. El registro de esta tarjeta y su multa asociada se eliminarán permanentemente."
        confirmText="Eliminar Registro"
      />
    </motion.div>
  );
}

