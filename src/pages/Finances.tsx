import React, { useState } from 'react';
import { DollarSign, Plus, Filter, ArrowUpRight, ArrowDownRight, Upload, Image as ImageIcon, CheckCircle2, Clock, Trash2, ExternalLink } from 'lucide-react';
import { useFinances, PaymentMethod, PaymentType } from '../hooks/useFinances';
import { usePlayers } from '../hooks/usePlayers';
import { Modal } from '../components/ui/Modal';
import { motion } from 'motion/react';

export function Finances() {
  const { payments, addPayment, deletePayment, updatePayment } = useFinances();
  const { players } = usePlayers();
  const [activeTab, setActiveTab] = useState<'all' | 'Inscripción' | 'Arbitraje' | 'Tarjeta'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    playerId: '',
    league: '',
    description: '',
    type: 'Inscripción' as PaymentType,
    amount: '',
    method: 'Pago Móvil' as PaymentMethod,
    date: new Date().toISOString().split('T')[0],
    status: 'Pagado' as 'Pagado' | 'Pendiente',
    captureUrl: null as string | null
  });

  const filteredPayments = payments.filter(p => 
    activeTab === 'all' ? true : p.type === activeTab
  );

  const totalRecaudado = payments
    .filter(p => p.status === 'Pagado')
    .reduce((acc, p) => acc + p.amount, 0);

  const totalInscripciones = payments
    .filter(p => p.type === 'Inscripción' && p.status === 'Pagado')
    .reduce((acc, p) => acc + p.amount, 0);

  const totalPendiente = payments
    .filter(p => p.status === 'Pendiente')
    .reduce((acc, p) => acc + p.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const player = players.find(p => p.id === formData.playerId);
    if (!player) return;

    addPayment({
      playerId: player.id,
      playerName: player.name,
      league: formData.league,
      description: formData.description,
      type: formData.type,
      amount: parseFloat(formData.amount),
      method: formData.method,
      date: formData.date,
      status: formData.status,
      captureUrl: formData.captureUrl
    });

    setIsModalOpen(false);
    setFormData({
      playerId: '',
      league: '',
      description: '',
      type: 'Inscripción',
      amount: '',
      method: 'Pago Móvil',
      date: new Date().toISOString().split('T')[0],
      status: 'Pagado',
      captureUrl: null
    });
  };

  const handleCaptureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, captureUrl: reader.result as string });
      };
      reader.readAsDataURL(e.target.files[0]);
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
          <h1 className="text-3xl font-bold text-white tracking-tight">Finanzas</h1>
          <p className="text-zinc-400 mt-2">Control de pagos, cuotas y ligas</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)]"
        >
          <Plus size={20} />
          <span>Registrar Pago</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-slate-400 text-sm font-medium">Total Recaudado</p>
              <p className="text-3xl font-bold text-white mt-1">${totalRecaudado.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
              <ArrowUpRight size={24} />
            </div>
            <div>
              <p className="text-slate-400 text-sm font-medium">Inscripciones</p>
              <p className="text-3xl font-bold text-white mt-1">${totalInscripciones.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
              <ArrowDownRight size={24} />
            </div>
            <div>
              <p className="text-slate-400 text-sm font-medium">Pendiente Total</p>
              <p className="text-3xl font-bold text-white mt-1">${totalPendiente.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto">
            {['all', 'Inscripción', 'Arbitraje', 'Tarjeta'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-red-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {tab === 'all' ? 'Todos' : tab}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-800">
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Jugador / Liga</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Detalle</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Método / Monto</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Comprobante</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-slate-900/30 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-white">{payment.playerName}</p>
                    <p className="text-xs text-slate-500">{payment.league}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-2 py-0.5 bg-slate-800 text-slate-300 text-[10px] rounded mb-1">{payment.type}</span>
                    <p className="text-xs text-slate-400 line-clamp-1">{payment.description}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-white font-bold">${payment.amount.toFixed(2)}</p>
                    <p className="text-[10px] text-slate-500">{payment.method}</p>
                  </td>
                  <td className="px-6 py-4">
                    {payment.captureUrl ? (
                      <a 
                        href={payment.captureUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-xs"
                      >
                        <ImageIcon size={14} />
                        <span>Ver Capture</span>
                        <ExternalLink size={10} />
                      </a>
                    ) : (
                      <span className="text-slate-600 text-xs italic">Sin capture</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex flex-col items-end gap-2">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        payment.status === 'Pagado' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {payment.status === 'Pagado' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                        {payment.status}
                      </span>
                      <button 
                        onClick={() => deletePayment(payment.id)}
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
        title="Registrar Nuevo Pago"
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

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Descripción del Pago</label>
            <textarea
              required
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none"
              placeholder="Ej. Pago de arbitraje jornada 5 contra Los Galácticos"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Tipo</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value as PaymentType})}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
              >
                <option value="Inscripción">Inscripción</option>
                <option value="Arbitraje">Arbitraje</option>
                <option value="Tarjeta">Multa Tarjeta</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Monto ($)</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Método</label>
              <select
                value={formData.method}
                onChange={(e) => setFormData({...formData, method: e.target.value as PaymentMethod})}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
              >
                <option value="Pago Móvil">Pago Móvil</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Divisa">Divisa</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Estado</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
              >
                <option value="Pagado">Pagado</option>
                <option value="Pendiente">Pendiente</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Comprobante de Pago (Capture)</label>
            <div className="flex items-center gap-4">
              <label className="flex-1 flex items-center justify-center gap-2 bg-slate-900 border border-slate-800 border-dashed rounded-xl px-4 py-6 text-slate-500 hover:text-white hover:border-slate-600 cursor-pointer transition-all">
                {formData.captureUrl ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="text-emerald-500" size={20} />
                    <span className="text-xs">Capture cargado correctamente</span>
                  </div>
                ) : (
                  <>
                    <Upload size={20} />
                    <span className="text-xs">Subir imagen del comprobante</span>
                  </>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleCaptureUpload} />
              </label>
              {formData.captureUrl && (
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, captureUrl: null})}
                  className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
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
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)]"
            >
              Registrar Pago
            </button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}

