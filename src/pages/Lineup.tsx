import { Shield, Upload } from 'lucide-react';
import { useLineup, Player } from '../hooks/useLineup';

interface PlayerCardProps {
  player: Player | null;
  positionKey: string;
  onPhotoUpload: (positionKey: string, file: File) => void;
}

function PlayerCard({ player, positionKey, onPhotoUpload }: PlayerCardProps) {
  if (!player) {
    return (
      <div className="w-20 h-28 sm:w-24 sm:h-36 md:w-32 md:h-48 border-2 border-dashed border-slate-700/50 rounded-xl flex items-center justify-center bg-black/20 backdrop-blur-sm">
        <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-slate-700/50" />
      </div>
    );
  }

  return (
    <div className="relative w-24 h-36 sm:w-28 sm:h-40 md:w-36 md:h-52 bg-gradient-to-b from-red-900 to-slate-950 rounded-t-2xl rounded-b-xl p-1 shadow-[0_0_15px_rgba(220,38,38,0.4)] border border-red-500/30 overflow-hidden group hover:scale-105 transition-transform duration-200">
      
      {/* Upload Overlay */}
      <label className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm">
        <Upload className="w-6 h-6 text-white mb-1" />
        <span className="text-[10px] text-white font-medium text-center px-2">Cambiar Foto</span>
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          onChange={(e) => {
            if (e.target.files?.[0]) {
              onPhotoUpload(positionKey, e.target.files[0]);
            }
          }} 
        />
      </label>

      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-red-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      
      {/* Top section: Rating & Position */}
      <div className="absolute top-2 left-2 flex flex-col items-center z-10 pointer-events-none">
        <span className="text-sm sm:text-base md:text-lg font-bold text-white leading-none">{player.number}</span>
        <span className="text-[10px] sm:text-xs font-medium text-red-300">{player.position}</span>
      </div>

      {/* Player Image */}
      <div className="absolute top-2 right-2 left-8 bottom-1/2 flex items-end justify-center pointer-events-none">
        <img 
          src={player.photo} 
          alt={player.name}
          className="w-full h-full object-cover object-top drop-shadow-2xl mask-image-gradient"
          style={{ maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)' }}
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Bottom section: Name & Stats */}
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black via-black/90 to-transparent pt-4 pointer-events-none">
        <div className="text-center border-b border-red-500/30 pb-1 mb-1">
          <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider truncate">{player.name}</h3>
        </div>
        
        <div className="grid grid-cols-3 gap-1 text-center">
          <div>
            <p className="text-[8px] sm:text-[10px] text-slate-400 uppercase">PAS</p>
            <p className="text-[10px] sm:text-xs font-bold text-white">{player.stats.pas}</p>
          </div>
          <div>
            <p className="text-[8px] sm:text-[10px] text-slate-400 uppercase">GOL</p>
            <p className="text-[10px] sm:text-xs font-bold text-white">{player.stats.gol}</p>
          </div>
          <div>
            <p className="text-[8px] sm:text-[10px] text-slate-400 uppercase">ASI</p>
            <p className="text-[10px] sm:text-xs font-bold text-white">{player.stats.asi}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Lineup() {
  const { players, updatePlayerPhoto } = useLineup();

  return (
    <div className="space-y-8 h-full flex flex-col">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Alineación Táctica</h1>
        <p className="text-slate-400 mt-2">Formación 4-3-3. Pasa el cursor sobre un jugador para cambiar su foto.</p>
      </div>

      <div className="flex-1 min-h-[600px] relative bg-emerald-900/20 border border-emerald-900/50 rounded-3xl overflow-hidden p-4 sm:p-8 flex items-center justify-center">
        {/* Pitch Background */}
        <div className="absolute inset-4 sm:inset-8 border-2 border-emerald-500/30 rounded-lg pointer-events-none">
          {/* Center line */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-emerald-500/30" />
          {/* Center circle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-emerald-500/30 rounded-full" />
          {/* Penalty areas */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 border-2 border-t-0 border-emerald-500/30" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-32 border-2 border-b-0 border-emerald-500/30" />
        </div>

        {/* Formation Grid 4-3-3 */}
        <div className="relative w-full max-w-4xl h-full flex flex-col justify-between py-8 z-10">
          
          {/* Attackers */}
          <div className="flex justify-center gap-4 sm:gap-12 md:gap-24">
            <PlayerCard positionKey="LW" player={players['LW']} onPhotoUpload={updatePlayerPhoto} />
            <PlayerCard positionKey="ST" player={players['ST']} onPhotoUpload={updatePlayerPhoto} />
            <PlayerCard positionKey="RW" player={players['RW']} onPhotoUpload={updatePlayerPhoto} />
          </div>

          {/* Midfielders */}
          <div className="flex justify-center gap-4 sm:gap-12 md:gap-20 mt-8">
            <PlayerCard positionKey="CM1" player={players['CM1']} onPhotoUpload={updatePlayerPhoto} />
            <div className="translate-y-8">
              <PlayerCard positionKey="CDM" player={players['CDM']} onPhotoUpload={updatePlayerPhoto} />
            </div>
            <PlayerCard positionKey="CM2" player={players['CM2']} onPhotoUpload={updatePlayerPhoto} />
          </div>

          {/* Defenders */}
          <div className="flex justify-center gap-2 sm:gap-8 md:gap-16 mt-12">
            <PlayerCard positionKey="LB" player={players['LB']} onPhotoUpload={updatePlayerPhoto} />
            <PlayerCard positionKey="CB1" player={players['CB1']} onPhotoUpload={updatePlayerPhoto} />
            <PlayerCard positionKey="CB2" player={players['CB2']} onPhotoUpload={updatePlayerPhoto} />
            <PlayerCard positionKey="RB" player={players['RB']} onPhotoUpload={updatePlayerPhoto} />
          </div>

          {/* Goalkeeper */}
          <div className="flex justify-center mt-8">
            <PlayerCard positionKey="GK" player={players['GK']} onPhotoUpload={updatePlayerPhoto} />
          </div>

        </div>
      </div>
    </div>
  );
}
