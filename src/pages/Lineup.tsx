import { useState } from 'react';
import { Shield, UserPlus, ArrowLeftRight, X } from 'lucide-react';
import { usePlayers, Player } from '../hooks/usePlayers';
import { motion, AnimatePresence } from 'motion/react';

interface PlayerCardProps {
  player: Player | null;
  positionKey: string;
  isSelected: boolean;
  onSelect: (playerId: string | null, slotKey: string) => void;
}

function PlayerCard({ player, positionKey, isSelected, onSelect }: PlayerCardProps) {
  const futCardClipPath = "polygon(0 15%, 10% 5%, 30% 8%, 50% 0, 70% 8%, 90% 5%, 100% 15%, 100% 85%, 50% 100%, 0 85%)";

  if (!player) {
    return (
      <button 
        onClick={() => onSelect(null, positionKey)}
        className={`w-20 h-28 sm:w-24 sm:h-36 md:w-32 md:h-48 flex items-center justify-center bg-white/5 backdrop-blur-md transition-all duration-300 ${
          isSelected ? 'bg-fuchsia-500/20 scale-105 shadow-[0_0_20px_rgba(217,70,239,0.3)]' : 'hover:bg-white/10'
        }`}
        style={{ clipPath: futCardClipPath, border: '1px dashed rgba(217,70,239,0.3)' }}
      >
        <div className="flex flex-col items-center gap-2">
          <Shield className={`w-6 h-6 sm:w-8 sm:h-8 transition-colors ${isSelected ? 'text-fuchsia-500' : 'text-slate-700'}`} />
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{positionKey}</span>
        </div>
      </button>
    );
  }

  return (
    <button 
      onClick={() => onSelect(player.id, positionKey)}
      className={`relative w-24 h-36 sm:w-28 sm:h-40 md:w-36 md:h-52 transition-all duration-300 group ${
        isSelected ? 'scale-110 z-40 shadow-[0_0_40px_rgba(217,70,239,0.6)]' : 'hover:scale-105 hover:shadow-[0_0_25px_rgba(217,70,239,0.3)]'
      }`}
      style={{ clipPath: futCardClipPath }}
    >
      {/* Card Background & Border */}
      <div className={`absolute inset-0 bg-gradient-to-br ${isSelected ? 'from-fuchsia-400 via-purple-600 to-indigo-900' : 'from-fuchsia-600 via-purple-900 to-slate-950'}`} />
      
      {/* Inner Content Container */}
      <div className="absolute inset-[2px] bg-slate-950 overflow-hidden flex flex-col" style={{ clipPath: futCardClipPath }}>
        {/* Background Pattern (Neon Lines) */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(217,70,239,0.1)_10px,rgba(217,70,239,0.1)_11px)]" />
          <div className="absolute top-1/4 -left-1/4 w-full h-1/2 bg-fuchsia-500/20 blur-[60px] rotate-12" />
        </div>

        {/* Top Section: Number & Position */}
        <div className="relative z-10 pt-6 px-3 flex flex-col items-start">
          <span className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-none italic drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
            {player.number}
          </span>
          <span className="text-[9px] sm:text-[11px] font-black text-fuchsia-400 uppercase tracking-tighter">
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
        <div className="absolute top-4 right-2 w-[70%] h-3/5 flex items-end justify-center z-0">
          {player.photo ? (
            <img 
              src={player.photo} 
              alt={player.name}
              className="w-full h-full object-contain object-bottom drop-shadow-[0_10px_20px_rgba(0,0,0,0.9)] transition-transform duration-500 group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-800/50">
              <UserPlus size={48} strokeWidth={1} />
            </div>
          )}
        </div>

        {/* Name Plate */}
        <div className="relative z-10 mt-auto mb-14 bg-black/40 backdrop-blur-sm border-y border-fuchsia-500/30 py-1">
          <h3 className="text-[10px] sm:text-[11px] md:text-[12px] font-bold text-white uppercase tracking-tight text-center line-clamp-1 px-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            {player.name}
          </h3>
        </div>

        {/* Shine Effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
      </div>
    </button>
  );
}

export function Lineup() {
  const { players, swapPlayers, moveToEmptySlot } = usePlayers();
  const [selectedPlayer, setSelectedPlayer] = useState<{ id: string | null, slot: string } | null>(null);

  const lineupPlayers = players.reduce((acc, p) => {
    if (p.lineupPosition) acc[p.lineupPosition] = p;
    return acc;
  }, {} as Record<string, Player>);

  const benchPlayers = players.filter(p => !p.lineupPosition);

  const handleSelect = (playerId: string | null, slotKey: string) => {
    // If nothing selected, select this
    if (!selectedPlayer) {
      if (playerId || slotKey) {
        setSelectedPlayer({ id: playerId, slot: slotKey });
      }
      return;
    }

    // If clicking the same thing, deselect
    if (selectedPlayer.slot === slotKey) {
      setSelectedPlayer(null);
      return;
    }

    // Perform action
    if (selectedPlayer.id && playerId) {
      // Swap two players
      swapPlayers(selectedPlayer.id, playerId);
    } else if (selectedPlayer.id && !playerId) {
      // Move player to empty slot
      moveToEmptySlot(selectedPlayer.id, slotKey);
    } else if (!selectedPlayer.id && playerId) {
      // Move player from bench/other slot to this empty slot (handled by first case if we consider bench as slots)
      // Actually, if we click an empty slot first, then a player, we move that player to the empty slot
      moveToEmptySlot(playerId, selectedPlayer.slot);
    }

    setSelectedPlayer(null);
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Alineación Táctica</h1>
          <p className="text-slate-400 mt-2">Gestiona tu 11 inicial y suplentes. Haz clic en un jugador para moverlo.</p>
        </div>
        
        {selectedPlayer && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 bg-red-600/20 border border-red-500/30 px-4 py-2 rounded-xl"
          >
            <div className="flex items-center gap-2 text-red-400">
              <ArrowLeftRight size={18} />
              <span className="text-sm font-medium">
                {selectedPlayer.id ? 'Seleccionado para mover/cambiar' : 'Espacio seleccionado'}
              </span>
            </div>
            <button 
              onClick={() => setSelectedPlayer(null)}
              className="p-1 hover:bg-red-500/20 rounded-lg transition-colors text-red-400"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </div>

      {/* Pitch */}
      <div className="relative bg-emerald-900/20 border border-emerald-900/50 rounded-3xl overflow-hidden p-4 sm:p-8 flex items-center justify-center min-h-[700px]">
        {/* Pitch Background */}
        <div className="absolute inset-4 sm:inset-8 border-2 border-emerald-500/30 rounded-lg pointer-events-none">
          <div className="absolute top-1/2 left-0 right-0 h-px bg-emerald-500/30" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-emerald-500/30 rounded-full" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 border-2 border-t-0 border-emerald-500/30" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-32 border-2 border-b-0 border-emerald-500/30" />
        </div>

        {/* Formation Grid 4-3-3 */}
        <div className="relative w-full max-w-4xl h-full flex flex-col justify-between py-8 z-10 gap-12">
          
          {/* Attackers */}
          <div className="flex justify-center gap-4 sm:gap-12 md:gap-24">
            <PlayerCard 
              positionKey="LW" 
              player={lineupPlayers['LW']} 
              isSelected={selectedPlayer?.slot === 'LW'} 
              onSelect={handleSelect} 
            />
            <PlayerCard 
              positionKey="ST" 
              player={lineupPlayers['ST']} 
              isSelected={selectedPlayer?.slot === 'ST'} 
              onSelect={handleSelect} 
            />
            <PlayerCard 
              positionKey="RW" 
              player={lineupPlayers['RW']} 
              isSelected={selectedPlayer?.slot === 'RW'} 
              onSelect={handleSelect} 
            />
          </div>

          {/* Midfielders */}
          <div className="flex justify-center gap-4 sm:gap-12 md:gap-20">
            <PlayerCard 
              positionKey="CM1" 
              player={lineupPlayers['CM1']} 
              isSelected={selectedPlayer?.slot === 'CM1'} 
              onSelect={handleSelect} 
            />
            <div className="translate-y-8">
              <PlayerCard 
                positionKey="CDM" 
                player={lineupPlayers['CDM']} 
                isSelected={selectedPlayer?.slot === 'CDM'} 
                onSelect={handleSelect} 
              />
            </div>
            <PlayerCard 
              positionKey="CM2" 
              player={lineupPlayers['CM2']} 
              isSelected={selectedPlayer?.slot === 'CM2'} 
              onSelect={handleSelect} 
            />
          </div>

          {/* Defenders */}
          <div className="flex justify-center gap-2 sm:gap-8 md:gap-16">
            <PlayerCard 
              positionKey="LB" 
              player={lineupPlayers['LB']} 
              isSelected={selectedPlayer?.slot === 'LB'} 
              onSelect={handleSelect} 
            />
            <PlayerCard 
              positionKey="CB1" 
              player={lineupPlayers['CB1']} 
              isSelected={selectedPlayer?.slot === 'CB1'} 
              onSelect={handleSelect} 
            />
            <PlayerCard 
              positionKey="CB2" 
              player={lineupPlayers['CB2']} 
              isSelected={selectedPlayer?.slot === 'CB2'} 
              onSelect={handleSelect} 
            />
            <PlayerCard 
              positionKey="RB" 
              player={lineupPlayers['RB']} 
              isSelected={selectedPlayer?.slot === 'RB'} 
              onSelect={handleSelect} 
            />
          </div>

          {/* Goalkeeper */}
          <div className="flex justify-center">
            <PlayerCard 
              positionKey="GK" 
              player={lineupPlayers['GK']} 
              isSelected={selectedPlayer?.slot === 'GK'} 
              onSelect={handleSelect} 
            />
          </div>
        </div>
      </div>

      {/* Bench Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <UserPlus className="text-red-500" size={20} />
          <h2 className="text-xl font-bold text-white">Suplentes</h2>
          <span className="bg-slate-800 text-slate-400 text-xs px-2 py-0.5 rounded-full">
            {benchPlayers.length} jugadores
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {benchPlayers.map((player) => (
            <div key={player.id} className="flex justify-center">
              <PlayerCard 
                positionKey="SUB" 
                player={player} 
                isSelected={selectedPlayer?.id === player.id} 
                onSelect={(id) => handleSelect(id, `bench-${player.id}`)} 
              />
            </div>
          ))}
          
          {benchPlayers.length === 0 && (
            <div className="col-span-full py-12 text-center bg-slate-950/50 border border-dashed border-slate-800 rounded-2xl">
              <p className="text-slate-500 italic">No hay suplentes disponibles. Añade más jugadores en la sección de Jugadores.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
