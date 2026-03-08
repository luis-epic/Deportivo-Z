import React, { useState, useEffect, useRef } from 'react';
import { Shield, UserPlus, ArrowLeftRight, X, MousePointer2, Pencil, Trash2, Sparkles, BrainCircuit, Loader2 } from 'lucide-react';
import { usePlayers, Player } from '../hooks/usePlayers';
import { motion, AnimatePresence, useDragControls } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { Modal } from '../components/ui/Modal';
import Markdown from 'react-markdown';

interface PlayerCardProps {
  player: Player | null;
  positionKey: string;
  isSelected: boolean;
  onSelect: (playerId: string | null, slotKey: string) => void;
  isFreeMode?: boolean;
  onDragEnd?: (id: string, x: number, y: number) => void;
  onRemove?: (id: string) => void;
  pitchRef?: React.RefObject<HTMLDivElement | null>;
  key?: any;
  tacticalObjectives: TacticalObjective[];
  formation?: string;
  onUpdateRole?: (playerId: string, roleId: string | null) => void;
}

// Tactical Role Colors based on the player's assigned role or position
const getTacticalColor = (p: Player | null, pos: string, tacticalObjectives: TacticalObjective[]) => {
  if (p?.tacticalRole) {
    const obj = tacticalObjectives.find(o => o.id === p.tacticalRole);
    if (obj) return obj.color;
  }
  
  // Fallback logic
  if (pos === 'GK') return 'bg-yellow-400'; // Inteligencia
  if (pos === 'CB1' || pos === 'CB2') return 'bg-cyan-400'; // Bloqueos
  if (pos === 'LB' || pos === 'RB' || pos === 'LM' || pos === 'RM') return 'bg-purple-500'; // No permitir centros
  if (pos === 'CDM' || pos === 'CM1' || pos === 'CM2') return 'bg-blue-500'; // Líneas de pase
  return 'bg-emerald-500'; // Presión / General
};

const FORMATION_POSITIONS: Record<string, Record<string, { x: number, y: number }>> = {
  '4-3-3': {
    'LW': { x: 20, y: 15 },
    'ST': { x: 50, y: 10 },
    'RW': { x: 80, y: 15 },
    'CM1': { x: 30, y: 40 },
    'CDM': { x: 50, y: 55 },
    'CM2': { x: 70, y: 40 },
    'LB': { x: 15, y: 75 },
    'CB1': { x: 38, y: 75 },
    'CB2': { x: 62, y: 75 },
    'RB': { x: 85, y: 75 },
    'GK': { x: 50, y: 92 },
  },
  '1-4-1-4-1': {
    'ST': { x: 50, y: 10 },
    'LM': { x: 15, y: 30 },
    'CM1': { x: 38, y: 30 },
    'CM2': { x: 62, y: 30 },
    'RM': { x: 85, y: 30 },
    'CDM': { x: 50, y: 50 },
    'LB': { x: 15, y: 75 },
    'CB1': { x: 38, y: 75 },
    'CB2': { x: 62, y: 75 },
    'RB': { x: 85, y: 75 },
    'GK': { x: 50, y: 92 },
  }
};

const getFormationPosition = (slot: string, formation: string) => {
  return FORMATION_POSITIONS[formation]?.[slot] || { x: 50, y: 50 };
};

