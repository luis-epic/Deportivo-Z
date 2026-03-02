import { useState, useEffect } from 'react';

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
  photo: string;
  stats: PlayerStats;
}

const defaultPlayers: Record<string, Player> = {
  'ST': { id: '1', name: 'Martínez', position: 'DEL', number: 9, photo: 'https://picsum.photos/seed/st/150/150', stats: { pas: 75, gol: 12, asi: 4 } },
  'LW': { id: '2', name: 'García', position: 'EXT', number: 11, photo: 'https://picsum.photos/seed/lw/150/150', stats: { pas: 82, gol: 5, asi: 8 } },
  'RW': { id: '3', name: 'López', position: 'EXT', number: 7, photo: 'https://picsum.photos/seed/rw/150/150', stats: { pas: 80, gol: 7, asi: 6 } },
  'CM1': { id: '4', name: 'Pérez', position: 'MED', number: 8, photo: 'https://picsum.photos/seed/cm1/150/150', stats: { pas: 88, gol: 2, asi: 10 } },
  'CM2': { id: '5', name: 'Rodríguez', position: 'MED', number: 10, photo: 'https://picsum.photos/seed/cm2/150/150', stats: { pas: 85, gol: 4, asi: 7 } },
  'CDM': { id: '6', name: 'Silva', position: 'MCD', number: 5, photo: 'https://picsum.photos/seed/cdm/150/150', stats: { pas: 89, gol: 1, asi: 3 } },
  'LB': { id: '7', name: 'Fernández', position: 'LAT', number: 3, photo: 'https://picsum.photos/seed/lb/150/150', stats: { pas: 78, gol: 0, asi: 5 } },
  'RB': { id: '8', name: 'Gómez', position: 'LAT', number: 2, photo: 'https://picsum.photos/seed/rb/150/150', stats: { pas: 76, gol: 1, asi: 4 } },
  'CB1': { id: '9', name: 'Díaz', position: 'DEF', number: 4, photo: 'https://picsum.photos/seed/cb1/150/150', stats: { pas: 70, gol: 2, asi: 0 } },
  'CB2': { id: '10', name: 'Torres', position: 'DEF', number: 6, photo: 'https://picsum.photos/seed/cb2/150/150', stats: { pas: 72, gol: 3, asi: 1 } },
  'GK': { id: '11', name: 'Ruiz', position: 'POR', number: 1, photo: 'https://picsum.photos/seed/gk/150/150', stats: { pas: 65, gol: 0, asi: 0 } },
};

export function useLineup() {
  const [players, setPlayers] = useState<Record<string, Player>>(defaultPlayers);

  useEffect(() => {
    const saved = localStorage.getItem('deportivo_z_lineup');
    if (saved) {
      setPlayers(JSON.parse(saved));
    }
  }, []);

  const updatePlayerPhoto = (positionKey: string, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setPlayers(prev => {
        const updated = {
          ...prev,
          [positionKey]: { ...prev[positionKey], photo: base64String }
        };
        localStorage.setItem('deportivo_z_lineup', JSON.stringify(updated));
        return updated;
      });
    };
    reader.readAsDataURL(file);
  };

  return { players, updatePlayerPhoto };
}
