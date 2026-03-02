import { useState } from 'react';
import { DollarSign, Plus, Filter, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export function Finances() {
  const [activeTab, setActiveTab] = useState<'all' | 'registration' | 'referee'>('all');

  const payments = [
    { id: 1, player: 'Carlos Martínez', type: 'Inscripción', amount: 50.00, date: '2023-10-01', status: 'Pagado' },
    { id: 2, player: 'Luis García', type: 'Arbitraje', amount: 15.00, date: '2023-10-15', status: 'Pendiente' },
    { id: 3, player: 'Andrés Pérez', type: 'Inscripción', amount: 50.00, date: '2023-10-02', status: 'Pagado' },
    { id: 4, player: 'Juan Silva', type: 'Arbitraje', amount: 15.00, date: '2023-10-15', status: 'Pagado' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Finanzas</h1>
          <p className="text-zinc-400 mt-2">Control de pagos y cuotas</p>
        </div>
        <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)]">
          <Plus size={20} />
          <span>Registrar Pago</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-zinc-400 text-sm font-medium">Total Recaudado</p>
              <p className="text-3xl font-bold text-white mt-1">$1,250.00</p>
            </div>
          </div>
        </div>
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
              <ArrowUpRight size={24} />
            </div>
            <div>
              <p className="text-zinc-400 text-sm font-medium">Inscripciones</p>
              <p className="text-3xl font-bold text-white mt-1">$1,000.00</p>
            </div>
          </div>
        </div>
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
              <ArrowDownRight size={24} />
            </div>
            <div>
              <p className="text-zinc-400 text-sm font-medium">Pendiente Arbitraje</p>
              <p className="text-3xl font-bold text-white mt-1">$45.00</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex gap-2">
            {['all', 'registration', 'referee'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-purple-600 text-white'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                {tab === 'all' ? 'Todos' : tab === 'registration' ? 'Inscripciones' : 'Arbitraje'}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 text-zinc-400 hover:text-white px-3 py-2 rounded-lg hover:bg-zinc-900 transition-colors">
            <Filter size={18} />
            <span className="text-sm font-medium">Filtrar</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-900/50 border-b border-zinc-800">
                <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Jugador</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Monto</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-zinc-900/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">{payment.player}</td>
                  <td className="px-6 py-4 text-zinc-300">{payment.type}</td>
                  <td className="px-6 py-4 text-zinc-300">${payment.amount.toFixed(2)}</td>
                  <td className="px-6 py-4 text-zinc-400 text-sm">{payment.date}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      payment.status === 'Pagado' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