function PlayerCard({ player, positionKey, isSelected, onSelect, isFreeMode, onDragEnd, onRemove, pitchRef, tacticalObjectives, formation, onUpdateRole }: PlayerCardProps) {
  const futCardClipPath = "polygon(0 15%, 10% 5%, 30% 8%, 50% 0, 70% 8%, 90% 5%, 100% 15%, 100% 85%, 50% 100%, 0 85%)";
  const dragControls = useDragControls();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  if (!player) {
    if (isFreeMode) return null;
    const tacticalColor = getTacticalColor(null, positionKey, tacticalObjectives);
    return (
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onSelect(null, positionKey);
        }}
        className={`relative w-16 h-24 sm:w-24 sm:h-36 md:w-32 md:h-48 flex items-center justify-center bg-white/5 backdrop-blur-md transition-all duration-300 ${
          isSelected ? 'bg-fuchsia-500/20 scale-105 shadow-[0_0_20px_rgba(217,70,239,0.3)]' : 'hover:bg-white/10'
        }`}
        style={{ clipPath: futCardClipPath, border: '1px dashed rgba(217,70,239,0.3)' }}
      >
        <div className="flex flex-col items-center gap-1 sm:gap-2">
          <div className={`w-6 h-6 sm:w-10 sm:h-10 rounded-full ${tacticalColor} opacity-20 blur-sm mb-1`} />
          <Shield className={`w-4 h-4 sm:w-8 sm:h-8 transition-colors ${isSelected ? 'text-fuchsia-500' : 'text-slate-700'}`} />
          <span className="text-[7px] sm:text-[10px] text-slate-500 font-bold uppercase tracking-widest">{positionKey}</span>
        </div>
      </button>
    );
  }

  const tacticalColor = getTacticalColor(player, positionKey, tacticalObjectives);

  const cardContent = (
    <div className="relative w-full h-full group">
      {isFreeMode && onRemove && player && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(player.id);
          }}
          className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 bg-red-600 text-white p-1 rounded-full shadow-lg z-[60] hover:bg-red-500 transition-colors"
          title="Quitar del campo"
        >
          <X size={10} />
        </button>
      )}
      {/* Tactical Role Indicator (Dot with Glow like in image) */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setShowRoleMenu(!showRoleMenu);
          }}
          className={`w-5 h-5 sm:w-8 sm:h-8 rounded-full ${tacticalColor} shadow-[0_0_15px_rgba(255,255,255,0.4)] border-2 border-white flex items-center justify-center hover:scale-110 transition-transform active:scale-95`}
        >
          <span className="text-[8px] sm:text-[12px] font-black text-slate-900">{player.number}</span>
        </button>
        <div className={`absolute inset-0 rounded-full ${tacticalColor} blur-md opacity-60 -z-10`} />

        {/* Role Selection Dropdown Menu */}
        <AnimatePresence>
          {showRoleMenu && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              className="absolute top-full mt-2 bg-slate-900 border border-slate-700 rounded-xl p-1.5 shadow-2xl z-[100] min-w-[140px]"
            >
              <div className="space-y-1">
                {tacticalObjectives.map(obj => (
                  <button
                    key={obj.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateRole?.(player.id, obj.id);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/10 transition-colors text-left ${player.tacticalRole === obj.id ? 'bg-white/5' : ''}`}
                  >
                    <div className={`w-2 h-2 rounded-full ${obj.color}`} />
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tight">{obj.label}</span>
                  </button>
                ))}
                <div className="h-px bg-slate-800 my-1" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateRole?.(player.id, null);
                    setShowRoleMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors text-left text-slate-500"
                >
                  <div className="w-2 h-2 rounded-full bg-slate-700" />
                  <span className="text-[10px] italic">Resetear</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Card Background & Border */}
      <div className={`absolute inset-0 bg-gradient-to-br ${isSelected ? 'from-fuchsia-400 via-purple-600 to-indigo-900' : 'from-fuchsia-600 via-purple-900 to-slate-950'}`} />
      
      {/* Inner Content Container */}
      <div className="absolute inset-[1px] sm:inset-[2px] bg-slate-950 overflow-hidden flex flex-col" style={{ clipPath: futCardClipPath }}>
        {/* Background Pattern (Neon Lines) */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(217,70,239,0.1)_10px,rgba(217,70,239,0.1)_11px)]" />
        </div>

        {/* Top Section: Number & Position */}
        <div className="relative z-10 pt-3 sm:pt-6 px-1.5 sm:px-3 flex flex-col items-start">
          <span className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-black text-white leading-none italic drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
            {player.number}
          </span>
          <span className="text-[7px] sm:text-[9px] md:text-[11px] font-black text-fuchsia-400 uppercase tracking-tighter">
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
        <div className="absolute top-2 sm:top-4 right-1 sm:right-2 w-[75%] h-3/5 flex items-end justify-center z-0">
          {player.photo ? (
            <img 
              src={player.photo} 
              alt={player.name}
              className="w-full h-full object-contain object-bottom drop-shadow-[0_10px_20px_rgba(0,0,0,0.9)] transition-transform duration-500 group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-800/50">
              <UserPlus className="w-6 h-6 sm:w-12 sm:h-12" strokeWidth={1} />
            </div>
          )}
        </div>

        {/* Name Plate */}
        <div className="relative z-10 mt-auto mb-8 sm:mb-14 bg-black/40 backdrop-blur-sm border-y border-fuchsia-500/30 py-0.5 sm:py-1">
          <h3 className="text-[7px] sm:text-[10px] md:text-[11px] lg:text-[12px] font-bold text-white uppercase tracking-tight text-center line-clamp-1 px-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            {player.name}
          </h3>
        </div>

        {/* Shine Effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
      </div>
    </div>
  );

  if (isFreeMode) {
    const defaultPos = getFormationPosition(player.lineupPosition || '', formation || '4-3-3');
    const pos = player.pitchPosition || defaultPos;

    return (
      <motion.div
        drag
        dragMomentum={false}
        dragConstraints={pitchRef}
        dragElastic={0}
        onDragEnd={(_, info) => {
          if (!onDragEnd || !pitchRef?.current) return;
          const rect = pitchRef.current.getBoundingClientRect();
          // Convert absolute screen point to percentage relative to pitch
          const x = ((info.point.x - rect.left) / rect.width) * 100;
          const y = ((info.point.y - rect.top) / rect.height) * 100;
          onDragEnd(player.id, x, y);
        }}
        onPointerDown={(e) => {
          e.stopPropagation();
          onSelect(player.id, positionKey);
        }}
        initial={false}
        animate={{
          left: `${pos.x}%`,
          top: `${pos.y}%`,
        }}
        className={`absolute w-16 h-24 sm:w-24 sm:h-36 md:w-28 md:h-40 lg:w-36 lg:h-52 transition-shadow duration-300 cursor-grab active:cursor-grabbing ${
          isSelected ? 'z-50 shadow-[0_0_40px_rgba(217,70,239,0.6)]' : 'z-40'
        }`}
        style={{ 
          clipPath: futCardClipPath,
          transform: 'translate(-50%, -50%)'
        }}
      >
        {cardContent}
      </motion.div>
    );
  }

  return (
    <button 
      onClick={(e) => {
        e.stopPropagation();
        onSelect(player.id, positionKey);
      }}
      className={`relative w-16 h-24 sm:w-24 sm:h-36 md:w-28 md:h-40 lg:w-36 lg:h-52 transition-all duration-300 group ${
        isSelected ? 'scale-110 z-40 shadow-[0_0_40px_rgba(217,70,239,0.6)]' : 'hover:scale-105 hover:shadow-[0_0_25px_rgba(217,70,239,0.3)]'
      }`}
      style={{ clipPath: futCardClipPath }}
    >
      {cardContent}
    </button>
  );
}

interface TacticalObjective {
  id: string;
  label: string;
  description: string;
  color: string;
}

const defaultTacticalObjectives: TacticalObjective[] = [
  { id: 'passing', label: 'Líneas de Pase', description: 'Tapar línea de pase, sombras defensivas.', color: 'bg-blue-500' },
  { id: 'pressing', label: 'Presión Alta', description: 'Presiones constantes, morder al rival.', color: 'bg-red-500' },
  { id: 'intelligence', label: 'Inteligencia', description: 'Lectura de juego y posicionamiento inteligente.', color: 'bg-yellow-500' },
  { id: 'duels', label: 'Duelos 1v1', description: 'No permitir centros. Bien parados ante duelos 1v1, perfilados.', color: 'bg-purple-500' },
  { id: 'blocks', label: 'Bloqueos', description: 'Bloqueos efectivos, más que entradas arriesgadas.', color: 'bg-cyan-500' },
];

export function Lineup() {
  const { players, swapPlayers, moveToEmptySlot, updatePlayerPosition, updateTacticalRole, clearAllPitchPositions } = usePlayers();
  const [selectedPlayer, setSelectedPlayer] = useState<{ id: string | null, slot: string } | null>(null);
  const [formation, setFormation] = useState<'4-3-3' | '1-4-1-4-1'>(() => {
    const saved = localStorage.getItem('dz_formation');
    return (saved as '4-3-3' | '1-4-1-4-1') || '4-3-3';
  });
  const [isFreeMode, setIsFreeMode] = useState(false);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [tacticalObjectives, setTacticalObjectives] = useState<TacticalObjective[]>(() => {
    const saved = localStorage.getItem('dz_tactical_objectives');
    return saved ? JSON.parse(saved) : defaultTacticalObjectives;
  });
  const [editingObjective, setEditingObjective] = useState<TacticalObjective | null>(null);
  const [lines, setLines] = useState<{ points: { x: number, y: number }[], color: string }[]>(() => {
    const saved = localStorage.getItem('dz_pitch_lines');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentLine, setCurrentLine] = useState<{ x: number, y: number }[] | null>(null);
  const [selectedColor, setSelectedColor] = useState('#f43f5e'); // Default red
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const pitchRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const lineupPlayers = players.reduce((acc, p) => {
    if (p.lineupPosition) acc[p.lineupPosition] = p;
    return acc;
  }, {} as Record<string, Player>);

  useEffect(() => {
    localStorage.setItem('dz_tactical_objectives', JSON.stringify(tacticalObjectives));
  }, [tacticalObjectives]);

  const updateObjective = (id: string, data: Partial<TacticalObjective>) => {
    setTacticalObjectives(prev => prev.map(obj => obj.id === id ? { ...obj, ...data } : obj));
    setEditingObjective(null);
  };

  useEffect(() => {
    localStorage.setItem('dz_pitch_lines', JSON.stringify(lines));
    drawLines();
  }, [lines, currentLine]);

  const drawLines = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 3;

    lines.forEach(line => {
      if (line.points.length < 2) return;
      ctx.beginPath();
      ctx.strokeStyle = line.color;
      ctx.moveTo(line.points[0].x, line.points[0].y);
      for (let i = 1; i < line.points.length; i++) {
        ctx.lineTo(line.points[i].x, line.points[i].y);
      }
      ctx.stroke();
    });

    if (currentLine && currentLine.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = selectedColor;
      ctx.moveTo(currentLine[0].x, currentLine[0].y);
      for (let i = 1; i < currentLine.length; i++) {
        ctx.lineTo(currentLine[i].x, currentLine[i].y);
      }
      ctx.stroke();
    }
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawingMode || !pitchRef.current) return;
    const rect = pitchRef.current.getBoundingClientRect();
    const cssX = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
    const cssY = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top;
    
    // Scale to canvas internal resolution (1200x900)
    const x = (cssX / rect.width) * 1200;
    const y = (cssY / rect.height) * 900;
    
    setCurrentLine([{ x, y }]);
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawingMode || !currentLine || !pitchRef.current) return;
    const rect = pitchRef.current.getBoundingClientRect();
    const cssX = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
    const cssY = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top;
    
    // Scale to canvas internal resolution (1200x900)
    const x = (cssX / rect.width) * 1200;
    const y = (cssY / rect.height) * 900;
    
    setCurrentLine([...currentLine, { x, y }]);
  };

  const handleMouseUp = () => {
    if (!isDrawingMode || !currentLine) return;
    setLines([...lines, { points: currentLine, color: selectedColor }]);
    setCurrentLine(null);
  };

  const clearLines = () => {
    setLines([]);
  };

  const generateAIReport = async () => {
    setIsAnalyzing(true);
    setIsAIModalOpen(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const lineup = Object.values(lineupPlayers).filter(Boolean).map(p => ({
        name: p!.name,
        position: p!.position,
        number: p!.number,
        stats: p!.stats,
        avgRating: p!.gameHistory?.length ? (p!.gameHistory.reduce((acc, g) => acc + g.rating, 0) / p!.gameHistory.length).toFixed(1) : 'N/A'
      }));

      const prompt = `Eres un analista táctico de fútbol profesional de élite. 
      Analiza la siguiente alineación del equipo "Deportivo Z" (Formación: ${formation}) y proporciona un reporte estratégico detallado. 
      Incluye:
      1. Fortalezas de este 11 inicial.
      2. Debilidades tácticas o riesgos.
      3. Recomendaciones específicas para mejorar el rendimiento.
      4. Un jugador clave para el próximo partido.

      Alineación: ${JSON.stringify(lineup)}
      
      Responde en formato Markdown elegante, usando emojis y un tono profesional pero motivador.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ parts: [{ text: prompt }] }],
      });

      setAiReport(response.text || "No se pudo generar el reporte.");
    } catch (error) {
      console.error("AI Error:", error);
      setAiReport("Error al conectar con el asistente táctico. Por favor, intenta de nuevo.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDragEnd = (id: string, x: number, y: number) => {
    // Snapping logic: find the nearest valid position in the current formation
    const currentFormationPositions = FORMATION_POSITIONS[formation] || {};
    let nearestPos = { x, y };
    let minDistance = Infinity;
    const SNAP_THRESHOLD = 15; // Percentage distance threshold for snapping

    Object.values(currentFormationPositions).forEach(pos => {
      const distance = Math.sqrt(Math.pow(pos.x - x, 2) + Math.pow(pos.y - y, 2));
      if (distance < minDistance) {
        minDistance = distance;
        nearestPos = pos;
      }
    });

    // Only snap if we are close enough to a valid position
    if (minDistance < SNAP_THRESHOLD) {
      updatePlayerPosition(id, nearestPos);
    } else {
      updatePlayerPosition(id, { x, y });
    }
  };

  const handlePitchClick = (e: React.MouseEvent) => {
    if (!isFreeMode || !selectedPlayer?.id || !pitchRef.current) return;
    
    const rect = pitchRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    updatePlayerPosition(selectedPlayer.id, { x, y });
    setSelectedPlayer(null);
  };

  const fillFromFormation = () => {
    players.forEach(p => {
      if (p.lineupPosition) {
        const pos = getFormationPosition(p.lineupPosition, formation);
        updatePlayerPosition(p.id, pos);
      }
    });
  };

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
      // Move player from bench/other slot to this empty slot
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

        <div className="flex flex-wrap gap-2 bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800">
          <button 
            onClick={() => { setFormation('4-3-3'); setIsFreeMode(false); }}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              formation === '4-3-3' && !isFreeMode
                ? 'bg-fuchsia-600 text-white shadow-lg shadow-fuchsia-600/20' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            4-3-3
          </button>
          <button 
            onClick={() => { setFormation('1-4-1-4-1'); setIsFreeMode(false); }}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              formation === '1-4-1-4-1' && !isFreeMode
                ? 'bg-fuchsia-600 text-white shadow-lg shadow-fuchsia-600/20' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            1-4-1-4-1
          </button>
          <div className="w-px h-8 bg-slate-800 mx-1" />
          <button 
            onClick={() => setIsFreeMode(!isFreeMode)}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
              isFreeMode 
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <MousePointer2 size={14} />
            Libre
          </button>
          <button 
            onClick={() => setIsDrawingMode(!isDrawingMode)}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
              isDrawingMode 
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Pencil size={14} />
            Dibujar
          </button>
          
          {isDrawingMode && (
            <div className="flex items-center gap-1 px-2">
              {['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#ffffff'].map(color => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${
                    selectedColor === color ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          )}

          {lines.length > 0 && (
            <button 
              onClick={clearLines}
              className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-red-400 hover:bg-red-500/10 transition-all flex items-center gap-2"
            >
              <Trash2 size={14} />
              Líneas
            </button>
          )}
          <button 
            onClick={generateAIReport}
            className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 hover:scale-105 active:scale-95"
          >
            <Sparkles size={14} />
            Analizar IA
          </button>
          {isFreeMode && (
            <>
              <button 
                onClick={fillFromFormation}
                className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-emerald-400 hover:bg-emerald-500/10 transition-all flex items-center gap-2"
              >
                <ArrowLeftRight size={14} />
                Llenar
              </button>
              <button 
                onClick={clearAllPitchPositions}
                className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-red-400 hover:bg-red-500/10 transition-all flex items-center gap-2"
              >
                <Trash2 size={14} />
                Limpiar
              </button>
            </>
          )}
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

      {/* Pitch & Tactical Legend */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Pitch Container */}
        <div 
          ref={pitchRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
          onClick={handlePitchClick}
          className={`xl:col-span-3 relative bg-[#5d6344] border-4 border-[#3a4129] rounded-[40px] overflow-hidden p-4 sm:p-8 flex items-center justify-center min-h-[500px] sm:min-h-[700px] md:min-h-[800px] xl:min-h-[850px] shadow-2xl ${
            isDrawingMode ? 'cursor-crosshair' : isFreeMode ? 'cursor-cell' : ''
          }`}
        >
          {/* Drawing Canvas */}
          <canvas 
            ref={canvasRef}
            width={1200}
            height={900}
            className="absolute inset-0 w-full h-full pointer-events-none z-20"
          />

          {/* Tactical Zones (Exact match to image grid) */}
          {!isFreeMode && (
            <div className="absolute inset-0 pointer-events-none flex flex-col">
              {/* Vertical Corridors (Lateral Zones - Purple tint for 1v1/Centros) */}
              <div className="absolute inset-0 flex">
                <div className="w-[20%] h-full bg-purple-900/30 border-r-2 border-purple-500/30 relative">
                  {/* Purple Overlay for wings */}
                  <div className="absolute inset-0 bg-purple-600/10" />
                </div>
                <div className="flex-1 h-full relative">
                  {/* Center Corridor Grid */}
                  <div className="absolute inset-0 flex flex-col">
                    {/* Row 1: Opponent Box Area - Cyan */}
                    <div className="h-[20%] bg-cyan-400/40 border-b border-cyan-400/60 shadow-[inset_0_0_80px_rgba(34,211,238,0.3)]" />
                    {/* Row 2: Mid-High */}
                    <div className="h-[20%] border-b border-white/10" />
                    {/* Row 3: Midfield */}
                    <div className="h-[20%] border-b border-white/10" />
                    {/* Row 4: Defensive Transition - Lime */}
                    <div className="h-[20%] bg-[#a3e635]/50 border-y border-[#a3e635]/70 shadow-[inset_0_0_80px_rgba(163,230,53,0.3)]" />
                    {/* Row 5: Own Box Area - Cyan */}
                    <div className="h-[20%] bg-cyan-400/40 border-t border-cyan-400/60 shadow-[inset_0_0_80px_rgba(34,211,238,0.3)]" />
                  </div>
                  
                  {/* Red Tactical Boundary (Central Corridor) */}
                  <div className="absolute inset-0 border-x-4 border-red-500/50" />
                </div>
                <div className="w-[20%] h-full bg-purple-900/30 border-l-2 border-purple-500/30 relative">
                  {/* Purple Overlay for wings */}
                  <div className="absolute inset-0 bg-purple-600/10" />
                </div>
              </div>

              {/* Tactical Overlays (Soft Glows) */}
              <div className="absolute inset-0">
                {/* Intelligence Glow (Center) */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-400/25 rounded-full blur-[120px]" />
                {/* Defensive Block Glow (Bottom) */}
                <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 w-[80%] h-48 bg-cyan-400/20 rounded-full blur-[100px]" />
                {/* High Press Glow (Top) */}
                <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[80%] h-48 bg-red-500/15 rounded-full blur-[100px]" />
                {/* Lateral Zones Glow (Purple) */}
                <div className="absolute inset-y-0 left-0 w-[20%] bg-purple-500/5 blur-[40px]" />
                <div className="absolute inset-y-0 right-0 w-[20%] bg-purple-500/5 blur-[40px]" />
              </div>
            </div>
          )}

          {/* Pitch Lines (Crisp White) */}
          <div className="absolute inset-4 sm:inset-8 border-2 border-white/60 rounded-lg pointer-events-none">
            {/* Halfway Line */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-white/60" />
            {/* Center Circle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-white/60 rounded-full" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white/80 rounded-full" />
            
            {/* Penalty Areas */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[18%] border-2 border-t-0 border-white/60" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[30%] h-[7%] border-2 border-t-0 border-white/60" />
            
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60%] h-[18%] border-2 border-b-0 border-white/60" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[30%] h-[7%] border-2 border-b-0 border-white/60" />
            
            {/* Penalty Arcs */}
            <div className="absolute top-[18%] left-1/2 -translate-x-1/2 w-32 h-16 border-2 border-t-0 border-white/60 rounded-b-full" />
            <div className="absolute bottom-[18%] left-1/2 -translate-x-1/2 w-32 h-16 border-2 border-b-0 border-white/60 rounded-t-full" />
          </div>

          {/* Formation Grid */}
          <div className="relative w-full max-w-4xl h-full flex flex-col justify-between py-4 sm:py-8 z-10 gap-6 sm:gap-12">
            {!isFreeMode ? (
              <>
                {formation === '4-3-3' ? (
                  <>
                    {/* Attackers */}
                    <div className="flex justify-center gap-2 sm:gap-12 md:gap-24">
                      <PlayerCard 
                        positionKey="LW" 
                        player={lineupPlayers['LW']} 
                        isSelected={selectedPlayer?.slot === 'LW'} 
                        onSelect={handleSelect} 
                        tacticalObjectives={tacticalObjectives}
                        formation={formation}
                        onUpdateRole={updateTacticalRole}
                      />
                      <PlayerCard 
                        positionKey="ST" 
                        player={lineupPlayers['ST']} 
                        isSelected={selectedPlayer?.slot === 'ST'} 
                        onSelect={handleSelect} 
                        tacticalObjectives={tacticalObjectives}
                        formation={formation}
                        onUpdateRole={updateTacticalRole}
                      />
                      <PlayerCard 
                        positionKey="RW" 
                        player={lineupPlayers['RW']} 
                        isSelected={selectedPlayer?.slot === 'RW'} 
                        onSelect={handleSelect} 
                        tacticalObjectives={tacticalObjectives}
                        formation={formation}
                        onUpdateRole={updateTacticalRole}
                      />
                    </div>

                    {/* Midfielders */}
                    <div className="flex justify-center gap-2 sm:gap-12 md:gap-20">
                      <PlayerCard 
                        positionKey="CM1" 
                        player={lineupPlayers['CM1']} 
                        isSelected={selectedPlayer?.slot === 'CM1'} 
                        onSelect={handleSelect} 
                        tacticalObjectives={tacticalObjectives}
                        formation={formation}
                        onUpdateRole={updateTacticalRole}
                      />
                      <div className="translate-y-4 sm:translate-y-8">
                        <PlayerCard 
                          positionKey="CDM" 
                          player={lineupPlayers['CDM']} 
                          isSelected={selectedPlayer?.slot === 'CDM'} 
                          onSelect={handleSelect} 
                          tacticalObjectives={tacticalObjectives}
                          formation={formation}
                          onUpdateRole={updateTacticalRole}
                        />
                      </div>
                      <PlayerCard 
                        positionKey="CM2" 
                        player={lineupPlayers['CM2']} 
                        isSelected={selectedPlayer?.slot === 'CM2'} 
                        onSelect={handleSelect} 
                        tacticalObjectives={tacticalObjectives}
                        formation={formation}
                        onUpdateRole={updateTacticalRole}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    {/* Attacker (1) */}
                    <div className="flex justify-center">
                      <PlayerCard 
                        positionKey="ST" 
                        player={lineupPlayers['ST']} 
                        isSelected={selectedPlayer?.slot === 'ST'} 
                        onSelect={handleSelect} 
                        tacticalObjectives={tacticalObjectives}
                        formation={formation}
                        onUpdateRole={updateTacticalRole}
                      />
                    </div>

                    {/* Midfielders (4) */}
                    <div className="flex justify-center gap-1 sm:gap-6 md:gap-10">
                      <PlayerCard 
                        positionKey="LM" 
                        player={lineupPlayers['LM']} 
                        isSelected={selectedPlayer?.slot === 'LM'} 
                        onSelect={handleSelect} 
                        tacticalObjectives={tacticalObjectives}
                        formation={formation}
                        onUpdateRole={updateTacticalRole}
                      />
                      <PlayerCard 
                        positionKey="CM1" 
                        player={lineupPlayers['CM1']} 
                        isSelected={selectedPlayer?.slot === 'CM1'} 
                        onSelect={handleSelect} 
                        tacticalObjectives={tacticalObjectives}
                        formation={formation}
                        onUpdateRole={updateTacticalRole}
                      />
                      <PlayerCard 
                        positionKey="CM2" 
                        player={lineupPlayers['CM2']} 
                        isSelected={selectedPlayer?.slot === 'CM2'} 
                        onSelect={handleSelect} 
                        tacticalObjectives={tacticalObjectives}
                        formation={formation}
                        onUpdateRole={updateTacticalRole}
                      />
                      <PlayerCard 
                        positionKey="RM" 
                        player={lineupPlayers['RM']} 
                        isSelected={selectedPlayer?.slot === 'RM'} 
                        onSelect={handleSelect} 
                        tacticalObjectives={tacticalObjectives}
                        formation={formation}
                        onUpdateRole={updateTacticalRole}
                      />
                    </div>

                    {/* Defensive Mid (1) */}
                    <div className="flex justify-center">
                      <PlayerCard 
                        positionKey="CDM" 
                        player={lineupPlayers['CDM']} 
                        isSelected={selectedPlayer?.slot === 'CDM'} 
                        onSelect={handleSelect} 
                        tacticalObjectives={tacticalObjectives}
                        formation={formation}
                        onUpdateRole={updateTacticalRole}
                      />
                    </div>
                  </>
                )}

                {/* Defenders (Shared by both) */}
                <div className="flex justify-center gap-2 sm:gap-8 md:gap-16">
                  <PlayerCard 
                    positionKey="LB" 
                    player={lineupPlayers['LB']} 
                    isSelected={selectedPlayer?.slot === 'LB'} 
                    onSelect={handleSelect} 
                    tacticalObjectives={tacticalObjectives}
                    formation={formation}
                    onUpdateRole={updateTacticalRole}
                  />
                  <PlayerCard 
                    positionKey="CB1" 
                    player={lineupPlayers['CB1']} 
                    isSelected={selectedPlayer?.slot === 'CB1'} 
                    onSelect={handleSelect} 
                    tacticalObjectives={tacticalObjectives}
                    formation={formation}
                    onUpdateRole={updateTacticalRole}
                  />
                  <PlayerCard 
                    positionKey="CB2" 
                    player={lineupPlayers['CB2']} 
                    isSelected={selectedPlayer?.slot === 'CB2'} 
                    onSelect={handleSelect} 
                    tacticalObjectives={tacticalObjectives}
                    formation={formation}
                    onUpdateRole={updateTacticalRole}
                  />
                  <PlayerCard 
                    positionKey="RB" 
                    player={lineupPlayers['RB']} 
                    isSelected={selectedPlayer?.slot === 'RB'} 
                    onSelect={handleSelect} 
                    tacticalObjectives={tacticalObjectives}
                    formation={formation}
                    onUpdateRole={updateTacticalRole}
                  />
                </div>

                {/* Goalkeeper (Shared by both) */}
                <div className="flex justify-center">
                  <PlayerCard 
                    positionKey="GK" 
                    player={lineupPlayers['GK']} 
                    isSelected={selectedPlayer?.slot === 'GK'} 
                    onSelect={handleSelect} 
                    tacticalObjectives={tacticalObjectives}
                    formation={formation}
                    onUpdateRole={updateTacticalRole}
                  />
                </div>
              </>
            ) : (
              /* Free Mode Rendering */
              <div className="absolute inset-0">
                {players.filter(p => p.lineupPosition || p.pitchPosition).map(player => (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    positionKey={player.lineupPosition || ''}
                    isSelected={selectedPlayer?.id === player.id}
                    onSelect={(id) => handleSelect(id, 'free')}
                    isFreeMode={true}
                    onDragEnd={handleDragEnd}
                    onRemove={(id) => updatePlayerPosition(id, null)}
                    pitchRef={pitchRef}
                    tacticalObjectives={tacticalObjectives}
                    formation={formation}
                    onUpdateRole={updateTacticalRole}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tactical Legend (Based on Image) */}
        <div className="space-y-6">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
              <div className="w-1 h-4 bg-red-600 rounded-full" />
              Objetivos Tácticos
            </h3>
            
            <div className="space-y-6">
              {tacticalObjectives.map(obj => (
                <div key={obj.id} className="flex items-start gap-4 group cursor-pointer" onClick={() => setEditingObjective(obj)}>
                  <div className={`w-4 h-4 rounded-full ${obj.color} shadow-[0_0_10px_rgba(255,255,255,0.2)] mt-1 flex-shrink-0`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-black text-slate-300 uppercase tracking-tight">{obj.label}</p>
                      <Pencil size={10} className="text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">{obj.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900/30 border border-slate-800/50 rounded-2xl p-4">
            <p className="text-[10px] text-slate-500 italic leading-relaxed">
              * El campo está dividido en zonas tácticas para optimizar el rendimiento defensivo y ofensivo según el plan de juego.
            </p>
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
                tacticalObjectives={tacticalObjectives}
                formation={formation}
                onUpdateRole={updateTacticalRole}
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
      {/* Objective Edit Modal */}
      <AnimatePresence>
        {editingObjective && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-8 w-full max-w-md shadow-2xl"
            >
              <h3 className="text-xl font-bold text-white mb-6">Editar Objetivo Táctico</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Título</label>
                  <input 
                    type="text" 
                    value={editingObjective.label}
                    onChange={(e) => setEditingObjective({ ...editingObjective, label: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-fuchsia-500 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Descripción</label>
                  <textarea 
                    value={editingObjective.description}
                    onChange={(e) => setEditingObjective({ ...editingObjective, description: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-fuchsia-500 outline-none transition-colors h-24 resize-none"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button 
                    onClick={() => setEditingObjective(null)}
                    className="px-6 py-2 rounded-xl text-sm font-bold text-slate-400 hover:bg-white/5 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={() => updateObjective(editingObjective.id, editingObjective)}
                    className="px-6 py-2 rounded-xl text-sm font-bold bg-fuchsia-600 text-white shadow-lg shadow-fuchsia-600/20"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <Modal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        title="Asistente Táctico IA"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-6">
          {isAnalyzing ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                <BrainCircuit size={64} className="text-fuchsia-500 animate-pulse" />
                <Loader2 size={32} className="text-indigo-500 animate-spin absolute -bottom-2 -right-2" />
              </div>
              <div className="text-center">
                <p className="text-white font-bold text-lg">Analizando alineación...</p>
                <p className="text-slate-500 text-sm">Procesando estadísticas y roles tácticos</p>
              </div>
            </div>
          ) : (
            <div className="prose prose-invert max-w-none">
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 custom-scrollbar max-h-[60vh] overflow-y-auto">
                <div className="markdown-body">
                  <Markdown>{aiReport || ''}</Markdown>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setIsAIModalOpen(false)}
                  className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors"
                >
                  Cerrar Reporte
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
