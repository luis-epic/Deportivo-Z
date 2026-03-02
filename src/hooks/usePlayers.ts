import { useState, useEffect } from 'react';

export interface GameStat {
  id: string;
  date: string;
  opponent: string;
  gol: number;
  asi: number;
  pas: number;
  rating: number;
}

export interface PlayerStats {
  pas: number;
  gol: number;
  asi: number;
}

export interface Player {
  id: string;
  name: string;
  position: string;
  number: number;
  status: string;
  photo: string | null;
  stats: PlayerStats;
  lineupPosition: string | null;
  gameHistory: GameStat[];
}

const defaultPlayersList: Player[] = [
  { id: '1', name: 'Martínez', position: 'DEL', number: 9, status: 'Activo', photo: 'https://picsum.photos/seed/st/150/150', stats: { pas: 75, gol: 12, asi: 4 }, lineupPosition: 'ST', gameHistory: [] },
  { id: '2', name: 'García', position: 'DEL', number: 11, status: 'Activo', photo: 'https://picsum.photos/seed/lw/150/150', stats: { pas: 82, gol: 5, asi: 8 }, lineupPosition: 'LW', gameHistory: [] },
  { id: '3', name: 'López', position: 'DEL', number: 7, status: 'Activo', photo: 'https://picsum.photos/seed/rw/150/150', stats: { pas: 80, gol: 7, asi: 6 }, lineupPosition: 'RW', gameHistory: [] },
  { id: '4', name: 'Pérez', position: 'MED', number: 8, status: 'Activo', photo: 'https://picsum.photos/seed/cm1/150/150', stats: { pas: 88, gol: 2, asi: 10 }, lineupPosition: 'CM1', gameHistory: [] },
  { id: '5', name: 'Rodríguez', position: 'MED', number: 10, status: 'Activo', photo: 'https://picsum.photos/seed/cm2/150/150', stats: { pas: 85, gol: 4, asi: 7 }, lineupPosition: 'CM2', gameHistory: [] },
  { id: '6', name: 'Silva', position: 'MED', number: 5, status: 'Activo', photo: 'https://picsum.photos/seed/cdm/150/150', stats: { pas: 89, gol: 1, asi: 3 }, lineupPosition: 'CDM', gameHistory: [] },
  { id: '7', name: 'Fernández', position: 'DEF', number: 3, status: 'Activo', photo: 'https://picsum.photos/seed/lb/150/150', stats: { pas: 78, gol: 0, asi: 5 }, lineupPosition: 'LB', gameHistory: [] },
  { id: '8', name: 'Gómez', position: 'DEF', number: 2, status: 'Activo', photo: 'https://picsum.photos/seed/rb/150/150', stats: { pas: 76, gol: 1, asi: 4 }, lineupPosition: 'RB', gameHistory: [] },
  { id: '9', name: 'Díaz', position: 'DEF', number: 4, status: 'Activo', photo: 'https://picsum.photos/seed/cb1/150/150', stats: { pas: 70, gol: 2, asi: 0 }, lineupPosition: 'CB1', gameHistory: [] },
  { id: '10', name: 'Torres', position: 'DEF', number: 6, status: 'Activo', photo: 'https://picsum.photos/seed/cb2/150/150', stats: { pas: 72, gol: 3, asi: 1 }, lineupPosition: 'CB2', gameHistory: [] },
  { id: '11', name: 'Ruiz', position: 'POR', number: 1, status: 'Activo', photo: 'https://picsum.photos/seed/gk/150/150', stats: { pas: 65, gol: 0, asi: 0 }, lineupPosition: 'GK', gameHistory: [] },
  // Suplentes
  { id: '12', name: 'Navarro', position: 'DEL', number: 19, status: 'Activo', photo: 'https://picsum.photos/seed/bench1/150/150', stats: { pas: 70, gol: 8, asi: 2 }, lineupPosition: null, gameHistory: [] },
  { id: '13', name: 'Castro', position: 'MED', number: 14, status: 'Activo', photo: 'https://picsum.photos/seed/bench2/150/150', stats: { pas: 75, gol: 1, asi: 5 }, lineupPosition: null, gameHistory: [] },
  { id: '14', name: 'Ortiz', position: 'DEF', number: 15, status: 'Activo', photo: 'https://picsum.photos/seed/bench3/150/150', stats: { pas: 68, gol: 0, asi: 1 }, lineupPosition: null, gameHistory: [] },
  { id: '15', name: 'Ramos', position: 'POR', number: 13, status: 'Activo', photo: 'https://picsum.photos/seed/bench4/150/150', stats: { pas: 60, gol: 0, asi: 0 }, lineupPosition: null, gameHistory: [] },
];

