import { useState } from 'react';
import { AlertTriangle, Plus, Search } from 'lucide-react';

export function Discipline() {
  const [searchTerm, setSearchTerm] = useState('');

  const cards = [
    { id: 1, player: 'Carlos Martínez', type: 'yellow', date: '2023-10-12', reason: 'Falta táctica', match: 'Jornada 5' },
    { id: 2, player: 'Luis García', type: 'red', date: '2023-10-05', reason: 'Doble amarilla', match: 'Jornada 4' },
    { id: 3, player: 'Andrés Pérez', type: 'yellow', date: '2023-09-28', reason: 'Reclamo al árbitro', match: 'Jornada 3' },
    { id: 4, player: 'Carlos Martínez', type: 'yellow', date: '2023-09-21', reason: 'Falta fuerte', match: 'Jornada 2' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Control Disciplinario</h1>
          <p className="text-zinc-400 mt-2">Historial de tarjetas y sanciones</p>
        </div>
        <button className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-[0_0_15px_rgba(217,119,6,0.3)]">
          <Plus size={20} />
          <span>Registrar Tarjeta</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 flex items-center gap-6">
          <div className="w-16 h-20 rounded-lg bg-amber-400 flex items-center justify-center shadow-[0_0_20px_rgba(251,191,36,0.3)]">
            <span className="text-amber-900 font-bold text-2xl">12</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Tarjetas Amarillas</h3>
            <p className="text-zinc-400 mt-1">Total acumulado en la temporada</p>
          </div>
        </div>
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 flex items-center gap-6">
          <div className="w-16 h-20 rounded-lg bg-red-500 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.3)]">
            <span className="text-red-950 font-bold text-2xl">3</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Tarjetas Rojas</h3>
            <p className="text-zinc-400 mt-1">Total acumulado en la temporada</p>
          </div>
        </div>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
            <input 
              type="text"
              placeholder="Buscar por jugador o motivo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-900/50 border-b border-zinc-800">
                <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Tarjeta</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Jugador</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Partido</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Motivo</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider text-right">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {cards.map((card) => (
                <tr key={card.id} className="hover:bg-zinc-900/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className={`w-6 h-8 rounded ${
                      card.type === 'yellow' ? 'bg-amber-400' : 'bg-red-500'
                    }`} />
                  </td>
                  <td className="px-6 py-4 font-medium text-white">{card.player}</td>
                  <td className="px-6 py-4 text-zinc-300">{card.match}</td>
                  <td className="px-6 py-4 text-zinc-400">{card.reason}</td>
                  <td className="px-6 py-4 text-right text-sm text-zinc-400">{card.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
