import { Users, DollarSign, AlertTriangle, Trophy, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion } from 'motion/react';

export function Dashboard() {
  const stats = [
    {
      name: 'Jugadores Activos',
      value: '24',
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
      name: 'Tarjetas Acumuladas',
      value: '12',
      change: '-3',
      trend: 'down',
      icon: AlertTriangle,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
    {
      name: 'Partidos Ganados',
      value: '8',
      change: '+1',
      trend: 'up',
      icon: Trophy,
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
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
        <p className="text-slate-400 mt-2">Resumen general del Deportivo Z</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximos Pagos */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-950 border border-slate-800 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Próximos Pagos</h2>
            <button className="text-sm text-red-400 hover:text-red-300 font-medium">Ver todos</button>
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
          transition={{ delay: 0.5 }}
          className="bg-slate-950 border border-slate-800 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Últimas Incidencias</h2>
            <button className="text-sm text-red-400 hover:text-red-300 font-medium">Ver todas</button>
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