export function usePlayers() {
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('dz_players_v2');
    if (saved) {
      setPlayers(JSON.parse(saved));
    } else {
      setPlayers(defaultPlayersList);
    }
  }, []);

  const save = (newPlayers: Player[]) => {
    setPlayers(newPlayers);
    localStorage.setItem('dz_players_v2', JSON.stringify(newPlayers));
  };

  const addPlayer = (data: Omit<Player, 'id' | 'stats' | 'lineupPosition' | 'gameHistory'>) => {
    const newPlayer: Player = {
      ...data,
      id: Date.now().toString(),
      stats: { pas: 70, gol: 0, asi: 0 }, // Estadísticas por defecto
      lineupPosition: null,
      gameHistory: []
    };
    save([...players, newPlayer]);
  };

  const updatePlayer = (id: string, data: Omit<Player, 'id' | 'stats' | 'lineupPosition' | 'gameHistory'>) => {
    save(players.map(p => p.id === id ? { ...p, ...data } : p));
  };

  const deletePlayer = (id: string) => {
    save(players.filter(p => p.id !== id));
  };

  const swapPlayers = (id1: string, id2: string) => {
    const newPlayers = [...players];
    const idx1 = newPlayers.findIndex(p => p.id === id1);
    const idx2 = newPlayers.findIndex(p => p.id === id2);
    if (idx1 === -1 || idx2 === -1) return;

    const temp = newPlayers[idx1].lineupPosition;
    newPlayers[idx1] = { ...newPlayers[idx1], lineupPosition: newPlayers[idx2].lineupPosition };
    newPlayers[idx2] = { ...newPlayers[idx2], lineupPosition: temp };
    save(newPlayers);
  };

  const moveToEmptySlot = (playerId: string, slotKey: string) => {
    const newPlayers = [...players];
    const idx = newPlayers.findIndex(p => p.id === playerId);
    if (idx === -1) return;
    newPlayers[idx] = { ...newPlayers[idx], lineupPosition: slotKey };
    save(newPlayers);
  };

  const addGameStat = (playerId: string, gameStat: Omit<GameStat, 'id'>) => {
    const newPlayers = players.map(p => {
      if (p.id === playerId) {
        const newGameStat = { ...gameStat, id: Date.now().toString() };
        const updatedHistory = [newGameStat, ...(p.gameHistory || [])];
        
        // Update total stats based on history
        const totalGol = updatedHistory.reduce((acc, curr) => acc + curr.gol, 0);
        const totalAsi = updatedHistory.reduce((acc, curr) => acc + curr.asi, 0);
        const totalPas = updatedHistory.length > 0 
          ? Math.round(updatedHistory.reduce((acc, curr) => acc + curr.pas, 0) / updatedHistory.length)
          : p.stats.pas;

        return {
          ...p,
          gameHistory: updatedHistory,
          stats: {
            ...p.stats,
            gol: totalGol,
            asi: totalAsi,
            pas: totalPas
          }
        };
      }
      return p;
    });
    save(newPlayers);
  };

  return { players, addPlayer, updatePlayer, deletePlayer, swapPlayers, moveToEmptySlot, addGameStat };
}
