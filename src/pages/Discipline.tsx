import React, { useState } from 'react';
import { AlertTriangle, Plus, Search, CheckCircle2, Clock, Trash2 } from 'lucide-react';
import { useDiscipline } from '../hooks/useDiscipline';
import { usePlayers } from '../hooks/usePlayers';
import { Modal } from '../components/ui/Modal';
import { motion } from 'motion/react';

export function Discipline() {
  const { cards, addCard, deleteCard, togglePaid } = useDiscipline();
  const { players } = usePlayers();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    playerId: '',
    type: 'yellow' as 'yellow' | 'red',
    date: new Date().toISOString().split('T')[0],
    reason: '',
    match: '',
    league: '',
    amount: '5.00'
  });

  const filteredCards = cards.filter(card => 
    card.playerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.league.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const yellowCardsCount = cards.filter(c => c.type === 'yellow').length;
  const redCardsCount = cards.filter(c => c.type === 'red').length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const player = players.find(p => p.id === formData.playerId);
    if (!player) return;

    addCard({
      playerId: player.id,
      playerName: player.name,
      type: formData.type,
      date: formData.date,
      reason: formData.reason,
      match: formData.match,
      league: formData.league,
      isPaid: false,
      amount: parseFloat(formData.amount)
    });

    setIsModalOpen(false);
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex items-center gap-6">
          <div className="w-16 h-20 rounded-lg bg-amber-400 flex items-center justify-center shadow-[0_0_20px_rgba(251,191,36,0.3)]">
            <span className="text-amber-900 font-bold text-2xl">{yellowCardsCount}</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Tarjetas Amarillas</h3>
            <p className="text-slate-400 mt-1">Total acumulado en todas las ligas</p>
          </div>
        </div>
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex items-center gap-6">
          <div className="w-16 h-20 rounded-lg bg-red-500 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.3)]">
            <span className="text-red-950 font-bold text-2xl">{redCardsCount}</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Tarjetas Rojas</h3>
            <p className="text-slate-400 mt-1">Total acumulado en todas las ligas</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
            <input 
              type="text"
              placeholder="Buscar por jugador, liga o motivo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-800">
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Tarjeta</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Jugador / Liga</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Partido / Motivo</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Multa</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Estado Pago</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredCards.map((card) => (
                <tr key={card.id} className="hover:bg-slate-900/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className={`w-6 h-8 rounded shadow-lg ${
                      card.type === 'yellow' ? 'bg-amber-400' : 'bg-red-500'
                    }`} />
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-white">{card.playerName}</p>
                    <p className="text-xs text-slate-500">{card.league}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-white text-sm">{card.match}</p>
                    <p className="text-xs text-slate-400">{card.reason}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-white font-bold">${card.amount.toFixed(2)}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex flex-col items-end gap-2">
                      <button 
                        onClick={() => togglePaid(card.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-colors ${
                          card.isPaid 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {card.isPaid ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                        {card.isPaid ? 'Pagado' : 'Pendiente'}
                      </button>
                      <button 
                        onClick={() => deleteCard(card.id)}
                        className="p-1 text-slate-600 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Registrar Nueva Tarjeta"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-slate-400 mb-1">Jugador</label>
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
              <label className="block text-sm font-medium text-slate-400 mb-1">Liga / Torneo</label>
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
              <label className="block text-sm font-medium text-slate-400 mb-1">Tipo de Tarjeta</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
              >
                <option value="yellow">Amarilla</option>
                <option value="red">Roja</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Fecha</label>
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
              <label className="block text-sm font-medium text-slate-400 mb-1">Partido / Jornada</label>
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
              <label className="block text-sm font-medium text-slate-400 mb-1">Monto Multa ($)</label>
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
            <label className="block text-sm font-medium text-slate-400 mb-1">Motivo de la Sanción</label>
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
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-medium transition-colors shadow-[0_0_15px_rgba(217,119,6,0.3)]"
            >
              Registrar Tarjeta
            </button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}

